import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { getVehicles } from '../api/vehicles';
import { getCategories } from '../api/categories';
import { Vehicle, Category } from '../api/types';
import VehicleCard from '../components/VehicleCard';
import VehicleCardCompact from '../components/VehicleCardCompact';
import CategoryNav from '../components/CategoryNav';
import { usePageMeta } from '../hooks/usePageMeta';
import { useViewMode } from '../hooks/useViewMode';
import './CategoryPage.css';

const CategoryPage: React.FC = () => {
  const { categorySlug } = useParams<{ categorySlug: string }>();
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [filteredVehicles, setFilteredVehicles] = useState<Vehicle[]>([]);
  const [category, setCategory] = useState<Category | null>(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [viewMode, setViewMode] = useViewMode();
  const [searchQuery, setSearchQuery] = useState('');
  const [shouldScroll, setShouldScroll] = useState(false);
  const pageSize = 12;

  usePageMeta({
    title: category 
      ? `${category.nameJa}の中古トラック一覧 | 株式会社アラワ` 
      : 'カテゴリー別中古トラック | 株式会社アラワ',
    description: category
      ? `${category.nameJa}の中古トラック${totalCount}台を掲載中。神奈川・茨城で信頼と実績の株式会社アラワ。`
      : '中古トラックをカテゴリー別に検索。ダンプ、クレーン、冷凍車など豊富な在庫から選べます。'
  });

  useEffect(() => {
    // Reset page to 1 when category changes
    setPage(1);
  }, [categorySlug]);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // Fetch categories to get the category name
        const categories = await getCategories();
        const currentCategory = categories.find((c) => c.slug === categorySlug);
        setCategory(currentCategory || null);

        // Fetch vehicles for this category
        const data = await getVehicles({
          category: categorySlug,
          page,
          pageSize,
        });
        setVehicles(data.vehicles);
        setFilteredVehicles(data.vehicles);
        setTotalCount(data.totalCount);
      } catch (error) {
        console.error('Failed to fetch data:', error);
      } finally {
        setLoading(false);
        // Scroll after data is loaded
        if (shouldScroll) {
          window.scrollTo({ top: 0, behavior: 'smooth' });
          setShouldScroll(false);
        }
      }
    };

    fetchData();
  }, [categorySlug, page, shouldScroll]);

  // Filter vehicles based on search query
  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredVehicles(vehicles);
      return;
    }

    const query = searchQuery.toLowerCase();
    const filtered = vehicles.filter((vehicle) => {
      return (
        vehicle.make.toLowerCase().includes(query) ||
        vehicle.model.toLowerCase().includes(query) ||
        vehicle.year.toString().includes(query) ||
        vehicle.engineType.toLowerCase().includes(query) ||
        vehicle.condition.toLowerCase().includes(query) ||
        (vehicle.descriptionJa && vehicle.descriptionJa.toLowerCase().includes(query))
      );
    });
    setFilteredVehicles(filtered);
  }, [searchQuery, vehicles]);

  const totalPages = Math.ceil(totalCount / pageSize);

  return (
    <div className="category-page">
      <CategoryNav />
      <div className="container">
        <div className="category-header">
          <div className="header-content">
            <div>
              <h1>{category?.nameJa || 'カテゴリー'}</h1>
              <p className="vehicle-count">
                {searchQuery ? `${filteredVehicles.length}台の車両（${totalCount}台中）` : `${totalCount}台の車両`}
              </p>
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

        <div className="search-filter">
          <input
            type="text"
            placeholder="車両を検索... (メーカー、モデル、年式、エンジンなど)"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="search-input"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="clear-search"
              title="クリア"
            >
              ✕
            </button>
          )}
        </div>

        {loading ? (
          <p>読み込み中...</p>
        ) : filteredVehicles.length === 0 ? (
          <p className="no-results">
            {searchQuery ? '検索条件に一致する車両がありません。' : 'このカテゴリーには車両がありません。'}
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
                filteredVehicles.map((vehicle) => (
                  <VehicleCardCompact key={vehicle.id} vehicle={vehicle} />
                ))
              ) : (
                filteredVehicles.map((vehicle) => (
                  <VehicleCard key={vehicle.id} vehicle={vehicle} viewMode={viewMode} />
                ))
              )}
            </div>

            {totalPages > 1 && (
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
  );
};

export default CategoryPage;
