
import { createClient } from '@supabase/supabase-js';
import type { Database } from '../types/supabase';

const supabaseUrl = 'https://nxhjvziraymcmrvudlnm.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im54aGp2emlyYXltY21ydnVkbG5tIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDQ3NDIzMzksImV4cCI6MjA2MDMxODMzOX0.IE97E8fQH1KrKBMiNpfabqiTAhGJ2UlszSbE71OSsNo';

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey);