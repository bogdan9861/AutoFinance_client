import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import "./Settings.css";
import SideBar from "../../UI/components/SideBar/SideBar";
import useUser from "../../hooks/useUser";
import {
  changePassword,
  editUser,
  removeUser,
} from "../../app/api/endpoints/user";
import { message, Spin } from "antd";
import { enums } from "../../constants";
import { useNavigate } from "react-router";
import Image from "../../UI/components/Image/Image";

const SettingsPage = ({ onUpdateProfile, onChangePassword }) => {
  const { user, loading: userLoading } = useUser();
  const navigate = useNavigate();

  // Состояния форм
  const [activeTab, setActiveTab] = useState("profile");
  const [profileForm, setProfileForm] = useState({
    name: user?.name,
    email: user?.email,
    avatar: user?.image,
    avatarPreview: user?.image,
  });

  useEffect(() => {
    if (!user) return;

    setProfileForm({
      name: user?.name,
      email: user?.email,
      avatar: user?.image,
      avatarPreview: user?.image,
    });
  }, [user]);

  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  // Состояния для сообщений
  const [showSuccess, setShowSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [errors, setErrors] = useState({});
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

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

  const handleSubmitProfile = async (e) => {
    e.preventDefault();
    const newErrors = validateProfileForm();

    const formData = new FormData();

    console.log(profileForm);

    formData.append("name", profileForm.name);
    formData.append("email", profileForm.email);
    formData.append("image", profileForm.avatar);

    if (Object.keys(newErrors).length === 0) {
      setIsLoading(true);

      editUser(formData)
        .then((res) => {
          setSuccessMessage("Профиль успешно обновлен");
          setShowSuccess(true);
          setIsLoading(false);
        })
        .catch((e) => {
          message.error("Не удалось изменить данные профиля");
        })
        .finally(() => {
          setIsLoading(false);
        });
    } else {
      setErrors(newErrors);
    }
  };

  const handleSubmitPassword = async (e) => {
    e.preventDefault();
    const newErrors = validatePasswordForm();

    if (Object.keys(newErrors).length === 0) {
      setIsLoading(true);

      changePassword({
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword,
      })
        .then((res) => {
          setSuccessMessage("Пароль успешно изменен");
          setShowSuccess(true);

          setPasswordForm({
            currentPassword: "",
            newPassword: "",
            confirmPassword: "",
          });
        })
        .catch((e) => {
          message.error(
            `Не удалось сменить пароль; ${e.response.data.message}`,
          );
        })
        .finally(() => {
          setIsLoading(false);
        });

      setTimeout(() => setShowSuccess(false), 3000);
    } else {
      setErrors(newErrors);
    }
  };

  const handleDeleteAccount = () => {
    setShowDeleteConfirm(true);
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

  const onLogout = () => {
    localStorage.removeItem(enums.TOKEN);
    navigate("/auth", { replace: true });
  };

  const confirmDeleteAccount = () => {
    setIsLoading(true);

    removeUser()
      .then(() => {
        onLogout();
        setShowDeleteConfirm(false);
      })
      .finally(() => {
        setIsLoading(false);
      });
  };

  return (
    <div className="app">
      <SideBar />
      <motion.div
        className="settings-page"
        variants={pageVariants}
        initial="initial"
        animate="animate"
        exit="exit"
        style={{ width: "100%", minHeight: "100vh" }}
      >
        {/* Шапка страницы */}
        <div className="settings-page__header" style={{ width: "100%" }}>
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

        {userLoading ? (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              width: "100%",
              height: "50vh",
            }}
          >
            <Spin />
          </div>
        ) : (
          <div className="settings-page__content">
            {/* Боковая панель с информацией о пользователе */}
            <div className="settings-page__sidebar">
              <div className="settings-page__user-card">
                <div className="settings-page__avatar">
                  {profileForm.avatarPreview ? (
                    <Image
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
              </div>

              {/* Навигация по вкладкам */}
              <nav className="settings-page__nav">
                <motion.button
                  className={`settings-page__nav-item ${
                    activeTab === "profile"
                      ? "settings-page__nav-item--active"
                      : ""
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
              </nav>

              {/* Опасная зона */}
              <div className="settings-page__danger-zone">
                <h3 className="settings-page__danger-title">
                  <i className="fas fa-exclamation-triangle"></i>
                  Опасная зона
                </h3>
                <button
                  style={{ marginBottom: 10 }}
                  className="settings-page__danger-btn"
                  onClick={onLogout}
                >
                  <i className="fas fa-sign-out"></i>
                  Выйти
                </button>
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
                        <label className="settings-page__label">
                          Фото профиля
                        </label>
                        <div className="settings-page__avatar-upload">
                          <div className="settings-page__avatar-preview">
                            {profileForm.avatarPreview ? (
                              <Image
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
                            errors.newPassword
                              ? "settings-page__input--error"
                              : ""
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
                          Используйте уникальный пароль, который не используется
                          на других сайтах
                        </li>
                        <li>
                          <i className="fas fa-check"></i>
                          Регулярно меняйте пароль (рекомендуется раз в 3
                          месяца)
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
              </AnimatePresence>
            </div>
          </div>
        )}

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
                <h2 className="settings-page__delete-title">
                  Удалить аккаунт?
                </h2>
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
    </div>
  );
};

export default SettingsPage;
