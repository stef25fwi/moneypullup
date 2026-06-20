import 'package:flutter/material.dart';
import '../../core/models/tip.dart';

const Color kDjBg = Color(0xFF05020D);
const Color kDjPink = Color(0xFFFF2E9F);
const Color kDjHotPink = Color(0xFFFF147F);
const Color kDjCyan = Color(0xFF00C8FF);
const Color kDjPurple = Color(0xFF7B2CFF);
const Color kDjRed = Color(0xFFFF4B6E);
const Color kDjGreen = Color(0xFF22C55E);
const Color kDjGreyText = Color(0xFFB8B4C8);
const Color kDjGreyMuted = Color(0xFF8A849D);

class DjDashboardPage extends StatefulWidget {
  final int currentIndex;
  final ValueChanged<int> onNavChanged;
  final List<Tip> tips;
  final ValueChanged<String> onAcceptTip;
  final ValueChanged<String> onRejectTip;

  const DjDashboardPage({
    super.key,
    required this.currentIndex,
    required this.onNavChanged,
    required this.tips,
    required this.onAcceptTip,
    required this.onRejectTip,
  });

  @override
  State<DjDashboardPage> createState() => _DjDashboardPageState();
}

class _DjDashboardPageState extends State<DjDashboardPage> {
  bool autoMessageEnabled = true;
  String autoMessage = 'Merci pour ton tip !\nJe te dédie le prochain son 🔥';

  List<Tip> get pendingTips =>
      widget.tips.where((tip) => tip.status == TipStatus.pending).toList();

  void _acceptTip(Tip tip) {
    widget.onAcceptTip(tip.id);
    if (!autoMessageEnabled) return;
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Text(
            'Message envoyé à ${tip.fanName} : ${autoMessage.replaceAll('\n', ' ')}'),
        duration: const Duration(seconds: 2),
        backgroundColor: kDjPink,
      ),
    );
  }

  void _rejectTip(Tip tip) {
    widget.onRejectTip(tip.id);
  }

  void _editAutoMessage() {
    final ctrl = TextEditingController(text: autoMessage);
    showDialog(
      context: context,
      builder: (ctx) => AlertDialog(
        backgroundColor: const Color(0xFF10081E),
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
        title: const Text('Message automatique',
            style: TextStyle(color: Colors.white, fontWeight: FontWeight.w800)),
        content: TextField(
          controller: ctrl,
          maxLines: 3,
          autofocus: true,
          style: const TextStyle(color: Colors.white, fontSize: 14),
          decoration: const InputDecoration(
            hintText: 'Votre message...',
            hintStyle: TextStyle(color: Color(0xFFA9A3BA)),
            enabledBorder: UnderlineInputBorder(
              borderSide: BorderSide(color: kDjPurple),
            ),
            focusedBorder: UnderlineInputBorder(
              borderSide: BorderSide(color: kDjPink),
            ),
          ),
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(ctx),
            child: const Text('Annuler',
                style: TextStyle(color: Color(0xFFA9A3BA))),
          ),
          TextButton(
            onPressed: () {
              final text = ctrl.text.trim();
              if (text.isNotEmpty) {
                setState(() => autoMessage = text);
              }
              Navigator.pop(ctx);
            },
            child: const Text('Enregistrer',
                style: TextStyle(color: kDjPink, fontWeight: FontWeight.w800)),
          ),
        ],
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final pending = pendingTips;
    final received =
        widget.tips.where((t) => t.status == TipStatus.accepted).toList();
    final totalReceived = received.fold<int>(0, (sum, t) => sum + t.amount);
    final now = DateTime.now();
    final receivedToday = received
        .where((t) =>
            t.createdAt.year == now.year &&
            t.createdAt.month == now.month &&
            t.createdAt.day == now.day)
        .toList();

    return Scaffold(
      backgroundColor: kDjBg,
      body: Stack(
        children: [
          const Positioned.fill(child: DjNeonBackground()),
          const Positioned(
            left: -140,
            bottom: 40,
            child: DjGlowBlob(color: Color.fromRGBO(255, 46, 159, 0.30)),
          ),
          const Positioned(
            right: -150,
            top: 70,
            child: DjGlowBlob(color: Color.fromRGBO(0, 200, 255, 0.22)),
          ),
          Column(
            children: [
              Expanded(
                child: ListView(
                  padding: const EdgeInsets.only(bottom: 16),
                  physics: const BouncingScrollPhysics(),
                  children: [
                    DjHeroWithStats(
                      pendingCount: pending.length,
                      walletLabel: _fmtEuro(totalReceived),
                      tipsTodayCount: receivedToday.length,
                      acceptedCount: received.length,
                    ),
                    const SizedBox(height: 20),
                    DjPendingHeader(count: pending.length),
                    const SizedBox(height: 12),
                    if (pending.isEmpty)
                      const Padding(
                        padding: EdgeInsets.symmetric(horizontal: 18),
                        child: EmptyTipsCard(),
                      )
                    else ...[
                      for (final tip in pending)
                        Padding(
                          padding: const EdgeInsets.fromLTRB(18, 0, 18, 12),
                          child: PendingTipRow(
                            tip: tip,
                            onAccept: () => _acceptTip(tip),
                            onRefuse: () => _rejectTip(tip),
                          ),
                        ),
                      const Padding(
                        padding: EdgeInsets.fromLTRB(18, 2, 18, 0),
                        child: SwipeHintRow(),
                      ),
                    ],
                    const SizedBox(height: 20),
                    Padding(
                      padding: const EdgeInsets.symmetric(horizontal: 18),
                      child: AutoMessageCard(
                        enabled: autoMessageEnabled,
                        message: autoMessage,
                        onToggle: (v) =>
                            setState(() => autoMessageEnabled = v),
                        onEdit: _editAutoMessage,
                      ),
                    ),
                    const SizedBox(height: 22),
                    const Padding(
                      padding: EdgeInsets.symmetric(horizontal: 18),
                      child: DjSectionTitle("APERÇU AUJOURD'HUI"),
                    ),
                    const SizedBox(height: 12),
                    const Padding(
                      padding: EdgeInsets.symmetric(horizontal: 18),
                      child: DjOverviewRow(),
                    ),
                  ],
                ),
              ),
              SafeArea(
                top: false,
                child: Padding(
                  padding: const EdgeInsets.fromLTRB(18, 8, 18, 8),
                  child: DjBottomNav(
                    currentIndex: widget.currentIndex,
                    onChanged: widget.onNavChanged,
                  ),
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }
}

class DjNeonBackground extends StatelessWidget {
  const DjNeonBackground({super.key});

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
        ),
      ),
    );
  }
}

class DjGlowBlob extends StatelessWidget {
  final Color color;

  const DjGlowBlob({super.key, required this.color});

  @override
  Widget build(BuildContext context) {
    return Container(
      width: 280,
      height: 280,
      decoration: BoxDecoration(
        color: color,
        shape: BoxShape.circle,
      ),
    );
  }
}

class DjHeroWithStats extends StatelessWidget {
  final int pendingCount;
  final String walletLabel;
  final int tipsTodayCount;
  final int acceptedCount;

  const DjHeroWithStats({
    super.key,
    required this.pendingCount,
    required this.walletLabel,
    required this.tipsTodayCount,
    required this.acceptedCount,
  });

  @override
  Widget build(BuildContext context) {
    final topInset = MediaQuery.of(context).padding.top;
    final compact = MediaQuery.of(context).size.height <= 860;
    final heroHeight = (compact ? 280.0 : 320.0) + topInset;
    const statsHeight = 92.0;
    const overlap = 38.0;

    return SizedBox(
      height: heroHeight + statsHeight - overlap,
      child: Stack(
        children: [
          Positioned(
            top: 0,
            left: 0,
            right: 0,
            height: heroHeight,
            child: DjHeroHeader(
                heroHeight: heroHeight,
                topInset: topInset,
                walletLabel: walletLabel),
          ),
          Positioned(
            left: 18,
            right: 18,
            bottom: 0,
            height: statsHeight,
            child: DjStatsBar(
              pendingCount: pendingCount,
              walletLabel: walletLabel,
              tipsTodayCount: tipsTodayCount,
              acceptedCount: acceptedCount,
            ),
          ),
        ],
      ),
    );
  }
}

class DjHeroHeader extends StatelessWidget {
  final double heroHeight;
  final double topInset;
  final String walletLabel;

  const DjHeroHeader({
    super.key,
    required this.heroHeight,
    required this.topInset,
    required this.walletLabel,
  });

  @override
  Widget build(BuildContext context) {
    return SizedBox(
      height: heroHeight,
      child: Stack(
        fit: StackFit.expand,
        children: [
          Image.asset(
            'assets/images/bg_club.png',
            fit: BoxFit.cover,
            alignment: Alignment.center,
          ),
          const DecoratedBox(
            decoration: BoxDecoration(
              gradient: LinearGradient(
                begin: Alignment.topCenter,
                end: Alignment.bottomCenter,
                stops: [0.0, 0.45, 0.8, 1.0],
                colors: [
                  Color.fromRGBO(5, 2, 13, 0.10),
                  Color.fromRGBO(5, 2, 13, 0.25),
                  Color.fromRGBO(5, 2, 13, 0.85),
                  Color(0xFF05020D),
                ],
              ),
            ),
          ),
          Positioned(
            top: topInset + 10,
            left: 18,
            child: Container(
              height: 30,
              padding: const EdgeInsets.symmetric(horizontal: 12),
              alignment: Alignment.center,
              decoration: BoxDecoration(
                color: kDjHotPink,
                borderRadius: BorderRadius.circular(15),
              ),
              child: const Text(
                '● LIVE',
                style: TextStyle(
                  color: Colors.white,
                  fontSize: 12,
                  fontWeight: FontWeight.w900,
                  letterSpacing: 0.5,
                ),
              ),
            ),
          ),
          Positioned(
            top: topInset + 6,
            right: 18,
            child: Container(
              height: 40,
              padding: const EdgeInsets.symmetric(horizontal: 14),
              decoration: BoxDecoration(
                color: const Color.fromRGBO(20, 10, 35, 0.68),
                borderRadius: BorderRadius.circular(22),
                border: Border.all(color: kDjPink.withValues(alpha: 0.35)),
              ),
              child: Row(
                children: [
                  const Icon(Icons.account_balance_wallet_outlined,
                      color: kDjPink, size: 18),
                  const SizedBox(width: 8),
                  Text(
                    walletLabel,
                    style: const TextStyle(
                      color: Colors.white,
                      fontSize: 15,
                      fontWeight: FontWeight.w700,
                    ),
                  ),
                ],
              ),
            ),
          ),
          const Positioned(
            left: 22,
            bottom: 64,
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  'DJ',
                  style: TextStyle(
                    color: Colors.white,
                    fontSize: 28,
                    height: 1.05,
                    fontWeight: FontWeight.w900,
                  ),
                ),
                Text(
                  'MASTER BEAT',
                  style: TextStyle(
                    color: Colors.white,
                    fontSize: 36,
                    height: 1.08,
                    fontWeight: FontWeight.w900,
                    letterSpacing: 0.4,
                  ),
                ),
                SizedBox(height: 8),
                Row(
                  children: [
                    Icon(Icons.graphic_eq, color: kDjPink, size: 18),
                    SizedBox(width: 8),
                    Text(
                      'House • Techno • Live Set',
                      style: TextStyle(
                        color: Colors.white,
                        fontSize: 15,
                        fontWeight: FontWeight.w600,
                      ),
                    ),
                  ],
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}

/// Formats euros as "1 245,00 €" (thin-space thousands, comma decimal).
String _fmtEuro(num value) {
  final fixed = value.toStringAsFixed(2);
  final dotIndex = fixed.indexOf('.');
  final intPart = fixed.substring(0, dotIndex);
  final decPart = fixed.substring(dotIndex + 1);
  final buffer = StringBuffer();
  for (var i = 0; i < intPart.length; i++) {
    if (i > 0 && (intPart.length - i) % 3 == 0) buffer.write(' ');
    buffer.write(intPart[i]);
  }
  return '$buffer,$decPart €';
}

class DjStatsBar extends StatelessWidget {
  final int pendingCount;
  final String walletLabel;
  final int tipsTodayCount;
  final int acceptedCount;

  const DjStatsBar({
    super.key,
    required this.pendingCount,
    required this.walletLabel,
    required this.tipsTodayCount,
    required this.acceptedCount,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(vertical: 12),
      decoration: BoxDecoration(
        color: const Color.fromRGBO(13, 8, 26, 0.92),
        borderRadius: BorderRadius.circular(20),
        border: Border.all(color: Colors.white.withValues(alpha: 0.10)),
      ),
      child: Row(
        children: [
          Expanded(
            child: DjStatCell(
              icon: Icons.card_giftcard,
              iconColor: kDjPink,
              label: 'Tips reçus',
              value: '$tipsTodayCount',
              valueColor: Colors.white,
              sub: "aujourd'hui",
            ),
          ),
          const DjStatDivider(),
          Expanded(
            child: DjStatCell(
              icon: Icons.schedule,
              iconColor: kDjPink,
              label: 'En attente',
              value: '$pendingCount',
              valueColor: kDjPink,
            ),
          ),
          const DjStatDivider(),
          Expanded(
            child: DjStatCell(
              icon: Icons.check_circle_outline,
              iconColor: kDjCyan,
              label: 'Acceptés',
              value: '$acceptedCount',
              valueColor: Colors.white,
            ),
          ),
          const DjStatDivider(),
          Expanded(
            child: DjStatCell(
              icon: Icons.account_balance_wallet_outlined,
              iconColor: kDjPink,
              label: 'Solde wallet',
              value: walletLabel,
              valueColor: Colors.white,
              valueSize: 15,
            ),
          ),
        ],
      ),
    );
  }
}

class DjStatCell extends StatelessWidget {
  final IconData icon;
  final Color iconColor;
  final String label;
  final String value;
  final Color valueColor;
  final double valueSize;
  final String? sub;

  const DjStatCell({
    super.key,
    required this.icon,
    required this.iconColor,
    required this.label,
    required this.value,
    required this.valueColor,
    this.valueSize = 20,
    this.sub,
  });

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 9),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          FittedBox(
            fit: BoxFit.scaleDown,
            child: Row(
              mainAxisSize: MainAxisSize.min,
              children: [
                Icon(icon, color: iconColor, size: 13),
                const SizedBox(width: 4),
                Text(
                  label,
                  maxLines: 1,
                  style: const TextStyle(
                    color: kDjGreyText,
                    fontSize: 10,
                    fontWeight: FontWeight.w600,
                  ),
                ),
              ],
            ),
          ),
          const SizedBox(height: 4),
          FittedBox(
            fit: BoxFit.scaleDown,
            child: Text(
              value,
              maxLines: 1,
              style: TextStyle(
                color: valueColor,
                fontSize: valueSize,
                fontWeight: FontWeight.w900,
              ),
            ),
          ),
          if (sub != null) ...[
            const SizedBox(height: 2),
            Text(
              sub!,
              maxLines: 1,
              style: const TextStyle(
                color: kDjGreyMuted,
                fontSize: 9,
                fontWeight: FontWeight.w600,
              ),
            ),
          ],
        ],
      ),
    );
  }
}

class DjStatDivider extends StatelessWidget {
  const DjStatDivider({super.key});

  @override
  Widget build(BuildContext context) {
    return Container(
      width: 1,
      margin: const EdgeInsets.symmetric(vertical: 8),
      color: Colors.white.withValues(alpha: 0.10),
    );
  }
}

class DjPendingHeader extends StatelessWidget {
  final int count;

  const DjPendingHeader({super.key, required this.count});

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 18),
      child: Row(
        children: [
          const Flexible(
            child: FittedBox(
              fit: BoxFit.scaleDown,
              child: DjSectionTitle('TIPS EN ATTENTE'),
            ),
          ),
          const SizedBox(width: 8),
          Container(
            height: 20,
            padding: const EdgeInsets.symmetric(horizontal: 8),
            alignment: Alignment.center,
            decoration: BoxDecoration(
              color: kDjHotPink,
              borderRadius: BorderRadius.circular(10),
            ),
            child: Text(
              '$count',
              style: const TextStyle(
                color: Colors.white,
                fontSize: 11,
                fontWeight: FontWeight.w900,
              ),
            ),
          ),
          const Spacer(),
          const Text(
            'Voir tout ›',
            style: TextStyle(
              color: kDjGreyMuted,
              fontSize: 12,
              fontWeight: FontWeight.w600,
            ),
          ),
        ],
      ),
    );
  }
}

class DjSectionTitle extends StatelessWidget {
  final String text;

  const DjSectionTitle(this.text, {super.key});

  @override
  Widget build(BuildContext context) {
    return Text(
      text,
      style: const TextStyle(
        color: kDjGreyText,
        fontSize: 12,
        fontWeight: FontWeight.w900,
        letterSpacing: 2.0,
      ),
    );
  }
}

class PendingTipRow extends StatelessWidget {
  final Tip tip;
  final VoidCallback onAccept;
  final VoidCallback onRefuse;

  const PendingTipRow({
    super.key,
    required this.tip,
    required this.onAccept,
    required this.onRefuse,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(10),
      decoration: BoxDecoration(
        borderRadius: BorderRadius.circular(26),
        border: Border.all(color: Colors.white.withValues(alpha: 0.06)),
        gradient: const LinearGradient(
          begin: Alignment.centerLeft,
          end: Alignment.centerRight,
          colors: [
            Color.fromRGBO(255, 46, 159, 0.10),
            Color.fromRGBO(20, 10, 35, 0.55),
            Color.fromRGBO(0, 200, 255, 0.10),
          ],
        ),
      ),
      child: Row(
        children: [
          SwipeActionColumn(
            color: kDjRed,
            icon: Icons.close_rounded,
            label: 'Refuser',
            onTap: onRefuse,
          ),
          const SizedBox(width: 8),
          Expanded(
            child: Dismissible(
              key: ValueKey(tip.id),
              direction: DismissDirection.horizontal,
              onDismissed: (direction) {
                if (direction == DismissDirection.startToEnd) {
                  onAccept();
                } else {
                  onRefuse();
                }
              },
              child: PendingTipCard(tip: tip),
            ),
          ),
          const SizedBox(width: 8),
          SwipeActionColumn(
            color: kDjCyan,
            icon: Icons.check_rounded,
            label: 'Accepter',
            onTap: onAccept,
          ),
        ],
      ),
    );
  }
}

class SwipeActionColumn extends StatelessWidget {
  final Color color;
  final IconData icon;
  final String label;
  final VoidCallback onTap;

  const SwipeActionColumn({
    super.key,
    required this.color,
    required this.icon,
    required this.label,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onTap,
      child: SizedBox(
        width: 58,
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Container(
              width: 44,
              height: 44,
              alignment: Alignment.center,
              decoration: BoxDecoration(
                shape: BoxShape.circle,
                color: color.withValues(alpha: 0.16),
                border: Border.all(color: color.withValues(alpha: 0.65)),
                boxShadow: [
                  BoxShadow(
                    color: color.withValues(alpha: 0.45),
                    blurRadius: 14,
                  ),
                ],
              ),
              child: Icon(icon, color: color, size: 22),
            ),
            const SizedBox(height: 6),
            Text(
              label,
              style: const TextStyle(
                color: Colors.white,
                fontSize: 11,
                fontWeight: FontWeight.w700,
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class PendingTipCard extends StatelessWidget {
  final Tip tip;

  const PendingTipCard({super.key, required this.tip});

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(
        color: const Color(0xFF14091F),
        borderRadius: BorderRadius.circular(20),
        border: Border.all(color: kDjPink.withValues(alpha: 0.25)),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Container(
                width: 46,
                height: 46,
                alignment: Alignment.center,
                decoration: BoxDecoration(
                  shape: BoxShape.circle,
                  color: kDjPink.withValues(alpha: 0.16),
                  border: Border.all(color: kDjPink.withValues(alpha: 0.65)),
                ),
                child: Text(
                  tip.fanName.substring(0, 1).toUpperCase(),
                  style: const TextStyle(
                    color: kDjPink,
                    fontSize: 20,
                    fontWeight: FontWeight.w900,
                  ),
                ),
              ),
              const SizedBox(width: 10),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      tip.fanName,
                      maxLines: 1,
                      overflow: TextOverflow.ellipsis,
                      style: const TextStyle(
                        color: Colors.white,
                        fontSize: 16,
                        fontWeight: FontWeight.w800,
                      ),
                    ),
                    if (tip.fanHandle.isNotEmpty)
                      Text(
                        tip.fanHandle,
                        maxLines: 1,
                        overflow: TextOverflow.ellipsis,
                        style: const TextStyle(
                          color: kDjGreyMuted,
                          fontSize: 12,
                          fontWeight: FontWeight.w600,
                        ),
                      ),
                  ],
                ),
              ),
              Text(
                '${tip.amount} €',
                style: const TextStyle(
                  color: kDjPink,
                  fontSize: 22,
                  fontWeight: FontWeight.w900,
                ),
              ),
            ],
          ),
          const SizedBox(height: 10),
          Text(
            tip.message,
            maxLines: 2,
            overflow: TextOverflow.ellipsis,
            style: const TextStyle(
              color: Color(0xFFE8E4F2),
              fontSize: 13,
              height: 1.35,
              fontWeight: FontWeight.w500,
            ),
          ),
          const SizedBox(height: 10),
          Container(
            height: 24,
            padding: const EdgeInsets.symmetric(horizontal: 10),
            decoration: BoxDecoration(
              color: kDjPink.withValues(alpha: 0.12),
              borderRadius: BorderRadius.circular(12),
            ),
            child: const Row(
              mainAxisSize: MainAxisSize.min,
              children: [
                Icon(Icons.schedule, color: kDjPink, size: 12),
                SizedBox(width: 5),
                Text(
                  'En attente',
                  style: TextStyle(
                    color: kDjPink,
                    fontSize: 11,
                    fontWeight: FontWeight.w700,
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

class SwipeHintRow extends StatelessWidget {
  const SwipeHintRow({super.key});

  @override
  Widget build(BuildContext context) {
    return Row(
      children: [
        const Icon(Icons.arrow_back, color: kDjPink, size: 14),
        const SizedBox(width: 6),
        const Expanded(
          child: Text(
            'Glisser à gauche\npour refuser',
            style: TextStyle(
              color: kDjPink,
              fontSize: 11,
              height: 1.25,
              fontWeight: FontWeight.w600,
            ),
          ),
        ),
        Row(
          mainAxisSize: MainAxisSize.min,
          children: const [
            Icon(Icons.arrow_back, color: kDjPink, size: 14),
            SizedBox(width: 2),
            Icon(Icons.touch_app_outlined, color: Colors.white, size: 22),
            SizedBox(width: 2),
            Icon(Icons.arrow_forward, color: kDjCyan, size: 14),
          ],
        ),
        const Expanded(
          child: Text(
            'Glisser à droite\npour accepter',
            textAlign: TextAlign.right,
            style: TextStyle(
              color: kDjCyan,
              fontSize: 11,
              height: 1.25,
              fontWeight: FontWeight.w600,
            ),
          ),
        ),
        const SizedBox(width: 6),
        const Icon(Icons.arrow_forward, color: kDjCyan, size: 14),
      ],
    );
  }
}

class AutoMessageCard extends StatelessWidget {
  final bool enabled;
  final String message;
  final ValueChanged<bool> onToggle;
  final VoidCallback onEdit;

  const AutoMessageCard({
    super.key,
    required this.enabled,
    required this.message,
    required this.onToggle,
    required this.onEdit,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Colors.white.withValues(alpha: 0.035),
        borderRadius: BorderRadius.circular(22),
        border: Border.all(color: Colors.white.withValues(alpha: 0.10)),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              const Expanded(child: DjSectionTitle('MESSAGE AUTOMATIQUE')),
              const Text(
                'Active',
                style: TextStyle(
                  color: Colors.white,
                  fontSize: 12,
                  fontWeight: FontWeight.w600,
                ),
              ),
              const SizedBox(width: 4),
              Switch(
                value: enabled,
                onChanged: onToggle,
                activeThumbColor: Colors.white,
                activeTrackColor: kDjPink,
                inactiveThumbColor: kDjGreyMuted,
                inactiveTrackColor: Colors.white.withValues(alpha: 0.10),
              ),
            ],
          ),
          const SizedBox(height: 10),
          Row(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Container(
                width: 54,
                height: 54,
                alignment: Alignment.center,
                decoration: BoxDecoration(
                  shape: BoxShape.circle,
                  border: Border.all(color: kDjPink, width: 1.6),
                  boxShadow: [
                    BoxShadow(
                      color: kDjPink.withValues(alpha: 0.40),
                      blurRadius: 14,
                    ),
                  ],
                ),
                child:
                    const Icon(Icons.chat_bubble_outline, color: kDjPink, size: 24),
              ),
              const SizedBox(width: 12),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    const Text(
                      'Envoyé automatiquement après acceptation',
                      style: TextStyle(
                        color: kDjGreyMuted,
                        fontSize: 11,
                        fontWeight: FontWeight.w600,
                      ),
                    ),
                    const SizedBox(height: 8),
                    Row(
                      crossAxisAlignment: CrossAxisAlignment.center,
                      children: [
                        Expanded(
                          child: Container(
                            padding: const EdgeInsets.all(12),
                            decoration: BoxDecoration(
                              color: Colors.white.withValues(alpha: 0.05),
                              borderRadius: BorderRadius.circular(14),
                            ),
                            child: Text(
                              message,
                              style: const TextStyle(
                                color: Colors.white,
                                fontSize: 13,
                                height: 1.4,
                                fontWeight: FontWeight.w600,
                              ),
                            ),
                          ),
                        ),
                        const SizedBox(width: 10),
                        GestureDetector(
                          onTap: onEdit,
                          child: Container(
                            padding: const EdgeInsets.symmetric(
                                horizontal: 12, vertical: 10),
                            decoration: BoxDecoration(
                              borderRadius: BorderRadius.circular(12),
                              border: Border.all(
                                  color: kDjPink.withValues(alpha: 0.65)),
                            ),
                            child: const Row(
                              mainAxisSize: MainAxisSize.min,
                              children: [
                                Icon(Icons.edit_outlined,
                                    color: kDjPink, size: 14),
                                SizedBox(width: 5),
                                Text(
                                  'Modifier',
                                  style: TextStyle(
                                    color: kDjPink,
                                    fontSize: 12,
                                    fontWeight: FontWeight.w700,
                                  ),
                                ),
                              ],
                            ),
                          ),
                        ),
                      ],
                    ),
                  ],
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }
}

class DjOverviewRow extends StatelessWidget {
  const DjOverviewRow({super.key});

  @override
  Widget build(BuildContext context) {
    return const IntrinsicHeight(
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          Expanded(
            child: DjOverviewCard(
              icon: Icons.trending_up,
              label: 'Tips totaux',
              value: '1 280 €',
              delta: '+8% vs hier',
              deltaColor: kDjGreen,
            ),
          ),
          SizedBox(width: 8),
          Expanded(
            child: DjOverviewCard(
              icon: Icons.euro,
              label: 'Cette semaine',
              value: '982 €',
              delta: '-3% vs hier',
              deltaColor: kDjRed,
            ),
          ),
          SizedBox(width: 8),
          Expanded(
            child: DjOverviewCard(
              icon: Icons.group_outlined,
              label: 'Nouveaux supporters',
              value: '24',
              delta: '+6 vs hier',
              deltaColor: kDjGreen,
            ),
          ),
          SizedBox(width: 8),
          Expanded(
            child: DjTopFanCard(name: 'Maxime', amount: '71 €'),
          ),
        ],
      ),
    );
  }
}

class DjOverviewCard extends StatelessWidget {
  final IconData icon;
  final String label;
  final String value;
  final String delta;
  final Color deltaColor;

  const DjOverviewCard({
    super.key,
    required this.icon,
    required this.label,
    required this.value,
    required this.delta,
    required this.deltaColor,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(10),
      decoration: BoxDecoration(
        color: Colors.white.withValues(alpha: 0.035),
        borderRadius: BorderRadius.circular(18),
        border: Border.all(color: Colors.white.withValues(alpha: 0.10)),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Container(
            width: 30,
            height: 30,
            alignment: Alignment.center,
            decoration: BoxDecoration(
              color: kDjPink.withValues(alpha: 0.12),
              borderRadius: BorderRadius.circular(9),
            ),
            child: Icon(icon, color: kDjPink, size: 16),
          ),
          const SizedBox(height: 8),
          Text(
            label,
            maxLines: 2,
            overflow: TextOverflow.ellipsis,
            style: const TextStyle(
              color: kDjGreyMuted,
              fontSize: 10,
              height: 1.2,
              fontWeight: FontWeight.w600,
            ),
          ),
          const SizedBox(height: 4),
          FittedBox(
            fit: BoxFit.scaleDown,
            child: Text(
              value,
              maxLines: 1,
              style: const TextStyle(
                color: Colors.white,
                fontSize: 16,
                fontWeight: FontWeight.w900,
              ),
            ),
          ),
          const SizedBox(height: 3),
          Text(
            delta,
            maxLines: 1,
            overflow: TextOverflow.ellipsis,
            style: TextStyle(
              color: deltaColor,
              fontSize: 10,
              fontWeight: FontWeight.w700,
            ),
          ),
        ],
      ),
    );
  }
}

class DjTopFanCard extends StatelessWidget {
  final String name;
  final String amount;

  const DjTopFanCard({super.key, required this.name, required this.amount});

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(10),
      decoration: BoxDecoration(
        color: Colors.white.withValues(alpha: 0.035),
        borderRadius: BorderRadius.circular(18),
        border: Border.all(color: Colors.white.withValues(alpha: 0.10)),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Container(
            width: 30,
            height: 30,
            alignment: Alignment.center,
            decoration: BoxDecoration(
              color: kDjPink.withValues(alpha: 0.12),
              borderRadius: BorderRadius.circular(9),
            ),
            child: const Icon(Icons.star_border, color: kDjPink, size: 16),
          ),
          const SizedBox(height: 8),
          const Text(
            'Top fan',
            maxLines: 1,
            style: TextStyle(
              color: kDjGreyMuted,
              fontSize: 10,
              fontWeight: FontWeight.w600,
            ),
          ),
          const SizedBox(height: 4),
          Row(
            children: [
              Container(
                width: 20,
                height: 20,
                alignment: Alignment.center,
                decoration: BoxDecoration(
                  shape: BoxShape.circle,
                  color: kDjPink.withValues(alpha: 0.16),
                  border: Border.all(color: kDjPink.withValues(alpha: 0.55)),
                ),
                child: Text(
                  name.substring(0, 1).toUpperCase(),
                  style: const TextStyle(
                    color: kDjPink,
                    fontSize: 10,
                    fontWeight: FontWeight.w900,
                  ),
                ),
              ),
              const SizedBox(width: 5),
              Expanded(
                child: Text(
                  name,
                  maxLines: 1,
                  overflow: TextOverflow.ellipsis,
                  style: const TextStyle(
                    color: Colors.white,
                    fontSize: 12,
                    fontWeight: FontWeight.w700,
                  ),
                ),
              ),
            ],
          ),
          const SizedBox(height: 3),
          Text(
            amount,
            maxLines: 1,
            style: const TextStyle(
              color: kDjPink,
              fontSize: 13,
              fontWeight: FontWeight.w900,
            ),
          ),
        ],
      ),
    );
  }
}

class EmptyTipsCard extends StatelessWidget {
  const EmptyTipsCard({super.key});

  @override
  Widget build(BuildContext context) {
    return Container(
      height: 130,
      width: double.infinity,
      alignment: Alignment.center,
      decoration: BoxDecoration(
        color: Colors.white.withValues(alpha: 0.045),
        borderRadius: BorderRadius.circular(22),
        border: Border.all(color: Colors.white.withValues(alpha: 0.10)),
      ),
      child: const Text(
        'Aucun tip en attente',
        style: TextStyle(
          color: kDjGreyText,
          fontSize: 16,
          fontWeight: FontWeight.w800,
        ),
      ),
    );
  }
}

class DjBottomNav extends StatelessWidget {
  final int currentIndex;
  final ValueChanged<int> onChanged;

  const DjBottomNav({
    super.key,
    required this.currentIndex,
    required this.onChanged,
  });

  @override
  Widget build(BuildContext context) {
    final compact = MediaQuery.of(context).size.height <= 860;

    return Container(
      height: compact ? 66 : 76,
      decoration: BoxDecoration(
        color: Colors.white.withValues(alpha: 0.035),
        borderRadius: BorderRadius.circular(22),
        border: Border.all(color: Colors.white.withValues(alpha: 0.10)),
      ),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceAround,
        children: [
          DjNavItem(
            active: currentIndex == 1,
            icon: Icons.grid_view_rounded,
            label: 'Dashboard',
            onTap: () => onChanged(1),
          ),
          DjNavItem(
            active: false,
            icon: Icons.favorite_border,
            label: 'Tips',
            onTap: () => onChanged(0),
          ),
          DjNavItem(
            active: false,
            icon: Icons.graphic_eq,
            label: 'Live',
            onTap: () {},
          ),
          DjNavItem(
            active: currentIndex == 2,
            icon: Icons.person_outline,
            label: 'Profil',
            onTap: () => onChanged(2),
          ),
        ],
      ),
    );
  }
}

class DjNavItem extends StatelessWidget {
  final bool active;
  final IconData icon;
  final String label;
  final VoidCallback onTap;

  const DjNavItem({
    super.key,
    required this.active,
    required this.icon,
    required this.label,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    final color = active ? kDjPink : kDjGreyMuted;

    return GestureDetector(
      onTap: onTap,
      behavior: HitTestBehavior.opaque,
      child: SizedBox(
        width: 76,
        child: Center(
          child: FittedBox(
            fit: BoxFit.scaleDown,
            child: Column(
              mainAxisSize: MainAxisSize.min,
              children: [
                Icon(icon, color: color, size: 24),
                const SizedBox(height: 3),
                Text(
                  label,
                  style: TextStyle(
                    color: color,
                    fontSize: 11,
                    fontWeight: FontWeight.w700,
                  ),
                ),
                const SizedBox(height: 4),
                Container(
                  width: 4,
                  height: 4,
                  decoration: BoxDecoration(
                    shape: BoxShape.circle,
                    color: active ? kDjPink : Colors.transparent,
                  ),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}
