import React, { useState, useEffect } from 'react';
import { Category } from '../api/types';
import './FilterSidebar.css';

interface FilterSidebarProps {
  categories: Category[];
  onFilterChange: (filters: {
    category?: string;
    minPrice?: string;
    maxPrice?: string;
    minYear?: string;
    maxYear?: string;
  }) => void;
  initialFilters?: {
    category?: string;
    minPrice?: string;
    maxPrice?: string;
    minYear?: string;
    maxYear?: string;
  };
}

const FilterSidebar: React.FC<FilterSidebarProps> = ({
  categories,
  onFilterChange,
  initialFilters = {},
}) => {
  const [filters, setFilters] = useState({
    category: initialFilters.category || '',
    minPrice: initialFilters.minPrice || '',
    maxPrice: initialFilters.maxPrice || '',
    minYear: initialFilters.minYear || '',
    maxYear: initialFilters.maxYear || '',
  });
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    setFilters({
      category: initialFilters.category || '',
      minPrice: initialFilters.minPrice || '',
      maxPrice: initialFilters.maxPrice || '',
      minYear: initialFilters.minYear || '',
      maxYear: initialFilters.maxYear || '',
    });
  }, [initialFilters]);

  const handleChange = (field: string, value: string) => {
    setFilters((prev) => ({ ...prev, [field]: value }));
  };

  const handleApply = () => {
    onFilterChange(filters);
    setIsOpen(false); // Close on mobile after applying
  };

  const handleReset = () => {
    const resetFilters = {
      category: '',
      minPrice: '',
      maxPrice: '',
      minYear: '',
      maxYear: '',
    };
    setFilters(resetFilters);
    onFilterChange(resetFilters);
    setIsOpen(false); // Close on mobile after resetting
  };

  return (
    <div className={`filter-sidebar ${isOpen ? 'open' : ''}`}>
      <div className="filter-header">
        <h3>絞り込み</h3>
        <button 
          className="filter-toggle"
          onClick={() => setIsOpen(!isOpen)}
          aria-label="フィルターを開閉"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            {isOpen ? (
              <polyline points="18 15 12 9 6 15"></polyline>
            ) : (
              <polyline points="6 9 12 15 18 9"></polyline>
            )}
          </svg>
        </button>
      </div>

      <div className="filter-content">
        <div className="filter-group">
          <label>カテゴリー</label>
          <select
            value={filters.category}
            onChange={(e) => handleChange('category', e.target.value)}
          >
            <option value="">すべて</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.slug}>
                {cat.nameJa}
              </option>
            ))}
          </select>
        </div>

        <div className="filter-group">
          <label>価格帯</label>
          <div className="range-inputs">
            <input
              type="number"
              placeholder="最低価格"
              value={filters.minPrice}
              onChange={(e) => handleChange('minPrice', e.target.value)}
            />
            <span>~</span>
            <input
              type="number"
              placeholder="最高価格"
              value={filters.maxPrice}
              onChange={(e) => handleChange('maxPrice', e.target.value)}
            />
          </div>
        </div>

        <div className="filter-group">
          <label>年式</label>
          <div className="range-inputs">
            <input
              type="number"
              placeholder="最低年式"
              value={filters.minYear}
              onChange={(e) => handleChange('minYear', e.target.value)}
            />
            <span>~</span>
            <input
              type="number"
              placeholder="最高年式"
              value={filters.maxYear}
              onChange={(e) => handleChange('maxYear', e.target.value)}
            />
          </div>
        </div>

        <div className="filter-actions">
          <button onClick={handleApply} className="apply-button">
            適用
          </button>
          <button onClick={handleReset} className="reset-button">
            リセット
          </button>
        </div>
      </div>
    </div>
  );
};

export default FilterSidebar;
