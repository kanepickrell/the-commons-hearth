// supabase/functions/geocode-parish/index.ts
//
// Geocodes a parish using OpenStreetMap's Nominatim service (free, no API key).
// Called by the admin from the Mayordomo page when they see parishes with
// missing coordinates.
//
// Deploy: supabase functions deploy geocode-parish --no-verify-jwt

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.0';

const SUPABASE_URL     = Deno.env.get('SUPABASE_URL')!;
const SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

const admin = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
  auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
  global: {
    headers: {
      apikey: SERVICE_ROLE_KEY,
      Authorization: `Bearer ${SERVICE_ROLE_KEY}`,
    },
  },
});

// CORS headers so the function can be called directly from the browser by
// the admin panel at /mayordomo.
const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

// Nominatim usage policy: 1 request/sec max, must set a User-Agent.
// See: https://operations.osmfoundation.org/policies/nominatim/
async function geocode(name: string, city: string | null): Promise<{ lat: number; lng: number } | null> {
  const query = [name, city, 'Texas', 'USA'].filter(Boolean).join(', ');
  const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&limit=1`;

  const resp = await fetch(url, {
    headers: {
      'User-Agent': 'CLMCentralTexas/1.0 (clmcentraltexas@gmail.com)',
      'Accept': 'application/json',
    },
  });

  if (!resp.ok) {
    console.error('Nominatim error:', resp.status, await resp.text());
    return null;
  }

  const data = await resp.json() as Array<{ lat: string; lon: string }>;
  if (!data.length) return null;

  return {
    lat: parseFloat(data[0].lat),
    lng: parseFloat(data[0].lon),
  };
}

Deno.serve(async (req: Request) => {
  // Browser preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: CORS_HEADERS });
  }

  if (req.method !== 'POST') {
    return new Response('Method not allowed', { status: 405, headers: CORS_HEADERS });
  }

  let parishId: string;
  try {
    const body = await req.json();
    parishId = body.parish_id;
    if (!parishId) throw new Error('missing parish_id');
  } catch {
    return new Response('Bad request', { status: 400, headers: CORS_HEADERS });
  }

  // Fetch the parish name + city
  const { data: parish, error: parishErr } = await admin
    .rpc('parish_by_id', { p_id: parishId });

  if (parishErr || !parish) {
    return new Response(
      JSON.stringify({ error: 'parish not found', detail: parishErr }),
      { status: 404, headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' } },
    );
  }

  const coords = await geocode(parish.name, parish.city);
  if (!coords) {
    return new Response(
      JSON.stringify({ error: 'geocoding_failed', query: `${parish.name}, ${parish.city}, Texas` }),
      { status: 502, headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' } },
    );
  }

  // Write the coords
  const { error: updateErr } = await admin.rpc('set_parish_coords', {
    p_parish_id: parishId,
    p_lat: coords.lat,
    p_lng: coords.lng,
  });

  if (updateErr) {
    return new Response(
      JSON.stringify({ error: 'update_failed', detail: updateErr }),
      { status: 500, headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' } },
    );
  }

  return new Response(
    JSON.stringify({ ok: true, lat: coords.lat, lng: coords.lng }),
    { status: 200, headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' } },
  );
});