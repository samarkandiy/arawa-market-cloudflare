import React from 'react';
import './TrustBadges.css';

const TrustBadges: React.FC = () => {
  return (
    <div className="trust-badges">
      <div className="trust-badge">
        <div className="badge-icon license">
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
            <polyline points="14 2 14 8 20 8"/>
            <line x1="16" y1="13" x2="8" y2="13"/>
            <line x1="16" y1="17" x2="8" y2="17"/>
            <polyline points="10 9 9 9 8 9"/>
          </svg>
        </div>
        <div className="badge-text">
          <span className="badge-title">古物商許可証</span>
          <span className="badge-subtitle">第401150001296号</span>
        </div>
      </div>

      <div className="trust-badge">
        <div className="badge-icon secure">
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
            <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
          </svg>
        </div>
        <div className="badge-text">
          <span className="badge-title">安心取引</span>
          <span className="badge-subtitle">個人情報保護</span>
        </div>
      </div>

      <div className="trust-badge">
        <div className="badge-icon support">
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
          </svg>
        </div>
        <div className="badge-text">
          <span className="badge-title">充実サポート</span>
          <span className="badge-subtitle">購入後も安心</span>
        </div>
      </div>

      <div className="trust-badge">
        <div className="badge-icon quality">
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="8" r="7"/>
            <polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88"/>
          </svg>
        </div>
        <div className="badge-text">
          <span className="badge-title">品質保証</span>
          <span className="badge-subtitle">厳選された車両</span>
        </div>
      </div>
    </div>
  );
};

export default TrustBadges;
