// src/services/AnimationProvider.js
import { supabase } from './supabaseClient';

export default class AnimationProvider {
  constructor(apiKey) {
    this.apiKey = apiKey;
    this.baseUrl = 'https://api.themoviedb.org/3';
  }

  // 💡 검색 로직: 검색 결과 중 '애니메이션' 장르인 영화만 필터링
  async search(query, page = 1) {
    if (!query) return [];


    const url = `${this.baseUrl}/search/multi?api_key=${this.apiKey}&query=${encodeURIComponent(query)}&page=${page}&language=ko-KR`;
    const response = await fetch(url);
    const data = await response.json();

    return (data.results || [])
      .filter(movie => movie.genre_ids?.includes(16)) // 💡 장르 ID 16번(애니메이션)만 추출
      .map(ani => ({
        id: ani.id,
        // 영화는 title, TV는 name
        title: ani.title || ani.name,
        subTitle: (ani.release_date || ani.first_air_date)?.split('-')[0] || '정보 없음',
        image: ani.poster_path 
          ? `https://image.tmdb.org/t/p/w500${ani.poster_path}` 
          : 'https://placehold.co/500x750?text=No+Image',
        description: ani.overview || "",
        rating: ani.vote_average ? ani.vote_average.toFixed(1) : "0.0",
        overview: ani.overview || ""
      }));
  }

  // 💡 상세 로직: 캐싱(DB) 확인 후 없으면 API 호출
  async fetchAnimeById(aniId) {
    if (!aniId) return null;

    // 1. DB 캐시 확인
    const { data: existingReview, error: dbError } = await supabase
      .from('reviews')
      .select('*')
      .eq('content_id', String(aniId))
      .eq('media_type', 'animation')
      .limit(1)
      .maybeSingle();

    if (!dbError && existingReview && existingReview.title) {
      console.log("🚀 애니메이션 캐시 발견:", existingReview.title);
      const m = existingReview.metadata || {};
      return {
        id: aniId,
        title: existingReview.title,
        subTitle: m.release_year || "정보 없음",
        image: m.poster_path || m.image,
        description: m.summary || m.overview || "",
        rating: String(existingReview.rating || "0.0"),
        overview: m.summary || m.overview || ""
      };
    }

    // 2. 캐시 없으면 API 호출 (영화 시도 -> 실패하거나 애니 아니면 -> TV 시도)
try {
  // A. 먼저 영화로 찌르기
  let res = await fetch(`${this.baseUrl}/movie/${aniId}?api_key=${this.apiKey}&language=ko-KR`);
  let data = res.ok ? await res.json() : null;

  // 영화가 아니거나, 장르에 16번(애니)이 없으면 TV로 다시 찌르기
  if (!data || !data.genres?.some(g => g.id === 16)) {
    res = await fetch(`${this.baseUrl}/tv/${aniId}?api_key=${this.apiKey}&language=ko-KR`);
    data = res.ok ? await res.json() : null;
    
    // TV 데이터도 없거나 애니가 아니면 종료
    if (!data || !data.genres?.some(g => g.id === 16)) return null;
  }

  // 최종 결과 리턴 (영화/TV 공용 필드 대응)
  return {
    id: data.id,
    title: data.title || data.name,
    subTitle: (data.release_date || data.first_air_date)?.split('-')[0] || '정보 없음',
    image: data.poster_path ? `https://image.tmdb.org/t/p/w500${data.poster_path}` : 'https://placehold.co/500x750?text=No+Image',
    description: data.overview || "",
    rating: data.vote_average ? data.vote_average.toFixed(1) : "0.0",
    overview: data.overview || ""
  };
} catch (error) {
  return null;
}
}
}