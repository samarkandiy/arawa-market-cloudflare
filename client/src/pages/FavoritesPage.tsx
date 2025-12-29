import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getVehicle } from '../api/vehicles';
import { getCategories } from '../api/categories';
import { Vehicle, Category } from '../api/types';
import { useFavorites } from '../hooks/useFavorites';
import { usePageMeta } from '../hooks/usePageMeta';
import { useViewMode } from '../hooks/useViewMode';
import VehicleCard from '../components/VehicleCard';
import CategoryIcon from '../components/CategoryIcon';
import LoadingSpinner from '../components/LoadingSpinner';
import './FavoritesPage.css';

const FavoritesPage: React.FC = () => {
  usePageMeta({
    title: 'お気に入り車両 | 株式会社アラワ - 中古トラック販売',
    description: 'お気に入りに登録した中古トラック一覧。気になる車両を保存して比較検討できます。株式会社アラワ。'
  });

  const { favorites } = useFavorites();
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useViewMode();

  useEffect(() => {
    const fetchData = async () => {
      // Fetch categories
      try {
        const categoriesData = await getCategories();
        setCategories(categoriesData);
      } catch (error) {
        console.error('Failed to fetch categories:', error);
      }

      // Fetch favorites
      if (favorites.length === 0) {
        setVehicles([]);
        setLoading(false);
        return;
      }

      setLoading(true);
      try {
        const vehiclePromises = favorites.map(id => 
          getVehicle(id).catch(err => {
            console.error(`Failed to fetch vehicle ${id}:`, err);
            return null;
          })
        );
        const vehiclesData = await Promise.all(vehiclePromises);
        setVehicles(vehiclesData.filter(v => v !== null) as Vehicle[]);
      } catch (error) {
        console.error('Failed to fetch favorites:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [favorites]); // Re-fetch when favorites change

  if (loading) {
    return (
      <div className="favorites-page">
        <div className="container">
          <h1>お気に入り</h1>
          <LoadingSpinner />
        </div>
      </div>
    );
  }

  return (
    <div className="favorites-page">
      <div className="container">
        <div className="favorites-header">
          <div className="header-content">
            <div>
              <h1>お気に入り</h1>
              <p className="favorites-count">{favorites.length}台の車両</p>
            </div>
            {vehicles.length > 0 && (
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
            )}
          </div>
        </div>

        {vehicles.length === 0 ? (
          <div className="empty-favorites">
            <p>お気に入りに登録された車両はありません。</p>
            <Link to="/search" className="browse-link">
              在庫を見る
            </Link>
          </div>
        ) : (
          <>
            {viewMode === 'list' && (
              <div className="list-view-header">
                <div className="header-col-image">画像</div>
                <div className="header-col-name">車両名</div>
                <div className="header-col-year">年式</div>
                <div className="header-col-mileage">走行距離</div>
                <div className="header-col-engine">エンジン</div>
                <div className="header-col-condition">状態</div>
                <div className="header-col-price">価格</div>
                <div className="header-col-favorite"></div>
              </div>
            )}
            <div className={`favorites-container ${viewMode === 'list' ? 'list-view' : 'grid-view'}`}>
              {vehicles.map((vehicle) => (
                <VehicleCard key={vehicle.id} vehicle={vehicle} viewMode={viewMode} />
              ))}
            </div>
          </>
        )}

        {/* Categories Section */}
        <div className="categories-section">
          <h2>カテゴリーから探す</h2>
          <p className="categories-section-subtitle">他の車両もチェックしてみませんか？</p>
          <div className="categories-grid">
            {categories.map((category) => (
              <Link
                key={category.id}
                to={`/category/${category.slug}`}
                className="category-card"
              >
                <CategoryIcon 
                  category={category.slug} 
                  icon={category.icon}
                  className="category-icon"
                />
                <div className="category-name">{category.nameJa}</div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default FavoritesPage;
