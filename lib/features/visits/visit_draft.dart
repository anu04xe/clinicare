import 'package:clinicare/database/database.dart';

class VisitDraft {
  final Patient patient;
  final DateTime visitDate;
  final String chiefComplaint;
  final String clinicalNotes;
  final String? followUp;

  const VisitDraft({
    required this.patient,
    required this.visitDate,
    required this.chiefComplaint,
    required this.clinicalNotes,
    this.followUp,
  });
}

class PrescriptionFlowArgs {
  final VisitDraft visit;

  const PrescriptionFlowArgs({required this.visit});
}
