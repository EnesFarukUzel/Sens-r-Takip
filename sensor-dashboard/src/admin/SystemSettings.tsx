import React, { useState, useEffect } from 'react';
import AdminLayout from './AdminLayout';
import { fetchSystemSettings, updateSystemSettings } from '../services/adminApi';
import './AdminDashboard.css';

interface SystemSetting {
  id: string;
  name: string;
  value: string | number | boolean;
  type: 'text' | 'number' | 'boolean' | 'select';
  category: string;
  description: string;
  options?: string[];
}

const SystemSettings: React.FC = () => {
  const [settings, setSettings] = useState<SystemSetting[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('all');

  useEffect(() => {
    const loadSystemSettings = async () => {
      try {
        setLoading(true);
        const data = await fetchSystemSettings();
        setSettings(data.settings || []);
      } catch (error) {
        console.error('Sistem ayarları yüklenirken hata:', error);
        setSettings([]);
      } finally {
        setLoading(false);
      }
    };

    loadSystemSettings();
  }, []);

  const categories = [
    { id: 'all', name: 'Tümü', icon: 'fas fa-cogs' },
    { id: 'genel', name: 'Genel', icon: 'fas fa-cog' },
    { id: 'veri', name: 'Veri Yönetimi', icon: 'fas fa-database' },
    { id: 'bildirim', name: 'Bildirimler', icon: 'fas fa-bell' },
    { id: 'alarm', name: 'Alarmlar', icon: 'fas fa-exclamation-triangle' },
    { id: 'sensör', name: 'Sensörler', icon: 'fas fa-microchip' },
    { id: 'kullanıcı', name: 'Kullanıcılar', icon: 'fas fa-users' },
    { id: 'güvenlik', name: 'Güvenlik', icon: 'fas fa-shield-alt' }
  ];

  const filteredSettings = settings.filter(setting => 
    selectedCategory === 'all' || setting.category === selectedCategory
  );

  const handleSettingChange = (id: string, value: string | number | boolean) => {
    setSettings(prev => prev.map(setting => 
      setting.id === id ? { ...setting, value } : setting
    ));
  };

  const handleSaveSettings = async () => {
    setSaving(true);
    // Backend API çağrısı yapılacak
    setTimeout(() => {
      setSaving(false);
      // Başarı mesajı göster
    }, 2000);
  };

  const handleResetSettings = () => {
    if (window.confirm('Tüm ayarları varsayılan değerlere sıfırlamak istediğinizden emin misiniz?')) {
      // Backend API çağrısı yapılacak
      console.log('Settings reset');
    }
  };

  const renderSettingInput = (setting: SystemSetting) => {
    switch (setting.type) {
      case 'text':
        return (
          <input
            type="text"
            className="form-control"
            value={setting.value as string}
            onChange={(e) => handleSettingChange(setting.id, e.target.value)}
          />
        );
      case 'number':
        return (
          <input
            type="number"
            className="form-control"
            value={setting.value as number}
            onChange={(e) => handleSettingChange(setting.id, parseInt(e.target.value))}
          />
        );
      case 'boolean':
        return (
          <div className="form-check form-switch">
            <input
              className="form-check-input"
              type="checkbox"
              checked={setting.value as boolean}
              onChange={(e) => handleSettingChange(setting.id, e.target.checked)}
            />
          </div>
        );
      case 'select':
        return (
          <select
            className="form-select"
            value={setting.value as string}
            onChange={(e) => handleSettingChange(setting.id, e.target.value)}
          >
            {setting.options?.map(option => (
              <option key={option} value={option}>{option}</option>
            ))}
          </select>
        );
      default:
        return null;
    }
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="d-flex justify-content-center align-items-center" style={{height: '400px'}}>
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Yükleniyor...</span>
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 className="mb-1">Sistem Ayarları</h2>
          <p className="text-muted mb-0">Sistem konfigürasyonunu yönet</p>
        </div>
        <div className="d-flex gap-2">
          <button 
            className="btn btn-outline-warning btn-admin"
            onClick={handleResetSettings}
          >
            <i className="fas fa-undo me-2"></i>Varsayılana Sıfırla
          </button>
          <button 
            className="btn btn-primary btn-admin"
            onClick={handleSaveSettings}
            disabled={saving}
          >
            {saving ? (
              <>
                <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                Kaydediliyor...
              </>
            ) : (
              <>
                <i className="fas fa-save me-2"></i>Kaydet
              </>
            )}
          </button>
        </div>
      </div>

      {/* Category Filter */}
      <div className="card mb-4">
        <div className="card-body">
          <h6 className="card-title mb-3">Kategori Filtresi</h6>
          <div className="row">
            {categories.map(category => (
              <div key={category.id} className="col-md-3 col-lg-2 mb-2">
                <button
                  className={`btn btn-sm w-100 ${selectedCategory === category.id ? 'btn-primary' : 'btn-outline-primary'}`}
                  onClick={() => setSelectedCategory(category.id)}
                >
                  <i className={`${category.icon} me-1`}></i>
                  {category.name}
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Settings */}
      <div className="row">
        {filteredSettings.map(setting => (
          <div key={setting.id} className="col-lg-6 mb-4">
            <div className="card h-100">
              <div className="card-body">
                <div className="d-flex justify-content-between align-items-start mb-2">
                  <h6 className="card-title mb-0">{setting.name}</h6>
                  <span className="badge bg-secondary">{setting.category}</span>
                </div>
                <p className="card-text text-muted small mb-3">{setting.description}</p>
                <div className="mb-2">
                  {renderSettingInput(setting)}
                </div>
                <small className="text-muted">
                  ID: {setting.id}
                </small>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Save Button */}
      {filteredSettings.length > 0 && (
        <div className="card mt-4">
          <div className="card-body text-center">
            <button 
              className="btn btn-primary btn-lg"
              onClick={handleSaveSettings}
              disabled={saving}
            >
              {saving ? (
                <>
                  <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                  Ayarlar Kaydediliyor...
                </>
              ) : (
                <>
                  <i className="fas fa-save me-2"></i>
                  Tüm Değişiklikleri Kaydet
                </>
              )}
            </button>
            <p className="text-muted mt-2 mb-0">
              Değişiklikler kaydedildikten sonra sistem yeniden başlatılabilir
            </p>
          </div>
        </div>
      )}
    </AdminLayout>
  );
};

export default SystemSettings;
