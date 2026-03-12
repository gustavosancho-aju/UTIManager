-- UTI Manager — Initial Schema
-- Run this in Supabase SQL Editor

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- ══════════════════════════════════════════
-- PATIENTS
-- ══════════════════════════════════════════
create table public.patients (
  id uuid primary key default uuid_generate_v4(),
  initials text not null,
  name text not null,
  gender text not null check (gender in ('M', 'F')),
  birth_date date not null,
  registration text unique not null,
  bed text not null,
  unit text not null default 'UTI Adulto',
  admission_date date not null,
  admission_reason text not null,
  main_diagnosis text not null,
  clinical_status text not null default 'Não informado',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- ══════════════════════════════════════════
-- REPORTS (laudos médicos)
-- ══════════════════════════════════════════
create table public.reports (
  id uuid primary key default uuid_generate_v4(),
  patient_id uuid not null references public.patients(id) on delete cascade,
  date date not null,
  time text not null,
  author text not null,
  transcription text not null,
  devices jsonb default '{}',
  ventilation jsonb default '{}',
  sedation jsonb default '{}',
  antibiotics text default 'Não informado',
  hemodynamics text default 'Não informado',
  clinical_condition text default 'Não informado',
  diuresis text default 'Não informado',
  vital_signs jsonb,
  created_at timestamptz default now()
);

create index idx_reports_patient on public.reports(patient_id);
create index idx_reports_date on public.reports(date desc);

-- ══════════════════════════════════════════
-- VITALS (sinais vitais — timeline)
-- ══════════════════════════════════════════
create table public.vitals (
  id uuid primary key default uuid_generate_v4(),
  patient_id uuid not null references public.patients(id) on delete cascade,
  date date not null,
  time text not null,
  pa text not null,
  fc integer not null,
  temp numeric(4,1) not null,
  sato2 integer not null,
  author text not null,
  created_at timestamptz default now()
);

create index idx_vitals_patient on public.vitals(patient_id);
create index idx_vitals_date on public.vitals(date desc, time desc);

-- ══════════════════════════════════════════
-- CHECKLISTS (checklist diário UTI)
-- ══════════════════════════════════════════
create table public.checklists (
  id uuid primary key default uuid_generate_v4(),
  patient_id uuid unique not null references public.patients(id) on delete cascade,
  analgesia_sedacao jsonb default '{}',
  dieta jsonb default '{}',
  prev_complicacoes jsonb default '{}',
  prev_pneumonia jsonb default '{}',
  prev_ipcs jsonb default '{}',
  antibioticos jsonb default '{}',
  exames jsonb default '{}',
  planejamento jsonb default '{}',
  conformidades jsonb default '{}',
  updated_at timestamptz default now()
);

-- ══════════════════════════════════════════
-- AUTO-UPDATE updated_at
-- ══════════════════════════════════════════
create or replace function public.handle_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger patients_updated_at
  before update on public.patients
  for each row execute function public.handle_updated_at();

create trigger checklists_updated_at
  before update on public.checklists
  for each row execute function public.handle_updated_at();

-- ══════════════════════════════════════════
-- RLS Policies (enable when auth is ready)
-- ══════════════════════════════════════════
alter table public.patients enable row level security;
alter table public.reports enable row level security;
alter table public.vitals enable row level security;
alter table public.checklists enable row level security;

-- Temporary: allow all for authenticated users
create policy "Allow all for authenticated" on public.patients
  for all using (auth.role() = 'authenticated');

create policy "Allow all for authenticated" on public.reports
  for all using (auth.role() = 'authenticated');

create policy "Allow all for authenticated" on public.vitals
  for all using (auth.role() = 'authenticated');

create policy "Allow all for authenticated" on public.checklists
  for all using (auth.role() = 'authenticated');
