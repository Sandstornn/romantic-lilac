// src/services/MovieProvider.js
import { supabase } from './supabaseClient';

export default class MovieProvider {
  constructor(apiKey) {
    this.apiKey = apiKey;
    this.baseUrl = 'https://api.themoviedb.org/3';
  }

  // 🔍 영화 검색 (리스트용)
  async search(query, page = 1) {
    if (!query) return [];

    const url = `${this.baseUrl}/search/movie?api_key=${this.apiKey}&query=${encodeURIComponent(query)}&page=${page}&language=ko-KR`;
    const response = await fetch(url);
    const data = await response.json();

    return (data.results || []).map(movie => ({
      id: movie.id,
      title: movie.title,
      // 개봉 연도만 추출
      subTitle: movie.release_date ? movie.release_date.split('-')[0] : '정보 없음',
      image: movie.poster_path 
        ? `https://image.tmdb.org/t/p/w500${movie.poster_path}` 
        : 'https://placehold.co/500x750?text=No+Image',
      description: movie.overview || "설명이 등록되어 있지 않습니다.",
      rating: movie.vote_average ? movie.vote_average.toFixed(1) : "0.0",
      overview: movie.overview || ""
    }));
  }

  // 🎬 영화 상세 정보 (캐싱 + 영어 설명 폴백 포함)
  async fetchMovieById(movieId) {
    if (!movieId) return null;

    // 1. DB 캐시 확인
    const { data: cached, error: dbError } = await supabase
      .from('reviews')
      .select('*')
      .eq('content_id', String(movieId))
      .eq('media_type', 'movie')
      .maybeSingle();

    if (!dbError && cached && cached.title) {
      const m = cached.metadata || {};
      return {
        id: movieId,
        title: cached.title,
        subTitle: m.release_year || "정보 없음",
        image: m.poster_path || m.image,
        description: m.summary || m.overview || "",
        rating: String(cached.rating || "0.0"),
        overview: m.summary || m.overview || ""
      };
    }

    // 2. 캐시 없으면 API 호출
    try {
      // 먼저 한국어 시도
      let res = await fetch(`${this.baseUrl}/movie/${movieId}?api_key=${this.apiKey}&language=ko-KR`);
      let data = res.ok ? await res.json() : null;

      if (!data) return null;

      // 한국어 설명이 없으면 영어로 가져오기
      if (!data.overview || data.overview.trim() === "") {
        console.log("🎬 한글 설명 없음 -> 영어 설명 시도 중...");
        const enRes = await fetch(`${this.baseUrl}/movie/${movieId}?api_key=${this.apiKey}&language=en-US`);
        if (enRes.ok) {
          const enData = await enRes.json();
          if (enData.overview) {
            data.overview = `(번역 없음) ${enData.overview}`;
          }
        }
      }

      return {
        id: data.id,
        title: data.title,
        subTitle: data.release_date ? data.release_date.split('-')[0] : '정보 없음',
        image: data.poster_path 
          ? `https://image.tmdb.org/t/p/w500${data.poster_path}` 
          : 'https://placehold.co/500x750?text=No+Image',
        description: data.overview || "등록된 설명이 없습니다.",
        rating: data.vote_average ? data.vote_average.toFixed(1) : "0.0",
        overview: data.overview || ""
      };
    } catch (error) {
      console.error("영화 상세 로드 실패:", error);
      return null;
    }
  }
}