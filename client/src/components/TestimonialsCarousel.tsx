import React, { useState, useEffect } from 'react';
import './TestimonialsCarousel.css';

interface Testimonial {
  id: number;
  name: string;
  location: string;
  vehicle: string;
  rating: number;
  comment: string;
  date: string;
}

const testimonials: Testimonial[] = [
  {
    id: 1,
    name: '田中 太郎',
    location: '神奈川県',
    vehicle: 'いすゞ エルフ ダンプ',
    rating: 5,
    comment: '丁寧な対応で安心して購入できました。車両の状態も説明通りで大変満足しています。アフターサービスも充実していて、また利用したいと思います。',
    date: '2024年12月'
  },
  {
    id: 2,
    name: '佐藤 健一',
    location: '茨城県',
    vehicle: '日野 レンジャー クレーン付',
    rating: 5,
    comment: '希望の車両を迅速に見つけていただき、価格も納得のいくものでした。スタッフの専門知識が豊富で、細かい質問にも丁寧に答えてくれました。',
    date: '2024年11月'
  },
  {
    id: 3,
    name: '鈴木 誠',
    location: '東京都',
    vehicle: '三菱ふそう キャンター 冷凍車',
    rating: 5,
    comment: '初めてのトラック購入でしたが、親切に説明していただき安心できました。納車後のフォローも手厚く、信頼できる会社です。',
    date: '2024年11月'
  },
  {
    id: 4,
    name: '山田 浩二',
    location: '千葉県',
    vehicle: 'UDトラックス コンドル 平ボディ',
    rating: 5,
    comment: '品質の良い中古トラックを適正価格で購入できました。整備もしっかりされており、すぐに業務に使えて助かりました。おすすめです！',
    date: '2024年10月'
  },
  {
    id: 5,
    name: '高橋 明',
    location: '埼玉県',
    vehicle: 'いすゞ ギガ ダンプ',
    rating: 5,
    comment: '大型ダンプを探していましたが、希望通りの車両を紹介してもらえました。価格交渉にも柔軟に対応していただき感謝しています。',
    date: '2024年10月'
  }
];

const TestimonialsCarousel: React.FC = () => {
  const [currentPage, setCurrentPage] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const [itemsPerPage, setItemsPerPage] = useState(2);

  useEffect(() => {
    const handleResize = () => {
      setItemsPerPage(window.innerWidth <= 768 ? 1 : 2);
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const totalPages = Math.ceil(testimonials.length / itemsPerPage);

  useEffect(() => {
    if (!isAutoPlaying) return;

    const interval = setInterval(() => {
      setCurrentPage((prev) => (prev + 1) % totalPages);
    }, 5000);

    return () => clearInterval(interval);
  }, [isAutoPlaying, totalPages]);

  const goToSlide = (pageIndex: number) => {
    setCurrentPage(pageIndex);
    setIsAutoPlaying(false);
  };

  const goToPrevious = () => {
    setCurrentPage((prev) => (prev - 1 + totalPages) % totalPages);
    setIsAutoPlaying(false);
  };

  const goToNext = () => {
    setCurrentPage((prev) => (prev + 1) % totalPages);
    setIsAutoPlaying(false);
  };

  const renderStars = (rating: number) => {
    return (
      <div className="testimonial-stars">
        {[...Array(5)].map((_, index) => (
          <svg
            key={index}
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill={index < rating ? '#ffc107' : '#e0e0e0'}
            stroke={index < rating ? '#ffc107' : '#e0e0e0'}
            strokeWidth="1"
          >
            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
          </svg>
        ))}
      </div>
    );
  };

  const startIndex = currentPage * itemsPerPage;
  const visibleTestimonials = testimonials.slice(startIndex, startIndex + itemsPerPage);

  return (
    <div className="testimonials-carousel">
      <div className="container">
        <div className="testimonials-header">
          <h2>お客様の声</h2>
          <p className="testimonials-subtitle">実際にご購入いただいたお客様からの評価</p>
        </div>

        <div className="testimonials-container">
          <button className="carousel-button prev" onClick={goToPrevious} aria-label="前へ">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="15 18 9 12 15 6" />
            </svg>
          </button>

          <div className="testimonials-track">
            {visibleTestimonials.map((testimonial) => (
              <div key={testimonial.id} className="testimonial-card active">
                <div className="testimonial-content">
                  <div className="testimonial-header">
                    <div className="testimonial-avatar">
                      <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                        <circle cx="12" cy="7" r="4" />
                      </svg>
                    </div>
                    <div className="testimonial-info">
                      <h3 className="testimonial-name">{testimonial.name}</h3>
                      <p className="testimonial-location">{testimonial.location}</p>
                    </div>
                    {renderStars(testimonial.rating)}
                  </div>

                  <p className="testimonial-comment">"{testimonial.comment}"</p>

                  <div className="testimonial-footer">
                    <div className="testimonial-vehicle">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <rect x="1" y="3" width="15" height="13" />
                        <polygon points="16 8 20 8 23 11 23 16 16 16 16 8" />
                        <circle cx="5.5" cy="18.5" r="2.5" />
                        <circle cx="18.5" cy="18.5" r="2.5" />
                      </svg>
                      <span>{testimonial.vehicle}</span>
                    </div>
                    <span className="testimonial-date">{testimonial.date}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <button className="carousel-button next" onClick={goToNext} aria-label="次へ">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="9 18 15 12 9 6" />
            </svg>
          </button>
        </div>

        <div className="carousel-dots">
          {[...Array(totalPages)].map((_, index) => (
            <button
              key={index}
              className={`dot ${currentPage === index ? 'active' : ''}`}
              onClick={() => goToSlide(index)}
              aria-label={`スライド ${index + 1}`}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default TestimonialsCarousel;
