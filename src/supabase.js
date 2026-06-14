import { createClient } from '@supabase/supabase-js';

// We add https:// and .supabase.co around your Project ID
const supabaseUrl = 'https://geyuwjvyxzhgptrwixvc.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdleXV3anZ5eHpoZ3B0cndpeHZjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzgzOTgwMzcsImV4cCI6MjA5Mzk3NDAzN30.Qzi-X4ahlzZNdqp9qlkXU50oZ5AiMNRe144qbgZZOSs';

export const supabase = createClient(supabaseUrl, supabaseKey);