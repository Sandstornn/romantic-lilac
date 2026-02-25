// src/components/MovieCard.jsx
export default function MovieCard({ movie }) {
  return (
    <div className="movie-card" style={{ cursor: 'pointer', minHeight: '300px' }}>
      {/* 🖼️ 영화 포스터 (없으면 회색 박스) */}
      <img 
        src={movie.image} 
        alt={movie.title} 
        style={{ width: '100%', aspectRatio: '2/3', borderRadius: '4px', objectFit: 'cover' }} 
      />
      <div style={{ marginTop: '8px' }}>
        <h3 style={{ fontSize: '0.95rem', fontWeight: 'bold', margin: '0' }}>
          {movie.title}
        </h3>
        <p style={{ color: '#666', fontSize: '0.85rem' }}>
          {movie.subTitle} • ★ {movie.rating}
        </p>
      </div>
    </div>
  );
}