import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Lock, Eye, EyeOff } from 'lucide-react';
import { useAuthStore } from '../store/useAuthStore';
import './Auth.css';

export default function Login() {
  const navigate = useNavigate();
  const { login, isLoading } = useAuthStore();
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!phone.trim() || !password) { setError('Please fill in all fields.'); return; }
    try {
      await login(phone.trim(), password);
      navigate('/');
    } catch (err: any) {
      setError(err?.response?.data?.message ?? 'Login failed. Please try again.');
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-container">
        <div className="auth-brand">
          <img src="/assets/lightlogo.png" alt="CamerBus Logo" className="auth-logo-img" />
          <p className="auth-brand-tagline">Your journey starts here</p>
        </div>

        <div className="auth-card glass-panel">
          <h2 className="auth-title">Welcome back</h2>
          <p className="auth-subtitle">Sign in to book your next trip</p>

          {error && (
            <div className="auth-error">
              <span>⚠️</span> {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="auth-form">
            <div className="form-group">
              <label className="form-label">Phone Number</label>
              <div className="input-with-icon">
                <span className="input-prefix">🇨🇲 +237</span>
                <input
                  id="phone"
                  type="tel"
                  className="form-input input-prefixed"
                  placeholder="6XX XXX XXX"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  autoComplete="tel"
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Password</label>
              <div className="input-with-icon">
                <Lock size={16} className="input-icon-left" />
                <input
                  id="password"
                  type={showPass ? 'text' : 'password'}
                  className="form-input input-iconed"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  className="input-icon-right"
                  onClick={() => setShowPass(!showPass)}
                >
                  {showPass ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <button
              id="login-btn"
              type="submit"
              className="btn-primary auth-submit"
              disabled={isLoading}
            >
              {isLoading ? (
                <span className="loading-dots">
                  <span /><span /><span />
                </span>
              ) : 'Sign In'}
            </button>
          </form>

          <div className="auth-divider"><span>OR</span></div>

          <p className="auth-switch">
            Don't have an account?{' '}
            <Link to="/register" className="auth-link">Create one</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
