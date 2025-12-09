-- Drop existing policies that cause infinite recursion
drop policy if exists "Admins can view all profiles" on public.profiles;
drop policy if exists "Admins can update all profiles" on public.profiles;

-- Create a function to check if user is admin (bypasses RLS)
create or replace function public.is_admin(user_id uuid)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
  user_role text;
begin
  select role into user_role
  from public.profiles
  where id = user_id;
  
  return user_role = 'admin';
end;
$$;

-- Recreate admin policies using the function
create policy "Admins can view all profiles"
  on public.profiles for select
  using (public.is_admin(auth.uid()));

create policy "Admins can update all profiles"
  on public.profiles for update
  using (public.is_admin(auth.uid()));

-- Also add insert policy for admins
create policy "Admins can insert profiles"
  on public.profiles for insert
  with check (public.is_admin(auth.uid()));
