import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import apiClient from '../api/client';
import { Page } from '../api/types';
import './Footer.css';

const Footer: React.FC = () => {
  const [pages, setPages] = useState<Page[]>([]);

  useEffect(() => {
    fetchPages();
  }, []);

  const fetchPages = async () => {
    try {
      const response = await apiClient.get('/pages');
      // Filter only published pages
      const publishedPages = response.data.filter((page: Page) => page.isPublished);
      setPages(publishedPages);
    } catch (error) {
      console.error('Failed to fetch pages:', error);
    }
  };

  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-content">
          <div className="footer-section">
            <img src="/arawa-logo-light.png" alt="株式会社アラワ" className="footer-logo" />
            <h3>株式会社アラワ</h3>
            <p>中古トラック販売</p>
          </div>
          
          {pages.length > 0 && (
            <div className="footer-section">
              <h4>ページ</h4>
              <ul className="footer-links">
                {pages.map(page => (
                  <li key={page.id}>
                    <Link to={`/page/${page.slug}`}>{page.titleJa}</Link>
                  </li>
                ))}
              </ul>
            </div>
          )}
          
          <div className="footer-section">
            <h4>川崎本社</h4>
            <p>〒210-0834</p>
            <p>神奈川県川崎市川崎区大島上町21-14</p>
            <p>TEL: 0078-6042-4011</p>
            <p>FAX: 044-742-8463</p>
          </div>
          <div className="footer-section">
            <h4>土浦営業所</h4>
            <p>〒300-0024</p>
            <p>茨城県土浦市右籾1250</p>
            <p>TEL: 080-2392-5197</p>
          </div>
          <div className="footer-section">
            <h4>営業時間</h4>
            <p>月~土 9:00 ~ 18:00</p>
            <p className="license">古物商許可証: 第401150001296号/茨城県公安委員会</p>
          </div>
        </div>
        <div className="footer-bottom">
          <p>
            &copy; 2025 株式会社アラワ All rights reserved. | Designed by <a href="http://novateg.com/" target="_blank" rel="noopener noreferrer">Novateg</a>
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
