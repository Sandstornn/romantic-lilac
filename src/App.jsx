import { useState, useEffect, useRef, useCallback } from 'react';
import MovieProvider from './services/MovieProvider';
import Navbar from './components/Navbar';
import './styles/index.css';
import DefaultHomeView from './views/DefaultHomeView';
import SearchResultView from './views/SearchResultView';
import MovieHomeView from './views/MovieHomeView';
import MusicHomeView from './views/MusicHomeView';

function App() {
  const [inputValue, setInputValue] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [movies, setMovies] = useState([]);
  const [currentView, setCurrentView] = useState('home');
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false); // 💡 검색 시에만 사용 (스크롤 시에는 리스트 유지)

  const movieProvider = new MovieProvider(import.meta.env.VITE_TMDB_API_KEY); //[cite: 2026-02-21]
  const isFetching = useRef(false); // 💡 중복 로드 방지 안전벨트
  const observer = useRef();

  // 💡 1. 센서 로직 (이 함수를 자식에게 통째로 넘겨야 함)
  const lastMovieRef = useCallback(node => {
    if (isFetching.current) return;
    if (observer.current) observer.current.disconnect();
    
    observer.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting) {
        setPage(prev => prev + 1); // 바닥 감지 시 페이지 증가
      }
    });
    if (node) observer.current.observe(node);
  }, []);

  // 💡 2. 데이터 가져오기 함수 (페이지네이션 지원)
  const fetchMovies = async (query, targetPage) => {
    if (isFetching.current) return;
    isFetching.current = true;

    try {
      const results = await movieProvider.search(query, targetPage);
      
      setMovies(prev => {
        // 💡 사용자님이 말씀하신 HashMap 논리 적용
        // 기존 영화와 새 영화를 합친 뒤, ID를 기준으로 중복을 제거합니다.
        const allMovies = targetPage === 1 ? results : [...prev, ...results];
        const uniqueMap = new Map();
        
        allMovies.forEach(movie => {
          uniqueMap.set(movie.id, movie); // 같은 ID가 들어오면 덮어씌워져서 중복 제거됨
        });

        return Array.from(uniqueMap.values());
      });
    } catch (error) {
      console.error(error);
    } finally {
      // 1페이지 로딩(Initial Search)일 때만 loading 상태를 꺼줍니다.
      if (targetPage === 1) {
        setLoading(false); 
      }
      isFetching.current = false;
    }
  };

  // 💡 3. 페이지나 검색어가 바뀔 때 호출
  useEffect(() => {
    if (searchQuery) {
      fetchMovies(searchQuery, page);
    }
  }, [page, searchQuery]);

  const handleSearch = (e) => {
    if (e.key === 'Enter' && inputValue.trim() !== '') {
      setLoading(true); // 처음 검색할 때만 "검색 중" 표시
      setMovies([]);
      setPage(1);
      setSearchQuery(inputValue); // useEffect가 트리거되어 fetchMovies 실행됨
    }
  };

  const goHome = () => { setCurrentView('home'); setMovies([]); setSearchQuery(''); };
  const handleGenreClick = (genre) => { setCurrentView(genre); setMovies([]); setSearchQuery(''); };

  return (
    <div className="App" style={{ minHeight: '100vh' }}>
      <Navbar onLogoClick={goHome} onGenreClick={handleGenreClick}/>
      
      <section style={{ padding: '20px 40px', display: 'flex', justifyContent: 'flex-end' }}>
        <input 
          type="text" 
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleSearch}
          placeholder="콘텐츠 검색 후 Enter"
          style={{ width: '300px', padding: '10px 15px', borderRadius: '20px', border: '1px solid #ddd' }}
        />
      </section>

      <main style={{ padding: '20px 40px' }}>
        {/* 💡 핵심: loading 중이어도 movies가 있으면 SearchResultView를 계속 보여줘야 스크롤이 안 튐 */}
        {loading && movies.length === 0 ? (
          <div>검색 중입니다...</div>
        ) : movies.length > 0 ? (
          <SearchResultView 
            query={searchQuery} 
            movies={movies} 
            lastMovieRef={lastMovieRef}  // 💡 4. 작성한 센서 함수를 그대로 전달!
          /> 
        )
          : searchQuery && !loading ? (
          <div className="no-result">
            <h2>'{searchQuery}'에 대한 검색 결과가 없습니다.</h2>
            <p>철자를 확인하거나 다른 검색어를 입력해 보세요.</p>
          </div>
        )
        : currentView === 'movie' ? (
          <MovieHomeView />
        ) : currentView === 'music' ? (
          <MusicHomeView />// [cite: 2026-01-30]
        ) : (
          <DefaultHomeView />
        )}
        
        {/* 스크롤 중일 때만 하단에 살짝 표시 */}
        {!loading && isFetching.current && <div style={{ textAlign: 'center', padding: '20px' }}>불러오는 중...</div>}
      </main>
    </div>
  );
}

export default App;