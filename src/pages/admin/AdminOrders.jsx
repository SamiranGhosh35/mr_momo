import { useState, useEffect, useCallback } from 'react';
import { ordersAPI } from '../../services/api';
import toast from 'react-hot-toast';
import { FiSearch, FiEye, FiX } from 'react-icons/fi';
import { safeFormatDate, safeFormatDateTime } from '../../utils/dateFormatter';
import './AdminPages.css';

const STATUS_OPTIONS = ['pending', 'confirmed', 'preparing', 'out_for_delivery', 'delivered', 'cancelled'];
const STATUS_LABELS = { pending: 'Pending', confirmed: 'Confirmed', preparing: 'Preparing', out_for_delivery: 'Out for Delivery', delivered: 'Delivered', cancelled: 'Cancelled' };

export default function AdminOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({});
  const [selectedOrder, setSelectedOrder] = useState(null);

  const loadOrders = useCallback(async () => {
    setLoading(true);
    try {
      const res = await ordersAPI.getAll({ search, status: statusFilter || undefined, page, limit: 10 });
      setOrders(res.data.orders);
      setPagination(res.data.pagination);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  }, [search, statusFilter, page]);

  useEffect(() => { loadOrders(); }, [loadOrders]);

  const handleStatusChange = async (orderId, newStatus) => {
    try {
      await ordersAPI.updateStatus(orderId, { status: newStatus });
      toast.success(`Status updated to ${STATUS_LABELS[newStatus]}`);
      loadOrders();
    } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
  };

  const viewOrder = async (orderId) => {
    try {
      const res = await ordersAPI.getById(orderId);
      setSelectedOrder(res.data.order);
    } catch (err) { toast.error('Failed to load order'); }
  };

  return (
    <div className="admin-page fade-in">
      <div className="page-header"><div><h1>Order Management</h1><p>View and manage all orders</p></div></div>

      <div className="admin-toolbar">
        <div className="search-bar">
          <FiSearch className="search-icon" />
          <input placeholder="Search orders..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <select className="form-select" value={statusFilter} onChange={e => { setStatusFilter(e.target.value); setPage(1); }} style={{ width: 180 }}>
          <option value="">All Statuses</option>
          {STATUS_OPTIONS.map(s => <option key={s} value={s}>{STATUS_LABELS[s]}</option>)}
        </select>
      </div>

      <div className="content-card">
        {loading ? <div className="loading-spinner"><div className="spinner" /></div> : (
          <div className="data-table-wrapper">
            <table className="data-table">
              <thead><tr><th>Order #</th><th>Customer</th><th>Total</th><th>Status</th><th>Date</th><th>Actions</th></tr></thead>
              <tbody>
                {orders.map(order => (
                  <tr key={order.id}>
                    <td style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{order.order_number}</td>
                    <td>{order.user?.name || 'N/A'}</td>
                    <td style={{ color: 'var(--accent-amber)', fontWeight: 600 }}>₹{parseFloat(order.total_amount).toFixed(2)}</td>
                    <td>
                      <select className="form-select" value={order.status} onChange={e => handleStatusChange(order.id, e.target.value)} style={{ fontSize: '0.8rem', padding: '4px 24px 4px 8px' }}>
                        {STATUS_OPTIONS.map(s => <option key={s} value={s}>{STATUS_LABELS[s]}</option>)}
                      </select>
                    </td>
                    <td>{safeFormatDate(order.created_at)}</td>
                    <td><button className="btn btn-secondary btn-sm" onClick={() => viewOrder(order.id)}><FiEye /></button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        {pagination.totalPages > 1 && (
          <div className="pagination">
            <button disabled={page <= 1} onClick={() => setPage(p => p - 1)}>Prev</button>
            {[...Array(pagination.totalPages)].map((_, i) => (
              <button key={i+1} className={page === i+1 ? 'active' : ''} onClick={() => setPage(i+1)}>{i+1}</button>
            ))}
            <button disabled={page >= pagination.totalPages} onClick={() => setPage(p => p + 1)}>Next</button>
          </div>
        )}
      </div>

      {selectedOrder && (
        <div className="modal-overlay" onClick={() => setSelectedOrder(null)}>
          <div className="modal-content modal-lg" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Order {selectedOrder.order_number}</h3>
              <button className="modal-close" onClick={() => setSelectedOrder(null)}><FiX /></button>
            </div>
            <div className="modal-body">
              <p><strong>Customer:</strong> {selectedOrder.user?.name} ({selectedOrder.user?.email})</p>
              <p><strong>Status:</strong> <span className={`badge badge-${selectedOrder.status}`}>{STATUS_LABELS[selectedOrder.status]}</span></p>
              <p><strong>Total:</strong> ₹{parseFloat(selectedOrder.total_amount).toFixed(2)}</p>
              <p><strong>Date:</strong> {safeFormatDateTime(selectedOrder.created_at)}</p>
              {selectedOrder.address && <p><strong>Address:</strong> {selectedOrder.address.address_line1}, {selectedOrder.address.city} - {selectedOrder.address.pincode}</p>}
              {selectedOrder.notes && <p><strong>Notes:</strong> {selectedOrder.notes}</p>}
              <h4 style={{ marginTop: 16 }}>Items</h4>
              <table className="data-table" style={{ marginTop: 8 }}>
                <thead><tr><th>Item</th><th>Price</th><th>Qty</th><th>Subtotal</th></tr></thead>
                <tbody>
                  {selectedOrder.items?.map(i => (
                    <tr key={i.id}><td>{i.item_name}</td><td>₹{parseFloat(i.item_price).toFixed(2)}</td><td>{i.quantity}</td><td>₹{parseFloat(i.subtotal).toFixed(2)}</td></tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
