import { useState, useEffect } from 'react';

type ViewMode = 'grid' | 'list';

const VIEW_MODE_KEY = 'vehicleViewMode';

export const useViewMode = (): [ViewMode, (mode: ViewMode) => void] => {
  const [viewMode, setViewModeState] = useState<ViewMode>(() => {
    const saved = localStorage.getItem(VIEW_MODE_KEY);
    return (saved === 'list' || saved === 'grid') ? saved : 'grid';
  });

  const setViewMode = (mode: ViewMode) => {
    setViewModeState(mode);
    localStorage.setItem(VIEW_MODE_KEY, mode);
  };

  return [viewMode, setViewMode];
};
