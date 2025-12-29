import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import apiClient from '../../api/client';
import { authApi } from '../../api/auth';
import { getCategories } from '../../api/categories';
import { Category } from '../../api/types';
import { usePageMeta } from '../../hooks/usePageMeta';
import './VehicleFormPage.css';

interface VehicleFormData {
  category: string;
  make: string;
  model: string;
  year: number;
  mileage: number;
  price: number;
  engineType: string;
  length: number;
  width: number;
  height: number;
  condition: string;
  features: string;
  descriptionJa: string;
  descriptionEn: string;
  registrationDocument?: string;
  status: 'available' | 'reserved' | 'sold';
}

const VehicleFormPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isEdit = !!id;

  usePageMeta({
    title: isEdit ? '車両編集 - CMS | 株式会社アラワ' : '車両追加 - CMS | 株式会社アラワ',
    description: isEdit ? '中古トラック情報の編集' : '新しい中古トラックの登録'
  });

  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [uploadingPdf, setUploadingPdf] = useState(false);
  
  const [formData, setFormData] = useState<VehicleFormData>({
    category: '',
    make: '',
    model: '',
    year: new Date().getFullYear(),
    mileage: 0,
    price: 0,
    engineType: '',
    length: 0,
    width: 0,
    height: 0,
    condition: '',
    features: '',
    descriptionJa: '',
    descriptionEn: '',
    status: 'available',
  });

  useEffect(() => {
    loadCategories();
    if (isEdit) {
      loadVehicle();
    }
  }, [id]);

  const loadCategories = async () => {
    try {
      const cats = await getCategories();
      setCategories(cats);
    } catch (err) {
      console.error('Failed to load categories', err);
    }
  };

  const loadVehicle = async () => {
    try {
      const token = authApi.getToken();
      const response = await apiClient.get(`/vehicles/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const vehicle = response.data;
      
      setFormData({
        category: vehicle.category,
        make: vehicle.make,
        model: vehicle.model,
        year: vehicle.year,
        mileage: vehicle.mileage,
        price: vehicle.price,
        engineType: vehicle.engineType || '',
        length: vehicle.length || 0,
        width: vehicle.width || 0,
        height: vehicle.height || 0,
        condition: vehicle.condition || '',
        features: vehicle.features?.join(', ') || '',
        descriptionJa: vehicle.descriptionJa || '',
        descriptionEn: vehicle.descriptionEn || '',
        registrationDocument: vehicle.registrationDocument || '',
        status: vehicle.status || 'available',
      });
    } catch (err: any) {
      setError('Failed to load vehicle');
      console.error(err);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const token = authApi.getToken();
      
      // Upload PDF if selected
      let pdfUrl = formData.registrationDocument;
      if (pdfFile) {
        pdfUrl = await uploadPdf();
      }
      
      const payload = {
        category: formData.category,
        make: formData.make,
        model: formData.model,
        year: formData.year,
        mileage: formData.mileage,
        price: formData.price,
        engineType: formData.engineType,
        dimensions: {
          length: formData.length,
          width: formData.width,
          height: formData.height
        },
        condition: formData.condition,
        features: formData.features.split(',').map(f => f.trim()).filter(f => f),
        descriptionJa: formData.descriptionJa,
        descriptionEn: formData.descriptionEn,
        registrationDocument: pdfUrl,
        status: formData.status
      };

      if (isEdit) {
        await apiClient.put(`/vehicles/${id}`, payload, {
          headers: { Authorization: `Bearer ${token}` }
        });
      } else {
        await apiClient.post('/vehicles', payload, {
          headers: { Authorization: `Bearer ${token}` }
        });
      }

      navigate('/cms/vehicles');
    } catch (err: any) {
      setError(err.response?.data?.error?.message || 'Failed to save vehicle');
    } finally {
      setLoading(false);
    }
  };

  const uploadPdf = async (): Promise<string> => {
    if (!pdfFile) return '';
    
    setUploadingPdf(true);
    try {
      const token = authApi.getToken();
      const formData = new FormData();
      formData.append('document', pdfFile);
      
      const response = await apiClient.post('/documents/upload', formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        }
      });
      
      return response.data.url;
    } catch (err) {
      console.error('Failed to upload PDF:', err);
      throw new Error('Failed to upload registration document');
    } finally {
      setUploadingPdf(false);
    }
  };

  const handlePdfChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.type !== 'application/pdf') {
        setError('Please select a PDF file');
        return;
      }
      if (file.size > 10 * 1024 * 1024) { // 10MB limit
        setError('PDF file size must be less than 10MB');
        return;
      }
      setPdfFile(file);
      setError('');
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: ['year', 'mileage', 'price', 'length', 'width', 'height'].includes(name)
        ? Number(value)
        : value
    }));
  };

  return (
    <div className="vehicle-form-page">
      <h1>{isEdit ? 'Edit Vehicle' : 'Add New Vehicle'}</h1>

      {error && <div className="error-message">{error}</div>}

      <form onSubmit={handleSubmit} className="vehicle-form">
        <div className="form-section">
          <h2>Basic Information</h2>
          
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="category">Category *</label>
              <select
                id="category"
                name="category"
                value={formData.category}
                onChange={handleChange}
                required
              >
                <option value="">Select Category</option>
                {categories.map(cat => (
                  <option key={cat.id} value={cat.slug}>
                    {cat.nameEn}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="condition">Condition *</label>
              <input
                type="text"
                id="condition"
                name="condition"
                value={formData.condition}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="status">Status *</label>
              <select
                id="status"
                name="status"
                value={formData.status}
                onChange={handleChange}
                required
              >
                <option value="available">Available (販売中)</option>
                <option value="reserved">Reserved (商談中)</option>
                <option value="sold">Sold (売約済)</option>
              </select>
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="make">Make *</label>
              <input
                type="text"
                id="make"
                name="make"
                value={formData.make}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="model">Model *</label>
              <input
                type="text"
                id="model"
                name="model"
                value={formData.model}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="year">Year *</label>
              <input
                type="number"
                id="year"
                name="year"
                value={formData.year}
                onChange={handleChange}
                min="1990"
                max={new Date().getFullYear() + 1}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="mileage">Mileage (km) *</label>
              <input
                type="number"
                id="mileage"
                name="mileage"
                value={formData.mileage}
                onChange={handleChange}
                min="0"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="price">Price (¥) *</label>
              <input
                type="number"
                id="price"
                name="price"
                value={formData.price}
                onChange={handleChange}
                min="1"
                required
              />
            </div>
          </div>
        </div>

        <div className="form-section">
          <h2>Technical Specifications</h2>
          
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="engineType">Engine Type</label>
              <input
                type="text"
                id="engineType"
                name="engineType"
                value={formData.engineType}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="length">Length (m)</label>
              <input
                type="number"
                id="length"
                name="length"
                value={formData.length}
                onChange={handleChange}
                step="0.01"
                min="0"
              />
            </div>

            <div className="form-group">
              <label htmlFor="width">Width (m)</label>
              <input
                type="number"
                id="width"
                name="width"
                value={formData.width}
                onChange={handleChange}
                step="0.01"
                min="0"
              />
            </div>

            <div className="form-group">
              <label htmlFor="height">Height (m)</label>
              <input
                type="number"
                id="height"
                name="height"
                value={formData.height}
                onChange={handleChange}
                step="0.01"
                min="0"
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="features">Features (comma-separated)</label>
            <input
              type="text"
              id="features"
              name="features"
              value={formData.features}
              onChange={handleChange}
              placeholder="e.g., Air conditioning, Power steering, ABS"
            />
          </div>

          <div className="form-group">
            <label htmlFor="registrationDocument">Registration Document (車検証) - PDF</label>
            <input
              type="file"
              id="registrationDocument"
              accept=".pdf"
              onChange={handlePdfChange}
              disabled={uploadingPdf}
            />
            {formData.registrationDocument && (
              <div className="current-document">
                <span>Current: </span>
                <a href={formData.registrationDocument} target="_blank" rel="noopener noreferrer">
                  View Document
                </a>
              </div>
            )}
            {pdfFile && (
              <div className="selected-file">
                Selected: {pdfFile.name}
              </div>
            )}
            {uploadingPdf && <div className="uploading">Uploading PDF...</div>}
          </div>
        </div>

        <div className="form-section">
          <h2>Descriptions</h2>
          
          <div className="form-group">
            <label htmlFor="descriptionJa">Description (Japanese) *</label>
            <textarea
              id="descriptionJa"
              name="descriptionJa"
              value={formData.descriptionJa}
              onChange={handleChange}
              rows={5}
              required
            />
          </div>
        </div>

        <div className="form-actions">
          <button type="submit" className="btn-submit" disabled={loading}>
            {loading ? 'Saving...' : (isEdit ? 'Update Vehicle' : 'Create Vehicle')}
          </button>
          <button
            type="button"
            className="btn-cancel"
            onClick={() => navigate('/cms/vehicles')}
            disabled={loading}
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};

export default VehicleFormPage;
