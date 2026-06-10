import 'package:flutter_test/flutter_test.dart';
import 'package:money_pullup_flutter/main.dart';

void main() {
  testWidgets('Money Pull-Up app starts', (WidgetTester tester) async {
    await tester.pumpWidget(const MoneyPullUpApp());

    expect(find.text('MASTER BEAT'), findsOneWidget);
    expect(find.text('ENVOYER LE TIP'), findsOneWidget);
    expect(find.text('Money Pull-up'), findsOneWidget);
  });
}
