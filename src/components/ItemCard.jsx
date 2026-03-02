// src/components/ItemCard.jsx
export default function ItemCard({ item,category,onClick }) {
  // 나중에는 카테고리 별로 다른 정보를 보여줄 수도 있으니 category도 받아둡니다.

  if (!item) {
    console.warn("ItemCard: item 데이터가 전달되지 않았습니다!");
    return null; 
  }

  return (
    <div className="item-card" 
    onClick={() => onClick(item)}
    style={{ cursor: 'pointer', minHeight: '300px' }}
    >

      {/* 🖼️ 영화 포스터 (없으면 회색 박스) */}
      <img 
        src={item.image || '/default-poster.png'}
        alt={item.title} 
        style={{ width: '100%', aspectRatio: '2/3', borderRadius: '4px', objectFit: 'cover' }} 
      />
      <div style={{ marginTop: '8px' }}>
        <h3 style={{ fontSize: '0.95rem', fontWeight: 'bold', margin: '0' }}>
          {item.title}
        </h3>
        <p style={{ color: '#666', fontSize: '0.85rem' }}>
          {item.subTitle} • ★ {item.rating}
        </p>
      </div>
    </div>
  );
}