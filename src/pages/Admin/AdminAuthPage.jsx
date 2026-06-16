import React, { useEffect, useState } from "react";
import { login } from "../../app/api/endpoints/user";
import { useNavigate } from "react-router";
import { enums } from "../../constants";

import styles from "../Admin/Admin.module.css";
import useUser from "../../hooks/useUser";

const AdminAuthPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const { user, loading: isUserLoading } = useUser();

  const navigate = useNavigate();

  useEffect(() => {
    if (isUserLoading) return;

    if (user?.role === "ADMIN") {
      navigate("/admin");
    } else if (user?.role === "ACCOUNTANT") {
      navigate("/accountant");
    }
  }, [isUserLoading]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    login({ email, password })
      .then((res) => {
        if (res.data.role === "ADMIN") {
          navigate("/admin");
          localStorage.setItem(enums.TOKEN, res.data.token);
        } else if (res.data.role === "ACCOUNTANT") {
          navigate("/accountant");
          localStorage.setItem(enums.TOKEN, res.data.token);
        } else {
          setError("У вас недостаточно прав");
        }
      })
      .catch((e) => {
        console.log(e);
        if (e.status === 404) {
          setError("Не верный логин или пароль");
          return;
        }

        setError(e.message);
      })
      .finally(() => {
        setLoading(false);
      });
  };

  return (
    <div className={styles["login-container"]}>
      <div className={styles["login-box"]}>
        <div className={styles["login-header"]}>
          <h2>Админ Панель</h2>
          <p>Войдите в систему</p>
        </div>

        <form onSubmit={handleSubmit} className={styles["login-form"]}>
          <div className={styles["form-group"]}>
            <label htmlFor="email">Имя пользователя</label>
            <input
              type="text"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Введите логин"
              required
              autoComplete="off"
            />
          </div>

          <div className={styles["form-group"]}>
            <label htmlFor="password">Пароль</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Введите пароль"
              required
            />
          </div>

          {error && <div className={styles["error-message"]}>{error}</div>}

          <button
            type="submit"
            className={styles["login-btn"]}
            disabled={loading}
          >
            {loading ? "Вход..." : "Войти"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default AdminAuthPage;
