import 'package:flutter/material.dart';

import 'package:clinicare/app/router.dart';
import 'package:clinicare/app/theme.dart';
import 'package:clinicare/core/constants.dart';

class ClinicApp extends StatelessWidget {
  const ClinicApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: AppConstants.appName,
      theme: AppTheme.light(),
      initialRoute: AppRoutes.home,
      onGenerateRoute: AppRouter.onGenerateRoute,
    );
  }
}
