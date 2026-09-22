import 'package:flutter_test/flutter_test.dart';

import 'package:clinicare/app/app.dart';
import 'package:clinicare/core/constants.dart';
import 'package:clinicare/database/database.dart';

void main() {
  testWidgets('home dashboard is shown on launch', (tester) async {
    final database = AppDatabase();

    await tester.pumpWidget(ClinicApp(database: database));

    expect(find.text(AppConstants.dashboardTitle), findsOneWidget);
    expect(find.text(AppConstants.appName), findsWidgets);

    await database.close();
  });
}
