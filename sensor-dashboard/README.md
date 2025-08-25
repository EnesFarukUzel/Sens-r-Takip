# Sensör İzleme Sistemi - Admin Paneli

Bu proje, sensör verilerini izlemek ve yönetmek için geliştirilmiş bir web uygulamasıdır.

## 🚀 Özellikler

### Genel Kullanıcı Özellikleri
- Sensör verilerini gerçek zamanlı izleme
- Veri analizi ve görselleştirme
- Alarm geçmişi ve bildirimler
- Profil yönetimi ve ayarlar

### Admin Paneli Özellikleri
- Kullanıcı yönetimi
- Sensör yönetimi
- Sistem ayarları
- Raporlar ve istatistikler
- Bugün kayıt olan kullanıcıları görüntüleme
- Onay bekleyen kullanıcıları yönetme

## 🔐 Giriş Bilgileri

### Admin Kullanıcı
- **Kullanıcı Adı:** `admin` (veya kullanıcı adında "admin" kelimesi geçen herhangi bir kullanıcı)
- **Şifre:** Herhangi bir şifre
- **Rol:** Admin
- **Yönlendirme:** Login sonrası `/admin` sayfasına yönlendirilir

### Normal Kullanıcı
- **Kullanıcı Adı:** `admin` kelimesi içermeyen herhangi bir kullanıcı adı
- **Şifre:** Herhangi bir şifre
- **Rol:** User
- **Yönlendirme:** Login sonrası `/` (ana sayfa) sayfasına yönlendirilir

## 🛠️ Kurulum

1. Proje dizinine gidin:
```bash
cd sensor-dashboard
```

2. Bağımlılıkları yükleyin:
```bash
npm install
```

3. Projeyi başlatın:
```bash
npm start
```

4. Tarayıcıda `http://localhost:3000` adresini açın

## 🔧 Teknik Detaylar

### Rol Tabanlı Yönlendirme
- Admin kullanıcılar login sonrası otomatik olarak admin paneline yönlendirilir
- Normal kullanıcılar ana sayfaya yönlendirilir
- Admin kullanıcılar header'da "Admin Panel" linkini görür

### Mock Authentication
- Backend bağlantısı olmadığında mock authentication kullanılır
- Kullanıcı adında "admin" kelimesi geçen kullanıcılar otomatik olarak admin rolü alır

### Responsive Tasarım
- Bootstrap 5 kullanılarak responsive tasarım
- Dark/Light tema desteği
- Modern ve kullanıcı dostu arayüz

## 📱 Kullanım

1. **Login Sayfası:** `/login` adresinden giriş yapın
2. **Admin Panel:** Admin kullanıcılar otomatik olarak `/admin` sayfasına yönlendirilir
3. **Normal Dashboard:** Normal kullanıcılar ana sayfaya yönlendirilir
4. **Navigasyon:** Header'daki menüler ile farklı sayfalara erişim

## 🎨 Tema Desteği

- **Light Mode:** Varsayılan tema
- **Dark Mode:** Koyu tema seçeneği
- Header'daki tema değiştirici butonu ile tema değiştirilebilir

## 🔒 Güvenlik

- JWT token tabanlı authentication
- Rol tabanlı erişim kontrolü
- Korumalı rotalar (PrivateRoute, AdminRoute)
- Otomatik token yenileme

## 📊 Admin Panel Modülleri

- **Dashboard:** Genel sistem durumu ve istatistikler
- **Kullanıcı Yönetimi:** Kullanıcı ekleme, düzenleme, silme
- **Sensör Yönetimi:** Sensör ekleme, düzenleme, izleme
- **Bugün Kayıt Olanlar:** Günlük kayıt istatistikleri
- **Sistem Ayarları:** Sistem konfigürasyonu
- **Raporlar:** Detaylı sistem raporları

## 🚀 Gelecek Özellikler

- Gerçek backend entegrasyonu
- Push notification desteği
- Mobil uygulama
- API dokümantasyonu
- Çoklu dil desteği
