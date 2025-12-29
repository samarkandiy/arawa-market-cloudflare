import React, { useState, useEffect } from 'react';
import './StatsBar.css';

const StatsBar: React.FC = () => {
  const [liveVisitors, setLiveVisitors] = useState(0);
  const [soldThisMonth, setSoldThisMonth] = useState(0);

  useEffect(() => {
    // Simulate live visitors (random between 8-25)
    const updateVisitors = () => {
      const baseVisitors = 12;
      const variance = Math.floor(Math.random() * 13) - 6; // -6 to +6
      setLiveVisitors(Math.max(3, baseVisitors + variance));
    };

    // Initial update
    updateVisitors();

    // Update every 15-30 seconds
    const interval = setInterval(() => {
      updateVisitors();
    }, (15 + Math.random() * 15) * 1000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    // Simulate sold this month (realistic number)
    const currentMonth = new Date().getMonth();
    const baseSold = 18;
    const monthVariance = currentMonth % 3; // Varies by month
    setSoldThisMonth(baseSold + monthVariance * 3);
  }, []);

  return (
    <div className="stats-bar">
      <div className="container">
        <div className="stats-content">
          <div className="stat-item">
            <div className="stat-icon live">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                <circle cx="12" cy="12" r="10"/>
              </svg>
              <span className="pulse-dot"></span>
            </div>
            <div className="stat-text">
              <span className="stat-value">{liveVisitors}人</span>
              <span className="stat-label">が閲覧中</span>
            </div>
          </div>

          <div className="stat-divider"></div>

          <div className="stat-item">
            <div className="stat-icon sold">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="20 6 9 17 4 12"/>
              </svg>
            </div>
            <div className="stat-text">
              <span className="stat-value">{soldThisMonth}台</span>
              <span className="stat-label">今月販売済み</span>
            </div>
          </div>

          <div className="stat-divider"></div>

          <div className="stat-item">
            <div className="stat-icon rating">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
              </svg>
            </div>
            <div className="stat-text">
              <span className="stat-value">4.9/5.0</span>
              <span className="stat-label">お客様評価</span>
            </div>
          </div>

          <div className="stat-divider"></div>

          <div className="stat-item">
            <div className="stat-icon experience">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="8" r="7"/>
                <polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88"/>
              </svg>
            </div>
            <div className="stat-text">
              <span className="stat-value">15年以上</span>
              <span className="stat-label">の実績</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StatsBar;
