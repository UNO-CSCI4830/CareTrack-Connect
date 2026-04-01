# CareTrack Connect Backend

Node.js + Express + Supabase API server for CareTrack Connect healthcare platform.

## Setup

### 1. Install dependencies
```bash
npm install
```

### 2. Configure environment
Edit `.env` with your Supabase credentials:
```
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_KEY=your-anon-key
PORT=4000
FRONTEND_URL=http://localhost:5173
```

### 3. Run server
Development (with auto-reload):
```bash
npm run dev
```

Production:
```bash
npm start
```

Server runs on `http://localhost:4000`

---

## API Endpoints

### Health Check
- `GET /api/health` — Server status

### Profiles (Users)
- `GET /api/profiles` — List all profiles
- `GET /api/profiles/:id` — Get profile by ID
- `GET /api/profiles/auth/:authUserId` — Get profile by auth user ID
- `GET /api/profiles/role/:role` — Get profiles by role (patient/provider)
- `POST /api/profiles` — Create new profile
- `PUT /api/profiles/:id` — Update profile
- `DELETE /api/profiles/:id` — Delete profile

### Patient Details
- `GET /api/patient-details` — List all patient details
- `GET /api/patient-details/:id` — Get patient details by ID
- `GET /api/patient-details/profile/:profileId` — Get patient details by profile ID
- `POST /api/patient-details` — Create patient details
- `PUT /api/patient-details/:id` — Update patient details
- `DELETE /api/patient-details/:id` — Delete patient details

### Provider Details
- `GET /api/provider-details` — List all provider details
- `GET /api/provider-details/:id` — Get provider details by ID
- `GET /api/provider-details/profile/:profileId` — Get provider details by profile ID
- `GET /api/provider-details/accepting/patients` — Get providers accepting new patients
- `POST /api/provider-details` — Create provider details
- `PUT /api/provider-details/:id` — Update provider details
- `DELETE /api/provider-details/:id` — Delete provider details

### Provider-Patient Assignments
- `GET /api/provider-patients` — List all provider-patient assignments
- `GET /api/provider-patients/:id` — Get assignment by ID
- `GET /api/provider-patients/provider/:providerId` — Get patients for provider
- `GET /api/provider-patients/provider/:providerId/active` — Get active patients for provider
- `GET /api/provider-patients/patient/:patientId` — Get providers for patient
- `POST /api/provider-patients` — Assign patient to provider
- `PUT /api/provider-patients/:id` — Update assignment status
- `DELETE /api/provider-patients/:id` — Remove patient from provider

### Check-Ins
- `GET /api/check-ins` — List all check-ins
- `GET /api/check-ins/:id` — Get check-in by ID
- `GET /api/check-ins/patient/:patientId` — Get check-ins for patient
- `GET /api/check-ins/status/:status` — Get check-ins by status
- `POST /api/check-ins` — Create new check-in
- `PUT /api/check-ins/:id` — Update check-in status
- `DELETE /api/check-ins/:id` — Delete check-in

### Check-In Responses
- `GET /api/check-in-responses` — List all check-in responses
- `GET /api/check-in-responses/:id` — Get response by ID
- `GET /api/check-in-responses/checkin/:checkInId` — Get responses for check-in
- `GET /api/check-in-responses/question/:questionId` — Get responses for question
- `POST /api/check-in-responses` — Create single response
- `POST /api/check-in-responses/batch` — Create multiple responses
- `PUT /api/check-in-responses/:id` — Update response
- `DELETE /api/check-in-responses/:id` — Delete response

### Questions
- `GET /api/questions` — List all questions (ordered)
- `GET /api/questions/active` — List active questions
- `GET /api/questions/:id` — Get question by ID
- `GET /api/questions/type/:questionType` — Get questions by type (scale/yes_no/free_text)
- `POST /api/questions` — Create new question
- `PUT /api/questions/:id` — Update question
- `DELETE /api/questions/:id` — Delete question
- `PATCH /api/questions/:id/deactivate` — Deactivate question

### Attachments
- `GET /api/attachments` — List all attachments
- `GET /api/attachments/:id` — Get attachment by ID
- `GET /api/attachments/patient/:patientId` — Get attachments for patient
- `GET /api/attachments/checkin/:checkInId` — Get attachments for check-in
- `GET /api/attachments/type/:fileType` — Get attachments by type (voice_memo/document/image/other)
- `POST /api/attachments` — Create new attachment
- `PUT /api/attachments/:id` — Update attachment
- `DELETE /api/attachments/:id` — Delete attachment

---

## Project Structure
```
backend/
├── src/
│   ├── index.js                    (Server entry point)
│   ├── app.js                      (Express app & route setup)
│   ├── supabaseClient.js           (Supabase client initialization)
│   ├── routes/
│   │   ├── profiles.js
│   │   ├── patientDetails.js
│   │   ├── providerDetails.js
│   │   ├── providerPatients.js
│   │   ├── checkIns.js
│   │   ├── checkInResponses.js
│   │   ├── questions.js
│   │   └── attachments.js
│   ├── controllers/
│   │   ├── profileController.js
│   │   ├── patientDetailsController.js
│   │   ├── providerDetailsController.js
│   │   ├── providerPatientsController.js
│   │   ├── checkInController.js
│   │   ├── checkInResponseController.js
│   │   ├── questionController.js
│   │   └── attachmentController.js
│   ├── services/
│   │   ├── profileService.js
│   │   ├── patientDetailsService.js
│   │   ├── providerDetailsService.js
│   │   ├── providerPatientsService.js
│   │   ├── checkInService.js
│   │   ├── checkInResponseService.js
│   │   ├── questionService.js
│   │   └── attachmentService.js
│   ├── middleware/
│   │   └── errorHandler.js         (Global error & async handler)
│   └── utils/
│       └── httpResponse.js         (Standardized response formatter)
├── package.json
├── .env.example
└── README.md
```

---

## Example Usage

### Create a new profile
```bash
POST /api/profiles
{
  "auth_user_id": "uuid",
  "role": "patient",
  "first_name": "John",
  "last_name": "Doe",
  "email": "john@example.com"
}
```

### Create patient details
```bash
POST /api/patient-details
{
  "profile_id": "uuid",
  "date_of_birth": "1990-01-15",
  "phone": "555-1234",
  "allergies": ["peanuts", "penicillin"],
  "medical_conditions": ["diabetes"]
}
```

### Create a check-in
```bash
POST /api/check-ins
{
  "patient_id": "uuid",
  "check_in_date": "2024-01-15",
  "status": "not_started"
}
```

### Submit check-in responses
```bash
POST /api/check-in-responses/batch
{
  "responses": [
    {
      "check_in_id": "uuid",
      "question_id": "uuid",
      "numeric_value": 3
    },
    {
      "check_in_id": "uuid",
      "question_id": "uuid2",
      "text_value": "Feeling better"
    }
  ]
}
```

---

## Features
✅ Full CRUD operations for all 8 tables  
✅ Modular architecture (routes → controllers → services)  
✅ Standardized error handling  
✅ Async/await with try-catch  
✅ Supabase integration with real-time queries  
✅ CORS enabled for frontend communication  
✅ Environment variable configuration  

---

## Next Steps
- Add authentication middleware (JWT verification)
- Add input validation (express-validator / zod)
- Add unit tests (Jest/Vitest)
- Add API documentation (Swagger/OpenAPI)
- Deploy to production (Vercel, Railway, Render, etc.)
