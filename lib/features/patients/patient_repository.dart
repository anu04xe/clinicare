import 'package:drift/drift.dart';
import 'package:clinicare/database/database.dart';

abstract class PatientRepository {
  Future<void> createPatient(Patient patient);
  Future<Patient?> getPatientById(String id);
  Future<List<Patient>> getAllPatients();
  Future<List<Patient>> searchPatients(String query);
}

class PatientRepositoryImpl implements PatientRepository {
  final AppDatabase _db;

  PatientRepositoryImpl(this._db);

  @override
  Future<void> createPatient(Patient patient) async {
    await _db.into(_db.patients).insert(patient);
  }

  @override
  Future<Patient?> getPatientById(String id) async {
    return await (_db.select(
      _db.patients,
    )..where((t) => t.id.equals(id))).getSingleOrNull();
  }

  @override
  Future<List<Patient>> getAllPatients() async {
    return await _db.select(_db.patients).get();
  }

  @override
  Future<List<Patient>> searchPatients(String query) async {
    return await (_db.select(_db.patients)..where(
          (t) =>
              t.fullName.contains(query) |
              t.phoneNumber.contains(query) |
              t.id.contains(query),
        ))
        .get();
  }
}
