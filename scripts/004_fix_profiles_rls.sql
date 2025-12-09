-- Fix infinite recursion in profiles RLS policies
-- This script drops the problematic admin policies and recreates them properly

-- Drop the problematic policies that cause infinite recursion
drop policy if exists "Admins can view all profiles" on public.profiles;
drop policy if exists "Admins can update all profiles" on public.profiles;

-- Create a security definer function to check if user is admin
-- This function bypasses RLS, preventing infinite recursion
create or replace function public.is_admin(user_id uuid)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
begin
  return exists (
    select 1 from public.profiles
    where id = user_id and role = 'admin'
  );
end;
$$;

-- Recreate admin policies using the security definer function
create policy "Admins can view all profiles"
  on public.profiles for select
  using (
    auth.uid() = id or public.is_admin(auth.uid())
  );

create policy "Admins can update all profiles"
  on public.profiles for update
  using (
    auth.uid() = id or public.is_admin(auth.uid())
  );

-- Grant execute permission on the function
grant execute on function public.is_admin(uuid) to authenticated;
