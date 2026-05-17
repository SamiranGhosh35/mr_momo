import { useState, useEffect } from 'react';
import { reportsAPI } from '../../services/api';
import { FiShoppingBag, FiUsers, FiPackage, FiDollarSign, FiClock, FiCheckCircle, FiXCircle } from 'react-icons/fi';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts';
import { safeFormatDate } from '../../utils/dateFormatter';
import './AdminPages.css';

export default function Dashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    reportsAPI.dashboard().then(res => { setData(res.data); setLoading(false); }).catch(err => { console.error(err); setLoading(false); });
  }, []);

  if (loading) return <div className="loading-spinner"><div className="spinner" /></div>;
  if (!data) return null;

  const { stats, recentOrders, ordersByStatus, revenueByDay } = data;
  const COLORS = ['#f59e0b', '#3b82f6', '#8b5cf6', '#06b6d4', '#10b981', '#ef4444'];

  const statusData = ordersByStatus.map((s, i) => ({
    name: s.status.replace('_', ' '),
    value: parseInt(s.dataValues?.count || s.count || 0)
  }));

  const revenueData = revenueByDay.map(d => {
    const dateStr = d.dataValues?.date || d.date;
    return {
      date: safeFormatDate(dateStr, 'dd MMM'),
      revenue: parseFloat(d.dataValues?.revenue || d.revenue || 0),
      orders: parseInt(d.dataValues?.orders || d.orders || 0)
    };
  });

  const statusLabels = { pending: 'Pending', confirmed: 'Confirmed', preparing: 'Preparing', out_for_delivery: 'Out for Delivery', delivered: 'Delivered', cancelled: 'Cancelled' };

  return (
    <div className="admin-page fade-in">
      <div className="page-header">
        <div>
          <h1>Dashboard</h1>
          <p>Welcome back! Here's your business overview</p>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'rgba(245,158,11,0.15)', color: '#f59e0b' }}><FiDollarSign /></div>
          <div className="stat-value">₹{parseFloat(stats.totalRevenue).toLocaleString()}</div>
          <div className="stat-label">Total Revenue</div>
        </div>
        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'rgba(59,130,246,0.15)', color: '#3b82f6' }}><FiPackage /></div>
          <div className="stat-value">{stats.totalOrders}</div>
          <div className="stat-label">Total Orders</div>
        </div>
        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'rgba(16,185,129,0.15)', color: '#10b981' }}><FiUsers /></div>
          <div className="stat-value">{stats.totalUsers}</div>
          <div className="stat-label">Customers</div>
        </div>
        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'rgba(139,92,246,0.15)', color: '#8b5cf6' }}><FiShoppingBag /></div>
          <div className="stat-value">{stats.totalItems}</div>
          <div className="stat-label">Active Items</div>
        </div>
      </div>

      {/* Mini Stats */}
      <div className="stats-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))' }}>
        <div className="stat-card mini">
          <div className="stat-label"><FiClock style={{ color: '#f59e0b' }} /> Pending</div>
          <div className="stat-value" style={{ fontSize: '1.4rem' }}>{stats.pendingOrders}</div>
        </div>
        <div className="stat-card mini">
          <div className="stat-label"><FiCheckCircle style={{ color: '#10b981' }} /> Delivered</div>
          <div className="stat-value" style={{ fontSize: '1.4rem' }}>{stats.deliveredOrders}</div>
        </div>
        <div className="stat-card mini">
          <div className="stat-label"><FiXCircle style={{ color: '#ef4444' }} /> Cancelled</div>
          <div className="stat-value" style={{ fontSize: '1.4rem' }}>{stats.cancelledOrders}</div>
        </div>
      </div>

      {/* Charts */}
      <div className="charts-grid">
        <div className="content-card">
          <h3 className="card-title">Revenue Trend (Last 7 Days)</h3>
          <div className="chart-container">
            <ResponsiveContainer width="100%" height={280}>
              <LineChart data={revenueData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="date" stroke="#64748b" fontSize={12} />
                <YAxis stroke="#64748b" fontSize={12} />
                <Tooltip contentStyle={{ background: '#1e293b', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, fontSize: 12 }} />
                <Line type="monotone" dataKey="revenue" stroke="#f59e0b" strokeWidth={2} dot={{ fill: '#f59e0b', r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="content-card">
          <h3 className="card-title">Orders by Status</h3>
          <div className="chart-container">
            <ResponsiveContainer width="100%" height={280}>
              <PieChart>
                <Pie data={statusData} cx="50%" cy="50%" innerRadius={60} outerRadius={100} paddingAngle={3} dataKey="value" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
                  {statusData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
                <Tooltip contentStyle={{ background: '#1e293b', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, fontSize: 12 }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Recent Orders */}
      <div className="content-card" style={{ marginTop: 20 }}>
        <h3 className="card-title">Recent Orders</h3>
        <div className="data-table-wrapper">
          <table className="data-table">
            <thead>
              <tr><th>Order #</th><th>Customer</th><th>Amount</th><th>Status</th><th>Date</th></tr>
            </thead>
            <tbody>
              {recentOrders.map(order => (
                <tr key={order.id}>
                  <td style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{order.order_number}</td>
                  <td>{order.user?.name || 'N/A'}</td>
                  <td style={{ color: 'var(--accent-amber)', fontWeight: 600 }}>₹{parseFloat(order.total_amount).toFixed(2)}</td>
                  <td><span className={`badge badge-${order.status}`}>{statusLabels[order.status]}</span></td>
                  <td>{safeFormatDate(order.created_at)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
