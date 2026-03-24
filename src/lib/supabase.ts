import { createClient } from '@supabase/supabase-js';

// Garantindo que as variáveis de ambiente existam para o TypeScript não reclamar
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  throw new Error("Faltam as variáveis de ambiente do Supabase (URL ou ANON_KEY). Verifique seu arquivo .env.local.");
}

// Instância única do Supabase para toda a aplicação
export const supabase = createClient(supabaseUrl, supabaseKey);