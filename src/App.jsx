import { useState, useEffect, useRef, useCallback } from 'react';
import MovieProvider from './services/MovieProvider';
import Navbar from './components/Navbar';
import './styles/index.css';
import DefaultHomeView from './views/DefaultHomeView';
import SearchResultView from './views/SearchResultView';
import MovieHomeView from './views/MovieHomeView';
import MusicHomeView from './views/MusicHomeView';

import AddReview from './components/addReview';

// 1. 뷰 컴포넌트들을 한곳에서 관리 (나중에 카테고리가 추가되면 여기만 한 줄 추가하면 끝!)
const HOME_VIEWS = {
  movie: (props) => <MovieHomeView {...props} />,
  music: (props) => <MusicHomeView {...props} />,
  drama: (props) => <DramaHomeView {...props} />,
  animation: (props) => <AnimationHomeView {...props} />,
  game: (props) => <GameHomeView {...props} />,
  book: (props) => <BookHomeView {...props} />,
};






function App() {
  const [inputValue, setInputValue] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [movies, setMovies] = useState([]);
  const [currentView, setCurrentView] = useState('home');
  const [activeCategory, setActiveCategory] = useState('movie'); // 💡 현재 카테고리 기억용
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false); // 💡 검색 시에만 사용 (스크롤 시에는 리스트 유지)

  // 리뷰 작성 모달 상태 -> 클릭한 아이템으로 모달이 열리고 닫힌다.
  const [selectedItem, setSelectedItem] = useState(null);

  // 💡 영화 카드를 클릭했을 때 실행될 함수
  const handleItemClick = (item) => {
    setSelectedItem(item);   // 클릭한 영화 정보를 저장
    setCurrentView('addReview'); // 화면을 평가 페이지로 변경
  };

  // 💡 평가 완료 후 다시 홈으로 돌아오는 함수
  const handleComplete = () => {
    setSelectedItem(null);
    setCurrentView(activeCategory);
  };

  // 💡 메인 컨텐츠 렌더링 함수
  const renderMainContent = () => {
    // 1. 리뷰 작성 중이라면 (최우선)
    if (currentView === 'addReview' && selectedItem) {
      return <AddReview item={selectedItem} category={activeCategory} onComplete={handleComplete} />;
    }

    // 2. 검색 중이라면
    if (searchQuery) {
      if (loading && movies.length === 0) return <div>검색 중입니다...</div>;
      if (movies.length > 0) return (
        <SearchResultView 
          query={searchQuery} 
          movies={movies} 
          lastMovieRef={lastMovieRef}
          onItemClick={handleItemClick} 
        />
      );
      return (
        <div className="no-result">
          <h2>'{searchQuery}' 결과가 없습니다.</h2>
        </div>
      );
    }

    // 3. 카테고리 홈 (HOME_VIEWS 활용) [cite: 2026-02-25]
    const SelectedView = HOME_VIEWS[currentView];
    if (SelectedView) {
      return SelectedView({ onItemClick: handleItemClick });
    }

    // 4. 기본 홈
    return <DefaultHomeView />;
  };



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
      setLoading(false); // 에러 시에도 로딩 상태 해제
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
      isFetching.current = false; // 새로운 검색이 시작되므로 중복 방지 플래그 초기화
      setSelectedItem(null);
      setCurrentView('search'); // 검색 결과 뷰로 전환
      
      // 검색어 안바뀌면 검색이 똑바로 안되던 오류 수정
      if(searchQuery.trim() !==inputValue.trim()){
        setLoading(true); // 처음 검색할 때만 "검색 중" 표시
        setMovies([]);
        setPage(1);
        setSearchQuery(inputValue); // useEffect가 트리거되어 fetchMovies 실행됨
      }
    }
  };

  const goHome = () => { setCurrentView('home'); setMovies([]); setSearchQuery(''); setInputValue(''); };
  const handleGenreClick = (genre) => { 
    setActiveCategory(genre); // 현재 선택된 카테고리 상태 업데이트
    setCurrentView(genre);     // 화면 전환
    setMovies([]);
    setSearchQuery('');
    setInputValue('');
   };

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
        {renderMainContent()}
      </main>

      {!loading && isFetching.current && <div style={{ textAlign: 'center' }}>불러오는 중...</div>}
    </div>
  );
}

export default App;