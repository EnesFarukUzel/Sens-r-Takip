// Admin Panel API Servisleri
import { getAuthHeaders } from './auth';

const ADMIN_BASE_URL = '/api/admin';

// Dashboard verilerini getir
export const fetchDashboardData = async () => {
  try {
    const response = await fetch(`${ADMIN_BASE_URL}/dashboard`, {
      headers: getAuthHeaders()
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Dashboard verileri yüklenirken hata:', error);
    throw error;
  }
};

// Kullanıcıları getir
export const fetchUsers = async () => {
  try {
    const response = await fetch(`${ADMIN_BASE_URL}/users`, {
      headers: getAuthHeaders()
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Kullanıcılar yüklenirken hata:', error);
    throw error;
  }
};

// Bugünkü kayıtları getir
export const fetchTodayRegistrations = async () => {
  try {
    const response = await fetch(`${ADMIN_BASE_URL}/today-registrations`, {
      headers: getAuthHeaders()
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Bugünkü kayıtlar yüklenirken hata:', error);
    throw error;
  }
};

// Sensörleri getir
export const fetchSensors = async () => {
  try {
    const response = await fetch(`${ADMIN_BASE_URL}/sensors`, {
      headers: getAuthHeaders()
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Sensörler yüklenirken hata:', error);
    throw error;
  }
};

// Sistem ayarlarını getir
export const fetchSystemSettings = async () => {
  try {
    const response = await fetch(`${ADMIN_BASE_URL}/system-settings`, {
      headers: getAuthHeaders()
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Sistem ayarları yüklenirken hata:', error);
    throw error;
  }
};

// Sistem ayarlarını güncelle
export const updateSystemSettings = async (settings: any) => {
  try {
    const response = await fetch(`${ADMIN_BASE_URL}/system-settings`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(settings)
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Sistem ayarları güncellenirken hata:', error);
    throw error;
  }
};

// Kullanıcı durumunu güncelle
export const updateUserStatus = async (userId: number, status: string) => {
  try {
    const response = await fetch(`${ADMIN_BASE_URL}/users/${userId}/status`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify({ status })
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Kullanıcı durumu güncellenirken hata:', error);
    throw error;
  }
};

// Kullanıcıyı sil
export const deleteUser = async (userId: number) => {
  try {
    const response = await fetch(`${ADMIN_BASE_URL}/users/${userId}`, {
      method: 'DELETE',
      headers: getAuthHeaders()
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Kullanıcı silinirken hata:', error);
    throw error;
  }
};

// Sensör durumunu güncelle
export const updateSensorStatus = async (sensorId: number, status: string) => {
  try {
    const response = await fetch(`${ADMIN_BASE_URL}/sensors/${sensorId}/status`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify({ status })
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Sensör durumu güncellenirken hata:', error);
    throw error;
  }
};

// Sensörü sil
export const deleteSensor = async (sensorId: number) => {
  try {
    const response = await fetch(`${ADMIN_BASE_URL}/sensors/${sensorId}`, {
      method: 'DELETE',
      headers: getAuthHeaders()
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Sensör silinirken hata:', error);
    throw error;
  }
};

// Kayıt durumunu güncelle
export const updateRegistrationStatus = async (registrationId: number, status: string) => {
  try {
    const response = await fetch(`${ADMIN_BASE_URL}/registrations/${registrationId}/status`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify({ status })
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Kayıt durumu güncellenirken hata:', error);
    throw error;
  }
};
