import 'package:flutter/material.dart';

import 'package:clinicare/database/database.dart';
import 'package:clinicare/features/dashboard/dashboard_screen.dart';
import 'package:clinicare/features/patients/add_patient_screen.dart';
import 'package:clinicare/features/patients/patient_list_screen.dart';
import 'package:clinicare/features/patients/patient_profile_screen.dart';
import 'package:clinicare/features/patients/patient_repository.dart';
import 'package:clinicare/features/prescriptions/create_prescription_screen.dart';
import 'package:clinicare/features/visits/create_visit_screen.dart';
import 'package:clinicare/features/visits/visit_draft.dart';

abstract final class AppRoutes {
  static const home = '/';
  static const patients = '/patients';
  static const patientsAdd = '/patients/add';
  static const visitsAdd = '/visits/add';
  static const prescriptionsAdd = '/prescriptions/add';

  static String patientDetails(String patientId) => '/patients/$patientId';
}

class AppRouter {
  final AppDatabase database;

  AppRouter(this.database);

  Route<dynamic> onGenerateRoute(RouteSettings settings) {
    final patientRepo = PatientRepositoryImpl(database);

    switch (settings.name) {
      case AppRoutes.home:
        return MaterialPageRoute<void>(
          settings: settings,
          builder: (_) => const DashboardScreen(),
        );
      case AppRoutes.patients:
        return MaterialPageRoute<void>(
          settings: settings,
          builder: (_) => PatientListScreen(repository: patientRepo),
        );
      case AppRoutes.patientsAdd:
        return MaterialPageRoute<void>(
          settings: settings,
          builder: (_) => AddPatientScreen(repository: patientRepo),
        );
      case AppRoutes.visitsAdd:
        final patient = settings.arguments as Patient;
        return MaterialPageRoute<void>(
          settings: settings,
          builder: (_) => CreateVisitScreen(patient: patient),
        );
      case AppRoutes.prescriptionsAdd:
        final flow = settings.arguments as PrescriptionFlowArgs;
        return MaterialPageRoute<void>(
          settings: settings,
          builder: (_) => CreatePrescriptionScreen(flow: flow),
        );
      default:
        if (settings.name?.startsWith('/patients/') == true) {
          final patient = settings.arguments as Patient;
          return MaterialPageRoute<void>(
            settings: settings,
            builder: (_) => PatientProfileScreen(patient: patient),
          );
        }
        return MaterialPageRoute<void>(
          settings: settings,
          builder: (_) => const DashboardScreen(),
        );
    }
  }
}
