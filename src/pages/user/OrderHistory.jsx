import { useState, useEffect, useCallback } from 'react';
import { ordersAPI } from '../../services/api';
import toast from 'react-hot-toast';
import { FiPackage, FiChevronDown, FiChevronUp, FiX } from 'react-icons/fi';
import { safeFormatDateTime } from '../../utils/dateFormatter';
import './OrderHistory.css';

export default function OrderHistory() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({});
  const [statusFilter, setStatusFilter] = useState('');
  const [expandedOrder, setExpandedOrder] = useState(null);

  const loadOrders = useCallback(async () => {
    setLoading(true);
    try {
      const res = await ordersAPI.getMyOrders({ page, limit: 10, status: statusFilter || undefined });
      setOrders(res.data.orders);
      setPagination(res.data.pagination);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  }, [page, statusFilter]);

  useEffect(() => { loadOrders(); }, [loadOrders]);

  const handleCancel = async (orderId) => {
    if (!confirm('Are you sure you want to cancel this order?')) return;
    try {
      await ordersAPI.cancel(orderId);
      toast.success('Order cancelled');
      loadOrders();
    } catch (err) { toast.error(err.response?.data?.message || 'Failed to cancel'); }
  };

  const statusLabels = {
    pending: 'Pending',
    confirmed: 'Confirmed',
    preparing: 'Preparing',
    out_for_delivery: 'Out for Delivery',
    delivered: 'Delivered',
    cancelled: 'Cancelled'
  };

  return (
    <div className="orders-page fade-in">
      <div className="page-header">
        <div>
          <h1>My Orders</h1>
          <p>Track and manage your orders</p>
        </div>
      </div>

      <div className="toolbar">
        <div className="status-filters">
          {['', 'pending', 'confirmed', 'preparing', 'out_for_delivery', 'delivered', 'cancelled'].map(s => (
            <button
              key={s}
              className={`category-chip ${statusFilter === s ? 'active' : ''}`}
              onClick={() => { setStatusFilter(s); setPage(1); }}
            >
              {s ? statusLabels[s] : 'All'}
            </button>
          ))}
        </div>
      </div>

      <div className="orders-list">
        {loading ? (
          <div className="loading-spinner"><div className="spinner" /></div>
        ) : orders.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">📦</div>
            <h3>No orders yet</h3>
            <p>Start ordering to see your history here</p>
          </div>
        ) : (
          orders.map(order => (
            <div key={order.id} className="order-card content-card">
              <div className="order-card-header" onClick={() => setExpandedOrder(expandedOrder === order.id ? null : order.id)}>
                <div className="order-info-row">
                  <div>
                    <h3 className="order-number">{order.order_number}</h3>
                    <p className="order-date">{safeFormatDateTime(order.created_at)}</p>
                  </div>
                  <div className="order-meta">
                    <span className={`badge badge-${order.status}`}>
                      {statusLabels[order.status]}
                    </span>
                    <span className="order-amount">₹{parseFloat(order.total_amount).toFixed(2)}</span>
                    {expandedOrder === order.id ? <FiChevronUp /> : <FiChevronDown />}
                  </div>
                </div>
              </div>

              {expandedOrder === order.id && (
                <div className="order-details slide-up">
                  <div className="order-items-list">
                    {order.items?.map(item => (
                      <div key={item.id} className="order-detail-item">
                        <span>{item.item_name} <span className="text-muted">×{item.quantity}</span></span>
                        <span>₹{parseFloat(item.subtotal).toFixed(2)}</span>
                      </div>
                    ))}
                  </div>
                  {order.address && (
                    <div className="order-address">
                      <FiPackage style={{ color: 'var(--text-muted)', flexShrink: 0 }} />
                      <span>{order.address.address_line1}, {order.address.city} - {order.address.pincode}</span>
                    </div>
                  )}
                  {order.notes && <p className="order-notes"><strong>Notes:</strong> {order.notes}</p>}
                  {['pending', 'confirmed'].includes(order.status) && (
                    <button className="btn btn-danger btn-sm" onClick={() => handleCancel(order.id)} style={{ marginTop: 10 }}>
                      <FiX /> Cancel Order
                    </button>
                  )}
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {pagination.totalPages > 1 && (
        <div className="pagination">
          <button disabled={page <= 1} onClick={() => setPage(p => p - 1)}>Previous</button>
          {[...Array(pagination.totalPages)].map((_, i) => (
            <button key={i + 1} className={page === i + 1 ? 'active' : ''} onClick={() => setPage(i + 1)}>{i + 1}</button>
          ))}
          <button disabled={page >= pagination.totalPages} onClick={() => setPage(p => p + 1)}>Next</button>
        </div>
      )}
    </div>
  );
}
