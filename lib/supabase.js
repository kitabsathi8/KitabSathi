// lib/supabase.js
// ─────────────────────────────────────────────────────────────────
// Creates and exports a single Supabase client used across the app.
// Keys are loaded from .env.local — never hardcode them here.
// ─────────────────────────────────────────────────────────────────

import { createClient } from '@supabase/supabase-js'

const supabaseUrl  = process.env.NEXT_PUBLIC_SUPABASE_URL  || 'https://nvwmrhyykbqentlqzarl.supabase.co'
const supabaseKey  = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im52d21yaHl5a2JxZW50bHF6YXJsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzk2OTc3NzgsImV4cCI6MjA5NTI3Mzc3OH0.bgOdhdn0_YoTBG9-qw11ViNKU6hEBd0zU1CNUR98IJk'

export const supabase = createClient(supabaseUrl, supabaseKey)