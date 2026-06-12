# MONEY PULL-UP — INVENTAIRE COMPLET EXPO -> FLUTTER

Date : Wed Jun 10 02:09:47 UTC 2026

Ancienne app Expo :
```text
/workspaces/moneypullup/artifacts/money-pullup
```

Nouvelle app Flutter :
```text
/workspaces/moneypullup/artifacts/money-pullup-flutter
```

Objectif :
récupérer toutes les fonctionnalités existantes de l'app Expo / React Native pour les porter dans l'app Flutter.

---

## 1. Pages / routes Expo détectées

- `app/(tabs)/_layout.tsx`
- `app/(tabs)/dj.tsx`
- `app/(tabs)/fan.tsx`
- `app/(tabs)/index.tsx`
- `app/(tabs)/profile.tsx`
- `app/+not-found.tsx`
- `app/_layout.tsx`

---

## 2. Composants détectés

- `components/AmountChip3D.tsx`
- `components/DJWalletModal.tsx`
- `components/ErrorBoundary.tsx`
- `components/ErrorFallback.tsx`
- `components/GlassCard.tsx`
- `components/GlowBackground.tsx`
- `components/KeyboardAwareScrollViewCompat.tsx`
- `components/StripeModal.tsx`
- `components/TipButton.tsx`
- `components/TipNotification.tsx`

---

## 3. Contexts / stores détectés

- `contexts/ThemeContext.tsx`
- `contexts/TipsContext.tsx`

---

## 4. Hooks détectés

- `hooks/useColors.ts`

---

## 5. Services / lib / utils détectés


---

## 6. Assets images détectés

- `.expo/web/cache/production/images/favicon/favicon-186ad3e52a2fcf9f6cbf4affd15e1a7fac9643a4d89730e0904aa78d79c9f39c-contain-transparent/favicon-48.png`
- `assets/images/bg_club.png`
- `assets/images/dj_hero_bg.png`
- `assets/images/dj_hero_fan.png`
- `assets/images/icon.png`
- `dist/assets/__node_modules/.pnpm/@react-navigation+elements@2.9.14_@react-navigation+native@7.2.2_react-native@0.81.5_@b_3894088b0be9e53b4bb1977a6131bbf0/node_modules/@react-navigation/elements/lib/module/assets/back-icon-mask.0a328cd9c1afd0afe8e3b1ec5165b1b4.png`
- `dist/assets/__node_modules/.pnpm/@react-navigation+elements@2.9.14_@react-navigation+native@7.2.2_react-native@0.81.5_@b_3894088b0be9e53b4bb1977a6131bbf0/node_modules/@react-navigation/elements/lib/module/assets/back-icon.35ba0eaec5a4f5ed12ca16fabeae451d.png`
- `dist/assets/__node_modules/.pnpm/@react-navigation+elements@2.9.14_@react-navigation+native@7.2.2_react-native@0.81.5_@b_3894088b0be9e53b4bb1977a6131bbf0/node_modules/@react-navigation/elements/lib/module/assets/clear-icon.c94f6478e7ae0cdd9f15de1fcb9e5e55.png`
- `dist/assets/__node_modules/.pnpm/@react-navigation+elements@2.9.14_@react-navigation+native@7.2.2_react-native@0.81.5_@b_3894088b0be9e53b4bb1977a6131bbf0/node_modules/@react-navigation/elements/lib/module/assets/clear-icon.c94f6478e7ae0cdd9f15de1fcb9e5e55@2x.png`
- `dist/assets/__node_modules/.pnpm/@react-navigation+elements@2.9.14_@react-navigation+native@7.2.2_react-native@0.81.5_@b_3894088b0be9e53b4bb1977a6131bbf0/node_modules/@react-navigation/elements/lib/module/assets/clear-icon.c94f6478e7ae0cdd9f15de1fcb9e5e55@3x.png`
- `dist/assets/__node_modules/.pnpm/@react-navigation+elements@2.9.14_@react-navigation+native@7.2.2_react-native@0.81.5_@b_3894088b0be9e53b4bb1977a6131bbf0/node_modules/@react-navigation/elements/lib/module/assets/clear-icon.c94f6478e7ae0cdd9f15de1fcb9e5e55@4x.png`
- `dist/assets/__node_modules/.pnpm/@react-navigation+elements@2.9.14_@react-navigation+native@7.2.2_react-native@0.81.5_@b_3894088b0be9e53b4bb1977a6131bbf0/node_modules/@react-navigation/elements/lib/module/assets/close-icon.808e1b1b9b53114ec2838071a7e6daa7.png`
- `dist/assets/__node_modules/.pnpm/@react-navigation+elements@2.9.14_@react-navigation+native@7.2.2_react-native@0.81.5_@b_3894088b0be9e53b4bb1977a6131bbf0/node_modules/@react-navigation/elements/lib/module/assets/close-icon.808e1b1b9b53114ec2838071a7e6daa7@2x.png`
- `dist/assets/__node_modules/.pnpm/@react-navigation+elements@2.9.14_@react-navigation+native@7.2.2_react-native@0.81.5_@b_3894088b0be9e53b4bb1977a6131bbf0/node_modules/@react-navigation/elements/lib/module/assets/close-icon.808e1b1b9b53114ec2838071a7e6daa7@3x.png`
- `dist/assets/__node_modules/.pnpm/@react-navigation+elements@2.9.14_@react-navigation+native@7.2.2_react-native@0.81.5_@b_3894088b0be9e53b4bb1977a6131bbf0/node_modules/@react-navigation/elements/lib/module/assets/close-icon.808e1b1b9b53114ec2838071a7e6daa7@4x.png`
- `dist/assets/__node_modules/.pnpm/@react-navigation+elements@2.9.14_@react-navigation+native@7.2.2_react-native@0.81.5_@b_3894088b0be9e53b4bb1977a6131bbf0/node_modules/@react-navigation/elements/lib/module/assets/search-icon.286d67d3f74808a60a78d3ebf1a5fb57.png`
- `dist/assets/__node_modules/.pnpm/expo-router@6.0.23_@types+react-dom@19.1.11_@types+react@19.1.17__@types+react@19.1.17__abd38177f532ddff11e5834956475527/node_modules/expo-router/assets/arrow_down.017bc6ba3fc25503e5eb5e53826d48a8.png`
- `dist/assets/__node_modules/.pnpm/expo-router@6.0.23_@types+react-dom@19.1.11_@types+react@19.1.17__@types+react@19.1.17__abd38177f532ddff11e5834956475527/node_modules/expo-router/assets/error.d1ea1496f9057eb392d5bbf3732a61b7.png`
- `dist/assets/__node_modules/.pnpm/expo-router@6.0.23_@types+react-dom@19.1.11_@types+react@19.1.17__@types+react@19.1.17__abd38177f532ddff11e5834956475527/node_modules/expo-router/assets/file.19eeb73b9593a38f8e9f418337fc7d10.png`
- `dist/assets/__node_modules/.pnpm/expo-router@6.0.23_@types+react-dom@19.1.11_@types+react@19.1.17__@types+react@19.1.17__abd38177f532ddff11e5834956475527/node_modules/expo-router/assets/forward.d8b800c443b8972542883e0b9de2bdc6.png`
- `dist/assets/__node_modules/.pnpm/expo-router@6.0.23_@types+react-dom@19.1.11_@types+react@19.1.17__@types+react@19.1.17__abd38177f532ddff11e5834956475527/node_modules/expo-router/assets/pkg.ab19f4cbc543357183a20571f68380a3.png`
- `dist/assets/__node_modules/.pnpm/expo-router@6.0.23_@types+react-dom@19.1.11_@types+react@19.1.17__@types+react@19.1.17__abd38177f532ddff11e5834956475527/node_modules/expo-router/assets/sitemap.412dd9275b6b48ad28f5e3d81bb1f626.png`
- `dist/assets/__node_modules/.pnpm/expo-router@6.0.23_@types+react-dom@19.1.11_@types+react@19.1.17__@types+react@19.1.17__abd38177f532ddff11e5834956475527/node_modules/expo-router/assets/unmatched.20e71bdf79e3a97bf55fd9e164041578.png`
- `dist/assets/assets/images/dj_hero_fan.a91fde0bed23754b6b040bc97522942c.png`
- `dist/bg_club.png`
- `public/bg_club.png`

---

## 7. Dépendances Expo / React Native

```json
{
  "name": "@workspace/money-pullup",
  "version": "0.0.0",
  "private": true,
  "main": "expo-router/entry",
  "scripts": {
    "dev": "EXPO_PACKAGER_PROXY_URL=https://$REPLIT_EXPO_DEV_DOMAIN EXPO_PUBLIC_DOMAIN=$REPLIT_DEV_DOMAIN EXPO_PUBLIC_REPL_ID=$REPL_ID REACT_NATIVE_PACKAGER_HOSTNAME=$REPLIT_DEV_DOMAIN pnpm exec expo start --localhost --port $PORT",
    "build": "node scripts/build.js",
    "serve": "node server/serve.js",
    "typecheck": "tsc -p tsconfig.json --noEmit"
  },
  "devDependencies": {
    "@babel/core": "^7.25.2",
    "@expo-google-fonts/inter": "^0.4.0",
    "@expo/cli": "54.0.23",
    "@expo/ngrok": "^4.1.0",
    "@expo/vector-icons": "^15.0.3",
    "@react-native-async-storage/async-storage": "2.2.0",
    "@stardazed/streams-text-encoding": "^1.0.2",
    "@tanstack/react-query": "catalog:",
    "@types/react": "~19.1.10",
    "@types/react-dom": "~19.1.7",
    "@ungap/structured-clone": "^1.3.0",
    "@workspace/api-client-react": "workspace:*",
    "babel-plugin-react-compiler": "^19.0.0-beta-e993439-20250117",
    "expo": "~54.0.27",
    "expo-blur": "~15.0.8",
    "expo-constants": "~18.0.11",
    "expo-font": "~14.0.10",
    "expo-glass-effect": "~0.1.4",
    "expo-haptics": "~15.0.8",
    "expo-image": "~3.0.11",
    "expo-image-picker": "~17.0.9",
    "expo-linear-gradient": "~15.0.8",
    "expo-linking": "~8.0.10",
    "expo-location": "~19.0.8",
    "expo-router": "~6.0.17",
    "expo-splash-screen": "~31.0.12",
    "expo-status-bar": "~3.0.9",
    "expo-symbols": "~1.0.8",
    "expo-system-ui": "~6.0.9",
    "expo-web-browser": "~15.0.10",
    "react": "catalog:",
    "react-dom": "catalog:",
    "react-native": "0.81.5",
    "react-native-gesture-handler": "~2.28.0",
    "react-native-keyboard-controller": "^1.20.6",
    "react-native-reanimated": "~4.1.1",
    "react-native-safe-area-context": "~5.6.0",
    "react-native-screens": "~4.16.0",
    "react-native-svg": "15.12.1",
    "react-native-web": "^0.21.0",
    "react-native-worklets": "0.5.1",
    "typescript": "~5.9.2",
    "zod": "catalog:",
    "zod-validation-error": "^3.4.0"
  }
}
```

---

## 8. Mapping fonctionnel à porter dans Flutter

| Fonction Expo | Statut Flutter | Fichier Flutter cible |
|---|---:|---|
| Page Fan Tip Live | En cours / déjà créée | `lib/main.dart` puis `lib/features/fan/fan_page.dart` |
| Page DJ Dashboard | À porter | `lib/features/dj/dj_page.dart` |
| Gestion des tips | À porter | `lib/core/models/tip.dart` + `lib/core/state/tips_controller.dart` |
| Acceptation / refus tips | À porter | `lib/features/dj/widgets/tip_request_card.dart` |
| Message fan au DJ | À porter | `lib/features/fan/widgets/message_input.dart` |
| Wallet / solde | À porter | `lib/features/wallet/wallet_page.dart` |
| Recharge wallet | À porter | `lib/features/wallet/recharge_page.dart` |
| Profil utilisateur | À porter | `lib/features/profile/profile_page.dart` |
| Navigation Fan / DJ / Profil | Partiel | `lib/shared/widgets/custom_bottom_nav.dart` |
| Assets DJ / club | À vérifier | `assets/images/` |
| Charte graphique néon | Partiel | `lib/core/theme/app_theme.dart` |

---

## 9. Priorité de migration

1. Garder la page Fan Flutter actuelle.
2. Découper `lib/main.dart` en fichiers propres.
3. Porter `TipsContext.tsx` vers un controller Flutter.
4. Porter le Dashboard DJ complet.
5. Porter le profil.
6. Porter le wallet.
7. Ajouter Firebase / paiement Stripe après stabilisation UI.

