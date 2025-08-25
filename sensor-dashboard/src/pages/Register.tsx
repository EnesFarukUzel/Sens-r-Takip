import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import '../styles/login.css';

const Register: React.FC = () => {
  const { isDarkMode } = useTheme();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isAnimating, setIsAnimating] = useState(false);

  // Sayfa yüklendiğinde animasyon başlat
  useEffect(() => {
    setIsAnimating(true);
  }, []);

  const handleInputChange = (field: keyof typeof formData) => (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    setFormData(prev => ({
      ...prev,
      [field]: e.target.value
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.username || !formData.email || !formData.password || !formData.confirmPassword) {
      setError('Tüm alanları doldurun!');
      setSuccess('');
      return;
    }
    if (formData.password !== formData.confirmPassword) {
      setError('Şifreler eşleşmiyor!');
      setSuccess('');
      return;
    }
    setError('');
    setSuccess('Kayıt başarılı! Giriş yapabilirsiniz.');
    setTimeout(() => {
      navigate('/login'); // Login sayfasına yönlendir
    }, 1000); // 1 saniye sonra yönlendir
  };

  // Sosyal giriş butonları için demo fonksiyonlar
  const handleGoogle = () => alert('Google ile kayıt ol (demo)');
  const handleFacebook = () => alert('Facebook ile kayıt ol (demo)');
  const handleApple = () => alert('Apple ile kayıt ol (demo)');

  return (
    <div className="login-split-bg">
      <div className={`login-split-container ${isAnimating ? 'animate-in' : ''}`}>
        <div className="login-split-left">
          <div className="brand-section">
            <img src="/netfour.png" alt="Register Illustration" className="login-illustration" />
            <div className="brand-text">
              <h1 className="brand-title">NETFOUR</h1>
            </div>
          </div>
        </div>
        <div className="login-split-right">
          <div className="login-form-box">
            <div className="welcome-text">
              <h2 className="login-title">Hesap Oluştur</h2>
              <p className="login-subtitle">Yeni hesabınızı oluşturun</p>
            </div>
            
            {/* Sosyal medya ile kayıt */}
            <div className="social-login-section">
              <div className="social-buttons">
                <button type="button" className="social-btn facebook" onClick={handleFacebook}>
                  <i className="bi bi-facebook"></i>
                </button>
                <button type="button" className="social-btn google" onClick={handleGoogle}>
                  <i className="bi bi-google"></i>
                </button>
                <button type="button" className="social-btn apple" onClick={handleApple}>
                  <i className="bi bi-apple"></i>
                </button>
              </div>
              <div className="divider">
                <span>veya e-posta ile kayıt ol</span>
              </div>
            </div>
            
            {error && (
              <div className="alert alert-danger animate-shake" role="alert">
                <i className="bi bi-exclamation-triangle me-2"></i>
                {error}
              </div>
            )}
            {success && (
              <div className="alert alert-success" role="alert">
                <i className="bi bi-check-circle me-2"></i>
                {success}
              </div>
            )}
            
            <form onSubmit={handleSubmit} className="login-form">
              <div className="form-group">
                <label htmlFor="username" className="form-label">
                  <i className="bi bi-person me-2"></i>
                  Kullanıcı Adı
                </label>
                <input
                  type="text"
                  className="form-control"
                  id="username"
                  value={formData.username}
                  onChange={handleInputChange('username')}
                  required
                  autoComplete="username"
                  placeholder="Kullanıcı adınızı girin"
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="email" className="form-label">
                  <i className="bi bi-envelope me-2"></i>
                  E-posta
                </label>
                <input
                  type="email"
                  className="form-control"
                  id="email"
                  value={formData.email}
                  onChange={handleInputChange('email')}
                  required
                  autoComplete="email"
                  placeholder="E-posta adresinizi girin"
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="password" className="form-label">
                  <i className="bi bi-lock me-2"></i>
                  Şifre
                </label>
                <div className="input-group">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    className="form-control"
                    id="password"
                    value={formData.password}
                    onChange={handleInputChange('password')}
                    required
                    autoComplete="new-password"
                    placeholder="Şifrenizi girin"
                  />
                  <button
                    type="button"
                    className="btn btn-outline-secondary"
                    tabIndex={-1}
                    onClick={() => setShowPassword((prev) => !prev)}
                    aria-label={showPassword ? "Şifreyi gizle" : "Şifreyi göster"}
                  >
                    <i className={`bi ${showPassword ? 'bi-eye-slash' : 'bi-eye'}`}></i>
                  </button>
                </div>
              </div>
              
              <div className="form-group">
                <label htmlFor="confirmPassword" className="form-label">
                  <i className="bi bi-shield-lock me-2"></i>
                  Şifre Tekrar
                </label>
                <div className="input-group">
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    className="form-control"
                    id="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleInputChange('confirmPassword')}
                    required
                    autoComplete="new-password"
                    placeholder="Şifrenizi tekrar girin"
                  />
                  <button
                    type="button"
                    className="btn btn-outline-secondary"
                    tabIndex={-1}
                    onClick={() => setShowConfirmPassword((prev) => !prev)}
                    aria-label={showConfirmPassword ? "Şifreyi gizle" : "Şifreyi göster"}
                  >
                    <i className={`bi ${showConfirmPassword ? 'bi-eye-slash' : 'bi-eye'}`}></i>
                  </button>
                </div>
              </div>
              
              <button type="submit" className="btn btn-primary w-100 login-btn">
                <i className="bi bi-person-plus me-2"></i>
                Kayıt Ol
              </button>
              
              <div className="register-section">
                <div className="divider">
                  <span>veya</span>
                </div>
                <p className="register-text">
                  Zaten hesabınız var mı? 
                  <Link to="/login" className="register-link">Giriş Yap</Link>
                </p>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;