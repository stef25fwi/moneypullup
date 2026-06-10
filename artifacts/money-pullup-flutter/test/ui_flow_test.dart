import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:money_pullup_flutter/main.dart';

Future<void> pumpMobileApp(WidgetTester tester) async {
  tester.view.physicalSize = const Size(390, 844);
  tester.view.devicePixelRatio = 1.0;

  addTearDown(() {
    tester.view.resetPhysicalSize();
    tester.view.resetDevicePixelRatio();
  });

  await tester.pumpWidget(const MoneyPullUpApp());
  await tester.pumpAndSettle();
}

void main() {
  testWidgets('Flow UI Fan page loads correctly', (WidgetTester tester) async {
    await pumpMobileApp(tester);

    expect(find.text('MASTER BEAT'), findsOneWidget);
    expect(find.text('CHOISISSEZ VOTRE TIP'), findsOneWidget);
    expect(find.text('VOTRE TIP'), findsOneWidget);
    expect(find.text('10 €'), findsWidgets);
    expect(find.text('ENVOYER LE TIP'), findsOneWidget);
    expect(find.text('Money Pull-up'), findsOneWidget);
    expect(find.text('Le soutien qui fait monter le son.'), findsOneWidget);
  });

  testWidgets('Flow UI Fan tip selection works', (WidgetTester tester) async {
    await pumpMobileApp(tester);

    await tester.tap(find.text('20€').first);
    await tester.pumpAndSettle();
    expect(find.text('20 €'), findsWidgets);

    await tester.tap(find.text('5€').first);
    await tester.pumpAndSettle();
    expect(find.text('5 €'), findsWidgets);
  });

  testWidgets('Flow UI message input works', (WidgetTester tester) async {
    await pumpMobileApp(tester);

    final input = find.byType(TextField).first;
    await tester.enterText(input, 'Big tune DJ !');
    await tester.pumpAndSettle();

    expect(find.text('Big tune DJ !'), findsOneWidget);
    expect(find.text('13/120'), findsOneWidget);
  });

  testWidgets('Flow UI bottom navigation to DJ works',
      (WidgetTester tester) async {
    await pumpMobileApp(tester);

    await tester.tap(find.text('DJ').last);
    await tester.pumpAndSettle();

    expect(find.text('DJ DASHBOARD'), findsWidgets);
    expect(find.text('TIPS EN ATTENTE'), findsWidgets);
  });

  testWidgets('Flow UI bottom navigation to Profil works',
      (WidgetTester tester) async {
    await pumpMobileApp(tester);

    await tester.tap(find.text('Profil').last);
    await tester.pumpAndSettle();

    expect(find.text('PROFIL'), findsWidgets);
  });
}
