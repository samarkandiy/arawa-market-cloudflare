import React from 'react';
import { sanitizeSvg } from '../utils/sanitize';

interface CategoryIconProps {
  category: string;
  icon?: string;
  className?: string;
}

const CategoryIcon: React.FC<CategoryIconProps> = ({ category, icon, className = '' }) => {
  // If custom icon is provided, use it
  if (icon) {
    return <div className={className} dangerouslySetInnerHTML={{ __html: sanitizeSvg(icon) }} />;
  }

  // Otherwise, use default icon based on category
  const getIcon = () => {
    switch (category) {
      case 'flatbed':
        return (
          <svg viewBox="0 0 64 64" fill="currentColor" className={className}>
            <path d="M8 28h40v8H8z"/>
            <rect x="10" y="36" width="4" height="6"/>
            <rect x="42" y="36" width="4" height="6"/>
            <circle cx="14" cy="44" r="4"/>
            <circle cx="44" cy="44" r="4"/>
            <path d="M4 32h4v4H4zM50 28h6v4h-6z"/>
            <rect x="48" y="24" width="8" height="4"/>
          </svg>
        );
      
      case 'dump':
        return (
          <svg viewBox="0 0 64 64" fill="currentColor" className={className}>
            <path d="M10 20l30 0 6 12H10z"/>
            <rect x="10" y="32" width="36" height="4"/>
            <rect x="12" y="36" width="4" height="6"/>
            <rect x="38" y="36" width="4" height="6"/>
            <circle cx="16" cy="44" r="4"/>
            <circle cx="40" cy="44" r="4"/>
            <path d="M4 28h4v4H4zM46 24h6v4h-6z"/>
            <rect x="44" y="20" width="8" height="4"/>
          </svg>
        );
      
      case 'crane':
        return (
          <svg viewBox="0 0 64 64" fill="currentColor" className={className}>
            <path d="M8 28h32v8H8z"/>
            <rect x="10" y="36" width="4" height="6"/>
            <rect x="34" y="36" width="4" height="6"/>
            <circle cx="14" cy="44" r="4"/>
            <circle cx="36" cy="44" r="4"/>
            <path d="M40 12v24h4V12z"/>
            <path d="M44 12h12v4H44z"/>
            <rect x="52" y="16" width="2" height="12"/>
            <circle cx="53" cy="30" r="2"/>
            <path d="M4 32h4v4H4z"/>
          </svg>
        );
      
      case 'van-wing':
        return (
          <svg viewBox="0 0 64 64" fill="currentColor" className={className}>
            <rect x="8" y="20" width="40" height="16" rx="2"/>
            <rect x="10" y="36" width="4" height="6"/>
            <rect x="42" y="36" width="4" height="6"/>
            <circle cx="14" cy="44" r="4"/>
            <circle cx="44" cy="44" r="4"/>
            <path d="M4 28h4v4H4zM48 24h6v4h-6z"/>
            <rect x="46" y="20" width="8" height="4"/>
            <path d="M12 24h8v2h-8zM24 24h8v2h-8zM36 24h8v2h-8z"/>
          </svg>
        );
      
      case 'refrigerated':
        return (
          <svg viewBox="0 0 64 64" fill="currentColor" className={className}>
            <rect x="8" y="18" width="40" height="18" rx="2"/>
            <rect x="10" y="36" width="4" height="6"/>
            <rect x="42" y="36" width="4" height="6"/>
            <circle cx="14" cy="44" r="4"/>
            <circle cx="44" cy="44" r="4"/>
            <path d="M4 28h4v4H4zM48 22h6v4h-6z"/>
            <rect x="46" y="18" width="8" height="4"/>
            <path d="M16 22v10M20 22v10M24 22v10M28 22v10M32 22v10M36 22v10M40 22v10"/>
          </svg>
        );
      
      case 'arm-roll':
        return (
          <svg viewBox="0 0 64 64" fill="currentColor" className={className}>
            <path d="M8 28h28v8H8z"/>
            <rect x="10" y="36" width="4" height="6"/>
            <rect x="30" y="36" width="4" height="6"/>
            <circle cx="14" cy="44" r="4"/>
            <circle cx="32" cy="44" r="4"/>
            <path d="M36 24h12v8H36z"/>
            <path d="M38 20l8 4v4l-8-4z"/>
            <path d="M4 32h4v4H4z"/>
          </svg>
        );
      
      case 'carrier':
        return (
          <svg viewBox="0 0 64 64" fill="currentColor" className={className}>
            <path d="M8 28h32v8H8z"/>
            <rect x="10" y="36" width="4" height="6"/>
            <rect x="34" y="36" width="4" height="6"/>
            <circle cx="14" cy="44" r="4"/>
            <circle cx="36" cy="44" r="4"/>
            <path d="M40 20h8v16h-8z"/>
            <path d="M42 18l4-4 4 4z"/>
            <path d="M4 32h4v4H4z"/>
          </svg>
        );
      
      case 'garbage':
        return (
          <svg viewBox="0 0 64 64" fill="currentColor" className={className}>
            <path d="M8 24h36v12H8z"/>
            <rect x="10" y="36" width="4" height="6"/>
            <rect x="38" y="36" width="4" height="6"/>
            <circle cx="14" cy="44" r="4"/>
            <circle cx="40" cy="44" r="4"/>
            <path d="M44 18v18h4V18z"/>
            <rect x="46" y="14" width="8" height="4"/>
            <path d="M4 30h4v4H4z"/>
            <path d="M12 28h4v2h-4zM20 28h4v2h-4zM28 28h4v2h-4z"/>
          </svg>
        );
      
      case 'mixer':
        return (
          <svg viewBox="0 0 64 64" fill="currentColor" className={className}>
            <path d="M8 28h28v8H8z"/>
            <rect x="10" y="36" width="4" height="6"/>
            <rect x="30" y="36" width="4" height="6"/>
            <circle cx="14" cy="44" r="4"/>
            <circle cx="32" cy="44" r="4"/>
            <ellipse cx="46" cy="26" rx="10" ry="12" transform="rotate(-15 46 26)"/>
            <path d="M4 32h4v4H4z"/>
            <path d="M42 20l2 2M50 20l-2 2M42 32l2-2M50 32l-2-2"/>
          </svg>
        );
      
      case 'tank':
        return (
          <svg viewBox="0 0 64 64" fill="currentColor" className={className}>
            <ellipse cx="28" cy="26" rx="20" ry="10"/>
            <rect x="8" y="26" width="40" height="10"/>
            <rect x="10" y="36" width="4" height="6"/>
            <rect x="42" y="36" width="4" height="6"/>
            <circle cx="14" cy="44" r="4"/>
            <circle cx="44" cy="44" r="4"/>
            <path d="M4 30h4v4H4zM48 24h6v4h-6z"/>
            <rect x="46" y="20" width="8" height="4"/>
          </svg>
        );
      
      case 'aerial':
        return (
          <svg viewBox="0 0 64 64" fill="currentColor" className={className}>
            <path d="M8 28h28v8H8z"/>
            <rect x="10" y="36" width="4" height="6"/>
            <rect x="30" y="36" width="4" height="6"/>
            <circle cx="14" cy="44" r="4"/>
            <circle cx="32" cy="44" r="4"/>
            <path d="M36 32v-20h4v20z"/>
            <rect x="38" y="8" width="8" height="4"/>
            <path d="M42 12v4h8v-4z"/>
            <path d="M4 32h4v4H4z"/>
          </svg>
        );
      
      case 'special':
        return (
          <svg viewBox="0 0 64 64" fill="currentColor" className={className}>
            <path d="M8 24h40v12H8z"/>
            <rect x="10" y="36" width="4" height="6"/>
            <rect x="42" y="36" width="4" height="6"/>
            <circle cx="14" cy="44" r="4"/>
            <circle cx="44" cy="44" r="4"/>
            <path d="M4 30h4v4H4zM48 28h6v4h-6z"/>
            <rect x="46" y="24" width="8" height="4"/>
            <path d="M28 18l4 4 4-4M28 32l4-4 4 4"/>
          </svg>
        );
      
      case 'bus':
        return (
          <svg viewBox="0 0 64 64" fill="currentColor" className={className}>
            <rect x="8" y="16" width="48" height="20" rx="4"/>
            <rect x="12" y="36" width="4" height="6"/>
            <rect x="48" y="36" width="4" height="6"/>
            <circle cx="16" cy="44" r="4"/>
            <circle cx="50" cy="44" r="4"/>
            <path d="M12 20h10v8H12zM26 20h10v8H26zM40 20h10v8H40z"/>
            <rect x="14" y="30" width="36" height="2"/>
          </svg>
        );
      
      case 'other':
      default:
        return (
          <svg viewBox="0 0 64 64" fill="currentColor" className={className}>
            <path d="M8 28h40v8H8z"/>
            <rect x="10" y="36" width="4" height="6"/>
            <rect x="42" y="36" width="4" height="6"/>
            <circle cx="14" cy="44" r="4"/>
            <circle cx="44" cy="44" r="4"/>
            <path d="M4 32h4v4H4zM48 28h6v4h-6z"/>
            <rect x="46" y="24" width="8" height="4"/>
          </svg>
        );
    }
  };

  return getIcon();
};

export default CategoryIcon;
