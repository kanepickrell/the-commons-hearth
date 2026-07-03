// supabase/functions/admin-add-member/index.ts
//
// Lets a steward/admin add a member by hand: display name, email, parish.
// Creates the auth.users row (which a plain client insert can't do, because
// public.profiles.id references auth.users(id)), then writes a minimal profile
// stub with status 'approved'. The member fills in bio / crafts / working_on /
// wants_to_learn themselves the first time they sign in with the same email —
// Bienvenido re-runs onboarding whenever `bio` is null and pre-fills the name
// and parish we set here.
//
// Called from the Mayordomo AddMemberPanel via supabase.functions.invoke().
// verify_jwt is OFF (config.toml) — matching the other browser-facing functions
// so the CORS preflight isn't rejected — but we enforce admin-only access here
// by validating the caller's JWT and checking profiles.is_admin.

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.0';

const SUPABASE_URL     = Deno.env.get('SUPABASE_URL')!;
const SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

const admin = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
  auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
  global: { headers: { apikey: SERVICE_ROLE_KEY, Authorization: `Bearer ${SERVICE_ROLE_KEY}` } },
});

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};
const JSON_HEADERS = { ...CORS_HEADERS, 'Content-Type': 'application/json' };

const EMAIL_RE = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;

type Lang = 'en' | 'es';

type Body = {
  display_name?: string;
  email?: string;
  parish_id?: string | null;
  // Optional: create a brand-new parish inline (coords added later in the
  // Parishes & contacts panel). Ignored when parish_id is provided.
  new_parish?: { name: string; city?: string | null } | null;
  language?: Lang | null;
};

function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), { status, headers: JSON_HEADERS });
}

/** Look up an auth user by email across paginated results. */
async function findUserByEmail(email: string): Promise<{ id: string } | null> {
  const target = email.toLowerCase();
  for (let page = 1; page <= 20; page++) {
    const { data, error } = await admin.auth.admin.listUsers({ page, perPage: 200 });
    if (error) throw error;
    const hit = data.users.find((u) => (u.email ?? '').toLowerCase() === target);
    if (hit) return { id: hit.id };
    if (data.users.length < 200) break; // last page
  }
  return null;
}

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: CORS_HEADERS });
  if (req.method !== 'POST') return new Response('Method not allowed', { status: 405, headers: CORS_HEADERS });

  // --- Authenticate the caller and require admin ---------------------------
  const authHeader = req.headers.get('Authorization') ?? '';
  const token = authHeader.replace(/^Bearer\s+/i, '').trim();
  if (!token) return json({ error: 'unauthorized' }, 401);

  const { data: caller, error: callerErr } = await admin.auth.getUser(token);
  if (callerErr || !caller?.user) return json({ error: 'unauthorized' }, 401);

  const { data: callerProfile } = await admin
    .from('profiles')
    .select('is_admin')
    .eq('id', caller.user.id)
    .maybeSingle();

  if (!callerProfile?.is_admin) return json({ error: 'forbidden' }, 403);

  // --- Parse + validate input ---------------------------------------------
  let body: Body;
  try {
    body = await req.json();
  } catch {
    return json({ error: 'bad_request' }, 400);
  }

  const email = (body.email ?? '').trim().toLowerCase();
  const displayName = (body.display_name ?? '').trim();
  const language: Lang | null = body.language === 'es' ? 'es' : body.language === 'en' ? 'en' : null;

  if (!EMAIL_RE.test(email)) return json({ error: 'invalid_email' }, 422);
  if (displayName.length < 2) return json({ error: 'invalid_name' }, 422);

  // --- Resolve parish (existing id, or create a new one) -------------------
  let parishId: string | null = body.parish_id ?? null;
  if (!parishId && body.new_parish?.name?.trim()) {
    const { data: newParish, error: parishErr } = await admin
      .from('parishes')
      .insert({ name: body.new_parish.name.trim(), city: body.new_parish.city?.trim() || null })
      .select('id')
      .single();
    if (parishErr) return json({ error: 'parish_create_failed', detail: parishErr.message }, 500);
    parishId = newParish.id;
  }

  // --- Create (or find) the auth user --------------------------------------
  let userId: string;
  let createdAuthUser = false;

  const { data: created, error: createErr } = await admin.auth.admin.createUser({
    email,
    email_confirm: true, // no confirmation email; they sign in later via magic link / Google
  });

  if (createErr) {
    // Most likely the email is already registered — fall back to a lookup so
    // the operation is idempotent (adding an existing person just updates them).
    const existing = await findUserByEmail(email).catch(() => null);
    if (!existing) {
      return json({ error: 'auth_create_failed', detail: createErr.message }, 500);
    }
    userId = existing.id;
  } else {
    userId = created.user.id;
    createdAuthUser = true;
  }

  // --- Upsert the profile stub ---------------------------------------------
  // A handle_new_user trigger may already have inserted a 'pending' row; if so
  // we only fill blanks and promote pending -> approved, never clobbering data
  // an existing member has already entered.
  const { data: existingProfile } = await admin
    .from('profiles')
    .select('display_name, parish_id, bio_language, status')
    .eq('id', userId)
    .maybeSingle();

  try {
    if (!existingProfile) {
      const { error } = await admin.from('profiles').insert({
        id: userId,
        display_name: displayName,
        parish_id: parishId,
        bio_language: language,
        status: 'approved',
      });
      if (error) throw error;
    } else {
      const patch: Record<string, unknown> = {};
      if (!existingProfile.display_name && displayName) patch.display_name = displayName;
      if (!existingProfile.parish_id && parishId) patch.parish_id = parishId;
      if (!existingProfile.bio_language && language) patch.bio_language = language;
      if (existingProfile.status === 'pending') patch.status = 'approved';

      if (Object.keys(patch).length > 0) {
        const { error } = await admin.from('profiles').update(patch).eq('id', userId);
        if (error) throw error;
      }
    }
  } catch (e) {
    const detail = e instanceof Error ? e.message : String(e);
    return json({ error: 'profile_write_failed', detail }, 500);
  }

  return json({
    ok: true,
    profile_id: userId,
    created_auth_user: createdAuthUser, // false => this email already had an account
    parish_id: parishId,
  });
});