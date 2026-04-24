import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import "./MaintenanceModal.css";
import {
  createMaintance,
  editMaintance,
} from "../../../app/api/endpoints/maintance";
import { Checkbox, message } from "antd";

const MaintenanceModal = ({
  isOpen,
  onClose,
  onSave,
  maintenance = null,
  setServiceRecords,
  cars = [],
  loading: externalLoading,
}) => {
  const [formData, setFormData] = useState({
    price: "",
    type: "OIL_CHANGE",
    date: new Date().toISOString().split("T")[0],
    nextMaintanceMillageKM: "",
    place: "",
    description: "",
    masterName: "",
    autoId: "",
    isPlanned: false,
  });

  console.log(formData.isPlanned);

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const isEditing = !!maintenance;

  // Типы обслуживания
  const maintenanceTypes = [
    {
      value: "OIL",
      label: "Замена масла",
      icon: "fa-oil-can",
      color: "#f39c12",
    },
    {
      value: "FILTER_CHANGE",
      label: "Замена фильтров",
      icon: "fa-filter",
      color: "#3498db",
    },
    {
      value: "BRAKE_SERVICE",
      label: "Обслуживание тормозов",
      icon: "fa-brake-warning",
      color: "#e74c3c",
    },
    {
      value: "TIRE_SERVICE",
      label: "Смена шин",
      icon: "fa-car",
      color: "#1abc9c",
    },
    {
      value: "DIAGNOSTICS",
      label: "Диагностика",
      icon: "fa-stethoscope",
      color: "#9b59b6",
    },
    { value: "REPAIR", label: "Ремонт", icon: "fa-tools", color: "#e67e22" },
    {
      value: "PLANNED",
      label: "Плановое ТО",
      icon: "fa-calendar-check",
      color: "#2ecc71",
    },
    { value: "OTHER", label: "Другое", icon: "fa-wrench", color: "#7f8c8d" },
  ];

  // Заполнение формы при редактировании
  useEffect(() => {
    if (maintenance && isOpen) {
      setFormData({
        price: maintenance.price || "",
        type: maintenance.type || "OIL_CHANGE",
        date: maintenance.date
          ? new Date(maintenance.date).toISOString().split("T")[0]
          : new Date().toISOString().split("T")[0],
        nextMaintanceMillageKM: maintenance.nextMaintanceMillageKM || "",
        place: maintenance.place || "",
        description: maintenance.description || "",
        masterName: maintenance.masterName || "",
        autoId: maintenance.autoId || "",
        isPlanned: maintenance.status === "planned",
      });
      setErrors({});
    } else if (!maintenance && isOpen) {
      // Сброс формы при создании нового обслуживания
      setFormData({
        price: "",
        type: "OIL_CHANGE",
        date: new Date().toISOString().split("T")[0],
        nextMaintanceMillageKM: "",
        place: "",
        description: "",
        masterName: "",
        autoId: cars.length === 1 ? cars[0]?.id || "" : "",
      });
      setErrors({});
    }
  }, [maintenance, isOpen]);

  // Обработка изменения полей
  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({ ...prev, [name]: value }));

    // Очищаем ошибку для этого поля
    if (errors[name]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  // Валидация формы
  const validateForm = () => {
    const newErrors = {};

    if (!formData.autoId) {
      newErrors.autoId = "Выберите автомобиль";
    }

    if (!formData.price) {
      newErrors.price = "Введите стоимость обслуживания";
    } else if (isNaN(formData.price) || formData.price <= 0) {
      newErrors.price = "Введите корректную сумму";
    }

    if (!formData.date) {
      newErrors.date = "Выберите дату";
    }

    if (!formData.type) {
      newErrors.type = "Выберите тип обслуживания";
    }

    if (
      formData.nextMaintanceMillageKM &&
      (isNaN(formData.nextMaintanceMillageKM) ||
        formData.nextMaintanceMillageKM <= 0)
    ) {
      newErrors.nextMaintanceMillageKM = "Введите корректный пробег";
    }

    return newErrors;
  };

  // Отправка формы
  const handleSubmit = async (e) => {
    e.preventDefault();
    const newErrors = validateForm();

    if (Object.keys(newErrors).length === 0) {
      setLoading(true);

      const submitData = {
        price: parseInt(formData.price),
        type: formData.type,
        date: new Date(formData.date).toISOString(),
        nextMaintanceMillageKM: formData.nextMaintanceMillageKM
          ? parseInt(formData.nextMaintanceMillageKM)
          : null,
        place: formData.place || null,
        description: formData.description || null,
        masterName: formData.masterName || null,
        autoId: formData.autoId,
        status: formData.isPlanned ? "planned" : "completed",
      };

      if (!maintenance) {
        createMaintance(submitData)
          .then((res) => {
            setServiceRecords((prev) => [res.data, ...prev]);
            message.success("Данные об обслуживании сохранены");
            onClose();
          })
          .catch((e) => {
            message.error("Не удалось добавить данные об обслуживании");
          })
          .finally(() => {
            setLoading(false);
          });
      } else {
        editMaintance(maintenance.id, submitData)
          .then((res) => {
            setServiceRecords((prev) => [
              res.data,
              ...prev.filter((m) => m.id !== maintenance.id),
            ]);

            message.success("Запись обновлена");
            onClose();
          })
          .catch((e) => {
            message.error(
              `Не удалось изменить запись об обслуживании ${e.response.data.message}`
            );
          })
          .finally(() => {
            setLoading(false);
          });
      }

      setErrors(newErrors);
    }
  };

  // Получение информации о типе обслуживания
  const getTypeInfo = (typeValue) => {
    const type = maintenanceTypes.find((t) => t.value === typeValue);
    return type || maintenanceTypes[0];
  };

  const getTypeIcon = (typeValue) => getTypeInfo(typeValue).icon;
  const getTypeColor = (typeValue) => getTypeInfo(typeValue).color;
  const getTypeLabel = (typeValue) => getTypeInfo(typeValue).label;

  // Форматирование суммы
  const formatPrice = (price) => {
    if (!price) return "";
    return new Intl.NumberFormat("ru-RU").format(price);
  };

  // Форматирование пробега
  const formatMileage = (mileage) => {
    if (!mileage) return "";
    return new Intl.NumberFormat("ru-RU").format(mileage) + " км";
  };

  // Анимации
  const overlayVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { duration: 0.3 } },
    exit: { opacity: 0, transition: { duration: 0.2 } },
  };

  const modalVariants = {
    hidden: { opacity: 0, scale: 0.9, y: 50 },
    visible: {
      opacity: 1,
      scale: 1,
      y: 0,
      transition: {
        type: "spring",
        damping: 25,
        stiffness: 300,
        duration: 0.5,
      },
    },
    exit: {
      opacity: 0,
      scale: 0.9,
      y: 50,
      transition: { duration: 0.2 },
    },
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Затемнение фона */}
          <motion.div
            className="maintenance-modal__overlay"
            variants={overlayVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            onClick={onClose}
          />

          {/* Модальное окно */}
          <motion.div
            className="maintenance-modal"
            variants={modalVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
          >
            <div className="maintenance-modal__header">
              <h2 className="maintenance-modal__title">
                <i className={`fas ${isEditing ? "fa-edit" : "fa-wrench"}`}></i>
                {isEditing
                  ? "Редактирование обслуживания"
                  : "Добавление обслуживания"}
              </h2>
              <button
                className="maintenance-modal__close"
                onClick={onClose}
                disabled={loading || externalLoading}
              >
                <i className="fas fa-times"></i>
              </button>
            </div>

            <form onSubmit={handleSubmit} className="maintenance-modal__form">
              <div className="maintenance-modal__body">
                {/* Выбор автомобиля */}
                <div className="maintenance-modal__form-group">
                  <label className="maintenance-modal__label">
                    <i className="fas fa-car"></i>
                    Автомобиль *
                  </label>
                  <select
                    name="autoId"
                    className={`maintenance-modal__select ${
                      errors.autoId ? "maintenance-modal__select--error" : ""
                    }`}
                    value={formData.autoId}
                    onChange={handleChange}
                    disabled={loading || externalLoading}
                  >
                    <option value="">Выберите автомобиль</option>
                    {cars.map((car) => (
                      <option key={car.id} value={car.id}>
                        {car.mark} {car.model} ({car.number || "без номера"}) -{" "}
                        {car.mileageKM?.toLocaleString() || 0} км
                      </option>
                    ))}
                  </select>
                  {errors.autoId && (
                    <span className="maintenance-modal__error">
                      {errors.autoId}
                    </span>
                  )}
                </div>

                <div className="maintenance-modal__form-row">
                  {/* Тип обслуживания */}
                  <div className="maintenance-modal__form-group">
                    <label className="maintenance-modal__label">
                      <i className="fas fa-tools"></i>
                      Тип обслуживания *
                    </label>
                    <select
                      name="type"
                      className={`maintenance-modal__select ${
                        errors.type ? "maintenance-modal__select--error" : ""
                      }`}
                      value={formData.type}
                      onChange={handleChange}
                      disabled={loading || externalLoading}
                      style={{
                        borderColor: getTypeColor(formData.type) + "40",
                      }}
                    >
                      {maintenanceTypes.map((type) => (
                        <option key={type.value} value={type.value}>
                          {type.label}
                        </option>
                      ))}
                    </select>
                    {errors.type && (
                      <span className="maintenance-modal__error">
                        {errors.type}
                      </span>
                    )}
                  </div>

                  {/* Стоимость */}
                  <div className="maintenance-modal__form-group">
                    <label className="maintenance-modal__label">
                      <i className="fas fa-ruble-sign"></i>
                      Стоимость (₽) *
                    </label>
                    <input
                      type="number"
                      name="price"
                      className={`maintenance-modal__input ${
                        errors.price ? "maintenance-modal__input--error" : ""
                      }`}
                      value={formData.price}
                      onChange={handleChange}
                      placeholder="10000"
                      min="1"
                      step="1"
                      disabled={loading || externalLoading}
                    />
                    {errors.price && (
                      <span className="maintenance-modal__error">
                        {errors.price}
                      </span>
                    )}
                  </div>
                </div>

                <div className="maintenance-modal__form-row">
                  {/* Дата */}
                  <div className="maintenance-modal__form-group">
                    <label className="maintenance-modal__label">
                      <i className="fas fa-calendar"></i>
                      Дата *
                    </label>
                    <input
                      type="date"
                      name="date"
                      className={`maintenance-modal__input ${
                        errors.date ? "maintenance-modal__input--error" : ""
                      }`}
                      value={formData.date}
                      onChange={handleChange}
                      disabled={loading || externalLoading}
                    />
                    {errors.date && (
                      <span className="maintenance-modal__error">
                        {errors.date}
                      </span>
                    )}
                  </div>

                  {/* Следующее ТО (пробег) */}
                  <div className="maintenance-modal__form-group">
                    <label className="maintenance-modal__label">
                      <i className="fas fa-road"></i>
                      Следующее ТО (км)
                    </label>
                    <input
                      type="number"
                      name="nextMaintanceMillageKM"
                      className={`maintenance-modal__input ${
                        errors.nextMaintanceMillageKM
                          ? "maintenance-modal__input--error"
                          : ""
                      }`}
                      value={formData.nextMaintanceMillageKM}
                      onChange={handleChange}
                      placeholder="10000"
                      min="1"
                      disabled={loading || externalLoading}
                    />
                    {errors.nextMaintanceMillageKM && (
                      <span className="maintenance-modal__error">
                        {errors.nextMaintanceMillageKM}
                      </span>
                    )}
                  </div>
                </div>

                <div className="maintenance-modal__form-row">
                  {/* Место */}
                  <div className="maintenance-modal__form-group">
                    <label className="maintenance-modal__label">
                      <i className="fas fa-map-marker-alt"></i>
                      Место
                    </label>
                    <input
                      type="text"
                      name="place"
                      className="maintenance-modal__input"
                      value={formData.place}
                      onChange={handleChange}
                      placeholder="Например: Toyota Центр, МКАД 65км"
                      disabled={loading || externalLoading}
                    />
                  </div>

                  {/* Мастер */}
                  <div className="maintenance-modal__form-group">
                    <label className="maintenance-modal__label">
                      <i className="fas fa-user-cog"></i>
                      Мастер
                    </label>
                    <input
                      type="text"
                      name="masterName"
                      className="maintenance-modal__input"
                      value={formData.masterName}
                      onChange={handleChange}
                      placeholder="Иванов А.А."
                      disabled={loading || externalLoading}
                    />
                  </div>
                </div>

                <label
                  className="flex items-center gap-4"
                  style={{ marginBottom: 20 }}
                >
                  <Checkbox
                    checked={formData.isPlanned}
                    name="isPlanned"
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        isPlanned: e.target.checked,
                      }))
                    }
                  />
                  Запланировать на выбранную дату
                </label>

                {/* Описание */}
                <div className="maintenance-modal__form-group">
                  <label className="maintenance-modal__label">
                    <i className="fas fa-file-alt"></i>
                    Описание работ
                  </label>
                  <textarea
                    name="description"
                    className="maintenance-modal__textarea"
                    value={formData.description}
                    onChange={handleChange}
                    placeholder="Детали выполненных работ, замененные запчасти..."
                    rows="4"
                    disabled={loading || externalLoading}
                  />
                </div>

                {/* Информация о выбранном обслуживании */}
                {formData.type && (
                  <div
                    className="maintenance-modal__info"
                    style={{
                      backgroundColor: getTypeColor(formData.type) + "10",
                      borderColor: getTypeColor(formData.type) + "40",
                    }}
                  >
                    <div
                      className="maintenance-modal__info-icon"
                      style={{
                        backgroundColor: getTypeColor(formData.type) + "20",
                      }}
                    >
                      <i
                        className={`fas ${getTypeIcon(formData.type)}`}
                        style={{ color: getTypeColor(formData.type) }}
                      ></i>
                    </div>
                    <div className="maintenance-modal__info-content">
                      <div className="maintenance-modal__info-row">
                        <span className="maintenance-modal__info-label">
                          Тип:
                        </span>
                        <span className="maintenance-modal__info-value">
                          {getTypeLabel(formData.type)}
                        </span>
                      </div>
                      {formData.price && (
                        <div className="maintenance-modal__info-row">
                          <span className="maintenance-modal__info-label">
                            Стоимость:
                          </span>
                          <span className="maintenance-modal__info-value maintenance-modal__info-value--price">
                            {formatPrice(formData.price)} ₽
                          </span>
                        </div>
                      )}
                      {formData.nextMaintanceMillageKM && (
                        <div className="maintenance-modal__info-row">
                          <span className="maintenance-modal__info-label">
                            Следующее ТО:
                          </span>
                          <span className="maintenance-modal__info-value">
                            {formatMileage(formData.nextMaintanceMillageKM)}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Рекомендации */}
                <div className="maintenance-modal__tips">
                  <i className="fas fa-lightbulb"></i>
                  <div>
                    <strong>Совет:</strong> Регулярное техническое обслуживание
                    продлевает срок службы автомобиля и повышает безопасность.
                  </div>
                </div>
              </div>

              <div className="maintenance-modal__footer">
                <button
                  type="button"
                  className="maintenance-modal__btn maintenance-modal__btn--secondary"
                  onClick={onClose}
                  disabled={loading || externalLoading}
                >
                  Отмена
                </button>
                <button
                  type="submit"
                  className="maintenance-modal__btn maintenance-modal__btn--primary"
                  disabled={loading || externalLoading}
                >
                  {loading || externalLoading ? (
                    <>
                      <i className="fas fa-spinner fa-spin"></i>
                      {isEditing ? "Сохранение..." : "Добавление..."}
                    </>
                  ) : (
                    <>
                      <i
                        className={`fas ${isEditing ? "fa-save" : "fa-plus"}`}
                      ></i>
                      {isEditing ? "Сохранить изменения" : "Добавить запись"}
                    </>
                  )}
                </button>
              </div>
            </form>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default MaintenanceModal;
