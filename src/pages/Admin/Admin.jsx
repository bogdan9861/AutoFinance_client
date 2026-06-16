import React, { useState, useEffect } from "react";
import styles from "./Admin.module.css";
import {
  getAllUsers,
  register,
  removeUser,
} from "../../app/api/endpoints/user";
import { getAllReports, deleteReport } from "../../app/api/endpoints/reports";
import useUser from "../../hooks/useUser";
import { useNavigate } from "react-router";
import { enums } from "../../constants";
import { Modal, message } from "antd";
import moment from "moment";
import "moment/locale/ru";

const Admin = () => {
  const [users, setUsers] = useState([]);
  const [reports, setReports] = useState([]);
  const [newUser, setNewUser] = useState({
    name: "",
    email: "",
    password: "",
    role: "",
  });
  const [editingUser, setEditingUser] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);
  const [activeTab, setActiveTab] = useState("users");
  const [loadingReports, setLoadingReports] = useState(false);
  const navigate = useNavigate();

  const { user, loading } = useUser();

  // Проверка прав доступа
  useEffect(() => {
    if (loading) return;

    if (user?.role !== "ADMIN") {
      navigate("/admin/auth");
    }
  }, [loading, user, navigate]);

  // Загрузка пользователей
  useEffect(() => {
    if (loading) return;

    getAllUsers()
      .then((res) => {
        setUsers(res.data?.filter((u) => u.id !== user.id));
      })
      .catch((e) => {
        console.log(e);
        message.error("Не удалось загрузить пользователей");
      });
  }, [loading, user]);

  // Загрузка отчетов
  useEffect(() => {
    if (loading || !user) return;

    loadReports();
  }, [loading, user]);

  const loadReports = async () => {
    setLoadingReports(true);
    try {
      const response = await getAllReports();
      setReports(response.data || []);
    } catch (error) {
      console.error("Ошибка загрузки отчетов:", error);
      message.error("Не удалось загрузить отчеты");
    } finally {
      setLoadingReports(false);
    }
  };

  const saveUsers = (updatedUsers) => {
    setUsers(updatedUsers);
  };

  const addUser = () => {
    if (!newUser.name || !newUser.email || !newUser.password) {
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
      role: newUser.role || "USER",
    })
      .then((res) => {
        setNewUser({ name: "", email: "", password: "", role: "" });
        setShowAddModal(false);
        setUsers((prev) => [res.data, ...prev]);
        message.success("Пользователь добавлен");
      })
      .catch((error) => {
        console.error(error);
        message.error("Ошибка добавления пользователя");
      });
  };

  const deleteUser = (id) => {
    Modal.confirm({
      title: "Удаление пользователя",
      content: "Вы уверены, что хотите удалить этого пользователя?",
      okText: "Да, удалить",
      cancelText: "Отмена",
      okType: "danger",
      onOk: async () => {
        try {
          await removeUser(id);
          setUsers((prev) => prev.filter((user) => user.id !== id));
          message.success("Пользователь удален");
        } catch (error) {
          console.error(error);
          message.error("Не удалось удалить пользователя");
        }
      },
    });
  };

  // Удаление отчета
  const handleDeleteReport = (id) => {
    Modal.confirm({
      title: "Удаление отчета",
      content: "Вы уверены, что хотите удалить этот отчет?",
      okText: "Да, удалить",
      cancelText: "Отмена",
      okType: "danger",
      onOk: async () => {
        try {
          await deleteReport(id);
          setReports((prev) => prev.filter((r) => r.id !== id));
          message.success("Отчет удален");
        } catch (error) {
          console.error(error);
          message.error("Ошибка удаления отчета");
        }
      },
    });
  };

  const filteredUsers = users.filter(
    (user) =>
      user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email?.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  // Фильтрация отчетов
  const filteredReports = reports.filter((report) => {
    const searchLower = searchTerm.toLowerCase();
    return (
      report.name?.toLowerCase().includes(searchLower) ||
      report.fileUrl?.toLowerCase().includes(searchLower)
    );
  });

  // Группировка отчетов по дате (по месяцам)
  const groupReportsByMonth = () => {
    const grouped = {};
    filteredReports.forEach((report) => {
      const monthKey = moment(report.createdAt).format("YYYY-MM");
      if (!grouped[monthKey]) {
        grouped[monthKey] = [];
      }
      grouped[monthKey].push(report);
    });

    return Object.keys(grouped)
      .sort((a, b) => b.localeCompare(a))
      .reduce((acc, key) => {
        acc[key] = grouped[key];
        return acc;
      }, {});
  };

  const groupedReports = groupReportsByMonth();

  const formatMonth = (monthStr) => {
    const [year, month] = monthStr.split("-");
    const date = moment(`${year}-${month}-01`);
    return date.format("MMMM YYYY");
  };

  const formatDate = (date) => {
    return moment(date).format("DD MMM YYYY HH:mm");
  };

  // Получение расширения файла
  const getFileExtension = (url) => {
    if (!url) return "file";
    const ext = url.split(".").pop().toLowerCase();
    return ext;
  };

  // Получение иконки для файла
  const getFileIcon = (url) => {
    const ext = getFileExtension(url);
    switch (ext) {
      case "pdf":
        return "fa-file-pdf";
      case "doc":
      case "docx":
        return "fa-file-word";
      case "xls":
      case "xlsx":
        return "fa-file-excel";
      case "ppt":
      case "pptx":
        return "fa-file-powerpoint";
      case "jpg":
      case "jpeg":
      case "png":
      case "gif":
      case "svg":
        return "fa-file-image";
      case "zip":
      case "rar":
      case "7z":
        return "fa-file-archive";
      default:
        return "fa-file-alt";
    }
  };

  // Получение цвета для файла
  const getFileColor = (url) => {
    const ext = getFileExtension(url);
    switch (ext) {
      case "pdf":
        return "#e74c3c";
      case "doc":
      case "docx":
        return "#2b5797";
      case "xls":
      case "xlsx":
        return "#217346";
      case "ppt":
      case "pptx":
        return "#d24726";
      case "jpg":
      case "jpeg":
      case "png":
      case "gif":
        return "#f39c12";
      default:
        return "#667eea";
    }
  };

  const handleLogout = () => {
    localStorage.removeItem(enums.TOKEN);
    navigate("/admin/auth");
  };

  return (
    <div className={styles["admin-panel"]}>
      <nav className={styles.navbar}>
        <div className={styles["nav-brand"]}>
          <h2>⚙️ Админ Панель</h2>
          <span>Управление системой</span>
        </div>
        <div className={styles["nav-user"]}>
          <span>👋 Привет, {user?.name || "Администратор"}!</span>
          <button onClick={handleLogout} className={styles["logout-btn"]}>
            Выйти
          </button>
        </div>
      </nav>

      <div className={styles["main-content"]}>
        {/* Вкладки */}
        <div className={styles["tabs-container"]}>
          <button
            className={`${styles["tab-btn"]} ${
              activeTab === "users" ? styles["tab-active"] : ""
            }`}
            onClick={() => setActiveTab("users")}
          >
            <i className="fas fa-users"></i>
            Пользователи
            <span className={styles["tab-badge"]}>{users.length}</span>
          </button>
          <button
            className={`${styles["tab-btn"]} ${
              activeTab === "reports" ? styles["tab-active"] : ""
            }`}
            onClick={() => setActiveTab("reports")}
          >
            <i className="fas fa-file-alt"></i>
            Отчеты
            <span className={styles["tab-badge"]}>{reports.length}</span>
          </button>
        </div>

        {/* Статистика */}
        <div className={styles["stats-cards"]}>
          {activeTab === "users" ? (
            <div className={styles["stat-card"]}>
              <div className={styles["stat-icon"]}>👥</div>
              <div className={styles["stat-info"]}>
                <h3>{users.length}</h3>
                <p>Всего пользователей</p>
              </div>
            </div>
          ) : (
            <>
              <div className={styles["stat-card"]}>
                <div className={styles["stat-icon"]}>📄</div>
                <div className={styles["stat-info"]}>
                  <h3>{reports.length}</h3>
                  <p>Всего отчетов</p>
                </div>
              </div>
              <div className={styles["stat-card"]}>
                <div className={styles["stat-icon"]}>📅</div>
                <div className={styles["stat-info"]}>
                  <h3>{Object.keys(groupedReports).length}</h3>
                  <p>Месяцев с отчетами</p>
                </div>
              </div>
              <div className={styles["stat-card"]}>
                <div className={styles["stat-icon"]}>📎</div>
                <div className={styles["stat-info"]}>
                  <h3>{reports.filter((r) => r.fileUrl).length}</h3>
                  <p>Файлов загружено</p>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Контент вкладок */}
        {activeTab === "users" ? (
          <div className={styles["users-section"]}>
            <div className={styles["section-header"]}>
              <h3>👤 Список пользователей</h3>
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
                    <th>Роль</th>
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
                        <span
                          className={styles["role-badge"]}
                          style={{
                            background:
                              user.role === "ADMIN"
                                ? "#f5222d"
                                : user.role === "ACCOUNTANT"
                                  ? "#1890ff"
                                  : "#52c41a",
                          }}
                        >
                          {user.role === "ADMIN"
                            ? "Администратор"
                            : user.role === "ACCOUNTANT"
                              ? "Бухгалтер"
                              : "Пользователь"}
                        </span>
                      </td>
                      <td>
                        {new Date(user.registrationDate).toLocaleDateString()}
                      </td>
                      <td className={styles.actions}>
                        <button
                          onClick={() => deleteUser(user.id)}
                          className={styles["delete-btn"]}
                        >
                          🗑️ Удалить
                        </button>
                      </td>
                    </tr>
                  ))}
                  {filteredUsers.length === 0 && (
                    <tr>
                      <td colSpan="6" className={styles["no-data"]}>
                        Пользователи не найдены
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <div className={styles["users-section"]}>
            <div className={styles["section-header"]}>
              <h3>📋 Список отчетов</h3>
              <button
                className={styles["refresh-btn"]}
                onClick={loadReports}
                disabled={loadingReports}
              >
                <i
                  className={`fas fa-sync ${loadingReports ? "fa-spin" : ""}`}
                ></i>
                {loadingReports ? "Обновление..." : "Обновить"}
              </button>
            </div>

            <div className={styles["search-box"]}>
              <input
                type="text"
                placeholder="🔍 Поиск по названию отчета..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            {loadingReports ? (
              <div className={styles["loading-container"]}>
                <div className={styles["spinner"]}></div>
                <p>Загрузка отчетов...</p>
              </div>
            ) : Object.keys(groupedReports).length === 0 ? (
              <div className={styles["no-data"]}>
                <div className={styles["no-data-icon"]}>📭</div>
                <p>Нет загруженных отчетов</p>
              </div>
            ) : (
              <div className={styles["reports-container"]}>
                {Object.entries(groupedReports).map(([month, monthReports]) => (
                  <div key={month} className={styles["month-group"]}>
                    <div className={styles["month-header"]}>
                      <h3>{formatMonth(month)}</h3>
                      <span className={styles["month-count"]}>
                        {monthReports.length}{" "}
                        {monthReports.length === 1 ? "отчет" : "отчетов"}
                      </span>
                    </div>

                    <div className={styles["reports-grid"]}>
                      {monthReports.map((report) => (
                        <div key={report.id} className={styles["report-card"]}>
                          <div className={styles["report-header"]}>
                            <div className={styles["report-title"]}>
                              <i
                                className={`fas ${getFileIcon(report.fileUrl)}`}
                                style={{
                                  color: getFileColor(report.fileUrl),
                                  fontSize: "24px",
                                }}
                              ></i>
                              <div className={styles["report-info"]}>
                                <h4>{report.name}</h4>
                                <span className={styles["file-extension"]}>
                                  {getFileExtension(
                                    report.fileUrl,
                                  ).toUpperCase()}
                                </span>
                              </div>
                            </div>
                            <div className={styles["report-actions"]}>
                              {report.fileUrl && (
                                <button
                                  onClick={() =>
                                    window.open(report.fileUrl, "_blank")
                                  }
                                  className={styles["download-btn"]}
                                  title="Скачать файл"
                                >
                                  <i className="fas fa-download"></i>
                                </button>
                              )}
                              <button
                                onClick={() => handleDeleteReport(report.id)}
                                className={styles["delete-btn"]}
                                title="Удалить"
                              >
                                <i className="fas fa-trash-alt"></i>
                              </button>
                            </div>
                          </div>

                          <div className={styles["report-meta"]}>
                            <span className={styles["report-id"]}>
                              <i className="fas fa-hashtag"></i>
                              ID: {report.id.substring(0, 8)}...
                            </span>
                            <span className={styles["report-date"]}>
                              <i className="far fa-calendar-alt"></i>
                              {formatDate(report.createdAt)}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Модальное окно добавления пользователя */}
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
                <label>Имя пользователя *</label>
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
                <label>Email *</label>
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
                <label>Пароль *</label>
                <input
                  type="password"
                  value={newUser.password}
                  onChange={(e) =>
                    setNewUser({ ...newUser, password: e.target.value })
                  }
                  placeholder="******"
                />
              </div>

              <div className={styles["form-group"]}>
                <label>Роль</label>
                <select
                  className={styles["admin__select"]}
                  value={newUser.role}
                  onChange={(e) =>
                    setNewUser({ ...newUser, role: e.target.value })
                  }
                >
                  <option value="USER">Пользователь</option>
                  <option value="ACCOUNTANT">Бухгалтер</option>
                  <option value="ADMIN">Администратор</option>
                </select>
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
