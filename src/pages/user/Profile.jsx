import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { profileAPI } from '../../services/api';
import toast from 'react-hot-toast';
import { FiUser, FiMail, FiPhone, FiLock, FiMapPin, FiPlus, FiEdit2, FiTrash2, FiCheck } from 'react-icons/fi';
import './Profile.css';

export default function Profile() {
  const { user, updateUser } = useAuth();
  const [form, setForm] = useState({ name: '', phone: '' });
  const [pwForm, setPwForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [addresses, setAddresses] = useState([]);
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [editingAddress, setEditingAddress] = useState(null);
  const [addressForm, setAddressForm] = useState({ label: 'Home', address_line1: '', address_line2: '', city: '', state: '', pincode: '', is_default: false });
  const [loading, setLoading] = useState(false);
  const [tab, setTab] = useState('profile');

  useEffect(() => {
    if (user) setForm({ name: user.name, phone: user.phone || '' });
    loadAddresses();
  }, [user]);

  const loadAddresses = async () => {
    try {
      const res = await profileAPI.getAddresses();
      setAddresses(res.data.addresses);
    } catch (err) { console.error(err); }
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await profileAPI.update(form);
      updateUser(res.data.user);
      toast.success('Profile updated!');
    } catch (err) { toast.error(err.response?.data?.message || 'Update failed'); }
    finally { setLoading(false); }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (pwForm.newPassword !== pwForm.confirmPassword) { toast.error('Passwords do not match'); return; }
    setLoading(true);
    try {
      await profileAPI.changePassword({ currentPassword: pwForm.currentPassword, newPassword: pwForm.newPassword });
      toast.success('Password changed!');
      setPwForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err) { toast.error(err.response?.data?.message || 'Failed to change password'); }
    finally { setLoading(false); }
  };

  const handleSaveAddress = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (editingAddress) {
        await profileAPI.updateAddress(editingAddress.id, addressForm);
        toast.success('Address updated!');
      } else {
        await profileAPI.addAddress(addressForm);
        toast.success('Address added!');
      }
      loadAddresses();
      resetAddressForm();
    } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
    finally { setLoading(false); }
  };

  const handleDeleteAddress = async (id) => {
    if (!confirm('Delete this address?')) return;
    try {
      await profileAPI.deleteAddress(id);
      toast.success('Address deleted');
      loadAddresses();
    } catch (err) { toast.error('Failed to delete'); }
  };

  const handleSetDefault = async (id) => {
    try {
      await profileAPI.setDefault(id);
      toast.success('Default address updated');
      loadAddresses();
    } catch (err) { toast.error('Failed'); }
  };

  const resetAddressForm = () => {
    setShowAddressForm(false);
    setEditingAddress(null);
    setAddressForm({ label: 'Home', address_line1: '', address_line2: '', city: '', state: '', pincode: '', is_default: false });
  };

  const startEditAddress = (addr) => {
    setEditingAddress(addr);
    setAddressForm({ label: addr.label, address_line1: addr.address_line1, address_line2: addr.address_line2 || '', city: addr.city, state: addr.state, pincode: addr.pincode, is_default: addr.is_default });
    setShowAddressForm(true);
  };

  return (
    <div className="profile-page fade-in">
      <div className="page-header">
        <div>
          <h1>My Profile</h1>
          <p>Manage your account and addresses</p>
        </div>
      </div>

      <div className="profile-tabs">
        <button className={`profile-tab ${tab === 'profile' ? 'active' : ''}`} onClick={() => setTab('profile')}>
          <FiUser /> Profile
        </button>
        <button className={`profile-tab ${tab === 'password' ? 'active' : ''}`} onClick={() => setTab('password')}>
          <FiLock /> Password
        </button>
        <button className={`profile-tab ${tab === 'addresses' ? 'active' : ''}`} onClick={() => setTab('addresses')}>
          <FiMapPin /> Addresses
        </button>
      </div>

      {tab === 'profile' && (
        <div className="content-card slide-up">
          <form onSubmit={handleUpdateProfile}>
            <div className="form-group">
              <label className="form-label">Full Name</label>
              <input type="text" className="form-input" value={form.name} onChange={e => setForm({...form, name: e.target.value})} />
            </div>
            <div className="form-group">
              <label className="form-label">Email</label>
              <input type="email" className="form-input" value={user?.email || ''} disabled />
            </div>
            <div className="form-group">
              <label className="form-label">Phone</label>
              <input type="tel" className="form-input" value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} />
            </div>
            <button type="submit" className="btn btn-primary" disabled={loading}>{loading ? 'Saving...' : 'Save Changes'}</button>
          </form>
        </div>
      )}

      {tab === 'password' && (
        <div className="content-card slide-up">
          <form onSubmit={handleChangePassword}>
            <div className="form-group">
              <label className="form-label">Current Password</label>
              <input type="password" className="form-input" value={pwForm.currentPassword} onChange={e => setPwForm({...pwForm, currentPassword: e.target.value})} />
            </div>
            <div className="form-group">
              <label className="form-label">New Password</label>
              <input type="password" className="form-input" value={pwForm.newPassword} onChange={e => setPwForm({...pwForm, newPassword: e.target.value})} />
            </div>
            <div className="form-group">
              <label className="form-label">Confirm New Password</label>
              <input type="password" className="form-input" value={pwForm.confirmPassword} onChange={e => setPwForm({...pwForm, confirmPassword: e.target.value})} />
            </div>
            <button type="submit" className="btn btn-primary" disabled={loading}>{loading ? 'Changing...' : 'Change Password'}</button>
          </form>
        </div>
      )}

      {tab === 'addresses' && (
        <div className="slide-up">
          <div style={{ marginBottom: 16 }}>
            <button className="btn btn-primary" onClick={() => { resetAddressForm(); setShowAddressForm(true); }}>
              <FiPlus /> Add Address
            </button>
          </div>

          {showAddressForm && (
            <div className="content-card" style={{ marginBottom: 16 }}>
              <h3 style={{ marginBottom: 16, fontSize: '1rem' }}>{editingAddress ? 'Edit Address' : 'New Address'}</h3>
              <form onSubmit={handleSaveAddress}>
                <div className="form-row" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                  <div className="form-group">
                    <label className="form-label">Label</label>
                    <select className="form-select" value={addressForm.label} onChange={e => setAddressForm({...addressForm, label: e.target.value})}>
                      <option value="Home">Home</option>
                      <option value="Work">Work</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Pincode</label>
                    <input className="form-input" value={addressForm.pincode} onChange={e => setAddressForm({...addressForm, pincode: e.target.value})} required/>
                  </div>
                </div>
                <div className="form-group">
                  <label className="form-label">Address Line 1</label>
                  <input className="form-input" value={addressForm.address_line1} onChange={e => setAddressForm({...addressForm, address_line1: e.target.value})} required/>
                </div>
                <div className="form-group">
                  <label className="form-label">Address Line 2</label>
                  <input className="form-input" value={addressForm.address_line2} onChange={e => setAddressForm({...addressForm, address_line2: e.target.value})} />
                </div>
                <div className="form-row" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                  <div className="form-group">
                    <label className="form-label">City</label>
                    <input className="form-input" value={addressForm.city} onChange={e => setAddressForm({...addressForm, city: e.target.value})} required/>
                  </div>
                  <div className="form-group">
                    <label className="form-label">State</label>
                    <input className="form-input" value={addressForm.state} onChange={e => setAddressForm({...addressForm, state: e.target.value})} required/>
                  </div>
                </div>
                <label style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16, fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                  <input type="checkbox" checked={addressForm.is_default} onChange={e => setAddressForm({...addressForm, is_default: e.target.checked})} />
                  Set as default address
                </label>
                <div style={{ display: 'flex', gap: 10 }}>
                  <button type="submit" className="btn btn-primary" disabled={loading}>{loading ? 'Saving...' : 'Save'}</button>
                  <button type="button" className="btn btn-secondary" onClick={resetAddressForm}>Cancel</button>
                </div>
              </form>
            </div>
          )}

          <div className="addresses-grid">
            {addresses.map(addr => (
              <div key={addr.id} className={`address-card ${addr.is_default ? 'default' : ''}`}>
                <div className="address-card-header">
                  <span className="address-label">{addr.label}</span>
                  {addr.is_default && <span className="badge badge-active">Default</span>}
                </div>
                <p>{addr.address_line1}</p>
                {addr.address_line2 && <p>{addr.address_line2}</p>}
                <p>{addr.city}, {addr.state} - {addr.pincode}</p>
                <div className="address-actions">
                  {!addr.is_default && (
                    <button className="btn btn-secondary btn-sm" onClick={() => handleSetDefault(addr.id)}><FiCheck /> Default</button>
                  )}
                  <button className="btn btn-secondary btn-sm" onClick={() => startEditAddress(addr)}><FiEdit2 /></button>
                  <button className="btn btn-danger btn-sm" onClick={() => handleDeleteAddress(addr.id)}><FiTrash2 /></button>
                </div>
              </div>
            ))}
            {addresses.length === 0 && (
              <div className="empty-state">
                <div className="empty-icon">📍</div>
                <h3>No addresses yet</h3>
                <p>Add your first delivery address</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
