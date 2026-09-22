import 'package:flutter/material.dart';

import 'package:clinicare/app/router.dart';
import 'package:clinicare/app/theme.dart';
import 'package:clinicare/core/constants.dart';
import 'package:clinicare/database/database.dart';

class ClinicApp extends StatefulWidget {
  final AppDatabase? database;
  const ClinicApp({super.key, this.database});

  @override
  State<ClinicApp> createState() => _ClinicAppState();
}

class _ClinicAppState extends State<ClinicApp> {
  late final AppDatabase _database;
  late final AppRouter _router;

  @override
  void initState() {
    super.initState();
    _database = widget.database ?? AppDatabase();
    _router = AppRouter(_database);
  }

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: AppConstants.appName,
      theme: AppTheme.light(),
      initialRoute: AppRoutes.home,
      onGenerateRoute: _router.onGenerateRoute,
    );
  }
}
