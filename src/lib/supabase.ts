import { createClient } from '@supabase/supabase-js';

const url = process.env.EXPO_PUBLIC_SUPABASE_URL;
// Só a chave publishable (anon). A chave secreta fica apenas no backend.
const key = process.env.EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

// Usado só para o Realtime das vagas; o login é do Clerk, então não há sessão do Supabase.
// Sem as variáveis, fica `null` e o app funciona sem atualização ao vivo.
export const supabase =
  url && key
    ? createClient(url, key, {
        auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
      })
    : null;
