import 'package:flutter_test/flutter_test.dart';

import 'package:clinicare/app/app.dart';
import 'package:clinicare/core/constants.dart';

void main() {
  testWidgets('home dashboard is shown on launch', (tester) async {
    await tester.pumpWidget(const ClinicApp());

    expect(find.text(AppConstants.dashboardTitle), findsOneWidget);
    expect(find.text(AppConstants.appName), findsWidgets);
  });
}
