// src/services/SeriesProvider.js
import { supabase } from './supabaseClient';

export default class SeriesProvider {
  constructor(apiKey) {
    this.apiKey = apiKey;
    this.baseUrl = 'https://api.themoviedb.org/3';
  }

  // 📺 검색 로직: TV 시리즈 검색
  async search(query, page = 1) {
    if (!query) return [];
    // 💡 주소에 /search/tv 사용
    const url = `${this.baseUrl}/search/tv?api_key=${this.apiKey}&query=${encodeURIComponent(query)}&page=${page}&language=ko-KR`;
    const response = await fetch(url);
    const data = await response.json();

    return (data.results || [])
        .filter(tv => {
        const name = tv.name || "";
        const lowerName = name.toLowerCase();
        return !name.includes("극장판") && !lowerName.includes("the movie");
        })
        .map(tv => ({
        id: tv.id,
      title: tv.name, // 💡 TV는 title 대신 name
      subTitle: tv.first_air_date ? tv.first_air_date.split('-')[0] : '정보 없음', // 💡 release_date 대신 first_air_date
      image: tv.poster_path 
        ? `https://image.tmdb.org/t/p/w500${tv.poster_path}` 
        : 'https://placehold.co/500x750?text=No+Image',
      description: tv.overview || "",
      rating: tv.vote_average ? tv.vote_average.toFixed(1) : "0.0",
      overview: tv.overview || ""
    }));
  }

  // 📺 상세 로직: TV 시리즈 상세 정보
  async fetchSeriesById(seriesId) {
    if (!seriesId) return null;

    // 1. DB 캐시 확인 (카테고리명 'series'로 조회)
    const { data: cached } = await supabase
      .from('reviews')
      .select('*')
      .eq('content_id', String(seriesId))
      .eq('media_type', 'series') 
      .maybeSingle();

    if (cached?.title) {
      const m = cached.metadata || {};
      return {
        id: seriesId,
        title: cached.title,
        subTitle: m.release_year || "정보 없음",
        image: m.image || m.poster_path,
        description: m.summary || m.overview || "",
        rating: String(cached.rating || "0.0"),
        overview: m.summary || m.overview || ""
      };
    }

    try {
    // [A] 우선 한국어(ko-KR)로 데이터를 가져옵니다.
    let res = await fetch(`${this.baseUrl}/tv/${seriesId}?api_key=${this.apiKey}&language=ko-KR`);
    let data = res.ok ? await res.json() : null;

    if (!data) return null;

    //  한국어 설명이 없으면 영어로 가져오기
    if (!data.overview || data.overview.trim() === "") {
      console.log("한글 설명 없음 -> 영어 설명 시도");
      
      const enRes = await fetch(`${this.baseUrl}/tv/${seriesId}?api_key=${this.apiKey}&language=en-US`);
      if (enRes.ok) {
        const enData = await enRes.json();
        // 영어 설명이 있다면 데이터에 덮어씌웁니다.
        if (enData.overview) {
          data.overview = `(번역 없음) ${enData.overview}`;
        }
      }
    }

    return {
      id: data.id,
      title: data.name || data.title,
      subTitle: (data.first_air_date || data.release_date)?.split('-')[0] || '정보 없음',
      image: data.poster_path 
        ? `https://image.tmdb.org/t/p/w500${data.poster_path}` 
        : 'https://placehold.co/500x750?text=No+Image',
      description: data.overview || "설명이 등록되어 있지 않습니다.",
      rating: data.vote_average ? data.vote_average.toFixed(1) : "0.0",
      overview: data.overview || ""
    };
  } catch (error) {
    return null;
  }
}
}