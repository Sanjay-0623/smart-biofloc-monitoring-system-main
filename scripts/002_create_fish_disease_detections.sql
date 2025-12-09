-- Create fish disease detections table
create table if not exists public.fish_disease_detections (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  image_url text not null,
  disease_name text not null,
  confidence_score numeric(5,2) not null check (confidence_score >= 0 and confidence_score <= 100),
  description text,
  treatment_suggestions text,
  detected_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS
alter table public.fish_disease_detections enable row level security;

-- Policies for fish disease detections
create policy "Users can view their own detections"
  on public.fish_disease_detections for select
  using (auth.uid() = user_id);

create policy "Users can insert their own detections"
  on public.fish_disease_detections for insert
  with check (auth.uid() = user_id);

create policy "Users can delete their own detections"
  on public.fish_disease_detections for delete
  using (auth.uid() = user_id);

create policy "Admins can view all detections"
  on public.fish_disease_detections for select
  using (
    exists (
      select 1 from public.profiles
      where id = auth.uid() and role = 'admin'
    )
  );

create policy "Admins can delete all detections"
  on public.fish_disease_detections for delete
  using (
    exists (
      select 1 from public.profiles
      where id = auth.uid() and role = 'admin'
    )
  );

-- Create index for faster queries
create index if not exists fish_disease_detections_user_id_idx on public.fish_disease_detections(user_id);
create index if not exists fish_disease_detections_detected_at_idx on public.fish_disease_detections(detected_at desc);
