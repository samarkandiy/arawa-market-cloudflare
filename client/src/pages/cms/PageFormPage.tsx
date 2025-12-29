import React, { useEffect, useState, useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import ReactQuill from 'react-quill-new';
import 'react-quill-new/dist/quill.snow.css';
import apiClient from '../../api/client';
import { authApi } from '../../api/auth';
import { useToastContext } from '../../context/ToastContext';
import { usePageMeta } from '../../hooks/usePageMeta';
import LoadingSpinner from '../../components/LoadingSpinner';
import './PageFormPage.css';

interface PageFormData {
  slug: string;
  titleJa: string;
  contentJa: string;
  metaDescriptionJa: string;
  featuredImage?: string;
  isPublished: boolean;
  showInNav: boolean;
}

const PageFormPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isEdit = !!id;
  const toast = useToastContext();

  usePageMeta({
    title: isEdit ? 'ページ編集 - CMS | 株式会社アラワ' : 'ページ追加 - CMS | 株式会社アラワ',
    description: isEdit ? 'Webページの編集' : '新しいWebページの作成'
  });

  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [showHtmlEditor, setShowHtmlEditor] = useState(false);
  const [formData, setFormData] = useState<PageFormData>({
    slug: '',
    titleJa: '',
    contentJa: '',
    metaDescriptionJa: '',
    featuredImage: undefined,
    isPublished: true,
    showInNav: false,
  });

  useEffect(() => {
    if (isEdit) {
      loadPage();
    }
  }, [id]);

  const loadPage = async () => {
    setLoading(true);
    try {
      const token = authApi.getToken();
      const response = await apiClient.get(`/pages/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const page = response.data;
      
      setFormData({
        slug: page.slug,
        titleJa: page.titleJa,
        contentJa: page.contentJa,
        metaDescriptionJa: page.metaDescriptionJa || '',
        featuredImage: page.featuredImage,
        isPublished: page.isPublished,
        showInNav: page.showInNav || false,
      });
    } catch (err: any) {
      toast.error('Failed to load page');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const token = authApi.getToken();

      // Exclude featuredImage from form submission - it's handled separately
      const { featuredImage, ...submitData } = formData;

      if (isEdit) {
        await apiClient.put(`/pages/${id}`, submitData, {
          headers: { Authorization: `Bearer ${token}` }
        });
        toast.success('Page updated successfully');
      } else {
        await apiClient.post('/pages', submitData, {
          headers: { Authorization: `Bearer ${token}` }
        });
        toast.success('Page created successfully');
      }

      navigate('/cms/pages');
    } catch (err: any) {
      const message = err.response?.data?.error?.message || 'Failed to save page';
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    }));
  };

  const generateSlug = (text: string) => {
    return text
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
  };

  const handleTitleJaChange = (value: string) => {
    setFormData(prev => ({
      ...prev,
      titleJa: value,
      slug: prev.slug || generateSlug(value)
    }));
  };

  const quillModules = useMemo(() => ({
    toolbar: [
      [{ 'header': [1, 2, 3, false] }],
      ['bold', 'italic', 'underline', 'strike'],
      [{ 'list': 'ordered'}, { 'list': 'bullet' }],
      [{ 'align': [] }],
      ['link', 'image'],
      ['blockquote', 'code-block'],
      [{ 'color': [] }, { 'background': [] }],
      ['clean'],
      ['code'] // Add code view button
    ]
  }), []);

  const quillFormats = useMemo(() => [
    'header',
    'bold', 'italic', 'underline', 'strike',
    'list', 'bullet',
    'align',
    'link', 'image',
    'blockquote', 'code-block',
    'color', 'background'
  ], []);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || !e.target.files[0] || !isEdit) {
      return;
    }

    const file = e.target.files[0];
    
    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file');
      return;
    }

    // Validate file size (10MB)
    if (file.size > 10 * 1024 * 1024) {
      toast.error('Image size must be less than 10MB');
      return;
    }

    setUploading(true);

    try {
      const token = authApi.getToken();
      const formData = new FormData();
      formData.append('image', file);

      const response = await apiClient.post(`/pages/${id}/featured-image`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data',
        },
      });

      setFormData(prev => ({
        ...prev,
        featuredImage: response.data.imageUrl
      }));

      toast.success('Featured image uploaded successfully');
    } catch (err: any) {
      const message = err.response?.data?.error?.message || 'Failed to upload image';
      toast.error(message);
    } finally {
      setUploading(false);
    }
  };

  const handleImageDelete = async () => {
    if (!isEdit || !formData.featuredImage) {
      return;
    }

    if (!window.confirm('Are you sure you want to delete the featured image?')) {
      return;
    }

    setUploading(true);

    try {
      const token = authApi.getToken();
      await apiClient.delete(`/pages/${id}/featured-image`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setFormData(prev => ({
        ...prev,
        featuredImage: undefined
      }));

      toast.success('Featured image deleted successfully');
    } catch (err: any) {
      const message = err.response?.data?.error?.message || 'Failed to delete image';
      toast.error(message);
    } finally {
      setUploading(false);
    }
  };

  if (loading && isEdit) {
    return (
      <div className="page-form-page">
        <h1>Loading...</h1>
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="page-form-page">
      <div className="page-header">
        <h1>{isEdit ? 'Edit Page' : 'Add New Page'}</h1>
      </div>

      <form onSubmit={handleSubmit} className="page-form">
        <div className="form-section">
          <h2>Basic Information</h2>
          
          <div className="form-group">
            <label htmlFor="titleJa">Title *</label>
            <input
              type="text"
              id="titleJa"
              name="titleJa"
              value={formData.titleJa}
              onChange={(e) => handleTitleJaChange(e.target.value)}
              required
              placeholder="e.g., 会社概要"
            />
          </div>

          <div className="form-group">
            <label htmlFor="slug">Slug *</label>
            <input
              type="text"
              id="slug"
              name="slug"
              value={formData.slug}
              onChange={handleChange}
              required
              placeholder="e.g., about"
              pattern="[a-z0-9\-]+"
              title="Only lowercase letters, numbers, and hyphens"
            />
            <small className="form-hint">URL: /page/{formData.slug || 'slug'}</small>
          </div>

          <div className="form-group">
            <label htmlFor="isPublished" className="checkbox-label">
              <input
                type="checkbox"
                id="isPublished"
                name="isPublished"
                checked={formData.isPublished}
                onChange={handleChange}
              />
              <span>Published</span>
            </label>
          </div>

          <div className="form-group">
            <label htmlFor="showInNav" className="checkbox-label">
              <input
                type="checkbox"
                id="showInNav"
                name="showInNav"
                checked={formData.showInNav}
                onChange={handleChange}
              />
              <span>Show in Navigation</span>
            </label>
          </div>
        </div>

        <div className="form-section">
          <h2>Content</h2>
          
          <div className="form-group">
            <div className="editor-header">
              <label htmlFor="contentJa">Content *</label>
              <button
                type="button"
                className="toggle-html-button"
                onClick={() => setShowHtmlEditor(!showHtmlEditor)}
              >
                {showHtmlEditor ? '📝 Visual Editor' : '💻 HTML Editor'}
              </button>
            </div>
            
            {showHtmlEditor ? (
              <textarea
                id="contentJa"
                name="contentJa"
                value={formData.contentJa}
                onChange={(e) => setFormData(prev => ({ ...prev, contentJa: e.target.value }))}
                rows={20}
                className="html-editor"
                placeholder="Enter HTML content..."
              />
            ) : (
              <ReactQuill
                theme="snow"
                value={formData.contentJa}
                onChange={(value) => setFormData(prev => ({ ...prev, contentJa: value }))}
                modules={quillModules}
                formats={quillFormats}
                placeholder="Enter content..."
              />
            )}
          </div>
        </div>

        <div className="form-section">
          <h2>SEO Meta Data</h2>
          
          <div className="form-group">
            <label htmlFor="metaDescriptionJa">Meta Description</label>
            <textarea
              id="metaDescriptionJa"
              name="metaDescriptionJa"
              value={formData.metaDescriptionJa}
              onChange={handleChange}
              rows={3}
              placeholder="Brief description for search engines"
              maxLength={160}
            />
            <small className="form-hint">{formData.metaDescriptionJa.length}/160 characters</small>
          </div>

          <div className="form-group">
            <label>Featured Image / OG Image</label>
            <small className="form-hint" style={{ marginBottom: '10px', display: 'block' }}>
              Recommended size: 1200x630px. Used for social media sharing (Open Graph).
            </small>
            
            {formData.featuredImage ? (
              <div className="featured-image-preview">
                <img src={formData.featuredImage} alt="Featured" />
                <div className="image-actions">
                  <button
                    type="button"
                    onClick={handleImageDelete}
                    disabled={uploading}
                    className="btn-delete-image"
                  >
                    {uploading ? 'Deleting...' : 'Delete Image'}
                  </button>
                </div>
              </div>
            ) : (
              <div className="image-upload-area">
                {isEdit ? (
                  <>
                    <input
                      type="file"
                      id="featuredImage"
                      accept="image/*"
                      onChange={handleImageUpload}
                      disabled={uploading}
                      style={{ display: 'none' }}
                    />
                    <label htmlFor="featuredImage" className="btn-upload-image">
                      {uploading ? 'Uploading...' : 'Upload Image'}
                    </label>
                  </>
                ) : (
                  <p className="upload-hint">Save the page first to upload a featured image</p>
                )}
              </div>
            )}
          </div>
        </div>

        <div className="form-actions">
          <button type="submit" className="btn-submit" disabled={loading}>
            {loading ? 'Saving...' : (isEdit ? 'Update Page' : 'Create Page')}
          </button>
          <button
            type="button"
            className="btn-cancel"
            onClick={() => navigate('/cms/pages')}
            disabled={loading}
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};

export default PageFormPage;
