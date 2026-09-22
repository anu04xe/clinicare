import 'package:flutter/material.dart';
import 'package:clinicare/features/patients/patient_repository.dart';
import 'package:clinicare/database/database.dart';

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

  Future<void> _loadPatients() async {
    setState(() => _isLoading = true);
    final results = await widget.repository.getAllPatients();
    setState(() {
      _patients = results;
      _isLoading = false;
    });
  }

  Future<void> _search(String query) async {
    if (query.isEmpty) {
      await _loadPatients();
      return;
    }
    final results = await widget.repository.searchPatients(query);
    setState(() {
      _patients = results;
      _isLoading = false;
    });
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Patients'),
        bottom: PreferredSize(
          preferredSize: const Size.fromHeight(60),
          child: Padding(
            padding: const EdgeInsets.all(16.0),
            child: TextField(
              controller: _searchController,
              decoration: InputDecoration(
                hintText: 'Search by name, phone or ID...',
                prefixIcon: const Icon(Icons.search),
                border: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(8),
                ),
              ),
              onChanged: _search,
            ),
          ),
        ),
      ),
      body: _isLoading
          ? const Center(child: CircularProgressIndicator())
          : _patients.isEmpty
          ? const Center(child: Text('No patients found'))
          : ListView.builder(
              itemCount: _patients.length,
              itemBuilder: (context, index) {
                final patient = _patients[index];
                return ListTile(
                  title: Text(
                    patient.fullName,
                    style: const TextStyle(
                      fontWeight: FontWeight.bold,
                      fontSize: 18,
                    ),
                  ),
                  subtitle: Text(
                    '${patient.phoneNumber ?? 'No phone'} • ID: ${patient.id}',
                  ),
                  trailing: const Icon(Icons.chevron_right),
                  onTap: () {
                    Navigator.pushNamed(
                      context,
                      '/patients/${patient.id}',
                      arguments: patient,
                    );
                  },
                );
              },
            ),
      floatingActionButton: FloatingActionButton.extended(
        onPressed: () {
          Navigator.pushNamed(context, '/patients/add');
        },
        label: const Text('Add Patient'),
        icon: const Icon(Icons.add),
      ),
    );
  }
}
