import 'package:flutter_stripe/flutter_stripe.dart';

import 'functions_api.dart';

enum TipResult {
  /// Funds authorised (held). Awaiting the DJ's accept/refuse.
  authorized,

  /// The fan dismissed the Payment Sheet.
  cancelled,
}

/// Step 2–4 of the flow on the fan side: create a manual-capture PaymentIntent
/// via Cloud Functions, then confirm it with the Stripe Payment Sheet. After a
/// successful confirmation the PaymentIntent is in `requires_capture` (money
/// held, not captured) until the DJ decides.
class TipPayments {
  const TipPayments._();

  static Future<TipResult> sendTip({
    required String djId,
    required int amountEuros,
    required String message,
  }) async {
    final intent = await FunctionsApi.instance.createTipPaymentIntent(
      djId: djId,
      amountCents: amountEuros * 100,
      message: message,
    );

    await Stripe.instance.initPaymentSheet(
      paymentSheetParameters: SetupPaymentSheetParameters(
        paymentIntentClientSecret: intent.clientSecret,
        merchantDisplayName: 'Money Pull Up',
      ),
    );

    try {
      await Stripe.instance.presentPaymentSheet();
      // Payment authorised: surface the tip to the DJ now (webhook is the backstop).
      try {
        await FunctionsApi.instance.confirmTip(intent.tipId);
      } catch (_) {
        // Non-fatal: the Stripe webhook will flip the status as a fallback.
      }
      return TipResult.authorized;
    } on StripeException catch (e) {
      if (e.error.code == FailureCode.Canceled) return TipResult.cancelled;
      rethrow;
    }
  }
}
