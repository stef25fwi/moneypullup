import React, { useMemo, useState } from 'react';
import {
  Dimensions,
  ImageBackground,
  Platform,
  Pressable,
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

const PINK = '#FF2E9F';
const HOT_PINK = '#FF147F';
const CYAN = '#00C8FF';
const PURPLE = '#7B2CFF';
const BG = '#05020D';

const heroImage = (() => {
  try {
    return require('../../assets/images/dj_hero_fan.webp');
  } catch {
    try {
      return require('../../assets/images/dj_hero_fan.png');
    } catch {
      return require('../../assets/images/dj_hero_bg.png');
    }
  }
})();

export default function FanScreen() {
  const [selectedTip, setSelectedTip] = useState(10);
  const [message, setMessage] = useState('');

  const compact = SCREEN_HEIGHT < 820;

  const sizes = useMemo(
    () => ({
      heroHeight: compact ? 244 : 276,
      tipCircle: compact ? 68 : 76,
      amountBox: compact ? 84 : 102,
      actionHeight: compact ? 74 : 84,
      navHeight: compact ? 74 : 84,
      amountFont: compact ? 54 : 66,
      gap: compact ? 10 : 14,
    }),
    [compact]
  );

  const tips = [5, 10, 15, 20];

  const handleSendTip = () => {
    console.log('TODO send tip', { amount: selectedTip, message });
  };

  const handleCustomAmount = () => {
    console.log('TODO open custom amount modal');
  };

  const handleRecharge = () => {
    console.log('TODO navigate to recharge wallet');
  };

  return (
    <View style={styles.root}>
      <LinearGradient
        colors={['#090318', BG, '#070015', '#030814']}
        locations={[0, 0.44, 0.72, 1]}
        style={StyleSheet.absoluteFill}
      />

      <View style={[styles.glow, styles.glowPink]} />
      <View style={[styles.glow, styles.glowBlue]} />
      <View style={[styles.glow, styles.glowPurple]} />

      <SafeAreaView style={styles.safe}>
        <View style={styles.page}>
          <View style={[styles.hero, { height: sizes.heroHeight }]}>
            <ImageBackground
              source={heroImage}
              resizeMode="cover"
              style={styles.heroImage}
              imageStyle={styles.heroImageRadius}
            >
              <LinearGradient
                colors={[
                  'rgba(5,2,13,0.08)',
                  'rgba(5,2,13,0.15)',
                  'rgba(5,2,13,0.72)',
                ]}
                style={StyleSheet.absoluteFill}
              />

              <View style={styles.liveBadge}>
                <Text style={styles.liveText}>● LIVE</Text>
              </View>

              <View style={styles.wallet}>
                <Ionicons name="wallet-outline" size={21} color={PINK} />
                <Text style={styles.walletText}>20,00 €</Text>
              </View>

              <View style={styles.djTextBlock}>
                <Text style={styles.djLabel}>DJ</Text>
                <Text style={styles.djName}>MASTER BEAT</Text>
                <View style={styles.genreRow}>
                  <MaterialCommunityIcons name="waveform" size={18} color={PINK} />
                  <Text style={styles.genreText}>House • Techno • Live Set</Text>
                </View>
              </View>

              <View style={styles.statsCard}>
                <View style={styles.statItem}>
                  <Ionicons name="heart-outline" size={22} color={PINK} />
                  <View>
                    <Text style={styles.statValue}>12.5K</Text>
                    <Text style={styles.statLabel}>Fans</Text>
                  </View>
                </View>

                <View style={styles.statDivider} />

                <View style={styles.statItem}>
                  <Ionicons name="person-outline" size={21} color={PINK} />
                  <View>
                    <Text style={styles.statValue}>340</Text>
                    <Text style={styles.statLabel}>En live</Text>
                  </View>
                </View>
              </View>
            </ImageBackground>
          </View>

          <View style={{ height: sizes.gap }} />

          <Text style={styles.sectionTitle}>CHOISISSEZ VOTRE TIP</Text>

          <View style={[styles.tipRow, { marginTop: compact ? 10 : 14 }]}>
            {tips.map((tip) => {
              const active = selectedTip === tip;
              const borderColor = tip === 15 ? CYAN : tip === 20 ? PURPLE : PINK;

              return (
                <Pressable
                  key={tip}
                  onPress={() => setSelectedTip(tip)}
                  style={[
                    styles.tipCircle,
                    {
                      width: sizes.tipCircle,
                      height: sizes.tipCircle,
                      borderRadius: sizes.tipCircle / 2,
                      borderColor,
                    },
                    active && styles.tipCircleActive,
                  ]}
                >
                  <Text style={[styles.tipText, active && styles.tipTextActive]}>
                    {tip}€
                  </Text>
                </Pressable>
              );
            })}
          </View>

          <View style={{ height: compact ? 12 : 16 }} />

          <Text style={styles.sectionTitle}>VOTRE TIP</Text>

          <View style={[styles.amountBox, { height: sizes.amountBox }]}>
            <LinearGradient
              colors={['rgba(255,255,255,0.06)', 'rgba(255,255,255,0.025)']}
              style={StyleSheet.absoluteFill}
            />
            <Text style={[styles.amountText, { fontSize: sizes.amountFont }]}>
              {selectedTip} €
            </Text>
          </View>

          <View style={[styles.infoRow, { marginTop: compact ? 8 : 12 }]}>
            <View style={styles.moneyIcon}>
              <Text style={styles.moneyIconText}>$</Text>
            </View>
            <View>
              <Text style={styles.moneyTitle}>Money Pull-up</Text>
              <Text style={styles.moneySubtitle}>Le soutien qui fait monter le son.</Text>
            </View>
          </View>

          <View style={[styles.messageBox, { height: compact ? 58 : 66 }]}>
            <TextInput
              value={message}
              onChangeText={(value) => setMessage(value.slice(0, 120))}
              placeholder="Un message pour le DJ... (optionnel)"
              placeholderTextColor="#A9A3BA"
              style={styles.messageInput}
              maxLength={120}
            />
            <Text style={styles.counter}>{message.length}/120</Text>
          </View>

          <View style={{ height: compact ? 10 : 14 }} />

          <View style={[styles.actionsRow, { height: sizes.actionHeight }]}>
            <Pressable style={styles.secondaryButton} onPress={handleCustomAmount}>
              <MaterialCommunityIcons name="view-grid-outline" size={24} color="#FF7DCE" />
              <Text style={styles.secondaryButtonText}>MONTANT{'\n'}LIBRE</Text>
            </Pressable>

            <Pressable style={styles.mainButton} onPress={handleSendTip}>
              <LinearGradient
                colors={[PINK, HOT_PINK]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.mainGradient}
              >
                <Ionicons name="flash" size={22} color="#FFFFFF" />
                <Text style={styles.mainButtonText}>ENVOYER LE TIP</Text>
              </LinearGradient>
            </Pressable>

            <Pressable style={[styles.secondaryButton, styles.rechargeButton]} onPress={handleRecharge}>
              <Ionicons name="wallet-outline" size={25} color={CYAN} />
              <Text style={styles.secondaryButtonText}>RECHARGER</Text>
            </Pressable>
          </View>

          <View style={{ height: compact ? 10 : 14 }} />

          <View style={[styles.bottomNav, { height: sizes.navHeight }]}>
            <View style={styles.navItem}>
              <Ionicons name="people-outline" size={28} color={PINK} />
              <Text style={[styles.navText, styles.navTextActive]}>Fan</Text>
              <View style={styles.activeDot} />
            </View>

            <View style={styles.navItem}>
              <Ionicons name="musical-note" size={28} color="#8A849D" />
              <Text style={styles.navText}>DJ</Text>
            </View>

            <View style={styles.navItem}>
              <Ionicons name="person-outline" size={27} color="#8A849D" />
              <Text style={styles.navText}>Profil</Text>
            </View>
          </View>
        </View>
      </SafeAreaView>
    </View>
  );
}

const glassBorder = 'rgba(255,255,255,0.10)';

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: BG },
  safe: { flex: 1 },
  page: {
    flex: 1,
    paddingHorizontal: 18,
    paddingTop: Platform.OS === 'android' ? 12 : 6,
    paddingBottom: 8,
  },
  glow: {
    position: 'absolute',
    width: 260,
    height: 260,
    borderRadius: 260,
    opacity: 0.48,
  },
  glowPink: {
    left: -110,
    bottom: 10,
    backgroundColor: 'rgba(255,46,159,0.38)',
  },
  glowBlue: {
    right: -120,
    bottom: 42,
    backgroundColor: 'rgba(0,200,255,0.30)',
  },
  glowPurple: {
    right: -80,
    top: 60,
    backgroundColor: 'rgba(123,44,255,0.24)',
  },
  hero: {
    width: '100%',
    borderRadius: 22,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: glassBorder,
    backgroundColor: '#10081E',
  },
  heroImage: { flex: 1 },
  heroImageRadius: { borderRadius: 22 },
  liveBadge: {
    position: 'absolute',
    top: 20,
    left: 18,
    height: 30,
    paddingHorizontal: 12,
    borderRadius: 8,
    backgroundColor: HOT_PINK,
    alignItems: 'center',
    justifyContent: 'center',
  },
  liveText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  wallet: {
    position: 'absolute',
    top: 14,
    right: 14,
    height: 48,
    paddingHorizontal: 17,
    borderRadius: 26,
    borderWidth: 1,
    borderColor: 'rgba(255,46,159,0.35)',
    backgroundColor: 'rgba(20,10,35,0.68)',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  walletText: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '700',
  },
  djTextBlock: {
    position: 'absolute',
    left: 22,
    bottom: 88,
  },
  djLabel: {
    color: '#FFFFFF',
    fontSize: 30,
    fontWeight: '900',
    opacity: 0.94,
  },
  djName: {
    color: '#FFFFFF',
    fontSize: 38,
    lineHeight: 43,
    fontWeight: '900',
    letterSpacing: 0.4,
  },
  genreRow: {
    marginTop: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  genreText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    opacity: 0.93,
  },
  statsCard: {
    position: 'absolute',
    left: 18,
    bottom: 18,
    width: 260,
    height: 66,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: glassBorder,
    backgroundColor: 'rgba(10,6,24,0.66)',
    flexDirection: 'row',
    alignItems: 'center',
    overflow: 'hidden',
  },
  statItem: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 9,
  },
  statDivider: {
    width: 1,
    height: 44,
    backgroundColor: 'rgba(255,255,255,0.10)',
  },
  statValue: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '800',
  },
  statLabel: {
    color: '#B8B4C8',
    fontSize: 13,
    fontWeight: '600',
    marginTop: -1,
  },
  sectionTitle: {
    textAlign: 'center',
    color: '#B8B4C8',
    fontSize: 12,
    fontWeight: '900',
    letterSpacing: 2.2,
  },
  tipRow: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  tipCircle: {
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.25,
    backgroundColor: 'rgba(255,255,255,0.035)',
  },
  tipCircleActive: {
    borderWidth: 2.5,
    borderColor: PINK,
    shadowColor: PINK,
    shadowOpacity: 0.9,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 0 },
    elevation: 18,
    backgroundColor: 'rgba(255,46,159,0.08)',
  },
  tipText: {
    color: '#FFFFFF',
    fontSize: 28,
    fontWeight: '500',
  },
  tipTextActive: { fontWeight: '900' },
  amountBox: {
    marginTop: 9,
    width: '100%',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: glassBorder,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.045)',
  },
  amountText: {
    color: PINK,
    fontWeight: '900',
    textShadowColor: 'rgba(255,46,159,0.45)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 16,
  },
  infoRow: {
    height: 44,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  moneyIcon: {
    width: 42,
    height: 42,
    borderRadius: 21,
    borderWidth: 2,
    borderColor: PINK,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: PINK,
    shadowOpacity: 0.45,
    shadowRadius: 12,
  },
  moneyIconText: {
    color: PINK,
    fontSize: 22,
    fontWeight: '800',
  },
  moneyTitle: {
    color: '#FFD3EA',
    fontSize: 16,
    fontWeight: '800',
  },
  moneySubtitle: {
    color: 'rgba(255,255,255,0.88)',
    fontSize: 13,
    fontWeight: '600',
  },
  messageBox: {
    marginTop: 12,
    width: '100%',
    borderRadius: 15,
    borderWidth: 1,
    borderColor: glassBorder,
    backgroundColor: 'rgba(255,255,255,0.035)',
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
  },
  messageInput: {
    flex: 1,
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '500',
    paddingVertical: 0,
  },
  counter: {
    color: '#A9A3BA',
    fontSize: 13,
    fontWeight: '600',
    marginLeft: 8,
  },
  actionsRow: {
    flexDirection: 'row',
    gap: 14,
  },
  secondaryButton: {
    width: 112,
    height: '100%',
    borderRadius: 16,
    borderWidth: 1.2,
    borderColor: '#D946EF',
    backgroundColor: 'rgba(255,255,255,0.045)',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 5,
  },
  rechargeButton: {
    borderColor: CYAN,
    backgroundColor: 'rgba(255,255,255,0.035)',
  },
  secondaryButtonText: {
    color: '#FFFFFF',
    textAlign: 'center',
    fontSize: 11.5,
    lineHeight: 14,
    fontWeight: '900',
    letterSpacing: 0.4,
  },
  mainButton: {
    flex: 1,
    height: '100%',
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: PINK,
    shadowOpacity: 0.55,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 0 },
    elevation: 14,
  },
  mainGradient: {
    flex: 1,
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 9,
  },
  mainButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '900',
    letterSpacing: 0.2,
  },
  bottomNav: {
    width: '100%',
    borderRadius: 22,
    borderWidth: 1,
    borderColor: glassBorder,
    backgroundColor: 'rgba(255,255,255,0.035)',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
  },
  navItem: {
    width: 86,
    alignItems: 'center',
    justifyContent: 'center',
  },
  navText: {
    marginTop: 4,
    color: '#8A849D',
    fontSize: 14,
    fontWeight: '700',
  },
  navTextActive: { color: PINK },
  activeDot: {
    marginTop: 6,
    width: 5,
    height: 5,
    borderRadius: 3,
    backgroundColor: PINK,
  },
});
