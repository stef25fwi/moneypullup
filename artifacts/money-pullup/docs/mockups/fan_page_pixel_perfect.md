# PRD PIXEL PERFECT — MONEY PULL-UP — PAGE FAN

Objectif : reproduire strictement le mockup Fan Tip Live Money Pull-up.

Contraintes :
- smartphone portrait
- aucun scroll
- aucun overflow
- fond noir / violet / rose / bleu néon
- hero DJ en haut
- badge LIVE
- wallet 20,00 €
- DJ MASTER BEAT
- House • Techno • Live Set
- stats 12.5K Fans / 340 En live
- boutons 5€ / 10€ / 15€ / 20€
- 10€ sélectionné par défaut
- bloc montant 10 €
- Money Pull-up
- champ message optionnel
- boutons Montant libre / Envoyer le tip / Recharger
- bottom nav Fan / DJ / Profil

Fichier cible :
app/(tabs)/fan.tsx

Asset hero :
assets/images/dj_hero_fan.webp
fallback :
assets/images/dj_hero_fan.png

Palette :
#05020D
#090318
#070015
#030814
#FF2E9F
#FF147F
#FF7DCE
#7B2CFF
#00C8FF
#FFFFFF
#B8B4C8
#8A849D
#A9A3BA

Structure :
Scaffold équivalent React Native :
View root flex 1
LinearGradient background
Halos absolus
SafeAreaView
Column sans ScrollView

Aucun ScrollView.
Aucune FlatList.
Aucun AppBar.
Aucun élément supplémentaire.
