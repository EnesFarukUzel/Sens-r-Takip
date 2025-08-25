import React, { useState, useEffect } from 'react';
import AdminLayout from './AdminLayout';
import { getUsers, createUser, updateUser, deleteUser, updateUserStatus, AdminUser, CreateUserRequest, UpdateUserRequest } from '../services/api';
import './AdminDashboard.css';

const UserManagement: React.FC = () => {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedUsers, setSelectedUsers] = useState<number[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  // Kullanıcıları yükle
  const loadUsers = async () => {
    try {
      setIsLoading(true);
      setError('');
      const userData = await getUsers();
      setUsers(userData);
    } catch (error) {
      console.error('Kullanıcıları yükleme hatası:', error);
      setError('Kullanıcılar yüklenirken hata oluştu.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <span className="badge bg-success">Aktif</span>;
      case 'pending':
        return <span className="badge bg-warning">Beklemede</span>;
      case 'inactive':
        return <span className="badge bg-danger">Pasif</span>;
      default:
        return <span className="badge bg-secondary">{status}</span>;
    }
  };

  const getAvatarColor = (name: string) => {
    const colors = ['bg-primary', 'bg-warning', 'bg-danger', 'bg-success', 'bg-info'];
    const index = name.charCodeAt(0) % colors.length;
    return colors[index];
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.username.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || user.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedUsers(filteredUsers.map(user => user.id));
    } else {
      setSelectedUsers([]);
    }
  };

  const handleSelectUser = (userId: number, checked: boolean) => {
    if (checked) {
      setSelectedUsers(prev => [...prev, userId]);
    } else {
      setSelectedUsers(prev => prev.filter(id => id !== userId));
    }
  };

  const handleBulkAction = async (action: string) => {
    if (selectedUsers.length === 0) {
      alert('Lütfen en az bir kullanıcı seçin.');
      return;
    }

    try {
      setIsLoading(true);
      
      switch (action) {
        case 'activate':
          for (const userId of selectedUsers) {
            await updateUserStatus(userId, 'active');
          }
          break;
        case 'deactivate':
          for (const userId of selectedUsers) {
            await updateUserStatus(userId, 'inactive');
          }
          break;
        case 'delete':
          if (window.confirm(`${selectedUsers.length} kullanıcıyı silmek istediğinizden emin misiniz?`)) {
            for (const userId of selectedUsers) {
              await deleteUser(userId);
            }
          }
          break;
      }
      
      // Kullanıcıları yeniden yükle
      await loadUsers();
      setSelectedUsers([]);
    } catch (error) {
      console.error('Toplu işlem hatası:', error);
      setError('Toplu işlem sırasında hata oluştu.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleUserAction = async (userId: number, action: string) => {
    try {
      setIsLoading(true);
      
      switch (action) {
        case 'activate':
          await updateUserStatus(userId, 'active');
          break;
        case 'deactivate':
          await updateUserStatus(userId, 'inactive');
          break;
        case 'delete':
          if (window.confirm('Bu kullanıcıyı silmek istediğinizden emin misiniz?')) {
            await deleteUser(userId);
          }
          break;
      }
      
      // Kullanıcıları yeniden yükle
      await loadUsers();
    } catch (error) {
      console.error('Kullanıcı işlem hatası:', error);
      setError('Kullanıcı işlemi sırasında hata oluştu.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AdminLayout>
      <div className="container-fluid">
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h2>Kullanıcı Yönetimi</h2>
          <button className="btn btn-primary">
            <i className="bi bi-plus-circle me-2"></i>
            Yeni Kullanıcı
          </button>
        </div>

        {error && (
          <div className="alert alert-danger" role="alert">
            {error}
          </div>
        )}

        {/* Filtreler */}
        <div className="row mb-4">
          <div className="col-md-6">
            <div className="input-group">
              <span className="input-group-text">
                <i className="bi bi-search"></i>
              </span>
              <input
                type="text"
                className="form-control"
                placeholder="Kullanıcı ara..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
          <div className="col-md-3">
            <select
              className="form-select"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="all">Tüm Durumlar</option>
              <option value="active">Aktif</option>
              <option value="pending">Beklemede</option>
              <option value="inactive">Pasif</option>
            </select>
          </div>
          <div className="col-md-3">
            <div className="btn-group w-100">
              <button
                type="button"
                className="btn btn-outline-primary"
                onClick={() => handleBulkAction('activate')}
                disabled={selectedUsers.length === 0 || isLoading}
              >
                <i className="bi bi-check-circle me-1"></i>
                Aktifleştir
              </button>
              <button
                type="button"
                className="btn btn-outline-warning"
                onClick={() => handleBulkAction('deactivate')}
                disabled={selectedUsers.length === 0 || isLoading}
              >
                <i className="bi bi-pause-circle me-1"></i>
                Pasifleştir
              </button>
              <button
                type="button"
                className="btn btn-outline-danger"
                onClick={() => handleBulkAction('delete')}
                disabled={selectedUsers.length === 0 || isLoading}
              >
                <i className="bi bi-trash me-1"></i>
                Sil
              </button>
            </div>
          </div>
        </div>

        {/* Kullanıcı Tablosu */}
        <div className="card">
          <div className="card-body">
            {isLoading ? (
              <div className="text-center py-4">
                <div className="spinner-border text-primary" role="status">
                  <span className="visually-hidden">Yükleniyor...</span>
                </div>
                <p className="mt-2">Kullanıcılar yükleniyor...</p>
              </div>
            ) : (
              <div className="table-responsive">
                <table className="table table-hover">
                  <thead>
                    <tr>
                      <th>
                        <input
                          type="checkbox"
                          className="form-check-input"
                          checked={selectedUsers.length === filteredUsers.length && filteredUsers.length > 0}
                          onChange={(e) => handleSelectAll(e.target.checked)}
                        />
                      </th>
                      <th>Kullanıcı</th>
                      <th>E-posta</th>
                      <th>Rol</th>
                      <th>Durum</th>
                      <th>Kayıt Tarihi</th>
                      <th>İşlemler</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredUsers.map(user => (
                      <tr key={user.id}>
                        <td>
                          <input
                            type="checkbox"
                            className="form-check-input"
                            checked={selectedUsers.includes(user.id)}
                            onChange={(e) => handleSelectUser(user.id, e.target.checked)}
                          />
                        </td>
                        <td>
                          <div className="d-flex align-items-center">
                            <div className={`avatar-circle ${getAvatarColor(user.name)} me-3`}>
                              {user.name.charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <div className="fw-bold">{user.name}</div>
                              <small className="text-muted">@{user.username}</small>
                            </div>
                          </div>
                        </td>
                        <td>{user.email}</td>
                        <td>
                          <span className={`badge ${user.role === 'admin' ? 'bg-danger' : 'bg-primary'}`}>
                            {user.role === 'admin' ? 'Admin' : 'Kullanıcı'}
                          </span>
                        </td>
                        <td>{getStatusBadge(user.status)}</td>
                        <td>{new Date(user.createdAt).toLocaleDateString('tr-TR')}</td>
                        <td>
                          <div className="btn-group btn-group-sm">
                            <button
                              type="button"
                              className="btn btn-outline-primary"
                              onClick={() => handleUserAction(user.id, 'activate')}
                              disabled={isLoading}
                              title="Aktifleştir"
                            >
                              <i className="bi bi-check-circle"></i>
                            </button>
                            <button
                              type="button"
                              className="btn btn-outline-warning"
                              onClick={() => handleUserAction(user.id, 'deactivate')}
                              disabled={isLoading}
                              title="Pasifleştir"
                            >
                              <i className="bi bi-pause-circle"></i>
                            </button>
                            <button
                              type="button"
                              className="btn btn-outline-danger"
                              onClick={() => handleUserAction(user.id, 'delete')}
                              disabled={isLoading}
                              title="Sil"
                            >
                              <i className="bi bi-trash"></i>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* Sayfalama */}
        <div className="d-flex justify-content-between align-items-center mt-3">
          <div>
            <span className="text-muted">
              Toplam {filteredUsers.length} kullanıcı gösteriliyor
            </span>
          </div>
          <nav>
            <ul className="pagination pagination-sm mb-0">
              <li className="page-item disabled">
                <a className="page-link" href="#" tabIndex={-1}>Önceki</a>
              </li>
              <li className="page-item active">
                <a className="page-link" href="#">1</a>
              </li>
              <li className="page-item">
                <a className="page-link" href="#">2</a>
              </li>
              <li className="page-item">
                <a className="page-link" href="#">3</a>
              </li>
              <li className="page-item">
                <a className="page-link" href="#">Sonraki</a>
              </li>
            </ul>
          </nav>
        </div>
      </div>
    </AdminLayout>
  );
};

export default UserManagement;
