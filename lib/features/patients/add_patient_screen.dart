import 'package:flutter/material.dart';

import 'package:clinicare/database/database.dart';
import 'package:clinicare/features/patients/patient_repository.dart';

class AddPatientScreen extends StatefulWidget {
  final PatientRepository repository;

  const AddPatientScreen({super.key, required this.repository});

  @override
  State<AddPatientScreen> createState() => _AddPatientScreenState();
}

class _AddPatientScreenState extends State<AddPatientScreen> {
  final _formKey = GlobalKey<FormState>();
  final _nameController = TextEditingController();
  final _phoneController = TextEditingController();
  final _dobController = TextEditingController();
  final _genderController = TextEditingController();
  final _addressController = TextEditingController();

  bool _isSaving = false;

  @override
  void dispose() {
    _nameController.dispose();
    _phoneController.dispose();
    _dobController.dispose();
    _genderController.dispose();
    _addressController.dispose();
    super.dispose();
  }

  Future<void> _savePatient() async {
    if (!_formKey.currentState!.validate()) return;

    setState(() => _isSaving = true);

    final now = DateTime.now();
    final patient = Patient(
      id: now.microsecondsSinceEpoch.toString(),
      fullName: _nameController.text.trim(),
      phoneNumber: _phoneController.text.trim().isEmpty
          ? null
          : _phoneController.text.trim(),
      dateOfBirth: _dobController.text.trim().isEmpty
          ? null
          : _dobController.text.trim(),
      gender: _genderController.text.trim().isEmpty
          ? null
          : _genderController.text.trim(),
      address: _addressController.text.trim().isEmpty
          ? null
          : _addressController.text.trim(),
      createdAt: now,
      updatedAt: now,
    );

    await widget.repository.createPatient(patient);
    if (!mounted) return;
    Navigator.pop(context, true);
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Register Patient')),
      body: SafeArea(
        child: Center(
          child: ConstrainedBox(
            constraints: const BoxConstraints(maxWidth: 880),
            child: Form(
              key: _formKey,
              child: ListView(
                padding: const EdgeInsets.all(16),
                children: [
                  Card(
                    child: Padding(
                      padding: const EdgeInsets.all(16),
                      child: Column(
                        children: [
                          _field(
                            controller: _nameController,
                            label: 'Full name *',
                            validator: (value) => (value == null || value.trim().isEmpty)
                                ? 'Name is required'
                                : null,
                          ),
                          const SizedBox(height: 16),
                          _field(
                            controller: _phoneController,
                            label: 'Phone number',
                            keyboardType: TextInputType.phone,
                          ),
                          const SizedBox(height: 16),
                          _field(
                            controller: _dobController,
                            label: 'Date of birth / age',
                          ),
                          const SizedBox(height: 16),
                          _field(
                            controller: _genderController,
                            label: 'Sex / gender',
                          ),
                          const SizedBox(height: 16),
                          _field(
                            controller: _addressController,
                            label: 'Address',
                            maxLines: 2,
                          ),
                        ],
                      ),
                    ),
                  ),
                  const SizedBox(height: 16),
                  Align(
                    alignment: Alignment.centerRight,
                    child: FilledButton.icon(
                      onPressed: _isSaving ? null : _savePatient,
                      icon: _isSaving
                          ? const SizedBox(
                              width: 16,
                              height: 16,
                              child: CircularProgressIndicator(strokeWidth: 2),
                            )
                          : const Icon(Icons.save),
                      label: Text(_isSaving ? 'Saving...' : 'Save Patient'),
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

  Widget _field({
    required TextEditingController controller,
    required String label,
    String? Function(String?)? validator,
    TextInputType? keyboardType,
    int maxLines = 1,
  }) {
    return TextFormField(
      controller: controller,
      validator: validator,
      keyboardType: keyboardType,
      maxLines: maxLines,
      decoration: InputDecoration(labelText: label),
    );
  }
}
