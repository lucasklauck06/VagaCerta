const { createClient } = require('@supabase/supabase-js');

const { SUPABASE_URL, SUPABASE_SECRET_KEY } = process.env;

if (!SUPABASE_URL || !SUPABASE_SECRET_KEY) {
    throw new Error('Faltam SUPABASE_URL e/ou SUPABASE_SECRET_KEY no .env');
}

module.exports = createClient(SUPABASE_URL, SUPABASE_SECRET_KEY);