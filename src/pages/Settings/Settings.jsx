import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import "./Settings.css";

const SettingsPage = ({ user, onUpdateProfile, onChangePassword }) => {
  // Данные пользователя по умолчанию
  const defaultUser = {
    id: 1,
    name: "Александр",
    email: "alexander@example.com",
    phone: "+7 (999) 123-45-67",
    avatar: null,
    language: "ru",
    theme: "dark",
    notifications: {
      email: true,
      push: true,
      service: true,
      expenses: false,
    },
    createdAt: "2025-01-15",
  };

  const currentUser = user || defaultUser;

  // Состояния форм
  const [activeTab, setActiveTab] = useState("profile");
  const [profileForm, setProfileForm] = useState({
    name: currentUser.name,
    email: currentUser.email,
    phone: currentUser.phone,
    language: currentUser.language,
    avatar: currentUser.avatar,
    avatarPreview: currentUser.avatar,
  });

  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [notifications, setNotifications] = useState(currentUser.notifications);
  const [theme, setTheme] = useState(currentUser.theme);

  // Состояния для сообщений
  const [showSuccess, setShowSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [errors, setErrors] = useState({});
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Языки для выбора
  const languages = [
    { value: "ru", label: "Русский", flag: "🇷🇺" },
    { value: "en", label: "English", flag: "🇬🇧" },
    { value: "de", label: "Deutsch", flag: "🇩🇪" },
    { value: "fr", label: "Français", flag: "🇫🇷" },
  ];

  // Темы оформления
  const themes = [
    { value: "dark", label: "Тёмная", icon: "fa-moon", color: "#2c3e50" },
    { value: "light", label: "Светлая", icon: "fa-sun", color: "#f39c12" },
    {
      value: "system",
      label: "Системная",
      icon: "fa-laptop",
      color: "#3498db",
    },
  ];

  // Валидация форм
  const validateProfileForm = () => {
    const newErrors = {};

    if (!profileForm.name.trim()) {
      newErrors.name = "Имя не может быть пустым";
    } else if (profileForm.name.length < 2) {
      newErrors.name = "Имя должно содержать минимум 2 символа";
    }

    if (!profileForm.email.trim()) {
      newErrors.email = "Email не может быть пустым";
    } else if (!/\S+@\S+\.\S+/.test(profileForm.email)) {
      newErrors.email = "Введите корректный email";
    }

    if (profileForm.phone && !/^\+?[\d\s-()]{10,}$/.test(profileForm.phone)) {
      newErrors.phone = "Введите корректный номер телефона";
    }

    return newErrors;
  };

  const validatePasswordForm = () => {
    const newErrors = {};

    if (!passwordForm.currentPassword) {
      newErrors.currentPassword = "Введите текущий пароль";
    }

    if (!passwordForm.newPassword) {
      newErrors.newPassword = "Введите новый пароль";
    } else if (passwordForm.newPassword.length < 8) {
      newErrors.newPassword = "Пароль должен содержать минимум 8 символов";
    } else if (
      !/(?=.*[0-9])(?=.*[a-z])(?=.*[A-Z])/.test(passwordForm.newPassword)
    ) {
      newErrors.newPassword =
        "Пароль должен содержать цифры, заглавные и строчные буквы";
    }

    if (!passwordForm.confirmPassword) {
      newErrors.confirmPassword = "Подтвердите новый пароль";
    } else if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      newErrors.confirmPassword = "Пароли не совпадают";
    }

    return newErrors;
  };

  // Обработчики форм
  const handleProfileChange = (e) => {
    const { name, value } = e.target;
    setProfileForm((prev) => ({ ...prev, [name]: value }));

    // Очищаем ошибку для этого поля
    if (errors[name]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordForm((prev) => ({ ...prev, [name]: value }));

    if (errors[name]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfileForm((prev) => ({
          ...prev,
          avatar: file,
          avatarPreview: reader.result,
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleNotificationChange = (key) => {
    setNotifications((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const handleSubmitProfile = async (e) => {
    e.preventDefault();
    const newErrors = validateProfileForm();

    if (Object.keys(newErrors).length === 0) {
      setIsLoading(true);

      // Имитация запроса к серверу
      setTimeout(() => {
        onUpdateProfile && onUpdateProfile(profileForm);
        setSuccessMessage("Профиль успешно обновлен");
        setShowSuccess(true);
        setIsLoading(false);

        setTimeout(() => setShowSuccess(false), 3000);
      }, 1000);
    } else {
      setErrors(newErrors);
    }
  };

  const handleSubmitPassword = async (e) => {
    e.preventDefault();
    const newErrors = validatePasswordForm();

    if (Object.keys(newErrors).length === 0) {
      setIsLoading(true);

      // Имитация запроса к серверу
      setTimeout(() => {
        onChangePassword &&
          onChangePassword({
            currentPassword: passwordForm.currentPassword,
            newPassword: passwordForm.newPassword,
          });

        // Очищаем форму
        setPasswordForm({
          currentPassword: "",
          newPassword: "",
          confirmPassword: "",
        });

        setSuccessMessage("Пароль успешно изменен");
        setShowSuccess(true);
        setIsLoading(false);

        setTimeout(() => setShowSuccess(false), 3000);
      }, 1000);
    } else {
      setErrors(newErrors);
    }
  };

  const handleDeleteAccount = () => {
    setShowDeleteConfirm(true);
  };

  const confirmDeleteAccount = () => {
    setIsLoading(true);

    setTimeout(() => {
      // Здесь логика удаления аккаунта
      console.log("Account deleted");
      setIsLoading(false);
      setShowDeleteConfirm(false);

      // Перенаправление на страницу входа
      window.location.href = "/login";
    }, 1500);
  };

  // Анимации
  const pageVariants = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0, transition: { duration: 0.5 } },
    exit: { opacity: 0, y: -20, transition: { duration: 0.3 } },
  };

  const tabVariants = {
    inactive: { opacity: 0.6, scale: 0.95 },
    active: {
      opacity: 1,
      scale: 1,
      transition: { type: "spring", stiffness: 300 },
    },
  };

  const contentVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: { opacity: 1, x: 0, transition: { duration: 0.3 } },
    exit: { opacity: 0, x: 20, transition: { duration: 0.2 } },
  };

  return (
    <motion.div
      className="settings-page"
      variants={pageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
    >
      {/* Шапка страницы */}
      <div className="settings-page__header">
        <motion.h1
          className="settings-page__title"
          initial={{ x: -20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
        >
          <i className="fas fa-cog settings-page__title-icon"></i>
          Настройки профиля
        </motion.h1>
      </div>

      {/* Уведомление об успехе */}
      <AnimatePresence>
        {showSuccess && (
          <motion.div
            className="settings-page__success"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            <i className="fas fa-check-circle"></i>
            {successMessage}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Основной контент */}
      <div className="settings-page__content">
        {/* Боковая панель с информацией о пользователе */}
        <div className="settings-page__sidebar">
          <div className="settings-page__user-card">
            <div className="settings-page__avatar">
              {profileForm.avatarPreview ? (
                <img
                  src={profileForm.avatarPreview}
                  alt={profileForm.name}
                  className="settings-page__avatar-image"
                />
              ) : (
                <div className="settings-page__avatar-placeholder">
                  <i className="fas fa-user"></i>
                </div>
              )}
            </div>
            <h2 className="settings-page__user-name">{profileForm.name}</h2>
            <p className="settings-page__user-email">{profileForm.email}</p>
            <div className="settings-page__user-meta">
              <span className="settings-page__user-meta-item">
                <i className="far fa-calendar"></i>С{" "}
                {new Date(currentUser.createdAt).toLocaleDateString("ru-RU")}
              </span>
            </div>
          </div>

          {/* Навигация по вкладкам */}
          <nav className="settings-page__nav">
            <motion.button
              className={`settings-page__nav-item ${
                activeTab === "profile" ? "settings-page__nav-item--active" : ""
              }`}
              onClick={() => setActiveTab("profile")}
              variants={tabVariants}
              animate={activeTab === "profile" ? "active" : "inactive"}
              whileHover={{ scale: 1.05, x: 5 }}
              whileTap={{ scale: 0.95 }}
            >
              <i className="fas fa-user"></i>
              <span>Личные данные</span>
              {activeTab === "profile" && (
                <div className="settings-page__nav-indicator" />
              )}
            </motion.button>

            <motion.button
              className={`settings-page__nav-item ${
                activeTab === "security"
                  ? "settings-page__nav-item--active"
                  : ""
              }`}
              onClick={() => setActiveTab("security")}
              variants={tabVariants}
              animate={activeTab === "security" ? "active" : "inactive"}
              whileHover={{ scale: 1.05, x: 5 }}
              whileTap={{ scale: 0.95 }}
            >
              <i className="fas fa-shield-alt"></i>
              <span>Безопасность</span>
              {activeTab === "security" && (
                <div className="settings-page__nav-indicator" />
              )}
            </motion.button>

            <motion.button
              className={`settings-page__nav-item ${
                activeTab === "notifications"
                  ? "settings-page__nav-item--active"
                  : ""
              }`}
              onClick={() => setActiveTab("notifications")}
              variants={tabVariants}
              animate={activeTab === "notifications" ? "active" : "inactive"}
              whileHover={{ scale: 1.05, x: 5 }}
              whileTap={{ scale: 0.95 }}
            >
              <i className="fas fa-bell"></i>
              <span>Уведомления</span>
              {activeTab === "notifications" && (
                <div className="settings-page__nav-indicator" />
              )}
            </motion.button>

            <motion.button
              className={`settings-page__nav-item ${
                activeTab === "appearance"
                  ? "settings-page__nav-item--active"
                  : ""
              }`}
              onClick={() => setActiveTab("appearance")}
              variants={tabVariants}
              animate={activeTab === "appearance" ? "active" : "inactive"}
              whileHover={{ scale: 1.05, x: 5 }}
              whileTap={{ scale: 0.95 }}
            >
              <i className="fas fa-palette"></i>
              <span>Внешний вид</span>
              {activeTab === "appearance" && (
                <div className="settings-page__nav-indicator" />
              )}
            </motion.button>
          </nav>

          {/* Опасная зона */}
          <div className="settings-page__danger-zone">
            <h3 className="settings-page__danger-title">
              <i className="fas fa-exclamation-triangle"></i>
              Опасная зона
            </h3>
            <button
              className="settings-page__danger-btn"
              onClick={handleDeleteAccount}
            >
              <i className="fas fa-trash"></i>
              Удалить аккаунт
            </button>
          </div>
        </div>

        {/* Основная область с формами */}
        <div className="settings-page__main">
          <AnimatePresence mode="wait">
            {activeTab === "profile" && (
              <motion.div
                key="profile"
                className="settings-page__tab-content"
                variants={contentVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
              >
                <h2 className="settings-page__section-title">
                  <i className="fas fa-user"></i>
                  Личные данные
                </h2>

                <form
                  onSubmit={handleSubmitProfile}
                  className="settings-page__form"
                >
                  {/* Аватар */}
                  <div className="settings-page__form-group settings-page__form-group--avatar">
                    <label className="settings-page__label">Фото профиля</label>
                    <div className="settings-page__avatar-upload">
                      <div className="settings-page__avatar-preview">
                        {profileForm.avatarPreview ? (
                          <img
                            src={profileForm.avatarPreview}
                            alt="Avatar"
                            className="settings-page__avatar-preview-image"
                          />
                        ) : (
                          <i className="fas fa-user settings-page__avatar-preview-icon"></i>
                        )}
                      </div>
                      <div className="settings-page__avatar-actions">
                        <label className="settings-page__avatar-btn">
                          <i className="fas fa-upload"></i>
                          Загрузить фото
                          <input
                            type="file"
                            accept="image/*"
                            onChange={handleAvatarChange}
                            className="settings-page__avatar-input"
                          />
                        </label>
                        {profileForm.avatarPreview && (
                          <button
                            type="button"
                            className="settings-page__avatar-btn settings-page__avatar-btn--remove"
                            onClick={() =>
                              setProfileForm((prev) => ({
                                ...prev,
                                avatar: null,
                                avatarPreview: null,
                              }))
                            }
                          >
                            <i className="fas fa-times"></i>
                            Удалить
                          </button>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Имя */}
                  <div className="settings-page__form-group">
                    <label htmlFor="name" className="settings-page__label">
                      <i className="fas fa-user"></i>
                      Имя *
                    </label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      className={`settings-page__input ${
                        errors.name ? "settings-page__input--error" : ""
                      }`}
                      value={profileForm.name}
                      onChange={handleProfileChange}
                      placeholder="Введите ваше имя"
                    />
                    {errors.name && (
                      <span className="settings-page__error">
                        {errors.name}
                      </span>
                    )}
                  </div>

                  {/* Email */}
                  <div className="settings-page__form-group">
                    <label htmlFor="email" className="settings-page__label">
                      <i className="fas fa-envelope"></i>
                      Email *
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      className={`settings-page__input ${
                        errors.email ? "settings-page__input--error" : ""
                      }`}
                      value={profileForm.email}
                      onChange={handleProfileChange}
                      placeholder="example@mail.com"
                    />
                    {errors.email && (
                      <span className="settings-page__error">
                        {errors.email}
                      </span>
                    )}
                  </div>

                  {/* Телефон */}
                  <div className="settings-page__form-group">
                    <label htmlFor="phone" className="settings-page__label">
                      <i className="fas fa-phone"></i>
                      Телефон
                    </label>
                    <input
                      type="tel"
                      id="phone"
                      name="phone"
                      className={`settings-page__input ${
                        errors.phone ? "settings-page__input--error" : ""
                      }`}
                      value={profileForm.phone}
                      onChange={handleProfileChange}
                      placeholder="+7 (999) 123-45-67"
                    />
                    {errors.phone && (
                      <span className="settings-page__error">
                        {errors.phone}
                      </span>
                    )}
                  </div>

                  {/* Язык */}
                  <div className="settings-page__form-group">
                    <label htmlFor="language" className="settings-page__label">
                      <i className="fas fa-globe"></i>
                      Язык интерфейса
                    </label>
                    <select
                      id="language"
                      name="language"
                      className="settings-page__select"
                      value={profileForm.language}
                      onChange={handleProfileChange}
                    >
                      {languages.map((lang) => (
                        <option key={lang.value} value={lang.value}>
                          {lang.flag} {lang.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Кнопка сохранения */}
                  <div className="settings-page__form-actions">
                    <motion.button
                      type="submit"
                      className="settings-page__submit-btn"
                      disabled={isLoading}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      {isLoading ? (
                        <>
                          <i className="fas fa-spinner fa-spin"></i>
                          Сохранение...
                        </>
                      ) : (
                        <>
                          <i className="fas fa-save"></i>
                          Сохранить изменения
                        </>
                      )}
                    </motion.button>
                  </div>
                </form>
              </motion.div>
            )}

            {activeTab === "security" && (
              <motion.div
                key="security"
                className="settings-page__tab-content"
                variants={contentVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
              >
                <h2 className="settings-page__section-title">
                  <i className="fas fa-shield-alt"></i>
                  Безопасность
                </h2>

                <form
                  onSubmit={handleSubmitPassword}
                  className="settings-page__form"
                >
                  {/* Текущий пароль */}
                  <div className="settings-page__form-group">
                    <label
                      htmlFor="currentPassword"
                      className="settings-page__label"
                    >
                      <i className="fas fa-lock"></i>
                      Текущий пароль *
                    </label>
                    <input
                      type="password"
                      id="currentPassword"
                      name="currentPassword"
                      className={`settings-page__input ${
                        errors.currentPassword
                          ? "settings-page__input--error"
                          : ""
                      }`}
                      value={passwordForm.currentPassword}
                      onChange={handlePasswordChange}
                      placeholder="Введите текущий пароль"
                    />
                    {errors.currentPassword && (
                      <span className="settings-page__error">
                        {errors.currentPassword}
                      </span>
                    )}
                  </div>

                  {/* Новый пароль */}
                  <div className="settings-page__form-group">
                    <label
                      htmlFor="newPassword"
                      className="settings-page__label"
                    >
                      <i className="fas fa-key"></i>
                      Новый пароль *
                    </label>
                    <input
                      type="password"
                      id="newPassword"
                      name="newPassword"
                      className={`settings-page__input ${
                        errors.newPassword ? "settings-page__input--error" : ""
                      }`}
                      value={passwordForm.newPassword}
                      onChange={handlePasswordChange}
                      placeholder="Введите новый пароль"
                    />
                    {errors.newPassword && (
                      <span className="settings-page__error">
                        {errors.newPassword}
                      </span>
                    )}

                    {/* Требования к паролю */}
                    <div className="settings-page__password-requirements">
                      <span className="settings-page__password-requirement">
                        <i
                          className={`fas ${
                            passwordForm.newPassword.length >= 8
                              ? "fa-check-circle"
                              : "fa-circle"
                          }`}
                        ></i>
                        Минимум 8 символов
                      </span>
                      <span className="settings-page__password-requirement">
                        <i
                          className={`fas ${
                            /[a-z]/.test(passwordForm.newPassword)
                              ? "fa-check-circle"
                              : "fa-circle"
                          }`}
                        ></i>
                        Строчные буквы (a-z)
                      </span>
                      <span className="settings-page__password-requirement">
                        <i
                          className={`fas ${
                            /[A-Z]/.test(passwordForm.newPassword)
                              ? "fa-check-circle"
                              : "fa-circle"
                          }`}
                        ></i>
                        Заглавные буквы (A-Z)
                      </span>
                      <span className="settings-page__password-requirement">
                        <i
                          className={`fas ${
                            /[0-9]/.test(passwordForm.newPassword)
                              ? "fa-check-circle"
                              : "fa-circle"
                          }`}
                        ></i>
                        Цифры (0-9)
                      </span>
                    </div>
                  </div>

                  {/* Подтверждение пароля */}
                  <div className="settings-page__form-group">
                    <label
                      htmlFor="confirmPassword"
                      className="settings-page__label"
                    >
                      <i className="fas fa-check-circle"></i>
                      Подтверждение пароля *
                    </label>
                    <input
                      type="password"
                      id="confirmPassword"
                      name="confirmPassword"
                      className={`settings-page__input ${
                        errors.confirmPassword
                          ? "settings-page__input--error"
                          : ""
                      }`}
                      value={passwordForm.confirmPassword}
                      onChange={handlePasswordChange}
                      placeholder="Повторите новый пароль"
                    />
                    {errors.confirmPassword && (
                      <span className="settings-page__error">
                        {errors.confirmPassword}
                      </span>
                    )}
                  </div>

                  {/* Кнопка сохранения */}
                  <div className="settings-page__form-actions">
                    <motion.button
                      type="submit"
                      className="settings-page__submit-btn"
                      disabled={isLoading}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      {isLoading ? (
                        <>
                          <i className="fas fa-spinner fa-spin"></i>
                          Изменение...
                        </>
                      ) : (
                        <>
                          <i className="fas fa-key"></i>
                          Изменить пароль
                        </>
                      )}
                    </motion.button>
                  </div>
                </form>

                {/* Дополнительная информация о безопасности */}
                <div className="settings-page__info-card">
                  <h3 className="settings-page__info-title">
                    <i className="fas fa-info-circle"></i>
                    Советы по безопасности
                  </h3>
                  <ul className="settings-page__info-list">
                    <li>
                      <i className="fas fa-check"></i>
                      Используйте уникальный пароль, который не используется на
                      других сайтах
                    </li>
                    <li>
                      <i className="fas fa-check"></i>
                      Регулярно меняйте пароль (рекомендуется раз в 3 месяца)
                    </li>
                    <li>
                      <i className="fas fa-check"></i>
                      Не сообщайте пароль третьим лицам
                    </li>
                    <li>
                      <i className="fas fa-check"></i>
                      Используйте двухфакторную аутентификацию (скоро)
                    </li>
                  </ul>
                </div>
              </motion.div>
            )}

            {activeTab === "notifications" && (
              <motion.div
                key="notifications"
                className="settings-page__tab-content"
                variants={contentVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
              >
                <h2 className="settings-page__section-title">
                  <i className="fas fa-bell"></i>
                  Уведомления
                </h2>

                <div className="settings-page__notifications">
                  {/* Email уведомления */}
                  <div className="settings-page__notification-item">
                    <div className="settings-page__notification-info">
                      <i className="fas fa-envelope settings-page__notification-icon"></i>
                      <div>
                        <h3 className="settings-page__notification-title">
                          Email уведомления
                        </h3>
                        <p className="settings-page__notification-description">
                          Получать уведомления на электронную почту
                        </p>
                      </div>
                    </div>
                    <label className="settings-page__switch">
                      <input
                        type="checkbox"
                        checked={notifications.email}
                        onChange={() => handleNotificationChange("email")}
                      />
                      <span className="settings-page__switch-slider"></span>
                    </label>
                  </div>

                  {/* Push уведомления */}
                  <div className="settings-page__notification-item">
                    <div className="settings-page__notification-info">
                      <i className="fas fa-bell settings-page__notification-icon"></i>
                      <div>
                        <h3 className="settings-page__notification-title">
                          Push уведомления
                        </h3>
                        <p className="settings-page__notification-description">
                          Получать уведомления в браузере
                        </p>
                      </div>
                    </div>
                    <label className="settings-page__switch">
                      <input
                        type="checkbox"
                        checked={notifications.push}
                        onChange={() => handleNotificationChange("push")}
                      />
                      <span className="settings-page__switch-slider"></span>
                    </label>
                  </div>

                  {/* Уведомления о ТО */}
                  <div className="settings-page__notification-item">
                    <div className="settings-page__notification-info">
                      <i className="fas fa-wrench settings-page__notification-icon"></i>
                      <div>
                        <h3 className="settings-page__notification-title">
                          Обслуживание
                        </h3>
                        <p className="settings-page__notification-description">
                          Напоминания о предстоящем техническом обслуживании
                        </p>
                      </div>
                    </div>
                    <label className="settings-page__switch">
                      <input
                        type="checkbox"
                        checked={notifications.service}
                        onChange={() => handleNotificationChange("service")}
                      />
                      <span className="settings-page__switch-slider"></span>
                    </label>
                  </div>

                  {/* Уведомления о расходах */}
                  <div className="settings-page__notification-item">
                    <div className="settings-page__notification-info">
                      <i className="fas fa-credit-card settings-page__notification-icon"></i>
                      <div>
                        <h3 className="settings-page__notification-title">
                          Расходы
                        </h3>
                        <p className="settings-page__notification-description">
                          Уведомления о превышении бюджета
                        </p>
                      </div>
                    </div>
                    <label className="settings-page__switch">
                      <input
                        type="checkbox"
                        checked={notifications.expenses}
                        onChange={() => handleNotificationChange("expenses")}
                      />
                      <span className="settings-page__switch-slider"></span>
                    </label>
                  </div>
                </div>

                {/* Кнопка сохранения */}
                <div className="settings-page__form-actions">
                  <motion.button
                    type="button"
                    className="settings-page__submit-btn"
                    onClick={() => {
                      setSuccessMessage("Настройки уведомлений сохранены");
                      setShowSuccess(true);
                      setTimeout(() => setShowSuccess(false), 3000);
                    }}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <i className="fas fa-save"></i>
                    Сохранить настройки
                  </motion.button>
                </div>
              </motion.div>
            )}

            {activeTab === "appearance" && (
              <motion.div
                key="appearance"
                className="settings-page__tab-content"
                variants={contentVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
              >
                <h2 className="settings-page__section-title">
                  <i className="fas fa-palette"></i>
                  Внешний вид
                </h2>

                <div className="settings-page__appearance">
                  {/* Выбор темы */}
                  <div className="settings-page__appearance-section">
                    <h3 className="settings-page__appearance-title">
                      Тема оформления
                    </h3>
                    <div className="settings-page__theme-grid">
                      {themes.map((t) => (
                        <motion.div
                          key={t.value}
                          className={`settings-page__theme-card ${
                            theme === t.value
                              ? "settings-page__theme-card--active"
                              : ""
                          }`}
                          onClick={() => setTheme(t.value)}
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                        >
                          <div
                            className="settings-page__theme-icon"
                            style={{ backgroundColor: t.color + "20" }}
                          >
                            <i
                              className={`fas ${t.icon}`}
                              style={{ color: t.color }}
                            ></i>
                          </div>
                          <span className="settings-page__theme-label">
                            {t.label}
                          </span>
                          {theme === t.value && (
                            <i className="fas fa-check-circle settings-page__theme-check"></i>
                          )}
                        </motion.div>
                      ))}
                    </div>
                  </div>

                  {/* Размер шрифта */}
                  <div className="settings-page__appearance-section">
                    <h3 className="settings-page__appearance-title">
                      Размер шрифта
                    </h3>
                    <div className="settings-page__font-size">
                      <button className="settings-page__font-size-btn">
                        <i className="fas fa-minus"></i>
                      </button>
                      <span className="settings-page__font-size-value">
                        16px
                      </span>
                      <button className="settings-page__font-size-btn">
                        <i className="fas fa-plus"></i>
                      </button>
                    </div>
                  </div>

                  {/* Компактный режим */}
                  <div className="settings-page__appearance-section">
                    <div className="settings-page__compact-mode">
                      <div>
                        <h3 className="settings-page__appearance-title">
                          Компактный режим
                        </h3>
                        <p className="settings-page__appearance-description">
                          Уменьшить отступы и размеры элементов для отображения
                          большего количества информации
                        </p>
                      </div>
                      <label className="settings-page__switch">
                        <input type="checkbox" />
                        <span className="settings-page__switch-slider"></span>
                      </label>
                    </div>
                  </div>
                </div>

                {/* Кнопка сохранения */}
                <div className="settings-page__form-actions">
                  <motion.button
                    type="button"
                    className="settings-page__submit-btn"
                    onClick={() => {
                      setSuccessMessage("Настройки внешнего вида сохранены");
                      setShowSuccess(true);
                      setTimeout(() => setShowSuccess(false), 3000);
                    }}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <i className="fas fa-save"></i>
                    Сохранить настройки
                  </motion.button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Модальное окно подтверждения удаления аккаунта */}
      <AnimatePresence>
        {showDeleteConfirm && (
          <>
            <div
              className="settings-page__modal-overlay"
              onClick={() => setShowDeleteConfirm(false)}
            />
            <motion.div
              className="settings-page__delete-modal"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
            >
              <div className="settings-page__delete-icon">
                <i className="fas fa-exclamation-triangle"></i>
              </div>
              <h2 className="settings-page__delete-title">Удалить аккаунт?</h2>
              <p className="settings-page__delete-text">
                Это действие <strong>необратимо</strong>. Все ваши данные,
                включая информацию об автомобилях, расходах и истории
                обслуживания, будут безвозвратно удалены.
              </p>

              <div className="settings-page__delete-warning">
                <i className="fas fa-info-circle"></i>
                Пожалуйста, убедитесь, что вы экспортировали все важные данные
                перед удалением.
              </div>

              <div className="settings-page__delete-actions">
                <button
                  className="settings-page__delete-btn settings-page__delete-btn--cancel"
                  onClick={() => setShowDeleteConfirm(false)}
                  disabled={isLoading}
                >
                  Отмена
                </button>
                <button
                  className="settings-page__delete-btn settings-page__delete-btn--confirm"
                  onClick={confirmDeleteAccount}
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <i className="fas fa-spinner fa-spin"></i>
                      Удаление...
                    </>
                  ) : (
                    <>
                      <i className="fas fa-trash"></i>
                      Да, удалить аккаунт
                    </>
                  )}
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default SettingsPage;
