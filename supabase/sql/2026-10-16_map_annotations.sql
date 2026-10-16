-- 2026-10-16 — map_annotations: shapes, lines and labels a Mayordomo draws
-- straight onto the parish map.
-- Applied with: bunx supabase db query --linked -f supabase/sql/2026-10-16_map_annotations.sql
-- Idempotent.

-- ---------------------------------------------------------------------------
-- The chapter already has `regions` — the community areas drawn in
-- Mayordomo → Areas. This is a different thing and deliberately a separate
-- table: `regions` is one closed vocabulary of named territories that the
-- whole site treats as structure, replaced wholesale on every save. These are
-- marginalia — an arrow, an outline, a word set on the land — each row
-- standing on its own, each with its own audience.
--
-- That audience is the point of the table. `visibility` is enforced here, in
-- RLS, and not in the layer toggle: a land-search outline marked 'admin' is
-- not merely unchecked for a member, it is never sent to their browser.
--
--   public   anyone, signed in or not
--   members  approved members (is_approved_member())
--   admin    stewards only (is_admin())
--
-- `geojson` holds one GeoJSON geometry (Polygon, LineString or Point) in
-- [lng, lat] order, as GeoJSON specifies and as Leaflet's L.geoJSON reads.
-- `style` names design tokens rather than colors — {"color": "ocre",
-- "weight": 2, "fillOpacity": 0.08} — so an annotation drawn today still
-- matches the palette after the palette moves.
-- ---------------------------------------------------------------------------
create table if not exists public.map_annotations (
  id          uuid primary key default gen_random_uuid(),
  layer       text not null default 'annotations',
  geojson     jsonb not null,
  label_en    text,
  label_es    text,
  style       jsonb not null default '{}'::jsonb,
  visibility  text not null default 'public'
                check (visibility in ('public', 'members', 'admin')),
  created_by  uuid references public.profiles(id) on delete set null,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create index if not exists map_annotations_layer_idx
  on public.map_annotations (layer, visibility);

alter table public.map_annotations enable row level security;

-- Reads. Three permissive policies that OR together, so each viewer sees
-- exactly their own tier and nothing above it.
drop policy if exists map_annotations_select_public on public.map_annotations;
create policy map_annotations_select_public
  on public.map_annotations for select
  to anon, authenticated
  using (visibility = 'public');

drop policy if exists map_annotations_select_members on public.map_annotations;
create policy map_annotations_select_members
  on public.map_annotations for select
  to authenticated
  using (visibility = 'members' and is_approved_member());

drop policy if exists map_annotations_select_admin on public.map_annotations;
create policy map_annotations_select_admin
  on public.map_annotations for select
  to authenticated
  using (is_admin());

-- Writes. Stewards only, at every visibility.
drop policy if exists map_annotations_admin_write on public.map_annotations;
create policy map_annotations_admin_write
  on public.map_annotations for all
  to authenticated
  using (is_admin()) with check (is_admin());

-- anon needs select only; the policies above decide which rows.
grant select on public.map_annotations to anon;
grant select, insert, update, delete on public.map_annotations to authenticated;

create or replace function public.map_annotations_touch()
returns trigger language plpgsql as $$
begin
  new.updated_at := now();
  return new;
end $$;

drop trigger if exists map_annotations_touch on public.map_annotations;
create trigger map_annotations_touch
  before update on public.map_annotations
  for each row execute function public.map_annotations_touch();
