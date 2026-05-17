import { useCart } from '../context/CartContext';
import { FiX, FiPlus, FiMinus, FiTrash2, FiShoppingBag } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './CartDrawer.css';

export default function CartDrawer() {
  const { cartItems, cartTotal, isCartOpen, setIsCartOpen, updateQuantity, removeFromCart, clearCart } = useCart();
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  if (!isCartOpen) return null;

  const handleCheckout = () => {
    setIsCartOpen(false);
    if (!isAuthenticated) {
      navigate('/login');
    } else {
      navigate('/checkout');
    }
  };

  return (
    <>
      <div className="cart-overlay" onClick={() => setIsCartOpen(false)} />
      <div className="cart-drawer">
        <div className="cart-header">
          <h3><FiShoppingBag /> Your Cart</h3>
          <button className="modal-close" onClick={() => setIsCartOpen(false)}><FiX /></button>
        </div>

        <div className="cart-body">
          {cartItems.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">🛒</div>
              <h3>Your cart is empty</h3>
              <p>Add some delicious items!</p>
            </div>
          ) : (
            <div className="cart-items-list">
              {cartItems.map(item => (
                <div key={item.id} className="cart-item">
                  <div className="cart-item-info">
                    <h4>{item.name}</h4>
                    <p className="cart-item-price">₹{parseFloat(item.price).toFixed(2)}</p>
                  </div>
                  <div className="cart-item-actions">
                    <div className="quantity-control">
                      <button onClick={() => updateQuantity(item.id, item.quantity - 1)}><FiMinus /></button>
                      <span>{item.quantity}</span>
                      <button onClick={() => updateQuantity(item.id, item.quantity + 1)}><FiPlus /></button>
                    </div>
                    <span className="cart-item-subtotal">₹{(parseFloat(item.price) * item.quantity).toFixed(2)}</span>
                    <button className="remove-btn" onClick={() => removeFromCart(item.id)}><FiTrash2 /></button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {cartItems.length > 0 && (
          <div className="cart-footer">
            <button className="btn btn-secondary btn-sm" onClick={clearCart}>Clear Cart</button>
            <div className="cart-total">
              <span>Total:</span>
              <strong>₹{cartTotal.toFixed(2)}</strong>
            </div>
            <button className="btn btn-primary btn-lg checkout-btn" onClick={handleCheckout}>
              Place Order
            </button>
          </div>
        )}
      </div>
    </>
  );
}
