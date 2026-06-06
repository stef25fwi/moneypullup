# PRD — Money Pull-up · Page DJ Dashboard

**Version :** 1.0  
**Écran :** Dashboard DJ — gestion des tips reçus  
**Référence visuelle :** `moneypullup_dj_dashboard_mockup_reference.webp`  
**Objectif :** reproduire la page DJ du mockup avec les mêmes fonctions, le même style visuel, les mêmes zones d’action et le même parcours métier.

---

## 1. Résumé produit

Cette page est le tableau de bord principal du DJ dans Money Pull-up.  
Elle permet au DJ de voir ses performances en direct, gérer les tips en attente, accepter ou refuser chaque tip par geste de swipe, activer un message personnalisé automatique et suivre ses statistiques du jour.

Le cœur fonctionnel est le **traitement des tips reçus** :

- le DJ reçoit un tip envoyé par un fan ;
- le tip apparaît dans une pile ou liste de cartes en attente ;
- le DJ glisse la carte vers la gauche pour refuser ;
- le DJ glisse la carte vers la droite pour accepter ;
- si le DJ accepte, le fan reçoit automatiquement un message personnalisé préparé à l’avance par le DJ ;
- si le DJ refuse, le tip est marqué refusé et le paiement est annulé ou remboursé selon l’état de transaction ;
- le dashboard met à jour les compteurs, le wallet et les statistiques en temps réel.

---

## 2. Identité visuelle obligatoire

### 2.1 Direction artistique

L’écran doit rester strictement cohérent avec le style du mockup fan Money Pull-up :

- interface mobile sombre ;
- ambiance club / live DJ ;
- fond noir indigo profond ;
- glows magenta, violet, rose néon, bleu électrique ;
- cartes arrondies glassmorphism ;
- typographie blanche très contrastée ;
- boutons et icônes en outline néon ;
- effets de profondeur, halo, transparence, ombre colorée ;
- rendu premium, app musicale, live, événementiel.

### 2.2 Palette couleur extraite / approchée du mockup

| Usage | Couleur | Hex |
|---|---:|---:|
| Fond principal presque noir | Noir indigo | `#03020B` |
| Fond secondaire | Nuit violette | `#09051B` |
| Surface carte sombre | Indigo profond | `#10083F` |
| Surface glass card | Violet noir | `#261728` |
| Violet halo | Violet néon sombre | `#36045D` |
| Magenta profond | Magenta sombre | `#610D42` |
| Violet accent | Violet électrique | `#640795` |
| Bleu électrique | Bleu scène | `#112A90` |
| Rose néon principal | Rose Money Pull-up | `#C4249D` |
| Texte principal | Blanc rosé | `#EDDDEA` |
| Cyan acceptation | Cyan électrique | `#17D7FF` |
| Vert positif | Vert gain | `#39E68A` |
| Rouge refus | Rose rouge | `#FF2C85` |
| Ligne / bordure discrète | Violet transparent | `rgba(255,255,255,0.10)` |

### 2.3 Typographie

Police recommandée Flutter :

- primaire : `Inter`, `SF Pro Display` ou `Plus Jakarta Sans`;
- fallback : `Roboto`;
- style titres : bold, uppercase, tracking augmenté ;
- style KPI : chiffres grands, semi-bold ;
- style microcopy : taille réduite, gris clair, tracking léger.

Règles typographiques :

```dart
fontFamily: 'Inter'
```

| Élément | Taille base 430 × 932 | Graisse | Couleur |
|---|---:|---:|---:|
| Titre DJ `MASTER BEAT` | 34–38 px | 800 | `#FFFFFF` |
| Label `DJ` | 26–30 px | 800 | `#FFFFFF` |
| Genres | 15–17 px | 500 | `#F5EFFF` |
| KPI label | 11–13 px | 500 | `#C9BFD7` |
| KPI valeur | 26–30 px | 700 | `#FFFFFF` / rose |
| Section title | 12–14 px | 700 | `#AFA6BA` |
| Carte tip nom fan | 20–22 px | 700 | `#FFFFFF` |
| Montant tip | 28–32 px | 800 | `#FF4FB8` |
| Boutons | 13–16 px | 700 | `#FFFFFF` |
| Navigation | 12–14 px | 500 | actif rose / inactif gris |

---

## 3. Format écran et grille Flutter

### 3.1 Taille de référence

Le mockup est en ratio smartphone vertical proche de 9:16.

Dimensions de design recommandées :

```text
Largeur logique Flutter : 430 dp
Hauteur logique Flutter : 932 dp
SafeArea activée
```

L’interface doit être responsive par ratio :

```dart
final sx = MediaQuery.sizeOf(context).width / 430.0;
final sy = MediaQuery.sizeOf(context).height / 932.0;
```

### 3.2 Marges

| Zone | Valeur |
|---|---:|
| Padding horizontal global | 20 dp |
| Espacement vertical sections | 18–24 dp |
| Rayon cartes principales | 24 dp |
| Rayon cartes KPI | 18 dp |
| Rayon boutons | 18–22 dp |
| Bordure fine | 1 dp |
| Blur glassmorphism | 14–22 |
| Ombre glow principale | 16–40 px |

---

## 4. Structure exacte de la page

L’écran est une `Scaffold` sombre avec un `Stack` de fond et un `CustomScrollView` ou `SingleChildScrollView`.

Ordre visuel :

1. fond néon nightclub ;
2. SafeArea ;
3. hero DJ avec solde wallet ;
4. barre KPI intégrée au hero ;
5. section `Tips en attente` ;
6. carte swipe du tip en attente ;
7. instructions swipe gauche / droite ;
8. bloc `Message automatique` ;
9. bloc `Aperçu aujourd’hui` ;
10. bottom navigation DJ.

---

## 5. Spécification UI détaillée

## 5.1 Fond écran

Le fond doit occuper tout l’écran.

### Composition

- base noire indigo `#03020B`;
- dégradé radial violet en haut droit ;
- halos magenta et bleu en arrière-plan ;
- lignes floues diagonales rose/bleu type laser ;
- bruit léger / particules ;
- pas d’élément lisible parasite.

### Flutter

Fond recommandé :

```dart
Container(
  decoration: const BoxDecoration(
    gradient: LinearGradient(
      begin: Alignment.topCenter,
      end: Alignment.bottomCenter,
      colors: [
        Color(0xFF05020E),
        Color(0xFF09051B),
        Color(0xFF03020B),
      ],
    ),
  ),
)
```

Ajouter au-dessus :

- `Positioned` halo magenta droit ;
- `Positioned` halo bleu bas gauche ;
- `BackdropFilter` léger sur les cartes.

---

## 5.2 Hero DJ

### Contenu visible

- badge `• LIVE`;
- titre `DJ`;
- titre principal `MASTER BEAT`;
- ligne genre `House • Techno • Live Set`;
- image de fond DJ en concert ;
- chip solde wallet `1 245,80 €`;
- carte KPI horizontale.

### Dimensions

| Élément | Position / taille |
|---|---|
| Hero card | marge 20 dp, hauteur 260–285 dp |
| Rayon | 24 dp |
| Image DJ | cover, alignement centre droit |
| Overlay noir | bas vers haut, opacité 0.45–0.75 |
| Badge LIVE | top 22, left 18 |
| Chip wallet | top 18, right 18 |
| Titres | left 18, bottom 100 |
| KPI strip | bottom 14, left 14, right 14, hauteur 86 |

### Fonctions

- Affiche l’état live du DJ.
- Affiche l’identité du DJ connecté.
- Affiche le solde disponible ou prévisionnel.
- Les KPIs se mettent à jour en temps réel.
- Le chip wallet ouvre la page wallet / retraits.

### Données

```dart
DjDashboardHeader(
  djId: String,
  stageName: String,
  genres: List<String>,
  isLive: bool,
  walletBalanceCents: int,
  heroImageUrl: String,
  tipsReceivedToday: int,
  pendingTipsCount: int,
  acceptedTipsToday: int,
)
```

### KPIs dans le hero

| KPI | Label | Valeur mockup | Source |
|---|---|---:|---|
| Tips reçus | `Tips reçus` | `128 aujourd’hui` | tips acceptés + refusés + attente du jour |
| En attente | `En attente` | `12` | tips status `pending` |
| Acceptés | `Acceptés` | `116` | tips status `accepted` jour |
| Solde wallet | `Solde wallet` | `1 245,80 €` | wallet balance |

---

## 5.3 Section Tips en attente

### Header

Texte :

```text
TIPS EN ATTENTE   12                           Voir tout >
```

Fonctions :

- affiche le nombre exact de tips en attente ;
- `Voir tout` ouvre la page liste complète des tips ;
- si aucun tip : affiche un empty state premium.

### Empty state

```text
Aucun tip en attente
Les prochains tips apparaîtront ici pendant ton live.
```

---

## 5.4 Carte swipe de tip reçu

### Contenu carte

Chaque carte de tip doit contenir :

- avatar fan ;
- prénom fan ;
- handle fan ;
- montant ;
- message fan ;
- statut ;
- zones d’action gauche/droite.

Exemple mockup :

```text
Léa
@lea.music
10 €

Trop hâte d’entendre
ce prochain banger ! 🔥

En attente
```

### Dimensions

| Élément | Valeur |
|---|---:|
| Hauteur carte principale | 145–170 dp |
| Largeur centrale | 100% moins zones action |
| Rayon | 22 dp |
| Avatar | 54–62 dp |
| Montant | aligné haut droit |
| Message | max 2 lignes visibles |
| Statut | bas gauche |

### Zones de swipe

La carte doit avoir une structure type `Dismissible`, `Draggable` ou `GestureDetector`.

#### Swipe gauche — Refuser

Visuel :

- panneau gauche rose rouge ;
- icône `X`;
- texte `Refuser`;
- instruction : `Glisser à gauche pour refuser`.

Action :

- passe le tip en `rejected`;
- déclenche annulation / remboursement selon transaction ;
- retire la carte de la pile ;
- met à jour compteurs ;
- ajoute un log ;
- option : notifie le fan avec un message neutre.

#### Swipe droite — Accepter

Visuel :

- panneau droit bleu / violet ;
- icône check ;
- texte `Accepter`;
- instruction : `Glisser à droite pour accepter`.

Action :

- passe le tip en `accepted`;
- capture ou valide le paiement ;
- crédite le wallet du DJ après frais ;
- retire la carte de la pile ;
- envoie automatiquement au fan le message personnalisé préconfiguré ;
- ajoute un événement dans le live ;
- met à jour compteurs ;
- déclenche notification push fan.

### Seuils de swipe

```dart
const double acceptThreshold = 0.35; // 35% largeur carte
const double rejectThreshold = -0.35;
```

### Comportement précis

| Geste | Effet visuel | Résultat |
|---|---|---|
| Drag < 15% | carte suit le doigt puis revient |
| Drag 15–35% | apparition progressive icône action |
| Drag > 35% gauche | refus immédiat |
| Drag > 35% droite | acceptation immédiate |
| Swipe violent gauche | refus immédiat |
| Swipe violent droite | acceptation immédiate |

### Animations

| Animation | Durée |
|---|---:|
| Déplacement carte | 160 ms |
| Retour carte | 220 ms |
| Acceptation glow bleu | 280 ms |
| Refus glow rouge | 280 ms |
| Retrait carte | 240 ms |
| Mise à jour KPI | 300 ms |

---

## 5.5 Message automatique personnalisé

### Bloc visible

Titre :

```text
MESSAGE AUTOMATIQUE                         Activé [toggle]
```

Sous-texte :

```text
Envoyé automatiquement après acceptation
```

Message préparé :

```text
Merci pour ton tip !
Je te dédie le prochain son 🔥
```

Bouton :

```text
Modifier
```

### Fonctions

Le DJ peut :

- activer / désactiver le message automatique ;
- modifier le texte ;
- enregistrer plusieurs templates ;
- choisir le template actif ;
- insérer des variables dynamiques ;
- prévisualiser le message tel que le fan le recevra ;
- tester l’envoi à soi-même ;
- limiter la longueur du message.

### Variables dynamiques autorisées

```text
{fan_name}
{fan_handle}
{amount}
{dj_name}
{live_title}
{dedication_number}
```

Exemples :

```text
Merci {fan_name} pour ton tip de {amount} !
Je te dédie le prochain son 🔥
```

### Règles

- Le message est envoyé seulement après acceptation confirmée.
- Si le toggle est désactivé, aucun message automatique n’est envoyé.
- Si le message est vide, afficher une erreur.
- Si le fan a bloqué les messages, envoyer seulement une notification système.
- Si l’envoi échoue, conserver le tip accepté et mettre le message en file d’attente.

---

## 5.6 Aperçu aujourd’hui

Section :

```text
APERÇU AUJOURD’HUI
```

Cartes :

1. `Tips totaux`
2. `Gains nets`
3. `Nouveaux supporters`
4. `Top fan`

### Carte 1 — Tips totaux

```text
Tips totaux
1 280 €
+18% vs hier
```

Fonction :

- somme brute des tips du jour ;
- comparaison avec J-1 ;
- peut ouvrir détails analytics.

### Carte 2 — Gains nets

```text
Gains nets
982 €
Après frais
```

Fonction :

- solde après frais plateforme / paiement ;
- ne doit jamais compter les tips refusés.

### Carte 3 — Nouveaux supporters

```text
Nouveaux supporters
24
+6 vs hier
```

Fonction :

- fans qui ont envoyé au moins un tip aujourd’hui et n’avaient jamais tipé ce DJ avant.

### Carte 4 — Top fan

```text
Top fan
Maxime
210 €
```

Fonction :

- fan ayant donné le montant le plus élevé sur la période sélectionnée ;
- avatar + nom + montant.

---

## 5.7 Bottom navigation DJ

Tabs :

| Tab | Icône | Fonction |
|---|---|---|
| Dashboard | grille 4 carrés | page active |
| Tips | cœur | liste tips |
| Live | waveform | outils live |
| Profil | utilisateur | paramètres DJ |

État actif :

- icône rose néon ;
- label rose ;
- petit point rose sous le label ;
- autres tabs gris violet.

---

# 6. Parcours utilisateur

## 6.1 Parcours principal — accepter un tip

1. Le fan envoie un tip depuis la page fan.
2. Le tip arrive en `pending`.
3. Le DJ voit la carte dans `Tips en attente`.
4. Le DJ glisse la carte à droite.
5. L’app affiche un glow d’acceptation.
6. Le backend vérifie que le tip est toujours pending.
7. Le paiement est capturé / validé.
8. Le wallet DJ est crédité.
9. Le tip passe en `accepted`.
10. Le message automatique est généré.
11. Le fan reçoit :
    - message dans sa conversation ;
    - notification push ;
    - statut du tip accepté.
12. Les KPIs du dashboard sont mis à jour.

## 6.2 Parcours principal — refuser un tip

1. Le DJ glisse la carte à gauche.
2. L’app affiche un glow de refus.
3. Le backend vérifie que le tip est toujours pending.
4. Le paiement est annulé ou remboursé.
5. Le tip passe en `rejected`.
6. La carte disparaît.
7. Les KPIs du dashboard sont mis à jour.
8. Option : le fan reçoit une notification neutre.

## 6.3 Modifier le message automatique

1. Le DJ appuie sur `Modifier`.
2. Bottom sheet ou page dédiée.
3. Le DJ modifie le texte.
4. L’app affiche un compteur de caractères.
5. Le DJ sauvegarde.
6. Le template actif est mis à jour.
7. Les prochains tips acceptés utilisent ce message.

## 6.4 Désactiver message automatique

1. Le DJ coupe le toggle `Activé`.
2. Le statut devient `Désactivé`.
3. Les tips acceptés ne déclenchent pas de message automatique.
4. Le fan reçoit uniquement le statut / notification si prévu.

---

# 7. États fonctionnels des tips

## 7.1 Statuts

```dart
enum TipStatus {
  pending,
  accepted,
  rejected,
  expired,
  refunded,
  failed,
}
```

## 7.2 Transitions autorisées

| Depuis | Vers | Autorisé par |
|---|---|---|
| pending | accepted | DJ propriétaire / Cloud Function |
| pending | rejected | DJ propriétaire / Cloud Function |
| pending | expired | système |
| accepted | refunded | support/admin |
| accepted | failed | système paiement |
| rejected | refunded | système paiement |
| failed | pending | jamais automatiquement |
| accepted | rejected | interdit |
| rejected | accepted | interdit |

## 7.3 Expiration automatique

Un tip en attente peut expirer après une durée configurable :

```text
pending_ttl_minutes = 15 ou 30 minutes pendant un live
```

À expiration :

- statut `expired`;
- paiement annulé / remboursé ;
- fan notifié ;
- carte retirée du dashboard.

---

# 8. Architecture Flutter recommandée

## 8.1 Pages

```text
lib/pages/dj/dj_dashboard_page.dart
lib/pages/dj/dj_tips_page.dart
lib/pages/dj/dj_live_tools_page.dart
lib/pages/dj/dj_profile_page.dart
lib/pages/dj/auto_message_editor_page.dart
```

## 8.2 Widgets

```text
DjDashboardPage
DjNeonBackground
DjHeroDashboardCard
DjKpiStrip
PendingTipsHeader
PendingTipSwipeDeck
PendingTipCard
SwipeActionPanel
SwipeInstructions
AutoMessageCard
TodayOverviewGrid
TodayMetricCard
DjBottomNavBar
NeonGlassCard
NeonIconButton
MoneyAmountText
```

## 8.3 State management

Compatible :

- Riverpod recommandé ;
- Provider possible ;
- Bloc possible.

Providers recommandés :

```dart
djDashboardProvider(djId)
pendingTipsProvider(djId)
autoMessageProvider(djId)
todayAnalyticsProvider(djId)
walletProvider(djId)
```

## 8.4 Exemple d’état UI

```dart
class DjDashboardState {
  final DjProfile dj;
  final WalletSummary wallet;
  final DashboardMetrics metrics;
  final List<TipRequest> pendingTips;
  final AutoMessageSettings autoMessage;
  final TodayAnalytics today;
  final bool isLoading;
  final String? error;
}
```

---

# 9. Modèle de données Firestore

## 9.1 `users/{uid}`

```json
{
  "uid": "string",
  "displayName": "string",
  "photoUrl": "string",
  "role": "fan | dj | admin",
  "createdAt": "timestamp",
  "updatedAt": "timestamp"
}
```

## 9.2 `dj_profiles/{djId}`

```json
{
  "djId": "string",
  "ownerUid": "string",
  "stageName": "DJ MASTER BEAT",
  "genres": ["House", "Techno", "Live Set"],
  "heroImageUrl": "string",
  "avatarUrl": "string",
  "isLive": true,
  "liveSessionId": "string",
  "verified": true,
  "createdAt": "timestamp",
  "updatedAt": "timestamp"
}
```

## 9.3 `live_sessions/{sessionId}`

```json
{
  "sessionId": "string",
  "djId": "string",
  "title": "Live Set",
  "venue": "Electric Stage",
  "startedAt": "timestamp",
  "endedAt": "timestamp | null",
  "status": "live | ended | paused",
  "viewerCount": 340,
  "createdAt": "timestamp"
}
```

## 9.4 `tips/{tipId}`

```json
{
  "tipId": "string",
  "djId": "string",
  "fanId": "string",
  "fanName": "Léa",
  "fanHandle": "@lea.music",
  "fanAvatarUrl": "string",
  "liveSessionId": "string",
  "amountCents": 1000,
  "currency": "EUR",
  "message": "Trop hâte d’entendre ce prochain banger ! 🔥",
  "status": "pending",
  "paymentStatus": "authorized",
  "paymentProvider": "stripe",
  "paymentIntentId": "string",
  "createdAt": "timestamp",
  "acceptedAt": "timestamp | null",
  "rejectedAt": "timestamp | null",
  "expiredAt": "timestamp | null",
  "processedBy": "djUid | system",
  "autoMessageSent": false,
  "autoMessageId": "string | null"
}
```

## 9.5 `wallets/{djId}`

```json
{
  "djId": "string",
  "availableBalanceCents": 124580,
  "pendingBalanceCents": 0,
  "currency": "EUR",
  "updatedAt": "timestamp"
}
```

## 9.6 `wallet_transactions/{transactionId}`

```json
{
  "transactionId": "string",
  "djId": "string",
  "tipId": "string",
  "type": "tip_credit | refund | payout | fee",
  "grossAmountCents": 1000,
  "feeCents": 120,
  "netAmountCents": 880,
  "currency": "EUR",
  "status": "pending | completed | failed",
  "createdAt": "timestamp"
}
```

## 9.7 `auto_messages/{djId}`

```json
{
  "djId": "string",
  "enabled": true,
  "activeTemplateId": "default",
  "templates": [
    {
      "templateId": "default",
      "title": "Message par défaut",
      "body": "Merci pour ton tip ! Je te dédie le prochain son 🔥",
      "createdAt": "timestamp",
      "updatedAt": "timestamp"
    }
  ],
  "updatedAt": "timestamp"
}
```

## 9.8 `conversations/{conversationId}/messages/{messageId}`

```json
{
  "messageId": "string",
  "conversationId": "string",
  "senderId": "djId",
  "receiverId": "fanId",
  "type": "auto_tip_acceptance",
  "body": "Merci Léa pour ton tip de 10 € ! Je te dédie le prochain son 🔥",
  "tipId": "string",
  "createdAt": "timestamp",
  "readAt": "timestamp | null"
}
```

## 9.9 `notifications/{notificationId}`

```json
{
  "notificationId": "string",
  "userId": "fanId",
  "title": "Ton tip a été accepté 🎧",
  "body": "DJ MASTER BEAT t’a envoyé un message.",
  "type": "tip_accepted",
  "tipId": "string",
  "createdAt": "timestamp",
  "read": false
}
```

## 9.10 `dj_daily_analytics/{djId_yyyyMMdd}`

```json
{
  "djId": "string",
  "date": "2026-06-05",
  "grossTipsCents": 128000,
  "netEarningsCents": 98200,
  "tipsReceivedCount": 128,
  "pendingTipsCount": 12,
  "acceptedTipsCount": 116,
  "rejectedTipsCount": 0,
  "newSupportersCount": 24,
  "topFanId": "string",
  "topFanName": "Maxime",
  "topFanAmountCents": 21000,
  "updatedAt": "timestamp"
}
```

---

# 10. Cloud Functions / API obligatoires

## 10.1 `getDjDashboard`

Retourne le dashboard complet.

Input :

```json
{
  "djId": "string"
}
```

Output :

```json
{
  "profile": {},
  "wallet": {},
  "metrics": {},
  "pendingTips": [],
  "autoMessage": {},
  "today": {}
}
```

Règles :

- seul le DJ propriétaire ou admin peut lire ;
- cache court possible 10–20 s pour analytics ;
- pending tips toujours temps réel.

---

## 10.2 `acceptTip`

Accepte un tip.

Input :

```json
{
  "tipId": "string"
}
```

Traitement :

1. vérifier auth DJ ;
2. charger tip ;
3. vérifier `tip.djId == currentDjId`;
4. vérifier `status == pending`;
5. démarrer transaction ;
6. capturer paiement ;
7. calculer frais ;
8. créer transaction wallet ;
9. passer tip en `accepted`;
10. générer auto message si activé ;
11. créer message conversation ;
12. créer notification fan ;
13. mettre à jour analytics ;
14. retourner état final.

Output :

```json
{
  "success": true,
  "tipStatus": "accepted",
  "autoMessageSent": true,
  "walletBalanceCents": 124580
}
```

Contraintes :

- idempotent ;
- aucun double crédit wallet ;
- aucun double message ;
- verrou transactionnel obligatoire.

---

## 10.3 `rejectTip`

Refuse un tip.

Input :

```json
{
  "tipId": "string",
  "reason": "optional string"
}
```

Traitement :

1. vérifier auth DJ ;
2. charger tip ;
3. vérifier propriétaire ;
4. vérifier pending ;
5. annuler autorisation ou rembourser ;
6. passer `rejected`;
7. créer log ;
8. mettre à jour analytics ;
9. notifier fan si option activée.

Output :

```json
{
  "success": true,
  "tipStatus": "rejected",
  "refundStatus": "canceled_or_refunded"
}
```

---

## 10.4 `updateAutoMessage`

Input :

```json
{
  "enabled": true,
  "templateId": "default",
  "body": "Merci pour ton tip ! Je te dédie le prochain son 🔥"
}
```

Règles :

- texte 1 à 240 caractères ;
- filtrage contenu abusif ;
- sauvegarde dans `auto_messages/{djId}`;
- historique facultatif.

---

## 10.5 `getPendingTips`

Input :

```json
{
  "djId": "string",
  "limit": 20,
  "cursor": "optional"
}
```

Output :

```json
{
  "tips": [],
  "nextCursor": "string | null"
}
```

Tri :

```text
createdAt ASC ou priorité montant DESC selon option DJ
```

Par défaut :

```text
createdAt ASC
```

---

## 10.6 `expirePendingTips`

Fonction planifiée.

Fréquence :

```text
Toutes les 1 à 5 minutes
```

Traitement :

- trouve les tips pending trop anciens ;
- annule paiement ;
- passe en expired ;
- notifie fan.

---

# 11. Sécurité Firestore

## 11.1 Principes

- Un fan peut créer un tip pour lui-même.
- Un fan peut lire ses propres tips.
- Un DJ peut lire uniquement les tips qui lui sont destinés.
- Un DJ ne peut pas modifier directement `status`, `wallet`, `analytics`.
- Les changements critiques passent par Cloud Functions.
- Le wallet est backend-only.
- Les transactions financières sont backend-only.

## 11.2 Règles conceptuelles

```text
tips:
  create: fan authentifié
  read: fan propriétaire ou DJ propriétaire
  update status: Cloud Function seulement

wallets:
  read: DJ propriétaire
  write: backend seulement

auto_messages:
  read/write: DJ propriétaire

dj_daily_analytics:
  read: DJ propriétaire
  write: backend seulement

conversations:
  read: participants seulement
  write auto message: backend ou DJ selon type
```

---

# 12. Notifications

## 12.1 Fan — tip accepté

Titre :

```text
Ton tip a été accepté 🎧
```

Corps :

```text
DJ MASTER BEAT t’a envoyé un message.
```

Action :

- ouvre la conversation ou le détail du tip.

## 12.2 Fan — tip refusé

Titre :

```text
Tip non retenu
```

Corps :

```text
Ton montant n’a pas été débité ou sera remboursé.
```

## 12.3 DJ — nouveau tip

Titre :

```text
Nouveau tip reçu 🔥
```

Corps :

```text
Léa t’a envoyé 10 €.
```

---

# 13. Paiement et wallet

## 13.1 États paiement

```dart
enum PaymentStatus {
  requiresPayment,
  authorized,
  captured,
  canceled,
  refunded,
  failed,
}
```

## 13.2 Logique recommandée

Option premium recommandée :

- le fan valide le paiement ;
- le paiement est autorisé ;
- le DJ accepte ou refuse ;
- si accepté : capture ;
- si refusé ou expiré : annulation autorisation ;
- si déjà capturé par contrainte PSP : remboursement.

## 13.3 Frais

Exemple :

```text
Tip brut : 10,00 €
Frais paiement + plateforme : 1,20 €
Gain net DJ : 8,80 €
```

Les gains nets affichés doivent être calculés côté backend.

---

# 14. Gestion temps réel

## 14.1 Flux temps réel

- `pendingTipsProvider` écoute les tips pending du DJ.
- `walletProvider` écoute le wallet.
- `todayAnalyticsProvider` écoute analytics du jour.
- Après accept/reject, optimistic UI autorisée mais doit se réconcilier avec backend.

## 14.2 Optimistic UI

Acceptation :

- retirer carte immédiatement ;
- afficher snackbar `Tip accepté`;
- si backend échoue, remettre la carte avec message erreur.

Refus :

- retirer carte immédiatement ;
- afficher snackbar `Tip refusé`;
- si backend échoue, remettre la carte.

---

# 15. États d’erreur

## 15.1 Tip déjà traité

Message :

```text
Ce tip a déjà été traité.
```

Action :

- retirer de la pile ;
- refresh.

## 15.2 Paiement impossible

Message :

```text
Paiement impossible pour ce tip. Il n’a pas été ajouté au wallet.
```

Action :

- statut `failed`;
- ne pas envoyer auto-message.

## 15.3 Message automatique non envoyé

Message DJ :

```text
Tip accepté, mais le message automatique sera renvoyé plus tard.
```

Action :

- créer retry job.

## 15.4 Connexion perdue

Message :

```text
Connexion instable. Les tips seront synchronisés automatiquement.
```

---

# 16. Accessibilité

- Contraste texte/fond minimum AA.
- Boutons avec zones tactiles min 44 × 44 dp.
- Action alternative aux swipes :
  - bouton `Refuser`;
  - bouton `Accepter`;
- Haptic feedback léger :
  - acceptation : medium impact ;
  - refus : selection click ;
- Labels screen reader :
  - `Accepter le tip de Léa de 10 euros`;
  - `Refuser le tip de Léa de 10 euros`.

---

# 17. Analytics produit

Événements à tracker :

```text
dj_dashboard_viewed
pending_tip_card_seen
pending_tip_swipe_started
pending_tip_accepted
pending_tip_rejected
auto_message_enabled
auto_message_disabled
auto_message_edited
wallet_chip_opened
dashboard_metric_opened
tips_view_all_clicked
```

Payload minimal :

```json
{
  "djId": "string",
  "tipId": "string optional",
  "amountCents": 1000,
  "currency": "EUR",
  "liveSessionId": "string",
  "source": "dj_dashboard"
}
```

---

# 18. Critères d’acceptation

## 18.1 UI

- La page reprend exactement l’univers visuel du mockup :
  - fond sombre ;
  - néons magenta/bleu ;
  - cartes arrondies ;
  - typo blanche ;
  - hero DJ ;
  - boutons glow.
- Le hero affiche bien :
  - live badge ;
  - nom DJ ;
  - genres ;
  - solde wallet ;
  - KPIs.
- La section tips en attente affiche :
  - compteur ;
  - carte fan ;
  - montant ;
  - message ;
  - statut ;
  - actions gauche/droite.
- Le bloc message automatique affiche :
  - statut activé ;
  - message préparé ;
  - bouton modifier.
- Le dashboard aujourd’hui affiche les 4 métriques.
- La navigation basse affiche 4 tabs DJ.

## 18.2 Fonctionnel

- Un tip pending apparaît dans la page DJ.
- Swipe gauche refuse le tip.
- Swipe droite accepte le tip.
- Un tip accepté crédite le wallet.
- Un tip refusé ne crédite pas le wallet.
- Un tip accepté envoie automatiquement le message personnalisé au fan.
- Le message n’est pas envoyé si toggle désactivé.
- Les compteurs se mettent à jour après chaque action.
- Les actions sont idempotentes.
- Les règles empêchent un fan ou autre DJ de traiter le tip.

## 18.3 Backend

- `acceptTip` fonctionne en transaction.
- `rejectTip` fonctionne en transaction.
- Un double clic / double swipe ne crée pas de double paiement.
- Les notifications sont créées.
- Les analytics jour sont recalculées ou incrémentées correctement.
- Les expirations automatiques fonctionnent.

---

# 19. Tests QA

## 19.1 Tests unitaires

- formatage euros ;
- génération message automatique avec variables ;
- calcul frais ;
- transitions statut tip ;
- limites longueur message ;
- tri tips pending.

## 19.2 Tests widget Flutter

- hero visible ;
- KPI visibles ;
- carte tip pending visible ;
- swipe gauche appelle `rejectTip`;
- swipe droite appelle `acceptTip`;
- toggle auto-message change état ;
- empty state visible si aucune donnée.

## 19.3 Tests intégration

- fan envoie tip → DJ le voit ;
- DJ accepte → fan reçoit message ;
- DJ refuse → paiement annulé ;
- dashboard temps réel se met à jour ;
- wallet mis à jour uniquement après acceptation.

## 19.4 Tests sécurité

- fan ne peut pas modifier `tips.status`;
- DJ A ne peut pas lire tips de DJ B ;
- wallet non modifiable depuis client ;
- auto-message modifiable seulement par DJ propriétaire.

---

# 20. Prompt Copilot recommandé

```text
Créer la page Flutter Money Pull-up DJ Dashboard conformément au PRD.

Objectif:
Construire une page DJ dashboard premium néon, style Money Pull-up, avec:
- hero DJ live;
- wallet balance;
- KPIs tips reçus, en attente, acceptés, solde;
- cartes de tips en attente avec swipe gauche/refus et swipe droite/acceptation;
- message automatique personnalisé envoyé au fan après acceptation;
- aperçu analytics du jour;
- navigation basse Dashboard/Tips/Live/Profil.

Contraintes:
- Conserver le style dark neon magenta/bleu/violet du mockup.
- Utiliser des cards arrondies glassmorphism.
- Implémenter states loading/error/empty.
- Prévoir providers Riverpod.
- Ne jamais modifier wallet ou tip status directement côté client.
- Les actions accept/reject doivent appeler des services backend.
- Prévoir fallback bouton Accepter/Refuser en plus du swipe pour accessibilité.
- Préparer les modèles: TipRequest, DjDashboardState, AutoMessageSettings, WalletSummary, TodayAnalytics.
- Préparer services: acceptTip, rejectTip, updateAutoMessage, getPendingTips.
```

---

# 21. Checklist développeur

- [ ] Créer `dj_dashboard_page.dart`
- [ ] Créer `DjNeonBackground`
- [ ] Créer `DjHeroDashboardCard`
- [ ] Créer `DjKpiStrip`
- [ ] Créer `PendingTipSwipeDeck`
- [ ] Créer `PendingTipCard`
- [ ] Créer `AutoMessageCard`
- [ ] Créer `TodayOverviewGrid`
- [ ] Créer `DjBottomNavBar`
- [ ] Créer modèles Dart
- [ ] Créer providers Riverpod
- [ ] Brancher données mockées
- [ ] Brancher Firestore / Functions
- [ ] Ajouter sécurité backend
- [ ] Tester swipes
- [ ] Tester auto-message
- [ ] Tester wallet
- [ ] Tester empty/loading/error states
- [ ] Tester responsive smartphone
- [ ] Vérifier rendu visuel pixel proche mockup
