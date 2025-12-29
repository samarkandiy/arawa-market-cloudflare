import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { getVehicles, searchVehicles } from '../api/vehicles';
import { getCategories } from '../api/categories';
import { Vehicle, Category } from '../api/types';
import VehicleCard from '../components/VehicleCard';
import VehicleCardCompact from '../components/VehicleCardCompact';
import VehicleCardSkeleton from '../components/VehicleCardSkeleton';
import SearchBar from '../components/SearchBar';
import FilterSidebar from '../components/FilterSidebar';
import { usePageMeta } from '../hooks/usePageMeta';
import { useViewMode } from '../hooks/useViewMode';
import './SearchPage.css';

const SearchPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalCount, setTotalCount] = useState(0);
  const [page, setPage] = useState(1);
  const [viewMode, setViewMode] = useViewMode();
  const [shouldScroll, setShouldScroll] = useState(false);
  const pageSize = 12;

  const query = searchParams.get('q') || '';
  const category = searchParams.get('category') || '';
  const minPrice = searchParams.get('minPrice') || '';
  const maxPrice = searchParams.get('maxPrice') || '';
  const minYear = searchParams.get('minYear') || '';
  const maxYear = searchParams.get('maxYear') || '';

  usePageMeta({
    title: query 
      ? `"${query}"の検索結果 - 中古トラック | 株式会社アラワ`
      : '中古トラック検索 | 株式会社アラワ',
    description: query
      ? `"${query}"の検索結果${totalCount}件。神奈川・茨城の中古トラック専門店、株式会社アラワ。`
      : '中古トラックを条件で検索。価格、年式、カテゴリーから最適な一台を見つけられます。神奈川・茨城の中古トラック専門店。'
  });

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const data = await getCategories();
        setCategories(data);
      } catch (error) {
        console.error('Failed to fetch categories:', error);
      }
    };

    fetchCategories();
  }, []);

  useEffect(() => {
    const fetchVehicles = async () => {
      setLoading(true);
      try {
        if (query) {
          // Search mode
          const results = await searchVehicles(query);
          setVehicles(results);
          setTotalCount(results.length);
        } else {
          // Filter mode
          const filters: any = {
            page,
            pageSize,
          };

          if (category) filters.category = category;
          if (minPrice) filters.minPrice = parseInt(minPrice, 10);
          if (maxPrice) filters.maxPrice = parseInt(maxPrice, 10);
          if (minYear) filters.minYear = parseInt(minYear, 10);
          if (maxYear) filters.maxYear = parseInt(maxYear, 10);

          const data = await getVehicles(filters);
          setVehicles(data.vehicles);
          setTotalCount(data.totalCount);
        }
      } catch (error) {
        console.error('Failed to fetch vehicles:', error);
      } finally {
        setLoading(false);
        // Scroll after data is loaded
        if (shouldScroll) {
          window.scrollTo({ top: 0, behavior: 'smooth' });
          setShouldScroll(false);
        }
      }
    };

    fetchVehicles();
  }, [query, category, minPrice, maxPrice, minYear, maxYear, page, shouldScroll]);

  const handleSearch = (searchQuery: string) => {
    setSearchParams({ q: searchQuery });
    setPage(1);
  };

  const handleFilterChange = (filters: {
    category?: string;
    minPrice?: string;
    maxPrice?: string;
    minYear?: string;
    maxYear?: string;
  }) => {
    const newParams: any = {};
    if (filters.category) newParams.category = filters.category;
    if (filters.minPrice) newParams.minPrice = filters.minPrice;
    if (filters.maxPrice) newParams.maxPrice = filters.maxPrice;
    if (filters.minYear) newParams.minYear = filters.minYear;
    if (filters.maxYear) newParams.maxYear = filters.maxYear;

    setSearchParams(newParams);
    setPage(1);
  };

  const totalPages = Math.ceil(totalCount / pageSize);

  return (
    <div className="search-page">
      <div className="container">
        <SearchBar onSearch={handleSearch} initialQuery={query} />

        <div className="search-content">
          <FilterSidebar
            categories={categories}
            onFilterChange={handleFilterChange}
            initialFilters={{
              category,
              minPrice,
              maxPrice,
              minYear,
              maxYear,
            }}
          />

          <div className="search-results">
            <div className="results-header">
              <div className="header-content">
                <div>
                  <h1>検索結果</h1>
                  <p className="results-count">{totalCount}台の車両が見つかりました</p>
                </div>
                <div className="view-switcher">
                  <button
                    className={`view-button ${viewMode === 'grid' ? 'active' : ''}`}
                    onClick={() => setViewMode('grid')}
                    title="カード表示"
                  >
                    <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
                      <rect x="2" y="2" width="7" height="7" />
                      <rect x="11" y="2" width="7" height="7" />
                      <rect x="2" y="11" width="7" height="7" />
                      <rect x="11" y="11" width="7" height="7" />
                    </svg>
                  </button>
                  <button
                    className={`view-button ${viewMode === 'list' ? 'active' : ''}`}
                    onClick={() => setViewMode('list')}
                    title="リスト表示"
                  >
                    <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
                      <rect x="2" y="3" width="16" height="2" />
                      <rect x="2" y="9" width="16" height="2" />
                      <rect x="2" y="15" width="16" height="2" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>

            {loading ? (
              <div className={`vehicle-container ${viewMode === 'list' ? 'list-view' : 'grid-view'}`}>
                <VehicleCardSkeleton count={12} />
              </div>
            ) : vehicles.length === 0 ? (
              <p className="no-results">
                条件に一致する車両が見つかりませんでした。
              </p>
            ) : (
              <>
                {viewMode === 'list' && (
                  <div className="table-header">
                    <div className="col-image">画像</div>
                    <div className="col-name">車両名</div>
                    <div className="col-year">年式</div>
                    <div className="col-condition">状態</div>
                    <div className="col-price">価格</div>
                  </div>
                )}
                
                <div className={`vehicle-container ${viewMode === 'list' ? 'list-view' : 'grid-view'}`}>
                  {viewMode === 'list' ? (
                    vehicles.map((vehicle) => (
                      <VehicleCardCompact key={vehicle.id} vehicle={vehicle} />
                    ))
                  ) : (
                    vehicles.map((vehicle) => (
                      <VehicleCard key={vehicle.id} vehicle={vehicle} viewMode={viewMode} />
                    ))
                  )}
                </div>

                {!query && totalPages > 1 && (
                  <div className="pagination">
                    <button
                      onClick={() => {
                        setPage(page - 1);
                        setShouldScroll(true);
                      }}
                      disabled={page === 1}
                      className="pagination-button"
                    >
                      前へ
                    </button>
                    <span className="page-info">
                      {page} / {totalPages}
                    </span>
                    <button
                      onClick={() => {
                        setPage(page + 1);
                        setShouldScroll(true);
                      }}
                      disabled={page === totalPages}
                      className="pagination-button"
                    >
                      次へ
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SearchPage;
