import 'package:flutter/foundation.dart';
import '../models/tip.dart';

class TipsController extends ChangeNotifier {
  final List<Tip> _tips = [
    Tip(
      id: 'demo_1',
      fanName: 'Fan Live',
      amount: 10,
      message: 'Grosse vibe DJ !',
      createdAt: DateTime.now(),
      status: TipStatus.pending,
    ),
  ];

  List<Tip> get tips => List.unmodifiable(_tips);

  List<Tip> get pendingTips =>
      _tips.where((tip) => tip.status == TipStatus.pending).toList();

  int get totalReceived => _tips
      .where((tip) => tip.status == TipStatus.accepted)
      .fold(0, (total, tip) => total + tip.amount);

  void sendTip({
    required int amount,
    required String message,
  }) {
    _tips.insert(
      0,
      Tip(
        id: DateTime.now().millisecondsSinceEpoch.toString(),
        fanName: 'Fan',
        amount: amount,
        message: message,
        createdAt: DateTime.now(),
        status: TipStatus.pending,
      ),
    );
    notifyListeners();
  }

  void acceptTip(String id) {
    _updateStatus(id, TipStatus.accepted);
  }

  void refuseTip(String id) {
    _updateStatus(id, TipStatus.refused);
  }

  void _updateStatus(String id, TipStatus status) {
    final index = _tips.indexWhere((tip) => tip.id == id);
    if (index == -1) return;
    _tips[index] = _tips[index].copyWith(status: status);
    notifyListeners();
  }
}
