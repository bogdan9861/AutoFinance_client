import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import "./AddCarModal.css";
import { createCars } from "../../../app/api/endpoints/cars";
import { message } from "antd";

const AddCarModal = ({ open, onClose, loading: externalLoading, setCars }) => {
  const [formData, setFormData] = useState({
    mark: "",
    model: "",
    year: new Date().getFullYear(),
    number: "",
    mileageKM: "",
    fuelType: "PETROL",
    consumption: "",
    color: "#3b82f6",
    maintanceDistance: "",
    distanceCovered: "",
    lastService: "",
    image: null,
    imagePreview: null,
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [imageFile, setImageFile] = useState(null);
  const [currentStep, setCurrentStep] = useState(1);

  // Типы топлива
  const fuelTypes = [
    { value: "PETROL", label: "Бензин", icon: "fa-gas-pump", color: "#f39c12" },
    { value: "DIESEL", label: "Дизель", icon: "fa-oil-can", color: "#3498db" },
    {
      value: "ELECTRO",
      label: "Электро",
      icon: "fa-charging-station",
      color: "#2ecc71",
    },
    { value: "HYBRID", label: "Гибрид", icon: "fa-leaf", color: "#1abc9c" },
  ];

  // Сброс формы при закрытии
  useEffect(() => {
    if (!open) {
      resetForm();
    }
  }, [open]);

  const resetForm = () => {
    setFormData({
      mark: "",
      model: "",
      year: new Date().getFullYear(),
      number: "",
      mileageKM: "",
      fuelType: "PETROL",
      consumption: "",
      color: "#3b82f6",
      maintanceDistance: "",
      distanceCovered: "",
      lastService: "",
      image: null,
      imagePreview: null,
    });
    setImageFile(null);
    setErrors({});
    setCurrentStep(1);
  };

  // Обработка изменения полей
  const handleChange = (e) => {
    const { name, value, type, files } = e.target;

    if (type === "file" && files[0]) {
      const file = files[0];
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData((prev) => ({
          ...prev,
          imagePreview: reader.result,
        }));
      };
      reader.readAsDataURL(file);
      setImageFile(file);
      setFormData((prev) => ({ ...prev, image: file }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }

    // Очищаем ошибку для этого поля
    if (errors[name]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  // Валидация текущего шага
  const validateStep = () => {
    const newErrors = {};

    if (currentStep === 1) {
      if (!formData.mark?.trim()) {
        newErrors.mark = "Введите марку автомобиля";
      }
      if (!formData.model?.trim()) {
        newErrors.model = "Введите модель автомобиля";
      }
      if (!formData.year) {
        newErrors.year = "Введите год выпуска";
      } else if (
        formData.year < 1900 ||
        formData.year > new Date().getFullYear() + 1
      ) {
        newErrors.year = "Введите корректный год (1900-2026)";
      }
    }

    if (currentStep === 2) {
      if (
        formData.mileageKM &&
        (isNaN(formData.mileageKM) || formData.mileageKM < 0)
      ) {
        newErrors.mileageKM = "Введите корректный пробег";
      }
      if (
        formData.consumption &&
        (isNaN(formData.consumption) || formData.consumption <= 0)
      ) {
        newErrors.consumption = "Введите корректный расход топлива";
      }
    }

    if (currentStep === 3) {
      if (
        formData.maintanceDistance &&
        (isNaN(formData.maintanceDistance) || formData.maintanceDistance <= 0)
      ) {
        newErrors.maintanceDistance = "Введите корректный интервал ТО";
      }
      if (
        formData.distanceCovered &&
        (isNaN(formData.distanceCovered) || formData.distanceCovered < 0)
      ) {
        newErrors.distanceCovered = "Введите корректный пробег после ТО";
      }
      if (
        formData.distanceCovered &&
        formData.maintanceDistance &&
        formData.distanceCovered > formData.maintanceDistance
      ) {
        newErrors.distanceCovered =
          "Пробег после ТО не может превышать интервал ТО";
      }
    }

    return newErrors;
  };

  // Переход к следующему шагу
  const handleNextStep = () => {
    const stepErrors = validateStep();
    if (Object.keys(stepErrors).length === 0) {
      setCurrentStep((prev) => prev + 1);
      setErrors({});
    } else {
      setErrors(stepErrors);
    }
  };

  // Переход к предыдущему шагу
  const handlePrevStep = () => {
    setCurrentStep((prev) => prev - 1);
    setErrors({});
  };

  // Отправка формы
  const handleSubmit = async (e) => {
    e.preventDefault();
    const stepErrors = validateStep();

    if (Object.keys(stepErrors).length === 0) {
      setLoading(true);

      const submitData = new FormData();
      submitData.append("mark", formData.mark);
      submitData.append("model", formData.model);
      submitData.append("year", formData.year);
      submitData.append("number", formData.number);
      submitData.append("mileageKM", formData.mileageKM || 0);
      submitData.append("fuelType", formData.fuelType);
      submitData.append("consumption", formData.consumption || 0);
      submitData.append("color", formData.color);
      submitData.append("maintanceDistance", formData.maintanceDistance || 0);
      submitData.append("distanceCovered", formData.distanceCovered || 0);
      submitData.append("lastService", formData.lastService || "");

      if (imageFile) {
        submitData.append("image", imageFile);
      }

      createCars(submitData)
        .then((res) => {
          setCars((prev) => [res.data, ...prev]);
          message.success("Автомобиль добавлен");
          resetForm();
          onClose();
        })
        .catch((e) => {
          message.error("Не удалось создать автомобиль");
        })
        .finally(() => {
          setLoading(false);
        });
    } else {
      setErrors(stepErrors);
    }
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

  const stepVariants = {
    hidden: { opacity: 0, x: 20 },
    visible: {
      opacity: 1,
      x: 0,
      transition: {
        type: "spring",
        damping: 20,
        stiffness: 200,
      },
    },
    exit: {
      opacity: 0,
      x: -20,
      transition: { duration: 0.2 },
    },
  };

  const getFuelIcon = (fuelType) => {
    const type = fuelTypes.find((t) => t.value === fuelType);
    return type ? type.icon : "fa-gas-pump";
  };

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Затемнение фона */}
          <motion.div
            className="add-car-modal__overlay"
            variants={overlayVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            onClick={onClose}
          />

          {/* Модальное окно */}
          <motion.div
            className="add-car-modal"
            variants={modalVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
          >
            <div className="add-car-modal__header">
              <h2 className="add-car-modal__title">
                <i className="fas fa-plus-circle"></i>
                Добавление автомобиля
              </h2>
              <button
                className="add-car-modal__close"
                onClick={onClose}
                disabled={loading || externalLoading}
              >
                <i className="fas fa-times"></i>
              </button>
            </div>

            {/* Прогресс-бар шагов */}
            <div className="add-car-modal__progress">
              <div className="add-car-modal__steps">
                <div
                  className={`add-car-modal__step ${
                    currentStep >= 1 ? "add-car-modal__step--active" : ""
                  }`}
                >
                  <div className="add-car-modal__step-number">1</div>
                  <span className="add-car-modal__step-label">
                    Основная информация
                  </span>
                </div>
                <div
                  className={`add-car-modal__step ${
                    currentStep >= 2 ? "add-car-modal__step--active" : ""
                  }`}
                >
                  <div className="add-car-modal__step-number">2</div>
                  <span className="add-car-modal__step-label">
                    Технические характеристики
                  </span>
                </div>
                <div
                  className={`add-car-modal__step ${
                    currentStep >= 3 ? "add-car-modal__step--active" : ""
                  }`}
                >
                  <div className="add-car-modal__step-number">3</div>
                  <span className="add-car-modal__step-label">
                    Обслуживание
                  </span>
                </div>
              </div>
              <div className="add-car-modal__progress-bar">
                <motion.div
                  className="add-car-modal__progress-fill"
                  initial={{ width: "0%" }}
                  animate={{ width: `${(currentStep / 3) * 100}%` }}
                  transition={{ duration: 0.3 }}
                />
              </div>
            </div>

            <form onSubmit={handleSubmit} className="add-car-modal__form">
              <div className="add-car-modal__body">
                <AnimatePresence mode="wait">
                  {/* Шаг 1: Основная информация */}
                  {currentStep === 1 && (
                    <motion.div
                      key="step1"
                      className="add-car-modal__step-content"
                      variants={stepVariants}
                      initial="hidden"
                      animate="visible"
                      exit="exit"
                    >
                      {/* Загрузка изображения */}
                      <div className="add-car-modal__form-group add-car-modal__form-group--avatar">
                        <label className="add-car-modal__label">
                          <i className="fas fa-image"></i>
                          Фото автомобиля
                        </label>
                        <div className="add-car-modal__avatar-upload">
                          <div className="add-car-modal__avatar-preview">
                            {formData.imagePreview ? (
                              <img
                                src={formData.imagePreview}
                                alt="Preview"
                                className="add-car-modal__avatar-image"
                              />
                            ) : (
                              <div className="add-car-modal__avatar-placeholder">
                                <i className="fas fa-car"></i>
                              </div>
                            )}
                          </div>
                          <div className="add-car-modal__avatar-actions">
                            <label className="add-car-modal__avatar-btn">
                              <i className="fas fa-upload"></i>
                              Загрузить фото
                              <input
                                type="file"
                                name="image"
                                accept="image/*"
                                onChange={handleChange}
                                className="add-car-modal__avatar-input"
                              />
                            </label>
                          </div>
                        </div>
                      </div>

                      <div className="add-car-modal__form-grid">
                        {/* Марка */}
                        <div className="add-car-modal__form-group">
                          <label className="add-car-modal__label">
                            <i className="fas fa-tag"></i>
                            Марка *
                          </label>
                          <input
                            type="text"
                            name="mark"
                            className={`add-car-modal__input ${
                              errors.mark ? "add-car-modal__input--error" : ""
                            }`}
                            value={formData.mark}
                            onChange={handleChange}
                            placeholder="Например: Toyota"
                            disabled={loading || externalLoading}
                          />
                          {errors.mark && (
                            <span className="add-car-modal__error">
                              {errors.mark}
                            </span>
                          )}
                        </div>

                        {/* Модель */}
                        <div className="add-car-modal__form-group">
                          <label className="add-car-modal__label">
                            <i className="fas fa-car"></i>
                            Модель *
                          </label>
                          <input
                            type="text"
                            name="model"
                            className={`add-car-modal__input ${
                              errors.model ? "add-car-modal__input--error" : ""
                            }`}
                            value={formData.model}
                            onChange={handleChange}
                            placeholder="Например: Camry"
                            disabled={loading || externalLoading}
                          />
                          {errors.model && (
                            <span className="add-car-modal__error">
                              {errors.model}
                            </span>
                          )}
                        </div>

                        {/* Год выпуска */}
                        <div className="add-car-modal__form-group">
                          <label className="add-car-modal__label">
                            <i className="fas fa-calendar"></i>
                            Год выпуска *
                          </label>
                          <input
                            type="number"
                            name="year"
                            className={`add-car-modal__input ${
                              errors.year ? "add-car-modal__input--error" : ""
                            }`}
                            value={formData.year}
                            onChange={handleChange}
                            min="1900"
                            max={new Date().getFullYear() + 1}
                            disabled={loading || externalLoading}
                          />
                          {errors.year && (
                            <span className="add-car-modal__error">
                              {errors.year}
                            </span>
                          )}
                        </div>

                        {/* Госномер */}
                        <div className="add-car-modal__form-group">
                          <label className="add-car-modal__label">
                            <i className="fas fa-id-card"></i>
                            Госномер
                          </label>
                          <input
                            type="text"
                            name="number"
                            className="add-car-modal__input"
                            value={formData.number}
                            onChange={handleChange}
                            placeholder="А123БВ777"
                            disabled={loading || externalLoading}
                          />
                        </div>
                      </div>
                    </motion.div>
                  )}

                  {/* Шаг 2: Технические характеристики */}
                  {currentStep === 2 && (
                    <motion.div
                      key="step2"
                      className="add-car-modal__step-content"
                      variants={stepVariants}
                      initial="hidden"
                      animate="visible"
                      exit="exit"
                    >
                      <div className="add-car-modal__form-grid">
                        {/* Пробег */}
                        <div className="add-car-modal__form-group">
                          <label className="add-car-modal__label">
                            <i className="fas fa-road"></i>
                            Пробег (км)
                          </label>
                          <input
                            type="number"
                            name="mileageKM"
                            className={`add-car-modal__input ${
                              errors.mileageKM
                                ? "add-car-modal__input--error"
                                : ""
                            }`}
                            value={formData.mileageKM}
                            onChange={handleChange}
                            placeholder="0"
                            min="0"
                            disabled={loading || externalLoading}
                          />
                          {errors.mileageKM && (
                            <span className="add-car-modal__error">
                              {errors.mileageKM}
                            </span>
                          )}
                        </div>

                        {/* Тип топлива */}
                        <div className="add-car-modal__form-group">
                          <label className="add-car-modal__label">
                            <i className="fas fa-gas-pump"></i>
                            Тип топлива
                          </label>
                          <select
                            name="fuelType"
                            className="add-car-modal__select"
                            value={formData.fuelType}
                            onChange={handleChange}
                            disabled={loading || externalLoading}
                          >
                            {fuelTypes.map((type) => (
                              <option key={type.value} value={type.value}>
                                {type.label}
                              </option>
                            ))}
                          </select>
                        </div>

                        {/* Расход */}
                        <div className="add-car-modal__form-group">
                          <label className="add-car-modal__label">
                            <i className="fas fa-tachometer-alt"></i>
                            Расход (л/100км)
                          </label>
                          <input
                            type="number"
                            name="consumption"
                            step="0.1"
                            className={`add-car-modal__input ${
                              errors.consumption
                                ? "add-car-modal__input--error"
                                : ""
                            }`}
                            value={formData.consumption}
                            onChange={handleChange}
                            placeholder="8.5"
                            disabled={loading || externalLoading}
                          />
                          {errors.consumption && (
                            <span className="add-car-modal__error">
                              {errors.consumption}
                            </span>
                          )}
                        </div>

                        {/* Цвет */}
                        <div className="add-car-modal__form-group">
                          <label className="add-car-modal__label">
                            <i className="fas fa-palette"></i>
                            Цвет
                          </label>
                          <div className="add-car-modal__color-picker">
                            <input
                              type="color"
                              name="color"
                              value={formData.color}
                              onChange={handleChange}
                              disabled={loading || externalLoading}
                            />
                            <span>{formData.color}</span>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )}

                  {/* Шаг 3: Обслуживание */}
                  {currentStep === 3 && (
                    <motion.div
                      key="step3"
                      className="add-car-modal__step-content"
                      variants={stepVariants}
                      initial="hidden"
                      animate="visible"
                      exit="exit"
                    >
                      <div className="add-car-modal__form-grid">
                        {/* Интервал ТО */}
                        <div className="add-car-modal__form-group">
                          <label className="add-car-modal__label">
                            <i className="fas fa-tools"></i>
                            Интервал ТО (км)
                          </label>
                          <input
                            type="number"
                            name="maintanceDistance"
                            className={`add-car-modal__input ${
                              errors.maintanceDistance
                                ? "add-car-modal__input--error"
                                : ""
                            }`}
                            value={formData.maintanceDistance}
                            onChange={handleChange}
                            placeholder="10000"
                            min="0"
                            disabled={loading || externalLoading}
                          />
                          {errors.maintanceDistance && (
                            <span className="add-car-modal__error">
                              {errors.maintanceDistance}
                            </span>
                          )}
                        </div>

                        {/* Пробег после ТО */}
                        <div className="add-car-modal__form-group">
                          <label className="add-car-modal__label">
                            <i className="fas fa-history"></i>
                            Пробег после последнего ТО (км)
                          </label>
                          <input
                            type="number"
                            name="distanceCovered"
                            className={`add-car-modal__input ${
                              errors.distanceCovered
                                ? "add-car-modal__input--error"
                                : ""
                            }`}
                            value={formData.distanceCovered}
                            onChange={handleChange}
                            placeholder="0"
                            min="0"
                            disabled={loading || externalLoading}
                          />
                          {errors.distanceCovered && (
                            <span className="add-car-modal__error">
                              {errors.distanceCovered}
                            </span>
                          )}
                        </div>

                        {/* Дата последнего ТО */}
                        <div className="add-car-modal__form-group">
                          <label className="add-car-modal__label">
                            <i className="fas fa-calendar-alt"></i>
                            Дата последнего ТО
                          </label>
                          <input
                            type="date"
                            name="lastService"
                            className="add-car-modal__input"
                            value={formData.lastService}
                            onChange={handleChange}
                            disabled={loading || externalLoading}
                          />
                        </div>
                      </div>

                      {/* Предпросмотр информации */}
                      <div className="add-car-modal__preview">
                        <h4 className="add-car-modal__preview-title">
                          <i className="fas fa-eye"></i>
                          Предпросмотр
                        </h4>
                        <div className="add-car-modal__preview-content">
                          <div className="add-car-modal__preview-item">
                            <span className="add-car-modal__preview-label">
                              Автомобиль:
                            </span>
                            <span className="add-car-modal__preview-value">
                              {formData.mark || "?"} {formData.model || "?"},{" "}
                              {formData.year || "?"}
                            </span>
                          </div>
                          {formData.number && (
                            <div className="add-car-modal__preview-item">
                              <span className="add-car-modal__preview-label">
                                Госномер:
                              </span>
                              <span className="add-car-modal__preview-value">
                                {formData.number}
                              </span>
                            </div>
                          )}
                          {formData.mileageKM && (
                            <div className="add-car-modal__preview-item">
                              <span className="add-car-modal__preview-label">
                                Пробег:
                              </span>
                              <span className="add-car-modal__preview-value">
                                {formData.mileageKM} км
                              </span>
                            </div>
                          )}
                          {formData.consumption && (
                            <div className="add-car-modal__preview-item">
                              <span className="add-car-modal__preview-label">
                                Расход:
                              </span>
                              <span className="add-car-modal__preview-value">
                                {formData.consumption} л/100км
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              <div className="add-car-modal__footer">
                {currentStep > 1 && (
                  <button
                    type="button"
                    className="add-car-modal__btn add-car-modal__btn--secondary"
                    onClick={handlePrevStep}
                    disabled={loading || externalLoading}
                  >
                    <i className="fas fa-arrow-left"></i>
                    Назад
                  </button>
                )}

                {currentStep < 3 ? (
                  <button
                    type="button"
                    className="add-car-modal__btn add-car-modal__btn--primary"
                    onClick={handleNextStep}
                    disabled={loading || externalLoading}
                  >
                    Далее
                    <i className="fas fa-arrow-right"></i>
                  </button>
                ) : (
                  <button
                    type="submit"
                    className="add-car-modal__btn add-car-modal__btn--success"
                    disabled={loading || externalLoading}
                  >
                    {loading || externalLoading ? (
                      <>
                        <i className="fas fa-spinner fa-spin"></i>
                        Добавление...
                      </>
                    ) : (
                      <>
                        <i className="fas fa-plus-circle"></i>
                        Добавить автомобиль
                      </>
                    )}
                  </button>
                )}
              </div>
            </form>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default AddCarModal;
