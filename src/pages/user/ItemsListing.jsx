import { useState, useEffect, useCallback } from 'react';
import { itemsAPI, categoriesAPI } from '../../services/api';
import { useCart } from '../../context/CartContext';
import { FiSearch, FiShoppingCart, FiFilter } from 'react-icons/fi';
import { getImageUrl } from '../../services/api';
import './ItemsListing.css';

export default function ItemsListing() {
  const [items, setItems] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [sort, setSort] = useState('newest');
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({});
  const { addToCart } = useCart();

  const loadItems = useCallback(async () => {
    setLoading(true);
    try {
      const res = await itemsAPI.getAll({
        search, category: selectedCategory, sort, page, limit: 12
      });
      setItems(res.data.items);
      setPagination(res.data.pagination);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  }, [search, selectedCategory, sort, page]);

  useEffect(() => { loadItems(); }, [loadItems]);

  useEffect(() => {
    categoriesAPI.getAll({ active: 'true' }).then(res => setCategories(res.data.categories)).catch(console.error);
  }, []);

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => { setPage(1); }, 300);
    return () => clearTimeout(timer);
  }, [search]);

  return (
    <div className="items-page fade-in">
      {/* Hero Banner */}
      <div className="items-hero">
        <div className="hero-content">
          <h1>Explore Our Menu</h1>
          <p>Discover delicious dishes crafted just for you</p>
          <div className="hero-search">
            <FiSearch className="search-icon" />
            <input
              type="text"
              placeholder="Search for dishes..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              id="items-search"
            />
          </div>
        </div>
      </div>

      <div className="items-container">
        {/* Filters */}
        <div className="items-filters">
          <div className="category-chips">
            <button
              className={`category-chip ${!selectedCategory ? 'active' : ''}`}
              onClick={() => { setSelectedCategory(''); setPage(1); }}
            >
              All
            </button>
            {categories.map(cat => (
              <button
                key={cat.id}
                className={`category-chip ${selectedCategory == cat.id ? 'active' : ''}`}
                onClick={() => { setSelectedCategory(cat.id); setPage(1); }}
              >
                {cat.name}
              </button>
            ))}
          </div>

          <div className="sort-select">
            <FiFilter />
            <select className="form-select" value={sort} onChange={e => { setSort(e.target.value); setPage(1); }} id="items-sort">
              <option value="newest">Newest</option>
              <option value="price_asc">Price: Low → High</option>
              <option value="price_desc">Price: High → Low</option>
              <option value="name_asc">Name: A → Z</option>
              <option value="name_desc">Name: Z → A</option>
            </select>
          </div>
        </div>

        {/* Items Grid */}
        {loading ? (
          <div className="items-grid">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="item-card-skeleton">
                <div className="skeleton" style={{ height: 180, borderRadius: '12px 12px 0 0' }}></div>
                <div style={{ padding: 16 }}>
                  <div className="skeleton" style={{ height: 20, width: '70%', marginBottom: 8 }}></div>
                  <div className="skeleton" style={{ height: 14, width: '100%', marginBottom: 12 }}></div>
                  <div className="skeleton" style={{ height: 36, width: '100%' }}></div>
                </div>
              </div>
            ))}
          </div>
        ) : items.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">🍽️</div>
            <h3>No items found</h3>
            <p>Try adjusting your search or filters</p>
          </div>
        ) : (
          <div className="items-grid">
            {items.map(item => (
              <div key={item.id} className="item-card glass-card" id={`item-${item.id}`}>
                <div className="item-image">
                  {item.image ? (
                    <img src={getImageUrl(item.image)} alt={item.name} />
                  ) : (
                    <div className="item-image-placeholder">🍽️</div>
                  )}
                  {item.category && (
                    <span className="item-category-tag">{item.category.name}</span>
                  )}
                </div>
                <div className="item-details">
                  <h3 className="item-name">{item.name}</h3>
                  <p className="item-desc">{item.description}</p>
                  <div className="item-footer">
                    <span className="item-price">₹{parseFloat(item.price).toFixed(2)}</span>
                    <button
                      className="btn btn-primary btn-sm add-to-cart-btn"
                      onClick={() => addToCart(item)}
                      disabled={!item.is_available || item.quantity_available <= 0}
                      id={`add-to-cart-${item.id}`}
                    >
                      {!item.is_available || item.quantity_available <= 0 ? 'Out of Stock' : <><FiShoppingCart /> Add</>}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Pagination */}
        {pagination.totalPages > 1 && (
          <div className="pagination">
            <button disabled={page <= 1} onClick={() => setPage(p => p - 1)}>Previous</button>
            {[...Array(pagination.totalPages)].map((_, i) => (
              <button key={i + 1} className={page === i + 1 ? 'active' : ''} onClick={() => setPage(i + 1)}>
                {i + 1}
              </button>
            ))}
            <button disabled={page >= pagination.totalPages} onClick={() => setPage(p => p + 1)}>Next</button>
          </div>
        )}
      </div>
    </div>
  );
}
