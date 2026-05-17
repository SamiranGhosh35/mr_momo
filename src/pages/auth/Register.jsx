import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { authAPI } from '../../services/api';
import toast from 'react-hot-toast';
import { FiUser, FiMail, FiLock, FiPhone, FiEye, FiEyeOff } from 'react-icons/fi';
import './Auth.css';

export default function Register() {
  const [form, setForm] = useState({ name: '', email: '', phone: '', password: '', confirmPassword: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.password || !form.confirmPassword) {
      toast.error('Please fill in all required fields'); return;
    }
    if (form.password !== form.confirmPassword) {
      toast.error('Passwords do not match'); return;
    }
    if (form.password.length < 6) {
      toast.error('Password must be at least 6 characters'); return;
    }
    setLoading(true);
    try {
      const res = await authAPI.register({ name: form.name, email: form.email, phone: form.phone, password: form.password });
      login(res.data.token, res.data.user);
      toast.success('Account created successfully!');
      navigate('/');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-container slide-up">
        <div className="auth-header">
          <div className="auth-logo">🍔</div>
          <h1>Create Account</h1>
          <p>Join FoodExpress and start ordering</p>
        </div>
        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label className="form-label">Full Name *</label>
            <div className="input-icon-wrapper">
              <FiUser className="input-icon" />
              <input type="text" className="form-input" placeholder="Enter your name" value={form.name} onChange={e => setForm({...form, name: e.target.value})} id="register-name" />
            </div>
          </div>
          <div className="form-group">
            <label className="form-label">Email *</label>
            <div className="input-icon-wrapper">
              <FiMail className="input-icon" />
              <input type="email" className="form-input" placeholder="Enter your email" value={form.email} onChange={e => setForm({...form, email: e.target.value})} id="register-email" />
            </div>
          </div>
          <div className="form-group">
            <label className="form-label">Phone</label>
            <div className="input-icon-wrapper">
              <FiPhone className="input-icon" />
              <input type="tel" className="form-input" placeholder="Enter your phone" value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} id="register-phone" />
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Password *</label>
              <div className="input-icon-wrapper">
                <FiLock className="input-icon" />
                <input type={showPassword ? 'text' : 'password'} className="form-input" placeholder="Min 6 characters" value={form.password} onChange={e => setForm({...form, password: e.target.value})} id="register-password" />
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Confirm Password *</label>
              <div className="input-icon-wrapper">
                <FiLock className="input-icon" />
                <input type={showPassword ? 'text' : 'password'} className="form-input" placeholder="Repeat password" value={form.confirmPassword} onChange={e => setForm({...form, confirmPassword: e.target.value})} id="register-confirm" />
                <button type="button" className="toggle-password" onClick={() => setShowPassword(!showPassword)}>
                  {showPassword ? <FiEyeOff /> : <FiEye />}
                </button>
              </div>
            </div>
          </div>
          <button type="submit" className="btn btn-primary btn-lg auth-submit" disabled={loading} id="register-submit">
            {loading ? 'Creating Account...' : 'Create Account'}
          </button>
        </form>
        <div className="auth-footer">
          Already have an account? <Link to="/login" className="auth-link">Sign In</Link>
        </div>
      </div>
    </div>
  );
}
