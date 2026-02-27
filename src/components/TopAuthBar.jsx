// src/components/TopAuthBar.jsx

export default function TopAuthBar({ user, onLogin, onLogout, onMyPageClick, onSignup }) {
  return (
    <div className="top-auth-bar">
      <div className="auth-links-container">
        {user ? (
          <>
            <span className="auth-link" onClick={onLogout} style={{ cursor: 'pointer' }}>로그아웃</span>
            <span className="auth-link" onClick={onMyPageClick} style={{ cursor: 'pointer' }}>내 정보</span>
          </>
        ) : (
          <>
            {/* 💡 2. 이제 이 onSignup은 부모(App.jsx)가 준 함수를 제대로 가리킵니다. */}
            <span className="auth-link" onClick={onSignup} style={{ cursor: 'pointer' }}>회원가입</span>
            <span className="auth-link" onClick={onLogin} style={{ cursor: 'pointer' }}>로그인</span>
          </>
        )}
      </div>
    </div>
  );
}