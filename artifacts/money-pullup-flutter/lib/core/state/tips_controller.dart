import 'package:flutter/foundation.dart';
import '../models/tip.dart';

class TipsController extends ChangeNotifier {
  int _walletBalance = 20;

  final List<Tip> _tips = [
    Tip(
      id: 'demo_lea',
      fanName: 'Léa',
      fanHandle: '@lea.music',
      amount: 10,
      message: "Trop hâte d'entendre ce prochain banger ! 🔥",
      createdAt: DateTime.now(),
      status: TipStatus.pending,
    ),
  ];

  int get walletBalance => _walletBalance;
  List<Tip> get tips => List.unmodifiable(_tips);

  List<Tip> get pendingTips =>
      _tips.where((tip) => tip.status == TipStatus.pending).toList();

  int get totalReceived => _tips
      .where((tip) => tip.status == TipStatus.accepted)
      .fold(0, (total, tip) => total + tip.amount);

  int get pendingTotal => _tips
      .where((tip) => tip.status == TipStatus.pending)
      .fold(0, (total, tip) => total + tip.amount);

  bool sendTip({required int amount, required String message}) {
    if (_walletBalance < amount) return false;
    _walletBalance -= amount;
    _tips.insert(
      0,
      Tip(
        id: DateTime.now().millisecondsSinceEpoch.toString(),
        fanName: 'Fan',
        fanHandle: '@fan.live',
        amount: amount,
        message: message,
        createdAt: DateTime.now(),
        status: TipStatus.pending,
      ),
    );
    notifyListeners();
    return true;
  }

  void addFunds(int amount) {
    _walletBalance += amount;
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
