import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getVehicle, getRelatedVehicles } from '../api/vehicles';
import { getCategories } from '../api/categories';
import { Vehicle, Category } from '../api/types';
import { formatPrice, formatMileage, formatYear } from '../utils/formatters';
import { sanitizeSvg } from '../utils/sanitize';
import { useFavorites } from '../hooks/useFavorites';
import { usePageMeta } from '../hooks/usePageMeta';
import ImageGallery from '../components/ImageGallery';
import InquiryForm from '../components/InquiryForm';
import LoadingSpinner from '../components/LoadingSpinner';
import VehicleCard from '../components/VehicleCard';
import ShareButton from '../components/ShareButton';
import './VehicleDetailPage.css';

const VehicleDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [vehicle, setVehicle] = useState<Vehicle | null>(null);
  const [relatedVehicles, setRelatedVehicles] = useState<Vehicle[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { isFavorite, toggleFavorite } = useFavorites();

  usePageMeta({
    title: vehicle 
      ? `${vehicle.year}年 ${vehicle.make} ${vehicle.model} - ${formatPrice(vehicle.price)} | 株式会社アラワ`
      : '中古トラック詳細 | 株式会社アラワ',
    description: vehicle
      ? `${vehicle.year}年式 ${vehicle.make} ${vehicle.model}。${vehicle.engineType}、走行距離${formatMileage(vehicle.mileage)}。${formatPrice(vehicle.price)}で販売中。神奈川・茨城の中古トラック専門店。`
      : '中古トラックの詳細情報。株式会社アラワは神奈川県川崎市の中古トラック販売専門店です。'
  });

  useEffect(() => {
    const fetchData = async () => {
      if (!id) return;

      setLoading(true);
      try {
        const [vehicleData, categoriesData] = await Promise.all([
          getVehicle(parseInt(id, 10)),
          getCategories()
        ]);
        setVehicle(vehicleData);
        setCategories(categoriesData);

        // Fetch related vehicles
        const related = await getRelatedVehicles(parseInt(id, 10), 4);
        setRelatedVehicles(related);
      } catch (err) {
        console.error('Failed to fetch data:', err);
        setError('車両情報の読み込みに失敗しました。');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  const scrollToInquiry = () => {
    const inquirySection = document.getElementById('inquiry-section');
    if (inquirySection) {
      inquirySection.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'sold':
        return '売約済';
      case 'reserved':
        return '商談中';
      default:
        return null; // Don't show badge for available
    }
  };

  const favorite = vehicle ? isFavorite(vehicle.id) : false;

  const handleFavoriteClick = () => {
    if (vehicle) {
      toggleFavorite(vehicle.id);
    }
  };

  const HeartIcon = ({ filled }: { filled: boolean }) => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill={filled ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2">
      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
    </svg>
  );

  if (loading) {
    return (
      <div className="container">
        <LoadingSpinner />
      </div>
    );
  }

  if (error || !vehicle) {
    return (
      <div className="container">
        <p className="error">{error || '車両が見つかりませんでした。'}</p>
        <Link to="/" className="back-link">
          ホームに戻る
        </Link>
      </div>
    );
  }

  const categoryName = categories.find(c => c.slug === vehicle.category)?.nameJa || vehicle.category;

  return (
    <div className="vehicle-detail-page">
      <div className="container">
        {/* Breadcrumb Navigation with Back Link */}
        <div className="breadcrumb-container">
          <nav className="breadcrumb">
            <Link to="/">ホーム</Link>
            <span className="separator">›</span>
            <Link to="/">販売在庫</Link>
            <span className="separator">›</span>
            <Link to={`/category/${vehicle.category}`}>{categoryName}</Link>
            <span className="separator">›</span>
            <span className="current">A-{String(vehicle.id).padStart(5, '0')}</span>
          </nav>
          <Link to="/" className="back-link">
            ← 一覧に戻る
          </Link>
        </div>

        {/* Vehicle Header Bar */}
        <div className="vehicle-header-bar">
          <span className="vehicle-id">A-{String(vehicle.id).padStart(5, '0')}</span>
          <span className="divider">|</span>
          <span className="vehicle-year">{formatYear(vehicle.year)}</span>
          <span className="divider">|</span>
          <span className="vehicle-make-model">{vehicle.make} {vehicle.model}</span>
          <span className="divider">|</span>
          <span className="vehicle-engine">{vehicle.engineType}</span>
          <span className="divider">|</span>
          <span className="vehicle-category">{categoryName}</span>
        </div>

        <div className="vehicle-detail">
          <div className="vehicle-title-price-mobile">
            <div className="title-price-content">
              <h1 className="vehicle-title">
                {vehicle.make} {vehicle.model}
              </h1>
              <div className="vehicle-price">{formatPrice(vehicle.price)}</div>
            </div>
            <div className="mobile-action-buttons">
              <ShareButton
                title={`${vehicle.year}年 ${vehicle.make} ${vehicle.model}`}
                text={`${vehicle.year}年 ${vehicle.make} ${vehicle.model} - ${formatPrice(vehicle.price)}`}
                url={window.location.href}
                showLabel={false}
                className="share-button-compact"
              />
              <button
                className={`favorite-button-mobile ${favorite ? 'active' : ''}`}
                onClick={handleFavoriteClick}
                title={favorite ? 'お気に入りから削除' : 'お気に入りに追加'}
              >
                <HeartIcon filled={favorite} />
              </button>
            </div>
          </div>

          <div className="vehicle-gallery-section">
            <ImageGallery images={vehicle.images || []} />
          </div>

          <div className="vehicle-info-section">
            <div className="vehicle-header">
              <div>
                <h1 className="vehicle-title vehicle-title-desktop">
                  {vehicle.make} {vehicle.model}
                </h1>
                {getStatusLabel(vehicle.status) && (
                  <span className={`status-badge-large ${vehicle.status}`}>
                    {getStatusLabel(vehicle.status)}
                  </span>
                )}
              </div>
            </div>

            <div className="vehicle-price-actions-row">
              <div className="vehicle-price vehicle-price-desktop">{formatPrice(vehicle.price)}</div>
              <div className="vehicle-actions">
                <ShareButton
                  title={`${vehicle.year}年 ${vehicle.make} ${vehicle.model}`}
                  text={`${vehicle.year}年 ${vehicle.make} ${vehicle.model} - ${formatPrice(vehicle.price)}`}
                  url={window.location.href}
                  showLabel={true}
                />
                <button
                  className={`favorite-button-large ${favorite ? 'active' : ''}`}
                  onClick={handleFavoriteClick}
                  title={favorite ? 'お気に入りから削除' : 'お気に入りに追加'}
                >
                  <HeartIcon filled={favorite} /> {favorite ? 'お気に入り済み' : 'お気に入りに追加'}
                </button>
              </div>
            </div>

            <button className="inquiry-cta" onClick={scrollToInquiry}>
              この車両について問い合わせる
            </button>

            <div className="vehicle-specs">
              <div className="specs-header">
                <h2>車両仕様</h2>
                {vehicle.registrationDocument && (
                  <a 
                    href={vehicle.registrationDocument} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="registration-doc-button"
                  >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                      <polyline points="14 2 14 8 20 8" />
                      <line x1="16" y1="13" x2="8" y2="13" />
                      <line x1="16" y1="17" x2="8" y2="17" />
                      <polyline points="10 9 9 9 8 9" />
                    </svg>
                    車検証を確認
                  </a>
                )}
              </div>
              <table className="specs-table">
                <tbody>
                  <tr>
                    <th>車両ID</th>
                    <td>A-{String(vehicle.id).padStart(5, '0')}</td>
                  </tr>
                  <tr>
                    <th>メーカー</th>
                    <td>{vehicle.make}</td>
                  </tr>
                  <tr>
                    <th>モデル</th>
                    <td>{vehicle.model}</td>
                  </tr>
                  <tr>
                    <th>年式</th>
                    <td>{formatYear(vehicle.year)}</td>
                  </tr>
                  <tr>
                    <th>走行距離</th>
                    <td>{formatMileage(vehicle.mileage)}</td>
                  </tr>
                  <tr>
                    <th>エンジン</th>
                    <td>{vehicle.engineType}</td>
                  </tr>
                  {vehicle.length && vehicle.width && vehicle.height && (
                    <tr>
                      <th>寸法</th>
                      <td>
                        長さ {vehicle.length}m × 幅 {vehicle.width}m × 高さ{' '}
                        {vehicle.height}m
                      </td>
                    </tr>
                  )}
                  <tr>
                    <th>状態</th>
                    <td>{vehicle.condition}</td>
                  </tr>
                  {vehicle.features && vehicle.features.length > 0 && (
                    <tr>
                      <th>装備</th>
                      <td>{vehicle.features.join('、')}</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {vehicle.descriptionJa && (
              <div className="vehicle-description">
                <h2>詳細説明</h2>
                <p>{vehicle.descriptionJa}</p>
              </div>
            )}
          </div>
        </div>

        <div className="inquiry-section" id="inquiry-section">
          <h2>お問い合わせ</h2>
          <div className="inquiry-content">
            <div className="contact-info">
              <div className="contact-method">
                <h3>お電話でのお問い合わせ</h3>
                <p className="phone-number">
                  <a href="tel:0078-6042-4011">0078-6042-4011</a>
                </p>
                <p className="business-hours">営業時間: 月~土 9:00 ~ 18:00</p>
              </div>
              <div className="contact-method">
                <h3>LINEでのお問い合わせ</h3>
                <button className="line-button">LINEで問い合わせる</button>
              </div>
              
              {/* Trust badges */}
              <div className="inquiry-trust-badges">
                <div className="trust-badge-compact">
                  <div className="badge-icon-compact">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                    </svg>
                  </div>
                  <div className="badge-text-compact">
                    <div className="badge-title-compact">安心の保証</div>
                    <div className="badge-subtitle-compact">充実のアフターサポート</div>
                  </div>
                </div>
                
                <div className="trust-badge-compact">
                  <div className="badge-icon-compact">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                      <polyline points="22 4 12 14.01 9 11.01" />
                    </svg>
                  </div>
                  <div className="badge-text-compact">
                    <div className="badge-title-compact">厳選された在庫</div>
                    <div className="badge-subtitle-compact">品質管理を徹底</div>
                  </div>
                </div>
                
                <div className="trust-badge-compact">
                  <div className="badge-icon-compact">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                    </svg>
                  </div>
                  <div className="badge-text-compact">
                    <div className="badge-title-compact">迅速な対応</div>
                    <div className="badge-subtitle-compact">お問い合わせ当日返信</div>
                  </div>
                </div>
              </div>
            </div>
            <InquiryForm vehicleId={vehicle.id} />
          </div>
        </div>

        {relatedVehicles.length > 0 && (
          <div className="related-vehicles-section">
            <h2>関連車両</h2>
            <p className="section-subtitle">この車両に似た他の車両</p>
            <div className="related-vehicles-grid">
              {relatedVehicles.map((relatedVehicle) => (
                <VehicleCard key={relatedVehicle.id} vehicle={relatedVehicle} />
              ))}
            </div>
          </div>
        )}

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
                {category.icon && (
                  <div className="category-icon" dangerouslySetInnerHTML={{ __html: sanitizeSvg(category.icon) }} />
                )}
                <div className="category-name">{category.nameJa}</div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default VehicleDetailPage;
