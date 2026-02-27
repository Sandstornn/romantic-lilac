// src/components/AuthModal.jsx

// 💡 1. onLogout 프롭스를 추가합니다.
export default function AuthModal({ type, user, onClose, onGoogleLogin, onLogout }) {
  // 바깥쪽 어두운 배경 클릭 시 닫기
  const handleOverlayClick = (e) => {
    if (e.target.className === 'modal-overlay') onClose();
  };

  return (
    <div className="modal-overlay" onClick={handleOverlayClick}>
      <div className="modal-content">
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
          <div className="auth-form profile-view">
            <h2>내 정보</h2>
            {user ? (
              <div className="user-profile">
                <img src={user.user_metadata.avatar_url} alt="profile" className="profile-img" />
                <p><strong>이름:</strong> {user.user_metadata.full_name}</p>
                <p><strong>이메일:</strong> {user.email}</p>
                
                {/* 💡 2. 로그아웃 버튼을 추가합니다. 로그아웃 후 모달도 닫히도록 onClose를 같이 실행합니다. */}
                <button 
                  className="modal-logout-btn" 
                  onClick={() => { onLogout(); onClose(); }}
                >
                  로그아웃
                </button>
              </div>
            ) : (
              <p>로그인이 필요한 서비스입니다.</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}