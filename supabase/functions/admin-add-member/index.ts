// supabase/functions/admin-add-member/index.ts
//
// Lets a steward/admin add a member by hand: display name, email, parish.
// Creates the auth.users row (which a plain client insert can't do, because
// public.profiles.id references auth.users(id)), then writes a minimal profile
// stub via the admin_add_member SECURITY DEFINER RPC. If a new parish is given,
// the RPC creates it and links the member — so the parish immediately has a
// member and appears in "Parishes and contacts" (member_count > 0) with a
// "no location" badge until coordinates are entered by hand.
//
// The member fills in bio / crafts / working_on / wants_to_learn the first time
// they sign in with the same email.
//
// Access model (mirrors the rest of this project, which uses SECURITY DEFINER
// RPCs rather than direct service-role table access):
//   - Admin gate:  read caller's own profiles.is_admin with the CALLER's token.
//   - Create user: GoTrue admin API with the secret key (ADMIN_SERVICE_KEY).
//   - DB writes:   admin_add_member() RPC, called as the caller so auth.uid()
//                  re-checks admin inside the definer function.
//
// verify_jwt is OFF (config.toml) so the CORS preflight isn't rejected.

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.0';

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
const ANON_KEY     = Deno.env.get('SUPABASE_ANON_KEY')!;
const ADMIN_KEY    = Deno.env.get('ADMIN_SERVICE_KEY') ?? Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';

// Service client: used ONLY for the GoTrue admin API (createUser / listUsers).
const admin = createClient(SUPABASE_URL, ADMIN_KEY, {
  auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
  global: { headers: { apikey: ADMIN_KEY, Authorization: `Bearer ${ADMIN_KEY}` } },
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
  new_parish?: { name: string; city?: string | null } | null;
  language?: Lang | null;
};

function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), { status, headers: JSON_HEADERS });
}

async function findUserByEmail(email: string): Promise<{ id: string } | null> {
  const target = email.toLowerCase();
  for (let page = 1; page <= 20; page++) {
    const { data, error } = await admin.auth.admin.listUsers({ page, perPage: 200 });
    if (error) throw error;
    const hit = data.users.find((u) => (u.email ?? '').toLowerCase() === target);
    if (hit) return { id: hit.id };
    if (data.users.length < 200) break;
  }
  return null;
}

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: CORS_HEADERS });
  if (req.method !== 'POST') return new Response('Method not allowed', { status: 405, headers: CORS_HEADERS });

  if (!ADMIN_KEY) {
    return json({ error: 'config', detail: 'No privileged key in this function. Set an ADMIN_SERVICE_KEY secret.' }, 500);
  }

  // --- Resolve the caller from their JWT -----------------------------------
  const authHeader = req.headers.get('Authorization') ?? '';
  if (!authHeader) return json({ error: 'unauthorized', detail: 'no Authorization header reached the function' }, 401);

  const userClient = createClient(SUPABASE_URL, ANON_KEY, {
    auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
    global: { headers: { Authorization: authHeader } },
  });

  const { data: userData, error: userErr } = await userClient.auth.getUser();
  if (userErr || !userData?.user) {
    return json({ error: 'unauthorized', detail: `could not resolve caller: ${userErr?.message ?? 'no user in token'}` }, 401);
  }
  const callerId = userData.user.id;

  // --- Admin gate: read caller's own profile with the CALLER's token --------
  const { data: callerProfile, error: profErr } = await userClient
    .from('profiles')
    .select('is_admin')
    .eq('id', callerId)
    .maybeSingle();

  if (profErr)                 return json({ error: 'forbidden', detail: `profile lookup failed: ${profErr.message}` }, 403);
  if (!callerProfile)          return json({ error: 'forbidden', detail: `no profile row for caller ${callerId}` }, 403);
  if (!callerProfile.is_admin) return json({ error: 'forbidden', detail: `caller ${callerId} is not an admin` }, 403);

  // --- Parse + validate input ---------------------------------------------
  let body: Body;
  try {
    body = await req.json();
  } catch {
    return json({ error: 'bad_request', detail: 'body was not valid JSON' }, 400);
  }

  const email = (body.email ?? '').trim().toLowerCase();
  const displayName = (body.display_name ?? '').trim();
  const language: Lang | null = body.language === 'es' ? 'es' : body.language === 'en' ? 'en' : null;

  if (!EMAIL_RE.test(email))    return json({ error: 'invalid_email', detail: email }, 422);
  if (displayName.length < 2)   return json({ error: 'invalid_name', detail: displayName }, 422);

  // --- Create (or find) the auth user (admin API — needs the secret key) ----
  let userId: string;
  let createdAuthUser = false;

  const { data: created, error: createErr } = await admin.auth.admin.createUser({
    email,
    email_confirm: true,
  });

  if (createErr) {
    const existing = await findUserByEmail(email).catch(() => null);
    if (!existing) return json({ error: 'auth_create_failed', detail: createErr.message }, 500);
    userId = existing.id;
  } else {
    userId = created.user.id;
    createdAuthUser = true;
  }

  // --- Parish + profile writes via SECURITY DEFINER RPC (as the caller) -----
  const { data: rpcParishId, error: rpcErr } = await userClient.rpc('admin_add_member', {
    p_user_id: userId,
    p_display_name: displayName,
    p_parish_id: body.parish_id ?? null,
    p_new_parish_name: body.new_parish?.name ?? null,
    p_new_parish_city: body.new_parish?.city ?? null,
    p_language: language,
  });

  if (rpcErr) {
    return json({ error: 'profile_write_failed', detail: rpcErr.message }, 500);
  }

  return json({ ok: true, profile_id: userId, created_auth_user: createdAuthUser, parish_id: (rpcParishId as string | null) ?? null });
});