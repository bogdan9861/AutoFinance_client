import React, { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import "./Cars.css";
import SideBar from "../../UI/components/SideBar/SideBar";
import {
  CarOutlined,
  ClockCircleOutlined,
  CloseCircleOutlined,
  DeleteOutlined,
  EditOutlined,
  GroupOutlined,
  RocketOutlined,
  SearchOutlined,
  TableOutlined,
  ToolOutlined,
  UnorderedListOutlined,
} from "@ant-design/icons";

const CarsPage = ({ cars: initialCars, onEditCar, onDeleteCar }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterBrand, setFilterBrand] = useState("all");
  const [filterFuel, setFilterFuel] = useState("all");
  const [sortBy, setSortBy] = useState("name");
  const [viewMode, setViewMode] = useState("grid");
  const [selectedCar, setSelectedCar] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // Пример данных
  const defaultCars = [
    {
      id: 1,
      name: "Porsche Cayenne",
      brand: "Porsche",
      model: "Cayenne",
      year: 2021,
      mileage: 78400,
      fuelType: "petrol",
      fuelConsumption: 14.2,
      licensePlate: "А777АА777",
      color: "#3b82f6",
      url: "https://e-n-cars.ru/wp-content/uploads/2024/10/porsche-cayenne-s-e1729874775649.webp",
      nextService: 1700,
      lastService: "2025-12-10",
      purchaseDate: "2021-03-15",
      purchasePrice: 8500000,
      status: "active",
    },
    {
      id: 2,
      name: "Toyota Hilux",
      brand: "Toyota",
      model: "Hilux",
      year: 2020,
      mileage: 112400,
      fuelType: "diesel",
      fuelConsumption: 11.8,
      licensePlate: "В123ВВ178",
      color: "#22c55e",
      url: "https://www.masmotors.ru/resources/models/97/colors/color/5_600x310.webp",
      nextService: 4200,
      lastService: "2026-01-20",
      purchaseDate: "2020-08-10",
      purchasePrice: 4200000,
      status: "active",
    },
    {
      id: 3,
      name: "Tesla Model 3",
      brand: "Tesla",
      model: "Model 3",
      year: 2023,
      mileage: 34200,
      fuelType: "electric",
      fuelConsumption: 16,
      licensePlate: "Е999ЕЕ799",
      color: "#ef4444",
      url: "https://e-n-cars.ru/images/products/69496a12f34ea_tesla-model-3_1.png",
      nextService: 9500,
      lastService: "2026-02-01",
      purchaseDate: "2023-05-20",
      purchasePrice: 5500000,
      status: "active",
    },
  ];

  const cars = initialCars || defaultCars;

  // Получаем уникальные бренды
  const brands = useMemo(() => {
    const uniqueBrands = [...new Set(cars.map((car) => car.brand))];
    return ["all", ...uniqueBrands];
  }, [cars]);

  // Фильтрация и сортировка
  const filteredCars = useMemo(() => {
    return cars
      .filter((car) => {
        const matchesSearch =
          searchTerm === "" ||
          car.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          car.brand.toLowerCase().includes(searchTerm.toLowerCase()) ||
          car.model.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (car.licensePlate &&
            car.licensePlate.toLowerCase().includes(searchTerm.toLowerCase()));

        const matchesBrand = filterBrand === "all" || car.brand === filterBrand;
        const matchesFuel = filterFuel === "all" || car.fuelType === filterFuel;

        return matchesSearch && matchesBrand && matchesFuel;
      })
      .sort((a, b) => {
        switch (sortBy) {
          case "name":
            return a.name.localeCompare(b.name);
          case "year":
            return b.year - a.year;
          case "mileage":
            return b.mileage - a.mileage;
          case "fuelConsumption":
            return a.fuelConsumption - b.fuelConsumption;
          default:
            return 0;
        }
      });
  }, [cars, searchTerm, filterBrand, filterFuel, sortBy]);

  // Статистика
  const stats = useMemo(() => {
    const totalCars = cars.length;
    const totalMileage = cars.reduce((sum, car) => sum + car.mileage, 0);
    const avgFuel =
      cars.reduce((sum, car) => sum + car.fuelConsumption, 0) / totalCars;
    const carsNeedService = cars.filter((car) => car.nextService < 3000).length;

    return { totalCars, totalMileage, avgFuel, carsNeedService };
  }, [cars]);

  // Типы топлива
  const fuelTypes = [
    { value: "all", label: "Все типы", icon: "fa-filter" },
    { value: "petrol", label: "Бензин", icon: "fa-gas-pump" },
    { value: "diesel", label: "Дизель", icon: "fa-oil-can" },
    { value: "electric", label: "Электро", icon: "fa-charging-station" },
    { value: "hybrid", label: "Гибрид", icon: "fa-leaf" },
  ];

  const getFuelIcon = (fuelType) => {
    const type = fuelTypes.find((t) => t.value === fuelType);
    return type ? type.icon : "fa-gas-pump";
  };

  const formatPrice = (price) => {
    if (!price) return "—";
    return new Intl.NumberFormat("ru-RU").format(price) + " ₽";
  };

  const formatDate = (dateString) => {
    if (!dateString) return "—";
    return new Date(dateString).toLocaleDateString("ru-RU");
  };

  return (
    <motion.div
      className="app cars-page gap-30"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <SideBar />
      <div>
        {/* Шапка страницы */}
        <div className="cars-page__header" style={{ paddingTop: 20 }}>
          <motion.h1
            className="cars-page__title"
            initial={{ x: -20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
          >
            <i className="fas fa-car cars-page__title-icon"></i>
            Мои автомобили
          </motion.h1>
          <motion.div
            className="cars-page__header-actions"
            initial={{ x: 20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
          >
            <button className="cars-page__export-btn">
              <i className="fas fa-download cars-page__export-icon"></i>
              Экспорт
            </button>
          </motion.div>
        </div>

        {/* Статистика */}
        <div className="cars-page__stats">
          <div className="cars-page__stat-card">
            <div className="cars-page__stat-icon">
              <CarOutlined />
            </div>
            <div className="cars-page__stat-info">
              <span className="cars-page__stat-label">Всего авто</span>
              <span className="cars-page__stat-value">{stats.totalCars}</span>
            </div>
          </div>

          <div className="cars-page__stat-card">
            <div className="cars-page__stat-icon">
              <ClockCircleOutlined />
            </div>
            <div className="cars-page__stat-info">
              <span className="cars-page__stat-label">Общий пробег</span>
              <span className="cars-page__stat-value">
                {(stats.totalMileage / 1000).toFixed(1)}K км
              </span>
            </div>
          </div>

          <div className="cars-page__stat-card">
            <div className="cars-page__stat-icon">
              <RocketOutlined />
            </div>
            <div className="cars-page__stat-info">
              <span className="cars-page__stat-label">Ср. расход</span>
              <span className="cars-page__stat-value">
                {stats.avgFuel.toFixed(1)} л/100км
              </span>
            </div>
          </div>

          <div className="cars-page__stat-card cars-page__stat-card--warning">
            <div className="cars-page__stat-icon cars-page__stat-icon--warning">
              <ToolOutlined />
            </div>
            <div className="cars-page__stat-info">
              <span className="cars-page__stat-label">Требуют ТО</span>
              <span className="cars-page__stat-value">
                {stats.carsNeedService}
              </span>
            </div>
          </div>
        </div>

        {/* Фильтры */}
        <div className="cars-page__filters">
          <div className="cars-page__search">
            <SearchOutlined className="cars-page__search-icon" />
            <input
              type="text"
              className="cars-page__search-input"
              placeholder="Поиск по марке, модели или номеру..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            {searchTerm && (
              <button
                className="cars-page__search-clear"
                onClick={() => setSearchTerm("")}
              >
                <CloseCircleOutlined />
              </button>
            )}
          </div>

          <div className="cars-page__filter-group">
            <select
              className="cars-page__select"
              value={filterBrand}
              onChange={(e) => setFilterBrand(e.target.value)}
            >
              {brands.map((brand) => (
                <option key={brand} value={brand} className="cars-page__option">
                  {brand === "all" ? "Все марки" : brand}
                </option>
              ))}
            </select>

            <select
              className="cars-page__select"
              value={filterFuel}
              onChange={(e) => setFilterFuel(e.target.value)}
            >
              {fuelTypes.map((type) => (
                <option
                  key={type.value}
                  value={type.value}
                  className="cars-page__option"
                >
                  {type.label}
                </option>
              ))}
            </select>

            <select
              className="cars-page__select"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
            >
              <option value="name" className="cars-page__option">
                По названию
              </option>
              <option value="year" className="cars-page__option">
                По году (новые)
              </option>
              <option value="mileage" className="cars-page__option">
                По пробегу
              </option>
              <option value="fuelConsumption" className="cars-page__option">
                По расходу
              </option>
            </select>

            <div className="cars-page__view-toggle">
              <button
                className={`cars-page__view-btn ${
                  viewMode === "grid" ? "cars-page__view-btn--active" : ""
                }`}
                onClick={() => setViewMode("grid")}
              >
                <TableOutlined />
              </button>
              <button
                className={`cars-page__view-btn ${
                  viewMode === "list" ? "cars-page__view-btn--active" : ""
                }`}
                onClick={() => setViewMode("list")}
              >
                <UnorderedListOutlined />
              </button>
            </div>
          </div>
        </div>

        {/* Результаты поиска */}
        <div className="cars-page__results-info">
          <span>
            Найдено автомобилей: <strong>{filteredCars.length}</strong>
          </span>
          {searchTerm && (
            <button
              className="cars-page__clear-filters"
              onClick={() => {
                setSearchTerm("");
                setFilterBrand("all");
                setFilterFuel("all");
              }}
            >
              <CloseCircleOutlined />
              Сбросить фильтры
            </button>
          )}
        </div>

        {/* Сетка автомобилей */}
        <AnimatePresence mode="wait">
          {filteredCars.length === 0 ? (
            <div className="cars-page__empty">
              <i className="fas fa-car cars-page__empty-icon"></i>
              <h3 className="cars-page__empty-title">Автомобили не найдены</h3>
              <p className="cars-page__empty-text">
                Попробуйте изменить параметры поиска
              </p>
            </div>
          ) : (
            <div className={`cars-page__${viewMode}`}>
              <AnimatePresence>
                {filteredCars.map((car, index) => (
                  <motion.div
                    key={car.id}
                    className={`cars-page__card cars-page__card--${viewMode}`}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    transition={{ delay: index * 0.05 }}
                    whileHover={{ y: -5 }}
                    onClick={() => setSelectedCar(car)}
                  >
                    {viewMode === "grid" ? (
                      // Grid вид
                      <div className="cars-page__grid-content">
                        <div
                          className="cars-page__grid-image"
                          style={{ backgroundColor: car.color + "20" }}
                        >
                          {car.url ? (
                            <img
                              src={car.url}
                              alt={car.name}
                              className="cars-page__grid-img"
                            />
                          ) : (
                            <CarOutlined
                              className="cars-page__grid-icon"
                              style={{ color: car.color }}
                            />
                          )}
                          <div
                            className={`cars-page__status cars-page__status--${car.status}`}
                          >
                            {car.status === "active" ? "Активен" : "Неактивен"}
                          </div>
                        </div>

                        <div className="cars-page__grid-info">
                          <h3 className="cars-page__grid-title">{car.name}</h3>
                          <div className="cars-page__grid-subtitle">
                            {car.year} · {car.licensePlate || "Без номера"}
                          </div>

                          <div className="cars-page__grid-specs">
                            <div className="cars-page__grid-spec">
                              <i className="fas fa-road cars-page__grid-spec-icon"></i>
                              <span>{(car.mileage / 1000).toFixed(1)}K км</span>
                            </div>
                            <div className="cars-page__grid-spec">
                              <i
                                className={`fas ${getFuelIcon(
                                  car.fuelType
                                )} cars-page__grid-spec-icon`}
                              ></i>
                              <span>
                                {car.fuelConsumption}{" "}
                                {car.fuelType === "electric" ? "кВт·ч" : "л"}
                              </span>
                            </div>
                          </div>

                          <div className="cars-page__grid-service">
                            <div className="cars-page__grid-progress">
                              <div
                                className="cars-page__grid-progress-bar"
                                style={{
                                  width: `${Math.min(
                                    100,
                                    (car.nextService / 10000) * 100
                                  )}%`,
                                  background:
                                    car.nextService < 3000
                                      ? "#ff4757"
                                      : "#ffd966",
                                }}
                              ></div>
                            </div>
                            <span
                              className={`cars-page__grid-service-text ${
                                car.nextService < 3000
                                  ? "cars-page__grid-service-text--urgent"
                                  : ""
                              }`}
                            >
                              ТО через {car.nextService} км
                            </span>
                          </div>

                          <div className="cars-page__grid-actions">
                            <button
                              className="cars-page__grid-action cars-page__grid-action--edit"
                              onClick={(e) => {
                                e.stopPropagation();
                                onEditCar && onEditCar(car);
                              }}
                            >
                              <EditOutlined />
                            </button>
                            <button
                              className="cars-page__grid-action cars-page__grid-action--delete"
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedCar(car);
                                setShowDeleteConfirm(true);
                              }}
                            >
                              <DeleteOutlined />
                            </button>
                          </div>
                        </div>
                      </div>
                    ) : (
                      // List вид
                      <div className="cars-page__list-content">
                        <div
                          className="cars-page__list-image"
                          style={{ backgroundColor: car.color + "20" }}
                        >
                          {car.url ? (
                            <img
                              src={car.url}
                              alt={car.name}
                              className="cars-page__list-img"
                            />
                          ) : (
                            <i
                              className="fas fa-car-side cars-page__list-icon"
                              style={{ color: car.color }}
                            ></i>
                          )}
                        </div>

                        <div className="cars-page__list-info">
                          <div className="cars-page__list-main">
                            <h3 className="cars-page__list-title">
                              {car.name}
                            </h3>
                            <span className="cars-page__list-year">
                              {car.year}
                            </span>
                            <span className="cars-page__list-plate">
                              {car.licensePlate}
                            </span>
                          </div>

                          <div className="cars-page__list-details">
                            <span>
                              <i className="fas fa-road cars-page__list-details-icon"></i>{" "}
                              {(car.mileage / 1000).toFixed(1)}K км
                            </span>
                            <span>
                              <i
                                className={`fas ${getFuelIcon(
                                  car.fuelType
                                )} cars-page__list-details-icon`}
                              ></i>{" "}
                              {car.fuelConsumption}{" "}
                              {car.fuelType === "electric" ? "кВт·ч" : "л"}
                            </span>
                            <span>
                              <i className="fas fa-calendar cars-page__list-details-icon"></i>{" "}
                              Последнее ТО: {formatDate(car.lastService)}
                            </span>
                          </div>

                          <div className="cars-page__list-service">
                            <div className="cars-page__list-progress-text">
                              <span>
                                Следующее ТО через {car.nextService} км
                              </span>
                              <span>
                                {Math.round((10000 - car.nextService) / 100)}%
                              </span>
                            </div>
                            <div className="cars-page__list-progress-bg">
                              <div
                                className="cars-page__list-progress-fill"
                                style={{
                                  width: `${Math.min(
                                    100,
                                    ((10000 - car.nextService) / 10000) * 100
                                  )}%`,
                                  background:
                                    car.nextService < 3000
                                      ? "#ff4757"
                                      : "#ffd966",
                                }}
                              ></div>
                            </div>
                          </div>
                        </div>

                        <div className="cars-page__list-actions">
                          <button
                            className="cars-page__list-action"
                            onClick={(e) => {
                              e.stopPropagation();
                              onEditCar && onEditCar(car);
                            }}
                          >
                            <i className="fas fa-edit"></i>
                          </button>
                          <button
                            className="cars-page__list-action cars-page__list-action--delete"
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedCar(car);
                              setShowDeleteConfirm(true);
                            }}
                          >
                            <i className="fas fa-trash"></i>
                          </button>
                        </div>
                      </div>
                    )}
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}
        </AnimatePresence>

        {/* Модальное окно подтверждения удаления */}
        <AnimatePresence>
          {showDeleteConfirm && selectedCar && (
            <>
              <div
                className="cars-page__modal-overlay"
                onClick={() => setShowDeleteConfirm(false)}
              />
              <motion.div
                className="cars-page__delete-modal"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
              >
                <div className="cars-page__delete-icon">
                  <i className="fas fa-exclamation-triangle"></i>
                </div>
                <h3 className="cars-page__delete-title">Удалить автомобиль?</h3>
                <p className="cars-page__delete-text">
                  Вы уверены, что хотите удалить{" "}
                  <strong>{selectedCar.name}</strong>? Это действие нельзя
                  отменить.
                </p>
                <div className="cars-page__delete-actions">
                  <button
                    className="cars-page__delete-btn cars-page__delete-btn--cancel"
                    onClick={() => setShowDeleteConfirm(false)}
                  >
                    Отмена
                  </button>
                  <button
                    className="cars-page__delete-btn cars-page__delete-btn--confirm"
                    onClick={() => {
                      onDeleteCar && onDeleteCar(selectedCar.id);
                      setShowDeleteConfirm(false);
                    }}
                  >
                    <i className="fas fa-trash"></i>
                    Удалить
                  </button>
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>

        {/* Детальная информация */}
        <AnimatePresence>
          {selectedCar && !showDeleteConfirm && (
            <>
              <div
                className="cars-page__modal-overlay"
                onClick={() => setSelectedCar(null)}
              />
              <motion.div
                className="cars-page__detail-modal"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
              >
                <div className="cars-page__modal-header">
                  <h2 className="cars-page__modal-title">
                    <i className="fas fa-car cars-page__modal-title-icon"></i>
                    {selectedCar.name}
                  </h2>
                  <button
                    className="cars-page__modal-close"
                    onClick={() => setSelectedCar(null)}
                  >
                    <i className="fas fa-times"></i>
                  </button>
                </div>

                <div className="cars-page__modal-body">
                  <div
                    className="cars-page__detail-image"
                    style={{ backgroundColor: selectedCar.color + "20" }}
                  >
                    {selectedCar.image ? (
                      <img
                        src={selectedCar.image}
                        alt={selectedCar.name}
                        className="cars-page__detail-img"
                      />
                    ) : (
                      <i
                        className="fas fa-car-side cars-page__detail-icon"
                        style={{ color: selectedCar.color }}
                      ></i>
                    )}
                  </div>

                  <div className="cars-page__detail-grid">
                    <div className="cars-page__detail-item">
                      <span className="cars-page__detail-label">Марка</span>
                      <span className="cars-page__detail-value">
                        {selectedCar.brand}
                      </span>
                    </div>
                    <div className="cars-page__detail-item">
                      <span className="cars-page__detail-label">Модель</span>
                      <span className="cars-page__detail-value">
                        {selectedCar.model}
                      </span>
                    </div>
                    <div className="cars-page__detail-item">
                      <span className="cars-page__detail-label">
                        Год выпуска
                      </span>
                      <span className="cars-page__detail-value">
                        {selectedCar.year}
                      </span>
                    </div>
                    <div className="cars-page__detail-item">
                      <span className="cars-page__detail-label">Госномер</span>
                      <span className="cars-page__detail-value">
                        {selectedCar.licensePlate || "—"}
                      </span>
                    </div>
                    <div className="cars-page__detail-item">
                      <span className="cars-page__detail-label">Пробег</span>
                      <span className="cars-page__detail-value">
                        {selectedCar.mileage.toLocaleString()} км
                      </span>
                    </div>
                    <div className="cars-page__detail-item">
                      <span className="cars-page__detail-label">
                        Тип топлива
                      </span>
                      <span className="cars-page__detail-value">
                        {
                          fuelTypes.find(
                            (t) => t.value === selectedCar.fuelType
                          )?.label
                        }
                      </span>
                    </div>
                    <div className="cars-page__detail-item">
                      <span className="cars-page__detail-label">Расход</span>
                      <span className="cars-page__detail-value">
                        {selectedCar.fuelConsumption}{" "}
                        {selectedCar.fuelType === "electric"
                          ? "кВт·ч/100км"
                          : "л/100км"}
                      </span>
                    </div>
                    <div className="cars-page__detail-item">
                      <span className="cars-page__detail-label">Цвет</span>
                      <span className="cars-page__detail-value cars-page__detail-value--color">
                        <span
                          className="cars-page__color-dot"
                          style={{ backgroundColor: selectedCar.color }}
                        ></span>
                        {selectedCar.color}
                      </span>
                    </div>
                  </div>

                  <div className="cars-page__service-detail">
                    <h3 className="cars-page__service-detail-title">
                      Информация о обслуживании
                    </h3>
                    <div className="cars-page__service-detail-grid">
                      <div className="cars-page__service-detail-item">
                        <span className="cars-page__service-detail-label">
                          Последнее ТО
                        </span>
                        <span className="cars-page__service-detail-value">
                          {formatDate(selectedCar.lastService)}
                        </span>
                      </div>
                      <div className="cars-page__service-detail-item">
                        <span className="cars-page__service-detail-label">
                          Следующее ТО через
                        </span>
                        <span
                          className={`cars-page__service-detail-value ${
                            selectedCar.nextService < 3000
                              ? "cars-page__service-detail-value--urgent"
                              : ""
                          }`}
                        >
                          {selectedCar.nextService} км
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="cars-page__modal-footer">
                  <button
                    className="cars-page__modal-btn cars-page__modal-btn--edit"
                    onClick={() => {
                      onEditCar && onEditCar(selectedCar);
                      setSelectedCar(null);
                    }}
                  >
                    <i className="fas fa-edit"></i>
                    Редактировать
                  </button>
                  <button
                    className="cars-page__modal-btn cars-page__modal-btn--close"
                    onClick={() => setSelectedCar(null)}
                  >
                    Закрыть
                  </button>
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
};

export default CarsPage;
