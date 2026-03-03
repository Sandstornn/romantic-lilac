// src/views/DefaultHomeView.jsx
import React, { useEffect, useState } from 'react';
import ItemCard from '../components/ItemCard';
import GameProvider from '../services/GameProvider';

export default function DefaultHomeView({ onItemClick }) {
  const [games, setGames] = useState([]);
  const [loading, setLoading] = useState(true);

  // 💡 환경변수 확인용 (콘솔에 찍어서 뜨는지 보세요)
  console.log("ID 확인:", import.meta.env.VITE_IGDB_CLIENT_ID);

  const gameProvider = new GameProvider(
    import.meta.env.VITE_IGDB_CLIENT_ID,
    import.meta.env.VITE_IGDB_CLIENT_SECRET
  );

  useEffect(() => {
    const fetchMario = async () => {
      try {
        const results = await gameProvider.search('마리오', 1);
        console.log("서버에서 받은 데이터:", results); // 💡 여기서 데이터가 출력되는지 확인!
        setGames(Array.isArray(results) ? results : []);
      } catch (e) {
        console.error("호출 실패:", e);
      } finally {
        setLoading(false);
      }
    };
    fetchMario();
  }, []);

  if (loading) return <div style={{color:'white', textAlign:'center'}}>마리오 찾는 중...</div>;

  return (
    <div style={{ padding: '20px' }}>
      <h2 style={{ color: 'white', marginBottom: '20px' }}>마리오 검색 결과</h2>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: '20px' }}>
        {games.length > 0 ? (
          games.map((g) => (
            // 💡 핵심: item={g} 라고 줘야 ItemCard가 알아먹습니다!
            <ItemCard key={g.id} item={g} onClick={onItemClick} />
          ))
        ) : (
          <p style={{color:'gray'}}>데이터가 비어있습니다. 네트워크 탭의 Response를 확인하세요.</p>
        )}
      </div>
    </div>
  );
}