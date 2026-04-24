import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Form, Input, Button, Checkbox, message, Spin } from "antd";
import {
  UserOutlined,
  LockOutlined,
  MailOutlined,
  PhoneOutlined,
  CarOutlined,
  ArrowLeftOutlined,
} from "@ant-design/icons";
import "./Auth.css";
import { login, register } from "../../app/api/endpoints/user";
import { PasswordInput, TextInput } from "../../UI/components/AntdInput.tsx";
import { enums } from "../../constants/index.js";
import { useNavigate } from "react-router";

const AuthPage = ({ onLogin, onRegister, onForgotPassword }) => {
  const [mode, setMode] = useState("login");
  const [isLoading, setIsLoading] = useState(false);
  const [resetSent, setResetSent] = useState(false);
  const [form] = Form.useForm();
  const navigate = useNavigate();

  const handleLogin = async (values) => {
    setIsLoading(true);

    login(values)
      .then((res) => {
        localStorage.setItem(enums.TOKEN, res.data.token);
        navigate("/");
      })
      .catch((e) => {
        message.error("Ошибка входа");
      })
      .finally(() => {
        setIsLoading(false);
      });
  };

  const handleRegister = async (values) => {
    setIsLoading(true);
    try {
      register(values)
        .then((res) => {
          message.success("Регистрация прошла успешно!");
          form.resetFields();
          localStorage.setItem(enums.TOKEN, res.data.token);
          navigate("/");
        })
        .catch((e) => {
          message.error("Не удалось зарегистрироваться");
        });
    } catch (error) {
      message.error("Ошибка регистрации");
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgot = async (values) => {
    setIsLoading(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 1500));
      onForgotPassword && onForgotPassword(values.resetEmail);
      setResetSent(true);
      message.success("Инструкция отправлена на почту");
    } catch (error) {
      message.error("Ошибка отправки");
    } finally {
      setIsLoading(false);
    }
  };

  const switchMode = (newMode) => {
    setMode(newMode);
    setResetSent(false);
    form.resetFields();
  };

  const pageVariants = {
    initial: { opacity: 0 },
    animate: { opacity: 1, transition: { duration: 0.5 } },
    exit: { opacity: 0 },
  };

  const formVariants = {
    initial: { opacity: 0, x: 50 },
    animate: {
      opacity: 1,
      x: 0,
      transition: { type: "spring", damping: 15, stiffness: 100, delay: 0.2 },
    },
    exit: { opacity: 0, x: -50, transition: { duration: 0.2 } },
  };

  return (
    <motion.div
      className="auth-page"
      variants={pageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
    >
      <div className="auth-page__bg-sphere auth-page__bg-sphere--1"></div>
      <div className="auth-page__bg-sphere auth-page__bg-sphere--2"></div>
      <div className="auth-page__bg-sphere auth-page__bg-sphere--3"></div>

      <div className="auth-page__container">
        <motion.div
          className="auth-page__info"
          initial={{ x: -50, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <div className="auth-page__logo">
            <CarOutlined />
            <span>AutoFinance</span>
          </div>

          <h1 className="auth-page__info-title">
            {mode === "login" && "С возвращением!"}
            {mode === "register" && "Добро пожаловать!"}
            {mode === "forgot" && "Восстановление доступа"}
          </h1>

          <p className="auth-page__info-text">
            {mode === "login" &&
              "Войдите в свой аккаунт чтобы управлять расходами на автомобили"}
            {mode === "register" &&
              "Создайте аккаунт и начните отслеживать расходы на ваши автомобили"}
            {mode === "forgot" &&
              "Мы отправим инструкцию по восстановлению пароля на вашу почту"}
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
              <UserOutlined />
            </div>
            <div className="auth-page__testimonial-content">
              <p>
                "Отличный сервис! Помогает контролировать все расходы на машину.
                Больше не пропускаю ТО."
              </p>
              <span>— Александр, владелец Porsche Cayenne</span>
            </div>
          </div>
        </motion.div>

        <motion.div
          className="auth-page__form-container"
          initial={{ x: 50, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <div className="auth-page__mode-switcher">
            <button
              className={`auth-page__mode-btn ${
                mode === "login" ? "auth-page__mode-btn--active" : ""
              }`}
              onClick={() => switchMode("login")}
            >
              Вход
            </button>
            <button
              className={`auth-page__mode-btn ${
                mode === "register" ? "auth-page__mode-btn--active" : ""
              }`}
              onClick={() => switchMode("register")}
            >
              Регистрация
            </button>
          </div>

          <AnimatePresence mode="wait">
            {mode === "login" && (
              <motion.div
                key="login"
                variants={formVariants}
                initial="initial"
                animate="animate"
                exit="exit"
              >
                <Form
                  form={form}
                  onFinish={handleLogin}
                  layout="vertical"
                  className="auth-page__form"
                >
                  <h2 className="auth-page__form-title">Вход в аккаунт</h2>

                  <Form.Item
                    name="email"
                    label="Email"
                    rules={[
                      { required: true, message: "Введите email" },
                      { type: "email", message: "Введите корректный email" },
                    ]}
                  >
                    <TextInput
                      prefix={<MailOutlined />}
                      placeholder="example@mail.com"
                      size="large"
                      disabled={isLoading}
                    />
                  </Form.Item>

                  <Form.Item
                    name="password"
                    label="Пароль"
                    rules={[{ required: true, message: "Введите пароль" }]}
                  >
                    <PasswordInput
                      prefix={<LockOutlined />}
                      placeholder="Введите пароль"
                      size="large"
                      disabled={isLoading}
                    />
                  </Form.Item>

                  <Button
                    type="primary"
                    htmlType="submit"
                    size="large"
                    block
                    loading={isLoading}
                    icon={!isLoading && <LockOutlined />}
                    style={{ borderRadius: 15 }}
                  >
                    {isLoading ? "Вход..." : "Войти"}
                  </Button>
                </Form>
              </motion.div>
            )}

            {mode === "register" && (
              <motion.div
                key="register"
                variants={formVariants}
                initial="initial"
                animate="animate"
                exit="exit"
              >
                <Form
                  form={form}
                  onFinish={handleRegister}
                  layout="vertical"
                  className="auth-page__form"
                >
                  <h2 className="auth-page__form-title">Создание аккаунта</h2>

                  <Form.Item
                    name="name"
                    label="Имя"
                    rules={[{ required: true, message: "Введите имя" }]}
                  >
                    <TextInput
                      prefix={<UserOutlined />}
                      placeholder="Введите ваше имя"
                      size="large"
                      disabled={isLoading}
                    />
                  </Form.Item>

                  <Form.Item
                    name="email"
                    label="Email"
                    rules={[
                      { required: true, message: "Введите email" },
                      { type: "email", message: "Введите корректный email" },
                    ]}
                  >
                    <TextInput
                      prefix={<MailOutlined />}
                      placeholder="example@mail.com"
                      size="large"
                      disabled={isLoading}
                    />
                  </Form.Item>

                  <Form.Item
                    name="password"
                    label="Пароль"
                    rules={[{ required: true, message: "Введите пароль" }]}
                  >
                    <PasswordInput
                      prefix={<LockOutlined />}
                      placeholder="Создайте пароль"
                      size="large"
                      disabled={isLoading}
                    />
                  </Form.Item>

                  <Form.Item
                    name="confirmPassword"
                    label="Подтверждение пароля"
                    dependencies={["password"]}
                    rules={[
                      { required: true, message: "Подтвердите пароль" },
                      ({ getFieldValue }) => ({
                        validator(_, value) {
                          if (!value || getFieldValue("password") === value) {
                            return Promise.resolve();
                          }
                          return Promise.reject(
                            new Error("Пароли не совпадают")
                          );
                        },
                      }),
                    ]}
                  >
                    <PasswordInput
                      prefix={<LockOutlined />}
                      placeholder="Повторите пароль"
                      size="large"
                      disabled={isLoading}
                    />
                  </Form.Item>

                  <Form.Item
                    name="agreeTerms"
                    valuePropName="checked"
                    rules={[
                      {
                        validator: (_, value) =>
                          value
                            ? Promise.resolve()
                            : Promise.reject(
                                new Error(
                                  "Необходимо принять условия использования"
                                )
                              ),
                      },
                    ]}
                  >
                    <Checkbox>
                      Я принимаю{" "}
                      <a href="/terms" target="_blank">
                        условия использования
                      </a>{" "}
                      и{" "}
                      <a href="/privacy" target="_blank">
                        политику конфиденциальности
                      </a>
                    </Checkbox>
                  </Form.Item>

                  <Button
                    type="primary"
                    htmlType="submit"
                    size="large"
                    block
                    loading={isLoading}
                    icon={!isLoading && <UserOutlined />}
                  >
                    {isLoading ? "Регистрация..." : "Зарегистрироваться"}
                  </Button>
                </Form>
              </motion.div>
            )}

            {mode === "forgot" && (
              <motion.div
                key="forgot"
                variants={formVariants}
                initial="initial"
                animate="animate"
                exit="exit"
              >
                {!resetSent ? (
                  <Form
                    form={form}
                    onFinish={handleForgot}
                    layout="vertical"
                    className="auth-page__form"
                  >
                    <h2 className="auth-page__form-title">
                      Восстановление пароля
                    </h2>

                    <p className="auth-page__form-text">
                      Введите email, указанный при регистрации, и мы отправим
                      вам инструкцию по восстановлению пароля.
                    </p>

                    <Form.Item
                      name="resetEmail"
                      label="Email"
                      rules={[
                        { required: true, message: "Введите email" },
                        { type: "email", message: "Введите корректный email" },
                      ]}
                    >
                      <TextInput
                        prefix={<MailOutlined />}
                        placeholder="example@mail.com"
                        size="large"
                        disabled={isLoading}
                      />
                    </Form.Item>

                    <Button
                      type="primary"
                      htmlType="submit"
                      size="large"
                      block
                      loading={isLoading}
                      icon={!isLoading && <MailOutlined />}
                    >
                      {isLoading ? "Отправка..." : "Отправить инструкцию"}
                    </Button>

                    <button
                      type="button"
                      className="auth-page__back-link"
                      onClick={() => switchMode("login")}
                    >
                      <ArrowLeftOutlined />
                      Вернуться к входу
                    </button>
                  </Form>
                ) : (
                  <motion.div
                    className="auth-page__reset-success"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                  >
                    <div className="auth-page__reset-icon">
                      <i className="fas fa-check-circle"></i>
                    </div>
                    <h3 className="auth-page__reset-title">
                      Письмо отправлено!
                    </h3>
                    <p className="auth-page__reset-text">
                      Мы отправили инструкцию по восстановлению пароля на адрес{" "}
                      <strong>{form.getFieldValue("resetEmail")}</strong>
                    </p>
                    <button
                      type="button"
                      className="auth-page__reset-back"
                      onClick={() => switchMode("login")}
                    >
                      <ArrowLeftOutlined />
                      Вернуться к входу
                    </button>
                  </motion.div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default AuthPage;
