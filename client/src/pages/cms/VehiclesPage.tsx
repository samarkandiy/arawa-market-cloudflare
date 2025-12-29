import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import apiClient from '../../api/client';
import { authApi } from '../../api/auth';
import { Vehicle } from '../../api/types';
import { usePageMeta } from '../../hooks/usePageMeta';
import './VehiclesPage.css';

const VehiclesPage: React.FC = () => {
  usePageMeta({
    title: '車両管理 - CMS | 株式会社アラワ',
    description: '中古トラック在庫管理システム。車両の追加、編集、削除が可能です。'
  });

  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [deleteConfirm, setDeleteConfirm] = useState<number | null>(null);

  useEffect(() => {
    fetchVehicles();
  }, []);

  const fetchVehicles = async () => {
    try {
      const token = authApi.getToken();
      const response = await apiClient.get('/vehicles', {
        params: { page: 1, pageSize: 100 },
        headers: { Authorization: `Bearer ${token}` }
      });
      setVehicles(response.data.vehicles || []);
    } catch (err: any) {
      setError('Failed to load vehicles');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    try {
      const token = authApi.getToken();
      await apiClient.delete(`/vehicles/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setVehicles(vehicles.filter(v => v.id !== id));
      setDeleteConfirm(null);
    } catch (err: any) {
      alert('Failed to delete vehicle');
      console.error(err);
    }
  };

  const filteredVehicles = vehicles.filter(vehicle => {
    const matchesSearch = searchTerm === '' || 
      vehicle.make.toLowerCase().includes(searchTerm.toLowerCase()) ||
      vehicle.model.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCategory = categoryFilter === '' || vehicle.category === categoryFilter;
    
    return matchesSearch && matchesCategory;
  });

  if (loading) {
    return (
      <div className="vehicles-page">
        <h1>Vehicles</h1>
        <p>Loading vehicles...</p>
      </div>
    );
  }

  return (
    <div className="vehicles-page">
      <div className="page-header">
        <h1>Vehicle Management</h1>
        <Link to="/cms/vehicles/new" className="btn-primary">
          Add New Vehicle
        </Link>
      </div>

      {error && <div className="error-message">{error}</div>}

      <div className="filters-section">
        <input
          type="text"
          placeholder="Search by make or model..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="search-input"
        />
        
        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className="filter-select"
        >
          <option value="">All Categories</option>
          <option value="flatbed">Flatbed</option>
          <option value="dump">Dump</option>
          <option value="crane">Crane</option>
          <option value="van-wing">Van/Wing</option>
          <option value="refrigerated">Refrigerated</option>
          <option value="arm-roll">Arm Roll/Hook Roll</option>
          <option value="carrier">Carrier/Loader</option>
          <option value="garbage">Garbage Truck</option>
          <option value="mixer">Mixer</option>
          <option value="tank">Tank</option>
          <option value="aerial">Aerial Work Platform</option>
          <option value="special">Special Vehicles</option>
          <option value="bus">Bus</option>
          <option value="other">Base Vehicle/Other</option>
        </select>
      </div>

      <div className="vehicles-table-container">
        <table className="vehicles-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Make</th>
              <th>Model</th>
              <th>Year</th>
              <th>Category</th>
              <th>Price</th>
              <th>Mileage</th>
              <th>Images</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredVehicles.length === 0 ? (
              <tr>
                <td colSpan={9} className="no-results">
                  No vehicles found
                </td>
              </tr>
            ) : (
              filteredVehicles.map(vehicle => (
                <tr key={vehicle.id}>
                  <td>{vehicle.id}</td>
                  <td>{vehicle.make}</td>
                  <td>{vehicle.model}</td>
                  <td>{vehicle.year}</td>
                  <td>{vehicle.category}</td>
                  <td>¥{vehicle.price.toLocaleString()}</td>
                  <td>{vehicle.mileage.toLocaleString()} km</td>
                  <td className="images-cell">
                    <Link to={`/cms/vehicles/${vehicle.id}/images`} className="btn-images">
                      {vehicle.images?.length || 0} Images
                    </Link>
                  </td>
                  <td className="actions-cell">
                    <Link to={`/cms/vehicles/${vehicle.id}/edit`} className="btn-edit">
                      Edit
                    </Link>
                    {deleteConfirm === vehicle.id ? (
                      <div className="delete-confirm">
                        <button
                          onClick={() => handleDelete(vehicle.id)}
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
                        onClick={() => setDeleteConfirm(vehicle.id)}
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

export default VehiclesPage;
