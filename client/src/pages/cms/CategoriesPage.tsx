import React, { useEffect, useState } from 'react';
import apiClient from '../../api/client';
import { authApi } from '../../api/auth';
import { Category } from '../../api/types';
import { sanitizeSvg } from '../../utils/sanitize';
import { useToastContext } from '../../context/ToastContext';
import { usePageMeta } from '../../hooks/usePageMeta';
import LoadingSpinner from '../../components/LoadingSpinner';
import './CategoriesPage.css';

const CategoriesPage: React.FC = () => {
  usePageMeta({
    title: 'カテゴリー管理 - CMS | 株式会社アラワ',
    description: '車両カテゴリーの管理。カテゴリーの追加、編集、削除が可能です。'
  });

  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<number | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [uploading, setUploading] = useState(false);
  const toast = useToastContext();

  const [formData, setFormData] = useState({
    nameJa: '',
    nameEn: '',
    slug: '',
    icon: ''
  });

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const token = authApi.getToken();
      const response = await apiClient.get('/categories', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setCategories(response.data);
    } catch (error) {
      console.error('Failed to fetch categories:', error);
      toast.error('Failed to load categories');
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = () => {
    setFormData({ nameJa: '', nameEn: '', slug: '', icon: '' });
    setEditingId(null);
    setShowAddForm(true);
  };

  const handleEdit = (category: Category) => {
    setFormData({
      nameJa: category.nameJa,
      nameEn: category.nameEn,
      slug: category.slug,
      icon: category.icon || ''
    });
    setEditingId(category.id);
    setShowAddForm(false);
  };

  const handleCancel = () => {
    setFormData({ nameJa: '', nameEn: '', slug: '', icon: '' });
    setEditingId(null);
    setShowAddForm(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const token = authApi.getToken();

      if (editingId) {
        // Update existing category
        await apiClient.put(`/categories/${editingId}`, formData, {
          headers: { Authorization: `Bearer ${token}` }
        });
        toast.success('Category updated successfully');
      } else {
        // Create new category
        await apiClient.post('/categories', formData, {
          headers: { Authorization: `Bearer ${token}` }
        });
        toast.success('Category created successfully');
      }

      handleCancel();
      fetchCategories();
    } catch (error: any) {
      const message = error.response?.data?.error?.message || 'Failed to save category';
      toast.error(message);
    }
  };

  const handleDelete = async (id: number) => {
    try {
      const token = authApi.getToken();
      await apiClient.delete(`/categories/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setCategories(categories.filter(c => c.id !== id));
      setDeleteConfirm(null);
      toast.success('Category deleted successfully');
    } catch (error: any) {
      const message = error.response?.data?.error?.message || 'Failed to delete category';
      toast.error(message);
    }
  };

  const generateSlug = (text: string) => {
    return text
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
  };

  const handleNameEnChange = (value: string) => {
    setFormData(prev => ({
      ...prev,
      nameEn: value,
      slug: prev.slug || generateSlug(value)
    }));
  };

  const handleIconUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || !e.target.files[0]) return;

    const file = e.target.files[0];
    
    // Validate file extension
    if (!file.name.toLowerCase().endsWith('.svg')) {
      toast.error('Please select an SVG file (.svg extension required)');
      return;
    }

    // Validate file type (more flexible)
    const validTypes = ['image/svg+xml', 'image/svg', 'application/svg+xml', 'text/xml'];
    if (!validTypes.includes(file.type) && !file.name.toLowerCase().endsWith('.svg')) {
      toast.error('Please select a valid SVG file');
      return;
    }

    // Validate file size (1MB)
    if (file.size > 1 * 1024 * 1024) {
      toast.error('SVG file size must be less than 1MB');
      return;
    }

    setUploading(true);

    try {
      const token = authApi.getToken();
      const formDataUpload = new FormData();
      formDataUpload.append('icon', file);

      // If editing, upload to specific category
      if (editingId) {
        const response = await apiClient.post(`/categories/${editingId}/icon`, formDataUpload, {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'multipart/form-data',
          },
        });

        setFormData(prev => ({
          ...prev,
          icon: response.data.iconUrl
        }));

        toast.success('Icon uploaded successfully');
        fetchCategories();
      } else {
        // For new categories, we'll need to save the file temporarily or handle it differently
        // For now, we'll read it as data URL
        const reader = new FileReader();
        reader.onload = (event) => {
          if (event.target?.result) {
            setFormData(prev => ({
              ...prev,
              icon: event.target!.result as string
            }));
          }
        };
        reader.readAsDataURL(file);
        toast.success('Icon selected');
      }
    } catch (err: any) {
      const message = err.response?.data?.error?.message || 'Failed to upload icon';
      toast.error(message);
    } finally {
      setUploading(false);
    }
  };

  const handleIconDelete = async () => {
    if (!editingId || !formData.icon) return;

    if (!window.confirm('Are you sure you want to delete the icon?')) {
      return;
    }

    setUploading(true);

    try {
      const token = authApi.getToken();
      await apiClient.delete(`/categories/${editingId}/icon`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setFormData(prev => ({
        ...prev,
        icon: ''
      }));

      toast.success('Icon deleted successfully');
      fetchCategories();
    } catch (err: any) {
      const message = err.response?.data?.error?.message || 'Failed to delete icon';
      toast.error(message);
    } finally {
      setUploading(false);
    }
  };

  if (loading) {
    return (
      <div className="categories-page">
        <h1>Categories</h1>
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="categories-page">
      <div className="page-header">
        <h1>Category Management</h1>
        <button onClick={handleAdd} className="btn-primary">
          Add New Category
        </button>
      </div>

      {(showAddForm || editingId) && (
        <div className="category-form-card">
          <h2>{editingId ? 'Edit Category' : 'Add New Category'}</h2>
          <form onSubmit={handleSubmit} className="category-form">
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="nameEn">English Name *</label>
                <input
                  type="text"
                  id="nameEn"
                  value={formData.nameEn}
                  onChange={(e) => handleNameEnChange(e.target.value)}
                  required
                  placeholder="e.g., Flatbed"
                />
              </div>

              <div className="form-group">
                <label htmlFor="nameJa">Japanese Name *</label>
                <input
                  type="text"
                  id="nameJa"
                  value={formData.nameJa}
                  onChange={(e) => setFormData(prev => ({ ...prev, nameJa: e.target.value }))}
                  required
                  placeholder="e.g., 平ボディ"
                />
              </div>

              <div className="form-group">
                <label htmlFor="slug">Slug *</label>
                <input
                  type="text"
                  id="slug"
                  value={formData.slug}
                  onChange={(e) => setFormData(prev => ({ ...prev, slug: e.target.value }))}
                  required
                  placeholder="e.g., flatbed"
                  pattern="[a-z0-9-]+"
                  title="Only lowercase letters, numbers, and hyphens"
                />
              </div>
            </div>

            <div className="form-group">
              <label>Category Icon (SVG)</label>
              <small style={{ display: 'block', marginBottom: '10px', color: '#666' }}>
                Upload an SVG icon to display on category cards
              </small>
              
              {formData.icon ? (
                <div className="icon-preview">
                  <div className="icon-display" dangerouslySetInnerHTML={{ __html: formData.icon.startsWith('<svg') ? sanitizeSvg(formData.icon) : '' }} />
                  {!formData.icon.startsWith('<svg') && formData.icon && (
                    <img src={formData.icon} alt="Category icon" style={{ width: '64px', height: '64px' }} />
                  )}
                  <div className="icon-actions">
                    <button
                      type="button"
                      onClick={handleIconDelete}
                      disabled={uploading}
                      className="btn-delete-icon"
                    >
                      {uploading ? 'Deleting...' : 'Delete Icon'}
                    </button>
                  </div>
                </div>
              ) : (
                <div className="icon-upload-area">
                  <input
                    type="file"
                    id="iconUpload"
                    accept="image/svg+xml"
                    onChange={handleIconUpload}
                    disabled={uploading}
                    style={{ display: 'none' }}
                  />
                  <label htmlFor="iconUpload" className="btn-upload-icon">
                    {uploading ? 'Uploading...' : 'Upload SVG Icon'}
                  </label>
                </div>
              )}
            </div>

            <div className="form-actions">
              <button type="submit" className="btn-submit">
                {editingId ? 'Update' : 'Create'}
              </button>
              <button type="button" onClick={handleCancel} className="btn-cancel">
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="categories-table-container">
        <table className="categories-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Icon</th>
              <th>English Name</th>
              <th>Japanese Name</th>
              <th>Slug</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {categories.length === 0 ? (
              <tr>
                <td colSpan={6} className="no-results">
                  No categories found
                </td>
              </tr>
            ) : (
              categories.map(category => (
                <tr key={category.id}>
                  <td>{category.id}</td>
                  <td className="icon-cell">
                    {category.icon ? (
                      <div className="table-icon" dangerouslySetInnerHTML={{ __html: sanitizeSvg(category.icon) }} />
                    ) : (
                      <span className="no-icon">—</span>
                    )}
                  </td>
                  <td>{category.nameEn}</td>
                  <td>{category.nameJa}</td>
                  <td><code>{category.slug}</code></td>
                  <td className="actions-cell">
                    <button
                      onClick={() => handleEdit(category)}
                      className="btn-edit"
                    >
                      Edit
                    </button>
                    {deleteConfirm === category.id ? (
                      <div className="delete-confirm">
                        <button
                          onClick={() => handleDelete(category.id)}
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
                        onClick={() => setDeleteConfirm(category.id)}
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

export default CategoriesPage;
