import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { FiShoppingCart, FiUser, FiLogOut, FiMenu, FiX } from 'react-icons/fi';
import { useState } from 'react';
import './Navbar.css';

export default function Navbar() {
  const { user, isAuthenticated, isAdmin, logout } = useAuth();
  const { cartCount, setIsCartOpen } = useCart();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // Don't show navbar on admin pages (admin has sidebar)
  if (location.pathname.startsWith('/admin')) return null;

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <Link to="/" className="navbar-brand">
          <span className="brand-icon">🍔</span>
          <span className="brand-text">FoodExpress</span>
        </Link>

        <button className="mobile-toggle" onClick={() => setMobileOpen(!mobileOpen)}>
          {mobileOpen ? <FiX /> : <FiMenu />}
        </button>

        <div className={`navbar-links ${mobileOpen ? 'open' : ''}`}>
          {isAuthenticated && !isAdmin && (
            <>
              <Link to="/" className={`nav-link ${location.pathname === '/' ? 'active' : ''}`} onClick={() => setMobileOpen(false)}>Menu</Link>
              <Link to="/orders" className={`nav-link ${location.pathname === '/orders' ? 'active' : ''}`} onClick={() => setMobileOpen(false)}>My Orders</Link>
              <Link to="/profile" className={`nav-link ${location.pathname === '/profile' ? 'active' : ''}`} onClick={() => setMobileOpen(false)}>Profile</Link>
            </>
          )}

          {!isAuthenticated && (
            <>
              <Link to="/login" className="nav-link" onClick={() => setMobileOpen(false)}>Login</Link>
              <Link to="/register" className="btn btn-primary btn-sm" onClick={() => setMobileOpen(false)}>Sign Up</Link>
            </>
          )}
        </div>

        <div className="navbar-actions">
          {isAuthenticated && !isAdmin && (
            <button className="cart-btn" onClick={() => setIsCartOpen(true)} id="cart-button">
              <FiShoppingCart />
              {cartCount > 0 && <span className="cart-badge">{cartCount}</span>}
            </button>
          )}

          {isAuthenticated && (
            <div className="user-menu">
              <span className="user-name">{user?.name}</span>
              <button className="btn-icon logout-btn" onClick={handleLogout} title="Logout">
                <FiLogOut />
              </button>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}
