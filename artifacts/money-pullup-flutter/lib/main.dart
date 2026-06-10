import 'package:flutter/material.dart';
import 'features/dj/dj_dashboard_page.dart';

void main() {
  runApp(const MoneyPullUpApp());
}

class MoneyPullUpApp extends StatelessWidget {
  const MoneyPullUpApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'Money Pull-Up',
      debugShowCheckedModeBanner: false,
      theme: ThemeData(
        useMaterial3: true,
        brightness: Brightness.dark,
        scaffoldBackgroundColor: kBg,
      ),
      home: const MoneyPullUpShell(),
    );
  }
}

const Color kBg = Color(0xFF05020D);
const Color kPink = Color(0xFFFF2E9F);
const Color kHotPink = Color(0xFFFF147F);
const Color kCyan = Color(0xFF00C8FF);
const Color kPurple = Color(0xFF7B2CFF);
const Color kGreyText = Color(0xFFB8B4C8);
const Color kGreyMuted = Color(0xFF8A849D);

class MoneyPullUpShell extends StatefulWidget {
  const MoneyPullUpShell({super.key});

  @override
  State<MoneyPullUpShell> createState() => _MoneyPullUpShellState();
}

class _MoneyPullUpShellState extends State<MoneyPullUpShell> {
  int index = 0;

  @override
  Widget build(BuildContext context) {
    return IndexedStack(
      index: index,
      children: [
        FanPage(
            currentIndex: index,
            onNavChanged: (v) => setState(() => index = v)),
        DjDashboardPage(
          currentIndex: index,
          onNavChanged: (v) => setState(() => index = v),
        ),
        PlaceholderPage(
          title: 'PROFIL',
          subtitle: 'Connexion, wallet, historique des tips et paramètres.',
          currentIndex: index,
          onNavChanged: (v) => setState(() => index = v),
        ),
      ],
    );
  }
}

class FanPage extends StatefulWidget {
  final int currentIndex;
  final ValueChanged<int> onNavChanged;

  const FanPage({
    super.key,
    required this.currentIndex,
    required this.onNavChanged,
  });

  @override
  State<FanPage> createState() => _FanPageState();
}

class _FanPageState extends State<FanPage> {
  int selectedTip = 10;
  final TextEditingController messageController = TextEditingController();

  @override
  void dispose() {
    messageController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final media = MediaQuery.of(context).size;
    final h = media.height;
    final w = media.width;
    final veryCompact = h < 700;
    final compact = h <= 860;

    final heroHeight = veryCompact
        ? 160.0
        : compact
            ? 244.0
            : 276.0;
    final tipCircle = veryCompact
        ? 56.0
        : compact
            ? 68.0
            : 76.0;
    final amountBox = veryCompact
        ? 60.0
        : compact
            ? 84.0
            : 102.0;
    final actionHeight = veryCompact
        ? 58.0
        : compact
            ? 74.0
            : 84.0;
    final navHeight = veryCompact
        ? 62.0
        : compact
            ? 74.0
            : 84.0;
    final amountFont = veryCompact
        ? 42.0
        : compact
            ? 54.0
            : 66.0;
    final sideButtonWidth = w < 420 ? 72.0 : 112.0;

    return Scaffold(
      body: Stack(
        children: [
          const Positioned.fill(child: NeonBackground()),
          const Positioned(
              left: -110,
              bottom: 10,
              child: GlowBlob(color: Color.fromRGBO(255, 46, 159, 0.38))),
          const Positioned(
              right: -120,
              bottom: 42,
              child: GlowBlob(color: Color.fromRGBO(0, 200, 255, 0.30))),
          const Positioned(
              right: -80,
              top: 60,
              child: GlowBlob(color: Color.fromRGBO(123, 44, 255, 0.24))),
          SafeArea(
            child: Padding(
              padding: EdgeInsets.fromLTRB(
                  18,
                  veryCompact
                      ? 2
                      : compact
                          ? 4
                          : 6,
                  18,
                  veryCompact ? 4 : 8),
              child: Column(
                children: [
                  HeroDjCard(height: heroHeight),
                  SizedBox(
                      height: veryCompact
                          ? 6
                          : compact
                              ? 10
                              : 14),
                  const SectionTitle('CHOISISSEZ VOTRE TIP'),
                  SizedBox(
                      height: veryCompact
                          ? 6
                          : compact
                              ? 10
                              : 14),
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [5, 10, 15, 20].map((tip) {
                      final active = selectedTip == tip;
                      final color = tip == 15
                          ? kCyan
                          : tip == 20
                              ? kPurple
                              : kPink;
                      return TipButton(
                        amount: tip,
                        size: tipCircle,
                        color: color,
                        active: active,
                        onTap: () => setState(() => selectedTip = tip),
                      );
                    }).toList(),
                  ),
                  SizedBox(
                      height: veryCompact
                          ? 6
                          : compact
                              ? 12
                              : 16),
                  const SectionTitle('VOTRE TIP'),
                  const SizedBox(height: 9),
                  AmountBox(
                      height: amountBox,
                      amount: selectedTip,
                      fontSize: amountFont),
                  SizedBox(
                      height: veryCompact
                          ? 4
                          : compact
                              ? 8
                              : 12),
                  const MoneyPullUpInfo(),
                  const SizedBox(height: 12),
                  MessageInput(controller: messageController),
                  SizedBox(
                      height: veryCompact
                          ? 6
                          : compact
                              ? 10
                              : 14),
                  SizedBox(
                    height: actionHeight,
                    child: Row(
                      children: [
                        ActionSideButton(
                          width: sideButtonWidth,
                          borderColor: const Color(0xFFD946EF),
                          icon: Icons.grid_view_rounded,
                          iconColor: const Color(0xFFFF7DCE),
                          label: 'MONTANT\nLIBRE',
                          onTap: () => debugPrint('TODO montant libre'),
                        ),
                        const SizedBox(width: 14),
                        Expanded(
                            child: MainTipButton(
                                onTap: () =>
                                    debugPrint('TODO send tip $selectedTip'))),
                        const SizedBox(width: 14),
                        ActionSideButton(
                          width: sideButtonWidth,
                          borderColor: kCyan,
                          icon: Icons.account_balance_wallet_outlined,
                          iconColor: kCyan,
                          label: 'RECHARGER',
                          onTap: () => debugPrint('TODO recharge'),
                        ),
                      ],
                    ),
                  ),
                  SizedBox(
                      height: veryCompact
                          ? 6
                          : compact
                              ? 10
                              : 14),
                  CustomBottomNav(
                    height: navHeight,
                    currentIndex: widget.currentIndex,
                    onChanged: widget.onNavChanged,
                  ),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }
}

class NeonBackground extends StatelessWidget {
  const NeonBackground({super.key});

  @override
  Widget build(BuildContext context) {
    return const DecoratedBox(
      decoration: BoxDecoration(
        gradient: LinearGradient(
          begin: Alignment.topCenter,
          end: Alignment.bottomCenter,
          colors: [
            Color(0xFF090318),
            Color(0xFF05020D),
            Color(0xFF070015),
            Color(0xFF030814),
          ],
          stops: [0.0, 0.44, 0.72, 1.0],
        ),
      ),
    );
  }
}

class GlowBlob extends StatelessWidget {
  final Color color;
  const GlowBlob({super.key, required this.color});

  @override
  Widget build(BuildContext context) {
    return Container(
      width: 260,
      height: 260,
      decoration: BoxDecoration(shape: BoxShape.circle, color: color),
    );
  }
}

class HeroDjCard extends StatelessWidget {
  final double height;
  const HeroDjCard({super.key, required this.height});

  @override
  Widget build(BuildContext context) {
    return Container(
      height: height,
      clipBehavior: Clip.antiAlias,
      decoration: BoxDecoration(
        color: const Color(0xFF10081E),
        borderRadius: BorderRadius.circular(22),
        border: Border.all(color: Colors.white.withValues(alpha: 0.10)),
      ),
      child: Stack(
        fit: StackFit.expand,
        children: [
          Image.asset('assets/images/dj_hero_fan.png',
              fit: BoxFit.cover, alignment: Alignment.center),
          const DecoratedBox(
            decoration: BoxDecoration(
              gradient: LinearGradient(
                begin: Alignment.topCenter,
                end: Alignment.bottomCenter,
                colors: [
                  Color.fromRGBO(5, 2, 13, 0.08),
                  Color.fromRGBO(5, 2, 13, 0.15),
                  Color.fromRGBO(5, 2, 13, 0.72),
                ],
              ),
            ),
          ),
          Positioned(
            top: 20,
            left: 18,
            child: Container(
              height: 30,
              padding: const EdgeInsets.symmetric(horizontal: 12),
              alignment: Alignment.center,
              decoration: BoxDecoration(
                  color: kHotPink, borderRadius: BorderRadius.circular(8)),
              child: const Text('● LIVE',
                  style: TextStyle(
                      color: Colors.white,
                      fontSize: 12,
                      fontWeight: FontWeight.w900,
                      letterSpacing: 0.5)),
            ),
          ),
          Positioned(
            top: 14,
            right: 14,
            child: Container(
              height: 48,
              padding: const EdgeInsets.symmetric(horizontal: 17),
              decoration: BoxDecoration(
                color: const Color.fromRGBO(20, 10, 35, 0.68),
                borderRadius: BorderRadius.circular(26),
                border: Border.all(color: kPink.withValues(alpha: 0.35)),
              ),
              child: const Row(
                children: [
                  Icon(Icons.account_balance_wallet_outlined,
                      color: kPink, size: 21),
                  SizedBox(width: 10),
                  Text('20,00 €',
                      style: TextStyle(
                          color: Colors.white,
                          fontSize: 17,
                          fontWeight: FontWeight.w700)),
                ],
              ),
            ),
          ),
          const Positioned(
            left: 22,
            bottom: 88,
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text('DJ',
                    style: TextStyle(
                        color: Colors.white,
                        fontSize: 30,
                        fontWeight: FontWeight.w900)),
                Text('MASTER BEAT',
                    style: TextStyle(
                        color: Colors.white,
                        fontSize: 38,
                        height: 1.08,
                        fontWeight: FontWeight.w900,
                        letterSpacing: 0.4)),
                SizedBox(height: 8),
                Row(
                  children: [
                    Icon(Icons.graphic_eq, color: kPink, size: 18),
                    SizedBox(width: 8),
                    Text('House • Techno • Live Set',
                        style: TextStyle(
                            color: Colors.white,
                            fontSize: 16,
                            fontWeight: FontWeight.w600)),
                  ],
                ),
              ],
            ),
          ),
          Positioned(
            left: 18,
            bottom: 18,
            child: Container(
              width: 260,
              height: 66,
              decoration: BoxDecoration(
                color: const Color.fromRGBO(10, 6, 24, 0.66),
                borderRadius: BorderRadius.circular(16),
                border: Border.all(color: Colors.white.withValues(alpha: 0.10)),
              ),
              child: Row(
                children: [
                  const Expanded(
                      child: StatItem(
                          icon: Icons.favorite_border,
                          value: '12.5K',
                          label: 'Fans')),
                  Container(
                      width: 1,
                      height: 44,
                      color: Colors.white.withValues(alpha: 0.10)),
                  const Expanded(
                      child: StatItem(
                          icon: Icons.person_outline,
                          value: '340',
                          label: 'En live')),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }
}

class StatItem extends StatelessWidget {
  final IconData icon;
  final String value;
  final String label;

  const StatItem({
    super.key,
    required this.icon,
    required this.value,
    required this.label,
  });

  @override
  Widget build(BuildContext context) {
    return FittedBox(
      fit: BoxFit.scaleDown,
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Icon(icon, color: kPink, size: 19),
          const SizedBox(width: 5),
          Column(
            mainAxisAlignment: MainAxisAlignment.center,
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                value,
                style: const TextStyle(
                  color: Colors.white,
                  fontSize: 17,
                  fontWeight: FontWeight.w800,
                ),
              ),
              Text(
                label,
                style: const TextStyle(
                  color: kGreyText,
                  fontSize: 12,
                  fontWeight: FontWeight.w600,
                  height: 0.95,
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }
}

class SectionTitle extends StatelessWidget {
  final String text;
  const SectionTitle(this.text, {super.key});

  @override
  Widget build(BuildContext context) {
    return Text(
      text,
      textAlign: TextAlign.center,
      style: const TextStyle(
          color: kGreyText,
          fontSize: 12,
          fontWeight: FontWeight.w900,
          letterSpacing: 2.2),
    );
  }
}

class TipButton extends StatelessWidget {
  final int amount;
  final double size;
  final Color color;
  final bool active;
  final VoidCallback onTap;

  const TipButton({
    super.key,
    required this.amount,
    required this.size,
    required this.color,
    required this.active,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onTap,
      child: AnimatedContainer(
        duration: const Duration(milliseconds: 160),
        width: size,
        height: size,
        alignment: Alignment.center,
        decoration: BoxDecoration(
          shape: BoxShape.circle,
          color: active
              ? const Color.fromRGBO(255, 46, 159, 0.08)
              : const Color.fromRGBO(255, 255, 255, 0.035),
          border: Border.all(
              color: active ? kPink : color, width: active ? 2.5 : 1.25),
          boxShadow: active
              ? [
                  BoxShadow(
                      color: kPink.withValues(alpha: 0.90), blurRadius: 18)
                ]
              : [],
        ),
        child: Text('$amount€',
            style: TextStyle(
                color: Colors.white,
                fontSize: 28,
                fontWeight: active ? FontWeight.w900 : FontWeight.w500)),
      ),
    );
  }
}

class AmountBox extends StatelessWidget {
  final double height;
  final int amount;
  final double fontSize;

  const AmountBox(
      {super.key,
      required this.height,
      required this.amount,
      required this.fontSize});

  @override
  Widget build(BuildContext context) {
    return Container(
      height: height,
      width: double.infinity,
      alignment: Alignment.center,
      decoration: BoxDecoration(
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: Colors.white.withValues(alpha: 0.10)),
        gradient: const LinearGradient(
          colors: [
            Color.fromRGBO(255, 255, 255, 0.06),
            Color.fromRGBO(255, 255, 255, 0.025),
          ],
        ),
      ),
      child: Text(
        '$amount €',
        style: TextStyle(
          color: kPink,
          fontSize: fontSize,
          fontWeight: FontWeight.w900,
          shadows: [
            Shadow(color: kPink.withValues(alpha: 0.45), blurRadius: 16)
          ],
        ),
      ),
    );
  }
}

class MoneyPullUpInfo extends StatelessWidget {
  const MoneyPullUpInfo({super.key});

  @override
  Widget build(BuildContext context) {
    return SizedBox(
      height: 44,
      width: double.infinity,
      child: Row(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Container(
            width: 40,
            height: 40,
            alignment: Alignment.center,
            decoration: BoxDecoration(
              shape: BoxShape.circle,
              border: Border.all(color: kPink, width: 2),
              boxShadow: [
                BoxShadow(
                  color: kPink.withValues(alpha: 0.35),
                  blurRadius: 10,
                ),
              ],
            ),
            child: const Text(
              r'$',
              style: TextStyle(
                color: kPink,
                fontSize: 20,
                fontWeight: FontWeight.w800,
              ),
            ),
          ),
          const SizedBox(width: 10),
          Flexible(
            child: Column(
              mainAxisAlignment: MainAxisAlignment.center,
              crossAxisAlignment: CrossAxisAlignment.start,
              children: const [
                Text(
                  'Money Pull-up',
                  maxLines: 1,
                  overflow: TextOverflow.ellipsis,
                  style: TextStyle(
                    color: Color(0xFFFFD3EA),
                    fontSize: 15,
                    fontWeight: FontWeight.w800,
                  ),
                ),
                Text(
                  'Le soutien qui fait monter le son.',
                  maxLines: 1,
                  overflow: TextOverflow.ellipsis,
                  style: TextStyle(
                    color: Color.fromRGBO(255, 255, 255, 0.88),
                    fontSize: 12,
                    fontWeight: FontWeight.w600,
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}

class MessageInput extends StatefulWidget {
  final TextEditingController controller;
  const MessageInput({super.key, required this.controller});

  @override
  State<MessageInput> createState() => _MessageInputState();
}

class _MessageInputState extends State<MessageInput> {
  @override
  void initState() {
    super.initState();
    widget.controller.addListener(refresh);
  }

  @override
  void dispose() {
    widget.controller.removeListener(refresh);
    super.dispose();
  }

  void refresh() => setState(() {});

  @override
  Widget build(BuildContext context) {
    return Container(
      height: MediaQuery.of(context).size.height < 820 ? 58 : 66,
      padding: const EdgeInsets.symmetric(horizontal: 16),
      decoration: BoxDecoration(
        color: const Color.fromRGBO(255, 255, 255, 0.035),
        borderRadius: BorderRadius.circular(15),
        border: Border.all(color: Colors.white.withValues(alpha: 0.10)),
      ),
      child: Row(
        children: [
          Expanded(
            child: TextField(
              controller: widget.controller,
              maxLength: 120,
              style: const TextStyle(
                  color: Colors.white,
                  fontSize: 14,
                  fontWeight: FontWeight.w500),
              decoration: const InputDecoration(
                counterText: '',
                border: InputBorder.none,
                hintText: 'Un message pour le DJ... (optionnel)',
                hintStyle: TextStyle(
                    color: Color(0xFFA9A3BA),
                    fontSize: 14,
                    fontWeight: FontWeight.w500),
              ),
            ),
          ),
          const SizedBox(width: 8),
          Text('${widget.controller.text.length}/120',
              style: const TextStyle(
                  color: Color(0xFFA9A3BA),
                  fontSize: 13,
                  fontWeight: FontWeight.w600)),
        ],
      ),
    );
  }
}

class ActionSideButton extends StatelessWidget {
  final double width;
  final Color borderColor;
  final IconData icon;
  final Color iconColor;
  final String label;
  final VoidCallback onTap;

  const ActionSideButton({
    super.key,
    required this.width,
    required this.borderColor,
    required this.icon,
    required this.iconColor,
    required this.label,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    return SizedBox(
      width: width,
      child: GestureDetector(
        onTap: onTap,
        child: Container(
          alignment: Alignment.center,
          decoration: BoxDecoration(
            color: const Color.fromRGBO(255, 255, 255, 0.045),
            borderRadius: BorderRadius.circular(16),
            border: Border.all(color: borderColor, width: 1.2),
          ),
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Icon(icon, color: iconColor, size: 25),
              const SizedBox(height: 5),
              Text(label,
                  textAlign: TextAlign.center,
                  style: const TextStyle(
                      color: Colors.white,
                      fontSize: 11.5,
                      height: 1.15,
                      fontWeight: FontWeight.w900,
                      letterSpacing: 0.4)),
            ],
          ),
        ),
      ),
    );
  }
}

class MainTipButton extends StatelessWidget {
  final VoidCallback onTap;

  const MainTipButton({super.key, required this.onTap});

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        clipBehavior: Clip.antiAlias,
        decoration: BoxDecoration(
          borderRadius: BorderRadius.circular(16),
          boxShadow: [
            BoxShadow(
              color: kPink.withValues(alpha: 0.45),
              blurRadius: 16,
            ),
          ],
        ),
        child: const DecoratedBox(
          decoration: BoxDecoration(
            gradient: LinearGradient(
              colors: [kPink, kHotPink],
              begin: Alignment.topLeft,
              end: Alignment.bottomRight,
            ),
          ),
          child: Center(
            child: Padding(
              padding: EdgeInsets.symmetric(horizontal: 6),
              child: FittedBox(
                fit: BoxFit.scaleDown,
                child: Row(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    Icon(Icons.flash_on, color: Colors.white, size: 20),
                    SizedBox(width: 6),
                    Text(
                      'ENVOYER LE TIP',
                      maxLines: 1,
                      style: TextStyle(
                        color: Colors.white,
                        fontSize: 13,
                        fontWeight: FontWeight.w900,
                        letterSpacing: 0.1,
                      ),
                    ),
                  ],
                ),
              ),
            ),
          ),
        ),
      ),
    );
  }
}

class CustomBottomNav extends StatelessWidget {
  final double height;
  final int currentIndex;
  final ValueChanged<int> onChanged;

  const CustomBottomNav(
      {super.key,
      required this.height,
      required this.currentIndex,
      required this.onChanged});

  @override
  Widget build(BuildContext context) {
    return Container(
      height: height,
      decoration: BoxDecoration(
        color: const Color.fromRGBO(255, 255, 255, 0.035),
        borderRadius: BorderRadius.circular(22),
        border: Border.all(color: Colors.white.withValues(alpha: 0.10)),
      ),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceAround,
        children: [
          NavItem(
              active: currentIndex == 0,
              icon: Icons.people_outline,
              label: 'Fan',
              onTap: () => onChanged(0)),
          NavItem(
              active: currentIndex == 1,
              icon: Icons.music_note,
              label: 'DJ',
              onTap: () => onChanged(1)),
          NavItem(
              active: currentIndex == 2,
              icon: Icons.person_outline,
              label: 'Profil',
              onTap: () => onChanged(2)),
        ],
      ),
    );
  }
}

class NavItem extends StatelessWidget {
  final bool active;
  final IconData icon;
  final String label;
  final VoidCallback onTap;

  const NavItem(
      {super.key,
      required this.active,
      required this.icon,
      required this.label,
      required this.onTap});

  @override
  Widget build(BuildContext context) {
    final color = active ? kPink : kGreyMuted;

    return GestureDetector(
      onTap: onTap,
      child: SizedBox(
        width: 86,
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(icon, color: color, size: 28),
            const SizedBox(height: 4),
            Text(label,
                style: TextStyle(
                    color: color, fontSize: 14, fontWeight: FontWeight.w700)),
            const SizedBox(height: 6),
            Container(
              width: 5,
              height: 5,
              decoration: BoxDecoration(
                  shape: BoxShape.circle,
                  color: active ? kPink : Colors.transparent),
            ),
          ],
        ),
      ),
    );
  }
}

class PlaceholderPage extends StatelessWidget {
  final String title;
  final String subtitle;
  final int currentIndex;
  final ValueChanged<int> onNavChanged;

  const PlaceholderPage({
    super.key,
    required this.title,
    required this.subtitle,
    required this.currentIndex,
    required this.onNavChanged,
  });

  @override
  Widget build(BuildContext context) {
    final compact = MediaQuery.of(context).size.height < 820;

    return Scaffold(
      body: Stack(
        children: [
          const Positioned.fill(child: NeonBackground()),
          const Positioned(
              left: -110,
              bottom: 10,
              child: GlowBlob(color: Color.fromRGBO(255, 46, 159, 0.32))),
          SafeArea(
            child: Padding(
              padding: const EdgeInsets.fromLTRB(18, 18, 18, 8),
              child: Column(
                children: [
                  Expanded(
                    child: Center(
                      child: Container(
                        width: double.infinity,
                        padding: const EdgeInsets.all(24),
                        decoration: BoxDecoration(
                          color: Colors.white.withValues(alpha: 0.045),
                          borderRadius: BorderRadius.circular(24),
                          border: Border.all(
                              color: Colors.white.withValues(alpha: 0.10)),
                        ),
                        child: Column(
                          mainAxisSize: MainAxisSize.min,
                          children: [
                            Text(title,
                                textAlign: TextAlign.center,
                                style: const TextStyle(
                                    color: Colors.white,
                                    fontSize: 30,
                                    fontWeight: FontWeight.w900)),
                            const SizedBox(height: 12),
                            Text(subtitle,
                                textAlign: TextAlign.center,
                                style: const TextStyle(
                                    color: kGreyText,
                                    fontSize: 15,
                                    fontWeight: FontWeight.w600)),
                          ],
                        ),
                      ),
                    ),
                  ),
                  CustomBottomNav(
                      height: compact ? 74 : 84,
                      currentIndex: currentIndex,
                      onChanged: onNavChanged),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }
}
