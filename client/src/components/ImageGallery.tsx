import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { VehicleImage } from '../api/types';
import './ImageGallery.css';

interface ImageGalleryProps {
  images: VehicleImage[];
}

const ImageGallery: React.FC<ImageGalleryProps> = ({ images }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [touchStart, setTouchStart] = useState(0);
  const [touchEnd, setTouchEnd] = useState(0);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const imageRef = useRef<HTMLDivElement>(null);
  const thumbnailsRef = useRef<HTMLDivElement>(null);

  // Auto-scroll thumbnails to show active thumbnail
  useEffect(() => {
    if (isLightboxOpen && thumbnailsRef.current) {
      const activeThumb = thumbnailsRef.current.querySelector('.lightbox-thumbnail.active') as HTMLElement;
      if (activeThumb) {
        activeThumb.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
      }
    }
  }, [currentIndex, isLightboxOpen]);

  if (!images || images.length === 0) {
    return (
      <div className="image-gallery">
        <div className="no-image">画像がありません</div>
      </div>
    );
  }

  const currentImage = images[currentIndex];

  const handlePrevious = () => {
    setCurrentIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
  };

  // Touch handlers for swipe gestures
  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStart(e.targetTouches[0].clientX);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    
    const distance = touchStart - touchEnd;
    const minSwipeDistance = 50; // Minimum distance for a swipe
    
    if (Math.abs(distance) < minSwipeDistance) return;
    
    if (distance > 0) {
      // Swiped left - next image
      handleNext();
    } else {
      // Swiped right - previous image
      handlePrevious();
    }
    
    // Reset values
    setTouchStart(0);
    setTouchEnd(0);
  };

  const openLightbox = () => {
    setIsLightboxOpen(true);
    document.body.style.overflow = 'hidden';
  };

  const closeLightbox = () => {
    setIsLightboxOpen(false);
    document.body.style.overflow = '';
  };

  // Close lightbox on Escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isLightboxOpen) {
        closeLightbox();
      }
    };

    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [isLightboxOpen]);

  return (
    <>
      <div className="image-gallery">
        <div 
          className="main-image"
          ref={imageRef}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          onClick={openLightbox}
          style={{ cursor: 'pointer' }}
        >
          <img 
            src={currentImage.url} 
            alt={`車両画像 ${currentIndex + 1}`}
            loading="eager"
            draggable={false}
          />
          
          {/* Fullscreen icon indicator */}
          <button className="fullscreen-icon" onClick={openLightbox} aria-label="フルスクリーンで表示">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3" />
            </svg>
          </button>
          
          {images.length > 1 && (
            <>
              <button 
                className="nav-button prev" 
                onClick={(e) => { e.stopPropagation(); handlePrevious(); }} 
                aria-label="前の画像"
              >
                ‹
              </button>
              <button 
                className="nav-button next" 
                onClick={(e) => { e.stopPropagation(); handleNext(); }} 
                aria-label="次の画像"
              >
                ›
              </button>
            </>
          )}
        </div>

      {images.length > 1 && (
        <div className="thumbnail-list">
          {images.map((image, index) => (
            <button
              key={image.id}
              className={`thumbnail ${index === currentIndex ? 'active' : ''}`}
              onClick={() => setCurrentIndex(index)}
              aria-label={`画像 ${index + 1}を表示`}
            >
              <img 
                src={image.thumbnailUrl} 
                alt={`サムネイル ${index + 1}`}
                loading="lazy"
                draggable={false}
              />
            </button>
          ))}
        </div>
      )}

      <div className="image-counter">
        {currentIndex + 1} / {images.length}
      </div>
    </div>

    {/* Lightbox - rendered in portal to bypass z-index stacking contexts */}
    {isLightboxOpen && createPortal(
      <div className="lightbox-overlay" onClick={closeLightbox}>
        <button className="lightbox-close" onClick={closeLightbox} aria-label="閉じる">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>
        
        {images.length > 1 && (
          <>
            <button 
              className="lightbox-nav-button prev" 
              onClick={(e) => { e.stopPropagation(); handlePrevious(); }} 
              aria-label="前の画像"
            >
              ‹
            </button>
            <button 
              className="lightbox-nav-button next" 
              onClick={(e) => { e.stopPropagation(); handleNext(); }} 
              aria-label="次の画像"
            >
              ›
            </button>
          </>
        )}
        
        <div className="lightbox-content" onClick={(e) => e.stopPropagation()}>
          <img 
            src={currentImage.url} 
            alt={`車両画像 ${currentIndex + 1}`}
            draggable={false}
          />
          
          {images.length > 1 && (
            <>
              {/* Thumbnails */}
              <div className="lightbox-thumbnails" ref={thumbnailsRef}>
                {images.map((image, index) => (
                  <button
                    key={image.id}
                    className={`lightbox-thumbnail ${index === currentIndex ? 'active' : ''}`}
                    onClick={() => setCurrentIndex(index)}
                    aria-label={`画像 ${index + 1}を表示`}
                  >
                    <img 
                      src={image.thumbnailUrl} 
                      alt={`サムネイル ${index + 1}`}
                      draggable={false}
                    />
                  </button>
                ))}
              </div>
            </>
          )}
          
          <div className="lightbox-counter">
            {currentIndex + 1} / {images.length}
          </div>
        </div>
      </div>,
      document.body
    )}
    </>
  );
};

export default ImageGallery;
