# Appointments Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Patients schedule, reschedule, and cancel 1-hour appointments against a provider's weekly availability template; providers manage availability and see booked appointments.

**Architecture:** New `appointments`, `provider_availability`, and `provider_availability_exceptions` tables. Backend adds a stateless slot-generation service that composes the template + exceptions + existing bookings into available slots on demand. Frontend adds a patient booking flow, a patient "my appointments" list, a provider availability editor, and rewrites the mocked `DoctorAppointmentsView` to use real data.

**Tech Stack:** Node/Express + `@supabase/supabase-js` on the backend, `luxon` for timezone math, Vitest for backend unit tests on the slot-generation logic. React 19 + MUI v7 + `react-router-dom` v7 on the frontend. Supabase (Postgres) for data.

**Spec:** `docs/superpowers/specs/2026-04-23-appointments-design.md`

**Testing approach:** The codebase currently has zero tests. This plan adds Vitest to the backend only, and tests only the slot-generation algorithm in `availabilityService` — the one piece of non-trivial logic. CRUD wrappers around Supabase and frontend views are verified via the manual smoke test in the final task.

**Auth:** Out of scope per the spec. Do not add middleware or ownership checks.

**Deferred from spec:** The spec mentioned a read-only timezone display with Edit on the provider availability page. This plan does not include that widget — providers in a non-default timezone should update `provider_details.timezone` via the existing `PUT /api/provider-details/:id` endpoint or the Supabase table editor until a UI is added. Default `America/Chicago` covers v1.

---

## File Structure

### New files

**Database**
- `backend/migrations/2026-04-23_appointments.sql` — schema migration to run in Supabase SQL editor.

**Backend**
- `backend/src/services/availabilityService.js` — slot-generation algorithm (the only non-CRUD service).
- `backend/src/services/appointmentService.js` — appointment CRUD.
- `backend/src/services/providerAvailabilityService.js` — weekly template CRUD.
- `backend/src/services/providerAvailabilityExceptionService.js` — time-off CRUD.
- `backend/src/controllers/appointmentController.js`
- `backend/src/controllers/providerAvailabilityController.js`
- `backend/src/controllers/providerAvailabilityExceptionController.js`
- `backend/src/routes/appointments.js`
- `backend/src/routes/providerAvailability.js`
- `backend/src/routes/providerAvailabilityExceptions.js`
- `backend/src/services/availabilityService.test.js` — Vitest unit tests.
- `backend/vitest.config.js`

**Frontend**
- `frontend/src/services/appointmentService.js`
- `frontend/src/services/providerAvailabilityService.js`
- `frontend/src/pages/BookAppointmentView.jsx`
- `frontend/src/pages/MyAppointmentsView.jsx`
- `frontend/src/pages/DoctorAvailabilityView.jsx`

### Modified files

- `backend/package.json` — add `luxon`, `vitest`, `test` script.
- `backend/src/utils/httpResponse.js` — add `conflict` helper.
- `backend/src/app.js` — wire three new routers.
- `frontend/src/pages/DoctorAppointmentsView.jsx` — rewrite against real API.
- `frontend/src/routes/router.jsx` — add three new routes.
- `frontend/src/components/NavigationDrawer.jsx` — add "Appointments" link.
- `docs/database-schema.md` — add new tables and `provider_details.timezone`.

---

## Task 1: Database migration

**Files:**
- Create: `backend/migrations/2026-04-23_appointments.sql`

- [ ] **Step 1: Create migration SQL file**

Create `backend/migrations/2026-04-23_appointments.sql` with:

```sql
-- Appointments feature: schema additions
-- Run in Supabase SQL editor.

ALTER TABLE public.provider_details
  ADD COLUMN IF NOT EXISTS timezone text NOT NULL DEFAULT 'America/Chicago';

CREATE TABLE IF NOT EXISTS public.provider_availability (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  provider_id uuid NOT NULL REFERENCES public.profiles(id),
  day_of_week smallint NOT NULL CHECK (day_of_week BETWEEN 0 AND 6),
  start_time time NOT NULL,
  end_time time NOT NULL CHECK (end_time > start_time),
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (provider_id, day_of_week, start_time)
);

CREATE TABLE IF NOT EXISTS public.provider_availability_exceptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  provider_id uuid NOT NULL REFERENCES public.profiles(id),
  start_at timestamptz NOT NULL,
  end_at timestamptz NOT NULL CHECK (end_at > start_at),
  reason text,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.appointments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  provider_id uuid NOT NULL REFERENCES public.profiles(id),
  patient_id  uuid NOT NULL REFERENCES public.profiles(id),
  start_at timestamptz NOT NULL,
  end_at   timestamptz NOT NULL CHECK (end_at = start_at + interval '1 hour'),
  status text NOT NULL DEFAULT 'scheduled'
         CHECK (status IN ('scheduled','cancelled','completed')),
  reason text,
  cancelled_at timestamptz,
  cancelled_by uuid REFERENCES public.profiles(id),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS appointments_unique_scheduled_slot
  ON public.appointments (provider_id, start_at)
  WHERE status = 'scheduled';

CREATE INDEX IF NOT EXISTS appointments_patient_idx
  ON public.appointments (patient_id, start_at DESC);

CREATE INDEX IF NOT EXISTS appointments_provider_idx
  ON public.appointments (provider_id, start_at DESC);
```

- [ ] **Step 2: Run the migration**

The project uses Supabase cloud. Copy the file contents into the Supabase SQL editor for the project and run it. Confirm in the Table Editor that the three tables and the `timezone` column exist.

- [ ] **Step 3: Commit**

```bash
git add backend/migrations/2026-04-23_appointments.sql
git commit -m "feat(db): add appointments, availability, and exceptions tables"
```

---

## Task 2: Backend dependencies and httpResponse.conflict

**Files:**
- Modify: `backend/package.json`
- Modify: `backend/src/utils/httpResponse.js`

- [ ] **Step 1: Install luxon and vitest**

From the repo root:

```bash
cd backend
npm install luxon
npm install --save-dev vitest
```

- [ ] **Step 2: Add test script to `backend/package.json`**

In the `scripts` object, add `"test": "vitest run"` and `"test:watch": "vitest"`. The resulting `scripts` section should be:

```json
"scripts": {
  "start": "node src/index.js",
  "dev": "nodemon src/index.js",
  "test": "vitest run",
  "test:watch": "vitest"
}
```

- [ ] **Step 3: Create `backend/vitest.config.js`**

```js
import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "node",
    include: ["src/**/*.test.js"],
  },
});
```

- [ ] **Step 4: Add `conflict` helper to `backend/src/utils/httpResponse.js`**

Replace the entire `httpResponse` object export with:

```js
export const httpResponse = {
  success: (res, data, statusCode = 200, message = "Success") => {
    res.status(statusCode).json({
      success: true,
      message,
      data,
    });
  },

  error: (res, error, statusCode = 500, message = "Error") => {
    res.status(statusCode).json({
      success: false,
      message,
      error: error?.message || error || "Unknown error",
    });
  },

  created: (res, data, message = "Created successfully") => {
    res.status(201).json({
      success: true,
      message,
      data,
    });
  },

  notFound: (res, message = "Resource not found") => {
    res.status(404).json({
      success: false,
      message,
    });
  },

  badRequest: (res, message = "Bad request") => {
    res.status(400).json({
      success: false,
      message,
    });
  },

  unauthorized: (res, message = "Unauthorized") => {
    res.status(401).json({
      success: false,
      message,
    });
  },

  conflict: (res, message = "Conflict") => {
    res.status(409).json({
      success: false,
      message,
    });
  },
};
```

- [ ] **Step 5: Verify Vitest runs**

```bash
cd backend
npx vitest run
```

Expected: "No test files found" (or similar). Exit code 0.

- [ ] **Step 6: Commit**

```bash
git add backend/package.json backend/package-lock.json backend/vitest.config.js backend/src/utils/httpResponse.js
git commit -m "chore(backend): add luxon, vitest, and httpResponse.conflict helper"
```

---

## Task 3: Slot generation — TDD

The core algorithm. We build it pure (no Supabase) with all data injected, then wire a thin loader wrapper. This keeps the unit tests deterministic.

**Files:**
- Create: `backend/src/services/availabilityService.js`
- Test: `backend/src/services/availabilityService.test.js`

- [ ] **Step 1: Write the first failing test — empty template produces no slots**

Create `backend/src/services/availabilityService.test.js`:

```js
import { describe, it, expect } from "vitest";
import { computeAvailableSlots } from "./availabilityService.js";

describe("computeAvailableSlots", () => {
  it("returns empty array when template is empty", () => {
    const slots = computeAvailableSlots({
      timezone: "America/Chicago",
      template: [],
      exceptions: [],
      bookedStartsISO: [],
      fromDate: "2026-05-04", // Monday
      toDate: "2026-05-04",
      nowISO: "2026-05-04T00:00:00Z",
    });
    expect(slots).toEqual([]);
  });
});
```

- [ ] **Step 2: Run and confirm it fails**

```bash
cd backend
npx vitest run
```

Expected: FAIL — `Cannot find module './availabilityService.js'` (or a named-import error).

- [ ] **Step 3: Create the minimal implementation**

Create `backend/src/services/availabilityService.js`:

```js
import { DateTime, Interval } from "luxon";

const SLOT_MINUTES = 60;

/**
 * Pure slot computation. All IO happens in the caller.
 *
 * @param {object}   args
 * @param {string}   args.timezone            IANA zone for the provider.
 * @param {Array}    args.template            [{ day_of_week, start_time, end_time }]
 * @param {Array}    args.exceptions          [{ start_at, end_at }] — ISO strings.
 * @param {string[]} args.bookedStartsISO     ISO start times already booked.
 * @param {string}   args.fromDate            "YYYY-MM-DD" inclusive, in provider tz.
 * @param {string}   args.toDate              "YYYY-MM-DD" inclusive, in provider tz.
 * @param {string}   args.nowISO              current instant, ISO.
 * @returns {{ start_at: string, end_at: string }[]}
 */
export function computeAvailableSlots({
  timezone,
  template,
  exceptions,
  bookedStartsISO,
  fromDate,
  toDate,
  nowISO,
}) {
  const now = DateTime.fromISO(nowISO, { zone: "utc" });
  const bookedSet = new Set(
    bookedStartsISO.map((iso) => DateTime.fromISO(iso, { zone: "utc" }).toISO()),
  );
  const exceptionIntervals = exceptions.map((e) =>
    Interval.fromDateTimes(
      DateTime.fromISO(e.start_at, { zone: "utc" }),
      DateTime.fromISO(e.end_at, { zone: "utc" }),
    ),
  );

  const slots = [];
  let cursor = DateTime.fromISO(fromDate, { zone: timezone }).startOf("day");
  const end = DateTime.fromISO(toDate, { zone: timezone }).endOf("day");

  while (cursor <= end) {
    const dow = cursor.weekday % 7; // luxon: Mon=1..Sun=7 → Sun=0..Sat=6
    const daysTemplate = template.filter((t) => t.day_of_week === dow);

    for (const block of daysTemplate) {
      const [sh, sm] = block.start_time.split(":").map(Number);
      const [eh, em] = block.end_time.split(":").map(Number);
      let slotStart = cursor.set({ hour: sh, minute: sm, second: 0, millisecond: 0 });
      const blockEnd = cursor.set({ hour: eh, minute: em, second: 0, millisecond: 0 });

      while (slotStart.plus({ minutes: SLOT_MINUTES }) <= blockEnd) {
        const slotEnd = slotStart.plus({ minutes: SLOT_MINUTES });
        const slotStartUtc = slotStart.toUTC();
        const slotEndUtc = slotEnd.toUTC();
        const interval = Interval.fromDateTimes(slotStartUtc, slotEndUtc);

        const inPast = slotStartUtc <= now;
        const booked = bookedSet.has(slotStartUtc.toISO());
        const blocked = exceptionIntervals.some((iv) => iv.overlaps(interval));

        if (!inPast && !booked && !blocked) {
          slots.push({
            start_at: slotStartUtc.toISO(),
            end_at: slotEndUtc.toISO(),
          });
        }
        slotStart = slotEnd;
      }
    }
    cursor = cursor.plus({ days: 1 });
  }

  slots.sort((a, b) => a.start_at.localeCompare(b.start_at));
  return slots;
}
```

- [ ] **Step 4: Run test to confirm pass**

```bash
cd backend
npx vitest run
```

Expected: 1 passing.

- [ ] **Step 5: Add test — single template block produces sequential hourly slots**

Append to `availabilityService.test.js`:

```js
  it("emits one slot per hour inside a template block", () => {
    const slots = computeAvailableSlots({
      timezone: "America/Chicago",
      template: [
        { day_of_week: 1, start_time: "09:00:00", end_time: "12:00:00" }, // Mon
      ],
      exceptions: [],
      bookedStartsISO: [],
      fromDate: "2026-05-04", // Monday
      toDate: "2026-05-04",
      nowISO: "2026-05-04T00:00:00Z", // 7pm Sunday CT → still before 9am Mon CT
    });
    // 9am, 10am, 11am in America/Chicago → 14:00, 15:00, 16:00 UTC (CDT offset -5)
    expect(slots.map((s) => s.start_at)).toEqual([
      "2026-05-04T14:00:00.000Z",
      "2026-05-04T15:00:00.000Z",
      "2026-05-04T16:00:00.000Z",
    ]);
  });
```

- [ ] **Step 6: Run and confirm pass**

```bash
cd backend
npx vitest run
```

Expected: 2 passing.

- [ ] **Step 7: Add test — booked slots are excluded**

Append:

```js
  it("excludes slots that are already booked", () => {
    const slots = computeAvailableSlots({
      timezone: "America/Chicago",
      template: [
        { day_of_week: 1, start_time: "09:00:00", end_time: "12:00:00" },
      ],
      exceptions: [],
      bookedStartsISO: ["2026-05-04T15:00:00.000Z"], // 10am CT
      fromDate: "2026-05-04",
      toDate: "2026-05-04",
      nowISO: "2026-05-04T00:00:00Z",
    });
    expect(slots.map((s) => s.start_at)).toEqual([
      "2026-05-04T14:00:00.000Z",
      "2026-05-04T16:00:00.000Z",
    ]);
  });
```

- [ ] **Step 8: Run and confirm pass**

```bash
cd backend
npx vitest run
```

Expected: 3 passing.

- [ ] **Step 9: Add test — exceptions remove overlapping slots**

Append:

```js
  it("excludes slots overlapping an exception", () => {
    const slots = computeAvailableSlots({
      timezone: "America/Chicago",
      template: [
        { day_of_week: 1, start_time: "09:00:00", end_time: "12:00:00" },
      ],
      exceptions: [
        // block 9:30am–10:30am CT → overlaps both the 9 and 10 slots
        { start_at: "2026-05-04T14:30:00.000Z", end_at: "2026-05-04T15:30:00.000Z" },
      ],
      bookedStartsISO: [],
      fromDate: "2026-05-04",
      toDate: "2026-05-04",
      nowISO: "2026-05-04T00:00:00Z",
    });
    expect(slots.map((s) => s.start_at)).toEqual([
      "2026-05-04T16:00:00.000Z",
    ]);
  });
```

- [ ] **Step 10: Run and confirm pass**

```bash
cd backend
npx vitest run
```

Expected: 4 passing.

- [ ] **Step 11: Add test — past slots excluded**

Append:

```js
  it("excludes slots whose start is at or before now", () => {
    const slots = computeAvailableSlots({
      timezone: "America/Chicago",
      template: [
        { day_of_week: 1, start_time: "09:00:00", end_time: "12:00:00" },
      ],
      exceptions: [],
      bookedStartsISO: [],
      fromDate: "2026-05-04",
      toDate: "2026-05-04",
      nowISO: "2026-05-04T15:00:00.000Z", // exactly 10am CT → 9am is past, 10am is NOT strictly after
    });
    expect(slots.map((s) => s.start_at)).toEqual([
      "2026-05-04T16:00:00.000Z",
    ]);
  });
```

- [ ] **Step 12: Run and confirm pass**

```bash
cd backend
npx vitest run
```

Expected: 5 passing.

- [ ] **Step 13: Add a multi-block-per-day and multi-day test**

Append:

```js
  it("handles multiple blocks per day and a date range", () => {
    const slots = computeAvailableSlots({
      timezone: "America/Chicago",
      template: [
        { day_of_week: 1, start_time: "09:00:00", end_time: "11:00:00" },
        { day_of_week: 1, start_time: "13:00:00", end_time: "14:00:00" },
        { day_of_week: 2, start_time: "09:00:00", end_time: "10:00:00" },
      ],
      exceptions: [],
      bookedStartsISO: [],
      fromDate: "2026-05-04",
      toDate: "2026-05-05",
      nowISO: "2026-05-04T00:00:00Z",
    });
    expect(slots.map((s) => s.start_at)).toEqual([
      "2026-05-04T14:00:00.000Z", // Mon 9am CT
      "2026-05-04T15:00:00.000Z", // Mon 10am CT
      "2026-05-04T18:00:00.000Z", // Mon 1pm CT
      "2026-05-05T14:00:00.000Z", // Tue 9am CT
    ]);
  });
```

- [ ] **Step 14: Run and confirm pass**

```bash
cd backend
npx vitest run
```

Expected: 6 passing.

- [ ] **Step 15: Commit**

```bash
git add backend/src/services/availabilityService.js backend/src/services/availabilityService.test.js
git commit -m "feat(backend): add availability slot-generation service with tests"
```

---

## Task 4: Appointment service, controller, routes

**Files:**
- Create: `backend/src/services/appointmentService.js`
- Create: `backend/src/controllers/appointmentController.js`
- Create: `backend/src/routes/appointments.js`

- [ ] **Step 1: Create `backend/src/services/appointmentService.js`**

```js
import { DateTime } from "luxon";
import { supabase } from "../supabaseAdminClient.js";
import { computeAvailableSlots } from "./availabilityService.js";

const HORIZON_DAYS = 60;

export class AppointmentService {
  static async getById(id) {
    const { data, error } = await supabase
      .from("appointments")
      .select("*, provider:profiles!appointments_provider_id_fkey(id, first_name, last_name), patient:profiles!appointments_patient_id_fkey(id, first_name, last_name)")
      .eq("id", id)
      .single();
    if (error) throw error;
    return data;
  }

  static async listForPatient(patientId) {
    const { data, error } = await supabase
      .from("appointments")
      .select("*, provider:profiles!appointments_provider_id_fkey(id, first_name, last_name)")
      .eq("patient_id", patientId)
      .order("start_at", { ascending: false });
    if (error) throw error;
    return data;
  }

  static async listForProvider(providerId) {
    const { data, error } = await supabase
      .from("appointments")
      .select("*, patient:profiles!appointments_patient_id_fkey(id, first_name, last_name)")
      .eq("provider_id", providerId)
      .order("start_at", { ascending: false });
    if (error) throw error;
    return data;
  }

  static async create({ provider_id, patient_id, start_at, reason }) {
    const startUtc = DateTime.fromISO(start_at, { zone: "utc" });
    if (!startUtc.isValid) {
      throw Object.assign(new Error("Invalid start_at"), { status: 400 });
    }
    const end_at = startUtc.plus({ hours: 1 }).toISO();

    const now = DateTime.utc();
    if (startUtc <= now) {
      throw Object.assign(new Error("Appointment must be in the future"), { status: 400 });
    }
    if (startUtc > now.plus({ days: HORIZON_DAYS })) {
      throw Object.assign(new Error(`Appointment must be within ${HORIZON_DAYS} days`), { status: 400 });
    }

    const { data: link, error: linkErr } = await supabase
      .from("provider_patients")
      .select("id")
      .eq("provider_id", provider_id)
      .eq("patient_id", patient_id)
      .eq("status", "active")
      .maybeSingle();
    if (linkErr) throw linkErr;
    if (!link) {
      throw Object.assign(new Error("Patient is not linked to this provider"), { status: 403 });
    }

    const { data, error } = await supabase
      .from("appointments")
      .insert([{ provider_id, patient_id, start_at: startUtc.toISO(), end_at, reason: reason || null }])
      .select()
      .single();

    if (error) {
      if (error.code === "23505") {
        throw Object.assign(new Error("That time was just booked. Please pick another."), { status: 409 });
      }
      throw error;
    }
    return data;
  }

  static async reschedule(id, { start_at }) {
    const startUtc = DateTime.fromISO(start_at, { zone: "utc" });
    if (!startUtc.isValid) {
      throw Object.assign(new Error("Invalid start_at"), { status: 400 });
    }
    const end_at = startUtc.plus({ hours: 1 }).toISO();

    const now = DateTime.utc();
    if (startUtc <= now) {
      throw Object.assign(new Error("Appointment must be in the future"), { status: 400 });
    }
    if (startUtc > now.plus({ days: HORIZON_DAYS })) {
      throw Object.assign(new Error(`Appointment must be within ${HORIZON_DAYS} days`), { status: 400 });
    }

    const { data, error } = await supabase
      .from("appointments")
      .update({ start_at: startUtc.toISO(), end_at, updated_at: new Date().toISOString() })
      .eq("id", id)
      .select()
      .single();

    if (error) {
      if (error.code === "23505") {
        throw Object.assign(new Error("That time was just booked. Please pick another."), { status: 409 });
      }
      throw error;
    }
    return data;
  }

  static async cancel(id, cancelledByProfileId) {
    const { data, error } = await supabase
      .from("appointments")
      .update({
        status: "cancelled",
        cancelled_at: new Date().toISOString(),
        cancelled_by: cancelledByProfileId || null,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)
      .select()
      .single();
    if (error) throw error;
    return data;
  }

  static async getAvailability(providerId, fromDate, toDate) {
    const { data: pd, error: pdErr } = await supabase
      .from("provider_details")
      .select("timezone")
      .eq("profile_id", providerId)
      .maybeSingle();
    if (pdErr) throw pdErr;
    const timezone = pd?.timezone || "America/Chicago";

    const today = DateTime.utc().setZone(timezone).startOf("day");
    const horizonEnd = today.plus({ days: HORIZON_DAYS });
    const from = fromDate
      ? DateTime.fromISO(fromDate, { zone: timezone })
      : today;
    const to = toDate
      ? DateTime.fromISO(toDate, { zone: timezone })
      : horizonEnd;
    const clampedFrom = from < today ? today : from;
    const clampedTo = to > horizonEnd ? horizonEnd : to;

    const { data: template, error: tErr } = await supabase
      .from("provider_availability")
      .select("day_of_week, start_time, end_time")
      .eq("provider_id", providerId);
    if (tErr) throw tErr;

    const { data: exceptions, error: eErr } = await supabase
      .from("provider_availability_exceptions")
      .select("start_at, end_at")
      .eq("provider_id", providerId)
      .lte("start_at", clampedTo.endOf("day").toUTC().toISO())
      .gte("end_at", clampedFrom.startOf("day").toUTC().toISO());
    if (eErr) throw eErr;

    const { data: booked, error: bErr } = await supabase
      .from("appointments")
      .select("start_at")
      .eq("provider_id", providerId)
      .eq("status", "scheduled")
      .gte("start_at", clampedFrom.startOf("day").toUTC().toISO())
      .lte("start_at", clampedTo.endOf("day").toUTC().toISO());
    if (bErr) throw bErr;

    return computeAvailableSlots({
      timezone,
      template: template || [],
      exceptions: exceptions || [],
      bookedStartsISO: (booked || []).map((b) => b.start_at),
      fromDate: clampedFrom.toISODate(),
      toDate: clampedTo.toISODate(),
      nowISO: DateTime.utc().toISO(),
    });
  }
}
```

- [ ] **Step 2: Create `backend/src/controllers/appointmentController.js`**

```js
import { httpResponse } from "../utils/httpResponse.js";
import { AppointmentService } from "../services/appointmentService.js";

function sendThrown(res, err) {
  const status = err.status || 500;
  if (status === 400) return httpResponse.badRequest(res, err.message);
  if (status === 403) return httpResponse.unauthorized(res, err.message);
  if (status === 404) return httpResponse.notFound(res, err.message);
  if (status === 409) return httpResponse.conflict(res, err.message);
  return httpResponse.error(res, err, 500, "Internal server error");
}

export class AppointmentController {
  static async getById(req, res, next) {
    try {
      const appt = await AppointmentService.getById(req.params.id);
      if (!appt) return httpResponse.notFound(res, "Appointment not found");
      httpResponse.success(res, appt, 200, "Appointment retrieved");
    } catch (err) { next(err); }
  }

  static async list(req, res, next) {
    try {
      const { patient_id, provider_id } = req.query;
      if (patient_id) {
        const data = await AppointmentService.listForPatient(patient_id);
        return httpResponse.success(res, data, 200, "Appointments retrieved");
      }
      if (provider_id) {
        const data = await AppointmentService.listForProvider(provider_id);
        return httpResponse.success(res, data, 200, "Appointments retrieved");
      }
      return httpResponse.badRequest(res, "patient_id or provider_id is required");
    } catch (err) { next(err); }
  }

  static async create(req, res, next) {
    try {
      const { provider_id, patient_id, start_at, reason } = req.body;
      if (!provider_id || !patient_id || !start_at) {
        return httpResponse.badRequest(res, "provider_id, patient_id, and start_at are required");
      }
      const data = await AppointmentService.create({ provider_id, patient_id, start_at, reason });
      httpResponse.created(res, data, "Appointment booked");
    } catch (err) {
      if (err.status) return sendThrown(res, err);
      next(err);
    }
  }

  static async reschedule(req, res, next) {
    try {
      const { start_at } = req.body;
      if (!start_at) return httpResponse.badRequest(res, "start_at is required");
      const data = await AppointmentService.reschedule(req.params.id, { start_at });
      httpResponse.success(res, data, 200, "Appointment rescheduled");
    } catch (err) {
      if (err.status) return sendThrown(res, err);
      next(err);
    }
  }

  static async cancel(req, res, next) {
    try {
      const { cancelled_by } = req.body || {};
      const data = await AppointmentService.cancel(req.params.id, cancelled_by);
      httpResponse.success(res, data, 200, "Appointment cancelled");
    } catch (err) { next(err); }
  }

  static async availability(req, res, next) {
    try {
      const { providerId } = req.params;
      const { from, to } = req.query;
      const slots = await AppointmentService.getAvailability(providerId, from, to);
      httpResponse.success(res, slots, 200, "Availability retrieved");
    } catch (err) { next(err); }
  }
}
```

- [ ] **Step 3: Create `backend/src/routes/appointments.js`**

```js
import express from "express";
import { AppointmentController } from "../controllers/appointmentController.js";
import { asyncHandler } from "../middleware/errorHandler.js";

const router = express.Router();

router.get("/availability/:providerId", asyncHandler(AppointmentController.availability));
router.get("/", asyncHandler(AppointmentController.list));
router.get("/:id", asyncHandler(AppointmentController.getById));
router.post("/", asyncHandler(AppointmentController.create));
router.patch("/:id", asyncHandler(AppointmentController.reschedule));
router.delete("/:id", asyncHandler(AppointmentController.cancel));

export default router;
```

- [ ] **Step 4: Commit**

```bash
git add backend/src/services/appointmentService.js backend/src/controllers/appointmentController.js backend/src/routes/appointments.js
git commit -m "feat(backend): add appointments service, controller, and routes"
```

---

## Task 5: Provider availability template — service, controller, routes

**Files:**
- Create: `backend/src/services/providerAvailabilityService.js`
- Create: `backend/src/controllers/providerAvailabilityController.js`
- Create: `backend/src/routes/providerAvailability.js`

- [ ] **Step 1: Create `backend/src/services/providerAvailabilityService.js`**

```js
import { supabase } from "../supabaseAdminClient.js";

export class ProviderAvailabilityService {
  static async listForProvider(providerId) {
    const { data, error } = await supabase
      .from("provider_availability")
      .select("*")
      .eq("provider_id", providerId)
      .order("day_of_week")
      .order("start_time");
    if (error) throw error;
    return data;
  }

  static async create({ provider_id, day_of_week, start_time, end_time }) {
    const { data, error } = await supabase
      .from("provider_availability")
      .insert([{ provider_id, day_of_week, start_time, end_time }])
      .select()
      .single();
    if (error) throw error;
    return data;
  }

  static async delete(id) {
    const { data, error } = await supabase
      .from("provider_availability")
      .delete()
      .eq("id", id)
      .select()
      .single();
    if (error) throw error;
    return data;
  }
}
```

- [ ] **Step 2: Create `backend/src/controllers/providerAvailabilityController.js`**

```js
import { httpResponse } from "../utils/httpResponse.js";
import { ProviderAvailabilityService } from "../services/providerAvailabilityService.js";

export class ProviderAvailabilityController {
  static async list(req, res, next) {
    try {
      const data = await ProviderAvailabilityService.listForProvider(req.params.providerId);
      httpResponse.success(res, data, 200, "Availability template retrieved");
    } catch (err) { next(err); }
  }

  static async create(req, res, next) {
    try {
      const { provider_id, day_of_week, start_time, end_time } = req.body;
      if (provider_id === undefined || day_of_week === undefined || !start_time || !end_time) {
        return httpResponse.badRequest(res, "provider_id, day_of_week, start_time, end_time are required");
      }
      if (day_of_week < 0 || day_of_week > 6) {
        return httpResponse.badRequest(res, "day_of_week must be 0-6 (0=Sunday)");
      }
      if (start_time >= end_time) {
        return httpResponse.badRequest(res, "end_time must be after start_time");
      }
      const data = await ProviderAvailabilityService.create({ provider_id, day_of_week, start_time, end_time });
      httpResponse.created(res, data, "Availability block added");
    } catch (err) { next(err); }
  }

  static async delete(req, res, next) {
    try {
      const data = await ProviderAvailabilityService.delete(req.params.id);
      httpResponse.success(res, data, 200, "Availability block removed");
    } catch (err) { next(err); }
  }
}
```

- [ ] **Step 3: Create `backend/src/routes/providerAvailability.js`**

```js
import express from "express";
import { ProviderAvailabilityController } from "../controllers/providerAvailabilityController.js";
import { asyncHandler } from "../middleware/errorHandler.js";

const router = express.Router();

router.get("/:providerId", asyncHandler(ProviderAvailabilityController.list));
router.post("/", asyncHandler(ProviderAvailabilityController.create));
router.delete("/:id", asyncHandler(ProviderAvailabilityController.delete));

export default router;
```

- [ ] **Step 4: Commit**

```bash
git add backend/src/services/providerAvailabilityService.js backend/src/controllers/providerAvailabilityController.js backend/src/routes/providerAvailability.js
git commit -m "feat(backend): add provider availability template CRUD"
```

---

## Task 6: Provider availability exceptions — service, controller, routes

**Files:**
- Create: `backend/src/services/providerAvailabilityExceptionService.js`
- Create: `backend/src/controllers/providerAvailabilityExceptionController.js`
- Create: `backend/src/routes/providerAvailabilityExceptions.js`

- [ ] **Step 1: Create `backend/src/services/providerAvailabilityExceptionService.js`**

```js
import { supabase } from "../supabaseAdminClient.js";

export class ProviderAvailabilityExceptionService {
  static async listForProvider(providerId, { from, to } = {}) {
    let query = supabase
      .from("provider_availability_exceptions")
      .select("*")
      .eq("provider_id", providerId)
      .order("start_at");
    if (from) query = query.gte("end_at", from);
    if (to) query = query.lte("start_at", to);
    const { data, error } = await query;
    if (error) throw error;
    return data;
  }

  static async create({ provider_id, start_at, end_at, reason }) {
    const { data, error } = await supabase
      .from("provider_availability_exceptions")
      .insert([{ provider_id, start_at, end_at, reason: reason || null }])
      .select()
      .single();
    if (error) throw error;
    return data;
  }

  static async delete(id) {
    const { data, error } = await supabase
      .from("provider_availability_exceptions")
      .delete()
      .eq("id", id)
      .select()
      .single();
    if (error) throw error;
    return data;
  }
}
```

- [ ] **Step 2: Create `backend/src/controllers/providerAvailabilityExceptionController.js`**

```js
import { httpResponse } from "../utils/httpResponse.js";
import { ProviderAvailabilityExceptionService } from "../services/providerAvailabilityExceptionService.js";

export class ProviderAvailabilityExceptionController {
  static async list(req, res, next) {
    try {
      const { from, to } = req.query;
      const data = await ProviderAvailabilityExceptionService.listForProvider(req.params.providerId, { from, to });
      httpResponse.success(res, data, 200, "Exceptions retrieved");
    } catch (err) { next(err); }
  }

  static async create(req, res, next) {
    try {
      const { provider_id, start_at, end_at, reason } = req.body;
      if (!provider_id || !start_at || !end_at) {
        return httpResponse.badRequest(res, "provider_id, start_at, end_at are required");
      }
      if (end_at <= start_at) {
        return httpResponse.badRequest(res, "end_at must be after start_at");
      }
      const data = await ProviderAvailabilityExceptionService.create({ provider_id, start_at, end_at, reason });
      httpResponse.created(res, data, "Exception added");
    } catch (err) { next(err); }
  }

  static async delete(req, res, next) {
    try {
      const data = await ProviderAvailabilityExceptionService.delete(req.params.id);
      httpResponse.success(res, data, 200, "Exception removed");
    } catch (err) { next(err); }
  }
}
```

- [ ] **Step 3: Create `backend/src/routes/providerAvailabilityExceptions.js`**

```js
import express from "express";
import { ProviderAvailabilityExceptionController } from "../controllers/providerAvailabilityExceptionController.js";
import { asyncHandler } from "../middleware/errorHandler.js";

const router = express.Router();

router.get("/:providerId", asyncHandler(ProviderAvailabilityExceptionController.list));
router.post("/", asyncHandler(ProviderAvailabilityExceptionController.create));
router.delete("/:id", asyncHandler(ProviderAvailabilityExceptionController.delete));

export default router;
```

- [ ] **Step 4: Commit**

```bash
git add backend/src/services/providerAvailabilityExceptionService.js backend/src/controllers/providerAvailabilityExceptionController.js backend/src/routes/providerAvailabilityExceptions.js
git commit -m "feat(backend): add provider availability exception CRUD"
```

---

## Task 7: Wire new routers in `app.js`

**Files:**
- Modify: `backend/src/app.js`

- [ ] **Step 1: Add imports and `app.use` calls**

In `backend/src/app.js`, add three imports below the existing route imports:

```js
import appointmentRoutes from "./routes/appointments.js";
import providerAvailabilityRoutes from "./routes/providerAvailability.js";
import providerAvailabilityExceptionRoutes from "./routes/providerAvailabilityExceptions.js";
```

And add three `app.use` calls in the API Routes block:

```js
app.use("/api/appointments", appointmentRoutes);
app.use("/api/provider-availability", providerAvailabilityRoutes);
app.use("/api/provider-availability-exceptions", providerAvailabilityExceptionRoutes);
```

- [ ] **Step 2: Boot the backend and smoke-test**

```bash
cd backend
npm run dev
```

In another terminal:

```bash
curl -s http://localhost:4000/api/appointments?patient_id=00000000-0000-0000-0000-000000000000 | head
```

Expected: JSON `{"success":true,"message":"Appointments retrieved","data":[]}`.

- [ ] **Step 3: Commit**

```bash
git add backend/src/app.js
git commit -m "feat(backend): wire appointment and availability routers"
```

---

## Task 8: Frontend — appointment service client

**Files:**
- Create: `frontend/src/services/appointmentService.js`

- [ ] **Step 1: Create the service**

```js
const BASE_URL = "http://localhost:4000/api";

class AppointmentService {
  static async getAvailability(providerId, fromDate, toDate) {
    const params = new URLSearchParams();
    if (fromDate) params.set("from", fromDate);
    if (toDate) params.set("to", toDate);
    const qs = params.toString() ? `?${params.toString()}` : "";
    const res = await fetch(`${BASE_URL}/appointments/availability/${providerId}${qs}`);
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || "Failed to fetch availability");
    return data;
  }

  static async listForPatient(patientId) {
    const res = await fetch(`${BASE_URL}/appointments?patient_id=${patientId}`);
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || "Failed to fetch appointments");
    return data;
  }

  static async listForProvider(providerId) {
    const res = await fetch(`${BASE_URL}/appointments?provider_id=${providerId}`);
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || "Failed to fetch appointments");
    return data;
  }

  static async book({ provider_id, patient_id, start_at, reason }) {
    const res = await fetch(`${BASE_URL}/appointments`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ provider_id, patient_id, start_at, reason }),
    });
    const data = await res.json();
    if (!res.ok) {
      const err = new Error(data.message || "Failed to book appointment");
      err.status = res.status;
      throw err;
    }
    return data;
  }

  static async reschedule(id, start_at) {
    const res = await fetch(`${BASE_URL}/appointments/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ start_at }),
    });
    const data = await res.json();
    if (!res.ok) {
      const err = new Error(data.message || "Failed to reschedule");
      err.status = res.status;
      throw err;
    }
    return data;
  }

  static async cancel(id, cancelledByProfileId) {
    const res = await fetch(`${BASE_URL}/appointments/${id}`, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ cancelled_by: cancelledByProfileId }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || "Failed to cancel");
    return data;
  }
}

export default AppointmentService;
```

- [ ] **Step 2: Commit**

```bash
git add frontend/src/services/appointmentService.js
git commit -m "feat(frontend): add appointment service client"
```

---

## Task 9: Frontend — provider availability service client

**Files:**
- Create: `frontend/src/services/providerAvailabilityService.js`

- [ ] **Step 1: Create the service**

```js
const BASE_URL = "http://localhost:4000/api";

class ProviderAvailabilityService {
  static async listTemplate(providerId) {
    const res = await fetch(`${BASE_URL}/provider-availability/${providerId}`);
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || "Failed to load template");
    return data;
  }

  static async addTemplateBlock({ provider_id, day_of_week, start_time, end_time }) {
    const res = await fetch(`${BASE_URL}/provider-availability`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ provider_id, day_of_week, start_time, end_time }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || "Failed to add block");
    return data;
  }

  static async deleteTemplateBlock(id) {
    const res = await fetch(`${BASE_URL}/provider-availability/${id}`, { method: "DELETE" });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || "Failed to remove block");
    return data;
  }

  static async listExceptions(providerId) {
    const res = await fetch(`${BASE_URL}/provider-availability-exceptions/${providerId}`);
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || "Failed to load exceptions");
    return data;
  }

  static async addException({ provider_id, start_at, end_at, reason }) {
    const res = await fetch(`${BASE_URL}/provider-availability-exceptions`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ provider_id, start_at, end_at, reason }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || "Failed to add time off");
    return data;
  }

  static async deleteException(id) {
    const res = await fetch(`${BASE_URL}/provider-availability-exceptions/${id}`, { method: "DELETE" });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || "Failed to remove time off");
    return data;
  }
}

export default ProviderAvailabilityService;
```

- [ ] **Step 2: Commit**

```bash
git add frontend/src/services/providerAvailabilityService.js
git commit -m "feat(frontend): add provider availability service client"
```

---

## Task 10: Frontend — BookAppointmentView

**Files:**
- Create: `frontend/src/pages/BookAppointmentView.jsx`

The patient picks their provider (from `provider_patients`), a date, a slot chip, and an optional reason.

This page needs to look up the patient's profile id (from `profiles` via `auth_user_id`) and the list of linked providers. We already have a `ProfileService` in `frontend/src/services/profileService.js` and the backend `GET /api/provider-patients?patient_id=...` endpoint.

- [ ] **Step 1: Create `frontend/src/pages/BookAppointmentView.jsx`**

The page calls `ProfileService.getProfileByAuthUserId(session.user.id)` to resolve the patient's profile. This matches the existing method in `frontend/src/services/profileService.js`.

```jsx
import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { DateTime } from "luxon";
import NavigationDrawer from "../components/NavigationDrawer";
import { UserAuth } from "../components/auth/AuthContext";
import AppointmentService from "../services/appointmentService";
import ProfileService from "../services/profileService";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import Chip from "@mui/material/Chip";
import Stack from "@mui/material/Stack";
import TextField from "@mui/material/TextField";
import MenuItem from "@mui/material/MenuItem";
import Snackbar from "@mui/material/Snackbar";
import Alert from "@mui/material/Alert";
import CircularProgress from "@mui/material/CircularProgress";

const API = "http://localhost:4000/api";

export default function BookAppointmentView() {
  const { session } = UserAuth();
  const navigate = useNavigate();

  const [profile, setProfile] = useState(null);
  const [providers, setProviders] = useState([]);
  const [providerId, setProviderId] = useState("");
  const [date, setDate] = useState(DateTime.local().toISODate());
  const [slots, setSlots] = useState([]);
  const [chosenSlot, setChosenSlot] = useState(null);
  const [reason, setReason] = useState("");
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [snack, setSnack] = useState({ open: false, message: "", severity: "success" });

  const maxDate = useMemo(() => DateTime.local().plus({ days: 60 }).toISODate(), []);

  // Load the patient's profile and linked providers
  useEffect(() => {
    if (!session?.user?.id) return;
    (async () => {
      try {
        const me = await ProfileService.getProfileByAuthUserId(session.user.id);
        setProfile(me.data || me);
        const res = await fetch(`${API}/provider-patients?patient_id=${(me.data || me).id}`);
        const json = await res.json();
        const active = (json.data || []).filter((r) => r.status === "active");
        setProviders(active);
        if (active.length === 1) setProviderId(active[0].provider_id);
      } catch (e) {
        setSnack({ open: true, message: e.message, severity: "error" });
      }
    })();
  }, [session]);

  // Load slots when provider + date change
  useEffect(() => {
    if (!providerId || !date) { setSlots([]); return; }
    setLoadingSlots(true);
    setChosenSlot(null);
    AppointmentService.getAvailability(providerId, date, date)
      .then((res) => setSlots(res.data || []))
      .catch((e) => setSnack({ open: true, message: e.message, severity: "error" }))
      .finally(() => setLoadingSlots(false));
  }, [providerId, date]);

  const onConfirm = async () => {
    if (!profile || !providerId || !chosenSlot) return;
    setSubmitting(true);
    try {
      await AppointmentService.book({
        provider_id: providerId,
        patient_id: profile.id,
        start_at: chosenSlot.start_at,
        reason: reason || undefined,
      });
      setSnack({ open: true, message: "Appointment booked", severity: "success" });
      navigate("/my-appointments");
    } catch (e) {
      if (e.status === 409) {
        setSnack({ open: true, message: e.message, severity: "warning" });
        // refresh slot list
        AppointmentService.getAvailability(providerId, date, date)
          .then((res) => setSlots(res.data || []));
      } else {
        setSnack({ open: true, message: e.message, severity: "error" });
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Box>
      <NavigationDrawer />
      <Box sx={{ p: 4, maxWidth: 720, mx: "auto" }}>
        <Typography variant="h4" gutterBottom>Book an appointment</Typography>

        {providers.length === 0 ? (
          <Alert severity="info" sx={{ mb: 2 }}>
            You don't have a provider linked yet. Contact your clinic to get set up.
          </Alert>
        ) : (
          <>
            <TextField
              select
              fullWidth
              label="Provider"
              value={providerId}
              onChange={(e) => setProviderId(e.target.value)}
              sx={{ mb: 2 }}
            >
              {providers.map((p) => (
                <MenuItem key={p.provider_id} value={p.provider_id}>
                  {p.provider_id}
                </MenuItem>
              ))}
            </TextField>

            <TextField
              type="date"
              label="Date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              InputLabelProps={{ shrink: true }}
              inputProps={{ min: DateTime.local().toISODate(), max: maxDate }}
              sx={{ mb: 2 }}
            />

            <Typography variant="h6" sx={{ mt: 2, mb: 1 }}>Available times</Typography>
            {loadingSlots ? (
              <CircularProgress size={24} />
            ) : slots.length === 0 ? (
              <Typography color="text.secondary">No availability this day.</Typography>
            ) : (
              <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                {slots.map((s) => {
                  const label = DateTime.fromISO(s.start_at).toLocal().toFormat("h:mm a");
                  const selected = chosenSlot?.start_at === s.start_at;
                  return (
                    <Chip
                      key={s.start_at}
                      label={label}
                      color={selected ? "primary" : "default"}
                      onClick={() => setChosenSlot(s)}
                      variant={selected ? "filled" : "outlined"}
                    />
                  );
                })}
              </Stack>
            )}

            <TextField
              fullWidth
              multiline
              minRows={2}
              label="Reason for visit (optional)"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              sx={{ mt: 3 }}
            />

            <Button
              variant="contained"
              disabled={!chosenSlot || submitting}
              onClick={onConfirm}
              sx={{ mt: 3 }}
            >
              {submitting ? "Booking…" : "Confirm booking"}
            </Button>
          </>
        )}
      </Box>

      <Snackbar
        open={snack.open}
        autoHideDuration={5000}
        onClose={() => setSnack({ ...snack, open: false })}
      >
        <Alert severity={snack.severity}>{snack.message}</Alert>
      </Snackbar>
    </Box>
  );
}
```

Note: the provider `MenuItem` currently shows the `provider_id` UUID. If `ProfileService` exposes a "get profile by id" method, you can enrich the dropdown to show names. If not, leave the id — it's acceptable for v1 and the spec's UI section explicitly said "usually one option."

- [ ] **Step 2: Install luxon on the frontend**

```bash
cd frontend
npm install luxon
```

- [ ] **Step 3: Commit**

```bash
git add frontend/src/pages/BookAppointmentView.jsx frontend/package.json frontend/package-lock.json
git commit -m "feat(frontend): add BookAppointmentView"
```

---

## Task 11: Frontend — MyAppointmentsView

**Files:**
- Create: `frontend/src/pages/MyAppointmentsView.jsx`

- [ ] **Step 1: Create the page**

```jsx
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { DateTime } from "luxon";
import NavigationDrawer from "../components/NavigationDrawer";
import { UserAuth } from "../components/auth/AuthContext";
import AppointmentService from "../services/appointmentService";
import ProfileService from "../services/profileService";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import Stack from "@mui/material/Stack";
import Paper from "@mui/material/Paper";
import Divider from "@mui/material/Divider";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import Chip from "@mui/material/Chip";
import TextField from "@mui/material/TextField";
import Snackbar from "@mui/material/Snackbar";
import Alert from "@mui/material/Alert";

function fmt(iso) {
  return DateTime.fromISO(iso).toLocal().toFormat("cccc, LLL d · h:mm a");
}

export default function MyAppointmentsView() {
  const { session } = UserAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [appts, setAppts] = useState([]);
  const [rescheduling, setRescheduling] = useState(null); // appt object
  const [rescheduleDate, setRescheduleDate] = useState("");
  const [rescheduleSlots, setRescheduleSlots] = useState([]);
  const [chosenSlot, setChosenSlot] = useState(null);
  const [snack, setSnack] = useState({ open: false, message: "", severity: "success" });

  async function refresh() {
    if (!profile) return;
    const res = await AppointmentService.listForPatient(profile.id);
    setAppts(res.data || []);
  }

  useEffect(() => {
    if (!session?.user?.id) return;
    (async () => {
      const me = await ProfileService.getProfileByAuthUserId(session.user.id);
      setProfile(me.data || me);
    })();
  }, [session]);

  useEffect(() => { if (profile) refresh(); }, [profile]);

  useEffect(() => {
    if (!rescheduling || !rescheduleDate) { setRescheduleSlots([]); return; }
    AppointmentService.getAvailability(rescheduling.provider_id, rescheduleDate, rescheduleDate)
      .then((res) => setRescheduleSlots(res.data || []))
      .catch((e) => setSnack({ open: true, message: e.message, severity: "error" }));
  }, [rescheduling, rescheduleDate]);

  const onCancel = async (appt) => {
    if (!confirm("Cancel this appointment?")) return;
    try {
      await AppointmentService.cancel(appt.id, profile.id);
      setSnack({ open: true, message: "Cancelled", severity: "success" });
      refresh();
    } catch (e) {
      setSnack({ open: true, message: e.message, severity: "error" });
    }
  };

  const submitReschedule = async () => {
    if (!chosenSlot) return;
    try {
      await AppointmentService.reschedule(rescheduling.id, chosenSlot.start_at);
      setSnack({ open: true, message: "Rescheduled", severity: "success" });
      setRescheduling(null);
      setChosenSlot(null);
      setRescheduleDate("");
      refresh();
    } catch (e) {
      setSnack({ open: true, message: e.message, severity: "error" });
    }
  };

  const now = DateTime.utc();
  const upcoming = appts.filter((a) => a.status === "scheduled" && DateTime.fromISO(a.start_at) >= now);
  const past = appts.filter((a) => !(a.status === "scheduled" && DateTime.fromISO(a.start_at) >= now));

  const renderRow = (a, isUpcoming) => (
    <Paper key={a.id} sx={{ p: 2, mb: 1 }}>
      <Stack direction="row" justifyContent="space-between" alignItems="center">
        <Box>
          <Typography fontWeight="bold">{fmt(a.start_at)}</Typography>
          <Typography variant="body2" color="text.secondary">
            Dr. {a.provider?.first_name} {a.provider?.last_name}
          </Typography>
          {a.reason && (
            <Typography variant="body2" sx={{ mt: 0.5 }}>Reason: {a.reason}</Typography>
          )}
          {!isUpcoming && (
            <Chip size="small" label={a.status} sx={{ mt: 0.5 }} />
          )}
        </Box>
        {isUpcoming && (
          <Stack direction="row" spacing={1}>
            <Button size="small" onClick={() => { setRescheduling(a); setRescheduleDate(DateTime.local().toISODate()); }}>Reschedule</Button>
            <Button size="small" color="error" onClick={() => onCancel(a)}>Cancel</Button>
          </Stack>
        )}
      </Stack>
    </Paper>
  );

  return (
    <Box>
      <NavigationDrawer />
      <Box sx={{ p: 4, maxWidth: 720, mx: "auto" }}>
        <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
          <Typography variant="h4">My appointments</Typography>
          <Button variant="contained" onClick={() => navigate("/book-appointment")}>Book new</Button>
        </Stack>

        <Typography variant="h6" sx={{ mt: 2 }}>Upcoming</Typography>
        {upcoming.length === 0 ? (
          <Typography color="text.secondary">None.</Typography>
        ) : upcoming.map((a) => renderRow(a, true))}

        <Divider sx={{ my: 3 }} />

        <Typography variant="h6">Past</Typography>
        {past.length === 0 ? (
          <Typography color="text.secondary">None.</Typography>
        ) : past.map((a) => renderRow(a, false))}
      </Box>

      <Dialog open={!!rescheduling} onClose={() => setRescheduling(null)} fullWidth maxWidth="xs">
        <DialogTitle>Reschedule appointment</DialogTitle>
        <DialogContent>
          <TextField
            type="date"
            label="Date"
            value={rescheduleDate}
            onChange={(e) => setRescheduleDate(e.target.value)}
            InputLabelProps={{ shrink: true }}
            inputProps={{
              min: DateTime.local().toISODate(),
              max: DateTime.local().plus({ days: 60 }).toISODate(),
            }}
            fullWidth
            sx={{ mb: 2, mt: 1 }}
          />
          <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
            {rescheduleSlots.map((s) => {
              const label = DateTime.fromISO(s.start_at).toLocal().toFormat("h:mm a");
              const selected = chosenSlot?.start_at === s.start_at;
              return (
                <Chip
                  key={s.start_at}
                  label={label}
                  color={selected ? "primary" : "default"}
                  variant={selected ? "filled" : "outlined"}
                  onClick={() => setChosenSlot(s)}
                />
              );
            })}
          </Stack>
          {rescheduleSlots.length === 0 && rescheduleDate && (
            <Typography color="text.secondary" sx={{ mt: 1 }}>No availability this day.</Typography>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => { setRescheduling(null); setChosenSlot(null); }}>Close</Button>
          <Button variant="contained" disabled={!chosenSlot} onClick={submitReschedule}>Confirm</Button>
        </DialogActions>
      </Dialog>

      <Snackbar open={snack.open} autoHideDuration={5000} onClose={() => setSnack({ ...snack, open: false })}>
        <Alert severity={snack.severity}>{snack.message}</Alert>
      </Snackbar>
    </Box>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add frontend/src/pages/MyAppointmentsView.jsx
git commit -m "feat(frontend): add MyAppointmentsView with reschedule and cancel"
```

---

## Task 12: Frontend — DoctorAvailabilityView

**Files:**
- Create: `frontend/src/pages/DoctorAvailabilityView.jsx`

- [ ] **Step 1: Create the page**

```jsx
import { useState, useEffect } from "react";
import { DateTime } from "luxon";
import NavigationDrawer from "../components/NavigationDrawer";
import { UserAuth } from "../components/auth/AuthContext";
import ProviderAvailabilityService from "../services/providerAvailabilityService";
import ProfileService from "../services/profileService";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import Stack from "@mui/material/Stack";
import Paper from "@mui/material/Paper";
import Divider from "@mui/material/Divider";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import TextField from "@mui/material/TextField";
import MenuItem from "@mui/material/MenuItem";
import Snackbar from "@mui/material/Snackbar";
import Alert from "@mui/material/Alert";

const DAY_NAMES = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

export default function DoctorAvailabilityView() {
  const { session } = UserAuth();
  const [profile, setProfile] = useState(null);
  const [template, setTemplate] = useState([]);
  const [exceptions, setExceptions] = useState([]);
  const [addBlock, setAddBlock] = useState(null); // day_of_week
  const [blockStart, setBlockStart] = useState("09:00");
  const [blockEnd, setBlockEnd] = useState("17:00");
  const [addingException, setAddingException] = useState(false);
  const [exStart, setExStart] = useState("");
  const [exEnd, setExEnd] = useState("");
  const [exReason, setExReason] = useState("");
  const [snack, setSnack] = useState({ open: false, message: "", severity: "success" });

  useEffect(() => {
    if (!session?.user?.id) return;
    (async () => {
      const me = await ProfileService.getProfileByAuthUserId(session.user.id);
      setProfile(me.data || me);
    })();
  }, [session]);

  async function refresh() {
    if (!profile) return;
    const t = await ProviderAvailabilityService.listTemplate(profile.id);
    setTemplate(t.data || []);
    const e = await ProviderAvailabilityService.listExceptions(profile.id);
    setExceptions(e.data || []);
  }

  useEffect(() => { if (profile) refresh(); }, [profile]);

  const submitBlock = async () => {
    try {
      await ProviderAvailabilityService.addTemplateBlock({
        provider_id: profile.id,
        day_of_week: addBlock,
        start_time: `${blockStart}:00`,
        end_time: `${blockEnd}:00`,
      });
      setAddBlock(null);
      refresh();
    } catch (e) {
      setSnack({ open: true, message: e.message, severity: "error" });
    }
  };

  const removeBlock = async (id) => {
    if (!confirm("Remove this block? Future-booked appointments in this block will NOT be cancelled.")) return;
    try {
      await ProviderAvailabilityService.deleteTemplateBlock(id);
      refresh();
    } catch (e) {
      setSnack({ open: true, message: e.message, severity: "error" });
    }
  };

  const submitException = async () => {
    try {
      await ProviderAvailabilityService.addException({
        provider_id: profile.id,
        start_at: DateTime.fromISO(exStart).toUTC().toISO(),
        end_at: DateTime.fromISO(exEnd).toUTC().toISO(),
        reason: exReason || undefined,
      });
      setAddingException(false);
      setExStart(""); setExEnd(""); setExReason("");
      refresh();
    } catch (e) {
      setSnack({ open: true, message: e.message, severity: "error" });
    }
  };

  const removeException = async (id) => {
    if (!confirm("Remove this time off?")) return;
    try {
      await ProviderAvailabilityService.deleteException(id);
      refresh();
    } catch (e) {
      setSnack({ open: true, message: e.message, severity: "error" });
    }
  };

  const blocksByDay = (dow) => template.filter((b) => b.day_of_week === dow);

  return (
    <Box>
      <NavigationDrawer />
      <Box sx={{ p: 4, maxWidth: 720, mx: "auto" }}>
        <Typography variant="h4" gutterBottom>Availability</Typography>

        <Typography variant="h6" sx={{ mt: 2 }}>Weekly schedule</Typography>
        {DAY_NAMES.map((name, dow) => (
          <Paper key={dow} sx={{ p: 2, mb: 1 }}>
            <Stack direction="row" justifyContent="space-between" alignItems="center">
              <Typography fontWeight="bold">{name}</Typography>
              <Button size="small" onClick={() => setAddBlock(dow)}>Add block</Button>
            </Stack>
            {blocksByDay(dow).length === 0 ? (
              <Typography variant="body2" color="text.secondary">No blocks</Typography>
            ) : (
              <Stack spacing={0.5} sx={{ mt: 1 }}>
                {blocksByDay(dow).map((b) => (
                  <Stack key={b.id} direction="row" justifyContent="space-between" alignItems="center">
                    <Typography>{b.start_time.slice(0, 5)} – {b.end_time.slice(0, 5)}</Typography>
                    <Button size="small" color="error" onClick={() => removeBlock(b.id)}>Remove</Button>
                  </Stack>
                ))}
              </Stack>
            )}
          </Paper>
        ))}

        <Divider sx={{ my: 3 }} />

        <Stack direction="row" justifyContent="space-between" alignItems="center">
          <Typography variant="h6">Time off</Typography>
          <Button onClick={() => setAddingException(true)}>Add time off</Button>
        </Stack>
        {exceptions.length === 0 ? (
          <Typography color="text.secondary" sx={{ mt: 1 }}>None.</Typography>
        ) : (
          exceptions.map((e) => (
            <Paper key={e.id} sx={{ p: 2, mt: 1 }}>
              <Stack direction="row" justifyContent="space-between" alignItems="center">
                <Box>
                  <Typography>
                    {DateTime.fromISO(e.start_at).toLocal().toFormat("LLL d h:mm a")}
                    {" – "}
                    {DateTime.fromISO(e.end_at).toLocal().toFormat("LLL d h:mm a")}
                  </Typography>
                  {e.reason && <Typography variant="body2" color="text.secondary">{e.reason}</Typography>}
                </Box>
                <Button size="small" color="error" onClick={() => removeException(e.id)}>Remove</Button>
              </Stack>
            </Paper>
          ))
        )}
      </Box>

      <Dialog open={addBlock !== null} onClose={() => setAddBlock(null)}>
        <DialogTitle>Add block — {addBlock !== null ? DAY_NAMES[addBlock] : ""}</DialogTitle>
        <DialogContent>
          <TextField type="time" label="Start" value={blockStart} onChange={(e) => setBlockStart(e.target.value)} InputLabelProps={{ shrink: true }} sx={{ mr: 2, mt: 1 }} />
          <TextField type="time" label="End" value={blockEnd} onChange={(e) => setBlockEnd(e.target.value)} InputLabelProps={{ shrink: true }} sx={{ mt: 1 }} />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAddBlock(null)}>Cancel</Button>
          <Button variant="contained" onClick={submitBlock}>Add</Button>
        </DialogActions>
      </Dialog>

      <Dialog open={addingException} onClose={() => setAddingException(false)}>
        <DialogTitle>Add time off</DialogTitle>
        <DialogContent>
          <TextField type="datetime-local" label="Start" value={exStart} onChange={(e) => setExStart(e.target.value)} InputLabelProps={{ shrink: true }} fullWidth sx={{ mt: 1, mb: 2 }} />
          <TextField type="datetime-local" label="End" value={exEnd} onChange={(e) => setExEnd(e.target.value)} InputLabelProps={{ shrink: true }} fullWidth sx={{ mb: 2 }} />
          <TextField label="Reason (optional)" value={exReason} onChange={(e) => setExReason(e.target.value)} fullWidth />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAddingException(false)}>Cancel</Button>
          <Button variant="contained" onClick={submitException}>Add</Button>
        </DialogActions>
      </Dialog>

      <Snackbar open={snack.open} autoHideDuration={5000} onClose={() => setSnack({ ...snack, open: false })}>
        <Alert severity={snack.severity}>{snack.message}</Alert>
      </Snackbar>
    </Box>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add frontend/src/pages/DoctorAvailabilityView.jsx
git commit -m "feat(frontend): add DoctorAvailabilityView"
```

---

## Task 13: Rewrite DoctorAppointmentsView against real API

**Files:**
- Modify: `frontend/src/pages/DoctorAppointmentsView.jsx`

- [ ] **Step 1: Read the current file to preserve any styling imports**

Run: `cat frontend/src/pages/DoctorAppointmentsView.jsx`

- [ ] **Step 2: Replace the entire contents**

```jsx
import { useState, useEffect } from "react";
import { DateTime } from "luxon";
import NavigationDrawer from "../components/NavigationDrawer";
import { UserAuth } from "../components/auth/AuthContext";
import AppointmentService from "../services/appointmentService";
import ProfileService from "../services/profileService";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import Stack from "@mui/material/Stack";
import Paper from "@mui/material/Paper";
import Divider from "@mui/material/Divider";
import Chip from "@mui/material/Chip";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import TextField from "@mui/material/TextField";
import Snackbar from "@mui/material/Snackbar";
import Alert from "@mui/material/Alert";

function fmt(iso) {
  return DateTime.fromISO(iso).toLocal().toFormat("cccc, LLL d · h:mm a");
}

export default function DoctorAppointmentsView() {
  const { session } = UserAuth();
  const [profile, setProfile] = useState(null);
  const [appts, setAppts] = useState([]);
  const [rescheduling, setRescheduling] = useState(null);
  const [rescheduleDate, setRescheduleDate] = useState("");
  const [rescheduleSlots, setRescheduleSlots] = useState([]);
  const [chosenSlot, setChosenSlot] = useState(null);
  const [snack, setSnack] = useState({ open: false, message: "", severity: "success" });

  useEffect(() => {
    if (!session?.user?.id) return;
    (async () => {
      const me = await ProfileService.getProfileByAuthUserId(session.user.id);
      setProfile(me.data || me);
    })();
  }, [session]);

  async function refresh() {
    if (!profile) return;
    const res = await AppointmentService.listForProvider(profile.id);
    setAppts(res.data || []);
  }
  useEffect(() => { if (profile) refresh(); }, [profile]);

  useEffect(() => {
    if (!rescheduling || !rescheduleDate) { setRescheduleSlots([]); return; }
    AppointmentService.getAvailability(profile.id, rescheduleDate, rescheduleDate)
      .then((res) => setRescheduleSlots(res.data || []))
      .catch((e) => setSnack({ open: true, message: e.message, severity: "error" }));
  }, [rescheduling, rescheduleDate, profile]);

  const onCancel = async (appt) => {
    if (!confirm("Cancel this appointment?")) return;
    try {
      await AppointmentService.cancel(appt.id, profile.id);
      setSnack({ open: true, message: "Cancelled", severity: "success" });
      refresh();
    } catch (e) {
      setSnack({ open: true, message: e.message, severity: "error" });
    }
  };

  const submitReschedule = async () => {
    if (!chosenSlot) return;
    try {
      await AppointmentService.reschedule(rescheduling.id, chosenSlot.start_at);
      setSnack({ open: true, message: "Rescheduled", severity: "success" });
      setRescheduling(null); setChosenSlot(null); setRescheduleDate("");
      refresh();
    } catch (e) {
      setSnack({ open: true, message: e.message, severity: "error" });
    }
  };

  const now = DateTime.utc();
  const upcoming = appts.filter((a) => a.status === "scheduled" && DateTime.fromISO(a.start_at) >= now);
  const past = appts.filter((a) => !(a.status === "scheduled" && DateTime.fromISO(a.start_at) >= now));

  const renderRow = (a, isUpcoming) => (
    <Paper key={a.id} sx={{ p: 2, mb: 1 }}>
      <Stack direction="row" justifyContent="space-between" alignItems="center">
        <Box>
          <Typography fontWeight="bold">{fmt(a.start_at)}</Typography>
          <Typography variant="body2" color="text.secondary">
            Patient: {a.patient?.first_name} {a.patient?.last_name}
          </Typography>
          {a.reason && <Typography variant="body2" sx={{ mt: 0.5 }}>Reason: {a.reason}</Typography>}
          {!isUpcoming && <Chip size="small" label={a.status} sx={{ mt: 0.5 }} />}
        </Box>
        {isUpcoming && (
          <Stack direction="row" spacing={1}>
            <Button size="small" onClick={() => { setRescheduling(a); setRescheduleDate(DateTime.local().toISODate()); }}>Reschedule</Button>
            <Button size="small" color="error" onClick={() => onCancel(a)}>Cancel</Button>
          </Stack>
        )}
      </Stack>
    </Paper>
  );

  return (
    <Box>
      <NavigationDrawer />
      <Box sx={{ p: 4, maxWidth: 720, mx: "auto" }}>
        <Typography variant="h4" gutterBottom>Appointments</Typography>

        <Typography variant="h6" sx={{ mt: 2 }}>Upcoming</Typography>
        {upcoming.length === 0 ? (
          <Typography color="text.secondary">None.</Typography>
        ) : upcoming.map((a) => renderRow(a, true))}

        <Divider sx={{ my: 3 }} />

        <Typography variant="h6">Past</Typography>
        {past.length === 0 ? (
          <Typography color="text.secondary">None.</Typography>
        ) : past.map((a) => renderRow(a, false))}
      </Box>

      <Dialog open={!!rescheduling} onClose={() => setRescheduling(null)} fullWidth maxWidth="xs">
        <DialogTitle>Reschedule</DialogTitle>
        <DialogContent>
          <TextField
            type="date"
            label="Date"
            value={rescheduleDate}
            onChange={(e) => setRescheduleDate(e.target.value)}
            InputLabelProps={{ shrink: true }}
            inputProps={{
              min: DateTime.local().toISODate(),
              max: DateTime.local().plus({ days: 60 }).toISODate(),
            }}
            fullWidth
            sx={{ mb: 2, mt: 1 }}
          />
          <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
            {rescheduleSlots.map((s) => {
              const label = DateTime.fromISO(s.start_at).toLocal().toFormat("h:mm a");
              const selected = chosenSlot?.start_at === s.start_at;
              return (
                <Chip
                  key={s.start_at}
                  label={label}
                  color={selected ? "primary" : "default"}
                  variant={selected ? "filled" : "outlined"}
                  onClick={() => setChosenSlot(s)}
                />
              );
            })}
          </Stack>
          {rescheduleSlots.length === 0 && rescheduleDate && (
            <Typography color="text.secondary" sx={{ mt: 1 }}>No availability this day.</Typography>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => { setRescheduling(null); setChosenSlot(null); }}>Close</Button>
          <Button variant="contained" disabled={!chosenSlot} onClick={submitReschedule}>Confirm</Button>
        </DialogActions>
      </Dialog>

      <Snackbar open={snack.open} autoHideDuration={5000} onClose={() => setSnack({ ...snack, open: false })}>
        <Alert severity={snack.severity}>{snack.message}</Alert>
      </Snackbar>
    </Box>
  );
}
```

- [ ] **Step 3: Commit**

```bash
git add frontend/src/pages/DoctorAppointmentsView.jsx
git commit -m "feat(frontend): replace mocked DoctorAppointmentsView with real data"
```

---

## Task 14: Router and navigation

**Files:**
- Modify: `frontend/src/routes/router.jsx`
- Modify: `frontend/src/components/NavigationDrawer.jsx`

- [ ] **Step 1: Add routes in `frontend/src/routes/router.jsx`**

Add three imports at the top:

```jsx
import BookAppointmentView from "../pages/BookAppointmentView";
import MyAppointmentsView from "../pages/MyAppointmentsView";
import DoctorAvailabilityView from "../pages/DoctorAvailabilityView";
```

Add three route entries inside `createBrowserRouter`:

```jsx
{path: "/book-appointment", element: <PrivateRoute><BookAppointmentView /></PrivateRoute>},
{path: "/my-appointments", element: <PrivateRoute><MyAppointmentsView /></PrivateRoute>},
{path: "/doctor/availability", element: <PrivateRoute><DoctorAvailabilityView /></PrivateRoute>},
```

- [ ] **Step 2: Add "Appointments" + "Availability" to `NavigationDrawer.jsx`**

In `frontend/src/components/NavigationDrawer.jsx`, replace the `NavigationPageList` array with:

```js
  const NavigationPageList = [
    {id:1, text: 'Dashboard', href: '/patient'},
    {id:2, text: 'Weekly Report', href: '/weekly-report'},
    {id:3, text: 'History', href: '/history'},
    {id:4, text: 'Appointments', href: '/my-appointments'},
    {id:5, text: 'Availability', href: '/doctor/availability'},
  ]
```

(The drawer is shown on both patient and provider pages in the current codebase, so both links appear everywhere. Further role-based filtering is out of scope.)

- [ ] **Step 3: Commit**

```bash
git add frontend/src/routes/router.jsx frontend/src/components/NavigationDrawer.jsx
git commit -m "feat(frontend): add appointment and availability routes to navigation"
```

---

## Task 15: Update database schema doc

**Files:**
- Modify: `docs/database-schema.md`

- [ ] **Step 1: Update the file**

At the bottom of `docs/database-schema.md`, append (and add the `timezone` line inside the existing `provider_details` block):

In the `provider_details` block, add:
```
  timezone text NOT NULL DEFAULT 'America/Chicago',
```

At the end of the file, append:

```sql
CREATE TABLE public.provider_availability (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  provider_id uuid NOT NULL,
  day_of_week smallint NOT NULL CHECK (day_of_week BETWEEN 0 AND 6),
  start_time time NOT NULL,
  end_time time NOT NULL CHECK (end_time > start_time),
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT provider_availability_pkey PRIMARY KEY (id),
  CONSTRAINT provider_availability_provider_fkey FOREIGN KEY (provider_id) REFERENCES public.profiles(id),
  CONSTRAINT provider_availability_unique_slot UNIQUE (provider_id, day_of_week, start_time)
);
CREATE TABLE public.provider_availability_exceptions (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  provider_id uuid NOT NULL,
  start_at timestamp with time zone NOT NULL,
  end_at timestamp with time zone NOT NULL CHECK (end_at > start_at),
  reason text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT provider_availability_exceptions_pkey PRIMARY KEY (id),
  CONSTRAINT provider_availability_exceptions_provider_fkey FOREIGN KEY (provider_id) REFERENCES public.profiles(id)
);
CREATE TABLE public.appointments (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  provider_id uuid NOT NULL,
  patient_id uuid NOT NULL,
  start_at timestamp with time zone NOT NULL,
  end_at timestamp with time zone NOT NULL CHECK (end_at = start_at + interval '1 hour'),
  status text NOT NULL DEFAULT 'scheduled'
         CHECK (status IN ('scheduled','cancelled','completed')),
  reason text,
  cancelled_at timestamp with time zone,
  cancelled_by uuid,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT appointments_pkey PRIMARY KEY (id),
  CONSTRAINT appointments_provider_fkey FOREIGN KEY (provider_id) REFERENCES public.profiles(id),
  CONSTRAINT appointments_patient_fkey FOREIGN KEY (patient_id) REFERENCES public.profiles(id),
  CONSTRAINT appointments_cancelled_by_fkey FOREIGN KEY (cancelled_by) REFERENCES public.profiles(id)
);
-- Prevents double-booking at the DB level:
CREATE UNIQUE INDEX appointments_unique_scheduled_slot
  ON public.appointments (provider_id, start_at)
  WHERE status = 'scheduled';
```

- [ ] **Step 2: Commit**

```bash
git add docs/database-schema.md
git commit -m "docs: document appointments, availability, and exceptions tables"
```

---

## Task 16: End-to-end manual smoke test

No code. Verify the feature works end-to-end, using two browser profiles or an incognito window so you can be logged in as a patient and provider simultaneously.

- [ ] **Step 1: Start both services**

```bash
cd backend && npm run dev
```

```bash
cd frontend && npm run dev
```

- [ ] **Step 2: As provider — set availability**

1. Log in as a provider account. Confirm a `provider_patients` row exists linking this provider to the test patient (create via Supabase table editor if needed).
2. Navigate to `/doctor/availability`.
3. Add a weekly block: Monday 09:00–12:00.
4. Refresh. The block persists.

- [ ] **Step 3: As patient — book**

1. In a separate window, log in as the patient.
2. Navigate to `/book-appointment`.
3. Provider dropdown shows the linked provider.
4. Pick the next upcoming Monday. Slot chips appear: 9am, 10am, 11am.
5. Pick 10am, enter a reason, click Confirm.
6. Redirected to `/my-appointments`; the appointment shows under "Upcoming."

- [ ] **Step 4: Provider sees it**

1. Switch to provider window; navigate to `/doctor/appointments`.
2. The appointment appears under "Upcoming" with the patient's name and reason.

- [ ] **Step 5: Reschedule**

1. As patient, click Reschedule on the appointment.
2. Pick a different date with slots; pick 11am; Confirm.
3. Both sides reflect the new time.

- [ ] **Step 6: Conflict test**

1. In a third browser tab (patient side), open `/book-appointment`, pick the same date+slot.
2. Click Confirm. Expect a 409 toast "That time was just booked…" and the slot list to refresh.

- [ ] **Step 7: Cancel**

1. As patient, Cancel the appointment. Toast "Cancelled"; row moves to Past with status chip.
2. As provider, the cancelled appointment shows in Past with status=cancelled.
3. That same slot is bookable again (since the unique index is partial on `status='scheduled'`).

- [ ] **Step 8: Time off**

1. As provider, on `/doctor/availability`, add a time-off range covering next Monday 10:00–11:00.
2. As patient, on `/book-appointment`, pick that date. The 10am chip is gone; 9am and 11am remain.

- [ ] **Step 9: Horizon and past-date guards**

1. Try to set the date picker past `today+60`. The browser's `max` attribute prevents it.
2. If you bypass with devtools and POST directly with `start_at` 61+ days out, backend returns 400.

- [ ] **Step 10: Commit any smoke-test-driven fixes**

If the smoke test surfaces issues, fix them and commit with `fix:` prefix. If everything passes, no commit.

---

## Execution handoff

Plan complete and saved to `docs/superpowers/plans/2026-04-23-appointments.md`. Two execution options:

1. **Subagent-Driven (recommended)** — fresh subagent per task, review between tasks, fast iteration.
2. **Inline Execution** — execute tasks in this session using executing-plans, batch execution with checkpoints.

Which approach?
