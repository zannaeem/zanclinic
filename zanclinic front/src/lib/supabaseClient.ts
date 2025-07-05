import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://fsubfiwlvogrrjouvoel.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZzdWJmaXdsdm9ncnJqb3V2b2VsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDYwOTI2NjcsImV4cCI6MjA2MTY2ODY2N30.292RlmCKCF6ow3bsvq5GrFIWKwKaB00mZAznN-WeugI';

export const supabase = createClient(supabaseUrl, supabaseAnonKey); 