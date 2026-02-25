import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
//import './App.css'
import './styles/index.css';
import Navbar from './components/Navbar';

function App() {
  return (
    <div className="App">
      <Navbar />
      <main>
        {/* 여기에 나중에 영화 리스트가 그리드로 뜰 거야! */}
        <p style={{ textAlign: 'center', marginTop: '50px' }}>
          좋아, 친구! 이제 넷플릭스 스타일의 UI를 채울 차례야.
        </p>
      </main>
    </div>
  );
}
export default App
