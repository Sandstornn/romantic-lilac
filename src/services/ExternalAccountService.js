// src/services/ExternalAccountService.js
import { supabase } from './supabaseClient';

class ExternalAccountService {
  /**
   * 구글 소셜 로그인 실행
   */
  async signInWithGoogle() {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: window.location.origin
      }
    });
    if (error) throw error;
  }

  /**
   * 로그아웃
   */
  async signOut() {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  }

  /**
   * 현재 로그인된 사용자 정보 확인
   */
  async getUser() {
    const { data: { session }, error } = await supabase.auth.getSession();
    if (error) return null;
    return session?.user ?? null;
  }

  /**
   * 인증 상태 변화 감시 (로그인/로그아웃 이벤트 구독)
   */
  subscribeAuth(callback) {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      callback(session?.user ?? null);
    });
    return subscription;
  }
}

export default new ExternalAccountService();