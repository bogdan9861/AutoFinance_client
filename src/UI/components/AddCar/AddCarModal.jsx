import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowRightOutlined,
  CloseOutlined,
  RightOutlined,
} from "@ant-design/icons";

import "./AddCarModal.css";

const AddCarModal = ({ isOpen, onClose, onAddCar }) => {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    name: "",
    brand: "",
    model: "",
    year: new Date().getFullYear(),
    mileage: "",
    fuelType: "petrol",
    fuelConsumption: "",
    licensePlate: "",
    vin: "",
    purchaseDate: "",
    purchasePrice: "",
    color: "#3b82f6",
    notes: "",
    image: null,
    imagePreview: null,
  });

  const [errors, setErrors] = useState({});

  // Варианты анимации для модального окна
  const modalVariants = {
    hidden: {
      opacity: 0,
      scale: 0.8,
      y: 50,
      transition: { duration: 0.3 },
    },
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
      y: 30,
      transition: { duration: 0.2 },
    },
  };

  // Анимация для затемнения фона
  const overlayVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { duration: 0.3 } },
    exit: { opacity: 0, transition: { duration: 0.2 } },
  };

  // Анимация для контента с пошаговой задержкой
  const contentVariants = {
    hidden: { opacity: 0, x: step === 1 ? -20 : 20 },
    visible: {
      opacity: 1,
      x: 0,
      transition: {
        type: "spring",
        damping: 20,
        stiffness: 200,
        delay: 0.1,
      },
    },
    exit: {
      opacity: 0,
      x: step === 1 ? 20 : -20,
      transition: { duration: 0.2 },
    },
  };

  // Валидация формы
  const validateForm = () => {
    const newErrors = {};

    if (step === 1) {
      if (!formData.brand) newErrors.brand = "Укажите марку";
      if (!formData.model) newErrors.model = "Укажите модель";
      if (!formData.year) newErrors.year = "Укажите год выпуска";
      if (
        formData.year < 1900 ||
        formData.year > new Date().getFullYear() + 1
      ) {
        newErrors.year = "Некорректный год";
      }
    }

    if (step === 2) {
      if (!formData.fuelType) newErrors.fuelType = "Выберите тип топлива";
      if (!formData.fuelConsumption) {
        newErrors.fuelConsumption = "Укажите расход";
      } else if (
        isNaN(formData.fuelConsumption) ||
        formData.fuelConsumption <= 0
      ) {
        newErrors.fuelConsumption = "Введите корректное число";
      }
    }

    return newErrors;
  };

  const handleInputChange = (e) => {
    const { name, value, type, files } = e.target;

    if (type === "file" && files[0]) {
      const file = files[0];
      const reader = new FileReader();

      reader.onloadend = () => {
        setFormData((prev) => ({
          ...prev,
          image: file,
          imagePreview: reader.result,
        }));
      };

      reader.readAsDataURL(file);
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
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

  const handleNextStep = () => {
    const newErrors = validateForm();

    if (Object.keys(newErrors).length === 0) {
      setStep(2);
    } else {
      setErrors(newErrors);
    }
  };

  const handlePrevStep = () => {
    setStep(1);
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const newErrors = validateForm();

    if (Object.keys(newErrors).length === 0) {
      onAddCar(formData);
      onClose();
      resetForm();
    } else {
      setErrors(newErrors);
    }
  };

  const resetForm = () => {
    setFormData({
      name: "",
      brand: "",
      model: "",
      year: new Date().getFullYear(),
      mileage: "",
      fuelType: "petrol",
      fuelConsumption: "",
      licensePlate: "",
      vin: "",
      purchaseDate: "",
      purchasePrice: "",
      color: "#3b82f6",
      notes: "",
      image: null,
      imagePreview: null,
    });
    setStep(1);
    setErrors({});
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  // Типы топлива для выбора
  const fuelTypes = [
    { value: "petrol", label: "Бензин", icon: "fa-gas-pump" },
    { value: "diesel", label: "Дизель", icon: "fa-oil-can" },
    { value: "electric", label: "Электро", icon: "fa-charging-station" },
    { value: "hybrid", label: "Гибрид", icon: "fa-leaf" },
    { value: "gas", label: "Газ", icon: "fa-fire" },
  ];

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Затемнение фона */}
          <motion.div
            className="modal-overlay"
            variants={overlayVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            onClick={handleClose}
          />

          {/* Модальное окно */}
          <motion.div
            className="modal-container"
            variants={modalVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
          >
            <div className="modal-header">
              <motion.h2
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                <i className="fas fa-plus-circle"></i>
                Добавить автомобиль
              </motion.h2>
              <motion.button
                className="close-btn"
                onClick={handleClose}
                whileHover={{ scale: 1.1, rotate: 90 }}
                whileTap={{ scale: 0.9 }}
              >
                <CloseOutlined />
              </motion.button>
            </div>

            {/* Прогресс шагов */}
            <div className="steps-progress">
              <motion.div
                className="steps-indicator"
                initial={{ width: 0 }}
                animate={{ width: step === 1 ? "50%" : "100%" }}
                transition={{ duration: 0.3 }}
              />
              <div className="steps">
                <motion.div
                  className={`step ${step >= 1 ? "active" : ""}`}
                  animate={
                    step >= 1 ? { scale: 1.1, color: "#ffd966" } : { scale: 1 }
                  }
                >
                  <i className="fas fa-car"></i>
                  <span>Основное</span>
                </motion.div>
                <motion.div
                  className={`step ${step >= 2 ? "active" : ""}`}
                  animate={
                    step >= 2 ? { scale: 1.1, color: "#ffd966" } : { scale: 1 }
                  }
                >
                  <i className="fas fa-cog"></i>
                  <span>Техническое</span>
                </motion.div>
              </div>
            </div>

            <AnimatePresence mode="wait">
              <motion.form
                key={step}
                variants={contentVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
                onSubmit={handleSubmit}
                className="modal-form"
              >
                {step === 1 && (
                  <div className="form-step">
                    {/* Загрузка изображения */}
                    <motion.div
                      className="image-upload"
                      initial={{ scale: 0.9, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ delay: 0.2 }}
                    >
                      <label htmlFor="car-image" className="image-label">
                        {formData.imagePreview ? (
                          <motion.img
                            src={formData.imagePreview}
                            alt="Preview"
                            initial={{ scale: 0.8, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            transition={{ type: "spring" }}
                          />
                        ) : (
                          <motion.div
                            className="image-placeholder"
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                          >
                            <i className="fas fa-cloud-upload-alt"></i>
                            <span>Загрузить фото</span>
                          </motion.div>
                        )}
                      </label>
                      <input
                        type="file"
                        id="car-image"
                        name="image"
                        accept="image/*"
                        onChange={handleInputChange}
                        style={{ display: "none" }}
                      />
                    </motion.div>

                    {/* Поля формы */}
                    <div className="form-grid">
                      <motion.div
                        className="form-group"
                        initial={{ x: -20, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        transition={{ delay: 0.3 }}
                      >
                        <label>
                          <i className="fas fa-tag"></i>
                          Марка *
                        </label>
                        <input
                          type="text"
                          name="brand"
                          value={formData.brand}
                          onChange={handleInputChange}
                          placeholder="Например: Toyota"
                          className={errors.brand ? "error" : ""}
                        />
                        {errors.brand && (
                          <motion.span
                            className="error-message"
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                          >
                            {errors.brand}
                          </motion.span>
                        )}
                      </motion.div>

                      <motion.div
                        className="form-group"
                        initial={{ x: -20, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        transition={{ delay: 0.35 }}
                      >
                        <label>
                          <i className="fas fa-car"></i>
                          Модель *
                        </label>
                        <input
                          type="text"
                          name="model"
                          value={formData.model}
                          onChange={handleInputChange}
                          placeholder="Например: Camry"
                          className={errors.model ? "error" : ""}
                        />
                        {errors.model && (
                          <motion.span className="error-message">
                            {errors.model}
                          </motion.span>
                        )}
                      </motion.div>

                      <motion.div
                        className="form-group"
                        initial={{ x: -20, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        transition={{ delay: 0.4 }}
                      >
                        <label>
                          <i className="fas fa-calendar"></i>
                          Год выпуска *
                        </label>
                        <input
                          type="number"
                          name="year"
                          value={formData.year}
                          onChange={handleInputChange}
                          min="1900"
                          max={new Date().getFullYear() + 1}
                          className={errors.year ? "error" : ""}
                        />
                        {errors.year && (
                          <motion.span className="error-message">
                            {errors.year}
                          </motion.span>
                        )}
                      </motion.div>

                      <motion.div
                        className="form-group"
                        initial={{ x: -20, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        transition={{ delay: 0.45 }}
                      >
                        <label>
                          <i className="fas fa-road"></i>
                          Пробег (км)
                        </label>
                        <input
                          type="number"
                          name="mileage"
                          value={formData.mileage}
                          onChange={handleInputChange}
                          placeholder="0"
                        />
                      </motion.div>

                      <motion.div
                        className="form-group full-width"
                        initial={{ x: -20, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        transition={{ delay: 0.5 }}
                      >
                        <label>
                          <i className="fas fa-id-card"></i>
                          Госномер
                        </label>
                        <input
                          type="text"
                          name="licensePlate"
                          value={formData.licensePlate}
                          onChange={handleInputChange}
                          placeholder="А123БВ777"
                        />
                      </motion.div>

                      <motion.div
                        className="form-group full-width"
                        initial={{ x: -20, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        transition={{ delay: 0.55 }}
                      >
                        <label>
                          <i className="fas fa-barcode"></i>
                          VIN номер
                        </label>
                        <input
                          type="text"
                          name="vin"
                          value={formData.vin}
                          onChange={handleInputChange}
                          placeholder="17 символов"
                          maxLength="17"
                        />
                      </motion.div>
                    </div>
                  </div>
                )}

                {step === 2 && (
                  <div className="form-step">
                    <div className="form-grid">
                      <motion.div
                        className="form-group"
                        initial={{ x: 20, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        transition={{ delay: 0.2 }}
                      >
                        <label>
                          <i className="fas fa-gas-pump"></i>
                          Тип топлива *
                        </label>
                        <select
                          name="fuelType"
                          value={formData.fuelType}
                          onChange={handleInputChange}
                          className={errors.fuelType ? "error" : ""}
                        >
                          {fuelTypes.map((type) => (
                            <option key={type.value} value={type.value}>
                              {type.label}
                            </option>
                          ))}
                        </select>
                        {errors.fuelType && (
                          <motion.span className="error-message">
                            {errors.fuelType}
                          </motion.span>
                        )}
                      </motion.div>

                      <motion.div
                        className="form-group"
                        initial={{ x: 20, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        transition={{ delay: 0.25 }}
                      >
                        <label>
                          <i className="fas fa-tachometer-alt"></i>
                          Расход (л/100км) *
                        </label>
                        <input
                          type="number"
                          name="fuelConsumption"
                          value={formData.fuelConsumption}
                          onChange={handleInputChange}
                          step="0.1"
                          placeholder="8.5"
                          className={errors.fuelConsumption ? "error" : ""}
                        />
                        {errors.fuelConsumption && (
                          <motion.span className="error-message">
                            {errors.fuelConsumption}
                          </motion.span>
                        )}
                      </motion.div>

                      <motion.div
                        className="form-group"
                        initial={{ x: 20, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        transition={{ delay: 0.3 }}
                      >
                        <label>
                          <i className="fas fa-palette"></i>
                          Цвет
                        </label>
                        <div className="color-picker">
                          <input
                            type="color"
                            name="color"
                            value={formData.color}
                            onChange={handleInputChange}
                          />
                          <span>{formData.color}</span>
                        </div>
                      </motion.div>

                      <motion.div
                        className="form-group"
                        initial={{ x: 20, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        transition={{ delay: 0.35 }}
                      >
                        <label>
                          <i className="fas fa-calendar-alt"></i>
                          Дата покупки
                        </label>
                        <input
                          type="date"
                          name="purchaseDate"
                          value={formData.purchaseDate}
                          onChange={handleInputChange}
                        />
                      </motion.div>

                      <motion.div
                        className="form-group"
                        initial={{ x: 20, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        transition={{ delay: 0.4 }}
                      >
                        <label>
                          <i className="fas fa-money-bill"></i>
                          Цена покупки (₽)
                        </label>
                        <input
                          type="number"
                          name="purchasePrice"
                          value={formData.purchasePrice}
                          onChange={handleInputChange}
                          placeholder="1 500 000"
                        />
                      </motion.div>

                      <motion.div
                        className="form-group full-width"
                        initial={{ x: 20, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        transition={{ delay: 0.45 }}
                      >
                        <label>
                          <i className="fas fa-sticky-note"></i>
                          Заметки
                        </label>
                        <textarea
                          name="notes"
                          value={formData.notes}
                          onChange={handleInputChange}
                          rows="3"
                          placeholder="Дополнительная информация..."
                        />
                      </motion.div>
                    </div>
                  </div>
                )}

                <div className="modal-actions">
                  {step === 2 && (
                    <motion.button
                      type="button"
                      className="btn-secondary"
                      onClick={handlePrevStep}
                      whileHover={{ scale: 1.05, x: -5 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <i className="fas fa-arrow-left"></i>
                      Назад
                    </motion.button>
                  )}

                  {step === 1 ? (
                    <motion.button
                      type="button"
                      className="btn-primary"
                      onClick={handleNextStep}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      Далее
                      <RightOutlined />
                    </motion.button>
                  ) : (
                    <motion.button
                      type="submit"
                      className="btn-primary"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <i className="fas fa-check"></i>
                      Добавить авто
                    </motion.button>
                  )}
                </div>
              </motion.form>
            </AnimatePresence>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default AddCarModal;
