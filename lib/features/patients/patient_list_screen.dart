import 'package:flutter/material.dart';

import 'package:clinicare/app/router.dart';
import 'package:clinicare/database/database.dart';
import 'package:clinicare/features/patients/patient_repository.dart';

class PatientListScreen extends StatefulWidget {
  final PatientRepository repository;

  const PatientListScreen({super.key, required this.repository});

  @override
  State<PatientListScreen> createState() => _PatientListScreenState();
}

class _PatientListScreenState extends State<PatientListScreen> {
  late final TextEditingController _searchController = TextEditingController();
  List<Patient> _patients = [];
  bool _isLoading = true;

  @override
  void initState() {
    super.initState();
    _loadPatients();
  }

  @override
  void dispose() {
    _searchController.dispose();
    super.dispose();
  }

  Future<void> _loadPatients() async {
    setState(() => _isLoading = true);
    final results = await widget.repository.getAllPatients();
    if (!mounted) return;
    setState(() {
      _patients = results;
      _isLoading = false;
    });
  }

  Future<void> _search(String query) async {
    if (query.trim().isEmpty) {
      await _loadPatients();
      return;
    }

    setState(() => _isLoading = true);
    final results = await widget.repository.searchPatients(query.trim());
    if (!mounted) return;
    setState(() {
      _patients = results;
      _isLoading = false;
    });
  }

  Future<void> _openAddPatient() async {
    await Navigator.pushNamed(context, AppRoutes.patientsAdd);
    await _loadPatients();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Patients'),
      ),
      body: SafeArea(
        child: Center(
          child: ConstrainedBox(
            constraints: const BoxConstraints(maxWidth: 960),
            child: Padding(
              padding: const EdgeInsets.all(16),
              child: Column(
                children: [
                  TextField(
                    controller: _searchController,
                    decoration: const InputDecoration(
                      hintText: 'Search by name, phone, or patient ID',
                      prefixIcon: Icon(Icons.search),
                    ),
                    onChanged: _search,
                  ),
                  const SizedBox(height: 16),
                  Expanded(
                    child: _isLoading
                        ? const Center(child: CircularProgressIndicator())
                        : _patients.isEmpty
                        ? const Center(child: Text('No patients found'))
                        : ListView.separated(
                            itemCount: _patients.length,
                            separatorBuilder: (_, __) => const SizedBox(height: 8),
                            itemBuilder: (context, index) {
                              final patient = _patients[index];
                              return ListTile(
                                contentPadding: const EdgeInsets.symmetric(
                                  horizontal: 12,
                                  vertical: 8,
                                ),
                                title: Text(
                                  patient.fullName,
                                  style: Theme.of(context).textTheme.bodyLarge,
                                ),
                                subtitle: Text(
                                  '${patient.phoneNumber ?? 'No phone'} • ID: ${patient.id}',
                                ),
                                trailing: const Icon(Icons.chevron_right),
                                onTap: () {
                                  Navigator.pushNamed(
                                    context,
                                    AppRoutes.patientDetails(patient.id),
                                    arguments: patient,
                                  );
                                },
                              );
                            },
                          ),
                  ),
                ],
              ),
            ),
          ),
        ),
      ),
      floatingActionButton: FloatingActionButton.extended(
        onPressed: _openAddPatient,
        label: const Text('Add Patient'),
        icon: const Icon(Icons.add),
      ),
    );
  }
}
