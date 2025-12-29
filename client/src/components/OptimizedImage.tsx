import React, { useState, useEffect } from 'react';
import './OptimizedImage.css';

interface OptimizedImageProps {
  src: string;
  alt: string;
  className?: string;
  loading?: 'lazy' | 'eager';
}

const OptimizedImage: React.FC<OptimizedImageProps> = ({ 
  src, 
  alt, 
  className = '', 
  loading = 'lazy' 
}) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isInView, setIsInView] = useState(false);

  useEffect(() => {
    if (loading === 'eager') {
      setIsInView(true);
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsInView(true);
            observer.disconnect();
          }
        });
      },
      {
        rootMargin: '50px',
      }
    );

    const element = document.getElementById(`img-${src}`);
    if (element) {
      observer.observe(element);
    }

    return () => {
      observer.disconnect();
    };
  }, [src, loading]);

  return (
    <div id={`img-${src}`} className={`optimized-image-wrapper ${className}`}>
      {!isLoaded && <div className="image-placeholder" />}
      {isInView && (
        <img
          src={src}
          alt={alt}
          className={`optimized-image ${isLoaded ? 'loaded' : 'loading'}`}
          onLoad={() => setIsLoaded(true)}
          loading={loading}
        />
      )}
    </div>
  );
};

export default OptimizedImage;
