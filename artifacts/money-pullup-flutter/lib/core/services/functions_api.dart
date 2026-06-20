import 'package:cloud_functions/cloud_functions.dart';

/// Result of [FunctionsApi.createTipPaymentIntent].
class TipIntent {
  final String tipId;
  final String clientSecret;
  const TipIntent({required this.tipId, required this.clientSecret});
}

/// Thin client over the callable Cloud Functions (region europe-west1).
/// The app never touches the Stripe secret key — only these functions do.
class FunctionsApi {
  FunctionsApi._();
  static final FunctionsApi instance = FunctionsApi._();

  FirebaseFunctions get _functions =>
      FirebaseFunctions.instanceFor(region: 'europe-west1');

  Map<String, dynamic> _map(dynamic data) => Map<String, dynamic>.from(data as Map);

  Future<TipIntent> createTipPaymentIntent({
    required String djId,
    required int amountCents,
    required String message,
  }) async {
    final res = await _functions.httpsCallable('createTipPaymentIntent').call({
      'djId': djId,
      'amountCents': amountCents,
      'message': message,
    });
    final data = _map(res.data);
    return TipIntent(
      tipId: data['tipId'] as String,
      clientSecret: data['clientSecret'] as String,
    );
  }

  Future<void> confirmTip(String tipId) async {
    await _functions.httpsCallable('confirmTip').call({'tipId': tipId});
  }

  Future<void> acceptTip(String tipId) async {
    await _functions.httpsCallable('acceptTip').call({'tipId': tipId});
  }

  Future<void> refuseTip(String tipId) async {
    await _functions.httpsCallable('refuseTip').call({'tipId': tipId});
  }

  Future<String> createDjConnectAccount(String djId) async {
    final res = await _functions.httpsCallable('createDjConnectAccount').call({'djId': djId});
    return _map(res.data)['accountId'] as String;
  }

  Future<String> createDjOnboardingLink({
    required String djId,
    required String refreshUrl,
    required String returnUrl,
  }) async {
    final res = await _functions.httpsCallable('createDjOnboardingLink').call({
      'djId': djId,
      'refreshUrl': refreshUrl,
      'returnUrl': returnUrl,
    });
    return _map(res.data)['url'] as String;
  }

  Future<Map<String, dynamic>> getDjAccountStatus(String djId) async {
    final res = await _functions.httpsCallable('getDjAccountStatus').call({'djId': djId});
    return _map(res.data);
  }
}
