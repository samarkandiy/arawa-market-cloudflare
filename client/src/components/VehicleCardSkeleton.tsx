import React from 'react';
import './VehicleCardSkeleton.css';

interface VehicleCardSkeletonProps {
  count?: number;
}

const VehicleCardSkeleton: React.FC<VehicleCardSkeletonProps> = ({ count = 6 }) => {
  return (
    <>
      {[...Array(count)].map((_, index) => (
        <div key={index} className="vehicle-card-skeleton">
          <div className="skeleton-image"></div>
          <div className="skeleton-info">
            <div className="skeleton-title"></div>
            <div className="skeleton-details">
              <div className="skeleton-text short"></div>
              <div className="skeleton-text short"></div>
            </div>
            <div className="skeleton-price"></div>
          </div>
        </div>
      ))}
    </>
  );
};

export default VehicleCardSkeleton;
