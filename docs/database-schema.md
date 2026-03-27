-- WARNING: This schema is for context only and is not meant to be run.
-- Table order and constraints may not be valid for execution.

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
  first_name text NOT NULL,
  last_name text NOT NULL,
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
