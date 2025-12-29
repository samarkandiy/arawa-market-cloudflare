import React, { createContext, useContext, useState, useEffect, ReactNode, useRef } from 'react';
import { useToastContext } from './ToastContext';

const FAVORITES_KEY = 'arawa_favorites';

interface FavoritesContextType {
  favorites: number[];
  addFavorite: (vehicleId: number) => void;
  removeFavorite: (vehicleId: number) => void;
  toggleFavorite: (vehicleId: number) => void;
  isFavorite: (vehicleId: number) => boolean;
}

const FavoritesContext = createContext<FavoritesContextType | undefined>(undefined);

export const FavoritesProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [favorites, setFavorites] = useState<number[]>([]);
  const toast = useToastContext();
  const toastRef = useRef(toast);
  
  // Keep toast ref updated
  useEffect(() => {
    toastRef.current = toast;
  }, [toast]);

  useEffect(() => {
    // Load favorites from localStorage on mount
    const stored = localStorage.getItem(FAVORITES_KEY);
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        setFavorites(Array.isArray(parsed) ? parsed : []);
      } catch (error) {
        console.error('Failed to parse favorites:', error);
        setFavorites([]);
      }
    }
  }, []);

  const addFavorite = (vehicleId: number) => {
    setFavorites(prev => {
      if (prev.includes(vehicleId)) {
        return prev;
      }
      const updated = [...prev, vehicleId];
      localStorage.setItem(FAVORITES_KEY, JSON.stringify(updated));
      // Use setTimeout to defer toast to next tick, avoiding render cycle issues
      setTimeout(() => toastRef.current.success('お気に入りに追加しました'), 0);
      return updated;
    });
  };

  const removeFavorite = (vehicleId: number) => {
    setFavorites(prev => {
      const updated = prev.filter(id => id !== vehicleId);
      localStorage.setItem(FAVORITES_KEY, JSON.stringify(updated));
      // Use setTimeout to defer toast to next tick, avoiding render cycle issues
      setTimeout(() => toastRef.current.info('お気に入りから削除しました'), 0);
      return updated;
    });
  };

  const toggleFavorite = (vehicleId: number) => {
    if (favorites.includes(vehicleId)) {
      removeFavorite(vehicleId);
    } else {
      addFavorite(vehicleId);
    }
  };

  const isFavorite = (vehicleId: number) => {
    return favorites.includes(vehicleId);
  };

  return (
    <FavoritesContext.Provider value={{ favorites, addFavorite, removeFavorite, toggleFavorite, isFavorite }}>
      {children}
    </FavoritesContext.Provider>
  );
};

export const useFavoritesContext = () => {
  const context = useContext(FavoritesContext);
  if (context === undefined) {
    throw new Error('useFavoritesContext must be used within a FavoritesProvider');
  }
  return context;
};
