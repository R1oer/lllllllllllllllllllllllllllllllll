import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://euoygdszkdcbntkazgpp.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV1b3lnZHN6a2RjYm50a2F6Z3BwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDY5ODM3NzIsImV4cCI6MjA2MjU1OTc3Mn0.zzHpvW7RiTN_XTAtH3GTKm_2WUvUoncpCkEozTiSxw0';

export const supabase = createClient(supabaseUrl, supabaseKey); 