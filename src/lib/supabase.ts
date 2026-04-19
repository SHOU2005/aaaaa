import { createClient } from '@supabase/supabase-js';

// Vite exposes env vars via import.meta.env — needs /// <reference types="vite/client" />
const supabaseUrl     = (import.meta as any).env?.VITE_SUPABASE_URL     ?? '';
const supabaseAnonKey = (import.meta as any).env?.VITE_SUPABASE_ANON_KEY ?? '';

export const supabase = createClient(
  supabaseUrl || 'https://placeholder.supabase.co',
  supabaseAnonKey || 'placeholder-key',
  { auth: { autoRefreshToken: true, persistSession: true, detectSessionInUrl: true } }
);

export const isSupabaseConfigured = () =>
  !!supabaseUrl && supabaseUrl !== '' && !supabaseUrl.includes('placeholder');
