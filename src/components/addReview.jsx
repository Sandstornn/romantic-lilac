// src/components/AddReview.jsx
import React, { useState,useEffect } from 'react'; // 💡 React.Fragment 사용을 위해 React 추가
// 라우팅용
import { useParams,useNavigate } from 'react-router-dom';
import { supabase } from '../services/supabaseClient';
import MovieProvider from '../services/MovieProvider';
// 아니 진짜로 그냥 import 안한거였나;;
import GameProvider from '../services/GameProvider';
import dataBridge from '../services/DataBridge';
import '../styles/addReview.css';

export default function AddReview({ item: propItem, category, onComplete ,user})  {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

  const { itemId } = useParams(); // URL에서 itemId를 가져옵니다.
  // 상태 관리: 전달받은 item이 있으면 그것을 사용, 없으면 새로 불러온 데이터를 담음
  const [item, setItem] = useState(propItem || null);
  const [loading, setLoading] = useState(!propItem); // item이 없으면 로딩 시작


  // addReview 컴포넌트에서 편집 모드 여부와 리뷰 ID 상태 추가
  const [isEditMode, setIsEditMode] = useState(false); 
  const [reviewId, setReviewId] = useState(null);
  const [reviews, setReviews] = useState([]); // 💡 우측 목록용 상태
useEffect(() => {
    const initPage = async () => {
      if (!itemId) return;

      try {
        setLoading(true);
        
        // 1. 작품 상세 정보 가져오기 (이미 있으면 스킵)
        if (!item) {
          let detailData = null;

          // 💡 카테고리에 따른 데이터 호출 분기 (switch-case)
          switch (category) {
            case 'game':
              const gameProvider = new GameProvider();
              // Edge Function의 'detail' 타입을 호출하는 함수
              detailData = await gameProvider.fetchGameById(itemId);
              break;

            case 'movie':
            // case 'drama':
              const movieProvider = new MovieProvider(import.meta.env.VITE_TMDB_API_KEY);
              detailData = await movieProvider.getDetail(itemId);
              break;

            // case 'book':
            //   const bookProvider = new BookProvider();
            //   detailData = await bookProvider.fetchBookById(itemId);
            //   break;

            default:
              console.warn("알 수 없는 카테고리입니다:", category);
          }

          if (detailData) setItem(detailData);
        }

        // 2. 내 기존 리뷰 확인 (기존 로직 유지)
        if (user && itemId) {
          const existingReview = await dataBridge.getMyReview(user.id, itemId);
          if (existingReview) {
            setRating(existingReview.rating);
            setComment(existingReview.comment);
          }
        }

        // 3. 전체 리뷰 목록 로드
        const publicReviews = await dataBridge.getReviews(itemId);
        setReviews(publicReviews);

      } catch (error) {
        console.error("데이터 로드 중 오류:", error);
      } finally {
        setLoading(false);
      }
    };

    initPage();
  }, [itemId, propItem, user,category]);
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
    if (!item || !user) return alert('로그인이 필요합니다!');
    if (rating === 0) return alert('별점을 선택해 주세요!');
    if (isSubmitting) return;
    setIsSubmitting(true);

    try {
        await dataBridge.saveComment({
        userId: user.id, 
        contentId: item.id,
        category: category,
        // comment_type: 'REVIEW', // 일반 리뷰니까 REVIEW
        rating: rating,
        comment: comment,
        item: item,
        title: item.title
      });

      alert('성공적으로 저장되었습니다! ✨');

      // 저장 성공 후 목록 새로고침!
      fetchReviews();

      if (onComplete) onComplete();
    } catch (error) {
      alert('오류 발생: ' + error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  /* 우측 리뷰들 */
  // 💡 2. 리뷰 목록 불러오기 함수
  const fetchReviews = async () => {
    if (!itemId) return;
    try {
      const data = await dataBridge.getReviews(itemId);
      setReviews(data);
    } catch (error) {
      console.error("리뷰 목록 로드 실패:", error);
    }
  };

  // 2. 로딩 중 처리
  if (loading && !item) {
    return <div style={{ textAlign: 'center', padding: '50px' }}>작품 정보를 불러오는 중...</div>;
  }

  // 3. 데이터가 결국 없는 경우 처리
  if (!item) return <div style={{ textAlign: 'center', padding: '50px' }}>작품 정보를 찾을 수 없습니다.</div>;

  return (
    <div className="add-review-wrapper">
      <div id="container_add_rating">
        <div className="left-section">
          <div className="poster-box">
            <img src={item.image} alt={item.title} />
          </div>
          <div className="description">
            <h3>{item.title}</h3>
            <p>{item.overview ||item.description}</p>
          </div>
        </div>

        {/* 💡 2. 중앙 섹션: 제목, 상세 정보 및 향후 댓글 영역 */}
        <div className="middle-section">
          <div className="info-header">
            <h2 className="content-title">{item.title}</h2>
          </div>
          
          <div className="content-description" style={{ paddingBottom: '20px' }}>
            <h4>작품 소개</h4>
            <p>{item.overview ||item.description}</p>
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

        {/* 💡 4. 우측 섹션: 실제 데이터 바인딩 */}
        <div className="right-section">
          <div className="comments-header">
            <h4>감상평 목록 ({reviews.length})</h4>
          </div>
          
          <div className="comments-list">
            {reviews.length > 0 ? (
                    reviews.map((rev) => (
                <div key={rev.id} className={`comment-item ${rev.comment.length > 100 ? 'is-long' : 'is-short'}`}>
                  <div className="comment-top">
                    <span className="comment-star">⭐ {rev.rating}</span>
                    <span className="comment-user">익명 사용자</span> {/* 💡 나중에 rev.user_email 등으로 변경 */}
                  </div>
                  {/* 💡 여기에 hover 효과가 적용됩니다 */}
                  <p className="comment-text" title="클릭하거나 마우스를 올리면 전체 내용을 볼 수 있습니다.">
                    {rev.comment}
                    <span className="comment-date">
                      {new Date(rev.created_at).toLocaleDateString()}
                    </span>
                  </p>

                </div>
              ))  
            ) : (
              <div className="no-comments">
                <p>아직 작성된 감상평이 없습니다.</p>
                <p>첫 번째 리뷰어가 되어보세요!</p>
              </div>
            )}
          </div>
        </div>

          
        </div>
      </div>
  );
}