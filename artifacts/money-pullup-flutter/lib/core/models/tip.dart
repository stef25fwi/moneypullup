class Tip {
  final String id;
  final String fanName;
  final String fanHandle;
  final int amount;
  final String message;
  final DateTime createdAt;
  final TipStatus status;

  const Tip({
    required this.id,
    required this.fanName,
    this.fanHandle = '',
    required this.amount,
    required this.message,
    required this.createdAt,
    required this.status,
  });

  Tip copyWith({
    String? id,
    String? fanName,
    String? fanHandle,
    int? amount,
    String? message,
    DateTime? createdAt,
    TipStatus? status,
  }) {
    return Tip(
      id: id ?? this.id,
      fanName: fanName ?? this.fanName,
      fanHandle: fanHandle ?? this.fanHandle,
      amount: amount ?? this.amount,
      message: message ?? this.message,
      createdAt: createdAt ?? this.createdAt,
      status: status ?? this.status,
    );
  }
}

enum TipStatus {
  pending,
  accepted,
  refused,
}
