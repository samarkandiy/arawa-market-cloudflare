import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { getVehicles } from '../api/vehicles';
import { getCategories } from '../api/categories';
import { Vehicle, Category } from '../api/types';
import VehicleCard from '../components/VehicleCard';
import VehicleCardSkeleton from '../components/VehicleCardSkeleton';
import CategoryIcon from '../components/CategoryIcon';
import LoadingSpinner from '../components/LoadingSpinner';
import TestimonialsCarousel from '../components/TestimonialsCarousel';
import TrustBadges from '../components/TrustBadges';
import { useToastContext } from '../context/ToastContext';
import { usePageMeta } from '../hooks/usePageMeta';
import './HomePage.css';

const HomePage: React.FC = () => {
  usePageMeta({
    title: '中古トラック販売 | 株式会社アラワ - 信頼と実績の中古トラック専門店',
    description: '神奈川県川崎市の中古トラック販売専門店。ダンプ、クレーン、冷凍車など豊富な在庫。茨城県土浦市にも営業所あり。古物商許可証第401150001296号。'
  });

  const [featuredVehicles, setFeaturedVehicles] = useState<Vehicle[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [minYear, setMinYear] = useState('');
  const [maxYear, setMaxYear] = useState('');
  const toast = useToastContext();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [vehiclesData, categoriesData] = await Promise.all([
          getVehicles({ page: 1, pageSize: 4 }),
          getCategories()
        ]);
        // Ensure we only show 4 vehicles
        setFeaturedVehicles(vehiclesData.vehicles.slice(0, 4));
        setCategories(categoriesData);
      } catch (error) {
        console.error('Failed to fetch data:', error);
        toast.error('データの読み込みに失敗しました');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [toast]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    
    const params = new URLSearchParams();
    
    if (searchQuery.trim()) {
      params.append('q', searchQuery.trim());
    }
    
    if (selectedCategory) {
      params.append('category', selectedCategory);
    }
    
    if (minPrice) {
      params.append('minPrice', minPrice);
    }
    
    if (maxPrice) {
      params.append('maxPrice', maxPrice);
    }
    
    if (minYear) {
      params.append('minYear', minYear);
    }
    
    if (maxYear) {
      params.append('maxYear', maxYear);
    }
    
    navigate(`/search?${params.toString()}`);
  };

  return (
    <div className="home-page">
      <section className="hero">
        <div className="hero-background"></div>
        <div className="hero-overlay"></div>
        <div className="container hero-content-wrapper">
          <div className="hero-text">
            <h1>中古トラック販売</h1>
            <p className="hero-subtitle">信頼と実績の株式会社アラワ</p>
          </div>

          {/* Category Cards */}
          {loading ? (
            <LoadingSpinner size="small" />
          ) : (
            <div className="hero-categories-grid">
              {categories.map((category) => (
                <Link
                  key={category.id}
                  to={`/category/${category.slug}`}
                  className="hero-category-card"
                >
                  <CategoryIcon 
                    category={category.slug} 
                    icon={category.icon}
                    className="hero-category-icon"
                  />
                  <div className="hero-category-name">{category.nameJa}</div>
                </Link>
              ))}
            </div>
          )}

          {/* Search Form */}
          <div className="hero-search-form-container">
            <form onSubmit={handleSearch} className="hero-search-form">
              <div className="hero-search-form-grid">
                {/* Row 1 */}
                <div className="hero-form-field">
                  <input
                    type="text"
                    id="searchQuery"
                    placeholder="キーワード"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="hero-form-input"
                  />
                </div>
                
                <div className="hero-form-field">
                  <select
                    id="category"
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="hero-form-select"
                  >
                    <option value="">カテゴリー</option>
                    {categories.map((category) => (
                      <option key={category.id} value={category.slug}>
                        {category.nameJa}
                      </option>
                    ))}
                  </select>
                </div>
                
                <div className="hero-form-field">
                  <input
                    type="number"
                    id="minPrice"
                    placeholder="価格（最低）"
                    value={minPrice}
                    onChange={(e) => setMinPrice(e.target.value)}
                    className="hero-form-input"
                    min="0"
                  />
                </div>
                
                <div className="hero-form-field">
                  <input
                    type="number"
                    id="maxPrice"
                    placeholder="価格（最高）"
                    value={maxPrice}
                    onChange={(e) => setMaxPrice(e.target.value)}
                    className="hero-form-input"
                    min="0"
                  />
                </div>
                
                {/* Row 2 */}
                <div className="hero-form-field">
                  <input
                    type="number"
                    id="minYear"
                    placeholder="年式（最低）"
                    value={minYear}
                    onChange={(e) => setMinYear(e.target.value)}
                    className="hero-form-input"
                    min="1990"
                    max={new Date().getFullYear() + 1}
                  />
                </div>
                
                <div className="hero-form-field">
                  <input
                    type="number"
                    id="maxYear"
                    placeholder="年式（最高）"
                    value={maxYear}
                    onChange={(e) => setMaxYear(e.target.value)}
                    className="hero-form-input"
                    min="1990"
                    max={new Date().getFullYear() + 1}
                  />
                </div>
                
                <div className="hero-form-field hero-search-button-field">
                  <button type="submit" className="hero-search-submit-button">
                    🔍 検索する
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      </section>

      <section className="trust-section">
        <div className="container">
          <TrustBadges />
        </div>
      </section>

      <section className="featured-vehicles">
        <div className="container">
          <h2>新着車両</h2>
          <div className="vehicle-grid">
            {loading ? (
              <VehicleCardSkeleton count={4} />
            ) : (
              featuredVehicles.map((vehicle) => (
                <VehicleCard key={vehicle.id} vehicle={vehicle} />
              ))
            )}
          </div>
          <div className="view-all">
            <Link to="/search" className="view-all-link">
              すべての在庫を見る →
            </Link>
          </div>
        </div>
      </section>

      <TestimonialsCarousel />

      <section className="company-info">
        <div className="container">
          <h2>会社情報</h2>
          <div className="info-grid">
            <div className="info-card">
              <h3>川崎本社</h3>
              <p>〒210-0834</p>
              <p>神奈川県川崎市川崎区大島上町21-14</p>
              <p>TEL: <a href="tel:0078-6042-4011">0078-6042-4011</a></p>
              <p>FAX: 044-742-8463</p>
            </div>
            <div className="info-card">
              <h3>土浦営業所</h3>
              <p>〒300-0024</p>
              <p>茨城県土浦市右籾1250</p>
              <p>TEL: <a href="tel:080-2392-5197">080-2392-5197</a></p>
            </div>
            <div className="info-card">
              <h3>営業時間</h3>
              <p>月曜日 ~ 土曜日</p>
              <p>9:00 ~ 18:00</p>
              <p className="license-info">古物商許可証</p>
              <p className="license-number">第401150001296号</p>
              <p>茨城県公安委員会</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;
