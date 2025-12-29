import React, { useEffect, useState } from 'react';
import apiClient from '../../api/client';
import { authApi } from '../../api/auth';
import LoadingSpinner from '../../components/LoadingSpinner';
import { useToastContext } from '../../context/ToastContext';
import { usePageMeta } from '../../hooks/usePageMeta';
import './InquiriesPage.css';

interface Inquiry {
  id: number;
  vehicleId: number;
  customerName: string;
  customerEmail?: string;
  customerPhone?: string;
  message: string;
  inquiryType: 'phone' | 'email' | 'line';
  status: 'new' | 'contacted' | 'closed';
  createdAt: string;
}

const InquiriesPage: React.FC = () => {
  usePageMeta({
    title: 'お問い合わせ管理 - CMS | 株式会社アラワ',
    description: '顧客からのお問い合わせ管理。車両問い合わせと一般問い合わせの対応状況を管理できます。'
  });

  const [inquiries, setInquiries] = useState<Inquiry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [typeFilter, setTypeFilter] = useState<string>('all'); // 'all', 'vehicle', 'contact'
  const [selectedInquiry, setSelectedInquiry] = useState<Inquiry | null>(null);
  const toast = useToastContext();

  useEffect(() => {
    fetchInquiries();
    
    // Auto-refresh every 30 seconds
    const interval = setInterval(() => {
      fetchInquiries();
    }, 30000);
    
    return () => clearInterval(interval);
  }, []);

  const fetchInquiries = async () => {
    try {
      const token = authApi.getToken();
      const response = await apiClient.get('/inquiries', {
        headers: { Authorization: `Bearer ${token}` }
      });
      // The API returns an array directly
      const data = response.data;
      setInquiries(Array.isArray(data) ? data : []);
      setError('');
    } catch (err: any) {
      setError('Failed to load inquiries');
      if (loading) {
        toast.error('Failed to load inquiries');
      }
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Check if inquiry is a kaitori (buying) request
  const isKaitoriInquiry = (message: string) => {
    return message.includes('【買取査定依頼】');
  };

  const handleStatusUpdate = async (inquiryId: number, newStatus: string) => {
    try {
      const token = authApi.getToken();
      await apiClient.put(
        `/inquiries/${inquiryId}`,
        { status: newStatus },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      setInquiries(inquiries.map(inq => 
        inq.id === inquiryId ? { ...inq, status: newStatus as any } : inq
      ));
      
      if (selectedInquiry?.id === inquiryId) {
        setSelectedInquiry({ ...selectedInquiry, status: newStatus as any });
      }
      
      toast.success('Inquiry status updated successfully');
    } catch (err: any) {
      toast.error('Failed to update inquiry status');
      console.error(err);
    }
  };

  const filteredInquiries = inquiries.filter(inq => {
    // Status filter
    if (statusFilter && inq.status !== statusFilter) return false;
    
    // Type filter
    const isKaitori = isKaitoriInquiry(inq.message);
    if (typeFilter === 'vehicle' && (inq.vehicleId === null || inq.vehicleId === 0)) return false;
    if (typeFilter === 'contact' && ((inq.vehicleId !== null && inq.vehicleId !== 0) || isKaitori)) return false;
    if (typeFilter === 'kaitori' && !isKaitori) return false;
    
    return true;
  });

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case 'new':
        return 'status-badge status-new';
      case 'contacted':
        return 'status-badge status-contacted';
      case 'closed':
        return 'status-badge status-closed';
      default:
        return 'status-badge';
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (loading) {
    return (
      <div className="inquiries-page">
        <h1>Inquiries</h1>
        <LoadingSpinner message="Loading inquiries..." />
      </div>
    );
  }

  return (
    <div className="inquiries-page">
      <div className="page-header">
        <div className="header-left">
          <h1>Customer Inquiries</h1>
          <button 
            onClick={() => fetchInquiries()} 
            className="refresh-button"
            title="Refresh inquiries"
          >
            🔄 Refresh
          </button>
        </div>
        <div className="stats">
          <span className="stat">
            Total: <strong>{inquiries.length}</strong>
          </span>
          <span className="stat">
            New: <strong>{inquiries.filter(i => i.status === 'new').length}</strong>
          </span>
          <span className="stat">
            Vehicle: <strong>{inquiries.filter(i => i.vehicleId !== null && i.vehicleId !== 0).length}</strong>
          </span>
          <span className="stat">
            Contact: <strong>{inquiries.filter(i => (i.vehicleId === null || i.vehicleId === 0)).length}</strong>
          </span>
        </div>
      </div>

      {error && <div className="error-message">{error}</div>}

      <div className="filters-section">
        <div className="filter-tabs">
          <button
            className={`filter-tab ${typeFilter === 'all' ? 'active' : ''}`}
            onClick={() => setTypeFilter('all')}
          >
            All Inquiries ({inquiries.length})
          </button>
          <button
            className={`filter-tab ${typeFilter === 'vehicle' ? 'active' : ''}`}
            onClick={() => setTypeFilter('vehicle')}
          >
            Vehicle Inquiries ({inquiries.filter(i => i.vehicleId !== null && i.vehicleId !== 0).length})
          </button>
          <button
            className={`filter-tab ${typeFilter === 'contact' ? 'active' : ''}`}
            onClick={() => setTypeFilter('contact')}
          >
            Contact Form ({inquiries.filter(i => (i.vehicleId === null || i.vehicleId === 0) && !isKaitoriInquiry(i.message)).length})
          </button>
          <button
            className={`filter-tab ${typeFilter === 'kaitori' ? 'active' : ''}`}
            onClick={() => setTypeFilter('kaitori')}
          >
            Kaitori (買取) ({inquiries.filter(i => isKaitoriInquiry(i.message)).length})
          </button>
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="filter-select"
        >
          <option value="">All Status</option>
          <option value="new">New</option>
          <option value="contacted">Contacted</option>
          <option value="closed">Closed</option>
        </select>
      </div>

      <div className="inquiries-layout">
        <div className="inquiries-list">
          {filteredInquiries.length === 0 ? (
            <div className="no-inquiries">No inquiries found</div>
          ) : (
            filteredInquiries.map(inquiry => (
              <div
                key={inquiry.id}
                className={`inquiry-item ${selectedInquiry?.id === inquiry.id ? 'selected' : ''} ${isKaitoriInquiry(inquiry.message) ? 'kaitori-inquiry' : ''}`}
                onClick={() => setSelectedInquiry(inquiry)}
              >
                <div className="inquiry-header">
                  <span className="inquiry-name">{inquiry.customerName}</span>
                  <div className="inquiry-badges">
                    {isKaitoriInquiry(inquiry.message) && (
                      <span className="kaitori-badge">買取</span>
                    )}
                    <span className={getStatusBadgeClass(inquiry.status)}>
                      {inquiry.status}
                    </span>
                  </div>
                </div>
                <div className="inquiry-meta">
                  <span>
                    {inquiry.vehicleId !== null && inquiry.vehicleId !== 0 ? (
                      <>Vehicle ID: {inquiry.vehicleId}</>
                    ) : isKaitoriInquiry(inquiry.message) ? (
                      <span className="kaitori-label">Kaitori Request (買取査定)</span>
                    ) : (
                      <span className="contact-badge">General Contact</span>
                    )}
                  </span>
                  <span>{formatDate(inquiry.createdAt)}</span>
                </div>
                <div className="inquiry-preview">
                  {inquiry.message.substring(0, 80)}
                  {inquiry.message.length > 80 ? '...' : ''}
                </div>
              </div>
            ))
          )}
        </div>

        <div className="inquiry-detail">
          {selectedInquiry ? (
            <>
              <div className="detail-header">
                <h2>Inquiry Details</h2>
                <span className={getStatusBadgeClass(selectedInquiry.status)}>
                  {selectedInquiry.status}
                </span>
              </div>

              <div className="detail-section">
                <h3>Customer Information</h3>
                <div className="detail-row">
                  <span className="detail-label">Name:</span>
                  <span className="detail-value">{selectedInquiry.customerName}</span>
                </div>
                {selectedInquiry.customerEmail && (
                  <div className="detail-row">
                    <span className="detail-label">Email:</span>
                    <span className="detail-value">
                      <a href={`mailto:${selectedInquiry.customerEmail}`}>
                        {selectedInquiry.customerEmail}
                      </a>
                    </span>
                  </div>
                )}
                {selectedInquiry.customerPhone && (
                  <div className="detail-row">
                    <span className="detail-label">Phone:</span>
                    <span className="detail-value">
                      <a href={`tel:${selectedInquiry.customerPhone}`}>
                        {selectedInquiry.customerPhone}
                      </a>
                    </span>
                  </div>
                )}
                <div className="detail-row">
                  <span className="detail-label">Contact Method:</span>
                  <span className="detail-value">{selectedInquiry.inquiryType}</span>
                </div>
              </div>

              <div className="detail-section">
                <h3>Inquiry Details</h3>
                <div className="detail-row">
                  <span className="detail-label">Type:</span>
                  <span className="detail-value">
                    {selectedInquiry.vehicleId !== null && selectedInquiry.vehicleId !== 0 ? (
                      <>
                        Vehicle Inquiry (ID:{' '}
                        <a 
                          href={`/vehicle/${selectedInquiry.vehicleId}`} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="vehicle-link"
                        >
                          {selectedInquiry.vehicleId}
                        </a>
                        )
                      </>
                    ) : isKaitoriInquiry(selectedInquiry.message) ? (
                      <span className="kaitori-badge-large">Kaitori Request (買取査定依頼)</span>
                    ) : (
                      <span className="contact-badge">General Contact Form</span>
                    )}
                  </span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">Date:</span>
                  <span className="detail-value">{formatDate(selectedInquiry.createdAt)}</span>
                </div>
              </div>

              <div className="detail-section">
                <h3>Message</h3>
                <div className="message-content">
                  {selectedInquiry.message}
                </div>
              </div>

              <div className="detail-section">
                <h3>Update Status</h3>
                <div className="status-buttons">
                  <button
                    onClick={() => handleStatusUpdate(selectedInquiry.id, 'new')}
                    className={`status-button ${selectedInquiry.status === 'new' ? 'active' : ''}`}
                  >
                    New
                  </button>
                  <button
                    onClick={() => handleStatusUpdate(selectedInquiry.id, 'contacted')}
                    className={`status-button ${selectedInquiry.status === 'contacted' ? 'active' : ''}`}
                  >
                    Contacted
                  </button>
                  <button
                    onClick={() => handleStatusUpdate(selectedInquiry.id, 'closed')}
                    className={`status-button ${selectedInquiry.status === 'closed' ? 'active' : ''}`}
                  >
                    Closed
                  </button>
                </div>
              </div>
            </>
          ) : (
            <div className="no-selection">
              <p>Select an inquiry to view details</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default InquiriesPage;
