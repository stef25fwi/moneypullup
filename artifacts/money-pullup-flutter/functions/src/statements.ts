import { onCall, HttpsError, type CallableRequest } from "firebase-functions/v2/https";
import * as admin from "firebase-admin";
import PDFDocument from "pdfkit";

const db = () => admin.firestore();

// Platform fee assumption used for the certified statement (kept in sync with
// the tip commission model). Brut = sum of captured tips; frais = fee share.
const FEE_RATE = 0.09;

function requireUid(req: CallableRequest): string {
  const uid = req.auth?.uid;
  if (!uid) throw new HttpsError("unauthenticated", "Sign in required.");
  return uid;
}

function str(value: unknown): string {
  return typeof value === "string" ? value : "";
}

function parseDate(value: unknown, fallback: Date): Date {
  const d = new Date(str(value));
  return Number.isNaN(d.getTime()) ? fallback : d;
}

function fmtDate(d: Date): string {
  return d.toLocaleDateString("fr-FR", { day: "2-digit", month: "2-digit", year: "numeric" });
}

interface StatementTip {
  id: string;
  date: Date;
  amountCents: number;
  counterparty: string;
}

function csvEscape(value: string): string {
  return /[",\n]/.test(value) ? `"${value.replace(/"/g, '""')}"` : value;
}

function buildCsv(tips: StatementTip[], counterpartyLabel: string): string {
  const header = `Date,ID,${counterpartyLabel},Montant EUR,Statut`;
  const rows = tips.map((t) =>
    [
      fmtDate(t.date),
      `TIP-${t.id.slice(0, 4).toUpperCase()}`,
      csvEscape(t.counterparty),
      (t.amountCents / 100).toFixed(2),
      "Versé",
    ].join(","),
  );
  return [header, ...rows].join("\n");
}

function buildPdf(opts: {
  title: string;
  subjectLabel: string;
  subjectName: string;
  counterpartyLabel: string;
  documentNumber: string;
  from: Date;
  to: Date;
  tips: StatementTip[];
  brutCents: number;
  fraisCents: number;
  netCents: number;
}): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ size: "A4", margin: 50 });
    const chunks: Buffer[] = [];
    doc.on("data", (c) => chunks.push(c as Buffer));
    doc.on("end", () => resolve(Buffer.concat(chunks)));
    doc.on("error", reject);

    const eur = (cents: number) => `${(cents / 100).toFixed(2)} €`;

    // Header
    doc.fontSize(20).fillColor("#1a0040").text(opts.title, { align: "left" });
    doc.moveDown(0.3);
    doc.fontSize(10).fillColor("#666").text(`N° ${opts.documentNumber}`);
    doc.text(`Édité le ${new Date().toLocaleString("fr-FR")}`);
    doc.moveDown(1);

    // Meta
    doc.fontSize(11).fillColor("#1a0040");
    doc.text(`${opts.subjectLabel} : ${opts.subjectName}`);
    doc.text(`Période : ${fmtDate(opts.from)} – ${fmtDate(opts.to)}`);
    doc.text(`Nombre de tips : ${opts.tips.length}`);
    doc.moveDown(1);

    // Totals box
    doc.fontSize(12).fillColor("#1a0040").text("Synthèse", { underline: true });
    doc.moveDown(0.4);
    doc.fontSize(11).fillColor("#333");
    doc.text(`Brut reçu : ${eur(opts.brutCents)}`);
    doc.text(`Frais plateforme : ${eur(opts.fraisCents)}`);
    doc.text(`Net : ${eur(opts.netCents)}`);
    doc.moveDown(1);

    // Table header
    doc.fontSize(12).fillColor("#1a0040").text("Détail des transactions", { underline: true });
    doc.moveDown(0.4);
    const startX = doc.x;
    let y = doc.y;
    const cols = [
      { label: "Date", x: startX, w: 90 },
      { label: "ID", x: startX + 90, w: 90 },
      { label: opts.counterpartyLabel, x: startX + 180, w: 160 },
      { label: "Montant", x: startX + 340, w: 100 },
    ];
    doc.fontSize(9).fillColor("#888");
    cols.forEach((c) => doc.text(c.label, c.x, y, { width: c.w }));
    y += 16;
    doc.moveTo(startX, y - 4).lineTo(startX + 440, y - 4).strokeColor("#ddd").stroke();

    doc.fontSize(9).fillColor("#222");
    for (const t of opts.tips) {
      if (y > 770) {
        doc.addPage();
        y = 50;
      }
      doc.text(fmtDate(t.date), cols[0].x, y, { width: cols[0].w });
      doc.text(`TIP-${t.id.slice(0, 4).toUpperCase()}`, cols[1].x, y, { width: cols[1].w });
      doc.text(t.counterparty, cols[2].x, y, { width: cols[2].w });
      doc.text(eur(t.amountCents), cols[3].x, y, { width: cols[3].w });
      y += 16;
    }

    doc.moveDown(2);
    doc
      .fontSize(8)
      .fillColor("#999")
      .text(
        "Ce document atteste les transactions enregistrées par la plateforme Money Pull Up.",
        startX,
        Math.min(y + 20, 800),
        { width: 440 },
      );

    doc.end();
  });
}

function makeDocNumber(prefix: string, now: Date, id: string): string {
  return `${prefix}-${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${id
    .slice(0, 5)
    .toUpperCase()}`;
}

/** Uploads the statement to Storage and returns a 7-day signed download URL. */
async function uploadStatement(
  ownerUid: string,
  statementId: string,
  format: "pdf" | "csv",
  body: Buffer,
  refId: string,
  documentNumber: string,
): Promise<string> {
  const bucket = admin.storage().bucket();
  const filePath = `statements/${ownerUid}/${statementId}.${format}`;
  const file = bucket.file(filePath);
  await file.save(body, {
    contentType: format === "csv" ? "text/csv" : "application/pdf",
    metadata: { metadata: { refId, documentNumber } },
  });
  const [downloadUrl] = await file.getSignedUrl({
    action: "read",
    expires: Date.now() + 7 * 24 * 60 * 60 * 1000, // 7 days
  });
  return downloadUrl;
}

/**
 * Generates a certified tip statement (PDF or CSV) for the calling DJ over a
 * date range, uploads it to Storage, records a `statements/{id}` document for
 * QR verification, and returns a signed download URL.
 */
export const generateTipStatement = onCall(async (req) => {
  const uid = requireUid(req);
  const djId = str(req.data?.djId);
  const format = str(req.data?.format).toLowerCase() === "csv" ? "csv" : "pdf";
  if (!djId) throw new HttpsError("invalid-argument", "djId is required.");

  const now = new Date();
  const defaultFrom = new Date(now.getFullYear(), now.getMonth(), 1);
  const from = parseDate(req.data?.from, defaultFrom);
  const to = parseDate(req.data?.to, now);

  const djSnap = await db().collection("djs").doc(djId).get();
  const dj = djSnap.data();
  if (!dj) throw new HttpsError("not-found", "Unknown DJ.");
  if (dj.ownerUid !== uid) {
    throw new HttpsError("permission-denied", "Only the DJ can generate this statement.");
  }

  // Captured tips in range. Inclusive of the whole "to" day.
  const toEnd = new Date(to);
  toEnd.setHours(23, 59, 59, 999);
  const snap = await db()
    .collection("tips")
    .where("djOwnerUid", "==", uid)
    .where("status", "==", "captured")
    .orderBy("createdAt", "desc")
    .get();

  const tips: StatementTip[] = snap.docs
    .map((d) => {
      const data = d.data();
      return {
        id: d.id,
        date: data.createdAt?.toDate?.() ?? new Date(),
        amountCents: typeof data.amountCents === "number" ? data.amountCents : 0,
        counterparty: typeof data.fanName === "string" ? data.fanName : "Fan",
      };
    })
    .filter((t) => t.date >= from && t.date <= toEnd);

  const brutCents = tips.reduce((s, t) => s + t.amountCents, 0);
  const fraisCents = Math.round(brutCents * FEE_RATE);
  const netCents = brutCents - fraisCents;

  const stmtRef = db().collection("statements").doc();
  const documentNumber = makeDocNumber("RC", now, stmtRef.id);
  const djName = str(dj.name) || "DJ";

  const body =
    format === "csv"
      ? Buffer.from(buildCsv(tips, "Fan"), "utf8")
      : await buildPdf({
          title: "Relevé certifié de tips",
          subjectLabel: "DJ",
          subjectName: djName,
          counterpartyLabel: "Fan",
          documentNumber,
          from,
          to,
          tips,
          brutCents,
          fraisCents,
          netCents,
        });

  const downloadUrl = await uploadStatement(uid, stmtRef.id, format, body, djId, documentNumber);

  await stmtRef.set({
    documentNumber,
    kind: "dj",
    djId,
    djOwnerUid: uid,
    djName,
    format,
    from: admin.firestore.Timestamp.fromDate(from),
    to: admin.firestore.Timestamp.fromDate(to),
    tipCount: tips.length,
    brutCents,
    fraisCents,
    netCents,
    storagePath: `statements/${uid}/${stmtRef.id}.${format}`,
    status: "certified",
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
  });

  return {
    statementId: stmtRef.id,
    documentNumber,
    format,
    downloadUrl,
    tipCount: tips.length,
    brutCents,
    fraisCents,
    netCents,
  };
});

/**
 * Generates a receipt (PDF or CSV) of the tips the calling fan has actually
 * paid (captured) over a date range. Same storage/signing model as the DJ
 * statement; the verification record is owned by the fan.
 */
export const generateFanStatement = onCall(async (req) => {
  const uid = requireUid(req);
  const format = str(req.data?.format).toLowerCase() === "csv" ? "csv" : "pdf";

  const now = new Date();
  const defaultFrom = new Date(now.getFullYear(), now.getMonth(), 1);
  const from = parseDate(req.data?.from, defaultFrom);
  const to = parseDate(req.data?.to, now);
  const toEnd = new Date(to);
  toEnd.setHours(23, 59, 59, 999);

  const snap = await db()
    .collection("tips")
    .where("fanUid", "==", uid)
    .where("status", "==", "captured")
    .orderBy("createdAt", "desc")
    .get();

  const tips: StatementTip[] = snap.docs
    .map((d) => {
      const data = d.data();
      return {
        id: d.id,
        date: data.createdAt?.toDate?.() ?? new Date(),
        amountCents: typeof data.amountCents === "number" ? data.amountCents : 0,
        counterparty: typeof data.djName === "string" && data.djName ? data.djName : "DJ",
      };
    })
    .filter((t) => t.date >= from && t.date <= toEnd);

  const totalCents = tips.reduce((s, t) => s + t.amountCents, 0);

  const stmtRef = db().collection("statements").doc();
  const documentNumber = makeDocNumber("RF", now, stmtRef.id);
  const fanSnap = await db().collection("users").doc(uid).get();
  const fanName = str(fanSnap.data()?.name) || "Fan";

  const body =
    format === "csv"
      ? Buffer.from(buildCsv(tips, "DJ"), "utf8")
      : await buildPdf({
          title: "Reçu de tips envoyés",
          subjectLabel: "Fan",
          subjectName: fanName,
          counterpartyLabel: "DJ",
          documentNumber,
          from,
          to,
          tips,
          brutCents: totalCents,
          fraisCents: 0,
          netCents: totalCents,
        });

  const downloadUrl = await uploadStatement(uid, stmtRef.id, format, body, uid, documentNumber);

  await stmtRef.set({
    documentNumber,
    kind: "fan",
    fanUid: uid,
    fanName,
    format,
    from: admin.firestore.Timestamp.fromDate(from),
    to: admin.firestore.Timestamp.fromDate(to),
    tipCount: tips.length,
    totalCents,
    storagePath: `statements/${uid}/${stmtRef.id}.${format}`,
    status: "certified",
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
  });

  return {
    statementId: stmtRef.id,
    documentNumber,
    format,
    downloadUrl,
    tipCount: tips.length,
    totalCents,
  };
});
