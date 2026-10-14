import 'package:flutter/material.dart';

import 'package:clinicare/app/router.dart';
import 'package:clinicare/database/database.dart';
import 'package:clinicare/features/visits/visit_draft.dart';

class CreateVisitScreen extends StatefulWidget {
  final Patient patient;

  const CreateVisitScreen({super.key, required this.patient});

  @override
  State<CreateVisitScreen> createState() => _CreateVisitScreenState();
}

class _CreateVisitScreenState extends State<CreateVisitScreen> {
  final _formKey = GlobalKey<FormState>();
  final _chiefComplaintController = TextEditingController();
  final _clinicalNotesController = TextEditingController();
  final _followUpController = TextEditingController();

  @override
  void dispose() {
    _chiefComplaintController.dispose();
    _clinicalNotesController.dispose();
    _followUpController.dispose();
    super.dispose();
  }

  void _continueToPrescription() {
    if (!_formKey.currentState!.validate()) return;

    final visit = VisitDraft(
      patient: widget.patient,
      visitDate: DateTime.now(),
      chiefComplaint: _chiefComplaintController.text.trim(),
      clinicalNotes: _clinicalNotesController.text.trim(),
      followUp: _followUpController.text.trim().isEmpty
          ? null
          : _followUpController.text.trim(),
    );

    Navigator.pushNamed(
      context,
      AppRoutes.prescriptionsAdd,
      arguments: PrescriptionFlowArgs(visit: visit),
    );
  }

  @override
  Widget build(BuildContext context) {
    final spacing = 16.0;

    return Scaffold(
      appBar: AppBar(title: const Text('Create Visit')),
      body: SafeArea(
        child: Center(
          child: ConstrainedBox(
            constraints: const BoxConstraints(maxWidth: 860),
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
                          widget.patient.fullName,
                          style: Theme.of(context).textTheme.headlineMedium,
                        ),
                        const SizedBox(height: 8),
                        Text(
                          'Patient ID: ${widget.patient.id}',
                          style: Theme.of(context).textTheme.bodySmall,
                        ),
                      ],
                    ),
                  ),
                ),
                SizedBox(height: spacing),
                Form(
                  key: _formKey,
                  child: Card(
                    child: Padding(
                      padding: const EdgeInsets.all(16),
                      child: Column(
                        children: [
                          TextFormField(
                            controller: _chiefComplaintController,
                            decoration: const InputDecoration(
                              labelText: 'Chief complaint *',
                            ),
                            validator: (value) {
                              if (value == null || value.trim().isEmpty) {
                                return 'Enter the chief complaint';
                              }
                              return null;
                            },
                          ),
                          SizedBox(height: spacing),
                          TextFormField(
                            controller: _clinicalNotesController,
                            maxLines: 4,
                            decoration: const InputDecoration(
                              labelText: 'Clinical notes *',
                            ),
                            validator: (value) {
                              if (value == null || value.trim().isEmpty) {
                                return 'Enter clinical notes';
                              }
                              return null;
                            },
                          ),
                          SizedBox(height: spacing),
                          TextFormField(
                            controller: _followUpController,
                            decoration: const InputDecoration(
                              labelText: 'Follow-up date or note (optional)',
                            ),
                          ),
                        ],
                      ),
                    ),
                  ),
                ),
                SizedBox(height: spacing),
                Align(
                  alignment: Alignment.centerRight,
                  child: FilledButton.icon(
                    onPressed: _continueToPrescription,
                    icon: const Icon(Icons.arrow_forward),
                    label: const Text('Continue to Prescription'),
                  ),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}
