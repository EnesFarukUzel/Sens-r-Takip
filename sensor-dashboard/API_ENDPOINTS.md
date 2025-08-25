# API Endpoints - Admin Panel

Bu dokümantasyon, admin paneli için gerekli backend API endpoint'lerini ve veri yapılarını açıklar.

## 🔐 Authentication

Tüm admin API endpoint'leri JWT token gerektirir. Token `Authorization: Bearer <token>` header'ında gönderilmelidir.

## 📊 Dashboard API

### GET `/api/admin/dashboard`

Dashboard için genel istatistikleri ve verileri döndürür.

**Response:**
```json
{
  "users": [
    {
      "id": 1,
      "name": "Ahmet Yılmaz",
      "email": "ahmet@email.com",
      "status": "active",
      "registrationDate": "2024-01-15",
      "lastLogin": "2024-01-20",
      "avatar": "A"
    }
  ],
  "activities": [
    {
      "id": 1,
      "user": "Ahmet Yılmaz",
      "action": "Yeni hesap oluşturdu",
      "timestamp": "2 saat önce",
      "status": "completed"
    }
  ],
  "alerts": [
    {
      "id": 1,
      "type": "warning",
      "message": "Sensör-004 düşük pil seviyesi (%12)",
      "timestamp": "5 dakika önce",
      "priority": "medium"
    }
  ],
  "stats": {
    "totalUsers": 1247,
    "todayRegistrations": 23,
    "pendingApprovals": 8,
    "activeSensors": 156,
    "totalSensors": 180,
    "systemUptime": 99.8,
    "dataStorage": 75.2,
    "activeAlerts": 3
  }
}
```

## 👥 User Management API

### GET `/api/admin/users`

Tüm kullanıcıları listeler.

**Response:**
```json
{
  "users": [
    {
      "id": 1,
      "name": "Ahmet Yılmaz",
      "email": "ahmet@email.com",
      "username": "ahmet",
      "status": "active",
      "registrationDate": "2024-01-15",
      "lastLogin": "2024-01-20",
      "role": "user"
    }
  ]
}
```

### PUT `/api/admin/users/{userId}/status`

Kullanıcı durumunu günceller.

**Request Body:**
```json
{
  "status": "active" // "active", "pending", "inactive"
}
```

### DELETE `/api/admin/users/{userId}`

Kullanıcıyı siler.

## 📝 Today Registrations API

### GET `/api/admin/today-registrations`

Bugün kayıt olan kullanıcıları listeler.

**Response:**
```json
{
  "registrations": [
    {
      "id": 1,
      "name": "Ahmet Yılmaz",
      "email": "ahmet@email.com",
      "registrationTime": "2024-01-22 09:15:30",
      "ipAddress": "192.168.1.100",
      "userAgent": "Chrome/120.0.0.0",
      "status": "pending",
      "avatar": "A"
    }
  ]
}
```

### PUT `/api/admin/registrations/{registrationId}/status`

Kayıt durumunu günceller.

**Request Body:**
```json
{
  "status": "approved" // "approved", "pending", "rejected"
}
```

## 🔌 Sensor Management API

### GET `/api/admin/sensors`

Tüm sensörleri listeler.

**Response:**
```json
{
  "sensors": [
    {
      "id": 1,
      "name": "Sensör-001",
      "location": "Oda 101",
      "type": "both",
      "status": "active",
      "lastReading": {
        "temperature": 23.5,
        "humidity": 45.2,
        "timestamp": "2024-01-22 14:30:00"
      },
      "batteryLevel": 85,
      "signalStrength": 95,
      "firmwareVersion": "v2.1.0",
      "installationDate": "2024-01-10"
    }
  ]
}
```

### PUT `/api/admin/sensors/{sensorId}/status`

Sensör durumunu günceller.

**Request Body:**
```json
{
  "status": "maintenance" // "active", "inactive", "maintenance", "error"
}
```

### DELETE `/api/admin/sensors/{sensorId}`

Sensörü siler.

## ⚙️ System Settings API

### GET `/api/admin/system-settings`

Sistem ayarlarını listeler.

**Response:**
```json
{
  "settings": [
    {
      "id": "system_name",
      "name": "Sistem Adı",
      "value": "Sensör Yönetim Sistemi",
      "type": "text",
      "category": "genel",
      "description": "Sistemin görünen adı"
    },
    {
      "id": "data_retention_days",
      "name": "Veri Saklama Süresi (Gün)",
      "value": 30,
      "type": "number",
      "category": "veri",
      "description": "Sensör verilerinin saklanma süresi"
    },
    {
      "id": "auto_backup",
      "name": "Otomatik Yedekleme",
      "value": true,
      "type": "boolean",
      "category": "veri",
      "description": "Günlük otomatik yedekleme"
    }
  ]
}
```

### PUT `/api/admin/system-settings`

Sistem ayarlarını günceller.

**Request Body:**
```json
{
  "settings": [
    {
      "id": "system_name",
      "value": "Yeni Sistem Adı"
    }
  ]
}
```

## 🔍 General API

### GET `/api/sensors`

Genel sensör listesi (Dashboard için).

**Response:**
```json
{
  "sensors": [
    {
      "id": "101",
      "name": "Sensör 101",
      "type": "both"
    }
  ]
}
```

### GET `/api/notifications`

Kullanıcı bildirimleri.

**Response:**
```json
{
  "notifications": [
    {
      "id": 1,
      "text": "Sıcaklık sensörü kritik seviyede!",
      "isNew": true
    }
  ]
}
```

## 📋 Veri Tipleri

### Status Enum'ları

**User Status:**
- `active` - Aktif kullanıcı
- `pending` - Onay bekleyen kullanıcı
- `inactive` - Pasif kullanıcı

**Sensor Status:**
- `active` - Aktif sensör
- `inactive` - Pasif sensör
- `maintenance` - Bakımda
- `error` - Hata durumunda

**Registration Status:**
- `pending` - Onay bekliyor
- `approved` - Onaylandı
- `rejected` - Reddedildi

**Alert Priority:**
- `low` - Düşük öncelik
- `medium` - Orta öncelik
- `high` - Yüksek öncelik

**Alert Type:**
- `info` - Bilgi
- `warning` - Uyarı
- `error` - Hata
- `success` - Başarı

## 🚀 Örnek Kullanım

### Frontend'de API çağrısı:

```typescript
import { fetchDashboardData } from '../services/adminApi';

const loadDashboard = async () => {
  try {
    const data = await fetchDashboardData();
    setUsers(data.users);
    setStats(data.stats);
  } catch (error) {
    console.error('Dashboard yüklenirken hata:', error);
  }
};
```

### Backend'de endpoint implementasyonu:

```javascript
// Express.js örneği
app.get('/api/admin/dashboard', authenticateToken, async (req, res) => {
  try {
    const dashboardData = await getDashboardData();
    res.json(dashboardData);
  } catch (error) {
    res.status(500).json({ error: 'Dashboard verileri yüklenemedi' });
  }
});
```

## 📝 Notlar

1. **Error Handling:** Tüm endpoint'ler hata durumunda uygun HTTP status code'ları döndürmelidir
2. **Validation:** Request body'lerde gelen veriler validate edilmelidir
3. **Pagination:** Büyük veri setleri için pagination desteği eklenebilir
4. **Filtering:** Kullanıcı ve sensör listelerinde filtreleme desteği eklenebilir
5. **Real-time Updates:** WebSocket veya Server-Sent Events ile gerçek zamanlı güncellemeler eklenebilir
