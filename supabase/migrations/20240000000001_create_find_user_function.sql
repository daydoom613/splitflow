-- Drop existing function if it exists
drop function if exists public.find_user_by_email(text);

-- Create a function to find users by email using profiles table
create or replace function public.find_user_by_email(email_to_find text)
returns table (
  id uuid,
  email text,
  full_name text
)
security definer
set search_path = public
language plpgsql
as $$
begin
  return query
  select 
    p.id,
    p.email,
    p.full_name
  from profiles p
  where p.email = email_to_find;
end;
$$;

-- Grant execute permission to authenticated users
grant execute on function public.find_user_by_email(text) to authenticated;

-- Ensure RLS policy for groups is correct
drop policy if exists "Users can view groups they are members of" on groups;
create policy "Users can view groups they are members of"
  on groups
  for select
  using (
    auth.uid() = created_by or
    exists (
      select 1 from group_members
      where group_members.group_id = groups.id
      and group_members.user_id = auth.uid()
    )
  );

-- Ensure RLS policy for group_members is correct
drop policy if exists "Users can view their group memberships" on group_members;
create policy "Users can view their group memberships"
  on group_members
  for select
  using (
    user_id = auth.uid() or
    exists (
      select 1 from groups
      where groups.id = group_members.group_id
      and groups.created_by = auth.uid()
    )
  ); 