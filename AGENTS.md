# Clinic Management System — Engineering Instructions

## Project

We are building a production-oriented, offline-first clinic management application for a small private clinic in North India.

The clinic has:

* An ENT specialist
* A Gynaecologist
* Reception/administrative staff

The primary users are doctors and non-technical clinic staff.

The application manages:

* Patients
* Visits
* Consultations
* Prescriptions
* Treatment instructions
* Bills
* Appointments
* Patient history
* Printable documents
* Patient-facing digital summaries
* Clinic reports

This is a real-world workflow application, not a generic CRUD demo.

---

# Primary Product Requirements

## 1. Offline-first

The application MUST remain usable without an internet connection.

Normal clinic operations must not require an active internet connection.

Local data is stored in SQLite through Drift.

Cloud synchronization will be implemented later.

Do not make Supabase/network calls part of the critical path for normal patient registration, consultation, prescription creation, or billing.

The application should clearly indicate synchronization status without preventing normal work.

---

## 2. Multi-platform

The same Flutter codebase should support:

* Android phones
* Android tablets
* Windows desktop
* macOS desktop
* Web

Do not create separate application implementations unless platform-specific behavior genuinely requires it.

Use platform abstractions where necessary.

Never introduce dart:io into code that must compile for web.

---

## 3. Extremely simple UX

The primary design constraint is ease of use.

The application will be used by clinic staff who may have limited technical experience.

Prioritize:

* Large touch targets
* Clear labels
* Obvious primary actions
* Minimal steps
* Consistent navigation
* Predictable back behavior
* Search
* Short forms
* Clear validation
* Clear error messages
* Clear confirmation messages
* Keyboard accessibility on desktop
* Touch accessibility on tablets

Do NOT prioritize visual complexity over usability.

Avoid:

* excessive cards
* unnecessary animations
* excessive icons
* hidden navigation
* tiny controls
* unnecessary dashboards
* technical terminology
* complicated modal workflows

---

# Responsive UX

Do not simply scale the mobile UI.

Use adaptive layouts.

Phone:

* single-column workflows
* bottom navigation or similarly obvious navigation

Tablet:

* two-pane layouts where useful
* larger touch targets

Desktop/web:

* persistent navigation/sidebar
* keyboard-friendly controls
* larger information workspace

Use Flutter's responsive/adaptive layout mechanisms.

---

# Core Workflow

The most important workflow is:

Patient arrives
→ Reception searches or registers patient
→ Patient is added to today's queue
→ Doctor opens patient
→ Doctor records consultation
→ Doctor creates prescription
→ Prescription is saved
→ Printable prescription is generated
→ Bill is generated
→ Patient receives printed and/or digital documents
→ Visit becomes part of permanent patient history

This workflow must remain simple.

---

# Core Features

## Patient Management

Implement:

* patient registration
* unique patient ID
* search by name
* search by phone
* search by patient ID
* patient profile
* visit history
* previous prescriptions
* previous bills

Avoid collecting unnecessary personal information.

---

## Visits

A visit should connect:

* patient
* doctor
* date/time
* consultation
* diagnosis/clinical notes
* prescription
* bill
* follow-up information

A patient may have many visits.

A visit must not overwrite previous visits.

---

## Prescriptions

Doctors should be able to create structured prescriptions.

Each prescription may contain:

* diagnosis
* medicine name
* dosage
* frequency
* duration
* route when required
* instructions
* doctor notes
* follow-up date

Allow multiple medicines.

Allow reusable prescription templates where appropriate.

Do not make templates mandatory.

---

# Prescription Printing

A prescription is structured database data first.

The PDF/printable document is generated from that data.

Do NOT use arbitrary PDFs as the primary medical record.

Prescription output should contain:

* clinic name
* doctor name
* specialization
* clinic contact information
* patient name
* patient ID
* age/sex where appropriate
* date
* diagnosis
* medicines
* dosage
* frequency
* duration
* instructions
* follow-up
* doctor signature area

The document must be clean and printable on common clinic printers.

The application should support:

* print
* save/export PDF
* share where supported

---

# Billing

Implement:

* consultation fee
* procedures/services
* other billable items
* discounts if required
* total
* payment method
* payment status
* receipt number

Generate a printable bill/receipt.

Bills must be linked to the relevant patient and visit.

---

# Patient Digital Summary

Design the system so a patient can eventually receive:

* prescription
* bill
* treatment summary
* follow-up information

For the initial implementation, prioritize reliable PDF generation and sharing.

A secure online patient portal/link can be implemented later.

Never expose medical information through predictable public URLs.

---

# Database

Use:

Flutter
+
Drift
+
SQLite

Use relational database design.

Prefer normalized tables and explicit relationships.

Expected conceptual entities include:

* patients
* doctors
* users
* visits
* consultations
* prescriptions
* prescription_items
* medicines
* bills
* bill_items
* appointments
* audit_logs
* sync_queue

Do not prematurely create dozens of tables.

Only introduce an entity when it represents a meaningful domain concept.

Use migrations from the beginning.

Never modify an existing schema destructively without a migration.

---

# Architecture

Use a maintainable feature-oriented architecture.

Suggested structure:

lib/
app/
core/
database/
features/
authentication/
patients/
visits/
prescriptions/
billing/
appointments/
reports/
settings/
services/
printing/
pdf/
sync/

Separate:

UI
→ application/business logic
→ repositories
→ database/services

Widgets should not directly contain SQL/database operations.

---

# Security

Treat all patient information as sensitive.

The architecture must eventually support:

* authentication
* role-based access control
* least-privilege access
* secure local storage
* encrypted transport
* audit logging
* session management
* secure cloud synchronization
* backups

Do not claim that the application is HIPAA/GDPR compliant unless this has actually been independently established.

Do not hard-code secrets.

Never commit API keys, passwords, service-role keys, or credentials.

---

# Future Cloud Architecture

Cloud backend will eventually use:

Supabase
+
PostgreSQL
+
Supabase Auth
+
Row Level Security
+
Supabase Storage where necessary

Local SQLite remains the primary operational database for offline workflows.

The cloud is for synchronization, multi-device coordination, backup, and centralized administration.

Do not implement cloud dependency before the local application is functional.

---

# Synchronization

Eventually implement an explicit synchronization layer.

Each locally created/updated entity should have enough metadata to support synchronization, such as:

* stable UUID
* created_at
* updated_at
* sync state
* deleted_at where appropriate
* device/source metadata when necessary

Do not silently overwrite conflicting medical records.

Never delete historical clinical records merely because of a synchronization conflict.

Clinical history should be append-oriented wherever possible.

---

# Auditability

Important actions should eventually generate audit records.

Examples:

* patient created
* consultation created
* prescription created
* prescription finalized
* bill created
* bill modified
* user logged in
* user logged out

Audit records should include:

* actor
* action
* entity
* entity ID
* timestamp

---

# Clinical Data Principles

Do not make medical decisions.

The application stores and presents information entered by clinicians.

Do not invent diagnoses, medicine dosages, treatment plans, or medical recommendations.

Demo data must be clearly synthetic.

---

# Development Rules

## IMPORTANT

Do not attempt to build the entire application in one step.

Implement one vertical slice at a time.

Before writing substantial code:

1. Inspect the existing repository.
2. Understand the current architecture.
3. Identify relevant files.
4. Explain the proposed change briefly.
5. Implement the smallest useful change.
6. Run formatting.
7. Run static analysis.
8. Run relevant tests.
9. Fix errors.
10. Summarize what changed.

Do not rewrite working code unnecessarily.

Do not introduce dependencies without explaining why they are needed.

Prefer stable, well-maintained packages.

Do not generate placeholder architecture that is not actually used.

---

# Coding Style

Write production-quality Dart.

Prefer:

* immutable models where practical
* strong typing
* explicit error handling
* small functions
* meaningful names
* reusable components
* repository abstractions
* testable business logic

Avoid:

* giant widgets
* duplicated code
* magic strings
* global mutable state
* unnecessary abstractions
* dead code
* commented-out implementations

---

# Testing

For every major feature, add appropriate tests.

Prioritize:

* database tests
* repository tests
* business logic tests
* widget tests for critical workflows

Critical workflows to test:

* create patient
* search patient
* create visit
* create prescription
* generate prescription
* create bill
* calculate bill total
* offline operation
* data persistence after restart

---

# AI Agent Behavior

You are an implementation agent, not the product owner.

Do not invent major product requirements.

If a requirement is ambiguous:

* identify the ambiguity
* make the safest minimal assumption
* state the assumption before implementation

Do not replace architecture merely because another technology is easier.

Do not add features merely because they are technically interesting.

Optimize for:

1. reliability
2. usability
3. data integrity
4. maintainability
5. security
6. performance
7. visual polish

Do not optimize for maximum feature count.

---

# Current Development Strategy

Start with a small working demo.

The first vertical slice is:

Dashboard
→ Create patient
→ Patient profile
→ Create visit
→ Create prescription
→ Save prescription locally
→ Generate printable prescription

Do not implement authentication, Supabase synchronization, analytics, or advanced billing before this workflow works reliably.

After the vertical slice works, expand the system incrementally.

Always keep the application runnable.
