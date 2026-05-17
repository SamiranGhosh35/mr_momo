import { useState, useEffect, useCallback } from 'react';
import { itemsAPI, categoriesAPI, getImageUrl } from '../../services/api';
import toast from 'react-hot-toast';
import { FiSearch, FiPlus, FiEdit2, FiTrash2, FiToggleLeft, FiToggleRight, FiUpload, FiX, FiTag } from 'react-icons/fi';
import './AdminPages.css';

export default function AdminItems() {
  const [items, setItems] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [catFilter, setCatFilter] = useState('');
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({});
  const [showModal, setShowModal] = useState(false);
  const [showCatModal, setShowCatModal] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [form, setForm] = useState({ name: '', description: '', price: '', category_id: '', quantity_available: '', is_available: true });
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  const [catForm, setCatForm] = useState({ name: '', description: '' });
  const [editingCat, setEditingCat] = useState(null);

  const loadItems = useCallback(async () => {
    setLoading(true);
    try {
      const res = await itemsAPI.adminGetAll({ search, category: catFilter || undefined, page, limit: 10 });
      setItems(res.data.items);
      setPagination(res.data.pagination);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  }, [search, catFilter, page]);

  const loadCategories = async () => {
    try { const res = await categoriesAPI.getAll(); setCategories(res.data.categories); } catch (err) { console.error(err); }
  };

  useEffect(() => { loadItems(); }, [loadItems]);
  useEffect(() => { loadCategories(); }, []);
  useEffect(() => { const t = setTimeout(() => setPage(1), 300); return () => clearTimeout(t); }, [search]);

  const openCreateModal = () => {
    setEditItem(null);
    setForm({ name: '', description: '', price: '', category_id: '', quantity_available: '', is_available: true });
    setImageFile(null); setImagePreview('');
    setShowModal(true);
  };

  const openEditModal = (item) => {
    setEditItem(item);
    setForm({
      name: item.name, description: item.description || '', price: item.price,
      category_id: item.category_id || '', quantity_available: item.quantity_available,
      is_available: item.is_available
    });
    setImagePreview(item.image ? getImageUrl(item.image) : '');
    setImageFile(null);
    setShowModal(true);
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleSaveItem = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    Object.entries(form).forEach(([k, v]) => { if (v !== '' && v !== undefined) formData.append(k, v); });
    if (imageFile) formData.append('image', imageFile);

    try {
      if (editItem) {
        await itemsAPI.update(editItem.id, formData);
        toast.success('Item updated!');
      } else {
        await itemsAPI.create(formData);
        toast.success('Item created!');
      }
      setShowModal(false);
      loadItems();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed');
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Remove this item?')) return;
    try { await itemsAPI.remove(id); toast.success('Item removed'); loadItems(); }
    catch (err) { toast.error('Failed'); }
  };

  const handleToggle = async (id) => {
    try { await itemsAPI.toggleAvailability(id); loadItems(); }
    catch (err) { toast.error('Failed'); }
  };

  const handleSaveCat = async (e) => {
    e.preventDefault();
    try {
      if (editingCat) { await categoriesAPI.update(editingCat.id, catForm); toast.success('Category updated!'); }
      else { await categoriesAPI.create(catForm); toast.success('Category created!'); }
      setShowCatModal(false);
      setCatForm({ name: '', description: '' });
      setEditingCat(null);
      loadCategories();
    } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
  };

  return (
    <div className="admin-page fade-in">
      <div className="page-header">
        <div>
          <h1>Items Management</h1>
          <p>Manage food items and categories</p>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <button className="btn btn-secondary" onClick={() => { setEditingCat(null); setCatForm({ name: '', description: '' }); setShowCatModal(true); }}>
            <FiTag /> Categories
          </button>
          <button className="btn btn-primary" onClick={openCreateModal}><FiPlus /> Add Item</button>
        </div>
      </div>

      <div className="admin-toolbar">
        <div className="search-bar">
          <FiSearch className="search-icon" />
          <input type="text" placeholder="Search items..." value={search} onChange={e => setSearch(e.target.value)} id="admin-items-search" />
        </div>
        <select className="form-select" value={catFilter} onChange={e => { setCatFilter(e.target.value); setPage(1); }} style={{ width: 180 }}>
          <option value="">All Categories</option>
          {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
      </div>

      <div className="content-card">
        {loading ? (
          <div className="loading-spinner"><div className="spinner" /></div>
        ) : (
          <div className="data-table-wrapper">
            <table className="data-table">
              <thead>
                <tr><th>Image</th><th>Name</th><th>Category</th><th>Price</th><th>Stock</th><th>Available</th><th>Actions</th></tr>
              </thead>
              <tbody>
                {items.length === 0 ? (
                  <tr><td colSpan="7" style={{ textAlign: 'center', padding: 40, color: 'var(--text-muted)' }}>No items found</td></tr>
                ) : items.map(item => (
                  <tr key={item.id}>
                    <td>
                      {item.image ? (
                        <img src={getImageUrl(item.image)} alt="" style={{ width: 40, height: 40, borderRadius: 6, objectFit: 'cover' }} />
                      ) : <span style={{ fontSize: '1.5rem' }}>🍽️</span>}
                    </td>
                    <td style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{item.name}</td>
                    <td>{item.category?.name || '—'}</td>
                    <td style={{ color: 'var(--accent-amber)', fontWeight: 600 }}>₹{parseFloat(item.price).toFixed(2)}</td>
                    <td>{item.quantity_available}</td>
                    <td>
                      <button className="btn btn-sm" onClick={() => handleToggle(item.id)} style={{ background: 'none', border: 'none', fontSize: '1.3rem', color: item.is_available ? 'var(--success)' : 'var(--text-muted)' }}>
                        {item.is_available ? <FiToggleRight /> : <FiToggleLeft />}
                      </button>
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: 6 }}>
                        <button className="btn btn-secondary btn-sm" onClick={() => openEditModal(item)}><FiEdit2 /></button>
                        <button className="btn btn-danger btn-sm" onClick={() => handleDelete(item.id)}><FiTrash2 /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

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

      {/* Item Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content modal-lg" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>{editItem ? 'Edit Item' : 'Add New Item'}</h3>
              <button className="modal-close" onClick={() => setShowModal(false)}><FiX /></button>
            </div>
            <form onSubmit={handleSaveItem}>
              <div className="modal-body">
                <div className="form-grid">
                  <div className="form-group">
                    <label className="form-label">Item Name</label>
                    <input className="form-input" value={form.name} onChange={e => setForm({...form, name: e.target.value})} required />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Category</label>
                    <select className="form-select" value={form.category_id} onChange={e => setForm({...form, category_id: e.target.value})}>
                      <option value="">Select Category</option>
                      {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Price (₹)</label>
                    <input type="number" step="0.01" className="form-input" value={form.price} onChange={e => setForm({...form, price: e.target.value})} required />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Stock Quantity</label>
                    <input type="number" className="form-input" value={form.quantity_available} onChange={e => setForm({...form, quantity_available: e.target.value})} />
                  </div>
                </div>
                <div className="form-group">
                  <label className="form-label">Description</label>
                  <textarea className="form-textarea" value={form.description} onChange={e => setForm({...form, description: e.target.value})} />
                </div>
                <div className="form-group">
                  <label className="form-label">Image</label>
                  <div className="image-upload-area">
                    <input type="file" accept="image/*" onChange={handleImageChange} />
                    <div className="upload-icon"><FiUpload /></div>
                    <p>Click or drag to upload image</p>
                    {imagePreview && <img src={imagePreview} alt="Preview" className="image-preview" />}
                  </div>
                </div>
                <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                  <input type="checkbox" checked={form.is_available} onChange={e => setForm({...form, is_available: e.target.checked})} />
                  Available for ordering
                </label>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">{editItem ? 'Update' : 'Create'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Category Modal */}
      {showCatModal && (
        <div className="modal-overlay" onClick={() => setShowCatModal(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Manage Categories</h3>
              <button className="modal-close" onClick={() => setShowCatModal(false)}><FiX /></button>
            </div>
            <div className="modal-body">
              <form onSubmit={handleSaveCat} style={{ marginBottom: 20 }}>
                <div className="form-group">
                  <label className="form-label">Category Name</label>
                  <input className="form-input" value={catForm.name} onChange={e => setCatForm({...catForm, name: e.target.value})} required />
                </div>
                <div className="form-group">
                  <label className="form-label">Description</label>
                  <input className="form-input" value={catForm.description} onChange={e => setCatForm({...catForm, description: e.target.value})} />
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                  <button type="submit" className="btn btn-primary btn-sm">{editingCat ? 'Update' : 'Add'}</button>
                  {editingCat && <button type="button" className="btn btn-secondary btn-sm" onClick={() => { setEditingCat(null); setCatForm({ name: '', description: '' }); }}>Cancel</button>}
                </div>
              </form>
              <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: 16 }}>
                {categories.map(c => (
                  <div key={c.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid var(--border-light)' }}>
                    <span style={{ fontWeight: 500 }}>{c.name} <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>— {c.description || 'No description'}</span></span>
                    <div style={{ display: 'flex', gap: 6 }}>
                      <button className="btn btn-secondary btn-sm" onClick={() => { setEditingCat(c); setCatForm({ name: c.name, description: c.description || '' }); }}><FiEdit2 /></button>
                      <button className="btn btn-danger btn-sm" onClick={async () => { if (confirm('Remove?')) { await categoriesAPI.remove(c.id); toast.success('Removed'); loadCategories(); } }}><FiTrash2 /></button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
