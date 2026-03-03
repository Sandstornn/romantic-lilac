import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, Routes, Route, useNavigate, useLocation, Navigate } from 'react-router-dom';

import AnimationProvider from './services/AnimationProvider';
import MovieProvider from './services/MovieProvider';
import GameProvider from './services/GameProvider';
import SeriesProvider from './services/SeriesProvider';
import BookProvider from './services/BookProvider';
import MusicProvider from './services/MusicProvider';
// import BookProvider from './services/BookProvider'; 

import Navbar from './components/Navbar';
import './styles/index.css';
import './styles/authModal.css';
import './styles/topAuthBar.css';
import DefaultHomeView from './views/DefaultHomeView';
import SearchResultView from './views/SearchResultView';
import MovieHomeView from './views/MovieHomeView';
import MusicHomeView from './views/MusicHomeView';
import SeriesHomeView from './views/SeriesHomeView';
import AnimationHomeView from './views/AnimationHomeView';
import GameHomeView from './views/GameHomeView';
import BookHomeView from './views/BookHomeView';
import AddReview from './components/addReview';

import accountService from './services/ExternalAccountService';
import { supabase } from './services/supabaseClient';
import TopAuthBar from './components/TopAuthBar';
import AuthModal from './components/AuthModal';

const HOME_VIEWS = {
  movie: (props) => <MovieHomeView {...props} />,
  music: (props) => <MusicHomeView {...props} />,
  series: (props) => <SeriesHomeView {...props} />,
  animation: (props) => <AnimationHomeView {...props} />,
  game: (props) => <GameHomeView {...props} />,
  book: (props) => <BookHomeView {...props} />,
};

function App() {
  const [inputValue, setInputValue] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  
  // movies -> items
  const [items, setItems] = useState([]); 
  const [activeCategory, setActiveCategory] = useState('movie');
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState(null);
  const [authModalType, setAuthModalType] = useState(null);

  const navigate = useNavigate();
  const location = useLocation(); 
  const isReviewPage = location.pathname.startsWith('/addReview/');

  useEffect(() => {
  const path = location.pathname; // 예: /game/search/포켓몬
  const segments = path.split('/'); // ['', 'game', 'search', '포켓몬']

  // 💡 인덱스 2번이 'search'인 경우 (/:category/search/:query)
  if (segments[2] === 'search') {
    const urlCategory = segments[1]; // game
    const urlQuery = decodeURIComponent(segments[3]); // 포켓몬

    if (urlQuery !== searchQuery || urlCategory !== activeCategory) {
      setLoading(true);
      setActiveCategory(urlCategory); // 💡 카테고리 상태 업데이트
      setSearchQuery(urlQuery);
      setInputValue(urlQuery);
      setPage(1);
      setItems([]);
    }
    fetchItems(urlQuery, 1, urlCategory);
  } 
  // 기존 장르 홈 (/:category) 로직
  else if (HOME_VIEWS[path.slice(1)]) {
    const genre = path.slice(1);
    if (activeCategory !== genre) {
      setActiveCategory(genre);
      setSearchQuery('');
      setInputValue('');
      setItems([]);
      setPage(1);
      
    }
  }
}, [location.pathname]);


  const handleItemClick = (item) => {
    navigate(`/${activeCategory}/addReview/${item.id}`);
  };

  const handleComplete = () => {
    if (window.history.length > 1) {
    navigate(-1);
  } else {
    // 히스토리가 없다면 기본 페이지(홈)로 이동
    navigate(`/${activeCategory}`);
  }
  };

  const renderMainContent = () => {
    return (
      <Routes>
        <Route path="/:category/addReview/:itemId" element={
          <AddReview key={location.pathname} user={user} category={activeCategory} onComplete={handleComplete}/>
        } />

        <Route path="/:category/search/:query" element={
          <SearchResultView 
            query={searchQuery} 
            items={items} 
            lastItemRef={lastItemRef} 
            onItemClick={handleItemClick} 
            category={activeCategory}
          />
        } />

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

  // movie 전용 코드는 이름 유지
  const movieProvider = new MovieProvider(import.meta.env.VITE_TMDB_API_KEY);
  const gameProvider = new GameProvider(import.meta.env.VITE_IGDB_CLIENT_ID, import.meta.env.VITE_IGDB_CLIENT_SECRET);
  const animationProvider = new AnimationProvider(import.meta.env.VITE_TMDB_API_KEY);
  const seriesProvider = new SeriesProvider(import.meta.env.VITE_TMDB_API_KEY);
  const bookProvider = new BookProvider(import.meta.env.VITE_SUPABASE_URL);
  const musicProvider = new MusicProvider(import.meta.env.VITE_SUPABASE_URL);

  const isFetching = useRef(false);
  const observer = useRef();



  const lastItemRef = useCallback(node => {
    //if (isFetching.current) return;
    if (observer.current) observer.current.disconnect();
    observer.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting&& !isFetching.current) setPage(prev => prev + 1);
    });
    if (node) observer.current.observe(node);
  }, []);

  const fetchItems = async (query, targetPage, category) => { // 💡 매개변수 category 사용!
  if (isFetching.current) return;
  isFetching.current = true;
  
  try {
    let results = [];
    
    // 💡 1. 각 카테고리별 데이터 가져오기 (BookProvider 호출은 일단 주석처리 하세요!)
    if (category === 'movie') results = await movieProvider.search(query, targetPage);
    else if (category === 'game') results = await gameProvider.search(query, targetPage);
    else if (category === 'animation') results = await animationProvider.search(query, targetPage);
    else if (category === 'series') results = await seriesProvider.search(query, targetPage);
    else if (category === 'book') results = await bookProvider.search(query, targetPage);
    else if (category === 'music') results = await musicProvider.search(query, targetPage);

    // 💡 2. 데이터 병합 및 중복 제거
    setItems(prev => {
      const allItems = targetPage === 1 ? results : [...prev, ...results];
      const uniqueMap = new Map();
      
      // 💡 [수정] activeCategory 대신 파라미터 category를 사용!
      if (category === 'game') {
        // 게임은 제목이 겹치는 경우가 많으니 title을 키로 사용
        allItems.forEach(m => { if(m.title) uniqueMap.set(m.title, m); });
      } else {
        // 나머지는 ID를 키로 사용
        allItems.forEach(m => { if(m.id) uniqueMap.set(String(m.id), m); });
      }
      return Array.from(uniqueMap.values());
    });

    if (results.length > 0 && results.length < 19 && targetPage < 10) {
      setTimeout(() => setPage(prev => prev + 1), 500);
    }

  } catch (error) {
    console.error("검색 실패 원인:", error); // 💡 여기서 어떤 에러인지 콘솔을 확인하세요!
  } finally {
    if (targetPage === 1) setLoading(false);
    isFetching.current = false;
  }
};

  useEffect(() => {
    if (searchQuery) fetchItems(searchQuery, page, activeCategory); 
  }, [page, searchQuery, activeCategory]); 

  const handleSearch = (e) => {
    if (e.key === 'Enter' && inputValue.trim() !== '') {
      navigate(`/${activeCategory}/search/${encodeURIComponent(inputValue.trim())}`)
    }
  };

  const goHome = () => {
    setItems([]); 
    setSearchQuery('');
    setInputValue('');
    navigate('/'); 
  };

  const handleGenreClick = (genre) => { 
    setActiveCategory(genre);
    setItems([]); 
    setSearchQuery('');
    setInputValue('');
    navigate(`/${genre}`); 
  };

  // Auth 및 세션 로직 (이름 변경 불필요)
  const handleGoogleLogin = async () => {
    try { await accountService.signInWithGoogle(); } 
    catch (err) { console.error("로그인 실패:", err.message); }
  };

  const handleLogout = async () => {
    try {
      await accountService.signOut();
      setUser(null);
    } catch (err) { console.error("로그아웃 실패:", err.message); }
  };


  useEffect(() => {
    accountService.getUser().then(u => setUser(u));
    const subscription = accountService.subscribeAuth((currentUser) => {
      setUser(currentUser);
      if (currentUser) setAuthModalType(null); 
    });
    return () => subscription?.unsubscribe();
  }, []);

  return (
    <div className="App" style={{ minHeight: '100vh' }}>
      <TopAuthBar 
        user={user} 
        onLogin={() => setAuthModalType('login')} 
        onLogout={handleLogout} 
        onMyPageClick={() => setAuthModalType('profile')}
        onSignup={() => setAuthModalType('signup')}
      />

      {authModalType && (
        <AuthModal 
          type={authModalType} 
          user={user} 
          onClose={() => setAuthModalType(null)} 
          onGoogleLogin={handleGoogleLogin} 
          onLogout={handleLogout}
        />
      )}

      <Navbar onLogoClick={goHome} onGenreClick={handleGenreClick}/>
      
      <section style={{ 
        padding: '20px 40px 0px 40px', 
        display: 'flex',
        justifyContent: 'flex-end',  
        alignItems: 'center',
        height: '60px',
        boxSizing: 'border-box'
      }}>
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