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
  fanName: string;
}

function csvEscape(value: string): string {
  return /[",\n]/.test(value) ? `"${value.replace(/"/g, '""')}"` : value;
}

function buildCsv(tips: StatementTip[]): string {
  const header = "Date,ID,Fan,Montant EUR,Statut";
  const rows = tips.map((t) =>
    [
      fmtDate(t.date),
      `TIP-${t.id.slice(0, 4).toUpperCase()}`,
      csvEscape(t.fanName),
      (t.amountCents / 100).toFixed(2),
      "Versé",
    ].join(","),
  );
  return [header, ...rows].join("\n");
}

function buildPdf(opts: {
  documentNumber: string;
  djName: string;
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
    doc.fontSize(20).fillColor("#1a0040").text("Relevé certifié de tips", { align: "left" });
    doc.moveDown(0.3);
    doc.fontSize(10).fillColor("#666").text(`N° ${opts.documentNumber}`);
    doc.text(`Édité le ${new Date().toLocaleString("fr-FR")}`);
    doc.moveDown(1);

    // Meta
    doc.fontSize(11).fillColor("#1a0040");
    doc.text(`DJ : ${opts.djName}`);
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
      { label: "Fan", x: startX + 180, w: 160 },
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
      doc.text(t.fanName, cols[2].x, y, { width: cols[2].w });
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
        fanName: typeof data.fanName === "string" ? data.fanName : "Fan",
      };
    })
    .filter((t) => t.date >= from && t.date <= toEnd);

  const brutCents = tips.reduce((s, t) => s + t.amountCents, 0);
  const fraisCents = Math.round(brutCents * FEE_RATE);
  const netCents = brutCents - fraisCents;

  // Document number + verification record.
  const stmtRef = db().collection("statements").doc();
  const documentNumber = `RC-${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${stmtRef.id
    .slice(0, 5)
    .toUpperCase()}`;

  const djName = str(dj.name) || "DJ";
  const body =
    format === "csv"
      ? Buffer.from(buildCsv(tips), "utf8")
      : await buildPdf({ documentNumber, djName, from, to, tips, brutCents, fraisCents, netCents });

  // Upload to Storage.
  const bucket = admin.storage().bucket();
  const filePath = `statements/${uid}/${stmtRef.id}.${format}`;
  const file = bucket.file(filePath);
  await file.save(body, {
    contentType: format === "csv" ? "text/csv" : "application/pdf",
    metadata: { metadata: { djId, documentNumber } },
  });

  const [downloadUrl] = await file.getSignedUrl({
    action: "read",
    expires: Date.now() + 7 * 24 * 60 * 60 * 1000, // 7 days
  });

  await stmtRef.set({
    documentNumber,
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
    storagePath: filePath,
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
