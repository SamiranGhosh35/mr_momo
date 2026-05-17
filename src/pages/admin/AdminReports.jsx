import { useState, useEffect } from 'react';
import { reportsAPI } from '../../services/api';
import { FiPackage, FiShoppingBag, FiUsers, FiDownload } from 'react-icons/fi';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { safeFormatDate } from '../../utils/dateFormatter';
import './AdminPages.css';

export default function AdminReports() {
  const [tab, setTab] = useState('orders');
  const [loading, setLoading] = useState(false);
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  const [ordersData, setOrdersData] = useState(null);
  const [itemsData, setItemsData] = useState(null);
  const [usersData, setUsersData] = useState(null);

  const loadReport = async () => {
    setLoading(true);
    try {
      if (tab === 'orders') {
        const res = await reportsAPI.orders({ dateFrom: dateFrom || undefined, dateTo: dateTo || undefined, status: statusFilter || undefined });
        setOrdersData(res.data);
      } else if (tab === 'items') {
        const res = await reportsAPI.items({ dateFrom: dateFrom || undefined, dateTo: dateTo || undefined });
        setItemsData(res.data);
      } else {
        const res = await reportsAPI.users();
        setUsersData(res.data);
      }
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  useEffect(() => { loadReport(); }, [tab]);

  const statusLabels = { pending: 'Pending', confirmed: 'Confirmed', preparing: 'Preparing', out_for_delivery: 'Out for Delivery', delivered: 'Delivered', cancelled: 'Cancelled' };

  return (
    <div className="admin-page fade-in">
      <div className="page-header">
        <div><h1>Reports</h1><p>Analyze your business data</p></div>
      </div>

      <div className="report-tabs">
        <button className={`report-tab ${tab === 'orders' ? 'active' : ''}`} onClick={() => setTab('orders')}><FiPackage /> Orders</button>
        <button className={`report-tab ${tab === 'items' ? 'active' : ''}`} onClick={() => setTab('items')}><FiShoppingBag /> Items</button>
        <button className={`report-tab ${tab === 'users' ? 'active' : ''}`} onClick={() => setTab('users')}><FiUsers /> Users</button>
      </div>

      {/* Filters */}
      {tab !== 'users' && (
        <div className="admin-toolbar">
          <div className="date-filters">
            <label style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>From:</label>
            <input type="date" value={dateFrom} onChange={e => setDateFrom(e.target.value)} />
            <label style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>To:</label>
            <input type="date" value={dateTo} onChange={e => setDateTo(e.target.value)} />
            {tab === 'orders' && (
              <select className="form-select" value={statusFilter} onChange={e => setStatusFilter(e.target.value)} style={{ width: 150 }}>
                <option value="">All Status</option>
                {Object.entries(statusLabels).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
              </select>
            )}
            <button className="btn btn-primary btn-sm" onClick={loadReport}>Apply</button>
          </div>
        </div>
      )}

      {loading ? <div className="loading-spinner"><div className="spinner" /></div> : (
        <>
          {/* Orders Report */}
          {tab === 'orders' && ordersData && (
            <div className="slide-up">
              <div className="stats-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))' }}>
                <div className="stat-card mini">
                  <div className="stat-label">Total Orders</div>
                  <div className="stat-value" style={{ fontSize: '1.4rem' }}>{ordersData.summary.totalOrders}</div>
                </div>
                <div className="stat-card mini">
                  <div className="stat-label">Revenue</div>
                  <div className="stat-value" style={{ fontSize: '1.4rem' }}>₹{ordersData.summary.totalRevenue.toFixed(0)}</div>
                </div>
                <div className="stat-card mini">
                  <div className="stat-label">Avg Order Value</div>
                  <div className="stat-value" style={{ fontSize: '1.4rem' }}>₹{ordersData.summary.avgOrderValue.toFixed(0)}</div>
                </div>
                {Object.entries(ordersData.summary.statusBreakdown).map(([k, v]) => (
                  <div key={k} className="stat-card mini">
                    <div className="stat-label"><span className={`badge badge-${k}`}>{statusLabels[k]}</span></div>
                    <div className="stat-value" style={{ fontSize: '1.4rem' }}>{v}</div>
                  </div>
                ))}
              </div>
              <div className="content-card" style={{ marginTop: 16 }}>
                <h3 className="card-title">Orders List</h3>
                <div className="data-table-wrapper">
                  <table className="data-table">
                    <thead><tr><th>Order #</th><th>Customer</th><th>Items</th><th>Total</th><th>Status</th><th>Date</th></tr></thead>
                    <tbody>
                      {ordersData.orders.map(o => (
                        <tr key={o.id}>
                          <td style={{ fontWeight: 600 }}>{o.order_number}</td>
                          <td>{o.user?.name}</td>
                          <td>{o.items?.length}</td>
                          <td style={{ color: 'var(--accent-amber)', fontWeight: 600 }}>₹{parseFloat(o.total_amount).toFixed(2)}</td>
                          <td><span className={`badge badge-${o.status}`}>{statusLabels[o.status]}</span></td>
                          <td>{safeFormatDate(o.created_at)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* Items Report */}
          {tab === 'items' && itemsData && (
            <div className="slide-up">
              <div className="stats-grid" style={{ gridTemplateColumns: 'repeat(3, 1fr)' }}>
                <div className="stat-card mini">
                  <div className="stat-label">Items Sold</div>
                  <div className="stat-value" style={{ fontSize: '1.4rem' }}>{itemsData.summary.totalItems}</div>
                </div>
                <div className="stat-card mini">
                  <div className="stat-label">Total Revenue</div>
                  <div className="stat-value" style={{ fontSize: '1.4rem' }}>₹{itemsData.summary.totalRevenue.toFixed(0)}</div>
                </div>
                <div className="stat-card mini">
                  <div className="stat-label">Units Sold</div>
                  <div className="stat-value" style={{ fontSize: '1.4rem' }}>{itemsData.summary.totalQuantity}</div>
                </div>
              </div>

              {itemsData.items.length > 0 && (
                <div className="content-card" style={{ marginTop: 16, marginBottom: 16 }}>
                  <h3 className="card-title">Top Selling Items</h3>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={itemsData.items.slice(0, 10).map(i => ({ name: i.item_name, revenue: parseFloat(i.dataValues?.total_revenue || i.total_revenue || 0), qty: parseInt(i.dataValues?.total_quantity || i.total_quantity || 0) }))}>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                      <XAxis dataKey="name" stroke="#64748b" fontSize={11} angle={-20} textAnchor="end" height={60} />
                      <YAxis stroke="#64748b" fontSize={12} />
                      <Tooltip contentStyle={{ background: '#1e293b', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8 }} />
                      <Bar dataKey="revenue" fill="#f59e0b" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              )}

              <div className="content-card">
                <h3 className="card-title">Item Details</h3>
                <div className="data-table-wrapper">
                  <table className="data-table">
                    <thead><tr><th>Item</th><th>Orders</th><th>Qty Sold</th><th>Revenue</th></tr></thead>
                    <tbody>
                      {itemsData.items.map((i, idx) => (
                        <tr key={idx}>
                          <td style={{ fontWeight: 600 }}>{i.item_name}</td>
                          <td>{i.dataValues?.order_count || i.order_count}</td>
                          <td>{i.dataValues?.total_quantity || i.total_quantity}</td>
                          <td style={{ color: 'var(--accent-amber)', fontWeight: 600 }}>₹{parseFloat(i.dataValues?.total_revenue || i.total_revenue || 0).toFixed(2)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* Users Report */}
          {tab === 'users' && usersData && (
            <div className="slide-up">
              <div className="stats-grid" style={{ gridTemplateColumns: 'repeat(3, 1fr)' }}>
                <div className="stat-card mini">
                  <div className="stat-label">Total Customers</div>
                  <div className="stat-value" style={{ fontSize: '1.4rem' }}>{usersData.summary.totalCustomers}</div>
                </div>
                <div className="stat-card mini">
                  <div className="stat-label">Active</div>
                  <div className="stat-value" style={{ fontSize: '1.4rem' }}>{usersData.summary.activeCustomers}</div>
                </div>
                <div className="stat-card mini">
                  <div className="stat-label">Total Revenue</div>
                  <div className="stat-value" style={{ fontSize: '1.4rem' }}>₹{usersData.summary.totalRevenue.toFixed(0)}</div>
                </div>
              </div>
              <div className="content-card" style={{ marginTop: 16 }}>
                <h3 className="card-title">Customer Rankings</h3>
                <div className="data-table-wrapper">
                  <table className="data-table">
                    <thead><tr><th>Name</th><th>Email</th><th>Orders</th><th>Total Spent</th><th>Status</th></tr></thead>
                    <tbody>
                      {usersData.users.map(u => (
                        <tr key={u.id}>
                          <td style={{ fontWeight: 600 }}>{u.name}</td>
                          <td>{u.email}</td>
                          <td>{u.dataValues?.order_count || u.order_count || 0}</td>
                          <td style={{ color: 'var(--accent-amber)', fontWeight: 600 }}>₹{parseFloat(u.dataValues?.total_spent || u.total_spent || 0).toFixed(2)}</td>
                          <td><span className={`badge badge-${u.is_active ? 'active' : 'inactive'}`}>{u.is_active ? 'Active' : 'Inactive'}</span></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
