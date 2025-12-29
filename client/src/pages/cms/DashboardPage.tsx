import React, { useEffect, useState } from 'react';
import apiClient from '../../api/client';
import { authApi } from '../../api/auth';
import LoadingSpinner from '../../components/LoadingSpinner';
import { useToastContext } from '../../context/ToastContext';
import { usePageMeta } from '../../hooks/usePageMeta';
import './DashboardPage.css';

interface DashboardStats {
  totalVehicles: number;
  totalInquiries: number;
  newInquiries: number;
}

const DashboardPage: React.FC = () => {
  usePageMeta({
    title: 'ダッシュボード - CMS | 株式会社アラワ',
    description: 'Arawa Inc. 車両管理システムのダッシュボード。'
  });

  const [stats, setStats] = useState<DashboardStats>({
    totalVehicles: 0,
    totalInquiries: 0,
    newInquiries: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const toast = useToastContext();

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const token = authApi.getToken();
      
      // Fetch vehicles count
      const vehiclesResponse = await apiClient.get('/vehicles', {
        params: { page: 1, pageSize: 1 },
        headers: { Authorization: `Bearer ${token}` }
      });
      
      // Fetch inquiries - API returns array directly
      const inquiriesResponse = await apiClient.get('/inquiries', {
        headers: { Authorization: `Bearer ${token}` }
      });

      const inquiries = Array.isArray(inquiriesResponse.data) ? inquiriesResponse.data : [];
      const newInquiries = inquiries.filter((inq: any) => inq.status === 'new').length;

      setStats({
        totalVehicles: vehiclesResponse.data.pagination?.total || 0,
        totalInquiries: inquiries.length,
        newInquiries: newInquiries,
      });
    } catch (err: any) {
      setError('Failed to load dashboard statistics');
      toast.error('Failed to load dashboard statistics');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="dashboard-page">
        <h1>Dashboard</h1>
        <LoadingSpinner message="Loading statistics..." />
      </div>
    );
  }

  if (error) {
    return (
      <div className="dashboard-page">
        <h1>Dashboard</h1>
        <div className="error-message">{error}</div>
      </div>
    );
  }

  return (
    <div className="dashboard-page">
      <h1>Dashboard</h1>
      <p className="dashboard-subtitle">Welcome to the Arawa Vehicle Management System</p>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon">🚚</div>
          <div className="stat-content">
            <h3>Total Vehicles</h3>
            <p className="stat-number">{stats.totalVehicles}</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">📧</div>
          <div className="stat-content">
            <h3>Total Inquiries</h3>
            <p className="stat-number">{stats.totalInquiries}</p>
          </div>
        </div>

        <div className="stat-card highlight">
          <div className="stat-icon">🔔</div>
          <div className="stat-content">
            <h3>New Inquiries</h3>
            <p className="stat-number">{stats.newInquiries}</p>
          </div>
        </div>
      </div>

      <div className="quick-actions">
        <h2>Quick Actions</h2>
        <div className="action-buttons">
          <a href="/cms/vehicles/new" className="action-button">
            Add New Vehicle
          </a>
          <a href="/cms/inquiries" className="action-button secondary">
            View Inquiries
          </a>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
