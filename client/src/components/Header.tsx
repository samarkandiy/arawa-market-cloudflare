import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import apiClient from '../api/client';
import { Page } from '../api/types';
import { useFavorites } from '../hooks/useFavorites';
import './Header.css';

const Header: React.FC = () => {
  const [navPages, setNavPages] = useState<Page[]>([]);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { favorites } = useFavorites();

  useEffect(() => {
    fetchNavPages();
  }, []);

  const fetchNavPages = async () => {
    try {
      const response = await apiClient.get('/pages');
      const pages = response.data.filter((page: Page) => page.showInNav && page.isPublished);
      setNavPages(pages);
    } catch (error) {
      console.error('Failed to fetch nav pages:', error);
    }
  };

  const closeMobileMenu = () => {
    setMobileMenuOpen(false);
  };

  return (
    <header className="header">
      <div className="container">
        <div className="header-content">
          <Link to="/" className="logo" onClick={closeMobileMenu}>
            <img src="/arawa-logo-light.png" alt="株式会社アラワ" />
          </Link>

          <nav className={`nav ${mobileMenuOpen ? 'mobile-open' : ''}`}>
            <div className="nav-links">
              <Link to="/" onClick={closeMobileMenu}>ホーム</Link>
              {navPages.map(page => (
                <Link key={page.id} to={`/page/${page.slug}`} onClick={closeMobileMenu}>
                  {page.titleJa}
                </Link>
              ))}
              <Link to="/favorites" onClick={closeMobileMenu} className="favorites-link">
                お気に入り {favorites.length > 0 && <span className="favorites-badge">{favorites.length}</span>}
              </Link>
            </div>
            
            <div className="nav-cta-group">
              <Link to="/kaitori" className="nav-cta-primary" onClick={closeMobileMenu}>トラック買取</Link>
              
              <div className="nav-cta-secondary">
                <a href="https://line.me/ti/p/" target="_blank" rel="noopener noreferrer" className="nav-cta-line">
                  LINEで相談をする
                </a>
                <Link to="/contact" className="nav-cta-form" onClick={closeMobileMenu}>
                  フォームお問い合わせ
                </Link>
              </div>
              
              <div className="nav-cta-phone">
                <a href="tel:0078-6042-4011" className="phone-number" onClick={closeMobileMenu}>0078-6042-4011</a>
                <span className="phone-hours">(受付時間) 月~土 9:00 ~ 18:00</span>
              </div>
            </div>
          </nav>

          <button 
            className={`mobile-menu-toggle ${mobileMenuOpen ? 'open' : ''}`}
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle menu"
          >
            <span></span>
            <span></span>
            <span></span>
          </button>

          {mobileMenuOpen && <div className="mobile-overlay" onClick={closeMobileMenu}></div>}
        </div>
      </div>
    </header>
  );
};

export default Header;
