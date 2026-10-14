-- Backfill profiles.icon_slug — the member's "mark".
--
-- MemberDetail renders this at 120px, the largest icon on the site, but until
-- now nothing in the app ever WROTE the column: onboarding collected crafts
-- into `expertise` and left icon_slug null. Every member page therefore showed
-- a blank where the artwork belongs.
--
-- Onboarding now sets it. This fills it in for members who were added by a
-- steward (admin_add_member) or who onboarded before the change, choosing the
-- first craft they claim that actually has artwork drawn for it.
--
-- Safe to re-run: it only touches rows where icon_slug IS NULL.
-- Keep the list below in sync with ILLUSTRATED_CRAFTS in src/lib/crafts.ts.

update public.profiles p
set    icon_slug = e.craft,
       updated_at = now()
from (
  select distinct on (profile_id) profile_id, craft
  from   public.expertise
  where  craft in (
           'las-abejas','la-gallina','el-pan','la-conserva',
           'la-cisterna','la-azuela','el-telar','las-yerbas'
         )
  order  by profile_id, craft
) e
where  p.id = e.profile_id
  and  p.icon_slug is null;

-- How many members still have no mark (no illustrated craft claimed):
--   select count(*) from public.profiles where icon_slug is null;
