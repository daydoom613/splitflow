-- Create a function to get or create a profile
create or replace function public.get_or_create_profile(p_email text)
returns table (
  id uuid,
  email text,
  full_name text
)
security definer
set search_path = public, auth
language plpgsql
as $$
declare
  v_user_id uuid;
  v_profile record;
begin
  -- First check if profile exists
  select * into v_profile
  from public.profiles
  where profiles.email = p_email;

  if v_profile is not null then
    return query select v_profile.id, v_profile.email, v_profile.full_name;
    return;
  end if;

  -- If no profile, check auth.users
  select id into v_user_id
  from auth.users
  where auth.users.email = p_email;

  if v_user_id is null then
    return;
  end if;

  -- Create profile if user exists in auth.users
  insert into public.profiles (id, email, full_name, updated_at)
  values (
    v_user_id,
    p_email,
    split_part(p_email, '@', 1),  -- Use part before @ as name
    now()
  )
  returning profiles.id, profiles.email, profiles.full_name into v_profile;

  return query select v_profile.id, v_profile.email, v_profile.full_name;
end;
$$;

-- Grant execute permission to authenticated users
grant execute on function public.get_or_create_profile(text) to authenticated; 