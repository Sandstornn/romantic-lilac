import { createClient } from '@supabase/supabase-js'

// .env에서 설정값을 가져옵니다.
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

// 프로젝트 어디서든 쓸 수 있게 클라이언트를 내보냅니다.
export const supabase = createClient(supabaseUrl, supabaseAnonKey)