export default function CategoryView({ title }) {
  return (
    <div className="category-container">
      <h2>{title} Category</h2>
      <div className="item-grid">
        {/* 나중에 여기에 데이터가 뿌려질 거야 */}
        <p>아직 평가한 {title} 작품이 없습니다.</p>
      </div>
    </div>
  );
}