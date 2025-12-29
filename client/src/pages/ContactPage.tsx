import React from 'react';
import InquiryForm from '../components/InquiryForm';
import { usePageMeta } from '../hooks/usePageMeta';
import './ContactPage.css';

const ContactPage: React.FC = () => {
  usePageMeta({
    title: 'お問い合わせ | 株式会社アラワ - 中古トラック販売',
    description: '中古トラックのお問い合わせはこちら。電話、LINE、メールで対応。川崎本社：0078-6042-4011。営業時間：月~土 9:00-18:00。'
  });

  return (
    <div className="contact-page">
      <div className="container">
        <div className="contact-header">
          <h1>お問い合わせ</h1>
          <p className="contact-subtitle">
            お気軽にお問い合わせください。専門スタッフが丁寧に対応いたします。
          </p>
        </div>

        <div className="contact-content">
          <div className="contact-methods">
            <div className="contact-method-card">
              <div className="method-icon">📞</div>
              <h2>お電話でのお問い合わせ</h2>
              <a href="tel:0078-6042-4011" className="contact-phone">
                0078-6042-4011
              </a>
              <p className="contact-hours">
                <strong>受付時間:</strong> 月~土 9:00 ~ 18:00
              </p>
            </div>

            <div className="contact-method-card">
              <div className="method-icon">💬</div>
              <h2>LINEでのお問い合わせ</h2>
              <a
                href="https://line.me/ti/p/"
                target="_blank"
                rel="noopener noreferrer"
                className="line-button"
              >
                LINEで相談する
              </a>
              <p className="contact-description">
                お気軽にLINEでご相談ください
              </p>
            </div>
          </div>

          <div className="contact-form-section">
            <h2>メールでのお問い合わせ</h2>
            <p className="form-description">
              下記フォームに必要事項をご記入の上、送信してください。
            </p>
            <InquiryForm vehicleId={0} />
          </div>
        </div>

        <div className="company-locations">
          <h2>事業所案内</h2>
          <div className="locations-grid">
            <div className="location-card">
              <h3>川崎本社</h3>
              <p>〒210-0834</p>
              <p>神奈川県川崎市川崎区大島上町21-14</p>
              <p>
                <strong>TEL:</strong>{' '}
                <a href="tel:0078-6042-4011">0078-6042-4011</a>
              </p>
              <p>
                <strong>FAX:</strong> 044-742-8463
              </p>
            </div>

            <div className="location-card">
              <h3>土浦営業所</h3>
              <p>〒300-0024</p>
              <p>茨城県土浦市右籾1250</p>
              <p>
                <strong>TEL:</strong>{' '}
                <a href="tel:080-2392-5197">080-2392-5197</a>
              </p>
            </div>
          </div>

          <div className="business-info">
            <p>
              <strong>営業時間:</strong> 月曜日 ~ 土曜日 9:00 ~ 18:00
            </p>
            <p className="license-info">
              <strong>古物商許可証:</strong> 第401150001296号 / 茨城県公安委員会
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContactPage;
