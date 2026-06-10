import 'package:flutter/material.dart';
import '../../core/models/tip.dart';

const Color kDjBg = Color(0xFF05020D);
const Color kDjPink = Color(0xFFFF2E9F);
const Color kDjHotPink = Color(0xFFFF147F);
const Color kDjCyan = Color(0xFF00C8FF);
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
  List<Tip> get pendingTips =>
      widget.tips.where((tip) => tip.status == TipStatus.pending).toList();

  int get acceptedTotal => widget.tips
      .where((tip) => tip.status == TipStatus.accepted)
      .fold(0, (total, tip) => total + tip.amount);

  int get pendingTotal =>
      pendingTips.fold(0, (total, tip) => total + tip.amount);

  @override
  Widget build(BuildContext context) {
    final h = MediaQuery.of(context).size.height;
    final compact = h <= 860;

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
          SafeArea(
            child: Padding(
              padding: EdgeInsets.fromLTRB(18, compact ? 6 : 14, 18, 8),
              child: Column(
                children: [
                  DjHeaderCard(
                    acceptedTotal: acceptedTotal,
                    pendingTotal: pendingTotal,
                    pendingCount: pendingTips.length,
                  ),
                  SizedBox(height: compact ? 8 : 14),
                  const DjSectionTitle('TIPS EN ATTENTE'),
                  SizedBox(height: compact ? 8 : 12),
                  Expanded(
                    child: pendingTips.isEmpty
                        ? const EmptyTipsCard()
                        : ListView.separated(
                            padding: EdgeInsets.zero,
                            physics: const BouncingScrollPhysics(),
                            itemCount: pendingTips.length,
                            separatorBuilder: (_, __) =>
                                SizedBox(height: compact ? 8 : 12),
                            itemBuilder: (context, index) {
                              final tip = pendingTips[index];

                              return Dismissible(
                                key: ValueKey(tip.id),
                                direction: DismissDirection.horizontal,
                                background: const SwipeAcceptBackground(),
                                secondaryBackground:
                                    const SwipeRefuseBackground(),
                                onDismissed: (direction) {
                                  if (direction ==
                                      DismissDirection.startToEnd) {
                                    widget.onAcceptTip(tip.id);
                                  } else {
                                    widget.onRejectTip(tip.id);
                                  }
                                },
                                child: DjTipCard(
                                  tip: tip,
                                  compact: compact,
                                  onAccept: () => widget.onAcceptTip(tip.id),
                                  onRefuse: () => widget.onRejectTip(tip.id),
                                ),
                              );
                            },
                          ),
                  ),
                  SizedBox(height: compact ? 8 : 12),
                  DjBottomNav(
                    height: compact ? 64 : 78,
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

class DjHeaderCard extends StatelessWidget {
  final int acceptedTotal;
  final int pendingTotal;
  final int pendingCount;

  const DjHeaderCard({
    super.key,
    required this.acceptedTotal,
    required this.pendingTotal,
    required this.pendingCount,
  });

  @override
  Widget build(BuildContext context) {
    final compact = MediaQuery.of(context).size.width < 420;

    return Container(
      height: compact ? 190 : 210,
      width: double.infinity,
      padding: EdgeInsets.all(compact ? 14 : 18),
      decoration: BoxDecoration(
        borderRadius: BorderRadius.circular(24),
        border: Border.all(color: Colors.white.withValues(alpha: 0.10)),
        gradient: const LinearGradient(
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
          colors: [
            Color.fromRGBO(255, 46, 159, 0.18),
            Color.fromRGBO(123, 44, 255, 0.12),
            Color.fromRGBO(0, 200, 255, 0.10),
          ],
        ),
        boxShadow: [
          BoxShadow(
            color: kDjPink.withValues(alpha: 0.20),
            blurRadius: 22,
          ),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              const Expanded(
                child: FittedBox(
                  fit: BoxFit.scaleDown,
                  alignment: Alignment.centerLeft,
                  child: Text(
                    'DJ DASHBOARD',
                    maxLines: 1,
                    style: TextStyle(
                      color: Colors.white,
                      fontSize: 24,
                      fontWeight: FontWeight.w900,
                      letterSpacing: 0.2,
                    ),
                  ),
                ),
              ),
              const SizedBox(width: 8),
              Container(
                height: 26,
                padding: const EdgeInsets.symmetric(horizontal: 9),
                alignment: Alignment.center,
                decoration: BoxDecoration(
                  color: kDjHotPink,
                  borderRadius: BorderRadius.circular(8),
                ),
                child: const Text(
                  '● LIVE',
                  style: TextStyle(
                    color: Colors.white,
                    fontSize: 10,
                    fontWeight: FontWeight.w900,
                  ),
                ),
              ),
            ],
          ),
          const SizedBox(height: 12),
          const Text(
            'Tips reçus',
            style: TextStyle(
              color: kDjGreyText,
              fontSize: 12,
              fontWeight: FontWeight.w800,
              letterSpacing: 1.2,
            ),
          ),
          const SizedBox(height: 2),
          FittedBox(
            fit: BoxFit.scaleDown,
            alignment: Alignment.centerLeft,
            child: Text(
              '$acceptedTotal €',
              style: const TextStyle(
                color: kDjPink,
                fontSize: 44,
                height: 1,
                fontWeight: FontWeight.w900,
              ),
            ),
          ),
          const Spacer(),
          Row(
            children: [
              Expanded(
                child: DjMiniStat(
                  label: 'En attente',
                  value: '$pendingCount',
                  icon: Icons.notifications_active_outlined,
                  color: kDjPink,
                ),
              ),
              const SizedBox(width: 8),
              Expanded(
                child: DjMiniStat(
                  label: 'À valider',
                  value: '$pendingTotal €',
                  icon: Icons.account_balance_wallet_outlined,
                  color: kDjCyan,
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }
}

class DjMiniStat extends StatelessWidget {
  final String label;
  final String value;
  final IconData icon;
  final Color color;

  const DjMiniStat({
    super.key,
    required this.label,
    required this.value,
    required this.icon,
    required this.color,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      height: 50,
      padding: const EdgeInsets.symmetric(horizontal: 7),
      decoration: BoxDecoration(
        color: Colors.white.withValues(alpha: 0.045),
        borderRadius: BorderRadius.circular(15),
        border: Border.all(color: Colors.white.withValues(alpha: 0.10)),
      ),
      child: FittedBox(
        fit: BoxFit.scaleDown,
        child: Row(
          mainAxisSize: MainAxisSize.min,
          children: [
            Icon(icon, color: color, size: 18),
            const SizedBox(width: 5),
            Column(
              mainAxisAlignment: MainAxisAlignment.center,
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  value,
                  maxLines: 1,
                  style: const TextStyle(
                    color: Colors.white,
                    fontSize: 16,
                    fontWeight: FontWeight.w900,
                  ),
                ),
                Text(
                  label,
                  maxLines: 1,
                  style: const TextStyle(
                    color: kDjGreyText,
                    fontSize: 10,
                    fontWeight: FontWeight.w700,
                    height: 1,
                  ),
                ),
              ],
            ),
          ],
        ),
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

class DjTipCard extends StatelessWidget {
  final Tip tip;
  final bool compact;
  final VoidCallback onAccept;
  final VoidCallback onRefuse;

  const DjTipCard({
    super.key,
    required this.tip,
    required this.compact,
    required this.onAccept,
    required this.onRefuse,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      height: compact ? 126 : 146,
      padding: EdgeInsets.all(compact ? 12 : 16),
      decoration: BoxDecoration(
        color: Colors.white.withValues(alpha: 0.045),
        borderRadius: BorderRadius.circular(22),
        border: Border.all(color: Colors.white.withValues(alpha: 0.10)),
      ),
      child: Column(
        children: [
          Row(
            children: [
              Container(
                width: compact ? 42 : 48,
                height: compact ? 42 : 48,
                alignment: Alignment.center,
                decoration: BoxDecoration(
                  shape: BoxShape.circle,
                  color: kDjPink.withValues(alpha: 0.16),
                  border: Border.all(color: kDjPink.withValues(alpha: 0.45)),
                ),
                child: Text(
                  tip.fanName.substring(0, 1).toUpperCase(),
                  style: TextStyle(
                    color: kDjPink,
                    fontSize: compact ? 19 : 22,
                    fontWeight: FontWeight.w900,
                  ),
                ),
              ),
              const SizedBox(width: 10),
              Expanded(
                child: Text(
                  tip.fanName,
                  maxLines: 1,
                  overflow: TextOverflow.ellipsis,
                  style: TextStyle(
                    color: Colors.white,
                    fontSize: compact ? 16 : 18,
                    fontWeight: FontWeight.w900,
                  ),
                ),
              ),
              Text(
                '${tip.amount} €',
                style: TextStyle(
                  color: kDjPink,
                  fontSize: compact ? 24 : 28,
                  fontWeight: FontWeight.w900,
                ),
              ),
            ],
          ),
          const SizedBox(height: 8),
          Expanded(
            child: Align(
              alignment: Alignment.centerLeft,
              child: Text(
                tip.message,
                maxLines: 1,
                overflow: TextOverflow.ellipsis,
                style: const TextStyle(
                  color: kDjGreyText,
                  fontSize: 13,
                  fontWeight: FontWeight.w600,
                ),
              ),
            ),
          ),
          Row(
            children: [
              Expanded(
                child: DjDecisionButton(
                  label: 'REFUSER',
                  icon: Icons.close_rounded,
                  color: const Color(0xFFFF4B6E),
                  onTap: onRefuse,
                ),
              ),
              const SizedBox(width: 8),
              Expanded(
                child: DjDecisionButton(
                  label: 'ACCEPTER',
                  icon: Icons.check_rounded,
                  color: kDjCyan,
                  onTap: onAccept,
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }
}

class DjDecisionButton extends StatelessWidget {
  final String label;
  final IconData icon;
  final Color color;
  final VoidCallback onTap;

  const DjDecisionButton({
    super.key,
    required this.label,
    required this.icon,
    required this.color,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        height: 32,
        alignment: Alignment.center,
        decoration: BoxDecoration(
          color: color.withValues(alpha: 0.13),
          borderRadius: BorderRadius.circular(12),
          border: Border.all(color: color.withValues(alpha: 0.55)),
        ),
        child: FittedBox(
          fit: BoxFit.scaleDown,
          child: Row(
            mainAxisSize: MainAxisSize.min,
            children: [
              Icon(icon, color: color, size: 17),
              const SizedBox(width: 5),
              Text(
                label,
                style: TextStyle(
                  color: color,
                  fontSize: 11,
                  fontWeight: FontWeight.w900,
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}

class SwipeAcceptBackground extends StatelessWidget {
  const SwipeAcceptBackground({super.key});

  @override
  Widget build(BuildContext context) {
    return Container(
      alignment: Alignment.centerLeft,
      padding: const EdgeInsets.only(left: 24),
      decoration: BoxDecoration(
        color: kDjCyan.withValues(alpha: 0.22),
        borderRadius: BorderRadius.circular(22),
      ),
      child: const Icon(Icons.check_rounded, color: kDjCyan, size: 34),
    );
  }
}

class SwipeRefuseBackground extends StatelessWidget {
  const SwipeRefuseBackground({super.key});

  @override
  Widget build(BuildContext context) {
    return Container(
      alignment: Alignment.centerRight,
      padding: const EdgeInsets.only(right: 24),
      decoration: BoxDecoration(
        color: const Color(0xFFFF4B6E).withValues(alpha: 0.22),
        borderRadius: BorderRadius.circular(22),
      ),
      child: const Icon(
        Icons.close_rounded,
        color: Color(0xFFFF4B6E),
        size: 34,
      ),
    );
  }
}

class EmptyTipsCard extends StatelessWidget {
  const EmptyTipsCard({super.key});

  @override
  Widget build(BuildContext context) {
    return Center(
      child: Container(
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
      ),
    );
  }
}

class DjBottomNav extends StatelessWidget {
  final double height;
  final int currentIndex;
  final ValueChanged<int> onChanged;

  const DjBottomNav({
    super.key,
    required this.height,
    required this.currentIndex,
    required this.onChanged,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      height: height,
      decoration: BoxDecoration(
        color: Colors.white.withValues(alpha: 0.035),
        borderRadius: BorderRadius.circular(22),
        border: Border.all(color: Colors.white.withValues(alpha: 0.10)),
      ),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceAround,
        children: [
          DjNavItem(
            active: currentIndex == 0,
            icon: Icons.people_outline,
            label: 'Fan',
            onTap: () => onChanged(0),
          ),
          DjNavItem(
            active: currentIndex == 1,
            icon: Icons.music_note,
            label: 'DJ',
            onTap: () => onChanged(1),
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
      child: SizedBox(
        width: 86,
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(icon, color: color, size: 25),
            const SizedBox(height: 3),
            Text(
              label,
              style: TextStyle(
                color: color,
                fontSize: 12,
                fontWeight: FontWeight.w700,
              ),
            ),
          ],
        ),
      ),
    );
  }
}
