
import { createClient } from '@supabase/supabase-js';

/**
 * PRODUCTION SETUP FOR NETLIFY:
 * 1. Go to Netlify Dashboard > Site Settings > Environment Variables.
 * 2. Add: VITE_SUPABASE_URL
 * 3. Add: VITE_SUPABASE_ANON_KEY
 */

// Safety check for browser environment
const getEnv = (key: string): string => {
  if (typeof process !== 'undefined' && process.env && process.env[key]) {
    return process.env[key] as string;
  }
  // Use a type assertion to any to access 'env' on import.meta which might not be in standard types
  const meta = import.meta as any;
  if (typeof meta !== 'undefined' && meta.env && meta.env[key]) {
    return meta.env[key] as string;
  }
  return '';
};

const supabaseUrl = getEnv('VITE_SUPABASE_URL') || 'https://placeholder-project-url.supabase.co';
const supabaseAnonKey = getEnv('VITE_SUPABASE_ANON_KEY') || 'placeholder-anon-key';

// Validate that the keys are actual Supabase keys and not the placeholders
const isConfigured = 
  supabaseUrl !== 'https://placeholder-project-url.supabase.co' && 
  supabaseAnonKey !== 'placeholder-anon-key' &&
  supabaseUrl.startsWith('http');

export const supabase = isConfigured 
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

export const isSupabaseConfigured = isConfigured;
