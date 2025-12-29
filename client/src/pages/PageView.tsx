import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import apiClient from '../api/client';
import { Page } from '../api/types';
import { sanitizeHtml } from '../utils/sanitize';
import LoadingSpinner from '../components/LoadingSpinner';
import './PageView.css';

const PageView: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const [page, setPage] = useState<Page | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchPage();
  }, [slug]);

  const fetchPage = async () => {
    try {
      const response = await apiClient.get(`/pages/slug/${slug}`);
      setPage(response.data);
    } catch (err: any) {
      setError('Page not found');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="page-view">
        <div className="container">
          <LoadingSpinner />
        </div>
      </div>
    );
  }

  if (error || !page) {
    return (
      <div className="page-view">
        <div className="container">
          <div className="page-error">
            <h1>404</h1>
            <p>ページが見つかりません</p>
            <p className="error-subtitle">Page not found</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="page-view">
      <Helmet>
        <title>{page.titleJa} | 株式会社アラワ</title>
        {page.metaDescriptionJa && (
          <meta name="description" content={page.metaDescriptionJa} />
        )}
        
        {/* Open Graph / Facebook */}
        <meta property="og:type" content="website" />
        <meta property="og:url" content={`https://arawa.co.jp/page/${page.slug}`} />
        <meta property="og:title" content={page.titleJa} />
        {page.metaDescriptionJa && (
          <meta property="og:description" content={page.metaDescriptionJa} />
        )}
        {page.featuredImage && (
          <meta property="og:image" content={`https://arawa.co.jp${page.featuredImage}`} />
        )}
        
        {/* Twitter */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={page.titleJa} />
        {page.metaDescriptionJa && (
          <meta name="twitter:description" content={page.metaDescriptionJa} />
        )}
        {page.featuredImage && (
          <meta name="twitter:image" content={`https://arawa.co.jp${page.featuredImage}`} />
        )}
      </Helmet>

      <div className="container">
        <div className="page-content">
          <h1 className="page-title">{page.titleJa}</h1>
          
          {page.featuredImage && (
            <div className="page-featured-image">
              <img src={page.featuredImage} alt={page.titleJa} />
            </div>
          )}
          
          <div className="page-body" dangerouslySetInnerHTML={{ __html: sanitizeHtml(page.contentJa) }} />
        </div>
      </div>
    </div>
  );
};

export default PageView;
