import ItemCard from '../components/ItemCard'; // 💡 이제 이게 진짜 존재해야 해요!

export default function MusicHomeView() {
  // 진짜 영화 같은 가짜 데이터를 만들어줍니다.
  const dummyMovies = [
    { id: 1, title: '로맨틱 라일락 추천 1', subTitle: '2026', rating: 4.5, image: 'https://via.placeholder.com/500x750?text=Movie+1' },
    { id: 2, title: '로맨틱 라일락 추천 2', subTitle: '2026', rating: 4.2, image: 'https://via.placeholder.com/500x750?text=Movie+2' },
    { id: 3, title: '로맨틱 라일락 추천 3', subTitle: '2025', rating: 4.8, image: 'https://via.placeholder.com/500x750?text=Movie+3' },
    { id: 4, title: '로맨틱 라일락 추천 4', subTitle: '2024', rating: 3.9, image: 'https://via.placeholder.com/500x750?text=Movie+4' },
    { id: 5, title: '로맨틱 라일락 추천 5', subTitle: '2026', rating: 5.0, image: 'https://via.placeholder.com/500x750?text=Movie+5' },
  ];

  return (
    <>
      <h2 style={{ fontSize: '1.4rem', marginBottom: '20px', fontWeight: 'bold' }}>
        Romantic Lilac 추천 콘텐츠
      </h2>
      
      <div className="content-grid" style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', 
        gap: '25px' 
      }}>
        {/* 💡 복잡한 div 대신 ItemCard 하나로 끝! */}
        {dummyMovies.map((movie) => (
          <ItemCard key={movie.id} movie={movie} />
        ))}
      </div>
    </>
  );
}