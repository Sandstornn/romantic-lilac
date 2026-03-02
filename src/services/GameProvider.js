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

  // src/services/GameProvider.js

async fetchGameById(gameId) {
  if (!gameId) return null;

  const { data: existingReview, error: dbError } = await supabase
    .from('reviews')
    .select('*')
    .eq('content_id', String(gameId))
    .eq('media_type', 'game')
    .not('metadata', 'is', null)
    .limit(1)
    .maybeSingle();

  if (!dbError && existingReview) {
    console.log("🚀 유효한 캐시 발견!");
    const m = existingReview.metadata;
    return {
      id: gameId,
      title: existingReview.title,
      subTitle: m.release_year,
      image: m.poster_path,
      description: m.summary || m.overview || "",
      rating: String(existingReview.rating || "0.0"),
      overview: m.summary || m.overview || ""
    };
  }

  // 캐시가 없거나 제목이 없는 부실한 캐시라면 API 호출!
  const { data: apiData } = await supabase.functions.invoke('rapid-worker', {
    body: { type: 'detail', id: String(gameId) }
  });

  return apiData;
}
}