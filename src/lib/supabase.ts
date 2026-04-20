// src/lib/supabase.ts
// Supabase client singleton. Import this anywhere you need to talk to the database.
//
// Uses publishable (formerly "anon") key — safe to expose in the frontend bundle.
// Row-Level Security policies enforce who can read/write what.

import { createClient } from '@supabase/supabase-js';
import type { Database } from './database.types';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_KEY = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

if (!SUPABASE_URL || !SUPABASE_KEY) {
  throw new Error(
    'Missing Supabase env vars. Add VITE_SUPABASE_URL and VITE_SUPABASE_PUBLISHABLE_KEY to .env.local'
  );
}

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_KEY, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true, // handles OAuth redirect callback
  },
});
