-- Set the correct search path and switch to postgres role
set search_path = public, auth;
set role postgres;

-- Create a table to store user lookups
create table if not exists public.user_lookups (
  id uuid primary key default gen_random_uuid(),
  email text not null unique,
  user_id uuid,
  created_at timestamptz default now()
);

-- Set ownership and grants
alter table public.user_lookups owner to postgres;
grant select on public.user_lookups to authenticated;

-- Enable RLS
alter table public.user_lookups enable row level security;

-- Create RLS policy
create policy "Users can view all user lookups"
  on public.user_lookups
  for select
  to authenticated
  using (true);

-- Create function to safely check if a user exists in auth.users
create or replace function public.get_user_by_email(search_email text)
returns table (
  id uuid,
  email text
) 
security definer
set search_path = public, auth
language plpgsql
as $$
declare
  v_user_id uuid;
  v_email text;
begin
  -- First check if we have a cached result
  select user_id, email into v_user_id, v_email
  from public.user_lookups
  where email = search_email;
  
  -- If not found in cache, check auth.users
  if v_user_id is null then
    select id, email::text into v_user_id, v_email
    from auth.users
    where email = search_email
    limit 1;
    
    -- If found in auth.users, cache the result
    if v_user_id is not null then
      insert into public.user_lookups (email, user_id)
      values (v_email, v_user_id)
      on conflict (email) do update
      set user_id = excluded.user_id;
    end if;
  end if;
  
  -- Return the result
  if v_user_id is not null then
    return query select v_user_id, v_email;
  end if;
end;
$$;

-- Set the owner of the function to postgres
alter function public.get_user_by_email(text) owner to postgres;

-- Grant access to the function
grant execute on function public.get_user_by_email(text) to authenticated;
grant execute on function public.get_user_by_email(text) to service_role;

-- Create an API view that uses the function
create or replace view public.get_user_by_email as
select * from public.get_user_by_email('')
where false;

-- Set the owner of the view to postgres
alter view public.get_user_by_email owner to postgres;

-- Enable RLS on the view and set owner
grant all on public.get_user_by_email to postgres;
grant select on public.get_user_by_email to authenticated;
grant select on public.get_user_by_email to service_role;

-- Add RLS policy to allow authenticated users to query the view
create policy "Allow authenticated users to query get_user_by_email"
  on public.get_user_by_email
  for select
  to authenticated
  using (true); 