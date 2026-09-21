-- 2026-09-21 — Chester, the chapter's chat guide.
-- Applied with: bunx supabase db query --linked -f supabase/sql/2026-09-21_chester.sql
-- Idempotent.

-- ---------------------------------------------------------------------------
-- chester_knowledge — the notes Chester answers from. Stewards edit these in
-- Mayordomo → Chester. The Edge Function reads them with the service role, so
-- no public grant is needed (keeps the prompt from being scraped).
-- ---------------------------------------------------------------------------
create table if not exists public.chester_knowledge (
  id          uuid primary key default gen_random_uuid(),
  slug        text not null unique,
  title       text not null,
  body        text not null,
  sort_order  integer not null default 0,
  enabled     boolean not null default true,
  updated_at  timestamptz not null default now()
);

alter table public.chester_knowledge enable row level security;

drop policy if exists chester_knowledge_admin_all on public.chester_knowledge;
create policy chester_knowledge_admin_all
  on public.chester_knowledge for all
  to authenticated
  using (is_admin()) with check (is_admin());

grant select, insert, update, delete on public.chester_knowledge to authenticated;
revoke all on public.chester_knowledge from anon;

create or replace function public.chester_knowledge_touch()
returns trigger language plpgsql as $$
begin
  new.updated_at := now();
  return new;
end $$;

drop trigger if exists chester_knowledge_touch on public.chester_knowledge;
create trigger chester_knowledge_touch
  before update on public.chester_knowledge
  for each row execute function public.chester_knowledge_touch();

-- ---------------------------------------------------------------------------
-- chester_messages — every exchange, so stewards can see what visitors ask
-- (and add notes for the gaps). Also drives rate limiting: the function counts
-- recent rows per ip_hash before calling the model. Written by the service
-- role; readable by admins.
-- ---------------------------------------------------------------------------
create table if not exists public.chester_messages (
  id          uuid primary key default gen_random_uuid(),
  session_id  text not null,
  ip_hash     text,
  role        text not null check (role in ('user', 'assistant')),
  content     text not null,
  lang        text,
  created_at  timestamptz not null default now()
);

create index if not exists chester_messages_created_idx on public.chester_messages (created_at desc);
create index if not exists chester_messages_ip_idx on public.chester_messages (ip_hash, created_at desc);
create index if not exists chester_messages_session_idx on public.chester_messages (session_id, created_at);

alter table public.chester_messages enable row level security;

drop policy if exists chester_messages_admin_select on public.chester_messages;
create policy chester_messages_admin_select
  on public.chester_messages for select
  to authenticated
  using (is_admin());

grant select on public.chester_messages to authenticated;
revoke all on public.chester_messages from anon;

-- ---------------------------------------------------------------------------
-- Seed notes. `on conflict do nothing` so re-running never overwrites edits
-- stewards have made in the panel.
-- ---------------------------------------------------------------------------
insert into public.chester_knowledge (slug, title, sort_order, body) values

('mission', 'Who we are and what we believe', 10, $md$
We are the Central Texas chapter of the Catholic Land Movement (CLM). Ordinary Catholic households, becoming producers — together, across every parish from Austin to San Antonio.

Many of us yearn for a life rooted in the land — work centered in the home, food raised by neighbors, parishes where real fellowship happens. We miss the simple traditions that make the family what God created it to be: the heart of society.

We exist to help restore the household to what it once was: a place that makes, grows, and gives, rather than one that only consumes. Whether someone is planning a rural resettlement or simply learning to bake sourdough, we are here to connect, teach, and build alongside them.

We are families taking up the first vocation given to man — to till the earth and keep it. Not to flee the world, but to sanctify a small corner of it for Christ. "He is our Creator; we are His gardeners."

The wider Catholic Land Movement (catholiclandmovement.info) has chapters across the United States; ours is one chapter of that movement, not the whole of it.
$md$),

('pillars', 'The four pillars', 20, $md$
The aim of the movement in four pillars. Every chapter activity should serve at least one.

1. RESETTLEMENT — To restore productive property into the hands of households, which roots families as real social units fully integrated in land, work, parish, and community. You do not need many acres to begin: a backyard garden, a parish plot, a flock of hens in the side yard will do. A productive property is whatever land you can put to fruitful use.

2. EDUCATION — To grow peer-to-peer networks of education in productive land and hand crafts. These skills used to pass between neighbors — canning, carpentry, animal husbandry, the care of soil. We learn them back from one another, in workshops and in kitchens, and pass them on.

3. FELLOWSHIP — Cultivating a network of practical, intellectual, and spiritual support within the chapter. When the call goes out to raise the barn, we go out to raise the barn. Mutual aid days, shared harvests, lending a hand and lending a tool.

4. GLORIFICATION — All Catholic Land Movement activity aligns with Gospel teaching. Prayer, spiritual life, sacramental life, and liturgical life are integrated into our work. Christ placed a meal at the center of His Church; the seed, the soil, the harvest, the table — all of it is ordered toward worship. Our labor is an offering.

Pope Pius XII: "Only the stability which is rooted in one's own holding makes of the family the most perfect cell of society."
$md$),

('participate', 'How to take part', 30, $md$
Three movements, in order. Only the first asks anything of you today.

1. COME AND SEE. Start with a gathering. Meet the chapter, share a meal, see what we're about. You don't need to know anything about homesteading or Catholic Social Teaching to join — just come with an open mind. We meet roughly once a month at a member's home or parish hall in Central Texas. Families come, kids are welcome. We open with prayer, eat, and learn something together.

2. LEARN AND OFFER. Bring the skills you already have — carpentry, gardening, baking, fixing things — and tell us about the ones you want to learn. Members keep a profile on the chapter website (sign in with Google or an email link) so neighbors can find each other by parish and craft. Approved members can RSVP to gatherings and host their own; a steward approves new profiles and new gatherings.

3. LIVE AND SHARE. Take what you've learned home to your family and parish. The chapter is not the goal — building strong Catholic households is the goal. What you learn here is meant to leave with you.

Practical pointers for visitors:
- Upcoming gatherings: the Workshops page (/workshops or /talleres). Signed-out visitors see the day, parish area and host; exact time and address are shown to signed-in approved members.
- To join: click "Join the chapter" on the home page or "Sign in" in the header. New profiles wait for a steward's approval (usually a few days).
- To reach the chapter: the "Reach us" contact form in the footer, or write to clmcentraltexas@gmail.com.
- Members also talk between gatherings on the chapter Discord (the invite comes with the approval email).
$md$),

('leadership', 'Leadership and contacts', 40, $md$
[STEWARDS: replace this note with the chapter's real leadership — names, roles, parishes, and how to reach each person. Until then Chester will only say the chapter is steward-led and point people to the contact form.]

The chapter is led by volunteer stewards ("mayordomos") who approve new members and gatherings, host the monthly meeting, and keep the chapter tied to its parishes. Each parish with members may also have a point of contact (POC) shown on the map on the home page.
$md$),

('patron', 'Our patron', 50, $md$
Our patron is San Isidro Labrador (St. Isidore the Farmer, c. 1070–1130), a Madrid farm laborer whose feast is May 15. The story goes that angels plowed his fields while he prayed at Mass; he and his wife, Santa María de la Cabeza, shared what little they had with the poor. The chapter asks his prayers in our walk with Christ — see the Patron page (/patron or /santo), which shows a 19th-century Mexican retablo of the saint.
$md$),

('resources', 'Reading list and sources', 60, $md$
Books the chapter keeps recommending:
- Flee to the Fields (essays of the English Catholic land associations that started the movement; the founding anthology)
- Fr. Vincent McNabb OP, The Church and the Land
- Hilaire Belloc, An Essay on the Restoration of Property
- G. K. Chesterton, The Outline of Sanity — the most readable door into distributism
- Jason Craig, The Liturgy of the Land
- Shawn and Beth Dougherty, The Independent Farmstead (practical pasture, water, livestock)

Church documents the pillars come from:
- Leo XIII, Rerum Novarum (1891) — "the source code"; workers, wages, property, family
- Pius XI, Quadragesimo Anno (1931) — subsidiarity, deepens the property argument
- Pius XII, address to farmers on the dignity of rural life and the family on the land
- Francis, Laudato Si' (2015) — care for creation as a moral and spiritual duty

Writers and talks: chapter member Sid Arias (sidarias.substack.com); the Texas CLM Substack (substack.com/@texasclm); the "Flee to the Fields" and "What's New with the Catholic Land Movement" talks on YouTube; the Catholic Frequency podcast episode on the CLM.

All of this is linked from the Resources page (/resources or /recursos).
$md$),

('distributism', 'Distributism, in the chapter''s words', 70, $md$
Distributism is the social philosophy the Catholic Land Movement grew out of, developed by Chesterton and Belloc from the teaching of Rerum Novarum. Its heart: productive property — land, tools, workshops, the means of making a living — should be as widely owned as possible, by families and small associations, rather than concentrated in a few hands, whether those hands are corporate (capitalism at its worst) or the state's (socialism).

Why it matters to us:
- Ownership of productive property is what gives a family real freedom and stability. A household that grows, makes, and repairs is less at the mercy of wages and markets.
- Small is the natural scale of human life. Belloc's "servile state" is what happens when most people own nothing and depend on employers or the state for everything.
- Subsidiarity (Quadragesimo Anno §79): what a family or local community can do for itself should not be taken over by a larger body. The chapter is an exercise in this — neighbors teaching neighbors.
- It is not nostalgia and not a political party. It is a way of ordering a household and a parish so that the family is again the productive, generous "cell of society."

How the chapter lives it: backyard hens, a parish garden plot, learning to can and bake and build, sharing tools and labor, and — for those called to it — rural resettlement. Start small; a productive property is whatever land you can put to fruitful use.

When someone asks a hard question (e.g. "isn't this just anti-capitalism?", "do I have to move to a farm?"), answer honestly and generously: distributism critiques concentration of ownership in both capitalism and socialism; nobody has to move to a farm; the point is households becoming producers wherever they are.
$md$),

('cst', 'Catholic Social Teaching sources', 80, $md$
When drawing on these, cite the document and paragraph number so people can read the original. Quote briefly; the vatican.va texts are the reference.

RERUM NOVARUM (Leo XIII, 1891) — "On the Condition of Labor." The founding document of modern Catholic Social Teaching.
- Private property is a natural right, and ownership of land in particular roots a man and his family (§§5–11, 47). "The law, therefore, should favor ownership, and its policy should be to induce as many as possible of the people to become owners" (§46).
- Socialism's abolition of property is rejected because it harms the very workers it claims to help and dissolves the family (§§4, 12–15).
- The family precedes the state; the state must not absorb it (§§12–14).
- A just wage must be enough to support a frugal, well-conducted worker and his family; from it he should be able to save and acquire property (§§44–46).
- Workers' associations and mutual aid are praised (§§48–61).
- Religion and the Church are essential to the social question; charity is the "mistress and queen of virtues" (§§16–29, 63).

QUADRAGESIMO ANNO (Pius XI, 1931) — "On the Reconstruction of the Social Order," forty years after Rerum Novarum.
- Names the principle of subsidiarity (§79): it is an injustice for a larger body to take over what smaller communities can do themselves.
- Property has both an individual and a social character (§§45–49); the redistribution of ownership, not merely of wages, is the goal (§§59–63).
- Warns against the concentration of economic power (§§105–109).

PIUS XII — addresses to rural people (e.g. to Italian farmers, 1946): the dignity of agricultural life; the family on its own land as "the most perfect cell of society."

MATER ET MAGISTRA (John XXIII, 1961) — a long section on agriculture (§§123–149): the depressed rural sector, the family farm as the ideal, and the farmer's vocation.

LABOREM EXERCENS (John Paul II, 1981) — work as participation in the Creator's activity; the priority of labor over capital (§§12–15); the "indirect employer."

CENTESIMUS ANNUS (John Paul II, 1991) — the centenary of Rerum Novarum; the family as the "sanctuary of life"; critique of consumerism (§§36–39).

LAUDATO SI' (Francis, 2015) — care for our common home; "everything is connected"; small-scale and family agriculture (§§129, 134); the "ecological conversion" of daily habits (§§216–221).

FRATELLI TUTTI (Francis, 2020) — property is never absolute; the "universal destination of goods" (§§118–120).

Older Catholic Land Movement writing (1930s England): Fr. Vincent McNabb OP, Fr. John McQuillan, the "Flee to the Fields" essays — the land as the Church's natural home, and the family holding as the answer to industrial dependence.
$md$),

('vision', 'The chapter beyond the workshops', 90, $md$
The workshops are how most people meet us, but they are not the whole vision.

- A chapter is a network of households, not an events calendar. The goal is that within a few years every member family is producing something real — food, craft, hospitality — and has neighbors it can call on.
- Parish by parish. We want each parish between Austin and San Antonio to have a few CLM households and a point of contact, so a family that wants to start can find help ten minutes away rather than an hour.
- Mutual aid as a habit: barn-raising days, shared harvests, tool lending, meals for new mothers and the sick. Fellowship that costs something.
- The liturgical year as the calendar. Rogation days, Ember days, blessings of seeds and fields, the feast of San Isidro in May, a harvest thanksgiving in the fall. The rhythm of the land and the rhythm of the Church are meant to be one.
- The Witness page (/witness or /testimonio) records the year as it happens: what was made, taught, grown, and who learned it from whom. Skill replication — one family teaching another who then teaches a third — is the single most important thing a chapter can record.
- For those called further: rural resettlement, a productive homestead, perhaps one day land held in common by several families near a parish. Nobody is required to go that far; everyone is invited to begin where they are.
$md$)

on conflict (slug) do nothing;

-- The Edge Function reads/writes both tables with the service role. Tables
-- created through `supabase db query` are owned by the CLI login role, so the
-- usual default grant to service_role is not applied automatically.
grant all on public.chester_knowledge to service_role;
grant all on public.chester_messages  to service_role;
