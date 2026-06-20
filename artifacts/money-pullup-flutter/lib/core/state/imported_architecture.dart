import '../models/imported_feature.dart';

class ImportedArchitecture {
  static const List<ImportedFeature> features = [
    ImportedFeature(
      name: 'Fan page',
      legacyPath: 'app/(tabs)/fan.tsx',
      flutterTarget: 'lib/features/fan/fan_page.dart',
    ),
    ImportedFeature(
      name: 'DJ dashboard',
      legacyPath: 'app/(tabs)/dj.tsx',
      flutterTarget: 'lib/features/dj/dj_dashboard_page.dart',
    ),
    ImportedFeature(
      name: 'Profile page',
      legacyPath: 'app/(tabs)/profile.tsx',
      flutterTarget: 'lib/features/profile/profile_page.dart',
    ),
    ImportedFeature(
      name: 'Tips context',
      legacyPath: 'contexts/TipsContext.tsx',
      flutterTarget: 'lib/core/state/remote_tips_controller.dart',
    ),
    ImportedFeature(
      name: 'Tip button',
      legacyPath: 'components/TipButton.tsx',
      flutterTarget: 'lib/features/fan/widgets/tip_button.dart',
    ),
    ImportedFeature(
      name: 'Amount chip',
      legacyPath: 'components/AmountChip3D.tsx',
      flutterTarget: 'lib/features/fan/widgets/amount_chip_3d.dart',
    ),
    ImportedFeature(
      name: 'DJ wallet modal',
      legacyPath: 'components/DJWalletModal.tsx',
      flutterTarget: 'lib/features/wallet/widgets/dj_wallet_modal.dart',
    ),
    ImportedFeature(
      name: 'Stripe modal',
      legacyPath: 'components/StripeModal.tsx',
      flutterTarget: 'lib/features/payment/widgets/stripe_modal.dart',
    ),
  ];
}
