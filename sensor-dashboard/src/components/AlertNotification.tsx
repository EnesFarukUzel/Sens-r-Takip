import React, { useState, useEffect } from 'react';
import { Alert } from 'react-bootstrap';
import { Alert as AlertType } from '../services/dataAnalysis';

interface AlertNotificationProps {
  alerts: AlertType[];
}

const AlertNotification: React.FC<AlertNotificationProps> = ({ alerts }) => {
  // Alert'leri göster
  const [visibleAlerts, setVisibleAlerts] = useState(alerts || []);
  const [showNotification, setShowNotification] = useState(false);
  const [settings, setSettings] = useState({
    notificationsEnabled: true,
    soundEnabled: true
  });

  useEffect(() => {
    const savedSettings = localStorage.getItem('alertSettings');
    if (savedSettings) {
      const parsedSettings = JSON.parse(savedSettings);
      setSettings({
        notificationsEnabled: parsedSettings.notificationsEnabled,
        soundEnabled: parsedSettings.soundEnabled
      });
    }
  }, []);

  useEffect(() => {
    // Alerts prop'unu güvenli şekilde kontrol et
    if (!alerts || !Array.isArray(alerts) || alerts.length === 0) {
      console.log('⚠️ Alerts prop geçersiz veya boş:', alerts);
      return;
    }

    if (settings.notificationsEnabled) {
      const latestAlert = alerts[alerts.length - 1];
      
      // Alert'in geçerli olup olmadığını kontrol et
      if (!latestAlert || typeof latestAlert !== 'object') {
        console.warn('⚠️ Latest alert geçersiz:', latestAlert);
        return;
      }
      
      if (!latestAlert.status || !latestAlert.type || typeof latestAlert.value !== 'number') {
        console.warn('⚠️ Alert eksik özellikler:', latestAlert);
        return;
      }
      
      setShowNotification(true);

      // Sesli uyarı
      if (settings.soundEnabled) {
        new Audio('/alert.mp3').play().catch(console.error);
      }

      // Tarayıcı bildirimi
      if (Notification.permission === 'granted') {
        new Notification('Sensör Uyarısı', {
          body: `${latestAlert.type === 'temperature' ? 'Sıcaklık' : 'Nem'} ${latestAlert.status === 'high' ? 'yüksek' : 'düşük'}: ${latestAlert.value.toFixed(1)}${latestAlert.type === 'temperature' ? '°C' : '%'}`,
          icon: '/logo192.png'
        });
      }

      // 5 saniye sonra bildirimi kapat
      setTimeout(() => setShowNotification(false), 5000);
    }
  }, [alerts, settings]);

  // Alerts prop'unu güvenli şekilde kontrol et
  if (!alerts || !Array.isArray(alerts) || alerts.length === 0 || !showNotification) {
    return null;
  }

  const latestAlert = alerts[alerts.length - 1];
  
  // Alert'in geçerli olup olmadığını kontrol et
  if (!latestAlert || typeof latestAlert !== 'object') {
    console.warn('⚠️ Latest alert geçersiz, bildirim gösterilmiyor:', latestAlert);
    return null;
  }
  
  if (!latestAlert.status || !latestAlert.type || typeof latestAlert.value !== 'number') {
    console.warn('⚠️ Alert eksik özellikler, bildirim gösterilmiyor:', latestAlert);
    return null;
  }

  return (
    <div className="position-fixed bottom-4 end-4" style={{ zIndex: 1050 }}>
      <div 
        className={`alert ${latestAlert.status === 'high' ? 'alert-danger' : 'alert-info'} alert-dismissible fade show shadow-lg`}
        role="alert"
      >
        <div className="d-flex align-items-center">
          <i className={`bi ${latestAlert.type === 'temperature' ? 'bi-thermometer-high' : 'bi-droplet'} me-2`}></i>
          <div>
            <strong>
              {latestAlert.type === 'temperature' ? 'Sıcaklık' : 'Nem'} Uyarısı!
            </strong>
            <br />
            <small>
              Değer {latestAlert.status === 'high' ? 'yüksek' : 'düşük'}: {latestAlert.value.toFixed(1)}
              {latestAlert.type === 'temperature' ? '°C' : '%'}
              <br />
              Limit: {latestAlert.threshold}
              {latestAlert.type === 'temperature' ? '°C' : '%'}
            </small>
          </div>
        </div>
        <button 
          type="button" 
          className="btn-close" 
          onClick={() => setShowNotification(false)}
        ></button>
      </div>
    </div>
  );
};

export default AlertNotification; 