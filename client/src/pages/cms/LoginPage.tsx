import React, { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { useNavigate } from 'react-router-dom';
import { authApi } from '../../api/auth';
import './LoginPage.css';

const LoginPage: React.FC = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const authToken = await authApi.login({ username, password });
      authApi.setToken(authToken.token);
      navigate('/cms/dashboard');
    } catch (err: any) {
      setError(err.response?.data?.error?.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <Helmet>
        <meta name="robots" content="noindex, nofollow" />
        <title>CMS Login | Arawa Inc.</title>
      </Helmet>
      
      <div className="login-branding">
        <div className="branding-content">
          <img src="/arawa-logo-light.png" alt="Arawa Inc." className="branding-logo" />
          <h1>
            Premium Truck
            <span className="highlight">Management</span>
          </h1>
          <p>Powerful CMS platform designed for professional truck dealers and fleet managers</p>
          
          <div className="branding-features">
            <div className="feature-item">
              <div className="feature-icon">🚚</div>
              <div className="feature-text">Unlimited vehicle inventory management</div>
            </div>
            <div className="feature-item">
              <div className="feature-icon">📊</div>
              <div className="feature-text">Real-time analytics and performance tracking</div>
            </div>
            <div className="feature-item">
              <div className="feature-icon">💬</div>
              <div className="feature-text">Streamlined customer inquiry system</div>
            </div>
          </div>
        </div>
      </div>

      <div className="login-container">
        <div className="login-box">
          <div className="login-header">
            <h2>Welcome back</h2>
            <p>Sign in to access your dashboard</p>
          </div>

          <form onSubmit={handleSubmit} className="login-form">
            {error && <div className="error-message">{error}</div>}

            <div className="form-group">
              <label htmlFor="username">Username</label>
              <input
                type="text"
                id="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                autoComplete="username"
                disabled={loading}
                placeholder="Enter your username"
              />
            </div>

            <div className="form-group">
              <label htmlFor="password">Password</label>
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="current-password"
                disabled={loading}
                placeholder="Enter your password"
              />
            </div>

            <button type="submit" className="login-button" disabled={loading}>
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          <div className="login-footer">
            © 2025 Arawa Inc. All rights reserved.
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
