-- 2026-09-21 — privacy fixes found during a site review. Applied via
-- `supabase db query --linked -f supabase/sql/2026-09-21_privacy_fixes.sql`.
-- Idempotent; re-running is safe.

-- ---------------------------------------------------------------------------
-- 1. Stop anonymous reads of the `workshops` base table.
--
-- `gatherings_public` hides held_at/location_text/lat/lng on UPCOMING
-- gatherings from non-members, but the base table also had this policy:
--
--   workshops_select  (anon, authenticated)
--     using (status = 'approved' or host_id = auth.uid() or is_admin())
--
-- which let anyone read the full street address and GPS of every approved
-- gathering. The narrower policies that were meant to replace it —
-- workshops_select_own (host_id = auth.uid()) and workshops_select_admin
-- (is_admin()), both `to authenticated` — already exist, so dropping the broad
-- one is the whole fix. Public reads go through the view, which is not
-- security_invoker and therefore unaffected.
--
-- Rollback, if ever needed:
--   create policy workshops_select on public.workshops for select
--     to anon, authenticated
--     using (status = 'approved' or host_id = auth.uid() or is_admin());
-- ---------------------------------------------------------------------------
drop policy if exists workshops_select on public.workshops;

-- ---------------------------------------------------------------------------
-- 2. Let anonymous visitors read profiles.custom_skills.
--
-- The column was added after the per-column grants on `profiles`, so anon had
-- no SELECT on it. PostgREST rejects the *whole* query when any requested
-- column is denied, which broke /members/:id for signed-out visitors ("Member
-- not found"). Skills are public like bio and crafts; contact_email stays
-- members-only.
-- ---------------------------------------------------------------------------
grant select (custom_skills) on public.profiles to anon;
