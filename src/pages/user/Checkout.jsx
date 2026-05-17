import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import { profileAPI, ordersAPI } from '../../services/api';
import toast from 'react-hot-toast';
import { FiMapPin, FiFileText, FiCheck } from 'react-icons/fi';
import './Checkout.css';

export default function Checkout() {
  const { cartItems, cartTotal, clearCart } = useCart();
  const [addresses, setAddresses] = useState([]);
  const [selectedAddress, setSelectedAddress] = useState(null);
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [orderPlaced, setOrderPlaced] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (cartItems.length === 0 && !orderPlaced) {
      navigate('/');
      return;
    }
    profileAPI.getAddresses().then(res => {
      setAddresses(res.data.addresses);
      const def = res.data.addresses.find(a => a.is_default);
      if (def) setSelectedAddress(def.id);
    }).catch(console.error);
  }, []);

  const handlePlaceOrder = async () => {
    if (!selectedAddress) { toast.error('Please select a delivery address'); return; }
    setLoading(true);
    try {
      const orderData = {
        items: cartItems.map(i => ({ item_id: i.id, quantity: i.quantity })),
        address_id: selectedAddress,
        notes
      };
      const res = await ordersAPI.place(orderData);
      setOrderPlaced(res.data.order);
      clearCart();
      toast.success('Order placed successfully! 🎉');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to place order');
    } finally {
      setLoading(false);
    }
  };

  if (orderPlaced) {
    return (
      <div className="checkout-page fade-in">
        <div className="order-success slide-up">
          <div className="success-icon">🎉</div>
          <h2>Order Placed!</h2>
          <p>Your order <strong>{orderPlaced.order_number}</strong> has been placed successfully.</p>
          <p className="success-amount">Total: ₹{parseFloat(orderPlaced.total_amount).toFixed(2)}</p>
          <div className="success-actions">
            <button className="btn btn-primary" onClick={() => navigate('/orders')}>View My Orders</button>
            <button className="btn btn-secondary" onClick={() => navigate('/')}>Continue Shopping</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="checkout-page fade-in">
      <div className="page-header">
        <h1>Checkout</h1>
      </div>

      <div className="checkout-layout">
        <div className="checkout-main">
          {/* Delivery Address */}
          <div className="content-card">
            <h3 className="section-title"><FiMapPin /> Delivery Address</h3>
            {addresses.length === 0 ? (
              <div className="empty-state" style={{ padding: 20 }}>
                <p>No addresses found. <button className="auth-link" onClick={() => navigate('/profile')}>Add one</button></p>
              </div>
            ) : (
              <div className="address-options">
                {addresses.map(addr => (
                  <label key={addr.id} className={`address-option ${selectedAddress === addr.id ? 'selected' : ''}`}>
                    <input type="radio" name="address" value={addr.id} checked={selectedAddress === addr.id} onChange={() => setSelectedAddress(addr.id)} />
                    <div>
                      <strong>{addr.label}</strong>
                      {addr.is_default && <span className="badge badge-active" style={{ marginLeft: 8 }}>Default</span>}
                      <p>{addr.address_line1}{addr.address_line2 ? `, ${addr.address_line2}` : ''}</p>
                      <p>{addr.city}, {addr.state} - {addr.pincode}</p>
                    </div>
                  </label>
                ))}
              </div>
            )}
          </div>

          {/* Order Notes */}
          <div className="content-card" style={{ marginTop: 16 }}>
            <h3 className="section-title"><FiFileText /> Order Notes</h3>
            <textarea className="form-textarea" placeholder="Any special instructions? (optional)" value={notes} onChange={e => setNotes(e.target.value)} style={{ width: '100%' }} />
          </div>
        </div>

        {/* Order Summary */}
        <div className="checkout-sidebar">
          <div className="content-card">
            <h3 className="section-title">Order Summary</h3>
            <div className="summary-items">
              {cartItems.map(item => (
                <div key={item.id} className="summary-item">
                  <div>
                    <span className="summary-item-name">{item.name}</span>
                    <span className="summary-item-qty"> x{item.quantity}</span>
                  </div>
                  <span>₹{(parseFloat(item.price) * item.quantity).toFixed(2)}</span>
                </div>
              ))}
            </div>
            <div className="summary-divider" />
            <div className="summary-total">
              <span>Total</span>
              <strong>₹{cartTotal.toFixed(2)}</strong>
            </div>
            <button className="btn btn-primary btn-lg" style={{ width: '100%', marginTop: 16 }} onClick={handlePlaceOrder} disabled={loading} id="place-order-btn">
              {loading ? 'Placing Order...' : `Place Order — ₹${cartTotal.toFixed(2)}`}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
