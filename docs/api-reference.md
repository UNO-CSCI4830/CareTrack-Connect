# Care-Track Database API Reference
This document will cover the Supabase database schema and the various client APIs for the Care-Track app.  The data access goes through the [Supabase JavaScript client](https://supabase.com/docs/reference/javascript/introduction), which uses the automatically generated REST API with Row Level Security being enforced automatically.

## Setup
```bash
npm install @supabase/supabase-js
```

```javascript
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,              // Your project URL
  import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY   // Your publishable key: sb_publishable_...
)
```

## Authentication
Supabase Auth handles the signup, login, and session management.  Once someone signs up, a database trigger creates their `profiles` row and the proper detail table (either `patient_details` or `provider_details`).

### Sign Up - Patient
```javascript
const { data, error } = await supabase.auth.signUp({
  email: 'patient@example.com',
  password: 'securepassword',
  options: {
    data: {
      first_name: 'Jane',
      last_name: 'Doe',
      role: 'patient'
    }
  }
})
```

### Sign Up - Provider
```javascript
const { data, error } = await supabase.auth.signUp({
  email: 'doctor@example.com',
  password: 'securepassword',
  options: {
    data: {
      first_name: 'Dr. Smith',
      last_name: 'Johnson',
      role: 'provider'
    }
  }
})
```

**Important:** The database trigger creates the `profiles` row automatically when `signUp` completes. **Do not manually insert into the `profiles` table** — this will fail with an RLS violation (`"new row violates row-level security policy for table profiles"`). If you need the profile data after signup, use `.select()` to fetch the trigger-created row instead.


### Sign In
```javascript
const { data, error } = await supabase.auth.signInWithPassword({
  email: 'patient@example.com',
  password: 'securepassword'
})
```

### Sign Out
```javascript
const { error } = await supabase.auth.signOut()
```

### Get Current User
```javascript
const { data: { user } } = await supabase.auth.getUser()
```

---

## Tables Overview

| Table | Purpose | Accessed By |
|-------|---------|-------------|
| `profiles` | Basic user info (name, email, role) | Own user |
| `patient_details` | DOB, contact, emergency contact, health metadata | Patient (own), assigned providers |
| `provider_details` | Specialty, clinic, license info | Provider (own), assigned patients |
| `provider_patients` | Links providers to their patients | Both sides of the relationship |
| `questions` | The 10 daily check-in questions + 1 free text | All authenticated users |
| `check_ins` | One per patient per day, tracks completion status | Patient (own), assigned providers |
| `check_in_responses` | Individual answers to each question per check-in | Patient (own), assigned providers |
| `alerts` | Auto-generated risk threshold alerts | Assigned providers |
| `attachments` | Voice memos, uploaded files | Patient (own), assigned providers |
| `provider_availability` | Weekly recurring availability template per provider | Provider (own), patients booking slots |
| `provider_availability_exceptions` | One-off time-off / blocked ranges | Provider (own), patients booking slots |
| `appointments` | Booked 1-hour slots between a patient and provider | Both sides of the relationship |

**Row Level Security (RLS)** is enabled on all tables. Users can only access data they are authorized to see.

---

## Profiles
These are created automatically at signup, and every user has one profile row.

### Get Current User's Profile
```javascript
const { data: profile, error } = await supabase
  .from('profiles')
  .select('*')
  .single()
```

Since RLS restricts things to the current user, `.single()` returns just their row.

### Get Profile After Signup
```javascript
const { data: profile, error } = await supabase
  .from('profiles')
  .select('*')
  .eq('auth_user_id', authUser.id)
  .single()
```

## Update Profile
```javascript
const { error } = await supabase
  .from('profiles')
  .update({ first_name: 'Janet', last_name: 'Smith' })
  .eq('id', profileId)
```

### Schema
| Column | Type | Notes |
|--------|------|-------|
| `id` | uuid | Primary key |
| `auth_user_id` | uuid | FK → auth.users, unique |
| `role` | text | `'patient'` or `'provider'` |
| `first_name` | text | |
| `last_name` | text | |
| `email` | text | |
| `created_at` | timestamptz | Auto-set |

---

## Patient Details
Where the clinical and personal info of patients is stored.  One row per patient, and created automatically with empty data to be filled in later.

### Get Own Patient Details
```javascript
const { data, error } = await supabase
  .from('patient_details')
  .select('*')
  .single()
```

### Update Patient Details
```javascript
const { error } = await supabase
  .from('patient_details')
  .update({
    date_of_birth: '1955-03-15',
    phone: '402-555-0123',
    emergency_contact_name: 'John Doe',
    emergency_contact_phone: '402-555-0456',
    emergency_contact_relation: 'Spouse',
    allergies: ['Penicillin', 'Latex'],
    current_medications: ['Levodopa 100mg', 'Carbidopa 25mg'],
    medical_conditions: ["Parkinson's Disease", 'Hypertension'],
    diagnosis_date: '2020-06-01',
    disease_stage: 'Stage 2'
  })
  .eq('profile_id', profileId)
```

### Provider: Get Assigned Patient's Details
```javascript
// RLS automatically restricts to assigned patients only
const { data, error } = await supabase
  .from('patient_details')
  .select('*, profiles(first_name, last_name, email)')
  .eq('profile_id', patientProfileId)
  .single()
```

### Schema
| Column | Type | Notes |
|--------|------|-------|
| `id` | uuid | Primary key |
| `profile_id` | uuid | FK → profiles, unique |
| `date_of_birth` | date | |
| `phone` | text | |
| `address_line1` | text | |
| `address_line2` | text | |
| `city` | text | |
| `state` | text | |
| `zip_code` | text | |
| `emergency_contact_name` | text | |
| `emergency_contact_phone` | text | |
| `emergency_contact_relation` | text | e.g. 'Spouse', 'Child' |
| `allergies` | text[] | Array of strings |
| `current_medications` | text[] | Array of strings |
| `medical_conditions` | text[] | Array of strings |
| `diagnosis_date` | date | When PD was diagnosed |
| `disease_stage` | text | Hoehn & Yahr stage |
| `notes` | text | General notes |
| `updated_at` | timestamptz | Auto-updated on edit |
| `created_at` | timestamptz | Auto-set |

---

## Provider Details
Stores the professional info of providers. One row per and is created automatically at signup.

### Get Own Provider Details
```javascript
const { data, error } = await supabase
  .from('provider_details')
  .select('*')
  .single()
```

### Update Provider Details
```javascript
const { error } = await supabase
  .from('provider_details')
  .update({
    specialty: 'Neurology',
    license_number: 'MD-123456',
    clinic_name: 'Lincoln Neurology Associates',
    clinic_phone: '402-555-0789',
    clinic_address: '123 Medical Center Dr, Lincoln, NE 68508',
    npi_number: '1234567890'
  })
  .eq('profile_id', profileId)
```

### Patient: View Their Provider's Info
```javascript
// RLS restricts to providers assigned to this patient
const { data, error } = await supabase
  .from('provider_details')
  .select('*, profiles(first_name, last_name)')
```

### Schema
| Column | Type | Notes |
|--------|------|-------|
| `id` | uuid | Primary key |
| `profile_id` | uuid | FK → profiles, unique |
| `specialty` | text | e.g. 'Neurology' |
| `license_number` | text | |
| `clinic_name` | text | |
| `clinic_phone` | text | |
| `clinic_address` | text | |
| `npi_number` | text | National Provider Identifier |
| `accepting_patients` | boolean | Default: true |
| `timezone` | text | IANA zone used to interpret the weekly availability template. Default: `'America/Chicago'` |
| `updated_at` | timestamptz | Auto-updated on edit |
| `created_at` | timestamptz | Auto-set |

---

## Provider-Patient Relationships
Links providers and patients. Uses RLS for data security.

### Provider: Get Patient List
```javascript
const { data: patients, error } = await supabase
  .from('provider_patients')
  .select(`
    *,
    patient:profiles!patient_id(id, first_name, last_name, email)
  `)
  .eq('status', 'active')
```

### Patient: See Their Providers
```javascript
const { data: providers, error } = await supabase
  .from('provider_patients')
  .select(`
    *,
    provider:profiles!provider_id(id, first_name, last_name, email)
  `)
  .eq('status', 'active')
```

### Assign a Patient to a Provider
```javascript
const { error } = await supabase
  .from('provider_patients')
  .insert({
    provider_id: providerProfileId,
    patient_id: patientProfileId
  })
```

### Deactivate a Relationship
```javascript
const { error } = await supabase
  .from('provider_patients')
  .update({ status: 'inactive' })
  .eq('provider_id', providerProfileId)
  .eq('patient_id', patientProfileId)
```

### Schema
| Column | Type | Notes |
|--------|------|-------|
| `id` | uuid | Primary key |
| `provider_id` | uuid | FK → profiles |
| `patient_id` | uuid | FK → profiles |
| `status` | text | `'active'` or `'inactive'` |
| `created_at` | timestamptz | Auto-set |

**NOTE:** Uses unique IDs (provider_id, patient_id) to prevent duplicate assignments.

---

## Questions
The 10 daily check-in questions plus 1 optional free text field. Managed by admins.  This is read-only for all others.

### Get Active Questions (in order)
```javascript
const { data: questions, error } = await supabase
  .from('questions')
  .select('*')
  .eq('is_active', true)
  .order('display_order')
```

### Schema
| Column | Type | Notes |
|--------|------|-------|
| `id` | uuid | Primary key |
| `question_text` | text | The question displayed to the patient |
| `question_type` | text | `'scale'`, `'yes_no'`, or `'free_text'` |
| `scale_min` | int | Default: 0 |
| `scale_max` | int | Default: 4 |
| `scale_min_label` | text | Default: 'None' (label for 0) |
| `scale_max_label` | text | Default: 'Very severe' (label for 4) |
| `display_order` | int | Controls sequence in check-in form |
| `is_active` | boolean | Set false to retire (don't delete) |
| `created_at` | timestamptz | Auto-set |

### Current Questions (0 = good, 4 = bad for all)
| # | Question | Type | 0 Label | 4 Label |
|---|----------|------|---------|---------|
| 1 | Tremor severity today? | scale | None | Very severe |
| 2 | How stiff did your body feel today? | scale | None | Very severe |
| 3 | How slow were your movements today? | scale | None | Very severe |
| 4 | Any balance issues or near-falls today? | scale | None | Very severe |
| 5 | How much did symptoms break through your medication today? | scale | None | Very severe |
| 6 | Did you experience "OFF" periods today? | scale | None | Very severe |
| 7 | How poorly did you sleep last night? | scale | Not at all | Very poorly |
| 8 | Did you feel unusually tired or fatigued today? | scale | None | Very severe |
| 9 | How difficult was it to perform daily activities? | scale | None | Very severe |
| 10 | How low was your mood today? | scale | Not at all | Very low |
| 11 | Any new symptoms or concerns today? | free_text | — | — |

---

## Check-ins
One row per patient per day. Represents a single daily journal entry.

### Get Today's Check-in
```javascript
const today = new Date().toISOString().split('T')[0]

const { data: checkIn, error } = await supabase
  .from('check_ins')
  .select('*')
  .eq('check_in_date', today)
  .maybeSingle()  // Returns null if none exists (not an error)
```

### Start a New Check-in
```javascript
const { data: checkIn, error } = await supabase
  .from('check_ins')
  .insert({
    patient_id: profileId,
    check_in_date: new Date().toISOString().split('T')[0],
    status: 'in_progress',
    started_at: new Date().toISOString()
  })
  .select()
  .single()
```

### Complete a Check-in
```javascript
const { error } = await supabase
  .from('check_ins')
  .update({
    status: 'complete',
    completed_at: new Date().toISOString()
  })
  .eq('id', checkInId)
```

### Get Check-in History (last 30 days)
```javascript
const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
  .toISOString().split('T')[0]

const { data: history, error } = await supabase
  .from('check_ins')
  .select('*, check_in_responses(*)')
  .gte('check_in_date', thirtyDaysAgo)
  .order('check_in_date', { ascending: false })
```

### Provider: Get a Patient's Check-ins
```javascript
// RLS ensures only assigned patients are visible
const { data, error } = await supabase
  .from('check_ins')
  .select('*, check_in_responses(*, questions(question_text))')
  .eq('patient_id', patientProfileId)
  .order('check_in_date', { ascending: false })
  .limit(7)  // Last 7 days for weekly report
```

### Schema
| Column | Type | Notes |
|--------|------|-------|
| `id` | uuid | Primary key |
| `patient_id` | uuid | FK → profiles |
| `check_in_date` | date | Default: today |
| `status` | text | `'not_started'`, `'in_progress'`, `'complete'` |
| `started_at` | timestamptz | When patient began |
| `completed_at` | timestamptz | When patient submitted |
| `created_at` | timestamptz | Auto-set |

**NOTE:** (patient_id, check_in_date) are used to enforce one check-in per day.

---

## Check-in Responses
This is where the answers to each question within a check-in are.

### Save a Single Response (upsert)
```javascript
const { error } = await supabase
  .from('check_in_responses')
  .upsert({
    check_in_id: checkInId,
    question_id: questionId,
    numeric_value: 2,        // For scale questions (0-4)
    // text_value: '...',    // For free_text questions
    answered_at: new Date().toISOString()
  }, {
    onConflict: 'check_in_id,question_id'
  })
```

**NOTE:** `upsert` with `onConflict` means: insert if new, update if the patient already answered this question. This handles the "Save and move Next" and "Edit Check-in" flows from the UI.

### Save All Responses at Once (batch)
```javascript
const responses = answers.map(a => ({
  check_in_id: checkInId,
  question_id: a.questionId,
  numeric_value: a.type !== 'free_text' ? a.value : null,
  text_value: a.type === 'free_text' ? a.value : null,
  answered_at: new Date().toISOString()
}))

const { error } = await supabase
  .from('check_in_responses')
  .upsert(responses, { onConflict: 'check_in_id,question_id' })
```

### Get a Specific Symptom Over Time (for charts)
```javascript
// Example: Get tremor scores for the last 30 days
const { data, error } = await supabase
  .from('check_in_responses')
  .select(`
    numeric_value,
    answered_at,
    check_ins!inner(check_in_date, patient_id),
    questions!inner(question_text)
  `)
  .eq('question_id', tremorQuestionId)
  .eq('check_ins.patient_id', patientProfileId)
  .gte('check_ins.check_in_date', thirtyDaysAgo)
  .order('check_ins(check_in_date)', { ascending: true })
```

### Schema
| Column | Type | Notes |
|--------|------|-------|
| `id` | uuid | Primary key |
| `check_in_id` | uuid | FK → check_ins |
| `question_id` | uuid | FK → questions |
| `numeric_value` | int | For scale (0-4) and yes_no (0 or 1) |
| `text_value` | text | For free_text questions |
| `answered_at` | timestamptz | Auto-set |

**NOTE:** Uses constraints on (check_in_id, question_id) to prevent duplicate or extra answers for a question per day.

---

## Alerts
Alerts are generated automatically when a patient submits check-in responses that exceed predefined risk thresholds. There are two types of alerts:

- **Critical single response:** Patient scores 4/4 on tremor severity, balance issues/near-falls, or medication breakthrough.
- **High total score:** Patient's total symptom score across all scale questions exceeds 25/40 (warning) or 30/40 (critical).

Alerts are created by the backend during check-in response submission. They do not need to be created manually.

### Get Alerts for a Provider
GET /api/alerts/provider/:providerId

### Get New (Unreviewed) Alerts for a Provider
GET /api/alerts/provider/:providerId/new

### Get Alerts for a Patient
GET /api/alerts/patient/:patientId

### Get a Single Alert
GET /api/alerts/:id

### Update Alert Status
PATCH /api/alerts/:id/status
Content-Type: application/json
{
"status": "reviewed"   // "new", "reviewed", or "dismissed"
}

### Schema
| Column | Type | Notes |
|--------|------|-------|
| `id` | uuid | Primary key |
| `patient_id` | uuid | FK → profiles |
| `provider_id` | uuid | FK → profiles |
| `check_in_id` | uuid | FK → check_ins |
| `alert_type` | text | `'high_total_score'` or `'critical_single_response'` |
| `severity` | text | `'warning'` or `'critical'` |
| `message` | text | Human-readable alert description |
| `question_id` | uuid | FK → questions, set for critical single response alerts |
| `score_value` | int | The individual score that triggered the alert |
| `total_score` | int | The aggregate score that triggered the alert |
| `status` | text | `'new'`, `'reviewed'`, or `'dismissed'` |
| `created_at` | timestamptz | Auto-set |
| `reviewed_at` | timestamptz | Set when status changes to reviewed or dismissed |

### Alert Thresholds
| Trigger | Condition | Severity |
|---------|-----------|----------|
| Tremor severity | Score = 4/4 | Critical |
| Balance issues / near-falls | Score = 4/4 | Critical |
| Medication breakthrough | Score = 4/4 | Critical |
| Total symptom score | 25-29/40 | Warning |
| Total symptom score | 30+/40 | Critical |

**NOTE:** Alert generation is wrapped in a try/catch so that failures never prevent check-in responses from being saved. If alert generation fails, the error is logged to the backend console but the check-in submission succeeds normally.

---

## Attachments
Voice memos and uploaded files. Files are stored in Supabase Storage.  This table just holds metadata.

### Upload a File
```javascript
// 1. Upload to Supabase Storage
const fileName = `${profileId}/${Date.now()}_${file.name}`
const { data: upload, error: uploadError } = await supabase.storage
  .from('attachments')  // Storage bucket name
  .upload(fileName, file)

// 2. Save metadata to the attachments table
const { error } = await supabase
  .from('attachments')
  .insert({
    patient_id: profileId,
    check_in_id: checkInId,       // optional, can be null
    file_type: 'document',         // 'voice_memo', 'document', 'image', 'other'
    storage_path: upload.path,
    file_name: file.name
  })
```

### Upload a Voice Memo
```javascript
const fileName = `${profileId}/voice/${Date.now()}.webm`
const { data: upload, error: uploadError } = await supabase.storage
  .from('attachments')
  .upload(fileName, audioBlob, { contentType: 'audio/webm' })

const { error } = await supabase
  .from('attachments')
  .insert({
    patient_id: profileId,
    check_in_id: checkInId,
    file_type: 'voice_memo',
    storage_path: upload.path,
    file_name: `Voice memo ${new Date().toLocaleDateString()}`,
    duration_secs: recordingDuration
  })
```

### Get Patient's Attachments
```javascript
const { data: files, error } = await supabase
  .from('attachments')
  .select('*')
  .order('created_at', { ascending: false })
```

### Get a Download URL
```javascript
const { data } = await supabase.storage
  .from('attachments')
  .createSignedUrl(storagePath, 3600)  // URL valid for 1 hour

// data.signedUrl contains the download link
```

### Schema
| Column | Type | Notes |
|--------|------|-------|
| `id` | uuid | Primary key |
| `patient_id` | uuid | FK → profiles |
| `check_in_id` | uuid | FK → check_ins, nullable |
| `file_type` | text | `'voice_memo'`, `'document'`, `'image'`, `'other'` |
| `storage_path` | text | Path in Supabase Storage bucket |
| `file_name` | text | Original filename for display |
| `duration_secs` | int | For voice memos |
| `notes` | text | Optional description |
| `created_at` | timestamptz | Auto-set |

---

## Common Usage Patterns

### Create Profile using Service
The signup trigger creates the profile automatically. **No need to insert into `profiles`**.  Sign up and then fetch:

```javascript
static async createProfile({ first_name, last_name, email, password, role }) {
  // Step 1: Sign up — the DB trigger creates the profile row automatically
  const { data: authData, error: authError } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        first_name,
        last_name,
        role,
      },
    },
  });

  if (authError) throw authError;

  const authUser = authData.user;
  if (!authUser) {
    throw new Error("User was not created successfully.");
  }

  // Step 2: Fetch the profile that the trigger already created
  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("*")
    .eq("auth_user_id", authUser.id)
    .single();

  if (profileError) throw profileError;

  return { user: authUser, profile };
}
```

### Full Dashboard Load (Patient)
Load everything the patient dashboard needs:

```javascript
const today = new Date().toISOString().split('T')[0]

const [profileRes, checkInRes, questionsRes, attachmentsRes] = await Promise.all([
  supabase.from('profiles').select('*').single(),
  supabase.from('check_ins').select('*').eq('check_in_date', today).maybeSingle(),
  supabase.from('questions').select('*').eq('is_active', true).order('display_order'),
  supabase.from('attachments').select('*').order('created_at', { ascending: false }).limit(5)
])
```

### Weekly Report Data (Provider)
```javascript
const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
  .toISOString().split('T')[0]

const { data, error } = await supabase
  .from('check_ins')
  .select(`
    check_in_date,
    status,
    check_in_responses(
      numeric_value,
      text_value,
      questions(question_text, question_type, display_order)
    )
  `)
  .eq('patient_id', patientProfileId)
  .gte('check_in_date', sevenDaysAgo)
  .order('check_in_date', { ascending: true })
```

### Daily Symptom Burden Score
```javascript
// Total score for a single check-in (out of 40 max)
// Lower is better — 0 means no symptoms
const { data, error } = await supabase
  .from('check_in_responses')
  .select('numeric_value, questions(question_type)')
  .eq('check_in_id', checkInId)

const totalScore = data
  ?.filter(r => r.questions.question_type === 'scale')
  .reduce((sum, r) => sum + (r.numeric_value || 0), 0)
```

---

## Appointments
Patients schedule 1-hour appointments against a provider's weekly availability template. Backed by three tables (`provider_availability`, `provider_availability_exceptions`, `appointments`) and served by the Express backend at `/api/appointments`, `/api/provider-availability`, and `/api/provider-availability-exceptions`.

Unlike the tables above, the appointments feature is accessed via the Express backend (not the Supabase client from the browser). The backend uses the Supabase service-role key and does not enforce RLS on these tables; authorization is deferred to a future effort (see the appointments design spec).

### Provider Availability — Weekly Template
The provider's recurring weekly schedule. A provider may have multiple blocks per day (e.g., 9–12 and 1–5). Each block is interpreted in the provider's `provider_details.timezone`.

```javascript
// List the provider's weekly blocks
const res = await fetch(`/api/provider-availability/${providerProfileId}`)
const { data } = await res.json()

// Add a block (e.g., Monday 9am–12pm)
await fetch('/api/provider-availability', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    provider_id: providerProfileId,
    day_of_week: 1,           // 0 = Sunday, 6 = Saturday
    start_time: '09:00:00',
    end_time: '12:00:00',
  }),
})

// Remove a block (edits are delete-then-recreate)
await fetch(`/api/provider-availability/${blockId}`, { method: 'DELETE' })
```

#### Schema (`provider_availability`)
| Column | Type | Notes |
|--------|------|-------|
| `id` | uuid | Primary key |
| `provider_id` | uuid | FK → profiles |
| `day_of_week` | smallint | 0 = Sunday … 6 = Saturday |
| `start_time` | time | Local time in provider's timezone |
| `end_time` | time | Must be `> start_time` |
| `created_at` | timestamptz | Auto-set |

Unique constraint: `(provider_id, day_of_week, start_time)`.

### Provider Availability — Time-Off Exceptions
One-off blocked ranges (vacation, meeting, holiday). Exceptions only *block*; they cannot add availability outside the weekly template.

```javascript
// List exceptions for a provider
await fetch(`/api/provider-availability-exceptions/${providerProfileId}`)

// Add a time-off range
await fetch('/api/provider-availability-exceptions', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    provider_id: providerProfileId,
    start_at: '2026-07-01T14:00:00Z',
    end_at:   '2026-07-05T22:00:00Z',
    reason: 'Vacation',
  }),
})

// Remove
await fetch(`/api/provider-availability-exceptions/${exceptionId}`, { method: 'DELETE' })
```

#### Schema (`provider_availability_exceptions`)
| Column | Type | Notes |
|--------|------|-------|
| `id` | uuid | Primary key |
| `provider_id` | uuid | FK → profiles |
| `start_at` | timestamptz | UTC start |
| `end_at` | timestamptz | Must be `> start_at` |
| `reason` | text | Optional |
| `created_at` | timestamptz | Auto-set |

### Appointments — Slot Discovery
Computed on demand from the template, exceptions, and existing bookings. Never persisted. Returns 1-hour slots clamped to `[today, today + 60 days]` in the provider's timezone.

```javascript
// Get open slots for a date range
const res = await fetch(
  `/api/appointments/availability/${providerProfileId}?from=2026-05-04&to=2026-05-10`
)
const { data } = await res.json()
// data: [{ start_at: "2026-05-04T14:00:00.000Z", end_at: "2026-05-04T15:00:00.000Z" }, ...]
```

### Appointments — Book / Reschedule / Cancel
Bookings require an `active` row in `provider_patients` linking the patient to the provider. Duplicate `scheduled` bookings for the same `(provider_id, start_at)` are rejected with HTTP 409 (enforced by a partial unique index).

```javascript
// List a patient's appointments (embeds provider name)
await fetch(`/api/appointments?patient_id=${patientProfileId}`)

// List a provider's appointments (embeds patient name)
await fetch(`/api/appointments?provider_id=${providerProfileId}`)

// Book — server derives end_at = start_at + 1h
await fetch('/api/appointments', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    provider_id: providerProfileId,
    patient_id:  patientProfileId,
    start_at:    '2026-05-04T15:00:00Z',
    reason:      'Follow-up',          // optional
  }),
})
// → 201 on success, 400 if outside the 60-day horizon or in the past,
//   403 if the patient isn't linked to the provider, 409 on race.

// Reschedule
await fetch(`/api/appointments/${appointmentId}`, {
  method: 'PATCH',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ start_at: '2026-05-05T16:00:00Z' }),
})

// Cancel (soft — row is retained for history, slot becomes bookable again)
await fetch(`/api/appointments/${appointmentId}`, {
  method: 'DELETE',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ cancelled_by: profileIdOfTheCanceller }),
})
```

#### Schema (`appointments`)
| Column | Type | Notes |
|--------|------|-------|
| `id` | uuid | Primary key |
| `provider_id` | uuid | FK → profiles |
| `patient_id` | uuid | FK → profiles |
| `start_at` | timestamptz | UTC |
| `end_at` | timestamptz | Must equal `start_at + 1 hour` |
| `status` | text | `'scheduled'` \| `'cancelled'` \| `'completed'` (default `'scheduled'`) |
| `reason` | text | Optional, set at booking |
| `cancelled_at` | timestamptz | Set on cancel |
| `cancelled_by` | uuid | FK → profiles, set on cancel |
| `created_at` | timestamptz | Auto-set |
| `updated_at` | timestamptz | Bumped on reschedule / cancel |

**Double-booking guard:**
```sql
CREATE UNIQUE INDEX appointments_unique_scheduled_slot
  ON public.appointments (provider_id, start_at)
  WHERE status = 'scheduled';
```
Cancelled rows do not occupy the slot — rebooking after a cancellation is allowed.

---

## Storage Setup
NOTE: Must create a storage bucket in the Supabase Dashboard first:

1. Go to **Storage** in the left sidebar
2. Click **New Bucket**
3. Name it `attachments`
4. Set it to **Private** (files accessed via signed URLs only)

---
