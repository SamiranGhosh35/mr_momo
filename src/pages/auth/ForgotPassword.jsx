import { useState } from 'react';
import { Link } from 'react-router-dom';
import { authAPI } from '../../services/api';
import toast from 'react-hot-toast';
import { FiMail, FiLock, FiKey } from 'react-icons/fi';
import './Auth.css';

export default function ForgotPassword() {
  const [step, setStep] = useState(1); // 1: email, 2: reset
  const [email, setEmail] = useState('');
  const [resetToken, setResetToken] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [tokenDisplay, setTokenDisplay] = useState('');
  const [loading, setLoading] = useState(false);

  const handleRequestReset = async (e) => {
    e.preventDefault();
    if (!email) { toast.error('Please enter your email'); return; }
    setLoading(true);
    try {
      const res = await authAPI.forgotPassword({ email });
      if (res.data.resetToken) {
        setTokenDisplay(res.data.resetToken);
        setResetToken(res.data.resetToken);
      }
      toast.success('Reset token generated!');
      setStep(2);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to process request');
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    if (!resetToken || !newPassword) { toast.error('Please fill all fields'); return; }
    if (newPassword !== confirmPassword) { toast.error('Passwords do not match'); return; }
    if (newPassword.length < 6) { toast.error('Password must be at least 6 characters'); return; }
    setLoading(true);
    try {
      await authAPI.resetPassword({ token: resetToken, newPassword });
      toast.success('Password reset successfully! You can now login.');
      setStep(3);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to reset password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-container slide-up">
        <div className="auth-header">
          <div className="auth-logo">🔑</div>
          <h1>{step === 3 ? 'Password Reset!' : 'Forgot Password'}</h1>
          <p>{step === 1 ? 'Enter your email to receive a reset token' : step === 2 ? 'Enter the reset token and your new password' : 'Your password has been reset successfully'}</p>
        </div>

        {step === 1 && (
          <form onSubmit={handleRequestReset} className="auth-form">
            <div className="form-group">
              <label className="form-label">Email</label>
              <div className="input-icon-wrapper">
                <FiMail className="input-icon" />
                <input type="email" className="form-input" placeholder="Enter your email" value={email} onChange={e => setEmail(e.target.value)} id="forgot-email" />
              </div>
            </div>
            <button type="submit" className="btn btn-primary btn-lg auth-submit" disabled={loading} id="forgot-submit">
              {loading ? 'Sending...' : 'Send Reset Token'}
            </button>
          </form>
        )}

        {step === 2 && (
          <>
            {tokenDisplay && (
              <div className="token-display">
                <p><strong>Your Reset Token (demo):</strong></p>
                <code>{tokenDisplay}</code>
              </div>
            )}
            <form onSubmit={handleResetPassword} className="auth-form">
              <div className="form-group">
                <label className="form-label">Reset Token</label>
                <div className="input-icon-wrapper">
                  <FiKey className="input-icon" />
                  <input type="text" className="form-input" placeholder="Paste reset token" value={resetToken} onChange={e => setResetToken(e.target.value)} id="reset-token" />
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">New Password</label>
                <div className="input-icon-wrapper">
                  <FiLock className="input-icon" />
                  <input type="password" className="form-input" placeholder="Min 6 characters" value={newPassword} onChange={e => setNewPassword(e.target.value)} id="reset-password" />
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Confirm Password</label>
                <div className="input-icon-wrapper">
                  <FiLock className="input-icon" />
                  <input type="password" className="form-input" placeholder="Repeat new password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} id="reset-confirm" />
                </div>
              </div>
              <button type="submit" className="btn btn-primary btn-lg auth-submit" disabled={loading} id="reset-submit">
                {loading ? 'Resetting...' : 'Reset Password'}
              </button>
            </form>
          </>
        )}

        {step === 3 && (
          <div className="auth-form">
            <Link to="/login" className="btn btn-primary btn-lg auth-submit">Go to Login</Link>
          </div>
        )}

        <div className="auth-footer">
          <Link to="/login" className="auth-link">← Back to Login</Link>
        </div>
      </div>
    </div>
  );
}
