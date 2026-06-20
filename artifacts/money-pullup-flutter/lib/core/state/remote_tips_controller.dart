import 'dart:async';

import 'package:flutter/foundation.dart';

import '../models/tip.dart';
import '../services/firestore_repository.dart';
import '../services/functions_api.dart';

/// Realtime, server-authoritative replacement for the in-memory TipsController.
///
/// Tips come live from Firestore; accept/refuse call the Cloud Functions, which
/// capture/cancel the Stripe PaymentIntent. The UI updates when the stream
/// reflects the new status.
class RemoteTipsController extends ChangeNotifier {
  RemoteTipsController({FirestoreRepository? repository})
      : _repo = repository ?? FirestoreRepository();

  final FirestoreRepository _repo;
  StreamSubscription<List<Tip>>? _sub;

  List<Tip> _tips = const [];
  bool _loading = true;
  Object? _error;

  List<Tip> get tips => List.unmodifiable(_tips);
  bool get isLoading => _loading;
  Object? get error => _error;

  List<Tip> get pendingTips =>
      _tips.where((tip) => tip.status == TipStatus.pending).toList();

  int get totalReceived => _tips
      .where((tip) => tip.status == TipStatus.accepted)
      .fold(0, (total, tip) => total + tip.amount);

  int get pendingTotal => _tips
      .where((tip) => tip.status == TipStatus.pending)
      .fold(0, (total, tip) => total + tip.amount);

  /// Subscribe to the tips addressed to the given DJ owner.
  void bindToDj(String djOwnerUid) {
    _sub?.cancel();
    _loading = true;
    _error = null;
    notifyListeners();
    _sub = _repo.tipsForDj(djOwnerUid).listen(
      (tips) {
        _tips = tips;
        _loading = false;
        notifyListeners();
      },
      onError: (Object e) {
        _error = e;
        _loading = false;
        notifyListeners();
      },
    );
  }

  Future<void> acceptTip(String id) => FunctionsApi.instance.acceptTip(id);
  Future<void> refuseTip(String id) => FunctionsApi.instance.refuseTip(id);

  @override
  void dispose() {
    _sub?.cancel();
    super.dispose();
  }
}
