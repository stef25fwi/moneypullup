import 'package:cloud_firestore/cloud_firestore.dart';

import '../models/tip.dart';

/// Realtime access to the `tips` collection. Tips are written only by Cloud
/// Functions; the app reads them live for the fan history and the DJ dashboard.
class FirestoreRepository {
  // Lazy so constructing the repository (e.g. in widget tests) does not require
  // an initialised Firebase app; the instance is resolved on first query.
  FirebaseFirestore get _db => FirebaseFirestore.instance;

  /// All tips addressed to a DJ (any status), newest first.
  Stream<List<Tip>> tipsForDj(String djOwnerUid) {
    return _db
        .collection('tips')
        .where('djOwnerUid', isEqualTo: djOwnerUid)
        .orderBy('createdAt', descending: true)
        .snapshots()
        .map((snap) => snap.docs.map(_toTip).toList());
  }

  /// Tips sent by a fan, newest first.
  Stream<List<Tip>> tipsForFan(String fanUid) {
    return _db
        .collection('tips')
        .where('fanUid', isEqualTo: fanUid)
        .orderBy('createdAt', descending: true)
        .snapshots()
        .map((snap) => snap.docs.map(_toTip).toList());
  }

  Tip _toTip(QueryDocumentSnapshot<Map<String, dynamic>> doc) {
    final d = doc.data();
    final cents = (d['amountCents'] as num?)?.toInt() ?? 0;
    return Tip(
      id: doc.id,
      fanName: d['fanName'] as String? ?? 'Fan',
      amount: cents ~/ 100,
      message: d['message'] as String? ?? '',
      createdAt: (d['createdAt'] as Timestamp?)?.toDate() ?? DateTime.now(),
      status: _statusFrom(d['status'] as String?),
    );
  }

  TipStatus _statusFrom(String? status) {
    switch (status) {
      case 'captured':
        return TipStatus.accepted;
      case 'cancelled':
      case 'failed':
        return TipStatus.refused;
      case 'requires_capture':
      default:
        return TipStatus.pending;
    }
  }
}
