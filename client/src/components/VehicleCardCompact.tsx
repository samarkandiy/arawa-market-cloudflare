import React from 'react';
import ViewTransitionLink from './ViewTransitionLink';
import { Vehicle } from '../api/types';
import { formatPrice } from '../utils/formatters';
import OptimizedImage from './OptimizedImage';
import './VehicleCardCompact.css';

interface VehicleCardCompactProps {
  vehicle: Vehicle;
}

const VehicleCardCompact: React.FC<VehicleCardCompactProps> = ({ vehicle }) => {
  const primaryImage = vehicle.images?.[0];
  const imageUrl = primaryImage ? primaryImage.thumbnailUrl : '/placeholder.jpg';

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'sold':
        return '売約済';
      case 'reserved':
        return '商談中';
      default:
        return null;
    }
  };

  const statusLabel = getStatusLabel(vehicle.status);

  return (
    <ViewTransitionLink to={`/vehicle/${vehicle.id}`} className="vehicle-card-compact">
      <div className="col-image">
        <OptimizedImage 
          src={imageUrl} 
          alt={`${vehicle.make} ${vehicle.model}`}
        />
        {statusLabel && <span className={`status-badge ${vehicle.status}`}>{statusLabel}</span>}
      </div>
      <div className="col-name">
        <strong>{vehicle.make} {vehicle.model}</strong>
      </div>
      <div className="col-year">{vehicle.year}年</div>
      <div className="col-condition">{vehicle.condition}</div>
      <div className="col-price">{formatPrice(vehicle.price)}</div>
    </ViewTransitionLink>
  );
};

export default VehicleCardCompact;
