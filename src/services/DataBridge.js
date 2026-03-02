// src/services/DataBridge.js
// db <-> 앱 소통용 유틸
import { supabase } from './supabaseClient';

class DataBridge {
  // 💡 리뷰 저장 (item 매개변수 추가: API에서 받은 원본 데이터)
  async saveComment({ userId,title, contentId, category, rating, comment, item, parentId = null }) {
    let metadata = {};

    // 💡 카테고리에 따라 저장할 상세 정보를 다르게 구성합니다.
    switch (category) {
      case 'movie':
      case 'drama':
        metadata = {
          poster_path: item.poster_path,
          release_date: item.release_date,
          overview: item.overview
        };
        break;

      case 'game':
        metadata = {
          poster_path: item.image, // IGDB 가공 이미지 주소
          release_year: item.release_date,
          summary: item.overview,
          platforms: item.platforms || [], // 게임용 특화 데이터
        };
        break;

      default:
        metadata = { 
          display_image: item.poster_path || item.thumbnail,
          description: item.overview || item.summary 
        };
    }

    const { data, error } = await supabase
      .from('reviews')
      .upsert([{
        user_id: userId,
        content_id: String(contentId),
        media_type: category, // 사용자님의 기존 필드명 유지
        comment_type: 'REVIEW',
        rating: parseFloat(rating),
        comment: comment,
        parent_id: parentId,
        title: title,
        metadata: metadata, // 💡 새롭게 추가된 JSONB 필드
        created_at: new Date().toISOString()
      }], {
        onConflict: 'user_id, content_id'
      })
      .select();

    if (error) throw error;
    return data[0];
  }

  // 💡 특정 작품의 모든 리뷰(원댓글) 가져오기
  async getReviews(contentId) {
    const { data, error } = await supabase
      .from('reviews')
      .select('*')
      .eq('content_id', String(contentId))
      .is('parent_id', null) // 대댓글 제외, 원본 리뷰만
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  }

  // 💡 특정 리뷰의 대댓글(답글)만 가져오기
  async getReplies(reviewId) {
    const { data, error } = await supabase
      .from('reviews')
      .select('*')
      .eq('parent_id', reviewId)
      .order('created_at', { ascending: true });

    if (error) throw error;
    return data;
  }

  // 사용자가 특정 작품에 남긴 리뷰(원댓글) 가져오기
  async getMyReview(userId, contentId) {
  const { data, error } = await supabase
    .from('reviews')
    .select('*')
    .eq('user_id', userId)
    .eq('content_id', String(contentId))
    .eq('comment_type', 'REVIEW')
    .maybeSingle(); // 데이터가 없어도 에러를 내지 않고 null을 반환합니다.

  if (error) throw error;
  return data;
}

  // 대댓글 말고 리뷰들만 가져오기 -> 마이페이지 리뷰 관리용
  async getMyAllReviews(userId, category) {
  const { data, error } = await supabase
    .from('reviews')
    .select(`
      *,
      profiles ( nickname, avatar_url ) -- profiles 테이블 정보를 조인해서 가져옴
    `)
    .eq('user_id', userId)
    .eq('media_type', category)
    .is('parent_id', null)
    // 별점이 높으면 위로 오도록 설정
    .order('rating',  { ascending: false });

  if (error) throw error;
  return data;
}

}

export default new DataBridge(); // 어디서든 바로 쓸 수 있게 인스턴스로 수출