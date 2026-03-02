// src/components/AuthModal.jsx

import ProfileView from '../views/ProfileView.jsx';

// 💡 1. onLogout 프롭스를 추가합니다.
export default function AuthModal({ type, user, onClose, onGoogleLogin, onLogout }) {
  // 바깥쪽 어두운 배경 클릭 시 닫기
  const handleOverlayClick = (e) => {
    if (e.target.className === 'modal-overlay') onClose();
  };

  return (
    <div className="modal-overlay" onClick={handleOverlayClick}>
      <div className={`modal-content ${type === 'profile' ? 'profile-modal' : ''}`}>
        <button className="modal-close-btn" onClick={onClose}>&times;</button>
        
        {type === 'login' && (
          <div className="auth-form">
            <h2>로그인</h2>
            <p>Romantic Lilac에 오신 것을 환영합니다.</p>
            <button className="google-login-btn" onClick={onGoogleLogin}>
              Google로 계속하기
            </button>
          </div>
        )}

        {type === 'signup' && (
          <div className="auth-form">
            <h2>회원가입</h2>
            <p>계정을 만들고 평론을 남겨보세요!</p>
            <button className="google-login-btn" onClick={onGoogleLogin}>
              Google 계정으로 가입
            </button>
          </div>
        )}

        {type === 'profile' && (
                        <div className="auth-form profile-modal-container">
                  {/* 💡 기존의 복잡한 HTML 대신 ProfileView 컴포넌트 하나로 해결! */}
                  {user ? (
                    <ProfileView 
                      user={user} 
                      onLogout={() => { onLogout(); onClose(); }} 
                    />
                  ) : (
                    <p>로그인이 필요한 서비스입니다.</p>
                  )}
            
          </div>
        )}
      </div>
    </div>
  );
}