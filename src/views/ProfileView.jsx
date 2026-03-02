import React, { useEffect, useState } from 'react';
import dataBridge from '../services/DataBridge';
import ActivityRow from '../components/ProfileActivityRow'; // 💡 컴포넌트 불러오기
import '../styles/profileView.css';

export default function ProfileView({ user, onLogout }) {
  const [activities, setActivities] = useState({});
  const [loading, setLoading] = useState(false);

  const categories = ['movie', 'drama', 'anime', 'game', 'music', 'book'];

  useEffect(() => {
    if (user) {
      const fetchAll = async () => {
        setLoading(true);
        const results = {};
        try {
          await Promise.all(
            categories.map(async (cat) => {
              const data = await dataBridge.getMyAllReviews(user.id, cat);
              results[cat] = data;
            })
          );
          setActivities(results);
        } catch (err) {
          console.error("활동 내역 로드 실패:", err);
        } finally {
          setLoading(false);
        }
      };
      fetchAll();
    }
  }, [user]);

  if (!user) return <div className="profile-error">로그인이 필요합니다.</div>;

  return (
    <div className="profile-view-container">
      {/* 상단: 프로필 정보 섹션 */}
      <section className="profile-header-section">
        <div className="profile-user-card">
          <img src={user.user_metadata.avatar_url} alt="profile" className="profile-avatar" />
          <div className="profile-user-text">
            <h1>{user.user_metadata.full_name} 님</h1>
            <p>{user.email}</p>
            
          </div>
        </div>
        
        {/* 로그아웃 버튼은 디자인에서 제외하기로 결정 */}
        {/*<button className="profile-logout-btn" onClick={onLogout}>로그아웃</button>*/}
      </section>

      {/* 하단: 활동 내역 섹션 */}
      <section className="profile-content-section">
        <h2 className="content-title">나의 활동 기록</h2>
        {loading ? (
          <div className="loading">기록을 불러오는 중...</div>
        ) : (
          <div className="activity-rows-wrapper">
            {categories.map((cat) => (
              <ActivityRow
                key={cat} 
                title={cat} 
                items={activities[cat]} 
              />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}