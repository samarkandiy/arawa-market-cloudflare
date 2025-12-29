import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import apiClient from '../../api/client';
import { authApi } from '../../api/auth';
import { Page } from '../../api/types';
import { useToastContext } from '../../context/ToastContext';
import { usePageMeta } from '../../hooks/usePageMeta';
import LoadingSpinner from '../../components/LoadingSpinner';
import './PagesPage.css';

const PagesPage: React.FC = () => {
  usePageMeta({
    title: 'ページ管理 - CMS | 株式会社アラワ',
    description: 'Webサイトのページ管理。カスタムページの作成、編集、公開設定が可能です。'
  });

  const [pages, setPages] = useState<Page[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteConfirm, setDeleteConfirm] = useState<number | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'published' | 'draft'>('all');
  const toast = useToastContext();
  const navigate = useNavigate();

  useEffect(() => {
    fetchPages();
  }, []);

  const fetchPages = async () => {
    try {
      const token = authApi.getToken();
      const response = await apiClient.get('/pages/admin', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setPages(response.data);
    } catch (error) {
      console.error('Failed to fetch pages:', error);
      toast.error('Failed to load pages');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    try {
      const token = authApi.getToken();
      await apiClient.delete(`/pages/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setPages(pages.filter(p => p.id !== id));
      setDeleteConfirm(null);
      toast.success('Page deleted successfully');
    } catch (error: any) {
      const message = error.response?.data?.error?.message || 'Failed to delete page';
      toast.error(message);
    }
  };

  const handleToggleNav = async (id: number, showInNav: boolean) => {
    try {
      const token = authApi.getToken();
      const page = pages.find(p => p.id === id);
      if (!page) return;

      await apiClient.put(`/pages/${id}`, {
        ...page,
        showInNav
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setPages(pages.map(p => p.id === id ? { ...p, showInNav } : p));
      toast.success('Navigation setting updated');
    } catch (error: any) {
      const message = error.response?.data?.error?.message || 'Failed to update page';
      toast.error(message);
    }
  };

  const filteredPages = pages.filter(page => {
    const matchesSearch = searchTerm === '' || 
      page.titleJa.toLowerCase().includes(searchTerm.toLowerCase()) ||
      page.slug.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || 
      (statusFilter === 'published' && page.isPublished) ||
      (statusFilter === 'draft' && !page.isPublished);
    
    return matchesSearch && matchesStatus;
  });

  if (loading) {
    return (
      <div className="pages-page">
        <h1>Pages</h1>
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="pages-page">
      <div className="page-header">
        <h1>Page Management</h1>
        <button onClick={() => navigate('/cms/pages/new')} className="btn-primary">
          Add New Page
        </button>
      </div>

      <div className="filters-section">
        <input
          type="text"
          placeholder="Search by title or slug..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="search-input"
        />
        
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as 'all' | 'published' | 'draft')}
          className="filter-select"
        >
          <option value="all">All Status</option>
          <option value="published">Published</option>
          <option value="draft">Draft</option>
        </select>
      </div>

      <div className="pages-table-container">
        <table className="pages-table">
          <thead>
            <tr>
              <th>Slug</th>
              <th>Title</th>
              <th>Status</th>
              <th>Show in Nav</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredPages.length === 0 ? (
              <tr>
                <td colSpan={5} className="no-results">
                  No pages found
                </td>
              </tr>
            ) : (
              filteredPages.map(page => (
                <tr key={page.id}>
                  <td><code>{page.slug}</code></td>
                  <td>{page.titleJa}</td>
                  <td>
                    <span className={`status-badge ${page.isPublished ? 'published' : 'draft'}`}>
                      {page.isPublished ? 'Published' : 'Draft'}
                    </span>
                  </td>
                  <td>
                    <input
                      type="checkbox"
                      checked={page.showInNav}
                      onChange={() => handleToggleNav(page.id, !page.showInNav)}
                      title="Show in navigation"
                    />
                  </td>
                  <td className="actions-cell">
                    <a
                      href={`/page/${page.slug}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn-view"
                      title="View page"
                    >
                      View
                    </a>
                    <button
                      onClick={() => navigate(`/cms/pages/${page.id}/edit`)}
                      className="btn-edit"
                    >
                      Edit
                    </button>
                    {deleteConfirm === page.id ? (
                      <div className="delete-confirm">
                        <button
                          onClick={() => handleDelete(page.id)}
                          className="btn-delete-confirm"
                        >
                          Confirm
                        </button>
                        <button
                          onClick={() => setDeleteConfirm(null)}
                          className="btn-cancel-delete"
                        >
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => setDeleteConfirm(page.id)}
                        className="btn-delete"
                      >
                        Delete
                      </button>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default PagesPage;
