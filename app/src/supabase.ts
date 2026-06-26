import { createClient } from '@supabase/supabase-js'

const url = import.meta.env.VITE_SUPABASE_URL as string | undefined
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined

if (!url || !anonKey) {
  // Ajuda a perceber se faltam as variáveis de ambiente (.env / Vercel)
  console.error('Faltam VITE_SUPABASE_URL e/ou VITE_SUPABASE_ANON_KEY. Vê o ficheiro .env.example.')
}

export const supabase = createClient(url ?? '', anonKey ?? '')
