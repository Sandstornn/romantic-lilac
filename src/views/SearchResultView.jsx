import MovieCard from '../components/MovieCard';

// 💡 1. 'query'와 'movies'를 부모(App.jsx)로부터 받아와야 합니다.
export default function SearchResultView({ query, movies,lastMovieRef,onItemClick }) {
   
  return (
    // 💡 2. 여러 태그를 반환할 때는 반드시 하나로 감싸야 합니다 (<> 또는 <div>)
    <> 
      <h2 style={{ fontSize: '1.4rem', marginBottom: '20px', fontWeight: 'bold' }}>
        '{query}' 검색 결과
      </h2>
      <div className="content-grid" style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', 
        gap: '20px' 
      }}>
        {movies.map((movie, index) => {
            // 💡 마지막 영화 카드에만 감시용 ref를 달아줍니다.
            if (movies.length === index+1) {
            return (
              <div ref={lastMovieRef} key={movie.id}>
                <MovieCard movie={movie} onClick={onItemClick}/>
              </div>
            );
          }
          return <MovieCard key={movie.id} movie={movie} onClick={onItemClick} />;
    })}
      </div>
    </>
  );
}