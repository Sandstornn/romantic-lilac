// src/services/GameProvider.js
import { supabase } from './supabaseClient';

export default class GameProvider {
  async search(query, page = 1) {
    if (!query) return [];

    const { data, error } = await supabase.functions.invoke('rapid-worker', {
      body: { type: 'search', query, page }
    });



    // 서버가 혹시라도 이상한걸 줬을 때를 대비해 한 번 더 배열 확인
    if (error || !Array.isArray(data)) {
      console.error("데이터 로드 실패:", error);
      return [];
    }
    return data;
  }

  // 게임 상세 정보 가져오기 메서드 추가
  async fetchGameById(gameId) {
    if (!gameId) return null;

    // Edge Function 호출 시 body에 'id'라는 이름으로 넘겨줍니다 (Edge Function의 const { id } 와 매칭)
    const { data, error } = await supabase.functions.invoke('rapid-worker', {
      body: { 
        type: 'detail', 
        id: String(gameId) 
      }
    });

    if (error || !data) {
      console.error("게임 정보 로드 실패:", error);
      return null;
    }

    return data; // Edge Function에서 이미 가공(mapping)해서 보내주므로 바로 반환
  }
}