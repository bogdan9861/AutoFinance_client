import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import './Auth.css';

const AuthPage = ({ onLogin, onRegister, onForgotPassword }) => {
  const [mode, setMode] = useState('login'); // 'login', 'register', 'forgot'
  const [formData, setFormData] = useState({
    // Общие поля
    email: '',
    password: '',
    
    // Поля для регистрации
    name: '',
    confirmPassword: '',
    phone: '',
    agreeTerms: false,
    
    // Поля для восстановления
    resetEmail: ''
  });
  
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [serverError, setServerError] = useState('');
  const [resetSent, setResetSent] = useState(false);

  // Валидация форм
  const validateLogin = () => {
    const newErrors = {};

    if (!formData.email.trim()) {
      newErrors.email = 'Введите email';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Введите корректный email';
    }

    if (!formData.password) {
      newErrors.password = 'Введите пароль';
    }

    return newErrors;
  };

  const validateRegister = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Введите имя';
    } else if (formData.name.length < 2) {
      newErrors.name = 'Имя должно содержать минимум 2 символа';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Введите email';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Введите корректный email';
    }

    if (!formData.password) {
      newErrors.password = 'Введите пароль';
    } else if (formData.password.length < 8) {
      newErrors.password = 'Пароль должен содержать минимум 8 символов';
    } else if (!/(?=.*[0-9])(?=.*[a-z])(?=.*[A-Z])/.test(formData.password)) {
      newErrors.password = 'Пароль должен содержать цифры, заглавные и строчные буквы';
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Подтвердите пароль';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Пароли не совпадают';
    }

    if (formData.phone && !/^\+?[\d\s-()]{10,}$/.test(formData.phone)) {
      newErrors.phone = 'Введите корректный номер телефона';
    }

    if (!formData.agreeTerms) {
      newErrors.agreeTerms = 'Необходимо принять условия использования';
    }

    return newErrors;
  };

  const validateForgot = () => {
    const newErrors = {};

    if (!formData.resetEmail.trim()) {
      newErrors.resetEmail = 'Введите email';
    } else if (!/\S+@\S+\.\S+/.test(formData.resetEmail)) {
      newErrors.resetEmail = 'Введите корректный email';
    }

    return newErrors;
  };

  // Обработчики отправки форм
  const handleLogin = async (e) => {
    e.preventDefault();
    const newErrors = validateLogin();

    if (Object.keys(newErrors).length === 0) {
      setIsLoading(true);
      setServerError('');

      try {
        // Имитация запроса к серверу
        await new Promise(resolve => setTimeout(resolve, 1500));
        
        // Здесь должен быть реальный запрос к API
        if (formData.email === 'test@test.com' && formData.password === 'Password123') {
          onLogin && onLogin({ email: formData.email });
        } else {
          setServerError('Неверный email или пароль');
        }
      } catch (error) {
        setServerError('Ошибка соединения. Попробуйте позже.');
      } finally {
        setIsLoading(false);
      }
    } else {
      setErrors(newErrors);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    const newErrors = validateRegister();

    if (Object.keys(newErrors).length === 0) {
      setIsLoading(true);
      setServerError('');

      try {
        // Имитация запроса к серверу
        await new Promise(resolve => setTimeout(resolve, 1500));
        
        // Здесь должен быть реальный запрос к API
        onRegister && onRegister({
          name: formData.name,
          email: formData.email,
          password: formData.password,
          phone: formData.phone
        });
        
        // После успешной регистрации переключаемся на вход
        setMode('login');
        setFormData(prev => ({
          ...prev,
          password: '',
          confirmPassword: ''
        }));
      } catch (error) {
        setServerError('Ошибка регистрации. Попробуйте позже.');
      } finally {
        setIsLoading(false);
      }
    } else {
      setErrors(newErrors);
    }
  };

  const handleForgot = async (e) => {
    e.preventDefault();
    const newErrors = validateForgot();

    if (Object.keys(newErrors).length === 0) {
      setIsLoading(true);
      setServerError('');

      try {
        // Имитация запроса к серверу
        await new Promise(resolve => setTimeout(resolve, 1500));
        
        onForgotPassword && onForgotPassword(formData.resetEmail);
        setResetSent(true);
      } catch (error) {
        setServerError('Ошибка отправки. Попробуйте позже.');
      } finally {
        setIsLoading(false);
      }
    } else {
      setErrors(newErrors);
    }
  };

  // Обработчик изменения полей
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));

    // Очищаем ошибку для этого поля
    if (errors[name]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
    if (serverError) setServerError('');
  };

  // Переключение режимов
  const switchMode = (newMode) => {
    setMode(newMode);
    setErrors({});
    setServerError('');
    setResetSent(false);
    setShowPassword(false);
  };

  // Анимации
  const pageVariants = {
    initial: { opacity: 0 },
    animate: { opacity: 1, transition: { duration: 0.5 } },
    exit: { opacity: 0 }
  };

  const formVariants = {
    initial: { opacity: 0, x: 50 },
    animate: { 
      opacity: 1, 
      x: 0,
      transition: { 
        type: 'spring',
        damping: 15,
        stiffness: 100,
        delay: 0.2
      }
    },
    exit: { 
      opacity: 0, 
      x: -50,
      transition: { duration: 0.2 }
    }
  };

  const titleVariants = {
    initial: { y: -20, opacity: 0 },
    animate: { 
      y: 0, 
      opacity: 1,
      transition: { 
        type: 'spring',
        damping: 12,
        delay: 0.1
      }
    }
  };

  return (
    <motion.div 
      className="auth-page"
      variants={pageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
    >
      {/* Фоновые элементы */}
      <div className="auth-page__bg-sphere auth-page__bg-sphere--1"></div>
      <div className="auth-page__bg-sphere auth-page__bg-sphere--2"></div>
      <div className="auth-page__bg-sphere auth-page__bg-sphere--3"></div>

      <div className="auth-page__container">
        {/* Левая панель с информацией */}
        <motion.div 
          className="auth-page__info"
          initial={{ x: -50, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <div className="auth-page__logo">
            <i className="fas fa-car-side"></i>
            <span>AutoFinance</span>
          </div>

          <h1 className="auth-page__info-title">
            {mode === 'login' && 'С возвращением!'}
            {mode === 'register' && 'Добро пожаловать!'}
            {mode === 'forgot' && 'Восстановление доступа'}
          </h1>

          <p className="auth-page__info-text">
            {mode === 'login' && 'Войдите в свой аккаунт чтобы управлять расходами на автомобили'}
            {mode === 'register' && 'Создайте аккаунт и начните отслеживать расходы на ваши автомобили'}
            {mode === 'forgot' && 'Мы отправим инструкцию по восстановлению пароля на вашу почту'}
          </p>

          <div className="auth-page__features">
            <div className="auth-page__feature">
              <i className="fas fa-chart-line"></i>
              <div>
                <h3>Аналитика расходов</h3>
                <p>Детальная статистика по всем автомобилям</p>
              </div>
            </div>

            <div className="auth-page__feature">
              <i className="fas fa-bell"></i>
              <div>
                <h3>Напоминания о ТО</h3>
                <p>Никогда не пропускайте обслуживание</p>
              </div>
            </div>

            <div className="auth-page__feature">
              <i className="fas fa-cloud-upload-alt"></i>
              <div>
                <h3>Облачное хранение</h3>
                <p>Все данные всегда доступны</p>
              </div>
            </div>
          </div>

          <div className="auth-page__testimonial">
            <div className="auth-page__testimonial-avatar">
              <i className="fas fa-user"></i>
            </div>
            <div className="auth-page__testimonial-content">
              <p>"Отличный сервис! Помогает контролировать все расходы на машину. Больше не пропускаю ТО."</p>
              <span>— Александр, владелец Porsche Cayenne</span>
            </div>
          </div>
        </motion.div>

        {/* Правая панель с формой */}
        <motion.div 
          className="auth-page__form-container"
          initial={{ x: 50, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          {/* Переключатель режимов */}
          <div className="auth-page__mode-switcher">
            <button
              className={`auth-page__mode-btn ${mode === 'login' ? 'auth-page__mode-btn--active' : ''}`}
              onClick={() => switchMode('login')}
            >
              Вход
            </button>
            <button
              className={`auth-page__mode-btn ${mode === 'register' ? 'auth-page__mode-btn--active' : ''}`}
              onClick={() => switchMode('register')}
            >
              Регистрация
            </button>
          </div>

          {/* Ошибка сервера */}
          <AnimatePresence>
            {serverError && (
              <motion.div 
                className="auth-page__server-error"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
              >
                <i className="fas fa-exclamation-circle"></i>
                {serverError}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Формы */}
          <AnimatePresence mode="wait">
            {mode === 'login' && (
              <motion.form
                key="login"
                className="auth-page__form"
                variants={formVariants}
                initial="initial"
                animate="animate"
                exit="exit"
                onSubmit={handleLogin}
              >
                <motion.h2 
                  className="auth-page__form-title"
                  variants={titleVariants}
                >
                  Вход в аккаунт
                </motion.h2>

                {/* Email */}
                <div className="auth-page__field">
                  <label className="auth-page__label">
                    <i className="fas fa-envelope"></i>
                    Email
                  </label>
                  <input
                    type="email"
                    name="email"
                    className={`auth-page__input ${errors.email ? 'auth-page__input--error' : ''}`}
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="example@mail.com"
                    disabled={isLoading}
                  />
                  {errors.email && (
                    <span className="auth-page__error">{errors.email}</span>
                  )}
                </div>

                {/* Пароль */}
                <div className="auth-page__field">
                  <label className="auth-page__label">
                    <i className="fas fa-lock"></i>
                    Пароль
                  </label>
                  <div className="auth-page__password-field">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      name="password"
                      className={`auth-page__input ${errors.password ? 'auth-page__input--error' : ''}`}
                      value={formData.password}
                      onChange={handleChange}
                      placeholder="Введите пароль"
                      disabled={isLoading}
                    />
                    <button
                      type="button"
                      className="auth-page__password-toggle"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      <i className={`fas ${showPassword ? 'fa-eye-slash' : 'fa-eye'}`}></i>
                    </button>
                  </div>
                  {errors.password && (
                    <span className="auth-page__error">{errors.password}</span>
                  )}
                </div>

                {/* Дополнительные опции */}
                <div className="auth-page__options">
                  <label className="auth-page__checkbox">
                    <input type="checkbox" />
                    <span className="auth-page__checkbox-text">Запомнить меня</span>
                  </label>
                  <button
                    type="button"
                    className="auth-page__forgot-link"
                    onClick={() => switchMode('forgot')}
                  >
                    Забыли пароль?
                  </button>
                </div>

                {/* Кнопка входа */}
                <motion.button
                  type="submit"
                  className="auth-page__submit-btn"
                  disabled={isLoading}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  {isLoading ? (
                    <>
                      <i className="fas fa-spinner fa-spin"></i>
                      Вход...
                    </>
                  ) : (
                    <>
                      <i className="fas fa-sign-in-alt"></i>
                      Войти
                    </>
                  )}
                </motion.button>

                {/* Альтернативный вход */}
                <div className="auth-page__social-login">
                  <p className="auth-page__social-text">Или войдите через</p>
                  <div className="auth-page__social-buttons">
                    <button type="button" className="auth-page__social-btn auth-page__social-btn--google">
                      <i className="fab fa-google"></i>
                    </button>
                    <button type="button" className="auth-page__social-btn auth-page__social-btn--yandex">
                      <i className="fab fa-yandex"></i>
                    </button>
                    <button type="button" className="auth-page__social-btn auth-page__social-btn--vk">
                      <i className="fab fa-vk"></i>
                    </button>
                  </div>
                </div>
              </motion.form>
            )}

            {mode === 'register' && (
              <motion.form
                key="register"
                className="auth-page__form"
                variants={formVariants}
                initial="initial"
                animate="animate"
                exit="exit"
                onSubmit={handleRegister}
              >
                <motion.h2 
                  className="auth-page__form-title"
                  variants={titleVariants}
                >
                  Создание аккаунта
                </motion.h2>

                {/* Имя */}
                <div className="auth-page__field">
                  <label className="auth-page__label">
                    <i className="fas fa-user"></i>
                    Имя *
                  </label>
                  <input
                    type="text"
                    name="name"
                    className={`auth-page__input ${errors.name ? 'auth-page__input--error' : ''}`}
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="Введите ваше имя"
                    disabled={isLoading}
                  />
                  {errors.name && (
                    <span className="auth-page__error">{errors.name}</span>
                  )}
                </div>

                {/* Email */}
                <div className="auth-page__field">
                  <label className="auth-page__label">
                    <i className="fas fa-envelope"></i>
                    Email *
                  </label>
                  <input
                    type="email"
                    name="email"
                    className={`auth-page__input ${errors.email ? 'auth-page__input--error' : ''}`}
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="example@mail.com"
                    disabled={isLoading}
                  />
                  {errors.email && (
                    <span className="auth-page__error">{errors.email}</span>
                  )}
                </div>

                {/* Телефон */}
                <div className="auth-page__field">
                  <label className="auth-page__label">
                    <i className="fas fa-phone"></i>
                    Телефон
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    className={`auth-page__input ${errors.phone ? 'auth-page__input--error' : ''}`}
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="+7 (999) 123-45-67"
                    disabled={isLoading}
                  />
                  {errors.phone && (
                    <span className="auth-page__error">{errors.phone}</span>
                  )}
                </div>

                {/* Пароль */}
                <div className="auth-page__field">
                  <label className="auth-page__label">
                    <i className="fas fa-lock"></i>
                    Пароль *
                  </label>
                  <div className="auth-page__password-field">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      name="password"
                      className={`auth-page__input ${errors.password ? 'auth-page__input--error' : ''}`}
                      value={formData.password}
                      onChange={handleChange}
                      placeholder="Создайте пароль"
                      disabled={isLoading}
                    />
                    <button
                      type="button"
                      className="auth-page__password-toggle"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      <i className={`fas ${showPassword ? 'fa-eye-slash' : 'fa-eye'}`}></i>
                    </button>
                  </div>
                  {errors.password && (
                    <span className="auth-page__error">{errors.password}</span>
                  )}

                  {/* Требования к паролю */}
                  <div className="auth-page__password-requirements">
                    <span className={`auth-page__password-requirement ${formData.password.length >= 8 ? 'auth-page__password-requirement--valid' : ''}`}>
                      <i className={`fas ${formData.password.length >= 8 ? 'fa-check-circle' : 'fa-circle'}`}></i>
                      Минимум 8 символов
                    </span>
                    <span className={`auth-page__password-requirement ${/[a-z]/.test(formData.password) ? 'auth-page__password-requirement--valid' : ''}`}>
                      <i className={`fas ${/[a-z]/.test(formData.password) ? 'fa-check-circle' : 'fa-circle'}`}></i>
                      Строчные буквы (a-z)
                    </span>
                    <span className={`auth-page__password-requirement ${/[A-Z]/.test(formData.password) ? 'auth-page__password-requirement--valid' : ''}`}>
                      <i className={`fas ${/[A-Z]/.test(formData.password) ? 'fa-check-circle' : 'fa-circle'}`}></i>
                      Заглавные буквы (A-Z)
                    </span>
                    <span className={`auth-page__password-requirement ${/[0-9]/.test(formData.password) ? 'auth-page__password-requirement--valid' : ''}`}>
                      <i className={`fas ${/[0-9]/.test(formData.password) ? 'fa-check-circle' : 'fa-circle'}`}></i>
                      Цифры (0-9)
                    </span>
                  </div>
                </div>

                {/* Подтверждение пароля */}
                <div className="auth-page__field">
                  <label className="auth-page__label">
                    <i className="fas fa-check-circle"></i>
                    Подтверждение пароля *
                  </label>
                  <input
                    type="password"
                    name="confirmPassword"
                    className={`auth-page__input ${errors.confirmPassword ? 'auth-page__input--error' : ''}`}
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    placeholder="Повторите пароль"
                    disabled={isLoading}
                  />
                  {errors.confirmPassword && (
                    <span className="auth-page__error">{errors.confirmPassword}</span>
                  )}
                </div>

                {/* Согласие с условиями */}
                <div className="auth-page__field">
                  <label className="auth-page__checkbox">
                    <input
                      type="checkbox"
                      name="agreeTerms"
                      checked={formData.agreeTerms}
                      onChange={handleChange}
                      disabled={isLoading}
                    />
                    <span className="auth-page__checkbox-text">
                      Я принимаю <a href="/terms" target="_blank">условия использования</a> и <a href="/privacy" target="_blank">политику конфиденциальности</a> *
                    </span>
                  </label>
                  {errors.agreeTerms && (
                    <span className="auth-page__error">{errors.agreeTerms}</span>
                  )}
                </div>

                {/* Кнопка регистрации */}
                <motion.button
                  type="submit"
                  className="auth-page__submit-btn"
                  disabled={isLoading}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  {isLoading ? (
                    <>
                      <i className="fas fa-spinner fa-spin"></i>
                      Регистрация...
                    </>
                  ) : (
                    <>
                      <i className="fas fa-user-plus"></i>
                      Зарегистрироваться
                    </>
                  )}
                </motion.button>
              </motion.form>
            )}

            {mode === 'forgot' && (
              <motion.form
                key="forgot"
                className="auth-page__form"
                variants={formVariants}
                initial="initial"
                animate="animate"
                exit="exit"
                onSubmit={handleForgot}
              >
                {!resetSent ? (
                  <>
                    <motion.h2 
                      className="auth-page__form-title"
                      variants={titleVariants}
                    >
                      Восстановление пароля
                    </motion.h2>

                    <p className="auth-page__form-text">
                      Введите email, указанный при регистрации, и мы отправим вам инструкцию по восстановлению пароля.
                    </p>

                    {/* Email */}
                    <div className="auth-page__field">
                      <label className="auth-page__label">
                        <i className="fas fa-envelope"></i>
                        Email
                      </label>
                      <input
                        type="email"
                        name="resetEmail"
                        className={`auth-page__input ${errors.resetEmail ? 'auth-page__input--error' : ''}`}
                        value={formData.resetEmail}
                        onChange={handleChange}
                        placeholder="example@mail.com"
                        disabled={isLoading}
                      />
                      {errors.resetEmail && (
                        <span className="auth-page__error">{errors.resetEmail}</span>
                      )}
                    </div>

                    {/* Кнопка отправки */}
                    <motion.button
                      type="submit"
                      className="auth-page__submit-btn"
                      disabled={isLoading}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      {isLoading ? (
                        <>
                          <i className="fas fa-spinner fa-spin"></i>
                          Отправка...
                        </>
                      ) : (
                        <>
                          <i className="fas fa-paper-plane"></i>
                          Отправить инструкцию
                        </>
                      )}
                    </motion.button>
                  </>
                ) : (
                  <motion.div 
                    className="auth-page__reset-success"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                  >
                    <div className="auth-page__reset-icon">
                      <i className="fas fa-check-circle"></i>
                    </div>
                    <h3 className="auth-page__reset-title">Письмо отправлено!</h3>
                    <p className="auth-page__reset-text">
                      Мы отправили инструкцию по восстановлению пароля на адрес <strong>{formData.resetEmail}</strong>
                    </p>
                    <button
                      type="button"
                      className="auth-page__reset-back"
                      onClick={() => switchMode('login')}
                    >
                      <i className="fas fa-arrow-left"></i>
                      Вернуться к входу
                    </button>
                  </motion.div>
                )}

                {/* Ссылка назад */}
                {!resetSent && (
                  <button
                    type="button"
                    className="auth-page__back-link"
                    onClick={() => switchMode('login')}
                  >
                    <i className="fas fa-arrow-left"></i>
                    Вернуться к входу
                  </button>
                )}
              </motion.form>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default AuthPage;