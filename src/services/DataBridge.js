// src/services/DataBridge.js
// db <-> 앱 소통용 유틸
import { supabase } from './supabaseClient';

class DataBridge {
  // 💡 리뷰 저장
  async saveComment({ userId, contentId, category, rating, comment, parentId = null }) {
    const { data, error } = await supabase
      .from('reviews')
      .upsert([{
        user_id: userId,
        content_id: String(contentId),
        media_type: category,
        comment_type: 'REVIEW', // 'REVIEW' 또는 'REPLY'
        rating: parseFloat(rating),
        comment: comment,
        parent_id: null,
        // 업데이트 될 때 마다 최신 댓글로 보이도록 created_at도 갱신
        created_at: new Date().toISOString()
      }], {
      onConflict: 'user_id, content_id' // 유저 한 명당 한 작품에 하나의 리뷰만 남기도록 설정
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
}

export default new DataBridge(); // 어디서든 바로 쓸 수 있게 인스턴스로 수출