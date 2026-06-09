// ============================================================
// MELATOZ — supabase-config.js
// Cliente Supabase compartido entre script.js y admin.js
// ============================================================

const SUPABASE_URL  = 'https://shrgtqgunsorodmukkhc.supabase.co';
const SUPABASE_ANON = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNocmd0cWd1bnNvcm9kbXVra2hjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODA5NjIxMDYsImV4cCI6MjA5NjUzODEwNn0.mtS4d1pbmbGm3BhRJtSh-zWfoi141RNDvqYz3P_OEy4';

const db = supabase.createClient(SUPABASE_URL, SUPABASE_ANON);
