// src/components/AddReview.jsx
export default function AddReview() {
  return (
    <div id="container_add_rating">
      {/* 스케치했던 좌측 영역: 포스터와 설명 */}
      <div className="left-section">
        <div className="poster-box">포스터 이미지</div>
        <div className="description">작품 설명이 들어갈 곳</div>
      </div>

      {/* 우측 영역: 평점 및 감상평 */}
      <div className="right-section">
        <select className="genre-select">
          <option>movie</option>
          <option>music</option>
          {/* 기존 옵션들 */}
        </select>
        <div className="star-rating">★★★★★</div>
        <textarea placeholder="감상평을 입력하세요"></textarea>
        <button className="complete-btn">완료</button>
      </div>
    </div>
  );
}