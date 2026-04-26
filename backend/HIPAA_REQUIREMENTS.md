# CareTrack-Connect HIPAA Requirements

## Data Retention and Removal Requirement

The system shall retain patient health records for at least the minimum amount of time required by applicable laws and regulations. This ensures the application remains compliant with healthcare data requirements.

Patients shall be able to request the removal of their personal data through the system. Before processing the request, the system shall verify the identity of the patient and determine whether the data can be deleted based on legal retention rules.

If the data can be removed, the system shall securely delete or de-identify the patient’s personal information. Once the removal process has been completed, the patient shall be notified that their request has been fulfilled.

## Backend Code Connection

This requirement is implemented in:

backend/src/routes/hipaaRoutes.js

The route used is:

POST /api/patients/:id/remove

This route:
- Verifies the user is logged in
- Checks user permissions (admin or patient)
- Ensures data meets legal retention rules before deletion
- De-identifies patient data instead of fully deleting it
- Logs actions for auditing
- Returns a confirmation message after completion

This ensures compliance with HIPAA requirements for data retention, access control, accountability, and user notification.
