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
