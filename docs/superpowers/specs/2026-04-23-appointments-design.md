# Appointments — Design Spec

Status: approved for implementation planning
Date: 2026-04-23

## Summary

Patients can view their provider's available time slots and schedule,
reschedule, or cancel one-hour appointments. Providers define a recurring
weekly availability template and one-off time-off exceptions, and see their
booked appointments on a shared schedule. Appointments live in a new
`appointments` table shared across both sides.

## Scope decisions

All resolved during brainstorming:

- **Availability model:** recurring weekly template + time-off exceptions.
- **Slot length:** fixed 60 minutes, app-wide.
- **Who a patient can book with:** only providers in `provider_patients` with
  `status = 'active'`.
- **Confirmation:** auto-confirmed on booking (no pending/approved state).
- **Cancel/reschedule cutoff:** none. Either party may cancel or reschedule any
  time before `start_at`.
- **Booking horizon:** fixed 60 days.
- **Appointment notes:** single optional `reason` string at booking, visible to
  provider.
- **Timezones:** all times stored UTC (`timestamptz`); weekly template
  interpreted in provider's IANA zone stored on `provider_details`.
- **Auth/authorization:** **out of scope for this feature.** See the
  "Auth" section below.

## Data model

### Column addition

`provider_details.timezone text NOT NULL DEFAULT 'America/Chicago'` — IANA
timezone (e.g., `America/Chicago`). Used to interpret weekly template
`start_time` / `end_time`.

### New table: `provider_availability`

Weekly recurring availability template. A provider may have multiple rows per
day (e.g., 9–12 and 1–5).

```
id           uuid PK default gen_random_uuid()
provider_id  uuid NOT NULL FK → profiles(id)
day_of_week  smallint NOT NULL CHECK (day_of_week BETWEEN 0 AND 6)  -- 0 = Sunday
start_time   time NOT NULL
end_time     time NOT NULL CHECK (end_time > start_time)
created_at   timestamptz NOT NULL default now()
UNIQUE (provider_id, day_of_week, start_time)
```

### New table: `provider_availability_exceptions`

One-off "blocked" ranges (vacation, meeting, holiday). v1 only supports
blocking; no "extra availability outside template."

```
id           uuid PK default gen_random_uuid()
provider_id  uuid NOT NULL FK → profiles(id)
start_at     timestamptz NOT NULL
end_at       timestamptz NOT NULL CHECK (end_at > start_at)
reason       text
created_at   timestamptz NOT NULL default now()
```

### New table: `appointments`

```
id            uuid PK default gen_random_uuid()
provider_id   uuid NOT NULL FK → profiles(id)
patient_id    uuid NOT NULL FK → profiles(id)
start_at      timestamptz NOT NULL
end_at        timestamptz NOT NULL
              CHECK (end_at = start_at + interval '1 hour')
status        text NOT NULL DEFAULT 'scheduled'
              CHECK (status IN ('scheduled','cancelled','completed'))
reason        text
cancelled_at  timestamptz
cancelled_by  uuid FK → profiles(id)
created_at    timestamptz NOT NULL default now()
updated_at    timestamptz NOT NULL default now()
```

**Critical constraint — prevents double-booking at the DB level:**

```sql
CREATE UNIQUE INDEX appointments_unique_scheduled_slot
  ON appointments (provider_id, start_at)
  WHERE status = 'scheduled';
```

Cancelled rows are kept for history and do not block rebooking the same slot.

## Slot generation

Pure function; result is computed per-request, never persisted.

**Signature:** `getAvailability(provider_id, from_date, to_date) → [{ start_at, end_at }]`

`from_date` / `to_date` are clamped to `[today, today + 60 days]` in the
provider's timezone.

**Algorithm:**

1. Load `provider_details.timezone`.
2. Load the provider's `provider_availability` rows.
3. For each date in `[from_date, to_date]`:
   - For each template row whose `day_of_week` matches, emit hourly slot
     starts from `start_time` up to `end_time - 1h` **in the provider's
     timezone**, convert each to UTC.
4. Load `provider_availability_exceptions` overlapping the range; drop any
   slot whose `[start, start + 1h)` intersects an exception.
5. Load `appointments` in the range with `status = 'scheduled'`; drop any slot
   whose `start_at` matches one.
6. Drop slots with `start_at <= now()`.
7. Return the remaining slots sorted ascending.

**Dependency:** add `luxon` to the backend for timezone-aware date math.

**Booking race:** the unique partial index is the authoritative guard. Two
simultaneous `POST`s for the same slot → one succeeds, the other raises
Postgres error 23505, which the controller maps to HTTP 409.

**Reschedule:** single `UPDATE` of `start_at` / `end_at` / `updated_at`; the
unique index also protects reschedule from colliding with an existing booking.

## API surface

All new endpoints follow the existing `httpResponse` conventions.

### Appointments — `/api/appointments`

- `GET /availability/:providerId?from=YYYY-MM-DD&to=YYYY-MM-DD` — computed
  slots. `from`/`to` default to today and today+60.
- `GET /?patient_id=:id` — appointments for a patient (embeds provider name).
- `GET /?provider_id=:id` — appointments for a provider (embeds patient name).
- `GET /:id` — single appointment.
- `POST /` — book. Body: `{ provider_id, patient_id, start_at, reason? }`.
  Server derives `end_at = start_at + 1h`. Validates:
  - `patient_id` is linked to `provider_id` in `provider_patients` with
    `status = 'active'`,
  - `start_at` is in the future and within the 60-day horizon,
  - slot falls on a template hour boundary (implicitly enforced by unique index
    + availability computation; the controller re-runs availability to give a
    clean 409 rather than a raw DB error when possible).
- `PATCH /:id` — reschedule. Body: `{ start_at }`. Same validations as `POST`.
- `DELETE /:id` — cancel. Soft: sets `status='cancelled'`, `cancelled_at`,
  `cancelled_by`. Row is retained.

### Provider availability template — `/api/provider-availability`

- `GET /:providerId` — list weekly rows.
- `POST /` — body `{ provider_id, day_of_week, start_time, end_time }`.
- `DELETE /:id`.

No `PUT`. Edits are delete-then-recreate.

### Provider availability exceptions — `/api/provider-availability-exceptions`

- `GET /:providerId?from=&to=`
- `POST /` — body `{ provider_id, start_at, end_at, reason? }`.
- `DELETE /:id`.

### Provider timezone

Set via the existing `PUT /api/provider-details/:id`. No new endpoint.

## Backend structure

Follows existing controller/service/route pattern.

New files:

```
backend/src/routes/appointments.js
backend/src/routes/providerAvailability.js
backend/src/routes/providerAvailabilityExceptions.js

backend/src/controllers/appointmentController.js
backend/src/controllers/providerAvailabilityController.js
backend/src/controllers/providerAvailabilityExceptionController.js

backend/src/services/appointmentService.js
backend/src/services/providerAvailabilityService.js
backend/src/services/providerAvailabilityExceptionService.js
backend/src/services/availabilityService.js   -- slot-generation logic
```

`availabilityService` is the only non-CRUD service; it composes the three
tables to compute slots.

Wire all three new routers in `backend/src/app.js`.

## Frontend — patient side

### New page: `/book-appointment`

Component: `frontend/src/pages/BookAppointmentView.jsx`.

Layout (top-down):

1. **Provider picker** — MUI `Select` populated from `GET /api/provider-patients?patient_id=<me>` filtered to active links. Usually one option; still a dropdown for future-proofing.
2. **Date picker** — MUI `DatePicker`, `minDate = today`, `maxDate = today + 60 days`.
3. **Slot list** — on date change, call `GET /api/appointments/availability/:providerId?from=<date>&to=<date>`. Render as a responsive grid of clickable chips ("9:00 AM", …). Empty state: "No availability this day."
4. **Reason field** — optional `TextField multiline`.
5. **Confirm button** — `POST /api/appointments`. On HTTP 409: toast "That slot was just booked — please pick another," refresh slot list.

### New page: `/my-appointments`

Component: `frontend/src/pages/MyAppointmentsView.jsx`.

- Two sections: **Upcoming** (status=scheduled, start_at >= now) and **Past**.
- Each upcoming row: provider name, date/time, reason, **Reschedule** and
  **Cancel** buttons.
- **Reschedule** opens a modal that reuses the date + slot picker, then
  `PATCH /api/appointments/:id`.
- **Cancel** confirms, then `DELETE /api/appointments/:id`.

### Navigation

- Add "Appointments" entry to `NavigationDrawer.jsx` for patients → links to
  `/my-appointments`.
- From `/my-appointments`, a "Book new" button → `/book-appointment`.
- Route entries in `frontend/src/routes/router.jsx` wrapped in `PrivateRoute`.

### Services

New `frontend/src/services/appointmentService.js` — mirrors the existing
service pattern (`BASE_URL` constant, static methods, fetch-based, maps
non-2xx to thrown errors).

## Frontend — provider side

### Replace mocked view

`frontend/src/pages/DoctorAppointmentsView.jsx` currently renders
`mockAppointments`. Rewrite to fetch `GET /api/appointments?provider_id=<me>`.

Show upcoming list: patient name, date/time, reason. Each row gets **Cancel**
and **Reschedule** buttons. Reschedule opens the slot picker modal against the
provider's own availability. Cancellation sets `cancelled_by` to the
provider's profile id.

### New page: `/doctor/availability`

Component: `frontend/src/pages/DoctorAvailabilityView.jsx`.

Two stacked sections:

- **Weekly schedule** — for each weekday (Sun–Sat), list blocks as
  "HH:MM – HH:MM" with a "Remove" button and an "Add block" button per day
  that opens a dialog with two time pickers.
- **Time off** — list upcoming exceptions. "Add time off" dialog with
  start/end datetime + optional reason.
- **Timezone** — read-only current value with an "Edit" that `PUT`s to
  `/api/provider-details/:id`.

### Navigation

- Add "Availability" entry to `NavigationDrawer.jsx` for providers →
  `/doctor/availability`.
- Route entry in `router.jsx` wrapped in `PrivateRoute`.

## Error handling and edge cases

| Case | Behavior |
|---|---|
| Patient with no active provider link | Booking page shows empty dropdown + explainer: "You don't have a provider linked yet." |
| Provider with no availability rows | Slot list is empty for all dates. Patient sees "No availability." Provider's `/doctor/availability` page prompts them to add a block. |
| Provider deletes a weekly block that has future booked appointments | Delete succeeds and only affects future slot generation; existing bookings stay. The Remove dialog warns "N upcoming appointments fall in this block. They will not be cancelled." before confirming. |
| Provider adds an exception that overlaps booked appointments | Insert succeeds; response includes a warning list of affected appointments so the frontend can show "N appointments fall within this time off — cancel them?" The provider must cancel them explicitly. |
| Slot taken between list render and Confirm click | `POST` returns 409 → toast + slot-list refresh. |
| Request outside 60-day horizon or in the past | 400 "Appointment must be between now and 60 days out." |
| Patient attempts to book with a provider they are not linked to | 403 "You are not linked to this provider." (Enforced by the `POST` validator only; no request-level auth exists — see "Auth" below.) |

## Auth

**Explicitly out of scope for this feature.** The backend currently has no JWT
verification middleware on any route, and all services use the Supabase
service-role client (which bypasses RLS). The appointments feature inherits
this posture:

- Through the UI, patients see only their own appointments and providers see
  only their own, because the frontend scopes its queries by the logged-in
  user's id.
- Anyone with `curl` and a patient or appointment UUID can read, modify, or
  cancel any appointment. Same as the rest of the API.

This is accepted for now, consistent with the rest of the codebase. Closing
this gap is a separate effort across the whole backend (a JWT-verifying
middleware + per-endpoint ownership checks), not a piece of this spec.

## Out of scope for v1

- Notifications and reminders (email/SMS).
- No-show tracking or enforcement.
- Recurring appointment series.
- Provider-initiated bookings on a patient's behalf.
- Appointment types with variable durations.
- Marketplace-style booking with unlinked providers.
- Backend auth middleware (tracked separately).

## Migrations

One SQL migration adds:

1. `ALTER TABLE provider_details ADD COLUMN timezone text NOT NULL DEFAULT 'America/Chicago'`.
2. `CREATE TABLE provider_availability (...)`.
3. `CREATE TABLE provider_availability_exceptions (...)`.
4. `CREATE TABLE appointments (...)`.
5. `CREATE UNIQUE INDEX appointments_unique_scheduled_slot ON appointments (provider_id, start_at) WHERE status = 'scheduled'`.
6. Update `docs/database-schema.md` to reflect the new tables and column.
