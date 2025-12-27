import { createClient } from '@supabase/supabase-js';

/**
 * PRODUCTION SETUP FOR NETLIFY:
 * 1. Go to Netlify Dashboard > Site Settings > Environment Variables.
 * 2. Add: VITE_SUPABASE_URL
 * 3. Add: VITE_SUPABASE_ANON_KEY
 */

// Helper to safely get environment variables in a Vite context
const getEnvVar = (key: string): string | undefined => {
  try {
    // Vite's environment variables are available on import.meta.env
    // We use a type cast to 'any' to avoid TS errors during the build-up phase
    const env = (import.meta as any).env;
    return env ? env[key] : undefined;
  } catch (e) {
    console.warn(`Could not access environment variable: ${key}`);
    return undefined;
  }
};

const supabaseUrl = getEnvVar('VITE_SUPABASE_URL') || 'https://placeholder-project-url.supabase.co';
const supabaseAnonKey = getEnvVar('VITE_SUPABASE_ANON_KEY') || 'placeholder-anon-key';

// Validate that the keys are actual Supabase keys and not placeholders
const isConfigured = 
  supabaseUrl !== 'https://placeholder-project-url.supabase.co' && 
  supabaseAnonKey !== 'placeholder-anon-key' &&
  supabaseUrl.startsWith('http');

export const supabase = isConfigured 
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

export const isSupabaseConfigured = isConfigured;
