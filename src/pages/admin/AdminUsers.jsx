import { useState, useEffect, useCallback } from 'react';
import { usersAPI } from '../../services/api';
import toast from 'react-hot-toast';
import { FiSearch, FiEdit2, FiToggleLeft, FiToggleRight } from 'react-icons/fi';
import { safeFormatDate } from '../../utils/dateFormatter';
import './AdminPages.css';

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({});

  const loadUsers = useCallback(async () => {
    setLoading(true);
    try {
      const res = await usersAPI.getAll({ search, role: roleFilter || undefined, status: statusFilter || undefined, page, limit: 10 });
      setUsers(res.data.users);
      setPagination(res.data.pagination);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  }, [search, roleFilter, statusFilter, page]);

  useEffect(() => { loadUsers(); }, [loadUsers]);
  useEffect(() => { const t = setTimeout(() => setPage(1), 300); return () => clearTimeout(t); }, [search]);

  const handleToggleStatus = async (userId) => {
    try {
      const res = await usersAPI.toggleStatus(userId);
      toast.success(res.data.message);
      loadUsers();
    } catch (err) { toast.error('Failed to update status'); }
  };

  return (
    <div className="admin-page fade-in">
      <div className="page-header">
        <div>
          <h1>User Management</h1>
          <p>Manage all registered users</p>
        </div>
      </div>

      <div className="admin-toolbar">
        <div className="search-bar">
          <FiSearch className="search-icon" />
          <input type="text" placeholder="Search users..." value={search} onChange={e => setSearch(e.target.value)} id="admin-users-search" />
        </div>
        <select className="form-select" value={roleFilter} onChange={e => { setRoleFilter(e.target.value); setPage(1); }} style={{ width: 140 }}>
          <option value="">All Roles</option>
          <option value="customer">Customer</option>
          <option value="admin">Admin</option>
        </select>
        <select className="form-select" value={statusFilter} onChange={e => { setStatusFilter(e.target.value); setPage(1); }} style={{ width: 140 }}>
          <option value="">All Status</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
        </select>
      </div>

      <div className="content-card">
        {loading ? (
          <div className="loading-spinner"><div className="spinner" /></div>
        ) : (
          <div className="data-table-wrapper">
            <table className="data-table">
              <thead>
                <tr><th>Name</th><th>Email</th><th>Phone</th><th>Role</th><th>Status</th><th>Joined</th><th>Actions</th></tr>
              </thead>
              <tbody>
                {users.length === 0 ? (
                  <tr><td colSpan="7" style={{ textAlign: 'center', padding: 40, color: 'var(--text-muted)' }}>No users found</td></tr>
                ) : users.map(u => (
                  <tr key={u.id}>
                    <td style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{u.name}</td>
                    <td>{u.email}</td>
                    <td>{u.phone || '—'}</td>
                    <td><span className={`badge badge-${u.role}`}>{u.role}</span></td>
                    <td><span className={`badge badge-${u.is_active ? 'active' : 'inactive'}`}>{u.is_active ? 'Active' : 'Inactive'}</span></td>
                    <td>{safeFormatDate(u.created_at)}</td>
                    <td>
                      <button
                        className={`btn ${u.is_active ? 'btn-danger' : 'btn-success'} btn-sm`}
                        onClick={() => handleToggleStatus(u.id)}
                        title={u.is_active ? 'Deactivate' : 'Activate'}
                      >
                        {u.is_active ? <FiToggleRight /> : <FiToggleLeft />}
                      </button>
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
    </div>
  );
}
