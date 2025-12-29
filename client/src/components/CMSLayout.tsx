import React from 'react';
import { Helmet } from 'react-helmet-async';
import { Outlet, Link, useNavigate } from 'react-router-dom';
import { authApi } from '../api/auth';
import './CMSLayout.css';

const CMSLayout: React.FC = () => {
  const navigate = useNavigate();

  const handleLogout = async () => {
    await authApi.logout();
    navigate('/cms/login');
  };

  return (
    <div className="cms-layout">
      <Helmet>
        <meta name="robots" content="noindex, nofollow" />
      </Helmet>
      
      <header className="cms-header">
        <div className="cms-header-content">
          <div className="cms-logo-section">
            <img src="/arawa-logo-light.png" alt="Arawa Inc." className="cms-logo" />
            <h1>Arawa CMS</h1>
          </div>
          <button onClick={handleLogout} className="logout-button">
            Logout
          </button>
        </div>
      </header>

      <div className="cms-container">
        <nav className="cms-sidebar">
          <ul className="cms-nav">
            <li>
              <Link to="/cms/dashboard" className="cms-nav-link">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="3" y="3" width="7" height="7"/>
                  <rect x="14" y="3" width="7" height="7"/>
                  <rect x="14" y="14" width="7" height="7"/>
                  <rect x="3" y="14" width="7" height="7"/>
                </svg>
                Dashboard
              </Link>
            </li>
            <li>
              <Link to="/cms/vehicles" className="cms-nav-link">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="1" y="3" width="15" height="13"/>
                  <polygon points="16 8 20 8 23 11 23 16 16 16 16 8"/>
                  <circle cx="5.5" cy="18.5" r="2.5"/>
                  <circle cx="18.5" cy="18.5" r="2.5"/>
                </svg>
                Vehicles
              </Link>
            </li>
            <li>
              <Link to="/cms/categories" className="cms-nav-link">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="8" y1="6" x2="21" y2="6"/>
                  <line x1="8" y1="12" x2="21" y2="12"/>
                  <line x1="8" y1="18" x2="21" y2="18"/>
                  <line x1="3" y1="6" x2="3.01" y2="6"/>
                  <line x1="3" y1="12" x2="3.01" y2="12"/>
                  <line x1="3" y1="18" x2="3.01" y2="18"/>
                </svg>
                Categories
              </Link>
            </li>
            <li>
              <Link to="/cms/pages" className="cms-nav-link">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                  <polyline points="14 2 14 8 20 8"/>
                  <line x1="16" y1="13" x2="8" y2="13"/>
                  <line x1="16" y1="17" x2="8" y2="17"/>
                  <polyline points="10 9 9 9 8 9"/>
                </svg>
                Pages
              </Link>
            </li>
            <li>
              <Link to="/cms/inquiries" className="cms-nav-link">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                  <polyline points="22,6 12,13 2,6"/>
                </svg>
                Inquiries
              </Link>
            </li>
          </ul>
        </nav>

        <main className="cms-main">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default CMSLayout;
