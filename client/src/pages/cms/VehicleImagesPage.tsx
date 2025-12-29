import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import apiClient from '../../api/client';
import { authApi } from '../../api/auth';
import { VehicleImage } from '../../api/types';
import { usePageMeta } from '../../hooks/usePageMeta';
import './VehicleImagesPage.css';

const VehicleImagesPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);

  usePageMeta({
    title: `車両画像管理 - CMS | 株式会社アラワ`,
    description: '車両の画像をアップロード、管理、並び替えできます。'
  });

  const [images, setImages] = useState<VehicleImage[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [error, setError] = useState('');
  const [dragActive, setDragActive] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<number | null>(null);

  useEffect(() => {
    fetchImages();
  }, [id]);

  const fetchImages = async () => {
    try {
      const token = authApi.getToken();
      const response = await apiClient.get(`/vehicles/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setImages(response.data.images || []);
    } catch (err: any) {
      setError('Failed to load images');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleFileSelect = async (files: FileList | null) => {
    if (!files || files.length === 0) return;

    setUploading(true);
    setError('');
    setUploadProgress(0);

    try {
      const token = authApi.getToken();
      
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const formData = new FormData();
        formData.append('image', file);

        await apiClient.post(`/vehicles/${id}/images`, formData, {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'multipart/form-data',
          },
          onUploadProgress: (progressEvent) => {
            if (progressEvent.total) {
              const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
              setUploadProgress(progress);
            }
          },
        });

        setUploadProgress(Math.round(((i + 1) / files.length) * 100));
      }

      await fetchImages();
    } catch (err: any) {
      setError(err.response?.data?.error?.message || 'Failed to upload images');
    } finally {
      setUploading(false);
      setUploadProgress(0);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFileSelect(e.dataTransfer.files);
    }
  };

  const handleDelete = async (imageId: number) => {
    try {
      const token = authApi.getToken();
      await apiClient.delete(`/images/${imageId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setImages(images.filter(img => img.id !== imageId));
      setDeleteConfirm(null);
    } catch (err: any) {
      alert('Failed to delete image');
      console.error(err);
    }
  };

  const handleReorder = async (imageId: number, direction: 'up' | 'down') => {
    const currentIndex = images.findIndex(img => img.id === imageId);
    if (currentIndex === -1) return;

    const newIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
    if (newIndex < 0 || newIndex >= images.length) return;

    const newImages = [...images];
    [newImages[currentIndex], newImages[newIndex]] = [newImages[newIndex], newImages[currentIndex]];
    
    // Update order values
    newImages.forEach((img, idx) => {
      img.order = idx;
    });

    setImages(newImages);

    // TODO: Implement API call to persist new order
    // This would require a new endpoint to update image order
  };

  if (loading) {
    return (
      <div className="vehicle-images-page">
        <h1>Vehicle Images</h1>
        <p>Loading images...</p>
      </div>
    );
  }

  return (
    <div className="vehicle-images-page">
      <div className="page-header">
        <h1>Vehicle Images</h1>
        <button onClick={() => navigate('/cms/vehicles')} className="btn-back">
          Back to Vehicles
        </button>
      </div>

      {error && <div className="error-message">{error}</div>}

      <div
        className={`upload-zone ${dragActive ? 'drag-active' : ''}`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept="image/jpeg,image/png,image/webp"
          onChange={(e) => handleFileSelect(e.target.files)}
          style={{ display: 'none' }}
        />
        
        <div className="upload-content">
          <div className="upload-icon">📁</div>
          <p className="upload-text">
            {uploading ? 'Uploading...' : 'Drag and drop images here or click to select'}
          </p>
          <p className="upload-hint">
            Supported formats: JPEG, PNG, WebP (Max 10MB per image)
          </p>
          {uploading && (
            <div className="upload-progress">
              <div className="progress-bar">
                <div className="progress-fill" style={{ width: `${uploadProgress}%` }} />
              </div>
              <span className="progress-text">{uploadProgress}%</span>
            </div>
          )}
        </div>
      </div>

      <div className="images-section">
        <h2>Uploaded Images ({images.length})</h2>
        
        {images.length === 0 ? (
          <p className="no-images">No images uploaded yet</p>
        ) : (
          <div className="images-grid">
            {images.map((image, index) => (
              <div key={image.id} className="image-card">
                <div className="image-preview">
                  <img src={image.url} alt={`Vehicle ${index + 1}`} />
                </div>
                
                <div className="image-actions">
                  <div className="reorder-buttons">
                    <button
                      onClick={() => handleReorder(image.id, 'up')}
                      disabled={index === 0}
                      className="btn-reorder"
                      title="Move up"
                    >
                      ↑
                    </button>
                    <span className="image-order">#{index + 1}</span>
                    <button
                      onClick={() => handleReorder(image.id, 'down')}
                      disabled={index === images.length - 1}
                      className="btn-reorder"
                      title="Move down"
                    >
                      ↓
                    </button>
                  </div>
                  
                  {deleteConfirm === image.id ? (
                    <div className="delete-confirm">
                      <button
                        onClick={() => handleDelete(image.id)}
                        className="btn-delete-confirm"
                      >
                        Confirm
                      </button>
                      <button
                        onClick={() => setDeleteConfirm(null)}
                        className="btn-cancel"
                      >
                        Cancel
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => setDeleteConfirm(image.id)}
                      className="btn-delete"
                    >
                      Delete
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default VehicleImagesPage;
