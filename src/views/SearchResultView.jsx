import ItemCard from '../components/ItemCard';

// 💡 category 프롭을 추가로 받아야 ItemCard에서 장르별 표시가 가능합니다.
export default function SearchResultView({ query, items, lastMovieRef, onItemClick, category }) {
   
  return (
    <> 
      <h2 style={{ fontSize: '1.4rem', marginBottom: '20px', fontWeight: 'bold' }}>
        '{query}' 검색 결과
      </h2>
      <div className="content-grid" style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', 
        gap: '20px' 
      }}>
        {items.map((item, index) => {
            // 💡 마지막 영화 카드에만 감시용 ref를 달아줍니다.
            if (items.length === index + 1) {
              return (
                <div ref={lastMovieRef} key={item.id}>
                  {/* 💡 movie={movie}를 item={item}로 변경! */}
                  <ItemCard item={item} category={category} onClick={onItemClick}/>
                </div>
              );
            }
            // 💡 여기도 마찬가지로 item={item}로 변경!
            return <ItemCard key={item.id} item={item} category={category} onClick={onItemClick} />;
        })}
      </div>
    </>
  );
}