import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://wyrcboihawpieobobjco.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Ind5cmNib2loYXdwaWVvYm9iamNvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjU3MjQ5MzUsImV4cCI6MjA4MTMwMDkzNX0.WwCLq6G5UYf6yR2i9yhRkzgj-cZqx626adyZreFYucw';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);