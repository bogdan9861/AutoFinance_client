import React, { useState, useEffect } from "react";
import "./Admin.module.css";
import {
  getAllUsers,
  register,
  removeUser,
} from "../../app/api/endpoints/user";
import useUser from "../../hooks/useUser";
import { useNavigate } from "react-router";
import { enums } from "../../constants";

import styles from "./Admin.module.css";

const Admin = () => {
  const [users, setUsers] = useState([]);
  const [newUser, setNewUser] = useState({ name: "", email: "", password: "" });
  const [editingUser, setEditingUser] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);
  const navigate = useNavigate();

  const { user, loading } = useUser();

  const loadUsers = () => {};

  useEffect(() => {
    if (loading) return;

    if (user?.role !== "ADMIN") {
      navigate("/admin/auth");
    }
  }, [loading]);

  useEffect(() => {
    if (loading) return;

    getAllUsers()
      .then((res) => {
        setUsers(res.data?.filter((u) => u.id !== user.id));
      })
      .catch((e) => {
        console.log(e);
      });
  }, [loading]);

  const saveUsers = (updatedUsers) => {
    setUsers(updatedUsers);
  };

  const addUser = () => {
    console.log(newUser);

    if (!newUser.name || !newUser.email) {
      alert("Пожалуйста, заполните все поля");
      return;
    }

    if (users.some((u) => u.email === newUser.email)) {
      alert("Пользователь с такой почтой уже существует");
      return;
    }

    register({
      email: newUser.email,
      name: newUser.name,
      password: newUser.password,
    }).then((res) => {
      setNewUser({ name: "", email: "" });
      setShowAddModal(false);
      setUsers((prev) => [res.data, ...prev]);
    });
  };

  const deleteUser = (id) => {
    console.log(id);

    const updatedUsers = users.filter((user) => user.id !== id);
    saveUsers(updatedUsers);

    removeUser(id).catch((e) => {
      alert("Не удалось удалить пользователя");
    });
  };

  const filteredUsers = users.filter(
    (user) =>
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  const handleLogout = () => {
    localStorage.removeItem(enums.TOKEN);
    navigate("/admin/auth");
  };

  return (
    <div className={styles["admin-panel"]}>
      <nav className={styles.navbar}>
        <div className={styles["nav-brand"]}>
          <h2>Админ Панель</h2>
          <span>Управление пользователями</span>
        </div>
        <div className={styles["nav-user"]}>
          <span>👋 Привет, {user?.name}!</span>
          <button onClick={handleLogout} className={styles["logout-btn"]}>
            Выйти
          </button>
        </div>
      </nav>

      <div className={styles["main-content"]}>
        <div className={styles["stats-cards"]}>
          <div className={styles["stat-card"]}>
            <div className={styles["stat-icon"]}>👥</div>
            <div className={styles["stat-info"]}>
              <h3>{users.length}</h3>
              <p>Всего пользователей</p>
            </div>
          </div>
        </div>

        <div className={styles["users-section"]}>
          <div className={styles["section-header"]}>
            <h3>Список пользователей</h3>
            <button
              className={styles["add-user-btn"]}
              onClick={() => setShowAddModal(true)}
            >
              + Добавить пользователя
            </button>
          </div>

          <div className={styles["search-box"]}>
            <input
              type="text"
              placeholder="🔍 Поиск по имени или email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className={styles["users-table-container"]}>
            <table className={styles["users-table"]}>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Имя пользователя</th>
                  <th>Email</th>
                  <th>Дата регистрации</th>
                  <th>Действия</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map((user) => (
                  <tr key={user.id}>
                    <td>{user.id}</td>
                    <td>
                      {editingUser?.id === user.id ? (
                        <input
                          type="text"
                          value={editingUser.name}
                          onChange={(e) =>
                            setEditingUser({
                              ...editingUser,
                              name: e.target.value,
                            })
                          }
                          className={styles["edit-input"]}
                        />
                      ) : (
                        user.name
                      )}
                    </td>
                    <td>
                      {editingUser?.id === user.id ? (
                        <input
                          type="email"
                          value={editingUser.email}
                          onChange={(e) =>
                            setEditingUser({
                              ...editingUser,
                              email: e.target.value,
                            })
                          }
                          className={styles["edit-input"]}
                        />
                      ) : (
                        user.email
                      )}
                    </td>
                    <td>
                      {new Date(user.registrationDate).toLocaleDateString()}
                    </td>
                    <td className={styles.actions}>
                      <>
                        <button
                          onClick={() => deleteUser(user.id)}
                          className={styles["delete-btn"]}
                        >
                          🗑️ Удалить
                        </button>
                      </>
                    </td>
                  </tr>
                ))}
                {filteredUsers.length === 0 && (
                  <tr>
                    <td colSpan="5" className={styles["no-data"]}>
                      Пользователи не найдены
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {showAddModal && (
        <div
          className={styles["modal-overlay"]}
          onClick={() => setShowAddModal(false)}
        >
          <div
            className={styles["modal-content"]}
            onClick={(e) => e.stopPropagation()}
          >
            <div className={styles["modal-header"]}>
              <h3>Добавить пользователя</h3>
              <button
                className={styles["modal-close"]}
                onClick={() => setShowAddModal(false)}
              >
                ×
              </button>
            </div>
            <div className={styles["modal-body"]}>
              <div className={styles["form-group"]}>
                <label>Имя пользователя</label>
                <input
                  type="text"
                  value={newUser.name}
                  onChange={(e) =>
                    setNewUser({ ...newUser, name: e.target.value })
                  }
                  placeholder="Введите имя"
                />
              </div>
              <div className={styles["form-group"]}>
                <label>Email</label>
                <input
                  type="email"
                  value={newUser.email}
                  onChange={(e) =>
                    setNewUser({ ...newUser, email: e.target.value })
                  }
                  placeholder="example@mail.com"
                />
              </div>

              <div className={styles["form-group"]}>
                <label>Пароль</label>
                <input
                  type="password"
                  value={newUser.password}
                  onChange={(e) =>
                    setNewUser({ ...newUser, password: e.target.value })
                  }
                  placeholder="******"
                />
              </div>
            </div>
            <div className={styles["modal-footer"]}>
              <button
                onClick={() => setShowAddModal(false)}
                className={styles["cancel-btn"]}
              >
                Отмена
              </button>
              <button onClick={addUser} className={styles["add-btn"]}>
                Добавить
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Admin;
