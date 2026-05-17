import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { FiGrid, FiUsers, FiShoppingBag, FiPackage, FiBarChart2, FiLogOut, FiChevronLeft } from 'react-icons/fi';
import { useState } from 'react';
import './AdminSidebar.css';

const menuItems = [
  { path: '/admin', icon: <FiGrid />, label: 'Dashboard', end: true },
  { path: '/admin/users', icon: <FiUsers />, label: 'Users' },
  { path: '/admin/items', icon: <FiShoppingBag />, label: 'Items' },
  { path: '/admin/orders', icon: <FiPackage />, label: 'Orders' },
  { path: '/admin/reports', icon: <FiBarChart2 />, label: 'Reports' },
];

export default function AdminSidebar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <aside className={`admin-sidebar ${collapsed ? 'collapsed' : ''}`}>
      <div className="sidebar-header">
        {!collapsed && (
          <div className="sidebar-brand">
            <span className="brand-icon">🍔</span>
            <span>FoodExpress</span>
          </div>
        )}
        <button className="collapse-btn" onClick={() => setCollapsed(!collapsed)}>
          <FiChevronLeft style={{ transform: collapsed ? 'rotate(180deg)' : 'none' }} />
        </button>
      </div>

      <nav className="sidebar-nav">
        {menuItems.map(item => (
          <NavLink
            key={item.path}
            to={item.path}
            end={item.end}
            className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
            title={item.label}
          >
            <span className="sidebar-icon">{item.icon}</span>
            {!collapsed && <span className="sidebar-label">{item.label}</span>}
          </NavLink>
        ))}
      </nav>

      <div className="sidebar-footer">
        {!collapsed && (
          <div className="admin-info">
            <div className="admin-avatar">{user?.name?.[0] || 'A'}</div>
            <div>
              <div className="admin-name">{user?.name}</div>
              <div className="admin-role">Administrator</div>
            </div>
          </div>
        )}
        <button className="sidebar-link logout-link" onClick={handleLogout} title="Logout">
          <span className="sidebar-icon"><FiLogOut /></span>
          {!collapsed && <span className="sidebar-label">Logout</span>}
        </button>
      </div>
    </aside>
  );
}
