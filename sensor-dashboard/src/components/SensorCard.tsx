import React, { useState } from 'react';
import { Line } from 'react-chartjs-2';
import { useTheme } from '../context/ThemeContext';
import { AlertConfig } from '../services/dataAnalysis';

interface Alert {
  id: string;
  type: 'temperature' | 'humidity';
  value: number;
  threshold: number;
  timestamp: string;
  status: 'high' | 'low';
  sensorId: string;
}

interface SensorCardProps {
  id: string;
  name: string;
  temperature: number;
  humidity: number;
  timestamp: string;
  thresholds: AlertConfig;
  alerts: Alert[];
  historyData?: { timestamp: string; temperature: number; humidity: number }[];
  trendData: { time: string; value: number }[];
  onGoToSettings?: (id: string) => void;
  onShowHistory?: () => void;
}

const SensorCard: React.FC<SensorCardProps> = ({
  id,
  name,
  temperature,
  humidity,
  timestamp,
  alerts,
  thresholds,
  historyData,
  trendData,
  onGoToSettings,
  onShowHistory,
}) => {
  const [showSettings, setShowSettings] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const { isDarkMode } = useTheme();

  const getStatusColor = (value: number, type: 'temperature' | 'humidity'): string => {
    if (type === 'temperature') {
      if (value > thresholds.tempMax) return 'danger';
      if (value < thresholds.tempMin) return 'info';
      return 'success';
    } else {
      if (value > thresholds.humMax) return 'danger';
      if (value < thresholds.humMin) return 'info';
    return 'success';
    }
  };

  const getStatusText = (value: number, type: 'temperature' | 'humidity'): string => {
    if (type === 'temperature') {
      if (value > thresholds.tempMax) return 'Yüksek';
      if (value < thresholds.tempMin) return 'Düşük';
      return 'Normal';
    } else {
      if (value > thresholds.humMax) return 'Yüksek';
      if (value < thresholds.humMin) return 'Düşük';
      return 'Normal';
    }
  };

  const formatTime = (timestamp: string): string => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffMins < 1) return 'Şimdi';
    if (diffMins < 60) return `${diffMins} dk önce`;
    if (diffHours < 24) return `${diffHours} saat önce`;
    if (diffDays < 7) return `${diffDays} gün önce`;
    return date.toLocaleDateString('tr-TR');
  };

  const getTrendIcon = (value: number, type: 'temperature' | 'humidity'): string => {
    // Basit trend hesaplama (gerçek implementasyonda son birkaç değer karşılaştırılır)
    const mid = type === 'temperature' ? (thresholds.tempMax + thresholds.tempMin) / 2 : (thresholds.humMax + thresholds.humMin) / 2;
    if (value > mid + 1) return 'bi-trending-up';
    if (value < mid - 1) return 'bi-trending-down';
    return 'bi-dash-lg';
  };

  const getTrendClass = (value: number, type: 'temperature' | 'humidity'): string => {
    const mid = type === 'temperature' ? (thresholds.tempMax + thresholds.tempMin) / 2 : (thresholds.humMax + thresholds.humMin) / 2;
    if (value > mid + 1) return 'trend-up';
    if (value < mid - 1) return 'trend-down';
    return 'trend-stable';
  };

  const chartData = {
    labels: trendData.map(d => d.time),
    datasets: [
      {
        label: 'Son 6 Ölçüm',
        data: trendData.map(d => d.value),
        borderColor: '#0d6efd',
        backgroundColor: 'rgba(13,110,253,0.1)',
        fill: true,
        tension: 0.4,
        pointRadius: 3,
        borderWidth: 2,
      }
    ]
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: { display: false }, // Tek çizgi için legend kapalı
      tooltip: { enabled: true }
    },
    scales: {
      x: { display: true, title: { display: false } },
      y: { display: true, title: { display: false } }
    }
  };

  // Bağlantı paylaşma fonksiyonu
  const handleShareLink = () => {
    const url = window.location.origin + `/dashboard?sensor=${id}`;
    navigator.clipboard.writeText(url);
    alert('Bağlantı panoya kopyalandı!');
  };

  return (
    <div className="app-card sensor-card" style={{
      background: isDarkMode 
        ? 'linear-gradient(135deg, #1e293b 0%, #334155 100%)' 
        : 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
      border: isDarkMode ? '1px solid #334155' : '1px solid #e2e8f0',
      borderRadius: '16px',
      boxShadow: isDarkMode 
        ? '0 4px 6px -1px rgba(0, 0, 0, 0.3), 0 2px 4px -2px rgba(0, 0, 0, 0.3)' 
        : '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -2px rgba(0, 0, 0, 0.1)',
      transition: 'all 0.3s ease',
      position: 'relative',
      overflow: 'hidden'
    }}>
      {/* Gradient Overlay */}
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        height: '4px',
        background: 'linear-gradient(90deg, #0ea5e9 0%, #22c55e 100%)'
      }}></div>

      <div className="d-flex justify-content-between align-items-start mb-3">
        <div>
          <h5 className="mb-1 fw-bold" style={{
            color: isDarkMode ? '#f8fafc' : '#0f172a',
            fontSize: '1.25rem'
          }}>
            {name}
          </h5>
          <small className="text-muted" style={{
            color: isDarkMode ? '#94a3b8' : '#64748b'
          }}>
            Son güncelleme: {formatTime(timestamp)}
          </small>
        </div>
        
        <div className="d-flex gap-2">
          <button
            className="btn btn-sm rounded-3"
            onClick={() => onGoToSettings?.(id)}
            style={{
              background: 'transparent',
              border: isDarkMode ? '1px solid #475569' : '1px solid #cbd5e1',
              color: isDarkMode ? '#cbd5e1' : '#475569',
              transition: 'all 0.3s ease'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = isDarkMode ? 'rgba(34, 197, 94, 0.1)' : 'rgba(14, 165, 233, 0.1)';
              e.currentTarget.style.borderColor = isDarkMode ? '#22c55e' : '#0ea5e9';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'transparent';
              e.currentTarget.style.borderColor = isDarkMode ? '#475569' : '#cbd5e1';
            }}
          >
            <i className="bi bi-gear"></i>
          </button>
          
          <button
            className="btn btn-sm rounded-3"
            onClick={() => onShowHistory?.()}
            style={{
              background: 'transparent',
              border: isDarkMode ? '1px solid #475569' : '1px solid #cbd5e1',
              color: isDarkMode ? '#cbd5e1' : '#475569',
              transition: 'all 0.3s ease'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = isDarkMode ? 'rgba(34, 197, 94, 0.1)' : 'rgba(14, 165, 233, 0.1)';
              e.currentTarget.style.borderColor = isDarkMode ? '#22c55e' : '#0ea5e9';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'transparent';
              e.currentTarget.style.borderColor = isDarkMode ? '#475569' : '#cbd5e1';
            }}
          >
            <i className="bi bi-clock-history"></i>
          </button>
        </div>
      </div>

      <div className="row g-3">
        {/* Sıcaklık Kartı */}
        <div className="col-md-6">
          <div className="metric-card h-100" style={{
            background: isDarkMode 
              ? 'linear-gradient(135deg, #1e293b 0%, #334155 100%)' 
              : 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
            border: isDarkMode ? '1px solid #334155' : '1px solid #e2e8f0',
            borderRadius: '12px',
            padding: '1.5rem',
            position: 'relative',
            overflow: 'hidden'
          }}>
            <div style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              height: '3px',
              background: 'linear-gradient(90deg, #ef4444 0%, #f97316 100%)'
            }}></div>
            
            <div className="d-flex align-items-center justify-content-between mb-3">
              <div className="d-flex align-items-center">
                <div style={{
                  width: '48px',
                  height: '48px',
                  borderRadius: '12px',
                  background: 'linear-gradient(135deg, #ef4444 0%, #f97316 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'white',
                  fontSize: '1.5rem'
                }}>
                  <i className="bi bi-thermometer-half"></i>
                </div>
                <div className="ms-3">
                  <h6 className="mb-0 fw-bold" style={{
                    color: isDarkMode ? '#f8fafc' : '#0f172a'
                  }}>
                    Sıcaklık
                  </h6>
                  <small className="text-muted" style={{
                    color: isDarkMode ? '#94a3b8' : '#64748b'
                  }}>
                    °C
                  </small>
                </div>
              </div>
              
              <div className="text-end">
                <div className={`badge rounded-pill px-3 py-2 ${getStatusColor(temperature, 'temperature') === 'danger' ? 'bg-danger' : getStatusColor(temperature, 'temperature') === 'info' ? 'bg-info' : 'bg-success'}`}>
                  {getStatusText(temperature, 'temperature')}
                </div>
              </div>
            </div>
            
            <div className="d-flex align-items-end justify-content-between">
              <div>
                <div className="metric-value" style={{
                  fontSize: '2.5rem',
                  fontWeight: '700',
                  color: isDarkMode ? '#f8fafc' : '#0f172a',
                  lineHeight: '1'
                }}>
                  {temperature?.toFixed(1) || '--'}
                </div>
                <div className="metric-label" style={{
                  fontSize: '0.875rem',
                  color: isDarkMode ? '#94a3b8' : '#64748b',
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                  fontWeight: '600'
                }}>
                  °Celsius
                </div>
              </div>
              
              <div className="text-end">
                <i className={`bi ${getTrendIcon(temperature, 'temperature')} fs-4 ${getTrendClass(temperature, 'temperature')}`}></i>
                <div className="mt-1">
                  <small className="text-muted" style={{
                    color: isDarkMode ? '#94a3b8' : '#64748b'
                  }}>
                    {thresholds.tempMin}° - {thresholds.tempMax}°
                  </small>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Nem Kartı */}
        <div className="col-md-6">
          <div className="metric-card h-100" style={{
            background: isDarkMode 
              ? 'linear-gradient(135deg, #1e293b 0%, #334155 100%)' 
              : 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
            border: isDarkMode ? '1px solid #334155' : '1px solid #e2e8f0',
            borderRadius: '12px',
            padding: '1.5rem',
            position: 'relative',
            overflow: 'hidden'
          }}>
            <div style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              height: '3px',
              background: 'linear-gradient(90deg, #22c55e 0%, #0ea5e9 100%)'
            }}></div>
            
            <div className="d-flex align-items-center justify-content-between mb-3">
              <div className="d-flex align-items-center">
                <div style={{
                  width: '48px',
                  height: '48px',
                  borderRadius: '12px',
                  background: 'linear-gradient(135deg, #22c55e 0%, #0ea5e9 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'white',
                  fontSize: '1.5rem'
                }}>
                  <i className="bi bi-droplet-half"></i>
                </div>
                <div className="ms-3">
                  <h6 className="mb-0 fw-bold" style={{
                    color: isDarkMode ? '#f8fafc' : '#0f172a'
                  }}>
                    Nem
                  </h6>
                  <small className="text-muted" style={{
                    color: isDarkMode ? '#94a3b8' : '#64748b'
                  }}>
                    %
                  </small>
                </div>
              </div>
              
              <div className="text-end">
                <div className={`badge rounded-pill px-3 py-2 ${getStatusColor(humidity, 'humidity') === 'danger' ? 'bg-danger' : getStatusColor(humidity, 'humidity') === 'info' ? 'bg-info' : 'bg-success'}`}>
                  {getStatusText(humidity, 'humidity')}
                </div>
              </div>
            </div>
            
            <div className="d-flex align-items-end justify-content-between">
              <div>
                <div className="metric-value" style={{
                  fontSize: '2.5rem',
                  fontWeight: '700',
                  color: isDarkMode ? '#f8fafc' : '#0f172a',
                  lineHeight: '1'
                }}>
                  {humidity?.toFixed(1) || '--'}
                </div>
                <div className="metric-label" style={{
                  fontSize: '0.875rem',
                  color: isDarkMode ? '#94a3b8' : '#64748b',
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                  fontWeight: '600'
                }}>
                  Yüzde
                </div>
              </div>
              
              <div className="text-end">
                <i className={`bi ${getTrendIcon(humidity, 'humidity')} fs-4 ${getTrendClass(humidity, 'humidity')}`}></i>
                <div className="mt-1">
                  <small className="text-muted" style={{
                    color: isDarkMode ? '#94a3b8' : '#64748b'
                  }}>
                    {thresholds.humMin}% - {thresholds.humMax}%
                  </small>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Alarmlar */}
      {alerts.length > 0 && (
        <div className="mt-3">
          <h6 className="mb-2 fw-bold" style={{
            color: isDarkMode ? '#f8fafc' : '#0f172a'
          }}>
            <i className="bi bi-exclamation-triangle me-2 text-warning"></i>
            Aktif Alarmlar ({alerts.length})
          </h6>
          <div className="row g-2">
            {alerts.slice(0, 3).map((alert, index) => (
              <div key={index} className="col-12">
                <div className="alert alert-warning py-2 px-3 mb-0" style={{
                  background: isDarkMode ? 'rgba(245, 158, 11, 0.1)' : 'rgba(245, 158, 11, 0.1)',
                  border: isDarkMode ? '1px solid rgba(245, 158, 11, 0.3)' : '1px solid rgba(245, 158, 11, 0.3)',
                  borderRadius: '8px',
                  color: isDarkMode ? '#f59e0b' : '#92400e'
                }}>
                  <small>
                    <strong>{alert.type === 'temperature' ? 'Sıcaklık' : 'Nem'}</strong> {alert.status === 'high' ? 'yüksek' : 'düşük'}: {alert.value} {alert.type === 'temperature' ? '°C' : '%'}
                  </small>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default SensorCard;

// Örnek veri yapısı
const trendData = [
  {
    label: 'Smart Meter A',
    color: 'rgb(255, 99, 132)', // kırmızı
    data: [210, 215, 200, 198, 202, 196]
  },
  {
    label: 'Smart Meter B',
    color: 'rgb(75, 192, 192)', // yeşil
    data: [190, 195, 200, 205, 210, 205]
  },
  {
    label: 'Smart Meter C',
    color: 'rgb(54, 162, 235)', // mavi
    data: [220, 225, 230, 235, 240, 235]
  }
];
const labels = ['15:48', '15:49', '15:50', '15:51', '15:52', '15:53'];