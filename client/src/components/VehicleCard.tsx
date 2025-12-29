import React from 'react';
import ViewTransitionLink from './ViewTransitionLink';
import { Vehicle } from '../api/types';
import { formatPrice } from '../utils/formatters';
import { useFavorites } from '../hooks/useFavorites';
import ShareButton from './ShareButton';
import OptimizedImage from './OptimizedImage';
import './VehicleCard.css';

interface VehicleCardProps {
  vehicle: Vehicle;
  viewMode?: 'grid' | 'list';
}

const VehicleCard: React.FC<VehicleCardProps> = ({ vehicle, viewMode = 'grid' }) => {
  const { isFavorite, toggleFavorite } = useFavorites();
  const primaryImage = vehicle.images?.[0];
  const imageUrl = primaryImage ? primaryImage.thumbnailUrl : '/placeholder.jpg';
  const favorite = isFavorite(vehicle.id);

  const handleFavoriteClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    toggleFavorite(vehicle.id);
  };

  const handleShareClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'sold':
        return '売約済';
      case 'reserved':
        return '商談中';
      default:
        return null; // Don't show badge for available
    }
  };

  const statusLabel = getStatusLabel(vehicle.status);

  const HeartIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill={favorite ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2">
      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
    </svg>
  );

  if (viewMode === 'list') {
    return (
      <ViewTransitionLink to={`/vehicle/${vehicle.id}`} className="vehicle-card list-mode">
        <div className="col-image">
          <OptimizedImage 
            src={imageUrl} 
            alt={`${vehicle.make} ${vehicle.model}`}
          />
          {statusLabel && <span className={`status-badge ${vehicle.status}`}>{statusLabel}</span>}
        </div>
        <div className="col-name" data-details={`${vehicle.year}年 • ${vehicle.mileage.toLocaleString('ja-JP')}km`}>
          <strong>{vehicle.make} {vehicle.model}</strong>
        </div>
        <div className="col-year">{vehicle.year}年</div>
        <div className="col-mileage">{vehicle.mileage.toLocaleString('ja-JP')}km</div>
        <div className="col-engine">{vehicle.engineType}</div>
        <div className="col-condition">{vehicle.condition}</div>
        <div className="col-price">{formatPrice(vehicle.price)}</div>
        <button
          className={`favorite-button ${favorite ? 'active' : ''}`}
          onClick={handleFavoriteClick}
          title={favorite ? 'お気に入りから削除' : 'お気に入りに追加'}
        >
          <HeartIcon />
        </button>
      </ViewTransitionLink>
    );
  }

  return (
    <ViewTransitionLink to={`/vehicle/${vehicle.id}`} className="vehicle-card">
      <div className="vehicle-image">
        <OptimizedImage 
          src={imageUrl} 
          alt={`${vehicle.make} ${vehicle.model}`}
        />
        {statusLabel && <span className={`status-badge ${vehicle.status}`}>{statusLabel}</span>}
        <div className="vehicle-card-actions">
          <div onClick={handleShareClick}>
            <ShareButton
              title={`${vehicle.year}年 ${vehicle.make} ${vehicle.model}`}
              text={`${vehicle.year}年 ${vehicle.make} ${vehicle.model} - ${formatPrice(vehicle.price)}`}
              url={`${window.location.origin}/vehicle/${vehicle.id}`}
              showLabel={false}
              className="share-button-card"
            />
          </div>
          <button
            className={`favorite-button ${favorite ? 'active' : ''}`}
            onClick={handleFavoriteClick}
            title={favorite ? 'お気に入りから削除' : 'お気に入りに追加'}
          >
            <HeartIcon />
          </button>
        </div>
      </div>
      <div className="vehicle-info">
        <h3 className="vehicle-title">
          {vehicle.make} {vehicle.model}
        </h3>
        <table className="vehicle-specs-table">
          <tbody>
            <tr className="price-row">
              <th>価格</th>
              <td className="price-cell">{formatPrice(vehicle.price)}</td>
            </tr>
            <tr>
              <th>年式</th>
              <td>{vehicle.year}年</td>
            </tr>
            <tr>
              <th>走行距離</th>
              <td>{vehicle.mileage.toLocaleString('ja-JP')}km</td>
            </tr>
            <tr>
              <th>エンジン</th>
              <td>{vehicle.engineType}</td>
            </tr>
            <tr>
              <th>状態</th>
              <td>{vehicle.condition}</td>
            </tr>
          </tbody>
        </table>
        <button className="view-details-btn">
          詳細を見る
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="9 18 15 12 9 6"></polyline>
          </svg>
        </button>
      </div>
    </ViewTransitionLink>
  );
};

export default VehicleCard;
