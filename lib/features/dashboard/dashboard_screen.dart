import 'package:flutter/material.dart';

import 'package:clinicare/app/router.dart';
import 'package:clinicare/core/constants.dart';

class DashboardScreen extends StatelessWidget {
  const DashboardScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text(AppConstants.dashboardTitle)),
      body: SafeArea(
        child: Center(
          child: ConstrainedBox(
            constraints: const BoxConstraints(maxWidth: 1080),
            child: LayoutBuilder(
              builder: (context, constraints) {
                final isCompact = constraints.maxWidth < 820;

                return Padding(
                  padding: const EdgeInsets.all(16),
                  child: isCompact ? _compactLayout(context) : _wideLayout(context),
                );
              },
            ),
          ),
        ),
      ),
    );
  }

  Widget _compactLayout(BuildContext context) {
    return ListView(
      children: [
        _header(context),
        const SizedBox(height: 16),
        _quickActions(context),
        const SizedBox(height: 16),
        _todayQueueCard(context),
      ],
    );
  }

  Widget _wideLayout(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        _header(context),
        const SizedBox(height: 16),
        Expanded(
          child: Row(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Expanded(flex: 2, child: _quickActions(context)),
              const SizedBox(width: 16),
              Expanded(child: _todayQueueCard(context)),
            ],
          ),
        ),
      ],
    );
  }

  Widget _header(BuildContext context) {
    return Card(
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(AppConstants.appName, style: Theme.of(context).textTheme.headlineLarge),
            const SizedBox(height: 8),
            Text(
              'Run registration, visits, prescriptions, and billing from one place.',
              style: Theme.of(context).textTheme.bodyMedium,
            ),
          ],
        ),
      ),
    );
  }

  Widget _quickActions(BuildContext context) {
    return Card(
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text('Quick actions', style: Theme.of(context).textTheme.headlineMedium),
            const SizedBox(height: 16),
            Wrap(
              spacing: 8,
              runSpacing: 8,
              children: [
                FilledButton.icon(
                  onPressed: () => Navigator.pushNamed(context, AppRoutes.patients),
                  icon: const Icon(Icons.people_outline),
                  label: const Text('Patient Directory'),
                ),
                OutlinedButton.icon(
                  onPressed: () => Navigator.pushNamed(context, AppRoutes.patientsAdd),
                  icon: const Icon(Icons.person_add_alt_1),
                  label: const Text('Register Patient'),
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }

  Widget _todayQueueCard(BuildContext context) {
    return Card(
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text('Today\'s queue', style: Theme.of(context).textTheme.headlineMedium),
            const SizedBox(height: 8),
            Text(
              'No live queue connected yet. Start by opening patient records and creating visits.',
              style: Theme.of(context).textTheme.bodyMedium,
            ),
          ],
        ),
      ),
    );
  }
}
