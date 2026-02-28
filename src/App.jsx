import React,{ useState, useEffect, useRef, useCallback } from 'react';
// 1. Navigate(리다이렉트용), useLocation(현재 주소 확인용) 추가
import { useParams,Routes, Route, useNavigate, useLocation, Navigate } from 'react-router-dom';

import MovieProvider from './services/MovieProvider';
import Navbar from './components/Navbar';
import './styles/index.css';
import './styles/authModal.css';
import './styles/topAuthBar.css';
import DefaultHomeView from './views/DefaultHomeView';
import SearchResultView from './views/SearchResultView';
import MovieHomeView from './views/MovieHomeView';
import MusicHomeView from './views/MusicHomeView';
import DramaHomeView from './views/DramaHomeView';
import AnimationHomeView from './views/AnimationHomeView';
import GameHomeView from './views/GameHomeView';
import BookHomeView from './views/BookHomeView';
import AddReview from './components/addReview';

// Supabase & Components
import { supabase } from './services/supabaseClient';
import TopAuthBar from './components/TopAuthBar';
import AuthModal from './components/AuthModal';

// 카테고리 뷰 관리
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
  const [activeCategory, setActiveCategory] = useState('movie');
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  // const [selectedItem, setSelectedItem] = useState(null);
  const [user, setUser] = useState(null);
  const [authModalType, setAuthModalType] = useState(null);

  const navigate = useNavigate();
  const location = useLocation(); // 💡 현재 URL 경로를 가져옴
  const isReviewPage = location.pathname.startsWith('/addReview/'); //💡 현재 리뷰 페이지인지 확인

  // 💡 추가: 브라우저 주소창과 리액트 상태를 동기화하는 감시자
useEffect(() => {
  const path = location.pathname;

  // 1. 검색 페이지 주소일 때 (/search/검색어)
  if (path.startsWith('/search/')) {
    const urlQuery = decodeURIComponent(path.split('/')[2]);
    if (urlQuery !== searchQuery) {
      setLoading(true); // 로딩 시작
      setSearchQuery(urlQuery);
      setInputValue(urlQuery);
      setPage(1);
      setMovies([]);
    }
  } 
  else if (HOME_VIEWS[path.slice(1)]) {
    const genre = path.slice(1);
    if (activeCategory !== genre) {
      setActiveCategory(genre);
      setSearchQuery('');
      setInputValue('');
      setMovies([]);
      setPage(1);
    }
  }
  // 그 외 페이지 (홈 / 또는 /addReview 등)에서는 아무것도 초기화하지 않음
  // (이 부분이 명확해야 검색창 로직이 꼬이지 않습니다.)
}, [location.pathname]); // 주소가 바뀔 때마다 실행되어 상태를 맞춰줌



  // 💡 아이템 클릭: 상세 주소로 이동
  const handleItemClick = (item) => {
    // setSelectedItem(item);
    navigate(`/addReview/${item.id}`);
  };

  // 💡 평가 완료: 상태 비우고 이전(카테고리 홈)으로 이동
  const handleComplete = () => {
    setSelectedItem(null);
    navigate(`/${activeCategory}`); // 또는 navigate(-1)로 진짜 뒤로가기 가능
  };

  // 💡 메인 컨텐츠 렌더링 함수
  const renderMainContent = () => {
    return (
      <Routes>
        <Route path="/addReview/:itemId" element={
          
            <AddReview key = {location.pathname} // item={selectedItem} 
            user = {user} category={activeCategory} onComplete={handleComplete}/>
          
        } />

        <Route path="/search/:query" element={
          
            <SearchResultView 
              query={searchQuery} 
              movies={movies} 
              lastMovieRef={lastMovieRef}
              onItemClick={handleItemClick} 
            />
          
        } />

        {/* 검색어 없이 /search만 쳤을 때의 예외 처리 */}
      <Route path="/search" element={<Navigate to="/movie" replace />} />

        {Object.entries(HOME_VIEWS).map(([path, Component]) => (
          <Route 
            key={path} 
            path={`/${path}`} 
            element={Component({ onItemClick: handleItemClick })} 
          />
        ))}

        <Route path="/" element={<DefaultHomeView />} />
      </Routes>
    );
  };

  // 영화 데이터 로직 (생략 없이 유지)
  const movieProvider = new MovieProvider(import.meta.env.VITE_TMDB_API_KEY);
  const isFetching = useRef(false);
  const observer = useRef();

  const lastMovieRef = useCallback(node => {
    if (isFetching.current) return;
    if (observer.current) observer.current.disconnect();
    observer.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting) setPage(prev => prev + 1);
    });
    if (node) observer.current.observe(node);
  }, []);

  const fetchMovies = async (query, targetPage) => {
    if (isFetching.current) return;
    isFetching.current = true;
    try {
      const results = await movieProvider.search(query, targetPage);
      setMovies(prev => {
        const allMovies = targetPage === 1 ? results : [...prev, ...results];
        const uniqueMap = new Map();
        allMovies.forEach(m => uniqueMap.set(m.id, m));
        return Array.from(uniqueMap.values());
      });
    } catch (error) {
      console.error(error);
    } finally {
      if (targetPage === 1) setLoading(false);
      isFetching.current = false;
    }
  };

  useEffect(() => {
    if (searchQuery) fetchMovies(searchQuery, page);
  }, [page, searchQuery]);

  const handleSearch = (e) => {
    if (e.key === 'Enter' && inputValue.trim() !== '') {
      // setSelectedItem(null);
      navigate(`/search/${encodeURIComponent(inputValue.trim())}`); // 💡 주소 이동
      /*
      if(searchQuery.trim() !== inputValue.trim()){
        setLoading(true);
        setMovies([]);
        setPage(1);
        setSearchQuery(inputValue);
      }
      */
    }
  };

  const goHome = () => {
    setMovies([]);
    setSearchQuery('');
    setInputValue('');
    navigate('/'); // 💡 주소 이동
  };

  const handleGenreClick = (genre) => { 
    setActiveCategory(genre);
    setMovies([]);
    setSearchQuery('');
    setInputValue('');
    navigate(`/${genre}`); // 💡 주소 이동
  };

  // Auth 관련 로직
  const triggerGoogleLogin = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: window.location.origin }
    });
    if (error) console.error(error.message);
  };

  const handleOpenLogin = () => setAuthModalType('login');
  const handleOpenSignup = () => setAuthModalType('signup');
  const handleCloseModal = () => setAuthModalType(null);
  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (!error) setUser(null);
  };

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => setUser(session?.user ?? null));
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      const currentUser = session?.user ?? null;
      setUser(currentUser);
      if (currentUser) handleCloseModal();
    });
    return () => subscription.unsubscribe();
  }, []);

  return (
    <div className="App" style={{ minHeight: '100vh' }}>
      <TopAuthBar 
        user={user} 
        onLogin={handleOpenLogin} 
        onLogout={handleLogout} 
        onMyPageClick={() => setAuthModalType('profile')}
        onSignup={handleOpenSignup} 
      />

      {authModalType && (
        <AuthModal 
          type={authModalType} 
          onClose={handleCloseModal} 
          onGoogleLogin={triggerGoogleLogin} 
          onLogout={handleLogout}
        />
      )}

      <Navbar onLogoClick={goHome} onGenreClick={handleGenreClick}/>
      
      <section style={{ 
        padding: '20px 40px 0px 40px', 
        display: 'flex',
        // 💡 location 정보를 사용하여 레이아웃 결정
        // justifyContent: isReviewPage ? 'space-between' : 'flex-end',
        justifyContent: 'flex-end',  
        alignItems: 'center',
        height: '60px',
        boxSizing: 'border-box'
      }}>
        {/* 💡 리뷰 페이지에서는 뒤로가기 버튼이 왼쪽에, 검색창이 오른쪽에 위치하도록 조정 
        {isReviewPage && (
          <div className="back-navigation">
            <button 
              className="back-btn-text" 
              onClick={handleComplete}
              style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '1.2rem', marginTop: '8px' }}
            >
              &larr; 돌아가기
            </button>
          </div>
        )}
          */}
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