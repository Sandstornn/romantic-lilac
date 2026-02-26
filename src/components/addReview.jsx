// src/components/AddReview.jsx
import React, { useState } from 'react'; // 💡 React.Fragment 사용을 위해 React 추가
import { supabase } from '../services/supabaseClient';
import '../styles/addReview.css';

export default function AddReview({ item, onComplete }) {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // 💡 1. undefined 에러 해결을 위해 변수 정의
  const ratingSteps = [5, 4.5, 4, 3.5, 3, 2.5, 2, 1.5, 1, 0.5];

  // 별 클릭 시 실행될 토글 함수
  const handleStarClick = (num) => {
    if (rating === num) {
      setRating(0); // 이미 선택된 점수면 취소 [cite: 2026-01-30]
    } else {
      setRating(num); // 아니면 해당 점수 선택
    }
  };

  const handleSubmit = async () => {
    if (rating === 0) return alert('별점을 선택해 주세요!');
    if (isSubmitting) return;
    setIsSubmitting(true);

    try {
      const { error } = await supabase
        .from('reviews')
        .insert([{
          content_id: String(item.id),
          media_type: item.media_type || 'movie',
          rating: parseFloat(rating), 
          comment: comment,
        }]);

      if (error) throw error;
      alert('성공적으로 저장되었습니다! ✨');
      if (onComplete) onComplete();
    } catch (error) {
      alert('오류 발생: ' + error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="add-review-wrapper">
      <div id="container_add_rating">
        <div className="left-section">
          <div className="poster-box">
            <img src={item.image} alt={item.title} />
          </div>
          <div className="description">
            <h3>{item.title}</h3>
            <p>{item.description}</p>
          </div>
        </div>

        {/* 💡 2. 중앙 섹션: 제목, 상세 정보 및 향후 댓글 영역 */}
        <div className="middle-section">
          <div className="info-header">
            <h2 className="content-title">{item.title}</h2>
          </div>
          
          <div className="content-description" style={{ paddingBottom: '20px' }}>
            <h4>작품 소개</h4>
            <p>{item.description}</p>
          </div>


          {/* 💡 핵심: <span>을 빼고 모든 input/label을 형제로 배치 */}
          <div className="star-rating">
          {ratingSteps.map((num) => (
            <React.Fragment key={num}>
              {/* 💡 onClick을 label에 주어 토글 가능하게 함 */}
              <input 
                type="radio" 
                id={`star-${num}`} 
                name="rating" 
                value={num} 
                checked={rating === num}
                readOnly
              />
              <label 
                htmlFor={`star-${num}`} 
                className={num % 1 !== 0 ? "half" : ""}
                onClick={(e) => {
                  e.preventDefault(); // 라디오 기본 동작 방지
                  handleStarClick(num);
                }}
              >
                  ★
                </label>
              </React.Fragment>
            ))}
            </div>
          
          <textarea 
            placeholder="감상평을 입력하세요"
            value={comment}
            onChange={(e) => setComment(e.target.value)}
          ></textarea>

          <button className="complete-btn" onClick={handleSubmit} disabled={isSubmitting}>
            {isSubmitting ? '저장 중...' : '등록'}
          </button>
        </div>

        <div className="right-section">
          

          {/* 💡 향후 여기에 댓글(감상평) 리스트가 추가될 예정입니다 */}
            <div className="comments-placeholder">
              <h4>감상평 목록</h4>
              <p style={{ color: '#666' }}>아직 작성된 감상평이 없습니다.</p>
            </div>
          </div>

          
        </div>
      </div>
  );
}