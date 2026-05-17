import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { authAPI } from '../../services/api';
import toast from 'react-hot-toast';
import { FiMail, FiLock, FiEye, FiEyeOff } from 'react-icons/fi';
import './Auth.css';

export default function Login() {
  const [form, setForm] = useState({ email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.email || !form.password) { toast.error('Please fill in all fields'); return; }
    setLoading(true);
    try {
      const res = await authAPI.login(form);
      login(res.data.token, res.data.user);
      toast.success('Welcome back!');
      navigate(res.data.user.role === 'admin' ? '/admin' : '/');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-container slide-up">
        <div className="auth-header">
          <div className="auth-logo">🍔</div>
          <h1>Welcome Back</h1>
          <p>Sign in to your FoodExpress account</p>
        </div>
        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label className="form-label">Email</label>
            <div className="input-icon-wrapper">
              <FiMail className="input-icon" />
              <input type="email" className="form-input" placeholder="Enter your email" value={form.email} onChange={e => setForm({...form, email: e.target.value})} id="login-email" />
            </div>
          </div>
          <div className="form-group">
            <label className="form-label">Password</label>
            <div className="input-icon-wrapper">
              <FiLock className="input-icon" />
              <input type={showPassword ? 'text' : 'password'} className="form-input" placeholder="Enter your password" value={form.password} onChange={e => setForm({...form, password: e.target.value})} id="login-password" />
              <button type="button" className="toggle-password" onClick={() => setShowPassword(!showPassword)}>
                {showPassword ? <FiEyeOff /> : <FiEye />}
              </button>
            </div>
          </div>
          <div className="auth-links-row">
            <Link to="/forgot-password" className="auth-link">Forgot Password?</Link>
          </div>
          <button type="submit" className="btn btn-primary btn-lg auth-submit" disabled={loading} id="login-submit">
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>
        <div className="auth-footer">
          Don't have an account? <Link to="/register" className="auth-link">Sign Up</Link>
        </div>
        <div className="auth-demo-info">
          <p><strong>Demo Credentials:</strong></p>
          <p>Admin: admin@foodapp.com / admin123</p>
          <p>Customer: john@example.com / customer123</p>
        </div>
      </div>
    </div>
  );
}
