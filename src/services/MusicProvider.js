// src/services/MusicProvider.js

class MusicProvider {
  constructor(supabaseUrl, anonKey) {
    // 1. URL이 없으면 에러를 던져서 디버깅을 쉽게 만듭니다.
    if (!supabaseUrl) console.error("Supabase URL이 누락되었습니다!");
    
    this.endpoint = `${supabaseUrl}/functions/v1/rapid-worker`;
    this.anonKey = anonKey; // Anon Key도 생성자에서 받도록 추가
  }

  /**
   * 음악 검색
   */
  async search(query, page = 1) {
    try {
      const response = await fetch(this.endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.anonKey}` // 인증 헤더 추가
        },
        body: JSON.stringify({
          category: 'music',
          type: 'search',
          query: query,
          page: page
        })
      });

      if (!response.ok) throw new Error('음악 검색에 실패했습니다.');
      return await response.json();
    } catch (error) {
      console.error("Music Search Error:", error);
      return [];
    }
  }

  /**
   * 음악 상세 정보 가져오기
   */
  async fetchMusicById(id) {
    // 2. id가 넘어오지 않았을 때 예외 처리 (매우 중요)
    if (!id) {
      console.error("fetchMusicById: id가 없습니다!");
      return null;
    }

    try {
      // ❌ 잘못된 부분: FUNCTION_URL -> ✅ 수정: this.endpoint
      // 외부 변수가 아니라 생성자에서 설정한 주소를 써야 합니다.
      const response = await fetch(this.endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.anonKey}` // ✅ 수정: this.anonKey 사용
        },
        body: JSON.stringify({
          category: 'music',
          type: 'detail',
          id: id 
        })
      });

      if (!response.ok) throw new Error("음악 상세 정보를 가져오지 못했습니다.");
      return await response.json();
    } catch (error) {
      console.error("Music Detail Error:", error);
      throw error;
    }
  }
}

export default MusicProvider;