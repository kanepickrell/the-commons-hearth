-- 2026-11-05 — follow-up email for members who never finished their profile.
-- Applied via
--   `supabase db query --linked -f supabase/sql/2026-11-05_profile_nudge.sql`.
-- Idempotent; re-running is safe.
--
-- About two thirds of approved members have no parish and no bio. Most were
-- added by hand in Mayordomo and never signed in; a few signed up and left the
-- onboarding wizard before step 2. The `profile-nudge` Edge Function asks them
-- once, then once more, to finish. This file gives it the list and runs it
-- daily.

-- ---------------------------------------------------------------------------
-- 1. Who to nudge.
--
-- Approved, missing a parish or a bio, signed up at least two days ago (so a
-- brand-new member mid-wizard isn't emailed), and either never nudged or
-- nudged once more than ten days ago. Two nudges, then we stop. "Nudged" is
-- read from email_log, which the function already writes through
-- log_gathering_email(), so there is no new column to keep in step.
--
-- p_email narrows to one address and skips the two-day wait, for testing a
-- send by hand. The two-nudge limit still holds.
-- ---------------------------------------------------------------------------
drop function if exists public.profiles_needing_nudge(int);

create or replace function public.profiles_needing_nudge(p_limit int default 20, p_email text default null)
returns table (
  profile_id     uuid,
  email          text,
  display_name   text,
  language       text,
  missing_parish boolean,
  missing_bio    boolean,
  nudges_sent    int
)
language sql
stable
security definer
set search_path = public, auth
as $$
  with sent as (
    select lower(recipient) as email, count(*) as n, max(created_at) as last_at
    from public.email_log
    where kind = 'profile_nudge' and status = 'sent'
    group by lower(recipient)
  )
  select p.id,
         u.email::text,
         p.display_name,
         coalesce(p.bio_language, u.raw_user_meta_data->>'language'),
         p.parish_id is null,
         coalesce(btrim(p.bio), '') = '',
         coalesce(s.n, 0)::int
  from public.profiles p
  join auth.users u on u.id = p.id
  left join sent s on s.email = lower(u.email)
  where p.status = 'approved'
    and u.email is not null
    and (p.parish_id is null or coalesce(btrim(p.bio), '') = '')
    and (p_email is null or lower(u.email) = lower(p_email))
    and (p_email is not null or u.created_at < now() - interval '2 days')
    and (s.n is null or (s.n < 2 and s.last_at < now() - interval '10 days'))
  order by u.created_at desc
  limit p_limit;
$$;

revoke all on function public.profiles_needing_nudge(int, text) from public, anon, authenticated;
grant execute on function public.profiles_needing_nudge(int, text) to service_role;

-- ---------------------------------------------------------------------------
-- 2. Run it every day at 15:00 UTC (9 or 10 AM in Texas).
--
-- The function is verify_jwt = false and checks a shared secret instead, so
-- the job works whichever API key format the project is on. Store the secret
-- once, by hand, with the same value as the function's NUDGE_SECRET:
--
--   select vault.create_secret('<long random string>', 'profile_nudge_secret');
--
-- To pause:  select cron.unschedule('profile-nudge');
-- ---------------------------------------------------------------------------
create extension if not exists pg_cron;
create extension if not exists pg_net;

select cron.schedule(
  'profile-nudge',
  '0 15 * * *',
  $job$
  select net.http_post(
    url     := 'https://ppzgdwjojztugeyqvbdi.supabase.co/functions/v1/profile-nudge',
    headers := jsonb_build_object(
      'Content-Type',   'application/json',
      'x-nudge-secret', (select decrypted_secret from vault.decrypted_secrets
                         where name = 'profile_nudge_secret')
    ),
    body    := '{}'::jsonb,
    timeout_milliseconds := 60000
  );
  $job$
);
