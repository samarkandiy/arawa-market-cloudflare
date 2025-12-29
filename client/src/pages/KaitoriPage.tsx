import React, { useState } from 'react';
import { usePageMeta } from '../hooks/usePageMeta';
import { useToastContext } from '../context/ToastContext';
import apiClient from '../api/client';
import './KaitoriPage.css';

const KaitoriPage: React.FC = () => {
  usePageMeta({
    title: 'トラック買取 | 株式会社アラワ - 高価買取実施中',
    description: '中古トラックの高価買取実施中。ダンプ、クレーン、冷凍車など全車種対応。無料査定・即日現金買取可能。神奈川・茨城で信頼の株式会社アラワ。'
  });

  const toast = useToastContext();
  const [formData, setFormData] = useState({
    customerName: '',
    customerPhone: '',
    vehicleInfo: '',
    message: ''
  });
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const inquiryData = {
        vehicleId: 0, // 0 indicates general inquiry
        customerName: formData.customerName,
        customerEmail: undefined,
        customerPhone: formData.customerPhone || undefined,
        message: `【買取査定依頼】\n\n車両情報: ${formData.vehicleInfo}\n\n${formData.message}`,
        inquiryType: 'email' as const
      };

      await apiClient.post('/inquiries', inquiryData);
      
      toast.success('お問い合わせを送信しました。担当者より折り返しご連絡いたします。');
      
      // Reset form
      setFormData({
        customerName: '',
        customerPhone: '',
        vehicleInfo: '',
        message: ''
      });
    } catch (error) {
      console.error('Failed to submit inquiry:', error);
      toast.error('送信に失敗しました。もう一度お試しください。');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="kaitori-page">
      {/* Hero Section with Form */}
      <section className="kaitori-hero">
        <div className="container">
          <div className="hero-content">
            <div className="hero-left">
              <h1>トラック買取</h1>
              <p className="hero-subtitle">高価買取実施中！</p>
              
              <div className="hero-features">
                <div className="feature-item">
                  <div className="feature-icon">
                    <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="12" cy="12" r="10"/>
                      <path d="M12 6v6l4 2"/>
                    </svg>
                  </div>
                  <div className="feature-text">
                    <h3>高価買取</h3>
                    <p>市場価格を徹底調査し、適正な高価買取を実現</p>
                  </div>
                </div>
                
                <div className="feature-item">
                  <div className="feature-icon">
                    <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                      <polyline points="14 2 14 8 20 8"/>
                      <line x1="16" y1="13" x2="8" y2="13"/>
                      <line x1="16" y1="17" x2="8" y2="17"/>
                      <polyline points="10 9 9 9 8 9"/>
                    </svg>
                  </div>
                  <div className="feature-text">
                    <h3>無料査定</h3>
                    <p>査定料・出張費は完全無料。お気軽にご相談ください</p>
                  </div>
                </div>
                
                <div className="feature-item">
                  <div className="feature-icon">
                    <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>
                    </svg>
                  </div>
                  <div className="feature-text">
                    <h3>即日対応</h3>
                    <p>スピード査定・即日現金買取も可能です</p>
                  </div>
                </div>
                
                <div className="feature-item">
                  <div className="feature-icon">
                    <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="1" y="3" width="15" height="13"/>
                      <polygon points="16 8 20 8 23 11 23 16 16 16 16 8"/>
                      <circle cx="5.5" cy="18.5" r="2.5"/>
                      <circle cx="18.5" cy="18.5" r="2.5"/>
                    </svg>
                  </div>
                  <div className="feature-text">
                    <h3>全車種対応</h3>
                    <p>ダンプ、クレーン、冷凍車など全車種買取可能</p>
                  </div>
                </div>
              </div>

              <div className="hero-contact-methods">
                <div className="contact-method">
                  <h3>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ display: 'inline', marginRight: '8px', verticalAlign: 'middle' }}>
                      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>
                    </svg>
                    お電話でのお問い合わせ
                  </h3>
                  <a href="tel:0078-6042-4011" className="phone-number">0078-6042-4011</a>
                  <p className="business-hours">営業時間: 月~土 9:00 ~ 18:00</p>
                </div>
              </div>
            </div>

            <div className="hero-right">
              <div className="inquiry-form-card">
                <h2>無料査定お申し込み</h2>
                <p className="form-subtitle">お気軽にお問い合わせください</p>
                
                <form onSubmit={handleSubmit} className="kaitori-form">
                  <div className="form-group">
                    <label htmlFor="customerName">お名前 *</label>
                    <input
                      type="text"
                      id="customerName"
                      name="customerName"
                      value={formData.customerName}
                      onChange={handleChange}
                      required
                      placeholder="山田 太郎"
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="customerPhone">電話番号 *</label>
                    <input
                      type="tel"
                      id="customerPhone"
                      name="customerPhone"
                      value={formData.customerPhone}
                      onChange={handleChange}
                      required
                      placeholder="090-1234-5678"
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="vehicleInfo">車両情報 *</label>
                    <input
                      type="text"
                      id="vehicleInfo"
                      name="vehicleInfo"
                      value={formData.vehicleInfo}
                      onChange={handleChange}
                      required
                      placeholder="例: 2015年 いすゞ エルフ ダンプ"
                    />
                    <small style={{ color: '#999', fontSize: '0.85rem', marginTop: '5px', display: 'block' }}>
                      年式、メーカー、モデル、車種をご記入ください
                    </small>
                  </div>

                  <div className="form-group">
                    <label htmlFor="message">その他詳細</label>
                    <textarea
                      id="message"
                      name="message"
                      value={formData.message}
                      onChange={handleChange}
                      rows={4}
                      placeholder="走行距離、車両の状態、希望買取価格など"
                    />
                  </div>

                  <button type="submit" className="submit-button" disabled={submitting}>
                    {submitting ? '送信中...' : '無料査定を申し込む'}
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Buying Process Section */}
      <section className="buying-process">
        <div className="container">
          <h2>買取の流れ</h2>
          <div className="process-steps">
            <div className="step">
              <div className="step-number">1</div>
              <h3>お問い合わせ</h3>
              <p>お電話またはフォームからお気軽にお問い合わせください</p>
            </div>
            
            <div className="step-arrow">→</div>
            
            <div className="step">
              <div className="step-number">2</div>
              <h3>無料査定</h3>
              <p>専門スタッフが車両の状態を確認し、適正価格を査定します</p>
            </div>
            
            <div className="step-arrow">→</div>
            
            <div className="step">
              <div className="step-number">3</div>
              <h3>ご契約</h3>
              <p>査定額にご納得いただけましたら、契約手続きを行います</p>
            </div>
            
            <div className="step-arrow">→</div>
            
            <div className="step">
              <div className="step-number">4</div>
              <h3>お支払い</h3>
              <p>書類確認後、速やかにお支払いいたします</p>
            </div>
          </div>
        </div>
      </section>

      {/* Buying Categories */}
      <section className="buying-categories">
        <div className="container">
          <h2>買取対象車両</h2>
          <div className="categories-grid">
            <div className="kaitori-category-card">
              <h3>平ボディ</h3>
              <p>汎用性の高い平ボディトラック全般</p>
            </div>
            <div className="kaitori-category-card">
              <h3>ダンプ</h3>
              <p>土砂運搬用ダンプトラック各種</p>
            </div>
            <div className="kaitori-category-card">
              <h3>クレーン</h3>
              <p>各種クレーン付きトラック</p>
            </div>
            <div className="kaitori-category-card">
              <h3>冷凍車</h3>
              <p>冷凍・冷蔵機能付きトラック</p>
            </div>
            <div className="kaitori-category-card">
              <h3>バン・ウイング</h3>
              <p>バン型・ウイング型トラック</p>
            </div>
            <div className="kaitori-category-card">
              <h3>特殊車両</h3>
              <p>アームロール、ミキサー車など</p>
            </div>
          </div>
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="why-choose-us">
        <div className="container">
          <h2>アラワが選ばれる理由</h2>
          <div className="reasons-grid">
            <div className="reason-card">
              <div className="reason-icon">
                <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="8" r="7"/>
                  <polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88"/>
                </svg>
              </div>
              <h3>豊富な実績</h3>
              <p>長年の経験と実績により、適正な査定価格をご提示します</p>
            </div>
            
            <div className="reason-card">
              <div className="reason-icon">
                <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
                </svg>
              </div>
              <h3>透明な査定</h3>
              <p>査定内容を詳しくご説明し、納得いただける取引を心がけています</p>
            </div>
            
            <div className="reason-card">
              <div className="reason-icon">
                <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                  <circle cx="12" cy="7" r="4"/>
                </svg>
              </div>
              <h3>丁寧な対応</h3>
              <p>お客様の疑問や不安に、専門スタッフが丁寧にお答えします</p>
            </div>
            
            <div className="reason-card">
              <div className="reason-icon">
                <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
                  <circle cx="12" cy="10" r="3"/>
                </svg>
              </div>
              <h3>地域密着</h3>
              <p>神奈川・茨城を中心に、地域に根ざしたサービスを提供</p>
            </div>
          </div>
        </div>
      </section>

      {/* Company Info */}
      <section className="company-info">
        <div className="container">
          <h2>事業所案内</h2>
          <div className="locations-grid">
            <div className="location-card">
              <h3>川崎本社</h3>
              <p>〒210-0834</p>
              <p>神奈川県川崎市川崎区大島上町21-14</p>
              <p><strong>TEL:</strong> <a href="tel:0078-6042-4011">0078-6042-4011</a></p>
              <p><strong>FAX:</strong> 044-742-8463</p>
            </div>

            <div className="location-card">
              <h3>土浦営業所</h3>
              <p>〒300-0024</p>
              <p>茨城県土浦市右籾1250</p>
              <p><strong>TEL:</strong> <a href="tel:080-2392-5197">080-2392-5197</a></p>
            </div>
          </div>

          <div className="business-info">
            <p><strong>営業時間:</strong> 月曜日 ~ 土曜日 9:00 ~ 18:00</p>
            <p className="license-info">
              <strong>古物商許可証:</strong> 第401150001296号 / 茨城県公安委員会
            </p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default KaitoriPage;
