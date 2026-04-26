-- WARNING: This schema is for context only and is not meant to be run.
-- Table order and constraints may not be valid for execution.

CREATE TABLE public.alerts (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  patient_id uuid NOT NULL,
  provider_id uuid NOT NULL,
  check_in_id uuid NOT NULL,
  alert_type text NOT NULL CHECK (alert_type = ANY (ARRAY['high_total_score'::text, 'critical_single_response'::text])),
  severity text NOT NULL DEFAULT 'warning'::text CHECK (severity = ANY (ARRAY['warning'::text, 'critical'::text])),
  message text NOT NULL,
  question_id uuid,
  score_value integer,
  total_score integer,
  status text NOT NULL DEFAULT 'new'::text CHECK (status = ANY (ARRAY['new'::text, 'reviewed'::text, 'dismissed'::text])),
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  reviewed_at timestamp with time zone,
  CONSTRAINT alerts_pkey PRIMARY KEY (id),
  CONSTRAINT alerts_patient_id_fkey FOREIGN KEY (patient_id) REFERENCES public.profiles(id),
  CONSTRAINT alerts_provider_id_fkey FOREIGN KEY (provider_id) REFERENCES public.profiles(id),
  CONSTRAINT alerts_check_in_id_fkey FOREIGN KEY (check_in_id) REFERENCES public.check_ins(id),
  CONSTRAINT alerts_question_id_fkey FOREIGN KEY (question_id) REFERENCES public.questions(id)
);
CREATE TABLE public.attachments (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  patient_id uuid NOT NULL,
  check_in_id uuid,
  file_type text NOT NULL CHECK (file_type = ANY (ARRAY['voice_memo'::text, 'document'::text, 'image'::text, 'other'::text])),
  storage_path text NOT NULL,
  file_name text NOT NULL,
  duration_secs integer,
  notes text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT attachments_pkey PRIMARY KEY (id),
  CONSTRAINT attachments_patient_id_fkey FOREIGN KEY (patient_id) REFERENCES public.profiles(id),
  CONSTRAINT attachments_check_in_id_fkey FOREIGN KEY (check_in_id) REFERENCES public.check_ins(id)
);
CREATE TABLE public.check_in_responses (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  check_in_id uuid NOT NULL,
  question_id uuid NOT NULL,
  numeric_value integer,
  text_value text,
  answered_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT check_in_responses_pkey PRIMARY KEY (id),
  CONSTRAINT check_in_responses_check_in_id_fkey FOREIGN KEY (check_in_id) REFERENCES public.check_ins(id),
  CONSTRAINT check_in_responses_question_id_fkey FOREIGN KEY (question_id) REFERENCES public.questions(id)
);
CREATE TABLE public.check_ins (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  patient_id uuid NOT NULL,
  check_in_date date NOT NULL DEFAULT CURRENT_DATE,
  status text NOT NULL DEFAULT 'not_started'::text CHECK (status = ANY (ARRAY['not_started'::text, 'in_progress'::text, 'complete'::text])),
  started_at timestamp with time zone,
  completed_at timestamp with time zone,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT check_ins_pkey PRIMARY KEY (id),
  CONSTRAINT check_ins_patient_id_fkey FOREIGN KEY (patient_id) REFERENCES public.profiles(id)
);
CREATE TABLE public.patient_details (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  profile_id uuid NOT NULL UNIQUE,
  date_of_birth date,
  phone text,
  address_line1 text,
  address_line2 text,
  city text,
  state text,
  zip_code text,
  emergency_contact_name text,
  emergency_contact_phone text,
  emergency_contact_relation text,
  allergies ARRAY DEFAULT '{}'::text[],
  current_medications ARRAY DEFAULT '{}'::text[],
  medical_conditions ARRAY DEFAULT '{}'::text[],
  diagnosis_date date,
  disease_stage text,
  notes text,
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT patient_details_pkey PRIMARY KEY (id),
  CONSTRAINT patient_details_profile_id_fkey FOREIGN KEY (profile_id) REFERENCES public.profiles(id)
);
CREATE TABLE public.profiles (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  auth_user_id uuid NOT NULL UNIQUE,
  role text NOT NULL CHECK (role = ANY (ARRAY['patient'::text, 'provider'::text])),
  first_name text NOT NULL CHECK (first_name IS NOT NULL AND TRIM(BOTH FROM first_name) <> ''::text),
  last_name text NOT NULL CHECK (last_name IS NOT NULL AND TRIM(BOTH FROM last_name) <> ''::text),
  email text NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT profiles_pkey PRIMARY KEY (id),
  CONSTRAINT profiles_auth_user_id_fkey FOREIGN KEY (auth_user_id) REFERENCES auth.users(id)
);
CREATE TABLE public.provider_details (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  profile_id uuid NOT NULL UNIQUE,
  specialty text,
  license_number text,
  clinic_name text,
  clinic_phone text,
  clinic_address text,
  npi_number text,
  accepting_patients boolean DEFAULT true,
  timezone text NOT NULL DEFAULT 'America/Chicago',
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT provider_details_pkey PRIMARY KEY (id),
  CONSTRAINT provider_details_profile_id_fkey FOREIGN KEY (profile_id) REFERENCES public.profiles(id)
);
CREATE TABLE public.provider_patients (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  provider_id uuid NOT NULL,
  patient_id uuid NOT NULL,
  status text NOT NULL DEFAULT 'active'::text CHECK (status = ANY (ARRAY['active'::text, 'inactive'::text])),
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT provider_patients_pkey PRIMARY KEY (id),
  CONSTRAINT provider_patients_provider_id_fkey FOREIGN KEY (provider_id) REFERENCES public.profiles(id),
  CONSTRAINT provider_patients_patient_id_fkey FOREIGN KEY (patient_id) REFERENCES public.profiles(id)
);
CREATE TABLE public.questions (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  question_text text NOT NULL,
  question_type text NOT NULL DEFAULT 'scale'::text CHECK (question_type = ANY (ARRAY['scale'::text, 'yes_no'::text, 'free_text'::text])),
  scale_min integer DEFAULT 0,
  scale_max integer DEFAULT 4,
  scale_min_label text DEFAULT 'None'::text,
  scale_max_label text DEFAULT 'Very severe'::text,
  display_order integer NOT NULL DEFAULT 0,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT questions_pkey PRIMARY KEY (id)
);

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
