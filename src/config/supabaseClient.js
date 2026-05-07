import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://wsynwtpmbagonchbpqvn.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndzeW53dHBtYmFnb25jaGJwcXZuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzYxODM1ODQsImV4cCI6MjA5MTc1OTU4NH0.4jFRUa3kyh98bwcL7vFyj3wAdJXUjXdkxSS6fwZzzy8'

const supabase = createClient(supabaseUrl, supabaseAnonKey)

export default supabase