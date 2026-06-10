import 'package:flutter/material.dart';

const Color kDjBg = Color(0xFF05020D);
const Color kDjPink = Color(0xFFFF2E9F);
const Color kDjHotPink = Color(0xFFFF147F);
const Color kDjCyan = Color(0xFF00C8FF);
const Color kDjPurple = Color(0xFF7B2CFF);
const Color kDjGreyText = Color(0xFFB8B4C8);
const Color kDjGreyMuted = Color(0xFF8A849D);

enum DjTipStatus { pending, accepted, refused }

class DjTip {
  final String id;
  final String fanName;
  final int amount;
  final String message;
  final DjTipStatus status;

  const DjTip({
    required this.id,
    required this.fanName,
    required this.amount,
    required this.message,
    required this.status,
  });

  DjTip copyWith({DjTipStatus? status}) {
    return DjTip(
      id: id,
      fanName: fanName,
      amount: amount,
      message: message,
      status: status ?? this.status,
    );
  }
}

class DjDashboardPage extends StatefulWidget {
  final int currentIndex;
  final ValueChanged<int> onNavChanged;

  const DjDashboardPage({
    super.key,
    required this.currentIndex,
    required this.onNavChanged,
  });

  @override
  State<DjDashboardPage> createState() => _DjDashboardPageState();
}

class _DjDashboardPageState extends State<DjDashboardPage> {
  final List<DjTip> tips = const [
    DjTip(
      id: 'tip_1',
      fanName: 'Maya',
      amount: 20,
      message: 'Passe mon son, grosse vibe 🔥',
      status: DjTipStatus.pending,
    ),
    DjTip(
      id: 'tip_2',
      fanName: 'Alex',
      amount: 15,
      message: 'Pull up DJ !',
      status: DjTipStatus.pending,
    ),
    DjTip(
      id: 'tip_3',
      fanName: 'Chris',
      amount: 10,
      message: 'Le set est lourd',
      status: DjTipStatus.accepted,
    ),
    DjTip(
      id: 'tip_4',
      fanName: 'Nina',
      amount: 5,
      message: 'Encore une vibe comme ça',
      status: DjTipStatus.accepted,
    ),
  ];

  List<DjTip> get pendingTips =>
      tips.where((tip) => tip.status == DjTipStatus.pending).toList();

  int get acceptedTotal => tips
      .where((tip) => tip.status == DjTipStatus.accepted)
      .fold(0, (total, tip) => total + tip.amount);

  int get pendingTotal =>
      pendingTips.fold(0, (total, tip) => total + tip.amount);

  void updateTip(String id, DjTipStatus status) {
    final index = tips.indexWhere((tip) => tip.id == id);
    if (index == -1) return;

    setState(() {
      tips[index] = tips[index].copyWith(status: status);
    });
  }

  @override
  Widget build(BuildContext context) {
    final compact = MediaQuery.of(context).size.height < 820;

    return Scaffold(
      backgroundColor: kDjBg,
      body: Stack(
        children: [
          const Positioned.fill(child: DjNeonBackground()),
          const Positioned(
            left: -120,
            bottom: 20,
            child: DjGlowBlob(color: Color.fromRGBO(255, 46, 159, 0.34)),
          ),
          const Positioned(
            right: -130,
            top: 80,
            child: DjGlowBlob(color: Color.fromRGBO(0, 200, 255, 0.24)),
          ),
          SafeArea(
            child: Padding(
              padding: EdgeInsets.fromLTRB(18, compact ? 8 : 14, 18, 8),
              child: Column(
                children: [
                  DjHeaderCard(
                    acceptedTotal: acceptedTotal,
                    pendingTotal: pendingTotal,
                    pendingCount: pendingTips.length,
                  ),
                  SizedBox(height: compact ? 12 : 16),
                  const DjSectionTitle('TIPS EN ATTENTE'),
                  SizedBox(height: compact ? 10 : 14),
                  Expanded(
                    child: pendingTips.isEmpty
                        ? const EmptyTipsCard()
                        : ListView.separated(
                            padding: EdgeInsets.zero,
                            physics: const BouncingScrollPhysics(),
                            itemCount: pendingTips.length,
                            separatorBuilder: (_, __) =>
                                const SizedBox(height: 12),
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
                                    updateTip(tip.id, DjTipStatus.accepted);
                                  } else {
                                    updateTip(tip.id, DjTipStatus.refused);
                                  }
                                },
                                child: DjTipCard(
                                  tip: tip,
                                  onAccept: () =>
                                      updateTip(tip.id, DjTipStatus.accepted),
                                  onRefuse: () =>
                                      updateTip(tip.id, DjTipStatus.refused),
                                ),
                              );
                            },
                          ),
                  ),
                  SizedBox(height: compact ? 10 : 14),
                  DjBottomNav(
                    height: compact ? 74 : 84,
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
    return Container(
      height: 210,
      width: double.infinity,
      padding: const EdgeInsets.all(18),
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
            color: kDjPink.withValues(alpha: 0.24),
            blurRadius: 28,
          ),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              const Text(
                'DJ DASHBOARD',
                style: TextStyle(
                  color: Colors.white,
                  fontSize: 24,
                  fontWeight: FontWeight.w900,
                  letterSpacing: 0.5,
                ),
              ),
              const Spacer(),
              Container(
                height: 30,
                padding: const EdgeInsets.symmetric(horizontal: 12),
                alignment: Alignment.center,
                decoration: BoxDecoration(
                  color: kDjHotPink,
                  borderRadius: BorderRadius.circular(8),
                ),
                child: const Text(
                  '● LIVE',
                  style: TextStyle(
                    color: Colors.white,
                    fontSize: 12,
                    fontWeight: FontWeight.w900,
                  ),
                ),
              ),
            ],
          ),
          const SizedBox(height: 18),
          const Text(
            'Tips reçus',
            style: TextStyle(
              color: kDjGreyText,
              fontSize: 13,
              fontWeight: FontWeight.w800,
              letterSpacing: 1.4,
            ),
          ),
          const SizedBox(height: 4),
          Text(
            '$acceptedTotal €',
            style: const TextStyle(
              color: kDjPink,
              fontSize: 54,
              height: 1,
              fontWeight: FontWeight.w900,
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
              const SizedBox(width: 10),
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
      height: 56,
      padding: const EdgeInsets.symmetric(horizontal: 12),
      decoration: BoxDecoration(
        color: Colors.white.withValues(alpha: 0.045),
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: Colors.white.withValues(alpha: 0.10)),
      ),
      child: Row(
        children: [
          Icon(icon, color: color, size: 22),
          const SizedBox(width: 9),
          Column(
            mainAxisAlignment: MainAxisAlignment.center,
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                value,
                style: const TextStyle(
                  color: Colors.white,
                  fontSize: 18,
                  fontWeight: FontWeight.w900,
                ),
              ),
              Text(
                label,
                style: const TextStyle(
                  color: kDjGreyText,
                  fontSize: 11,
                  fontWeight: FontWeight.w700,
                ),
              ),
            ],
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
        letterSpacing: 2.2,
      ),
    );
  }
}

class DjTipCard extends StatelessWidget {
  final DjTip tip;
  final VoidCallback onAccept;
  final VoidCallback onRefuse;

  const DjTipCard({
    super.key,
    required this.tip,
    required this.onAccept,
    required this.onRefuse,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      height: 146,
      padding: const EdgeInsets.all(16),
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
                width: 48,
                height: 48,
                alignment: Alignment.center,
                decoration: BoxDecoration(
                  shape: BoxShape.circle,
                  color: kDjPink.withValues(alpha: 0.16),
                  border: Border.all(color: kDjPink.withValues(alpha: 0.45)),
                ),
                child: Text(
                  tip.fanName.substring(0, 1).toUpperCase(),
                  style: const TextStyle(
                    color: kDjPink,
                    fontSize: 22,
                    fontWeight: FontWeight.w900,
                  ),
                ),
              ),
              const SizedBox(width: 12),
              Expanded(
                child: Text(
                  tip.fanName,
                  style: const TextStyle(
                    color: Colors.white,
                    fontSize: 18,
                    fontWeight: FontWeight.w900,
                  ),
                ),
              ),
              Text(
                '${tip.amount} €',
                style: const TextStyle(
                  color: kDjPink,
                  fontSize: 28,
                  fontWeight: FontWeight.w900,
                ),
              ),
            ],
          ),
          const SizedBox(height: 10),
          Expanded(
            child: Align(
              alignment: Alignment.centerLeft,
              child: Text(
                tip.message,
                maxLines: 2,
                overflow: TextOverflow.ellipsis,
                style: const TextStyle(
                  color: kDjGreyText,
                  fontSize: 14,
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
              const SizedBox(width: 10),
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
        height: 36,
        alignment: Alignment.center,
        decoration: BoxDecoration(
          color: color.withValues(alpha: 0.13),
          borderRadius: BorderRadius.circular(12),
          border: Border.all(color: color.withValues(alpha: 0.55)),
        ),
        child: Row(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(icon, color: color, size: 18),
            const SizedBox(width: 6),
            Text(
              label,
              style: TextStyle(
                color: color,
                fontSize: 12,
                fontWeight: FontWeight.w900,
              ),
            ),
          ],
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
        color: Color(0xFFFF4B6E).withValues(alpha: 0.22),
        borderRadius: BorderRadius.circular(22),
      ),
      child:
          const Icon(Icons.close_rounded, color: Color(0xFFFF4B6E), size: 34),
    );
  }
}

class EmptyTipsCard extends StatelessWidget {
  const EmptyTipsCard({super.key});

  @override
  Widget build(BuildContext context) {
    return Center(
      child: Container(
        height: 150,
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
            Icon(icon, color: color, size: 28),
            const SizedBox(height: 4),
            Text(
              label,
              style: TextStyle(
                color: color,
                fontSize: 14,
                fontWeight: FontWeight.w700,
              ),
            ),
            const SizedBox(height: 6),
            Container(
              width: 5,
              height: 5,
              decoration: BoxDecoration(
                shape: BoxShape.circle,
                color: active ? kDjPink : Colors.transparent,
              ),
            ),
          ],
        ),
      ),
    );
  }
}
