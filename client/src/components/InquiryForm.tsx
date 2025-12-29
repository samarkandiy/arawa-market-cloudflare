import React, { useState } from 'react';
import { submitInquiry } from '../api/inquiries';
import { useToastContext } from '../context/ToastContext';
import './InquiryForm.css';

interface InquiryFormProps {
  vehicleId: number;
}

const InquiryForm: React.FC<InquiryFormProps> = ({ vehicleId }) => {
  const [formData, setFormData] = useState({
    customerName: '',
    customerEmail: '',
    customerPhone: '',
    message: '',
    inquiryType: 'email' as 'phone' | 'email' | 'line',
  });
  const [honeypot, setHoneypot] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const toast = useToastContext();

  const isGeneralContact = vehicleId === 0;

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Honeypot check - if filled, it's a bot
    if (honeypot) {
      console.log('Bot detected via honeypot');
      // Silently fail for bots - don't show error message
      setSubmitting(true);
      setTimeout(() => {
        setSubmitting(false);
        setSubmitted(true);
      }, 1000);
      return;
    }

    // Validation
    if (!formData.customerName.trim()) {
      toast.error('お名前を入力してください。');
      return;
    }

    if (!formData.customerEmail.trim() && !formData.customerPhone.trim()) {
      toast.error('メールアドレスまたは電話番号を入力してください。');
      return;
    }

    if (formData.customerEmail && !isValidEmail(formData.customerEmail)) {
      toast.error('有効なメールアドレスを入力してください。');
      return;
    }

    if (!formData.message.trim()) {
      toast.error('お問い合わせ内容を入力してください。');
      return;
    }

    setSubmitting(true);

    try {
      // For general contact (vehicleId = 0), send 0 to indicate general inquiry
      await submitInquiry({
        vehicleId: vehicleId,
        customerName: formData.customerName,
        customerEmail: formData.customerEmail || undefined,
        customerPhone: formData.customerPhone || undefined,
        message: formData.message,
        inquiryType: formData.inquiryType,
      });

      setSubmitted(true);
      toast.success('お問い合わせを送信しました');
      setFormData({
        customerName: '',
        customerEmail: '',
        customerPhone: '',
        message: '',
        inquiryType: 'email',
      });
    } catch (err) {
      console.error('Failed to submit inquiry:', err);
      toast.error('お問い合わせの送信に失敗しました。もう一度お試しください。');
    } finally {
      setSubmitting(false);
    }
  };

  const isValidEmail = (email: string): boolean => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  if (submitted) {
    return (
      <div className="inquiry-form success">
        <h3>お問い合わせありがとうございます</h3>
        <p>担当者より折り返しご連絡させていただきます。</p>
        <button onClick={() => setSubmitted(false)} className="submit-button">
          別のお問い合わせをする
        </button>
      </div>
    );
  }

  return (
    <form className="inquiry-form" onSubmit={handleSubmit}>
      <h3>{isGeneralContact ? 'お問い合わせフォーム' : 'メールでのお問い合わせ'}</h3>

      {/* Honeypot field - hidden from users but visible to bots */}
      <div className="honeypot-field" aria-hidden="true">
        <label htmlFor="website">Website</label>
        <input
          type="text"
          id="website"
          name="website"
          value={honeypot}
          onChange={(e) => setHoneypot(e.target.value)}
          tabIndex={-1}
          autoComplete="off"
        />
      </div>

      <div className="form-group">
        <label htmlFor="customerName">
          お名前 <span className="required">*</span>
        </label>
        <input
          type="text"
          id="customerName"
          name="customerName"
          value={formData.customerName}
          onChange={handleChange}
          required
        />
      </div>

      <div className="form-group">
        <label htmlFor="customerEmail">メールアドレス</label>
        <input
          type="email"
          id="customerEmail"
          name="customerEmail"
          value={formData.customerEmail}
          onChange={handleChange}
        />
      </div>

      <div className="form-group">
        <label htmlFor="customerPhone">電話番号</label>
        <input
          type="tel"
          id="customerPhone"
          name="customerPhone"
          value={formData.customerPhone}
          onChange={handleChange}
        />
      </div>

      <div className="form-group">
        <label htmlFor="message">
          お問い合わせ内容 <span className="required">*</span>
        </label>
        <textarea
          id="message"
          name="message"
          value={formData.message}
          onChange={handleChange}
          rows={5}
          required
        />
      </div>

      <button type="submit" className="submit-button" disabled={submitting}>
        {submitting ? '送信中...' : '送信する'}
      </button>
    </form>
  );
};

export default InquiryForm;
