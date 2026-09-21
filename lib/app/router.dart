import 'package:flutter/material.dart';

import 'package:clinicare/features/dashboard/dashboard_screen.dart';

abstract final class AppRoutes {
  static const home = '/';
}

abstract final class AppRouter {
  static Route<dynamic> onGenerateRoute(RouteSettings settings) {
    switch (settings.name) {
      case AppRoutes.home:
        return MaterialPageRoute<void>(
          settings: settings,
          builder: (_) => const DashboardScreen(),
        );
      default:
        return MaterialPageRoute<void>(
          settings: settings,
          builder: (_) => const DashboardScreen(),
        );
    }
  }
}
