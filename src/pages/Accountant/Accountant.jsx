import React, { useState, useEffect, useRef } from "react";
import styles from "./Admin.module.css";
import { message, Modal } from "antd";
import useUser from "../../hooks/useUser";
import { useNavigate } from "react-router";
import { enums } from "../../constants";
import {
  getAllReports,
  createReport,
  deleteReport,
} from "../../app/api/endpoints/reports";
import moment from "moment";
import "moment/locale/ru";

const Accountant = () => {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedReport, setSelectedReport] = useState(null);
  const [newReport, setNewReport] = useState({
    name: "",
  });
  const [selectedFile, setSelectedFile] = useState(null);
  const [fileName, setFileName] = useState("");
  const fileInputRef = useRef(null);
  const navigate = useNavigate();

  const { user, loading: userLoading } = useUser();

  useEffect(() => {
    if (userLoading) return;
    if (user?.role !== "ACCOUNTANT" && user?.role !== "ADMIN") {
      navigate("/admin/auth");
    }
  }, [userLoading, user, navigate]);

  useEffect(() => {
    if (userLoading) return;

    const loadReports = async () => {
      setLoading(true);
      try {
        const response = await getAllReports();
        setReports(response.data || []);
      } catch (error) {
        console.error("Ошибка загрузки отчетов:", error);
        message.error("Не удалось загрузить отчеты");
      } finally {
        setLoading(false);
      }
    };

    loadReports();
  }, [userLoading]);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const maxSize = 20 * 1024 * 1024;
      if (file.size > maxSize) {
        message.error("Размер файла не должен превышать 20MB");
        return;
      }

      const allowedTypes = [
        "application/pdf",
        "application/msword",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        "application/vnd.ms-excel",
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "application/vnd.openxmlformats-officedocument.presentationml.presentation",
        "image/jpeg",
        "image/jpg",
        "image/png",
      ];

      if (!allowedTypes.includes(file.type)) {
        message.error("Неподдерживаемый формат файла");
        return;
      }

      setSelectedFile(file);
      setFileName(file.name);
    }
  };

  const handleCreateReport = async () => {
    if (!newReport.title) {
      message.error("Введите название отчета");
      return;
    }

    if (!selectedFile) {
      message.error("Выберите файл для загрузки");
      return;
    }

    try {
      const formData = new FormData();
      formData.append("name", newReport.title);
      formData.append("file", selectedFile);

      const response = await createReport(formData);

      setReports((prev) => [response.data, ...prev]);
      setShowAddModal(false);
      resetForm();
      message.success("Отчет успешно загружен");
    } catch (error) {
      console.error(error);
      message.error("Ошибка загрузки отчета");
    }
  };

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

  const resetForm = () => {
    setNewReport({
      title: "",
      description: "",
      month: moment().format("YYYY-MM"),
    });
    setSelectedFile(null);
    setFileName("");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleLogout = () => {
    localStorage.removeItem(enums.TOKEN);
    navigate("/admin/auth");
  };

  const groupReportsByMonth = () => {
    const filtered = reports.filter((report) => {
      const searchLower = searchTerm.toLowerCase();
      return (
        report.name.toLowerCase().includes(searchLower) ||
        report.createdAt.includes(searchLower)
      );
    });

    const grouped = {};
    filtered.forEach((report) => {
      const monthKey =
        report.month || moment(report.createdAt).format("YYYY-MM");
      if (!grouped[monthKey]) {
        grouped[monthKey] = [];
      }
      grouped[monthKey].push(report);
    });

    // Сортировка месяцев по убыванию
    return Object.keys(grouped)
      .sort((a, b) => b.localeCompare(a))
      .reduce((acc, key) => {
        acc[key] = grouped[key];
        return acc;
      }, {});
  };

  const groupedReports = groupReportsByMonth();

  // Форматирование месяца
  const formatMonth = (monthStr) => {
    const [year, month] = monthStr.split("-");
    const date = moment(`${year}-${month}-01`);
    return date.format("MMMM YYYY");
  };

  // Форматирование даты
  const formatDate = (date) => {
    return moment(date).format("DD MMM YYYY HH:mm");
  };

  return (
    <div className={styles["admin-panel"]}>
      <nav className={styles.navbar}>
        <div className={styles["nav-brand"]}>
          <h2>📊 Панель Бухгалтера</h2>
          <span>Управление отчетами</span>
        </div>
        <div className={styles["nav-user"]}>
          <span>👋 Привет, {user?.name || "Бухгалтер"}!</span>
          <button onClick={handleLogout} className={styles["logout-btn"]}>
            Выйти
          </button>
        </div>
      </nav>

      <div className={styles["main-content"]}>
        {/* Карточки статистики */}
        <div className={styles["stats-cards"]}>
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
              <h3>{reports.filter((r) => r.hasFile || r.fileUrl).length}</h3>
              <p>Файлов загружено</p>
            </div>
          </div>
        </div>

        {/* Список отчетов */}
        <div className={styles["users-section"]}>
          <div className={styles["section-header"]}>
            <h3>📋 Список отчетов</h3>
            <button
              className={styles["add-user-btn"]}
              onClick={() => setShowAddModal(true)}
            >
              + Загрузить отчет
            </button>
          </div>

          <div className={styles["search-box"]}>
            <input
              type="text"
              placeholder="🔍 Поиск по названию, описанию или месяцу..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          {loading ? (
            <div className={styles["loading-container"]}>
              <div className={styles["spinner"]}></div>
              <p>Загрузка отчетов...</p>
            </div>
          ) : Object.keys(groupedReports).length === 0 ? (
            <div className={styles["no-data"]}>
              <div className={styles["no-data-icon"]}>📭</div>
              <p>Нет загруженных отчетов</p>
              <span>Нажмите "Загрузить отчет" чтобы добавить первый отчет</span>
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
                            <i className="fas fa-file-alt"></i>
                            <h4>{report.name}</h4>
                          </div>
                          <div className={styles["report-actions"]}>
                            {report.fileUrl && (
                              <button
                                onClick={() => {
                                  window.open(report.fileUrl, "_blank");
                                }}
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
                          <span className={styles["report-date"]}>
                            <i className="far fa-calendar-alt"></i>
                            {formatDate(report.createdAt)}
                          </span>
                          {report.fileName && (
                            <span className={styles["report-file"]}>
                              <i className="fas fa-paperclip"></i>
                              {report.fileName}
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Модальное окно загрузки отчета */}
      {showAddModal && (
        <div
          className={styles["modal-overlay"]}
          onClick={() => {
            setShowAddModal(false);
            resetForm();
          }}
        >
          <div
            className={`${styles["modal-content"]} ${styles["report-modal"]}`}
            onClick={(e) => e.stopPropagation()}
          >
            <div className={styles["modal-header"]}>
              <h3>📎 Загрузить отчет</h3>
              <button
                className={styles["modal-close"]}
                onClick={() => {
                  setShowAddModal(false);
                  resetForm();
                }}
              >
                ×
              </button>
            </div>
            <div className={styles["modal-body"]}>
              <div className={styles["form-group"]}>
                <label>Название отчета *</label>
                <input
                  type="text"
                  value={newReport.name}
                  onChange={(e) =>
                    setNewReport({ ...newReport, name: e.target.value })
                  }
                  placeholder="Введите название отчета"
                />
              </div>

              <div className={styles["form-group"]}>
                <label>Файл отчета *</label>
                <div className={styles["file-area"]}>
                  <input
                    ref={fileInputRef}
                    type="file"
                    id="file-upload"
                    className={styles["file-input"]}
                    onChange={handleFileChange}
                    accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.jpg,.jpeg,.png"
                  />
                  <label htmlFor="file-upload" className={styles["file-label"]}>
                    <i className="fas fa-cloud-upload-alt"></i>
                    <span>
                      {fileName || "Выберите файл или перетащите его сюда"}
                    </span>
                    <small>
                      Поддерживаются: PDF, DOC, DOCX, XLS, XLSX, PPT, PPTX, JPG,
                      PNG
                    </small>
                  </label>
                </div>
                {fileName && (
                  <div className={styles["file-info"]}>
                    <i className="fas fa-file"></i>
                    <span>{fileName}</span>
                    {selectedFile && (
                      <small>
                        ({(selectedFile.size / 1024).toFixed(1)} KB)
                      </small>
                    )}
                  </div>
                )}
              </div>
            </div>
            <div className={styles["modal-footer"]}>
              <button
                onClick={() => {
                  setShowAddModal(false);
                  resetForm();
                }}
                className={styles["cancel-btn"]}
              >
                Отмена
              </button>
              <button
                onClick={handleCreateReport}
                className={styles["add-btn"]}
                disabled={!selectedFile || !newReport.name}
              >
                <i className="fas fa-upload"></i>
                Загрузить отчет
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Accountant;
