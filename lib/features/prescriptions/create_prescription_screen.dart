import 'package:flutter/material.dart';

import 'package:clinicare/features/visits/visit_draft.dart';

class CreatePrescriptionScreen extends StatefulWidget {
  final PrescriptionFlowArgs flow;

  const CreatePrescriptionScreen({super.key, required this.flow});

  @override
  State<CreatePrescriptionScreen> createState() =>
      _CreatePrescriptionScreenState();
}

class _CreatePrescriptionScreenState extends State<CreatePrescriptionScreen> {
  final _formKey = GlobalKey<FormState>();
  final _diagnosisController = TextEditingController();
  final _instructionsController = TextEditingController();
  final _doctorNotesController = TextEditingController();

  final List<_MedicineEntry> _medicines = [_MedicineEntry()];

  @override
  void dispose() {
    _diagnosisController.dispose();
    _instructionsController.dispose();
    _doctorNotesController.dispose();
    for (final medicine in _medicines) {
      medicine.dispose();
    }
    super.dispose();
  }

  void _addMedicine() {
    setState(() {
      _medicines.add(_MedicineEntry());
    });
  }

  Future<void> _savePrescription() async {
    if (!_formKey.currentState!.validate()) return;

    final validMedicines = _medicines
        .where((m) => m.name.text.trim().isNotEmpty)
        .map(
          (m) =>
              '${m.name.text.trim()} • ${m.dosage.text.trim()} • ${m.frequency.text.trim()} • ${m.duration.text.trim()}',
        )
        .toList();

    if (validMedicines.isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Add at least one medicine entry.')),
      );
      return;
    }

    final patient = widget.flow.visit.patient;
    final summary = StringBuffer()
      ..writeln('Clinicare Prescription')
      ..writeln('Patient: ${patient.fullName} (${patient.id})')
      ..writeln('Diagnosis: ${_diagnosisController.text.trim()}')
      ..writeln('Chief complaint: ${widget.flow.visit.chiefComplaint}')
      ..writeln('Medicines:')
      ..writeln(validMedicines.join('\n'))
      ..writeln('Instructions: ${_instructionsController.text.trim()}')
      ..writeln('Doctor notes: ${_doctorNotesController.text.trim()}')
      ..writeln('Follow-up: ${widget.flow.visit.followUp ?? 'Not specified'}');

    if (!mounted) return;

    await showDialog<void>(
      context: context,
      builder: (context) {
        return AlertDialog(
          title: const Text('Prescription saved (frontend demo)'),
          content: SingleChildScrollView(
            child: Text(summary.toString()),
          ),
          actions: [
            TextButton(
              onPressed: () => Navigator.pop(context),
              child: const Text('Close'),
            ),
          ],
        );
      },
    );

    if (mounted) {
      Navigator.popUntil(context, (route) => route.settings.name == '/patients');
    }
  }

  @override
  Widget build(BuildContext context) {
    final patient = widget.flow.visit.patient;

    return Scaffold(
      appBar: AppBar(title: const Text('Create Prescription')),
      body: SafeArea(
        child: Center(
          child: ConstrainedBox(
            constraints: const BoxConstraints(maxWidth: 960),
            child: Form(
              key: _formKey,
              child: ListView(
                padding: const EdgeInsets.all(16),
                children: [
                  Card(
                    child: Padding(
                      padding: const EdgeInsets.all(16),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            patient.fullName,
                            style: Theme.of(context).textTheme.headlineMedium,
                          ),
                          const SizedBox(height: 8),
                          Text(
                            'Visit: ${widget.flow.visit.chiefComplaint}',
                            style: Theme.of(context).textTheme.bodySmall,
                          ),
                        ],
                      ),
                    ),
                  ),
                  const SizedBox(height: 16),
                  Card(
                    child: Padding(
                      padding: const EdgeInsets.all(16),
                      child: Column(
                        children: [
                          TextFormField(
                            controller: _diagnosisController,
                            decoration: const InputDecoration(
                              labelText: 'Diagnosis *',
                            ),
                            validator: (value) {
                              if (value == null || value.trim().isEmpty) {
                                return 'Enter diagnosis';
                              }
                              return null;
                            },
                          ),
                          const SizedBox(height: 16),
                          ..._buildMedicineFields(),
                          const SizedBox(height: 8),
                          Align(
                            alignment: Alignment.centerLeft,
                            child: TextButton.icon(
                              onPressed: _addMedicine,
                              icon: const Icon(Icons.add),
                              label: const Text('Add medicine'),
                            ),
                          ),
                          const SizedBox(height: 8),
                          TextFormField(
                            controller: _instructionsController,
                            maxLines: 2,
                            decoration: const InputDecoration(
                              labelText: 'Instructions',
                            ),
                          ),
                          const SizedBox(height: 16),
                          TextFormField(
                            controller: _doctorNotesController,
                            maxLines: 2,
                            decoration: const InputDecoration(
                              labelText: 'Doctor notes',
                            ),
                          ),
                        ],
                      ),
                    ),
                  ),
                  const SizedBox(height: 16),
                  Align(
                    alignment: Alignment.centerRight,
                    child: FilledButton.icon(
                      onPressed: _savePrescription,
                      icon: const Icon(Icons.save),
                      label: const Text('Save Prescription'),
                    ),
                  ),
                ],
              ),
            ),
          ),
        ),
      ),
    );
  }

  List<Widget> _buildMedicineFields() {
    final widgets = <Widget>[];

    for (var index = 0; index < _medicines.length; index++) {
      final medicine = _medicines[index];
      widgets.add(
        Padding(
          padding: const EdgeInsets.only(bottom: 16),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                'Medicine ${index + 1}',
                style: Theme.of(context).textTheme.bodyLarge,
              ),
              const SizedBox(height: 8),
              LayoutBuilder(
                builder: (context, constraints) {
                  final isCompact = constraints.maxWidth < 760;
                  final children = [
                    _field(
                      controller: medicine.name,
                      label: 'Medicine name *',
                      validator: (value) {
                        if (index == 0 && (value == null || value.trim().isEmpty)) {
                          return 'Required';
                        }
                        return null;
                      },
                    ),
                    _field(controller: medicine.dosage, label: 'Dosage'),
                    _field(controller: medicine.frequency, label: 'Frequency'),
                    _field(controller: medicine.duration, label: 'Duration'),
                  ];

                  if (isCompact) {
                    return Column(
                      children: children
                          .map(
                            (field) => Padding(
                              padding: const EdgeInsets.only(bottom: 8),
                              child: field,
                            ),
                          )
                          .toList(),
                    );
                  }

                  return Row(
                    children: [
                      for (var i = 0; i < children.length; i++) ...[
                        Expanded(child: children[i]),
                        if (i < children.length - 1) const SizedBox(width: 8),
                      ],
                    ],
                  );
                },
              ),
            ],
          ),
        ),
      );
    }

    return widgets;
  }

  Widget _field({
    required TextEditingController controller,
    required String label,
    String? Function(String?)? validator,
  }) {
    return TextFormField(
      controller: controller,
      validator: validator,
      decoration: InputDecoration(labelText: label),
    );
  }
}

class _MedicineEntry {
  final name = TextEditingController();
  final dosage = TextEditingController();
  final frequency = TextEditingController();
  final duration = TextEditingController();

  void dispose() {
    name.dispose();
    dosage.dispose();
    frequency.dispose();
    duration.dispose();
  }
}
