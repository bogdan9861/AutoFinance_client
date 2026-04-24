import React, { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import "./ExpenseModal.css";
import {
  createExpencess,
  editExpencess,
} from "../../../app/api/endpoints/expencess";
import { message } from "antd";

const ExpenseModal = ({
  isOpen,
  onClose,
  onSave,
  expense = null,
  cars = [],
  loading: externalLoading,
  setExpenses,
}) => {
  const [formData, setFormData] = useState({
    price: "",
    type: "FUEL",
    date: new Date().toISOString().split("T")[0],
    place: "",
    description: "",
    autoId: "",
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const isEditing = useMemo(() => {
    return !!expense;
  }, [expense]);

  // Типы расходов
  const expenseTypes = [
    { value: "FUEL", label: "Топливо", icon: "fa-gas-pump", color: "#f39c12" },
    {
      value: "MAINTANCE",
      label: "Обслуживание",
      icon: "fa-wrench",
      color: "#3498db",
    },
    { value: "REPAIR", label: "Ремонт", icon: "fa-tools", color: "#e74c3c" },
    {
      value: "INSURANCE",
      label: "Страховка",
      icon: "fa-shield-alt",
      color: "#9b59b6",
    },
    {
      value: "TAXES",
      label: "Налоги",
      icon: "fa-file-invoice",
      color: "#e67e22",
    },
    {
      value: "PARKING",
      label: "Парковка",
      icon: "fa-parking",
      color: "#1abc9c",
    },
    {
      value: "CHARGING",
      label: "Зарядка",
      icon: "fa-charging-station",
      color: "#2ecc71",
    },
  ];

  const clearFields = () => {
    setFormData({
      price: "",
      type: "FUEL",
      date: new Date().toISOString().split("T")[0],
      place: "",
      description: "",
      autoId: cars.length === 1 ? cars[0].id : "",
    });
    setErrors({});
  };

  useEffect(() => {
    if (expense && isOpen) {
      setFormData({
        price: expense.price || "",
        type: expense.type || "FUEL",
        date: expense.date
          ? new Date(expense.date).toISOString().split("T")[0]
          : new Date().toISOString().split("T")[0],
        place: expense.place || "",
        description: expense.description || "",
        autoId: expense.autoId || "",
      });
      setErrors({});
    } else if (!expense && isOpen) {
      // Сброс формы при создании нового расхода
      clearFields();
    }
  }, [expense, isOpen]);

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
      newErrors.price = "Введите сумму расхода";
    } else if (isNaN(formData.price) || formData.price <= 0) {
      newErrors.price = "Введите корректную сумму";
    }

    if (!formData.date) {
      newErrors.date = "Выберите дату";
    }

    if (!formData.type) {
      newErrors.type = "Выберите тип расхода";
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
        place: formData.place || null,
        description: formData.description || null,
        autoId: formData.autoId,
      };

      if (!isEditing) {
        createExpencess(submitData)
          .then((res) => {
            console.log(res.data);

            setExpenses((prev) => [res.data, ...prev]);
            onClose();
            message.success("Расход добавлен");
          })
          .catch((e) => {
            console.dir(e);

            message.error(
              `Ошибка создания создания расхода ${e?.response?.data?.message}`
            );
          })
          .finally(() => {
            setLoading(false);
          });
      } else {
        editExpencess(expense?.id, submitData)
          .then((res) => {
            setExpenses((prev) => [
              res.data,
              ...prev.filter((e) => e.id !== expense.id),
            ]);

            message.success("Расход изменён");
            onClose();
          })
          .catch((e) => {
            message.error(
              `Не удалось изменить расход ${e?.response?.data?.message}`
            );
          })
          .finally(() => {
            setLoading(false);
          });
      }
    } else {
      setErrors(newErrors);
    }
  };

  // Получение иконки типа расхода
  const getTypeIcon = (typeValue) => {
    const type = expenseTypes.find((t) => t.value === typeValue);
    return type ? type.icon : "fa-receipt";
  };

  const getTypeColor = (typeValue) => {
    const type = expenseTypes.find((t) => t.value === typeValue);
    return type ? type.color : "#95a5a6";
  };

  const getTypeLabel = (typeValue) => {
    const type = expenseTypes.find((t) => t.value === typeValue);
    return type ? type.label : "Другое";
  };

  // Форматирование суммы для отображения
  const formatPrice = (price) => {
    if (!price) return "";
    return new Intl.NumberFormat("ru-RU").format(price);
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
            className="expense-modal__overlay"
            variants={overlayVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            onClick={() => {
              onClose();
              clearFields();
            }}
          />

          {/* Модальное окно */}
          <motion.div
            className="expense-modal"
            variants={modalVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
          >
            <div className="expense-modal__header">
              <h2 className="expense-modal__title">
                <i
                  className={`fas ${isEditing ? "fa-edit" : "fa-plus-circle"}`}
                ></i>
                {isEditing ? "Редактирование расхода" : "Добавление расхода"}
              </h2>
              <button
                className="expense-modal__close"
                onClick={() => {
                  onClose();
                  clearFields();
                }}
                disabled={loading || externalLoading}
              >
                <i className="fas fa-times"></i>
              </button>
            </div>

            <form onSubmit={handleSubmit} className="expense-modal__form">
              <div className="expense-modal__body">
                {/* Выбор автомобиля */}
                <div className="expense-modal__form-group">
                  <label className="expense-modal__label">
                    <i className="fas fa-car"></i>
                    Автомобиль *
                  </label>
                  <select
                    name="autoId"
                    className={`expense-modal__select ${
                      errors.autoId ? "expense-modal__select--error" : ""
                    }`}
                    value={formData.autoId}
                    onChange={handleChange}
                    disabled={loading || externalLoading}
                  >
                    <option value="">Выберите автомобиль</option>
                    {cars.map((car) => (
                      <option key={car.id} value={car.id}>
                        {car.mark} {car.model} ({car.number || "без номера"})
                      </option>
                    ))}
                  </select>
                  {errors.autoId && (
                    <span className="expense-modal__error">
                      {errors.autoId}
                    </span>
                  )}
                </div>

                <div className="expense-modal__form-row">
                  {/* Тип расхода */}
                  <div className="expense-modal__form-group">
                    <label className="expense-modal__label">
                      <i className="fas fa-tag"></i>
                      Тип расхода *
                    </label>
                    <select
                      name="type"
                      className={`expense-modal__select ${
                        errors.type ? "expense-modal__select--error" : ""
                      }`}
                      value={formData.type}
                      onChange={handleChange}
                      disabled={loading || externalLoading}
                    >
                      {expenseTypes.map((type) => (
                        <option key={type.value} value={type.value}>
                          {type.label}
                        </option>
                      ))}
                    </select>
                    {errors.type && (
                      <span className="expense-modal__error">
                        {errors.type}
                      </span>
                    )}
                  </div>

                  {/* Сумма */}
                  <div className="expense-modal__form-group">
                    <label className="expense-modal__label">
                      <i className="fas fa-ruble-sign"></i>
                      Сумма (₽) *
                    </label>
                    <input
                      type="number"
                      name="price"
                      className={`expense-modal__input ${
                        errors.price ? "expense-modal__input--error" : ""
                      }`}
                      value={formData.price}
                      onChange={handleChange}
                      placeholder="1000"
                      min="1"
                      step="1"
                      disabled={loading || externalLoading}
                    />
                    {errors.price && (
                      <span className="expense-modal__error">
                        {errors.price}
                      </span>
                    )}
                  </div>
                </div>

                <div className="expense-modal__form-row">
                  {/* Дата */}
                  <div className="expense-modal__form-group">
                    <label className="expense-modal__label">
                      <i className="fas fa-calendar"></i>
                      Дата *
                    </label>
                    <input
                      type="date"
                      name="date"
                      className={`expense-modal__input ${
                        errors.date ? "expense-modal__input--error" : ""
                      }`}
                      value={formData.date}
                      onChange={handleChange}
                      disabled={loading || externalLoading}
                    />
                    {errors.date && (
                      <span className="expense-modal__error">
                        {errors.date}
                      </span>
                    )}
                  </div>

                  {/* Место */}
                  <div className="expense-modal__form-group">
                    <label className="expense-modal__label">
                      <i className="fas fa-map-marker-alt"></i>
                      Место
                    </label>
                    <input
                      type="text"
                      name="place"
                      className="expense-modal__input"
                      value={formData.place}
                      onChange={handleChange}
                      placeholder="Например: Лукойл, Каширское шоссе"
                      disabled={loading || externalLoading}
                    />
                  </div>
                </div>

                {/* Описание */}
                <div className="expense-modal__form-group">
                  <label className="expense-modal__label">
                    <i className="fas fa-file-alt"></i>
                    Описание
                  </label>
                  <textarea
                    name="description"
                    className="expense-modal__textarea"
                    value={formData.description}
                    onChange={handleChange}
                    placeholder="Детали расхода..."
                    rows="3"
                    disabled={loading || externalLoading}
                  />
                </div>

                {/* Информация о выбранном типе */}
                {formData.type && (
                  <div className="expense-modal__info">
                    <div
                      className="expense-modal__info-icon"
                      style={{
                        backgroundColor: getTypeColor(formData.type) + "20",
                      }}
                    >
                      <i
                        className={`fas ${getTypeIcon(formData.type)}`}
                        style={{ color: getTypeColor(formData.type) }}
                      ></i>
                    </div>
                    <div className="expense-modal__info-text">
                      <span className="expense-modal__info-type">
                        {getTypeLabel(formData.type)}
                      </span>
                      {formData.price && (
                        <span className="expense-modal__info-price">
                          {formatPrice(formData.price)} ₽
                        </span>
                      )}
                    </div>
                  </div>
                )}
              </div>

              <div className="expense-modal__footer">
                <button
                  type="button"
                  className="expense-modal__btn expense-modal__btn--secondary"
                  onClick={onClose}
                  disabled={loading || externalLoading}
                >
                  Отмена
                </button>
                <button
                  type="submit"
                  className="expense-modal__btn expense-modal__btn--primary"
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
                      {isEditing ? "Сохранить изменения" : "Добавить расход"}
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

export default ExpenseModal;
