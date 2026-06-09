import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Lock, Eye, EyeOff, User } from 'lucide-react';
import { useAuthStore } from '../store/useAuthStore';
import './Auth.css';

export default function Register() {
  const navigate = useNavigate();
  const { register, isLoading } = useAuthStore();
  const [form, setForm] = useState({ full_name: '', phone: '', password: '', confirm_password: '' });
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState('');

  const set = (field: string) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((prev) => ({ ...prev, [field]: e.target.value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!form.full_name || !form.phone || !form.password) { setError('All fields are required.'); return; }
    if (form.password !== form.confirm_password) { setError('Passwords do not match.'); return; }
    if (form.password.length < 6) { setError('Password must be at least 6 characters.'); return; }
    try {
      await register({ full_name: form.full_name, phone: form.phone.trim(), password: form.password });
      navigate('/');
    } catch (err: any) {
      setError(err?.response?.data?.message ?? 'Registration failed. Please try again.');
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-container">
        <div className="auth-brand">
          <img src="/assets/lightlogo.png" alt="CamerBus Logo" className="auth-logo-img" />
          <p className="auth-brand-tagline">Book smarter, travel better</p>
        </div>

        <div className="auth-card glass-panel">
          <h2 className="auth-title">Create Account</h2>
          <p className="auth-subtitle">Join thousands of travelers across Cameroon</p>

          {error && (
            <div className="auth-error">
              <span>⚠️</span> {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="auth-form">
            <div className="form-group">
              <label className="form-label">Full Name</label>
              <div className="input-with-icon">
                <User size={16} className="input-icon-left" />
                <input
                  id="full-name"
                  type="text"
                  className="form-input input-iconed"
                  placeholder="John Doe"
                  value={form.full_name}
                  onChange={set('full_name')}
                  autoComplete="name"
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Phone Number</label>
              <div className="input-with-icon">
                <span className="input-prefix">🇨🇲 +237</span>
                <input
                  id="register-phone"
                  type="tel"
                  className="form-input input-prefixed"
                  placeholder="6XX XXX XXX"
                  value={form.phone}
                  onChange={set('phone')}
                  autoComplete="tel"
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Password</label>
              <div className="input-with-icon">
                <Lock size={16} className="input-icon-left" />
                <input
                  id="register-password"
                  type={showPass ? 'text' : 'password'}
                  className="form-input input-iconed"
                  placeholder="Min. 6 characters"
                  value={form.password}
                  onChange={set('password')}
                  autoComplete="new-password"
                />
                <button type="button" className="input-icon-right" onClick={() => setShowPass(!showPass)}>
                  {showPass ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Confirm Password</label>
              <div className="input-with-icon">
                <Lock size={16} className="input-icon-left" />
                <input
                  id="confirm-password"
                  type={showPass ? 'text' : 'password'}
                  className="form-input input-iconed"
                  placeholder="Repeat password"
                  value={form.confirm_password}
                  onChange={set('confirm_password')}
                  autoComplete="new-password"
                />
              </div>
            </div>

            <button
              id="register-btn"
              type="submit"
              className="btn-primary auth-submit"
              disabled={isLoading}
            >
              {isLoading ? (
                <span className="loading-dots"><span /><span /><span /></span>
              ) : 'Create Account'}
            </button>
          </form>

          <div className="auth-divider"><span>OR</span></div>

          <p className="auth-switch">
            Already have an account?{' '}
            <Link to="/login" className="auth-link">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
