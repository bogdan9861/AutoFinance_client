import React, { useState, useMemo, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import "../../pages/Cars/Cars.css";
import { editCars, getCars, updateCar } from "../../app/api/endpoints/cars";
import { Spin, message } from "antd";

const EditCarModal = ({
  open,
  onClose,
  editingCar,
  editForm,
  setEditForm,
  setCars,
  fuelTypes,
  editErrors,
  setEditErrors,
}) => {
  const [submitting, setSubmitting] = useState(false);

  const validateEditForm = () => {
    const newErrors = {};

    if (!editForm.mark.trim()) {
      newErrors.mark = "Введите марку автомобиля";
    }

    if (!editForm.model.trim()) {
      newErrors.model = "Введите модель автомобиля";
    }

    if (!editForm.year) {
      newErrors.year = "Введите год выпуска";
    } else if (
      editForm.year < 1900 ||
      editForm.year > new Date().getFullYear() + 1
    ) {
      newErrors.year = "Введите корректный год";
    }

    if (
      editForm.mileageKM &&
      (isNaN(editForm.mileageKM) || editForm.mileageKM < 0)
    ) {
      newErrors.mileageKM = "Введите корректный пробег";
    }

    if (
      editForm.consumption &&
      (isNaN(editForm.consumption) || editForm.consumption <= 0)
    ) {
      newErrors.consumption = "Введите корректный расход";
    }

    if (
      editForm.maintanceDistance &&
      (isNaN(editForm.maintanceDistance) || editForm.maintanceDistance <= 0)
    ) {
      newErrors.maintanceDistance = "Введите корректный интервал ТО";
    }

    if (
      editForm.distanceCovered &&
      (isNaN(editForm.distanceCovered) || editForm.distanceCovered < 0)
    ) {
      newErrors.distanceCovered = "Введите корректный пробег после ТО";
    }

    return newErrors;
  };

  const handleEditChange = (e) => {
    const { name, value, type, files } = e.target;

    if (type === "file" && files[0]) {
      const file = files[0];
      const reader = new FileReader();
      reader.onloadend = () => {
        setEditForm((prev) => ({
          ...prev,
          image: file,
          imagePreview: reader.result,
        }));
      };
      reader.readAsDataURL(file);
    } else {
      setEditForm((prev) => ({ ...prev, [name]: value }));
    }

    // Очищаем ошибку для этого поля
    if (editErrors[name]) {
      setEditErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const handleSubmitEdit = async (e) => {
    e.preventDefault();
    const newErrors = validateEditForm();

    if (Object.keys(newErrors).length === 0) {
      setSubmitting(true);

      try {
        const formDataToSend = new FormData();
        formDataToSend.append("mark", editForm.mark);
        formDataToSend.append("model", editForm.model);
        formDataToSend.append("year", editForm.year);
        formDataToSend.append("number", editForm.number);
        formDataToSend.append("mileageKM", editForm.mileageKM);
        formDataToSend.append("fuelType", editForm.fuelType);
        formDataToSend.append("consumption", editForm.consumption);
        formDataToSend.append("color", editForm.color);
        formDataToSend.append("maintanceDistance", editForm.maintanceDistance);
        formDataToSend.append("distanceCovered", editForm.distanceCovered);
        formDataToSend.append("lastService", editForm.lastService);

        console.log("editForm.image", editForm.image);

        if (editForm.image) {
          formDataToSend.append("image", editForm.image);
        }

        const response = await editCars(editingCar.id, formDataToSend);

        // Обновляем список автомобилей
        setCars((prev) =>
          prev.map((car) =>
            car.id === editingCar.id ? { ...car, ...response.data } : car
          )
        );

        message.success("Автомобиль успешно обновлен");
        onClose();
      } catch (error) {
        message.error("Ошибка при обновлении автомобиля");
      } finally {
        setSubmitting(false);
      }
    } else {
      setEditErrors(newErrors);
    }
  };

  return (
    <AnimatePresence>
      {open && editingCar && (
        <>
          <div className="cars-page__modal-overlay" onClick={onClose} />
          <motion.div
            className="cars-page__edit-modal"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
          >
            <div className="cars-page__modal-header">
              <h2 className="cars-page__modal-title">
                <i className="fas fa-edit cars-page__modal-title-icon"></i>
                Редактирование автомобиля
              </h2>
              <button className="cars-page__modal-close" onClick={onClose}>
                <i className="fas fa-times"></i>
              </button>
            </div>

            <form onSubmit={handleSubmitEdit} className="cars-page__edit-form">
              <div className="cars-page__edit-form-scroll">
                {/* Загрузка изображения */}
                <div className="cars-page__form-group cars-page__form-group--avatar">
                  <label className="cars-page__label">Фото автомобиля</label>
                  <div className="cars-page__avatar-upload">
                    <div className="cars-page__avatar-preview">
                      {editForm.imagePreview ? (
                        <img
                          src={editForm.imagePreview}
                          alt="Preview"
                          className="cars-page__avatar-preview-image"
                        />
                      ) : (
                        <i className="fas fa-car cars-page__avatar-preview-icon"></i>
                      )}
                    </div>
                    <div className="cars-page__avatar-actions">
                      <label className="cars-page__avatar-btn">
                        <i className="fas fa-upload"></i>
                        Загрузить фото
                        <input
                          type="file"
                          name="image"
                          accept="image/*"
                          onChange={handleEditChange}
                          className="cars-page__avatar-input"
                        />
                      </label>
                    </div>
                  </div>
                </div>

                <div className="cars-page__edit-form-grid">
                  {/* Марка */}
                  <div className="cars-page__form-group">
                    <label className="cars-page__label">
                      <i className="fas fa-tag"></i>
                      Марка *
                    </label>
                    <input
                      type="text"
                      name="mark"
                      className={`cars-page__input ${
                        editErrors.mark ? "cars-page__input--error" : ""
                      }`}
                      value={editForm.mark}
                      onChange={handleEditChange}
                      placeholder="Например: Toyota"
                    />
                    {editErrors.mark && (
                      <span className="cars-page__error">
                        {editErrors.mark}
                      </span>
                    )}
                  </div>

                  {/* Модель */}
                  <div className="cars-page__form-group">
                    <label className="cars-page__label">
                      <i className="fas fa-car"></i>
                      Модель *
                    </label>
                    <input
                      type="text"
                      name="model"
                      className={`cars-page__input ${
                        editErrors.model ? "cars-page__input--error" : ""
                      }`}
                      value={editForm.model}
                      onChange={handleEditChange}
                      placeholder="Например: Camry"
                    />
                    {editErrors.model && (
                      <span className="cars-page__error">
                        {editErrors.model}
                      </span>
                    )}
                  </div>

                  {/* Год выпуска */}
                  <div className="cars-page__form-group">
                    <label className="cars-page__label">
                      <i className="fas fa-calendar"></i>
                      Год выпуска *
                    </label>
                    <input
                      type="number"
                      name="year"
                      className={`cars-page__input ${
                        editErrors.year ? "cars-page__input--error" : ""
                      }`}
                      value={editForm.year}
                      onChange={handleEditChange}
                      min="1900"
                      max={new Date().getFullYear() + 1}
                    />
                    {editErrors.year && (
                      <span className="cars-page__error">
                        {editErrors.year}
                      </span>
                    )}
                  </div>

                  {/* Госномер */}
                  <div className="cars-page__form-group">
                    <label className="cars-page__label">
                      <i className="fas fa-id-card"></i>
                      Госномер
                    </label>
                    <input
                      type="text"
                      name="number"
                      className="cars-page__input"
                      value={editForm.number}
                      onChange={handleEditChange}
                      placeholder="А123БВ777"
                    />
                  </div>

                  {/* Пробег */}
                  <div className="cars-page__form-group">
                    <label className="cars-page__label">
                      <i className="fas fa-road"></i>
                      Пробег (км)
                    </label>
                    <input
                      type="number"
                      name="mileageKM"
                      className={`cars-page__input ${
                        editErrors.mileageKM ? "cars-page__input--error" : ""
                      }`}
                      value={editForm.mileageKM}
                      onChange={handleEditChange}
                      placeholder="0"
                      min="0"
                    />
                    {editErrors.mileageKM && (
                      <span className="cars-page__error">
                        {editErrors.mileageKM}
                      </span>
                    )}
                  </div>

                  {/* Тип топлива */}
                  <div className="cars-page__form-group">
                    <label className="cars-page__label">
                      <i className="fas fa-gas-pump"></i>
                      Тип топлива
                    </label>
                    <select
                      name="fuelType"
                      className="cars-page__select"
                      value={editForm.fuelType}
                      onChange={handleEditChange}
                    >
                      {fuelTypes
                        .filter((t) => t.value !== "all")
                        .map((type) => (
                          <option key={type.value} value={type.value}>
                            {type.label}
                          </option>
                        ))}
                    </select>
                  </div>

                  {/* Расход */}
                  <div className="cars-page__form-group">
                    <label className="cars-page__label">
                      <i className="fas fa-tachometer-alt"></i>
                      Расход (л/100км)
                    </label>
                    <input
                      type="number"
                      name="consumption"
                      step="0.1"
                      className={`cars-page__input ${
                        editErrors.consumption ? "cars-page__input--error" : ""
                      }`}
                      value={editForm.consumption}
                      onChange={handleEditChange}
                      placeholder="8.5"
                    />
                    {editErrors.consumption && (
                      <span className="cars-page__error">
                        {editErrors.consumption}
                      </span>
                    )}
                  </div>

                  {/* Цвет */}
                  <div className="cars-page__form-group">
                    <label className="cars-page__label">
                      <i className="fas fa-palette"></i>
                      Цвет
                    </label>
                    <div className="cars-page__color-picker">
                      <input
                        type="color"
                        name="color"
                        value={editForm.color}
                        onChange={handleEditChange}
                      />
                      <span>{editForm.color}</span>
                    </div>
                  </div>

                  {/* Интервал ТО */}
                  <div className="cars-page__form-group">
                    <label className="cars-page__label">
                      <i className="fas fa-tools"></i>
                      Интервал ТО (км)
                    </label>
                    <input
                      type="number"
                      name="maintanceDistance"
                      className={`cars-page__input ${
                        editErrors.maintanceDistance
                          ? "cars-page__input--error"
                          : ""
                      }`}
                      value={editForm.maintanceDistance}
                      onChange={handleEditChange}
                      placeholder="10000"
                    />
                    {editErrors.maintanceDistance && (
                      <span className="cars-page__error">
                        {editErrors.maintanceDistance}
                      </span>
                    )}
                  </div>

                  {/* Пробег после ТО */}
                  <div className="cars-page__form-group">
                    <label className="cars-page__label">
                      <i className="fas fa-history"></i>
                      Пробег после ТО (км)
                    </label>
                    <input
                      type="number"
                      name="distanceCovered"
                      className={`cars-page__input ${
                        editErrors.distanceCovered
                          ? "cars-page__input--error"
                          : ""
                      }`}
                      value={editForm.distanceCovered}
                      onChange={handleEditChange}
                      placeholder="0"
                    />
                    {editErrors.distanceCovered && (
                      <span className="cars-page__error">
                        {editErrors.distanceCovered}
                      </span>
                    )}
                  </div>

                  {/* Дата последнего ТО */}
                  <div className="cars-page__form-group">
                    <label className="cars-page__label">
                      <i className="fas fa-calendar-alt"></i>
                      Дата последнего ТО
                    </label>
                    <input
                      type="date"
                      name="lastService"
                      className="cars-page__input"
                      value={editForm.lastService}
                      onChange={handleEditChange}
                    />
                  </div>
                </div>
              </div>

              <div className="cars-page__modal-footer">
                <button
                  type="button"
                  className="cars-page__modal-btn cars-page__modal-btn--close"
                  onClick={onClose}
                >
                  Отмена
                </button>
                <button
                  type="submit"
                  className="cars-page__modal-btn cars-page__modal-btn--save"
                  disabled={submitting}
                >
                  {submitting ? (
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
                </button>
              </div>
            </form>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default EditCarModal;
