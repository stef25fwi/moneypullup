import 'package:firebase_auth/firebase_auth.dart';
import 'package:firebase_core/firebase_core.dart';
import 'package:flutter_stripe/flutter_stripe.dart';

/// One-shot startup: Firebase, Stripe and an (anonymous) identity.
///
/// Run `flutterfire configure` to generate platform config (or place the native
/// google-services / GoogleService-Info files); web additionally needs the
/// generated `firebase_options.dart` passed to [Firebase.initializeApp].
class AppBootstrap {
  const AppBootstrap._();

  static Future<void> initialize({required String stripePublishableKey}) async {
    await Firebase.initializeApp();

    if (stripePublishableKey.isNotEmpty) {
      Stripe.publishableKey = stripePublishableKey;
      await Stripe.instance.applySettings();
    }

    // Demo identity. Replace with real email/social sign-in when available.
    final auth = FirebaseAuth.instance;
    if (auth.currentUser == null) {
      await auth.signInAnonymously();
    }
  }

  /// Current user id, or '' when Firebase is not initialised (e.g. in tests).
  static String get currentUid {
    try {
      return FirebaseAuth.instance.currentUser?.uid ?? '';
    } catch (_) {
      return '';
    }
  }
}
