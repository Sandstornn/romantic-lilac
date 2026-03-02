import React from 'react';
import '../styles/activityRow.css';

export default function ProfileActivityRow({ title, items }) {
  return (
    <div className="activity-row">
      <h3 className="row-title">{title.toUpperCase()}</h3>
      <div className="row-scroll-container">
        {items && items.length > 0 ? (
          items.map((item) => (
            <div key={item.id} className="activity-card">
              <div className="card-rating">⭐ {item.rating}</div>
              <p className="card-comment">{item.comment}</p>
              <span className="card-date">
                {new Date(item.created_at).toLocaleDateString()}
              </span>
            </div>
          ))
        ) : (
          <div className="empty-card">아직 남긴 기록이 없어요.</div>
        )}
      </div>
    </div>
  );
}