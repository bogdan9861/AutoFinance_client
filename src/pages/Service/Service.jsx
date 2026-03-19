import React, { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import "./Service.css";
import SideBar from "../../UI/components/SideBar/SideBar";

const ServicePage = ({
  serviceRecords: initialRecords,
  cars,
  onAddRecord,
  onEditRecord,
  onDeleteRecord,
}) => {
  const [filterPeriod, setFilterPeriod] = useState("all");
  const [filterCar, setFilterCar] = useState("all");
  const [filterType, setFilterType] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("date-desc");
  const [viewMode, setViewMode] = useState("list");
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showCalendar, setShowCalendar] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(new Date());

  // Пример данных обслуживания
  const defaultRecords = [
    {
      id: 1,
      carId: 1,
      carName: "Porsche Cayenne",
      date: "2026-03-10",
      type: "oil_change",
      mileage: 78200,
      nextMileage: 79200,
      cost: 12500,
      serviceCenter: "Porsche Центр, МКАД",
      master: "Иванов А.А.",
      description:
        "Замена масла и масляного фильтра. Замена салонного фильтра.",
      recommendations: "Следующее ТО через 1000 км",
      parts: [
        { name: "Масло моторное 5W-30", quantity: 8, price: 1200 },
        { name: "Фильтр масляный", quantity: 1, price: 2500 },
        { name: "Фильтр салонный", quantity: 1, price: 1800 },
      ],
      documents: null,
      status: "completed",
    },
    {
      id: 2,
      carId: 1,
      carName: "Porsche Cayenne",
      date: "2026-04-15",
      type: "scheduled",
      mileage: 79000,
      nextMileage: null,
      cost: null,
      serviceCenter: "Porsche Центр",
      master: null,
      description: "Плановое ТО 90 000 км",
      recommendations: "Замена свечей, тормозной жидкости",
      parts: [],
      documents: null,
      status: "planned",
    },
    {
      id: 3,
      carId: 2,
      carName: "Toyota Hilux",
      date: "2026-03-05",
      type: "repair",
      mileage: 112200,
      nextMileage: 113200,
      cost: 8500,
      serviceCenter: "Toyota Сервис, Варшавка",
      master: "Петров В.В.",
      description: "Замена передних тормозных колодок, диагностика подвески",
      recommendations: "Через 5000 км проверить состояние задних колодок",
      parts: [
        { name: "Колодки тормозные передние", quantity: 1, price: 6500 },
        { name: "Смазка для направляющих", quantity: 1, price: 500 },
      ],
      documents: null,
      status: "completed",
    },
    {
      id: 4,
      carId: 2,
      carName: "Toyota Hilux",
      date: "2026-02-20",
      type: "diagnostic",
      mileage: 111500,
      nextMileage: null,
      cost: 3000,
      serviceCenter: "Toyota Сервис",
      master: "Сидоров Д.С.",
      description: "Диагностика ходовой части, компьютерная диагностика",
      recommendations: "Заменить сайлентблоки переднего рычага",
      parts: [],
      documents: null,
      status: "completed",
    },
    {
      id: 5,
      carId: 3,
      carName: "Tesla Model 3",
      date: "2026-03-14",
      type: "service",
      mileage: 34200,
      nextMileage: 44200,
      cost: 5600,
      serviceCenter: "Tesla Сервис, Сколково",
      master: "Алексеев М.И.",
      description:
        "Плановое ТО, проверка высоковольтной батареи, замена салонного фильтра",
      recommendations: "Следующее ТО через 10000 км",
      parts: [
        { name: "Фильтр салонный HEPA", quantity: 1, price: 4500 },
        { name: "Омывающая жидкость", quantity: 2, price: 550 },
      ],
      documents: null,
      status: "completed",
    },
    {
      id: 6,
      carId: 3,
      carName: "Tesla Model 3",
      date: "2026-04-01",
      type: "tire_change",
      mileage: 34500,
      nextMileage: null,
      cost: 6500,
      serviceCenter: "Шиномонтаж на Ленинском",
      master: "Николаев П.Р.",
      description: "Сезонная смена шин, балансировка",
      recommendations: "Хранить летнюю резину до октября",
      parts: [],
      documents: null,
      status: "planned",
    },
  ];

  const serviceRecords = initialRecords || defaultRecords;
  const carsList = cars || [
    { id: 1, name: "Porsche Cayenne", year: 2021, licensePlate: "А777АА777" },
    { id: 2, name: "Toyota Hilux", year: 2020, licensePlate: "В123ВВ178" },
    { id: 3, name: "Tesla Model 3", year: 2023, licensePlate: "Е999ЕЕ799" },
  ];

  // Типы обслуживания
  const serviceTypes = [
    { value: "all", label: "Все типы", icon: "fa-filter", color: "#95a5a6" },
    {
      value: "scheduled",
      label: "Плановое ТО",
      icon: "fa-calendar-check",
      color: "#3498db",
    },
    {
      value: "oil_change",
      label: "Замена масла",
      icon: "fa-oil-can",
      color: "#f39c12",
    },
    { value: "repair", label: "Ремонт", icon: "fa-tools", color: "#e74c3c" },
    {
      value: "diagnostic",
      label: "Диагностика",
      icon: "fa-tachometer-alt",
      color: "#9b59b6",
    },
    {
      value: "tire_change",
      label: "Шиномонтаж",
      icon: "fa-car",
      color: "#1abc9c",
    },
    {
      value: "service",
      label: "Обслуживание",
      icon: "fa-wrench",
      color: "#2ecc71",
    },
    { value: "other", label: "Другое", icon: "fa-cog", color: "#7f8c8d" },
  ];

  // Периоды для фильтрации
  const periods = [
    { value: "week", label: "Неделя" },
    { value: "month", label: "Месяц" },
    { value: "quarter", label: "Квартал" },
    { value: "year", label: "Год" },
    { value: "all", label: "Все время" },
  ];

  // Статусы
  const statuses = [
    { value: "all", label: "Все статусы" },
    { value: "completed", label: "Выполнено" },
    { value: "planned", label: "Запланировано" },
    { value: "cancelled", label: "Отменено" },
  ];

  // Получение иконки типа обслуживания
  const getTypeIcon = (typeValue) => {
    const type = serviceTypes.find((t) => t.value === typeValue);
    return type ? type.icon : "fa-wrench";
  };

  const getTypeColor = (typeValue) => {
    const type = serviceTypes.find((t) => t.value === typeValue);
    return type ? type.color : "#95a5a6";
  };

  const getTypeLabel = (typeValue) => {
    const type = serviceTypes.find((t) => t.value === typeValue);
    return type ? type.label : "Другое";
  };

  // Фильтрация записей
  const filteredRecords = useMemo(() => {
    const now = new Date();
    const periodsMap = {
      week: new Date(now.setDate(now.getDate() - 7)),
      month: new Date(now.setMonth(now.getMonth() - 1)),
      quarter: new Date(now.setMonth(now.getMonth() - 3)),
      year: new Date(now.setFullYear(now.getFullYear() - 1)),
      all: new Date(0),
    };

    const filterDate = periodsMap[filterPeriod];

    return serviceRecords
      .filter((record) => {
        const recordDate = new Date(record.date);
        const matchesPeriod =
          filterPeriod === "all" || recordDate >= filterDate;
        const matchesCar =
          filterCar === "all" || record.carId === parseInt(filterCar);
        const matchesType = filterType === "all" || record.type === filterType;

        const matchesSearch =
          searchTerm === "" ||
          record.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
          record.carName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (record.serviceCenter &&
            record.serviceCenter
              .toLowerCase()
              .includes(searchTerm.toLowerCase())) ||
          (record.master &&
            record.master.toLowerCase().includes(searchTerm.toLowerCase()));

        return matchesPeriod && matchesCar && matchesType && matchesSearch;
      })
      .sort((a, b) => {
        switch (sortBy) {
          case "date-desc":
            return new Date(b.date) - new Date(a.date);
          case "date-asc":
            return new Date(a.date) - new Date(b.date);
          case "mileage-desc":
            return b.mileage - a.mileage;
          case "mileage-asc":
            return a.mileage - b.mileage;
          case "cost-desc":
            return (b.cost || 0) - (a.cost || 0);
          case "cost-asc":
            return (a.cost || 0) - (b.cost || 0);
          default:
            return 0;
        }
      });
  }, [serviceRecords, filterPeriod, filterCar, filterType, searchTerm, sortBy]);

  // Статистика
  const stats = useMemo(() => {
    const totalCost = filteredRecords.reduce(
      (sum, record) => sum + (record.cost || 0),
      0
    );
    const completedCount = filteredRecords.filter(
      (r) => r.status === "completed"
    ).length;
    const plannedCount = filteredRecords.filter(
      (r) => r.status === "planned"
    ).length;
    const upcomingCount = filteredRecords.filter((r) => {
      if (r.status !== "planned" || !r.date) return false;
      const daysUntil = Math.ceil(
        (new Date(r.date) - new Date()) / (1000 * 60 * 60 * 24)
      );
      return daysUntil <= 7 && daysUntil >= 0;
    }).length;

    return {
      totalCost,
      completedCount,
      plannedCount,
      upcomingCount,
      total: filteredRecords.length,
    };
  }, [filteredRecords]);

  // Форматирование даты
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("ru-RU", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  const formatShortDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("ru-RU", {
      day: "numeric",
      month: "short",
    });
  };

  // Форматирование суммы
  const formatAmount = (amount) => {
    if (!amount) return "—";
    return new Intl.NumberFormat("ru-RU", {
      style: "currency",
      currency: "RUB",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  // Получение цвета статуса
  const getStatusColor = (status) => {
    switch (status) {
      case "completed":
        return "#2ecc71";
      case "planned":
        return "#3498db";
      case "cancelled":
        return "#e74c3c";
      default:
        return "#95a5a6";
    }
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case "completed":
        return "Выполнено";
      case "planned":
        return "Запланировано";
      case "cancelled":
        return "Отменено";
      default:
        return "Неизвестно";
    }
  };

  // Получение дней до события
  const getDaysUntil = (dateString) => {
    if (!dateString) return null;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const eventDate = new Date(dateString);
    eventDate.setHours(0, 0, 0, 0);
    const diffTime = eventDate - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  return (
    <motion.div
      className="app service-page gap-20"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <SideBar />
      <div style={{paddingTop: 30}}>
        {/* Шапка страницы */}
        <div className="service-page__header">
          <motion.h1
            className="service-page__title"
            initial={{ x: -20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
          >
            <i className="fas fa-wrench service-page__title-icon"></i>
            Обслуживание автомобилей
          </motion.h1>
          <motion.div
            className="service-page__header-actions"
            initial={{ x: 20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
          >
            <button
              className="service-page__calendar-btn"
              onClick={() => setShowCalendar(!showCalendar)}
            >
              <i className="fas fa-calendar"></i>
              Календарь ТО
            </button>
            <button
              className="service-page__add-btn"
              onClick={() => setShowAddModal(true)}
            >
              <i className="fas fa-plus-circle"></i>
              Записать обслуживание
            </button>
            <button className="service-page__export-btn">
              <i className="fas fa-download"></i>
              Экспорт
            </button>
          </motion.div>
        </div>

        {/* Статистика */}
        <div className="service-page__stats">
          <motion.div
            className="service-page__stat-card"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.1 }}
          >
            <div className="service-page__stat-icon service-page__stat-icon--total">
              <i className="fas fa-ruble-sign"></i>
            </div>
            <div className="service-page__stat-info">
              <span className="service-page__stat-label">Всего затрат</span>
              <span className="service-page__stat-value">
                {formatAmount(stats.totalCost)}
              </span>
            </div>
          </motion.div>

          <motion.div
            className="service-page__stat-card"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            <div className="service-page__stat-icon service-page__stat-icon--completed">
              <i className="fas fa-check"></i>
            </div>
            <div className="service-page__stat-info">
              <span className="service-page__stat-label">Выполнено</span>
              <span className="service-page__stat-value">
                {stats.completedCount}
              </span>
            </div>
          </motion.div>

          <motion.div
            className="service-page__stat-card"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            <div className="service-page__stat-icon service-page__stat-icon--planned">
              <i className="fas fa-calendar"></i>
            </div>
            <div className="service-page__stat-info">
              <span className="service-page__stat-label">Запланировано</span>
              <span className="service-page__stat-value">
                {stats.plannedCount}
              </span>
            </div>
          </motion.div>

          <motion.div
            className="service-page__stat-card"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.4 }}
          >
            <div className="service-page__stat-icon service-page__stat-icon--upcoming">
              <i className="fas fa-clock"></i>
            </div>
            <div className="service-page__stat-info">
              <span className="service-page__stat-label">Скоро ТО</span>
              <span className="service-page__stat-value">
                {stats.upcomingCount}
              </span>
            </div>
          </motion.div>
        </div>

        {/* Календарь ТО (условно) */}
        <AnimatePresence>
          {showCalendar && (
            <motion.div
              className="service-page__calendar"
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
            >
              <div className="service-page__calendar-header">
                <button
                  className="service-page__calendar-nav"
                  onClick={() =>
                    setCurrentMonth(
                      new Date(
                        currentMonth.setMonth(currentMonth.getMonth() - 1)
                      )
                    )
                  }
                >
                  <i className="fas fa-chevron-left"></i>
                </button>
                <h3>
                  {currentMonth.toLocaleDateString("ru-RU", {
                    month: "long",
                    year: "numeric",
                  })}
                </h3>
                <button
                  className="service-page__calendar-nav"
                  onClick={() =>
                    setCurrentMonth(
                      new Date(
                        currentMonth.setMonth(currentMonth.getMonth() + 1)
                      )
                    )
                  }
                >
                  <i className="fas fa-chevron-right"></i>
                </button>
              </div>
              <div className="service-page__calendar-grid">
                {["Пн", "Вт", "Ср", "Чт", "Пт", "Сб", "Вс"].map((day) => (
                  <div key={day} className="service-page__calendar-weekday">
                    {day}
                  </div>
                ))}
                {Array.from({ length: 35 }, (_, i) => {
                  const date = new Date(
                    currentMonth.getFullYear(),
                    currentMonth.getMonth(),
                    i - 2
                  );
                  const hasEvent = filteredRecords.some((r) => {
                    const recordDate = new Date(r.date);
                    return recordDate.toDateString() === date.toDateString();
                  });
                  const isToday =
                    date.toDateString() === new Date().toDateString();

                  return (
                    <div
                      key={i}
                      className={`service-page__calendar-day 
                      ${hasEvent ? "service-page__calendar-day--event" : ""}
                      ${isToday ? "service-page__calendar-day--today" : ""}`}
                    >
                      <span>{date.getDate()}</span>
                      {hasEvent && (
                        <span className="service-page__calendar-dot"></span>
                      )}
                    </div>
                  );
                })}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Фильтры */}
        <div className="service-page__filters">
          <div className="service-page__search">
            <i className="fas fa-search service-page__search-icon"></i>
            <input
              type="text"
              className="service-page__search-input"
              placeholder="Поиск по описанию, авто или сервису..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            {searchTerm && (
              <button
                className="service-page__search-clear"
                onClick={() => setSearchTerm("")}
              >
                <i className="fas fa-times"></i>
              </button>
            )}
          </div>

          <div className="service-page__filter-group">
            <select
              className="service-page__select"
              value={filterPeriod}
              onChange={(e) => setFilterPeriod(e.target.value)}
            >
              {periods.map((period) => (
                <option key={period.value} value={period.value}>
                  {period.label}
                </option>
              ))}
            </select>

            <select
              className="service-page__select"
              value={filterCar}
              onChange={(e) => setFilterCar(e.target.value)}
            >
              <option value="all">Все автомобили</option>
              {carsList.map((car) => (
                <option key={car.id} value={car.id}>
                  {car.name}
                </option>
              ))}
            </select>

            <select
              className="service-page__select"
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
            >
              {serviceTypes.map((type) => (
                <option key={type.value} value={type.value}>
                  {type.label}
                </option>
              ))}
            </select>

            <select
              className="service-page__select"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
            >
              <option value="date-desc">Сначала новые</option>
              <option value="date-asc">Сначала старые</option>
              <option value="mileage-desc">По пробегу (убыв.)</option>
              <option value="mileage-asc">По пробегу (возр.)</option>
              <option value="cost-desc">По сумме (убыв.)</option>
              <option value="cost-asc">По сумме (возр.)</option>
            </select>

            <div className="service-page__view-toggle">
              <button
                className={`service-page__view-btn ${
                  viewMode === "list" ? "service-page__view-btn--active" : ""
                }`}
                onClick={() => setViewMode("list")}
              >
                <i className="fas fa-list"></i>
              </button>
              <button
                className={`service-page__view-btn ${
                  viewMode === "grid" ? "service-page__view-btn--active" : ""
                }`}
                onClick={() => setViewMode("grid")}
              >
                <i className="fas fa-th-large"></i>
              </button>
              <button
                className={`service-page__view-btn ${
                  viewMode === "timeline"
                    ? "service-page__view-btn--active"
                    : ""
                }`}
                onClick={() => setViewMode("timeline")}
              >
                <i className="fas fa-history"></i>
              </button>
            </div>
          </div>
        </div>

        {/* Результаты поиска */}
        <div className="service-page__results-info">
          <span>
            Найдено записей: <strong>{filteredRecords.length}</strong>
          </span>
          {(searchTerm ||
            filterType !== "all" ||
            filterCar !== "all" ||
            filterPeriod !== "all") && (
            <button
              className="service-page__clear-filters"
              onClick={() => {
                setSearchTerm("");
                setFilterType("all");
                setFilterCar("all");
                setFilterPeriod("all");
              }}
            >
              <i className="fas fa-times"></i>
              Сбросить фильтры
            </button>
          )}
        </div>

        {/* Список обслуживания */}
        <AnimatePresence mode="wait">
          {filteredRecords.length === 0 ? (
            <motion.div
              className="service-page__empty"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
            >
              <i className="fas fa-wrench service-page__empty-icon"></i>
              <h3 className="service-page__empty-title">Записи не найдены</h3>
              <p className="service-page__empty-text">
                Попробуйте изменить параметры фильтрации
              </p>
              <button
                className="service-page__empty-btn"
                onClick={() => setShowAddModal(true)}
              >
                <i className="fas fa-plus-circle"></i>
                Добавить первую запись
              </button>
            </motion.div>
          ) : viewMode === "list" ? (
            <div className="service-page__list">
              {filteredRecords.map((record, index) => {
                const daysUntil =
                  record.status === "planned"
                    ? getDaysUntil(record.date)
                    : null;

                return (
                  <motion.div
                    key={record.id}
                    className="service-page__list-item"
                    initial={{ x: -20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: index * 0.05 }}
                    whileHover={{ scale: 1.01, x: 5 }}
                    onClick={() => setSelectedRecord(record)}
                  >
                    <div className="service-page__item-status">
                      <div
                        className="service-page__status-indicator"
                        style={{
                          backgroundColor: getStatusColor(record.status),
                        }}
                      />
                    </div>

                    <div className="service-page__item-type">
                      <div
                        className="service-page__type-icon"
                        style={{
                          backgroundColor: getTypeColor(record.type) + "20",
                        }}
                      >
                        <i
                          className={`fas ${getTypeIcon(record.type)}`}
                          style={{ color: getTypeColor(record.type) }}
                        ></i>
                      </div>
                    </div>

                    <div className="service-page__item-info">
                      <div className="service-page__item-header">
                        <div>
                          <span className="service-page__item-title">
                            {getTypeLabel(record.type)}
                          </span>
                          <span className="service-page__item-car">
                            <i className="fas fa-car"></i>
                            {record.carName}
                          </span>
                        </div>
                        <span className="service-page__item-cost">
                          {formatAmount(record.cost)}
                        </span>
                      </div>

                      <div className="service-page__item-description">
                        {record.description}
                      </div>

                      <div className="service-page__item-details">
                        <span className="service-page__item-detail">
                          <i className="far fa-calendar"></i>
                          {formatDate(record.date)}
                        </span>
                        <span className="service-page__item-detail">
                          <i className="fas fa-road"></i>
                          {record.mileage} км
                        </span>
                        {record.nextMileage && (
                          <span className="service-page__item-detail">
                            <i className="fas fa-chart-line"></i>
                            след. {record.nextMileage} км
                          </span>
                        )}
                        {record.serviceCenter && (
                          <span className="service-page__item-detail">
                            <i className="fas fa-map-marker-alt"></i>
                            {record.serviceCenter}
                          </span>
                        )}
                      </div>

                      {daysUntil !== null && daysUntil <= 7 && (
                        <div className="service-page__item-warning">
                          <i className="fas fa-exclamation-triangle"></i>
                          {daysUntil === 0
                            ? "Сегодня"
                            : daysUntil < 0
                            ? `Просрочено на ${Math.abs(daysUntil)} дн.`
                            : `Через ${daysUntil} дн.`}
                        </div>
                      )}
                    </div>

                    <div className="service-page__item-actions">
                      <button
                        className="service-page__item-action"
                        onClick={(e) => {
                          e.stopPropagation();
                          onEditRecord && onEditRecord(record);
                        }}
                      >
                        <i className="fas fa-edit"></i>
                      </button>
                      <button
                        className="service-page__item-action service-page__item-action--delete"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedRecord(record);
                          setShowDeleteConfirm(true);
                        }}
                      >
                        <i className="fas fa-trash"></i>
                      </button>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          ) : viewMode === "grid" ? (
            <div className="service-page__grid">
              {filteredRecords.map((record, index) => {
                const daysUntil =
                  record.status === "planned"
                    ? getDaysUntil(record.date)
                    : null;

                return (
                  <motion.div
                    key={record.id}
                    className="service-page__grid-card"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: index * 0.05 }}
                    whileHover={{ y: -5, scale: 1.02 }}
                    onClick={() => setSelectedRecord(record)}
                  >
                    <div
                      className="service-page__grid-header"
                      style={{ backgroundColor: getTypeColor(record.type) }}
                    >
                      <div className="service-page__grid-type">
                        <i className={`fas ${getTypeIcon(record.type)}`}></i>
                        <span>{getTypeLabel(record.type)}</span>
                      </div>
                      <div
                        className="service-page__grid-status"
                        style={{
                          backgroundColor: getStatusColor(record.status) + "20",
                        }}
                      >
                        {getStatusLabel(record.status)}
                      </div>
                    </div>

                    <div className="service-page__grid-content">
                      <div className="service-page__grid-car">
                        <i className="fas fa-car"></i>
                        {record.carName}
                      </div>

                      <div className="service-page__grid-description">
                        {record.description.length > 60
                          ? record.description.substring(0, 60) + "..."
                          : record.description}
                      </div>

                      <div className="service-page__grid-details">
                        <div className="service-page__grid-detail">
                          <i className="far fa-calendar"></i>
                          {formatShortDate(record.date)}
                        </div>
                        <div className="service-page__grid-detail">
                          <i className="fas fa-road"></i>
                          {record.mileage} км
                        </div>
                      </div>

                      <div className="service-page__grid-footer">
                        <span className="service-page__grid-cost">
                          {formatAmount(record.cost)}
                        </span>
                        {daysUntil !== null && daysUntil <= 7 && (
                          <span className="service-page__grid-warning">
                            <i className="fas fa-exclamation-triangle"></i>
                          </span>
                        )}
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          ) : (
            <div className="service-page__timeline">
              {filteredRecords.map((record, index) => (
                <motion.div
                  key={record.id}
                  className="service-page__timeline-item"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  onClick={() => setSelectedRecord(record)}
                >
                  <div className="service-page__timeline-dot">
                    <div
                      className="service-page__timeline-dot-inner"
                      style={{ backgroundColor: getTypeColor(record.type) }}
                    />
                  </div>

                  <div className="service-page__timeline-content">
                    <div className="service-page__timeline-header">
                      <span className="service-page__timeline-date">
                        {formatDate(record.date)}
                      </span>
                      <span className="service-page__timeline-mileage">
                        {record.mileage} км
                      </span>
                    </div>

                    <div className="service-page__timeline-body">
                      <div className="service-page__timeline-type">
                        <i
                          className={`fas ${getTypeIcon(record.type)}`}
                          style={{ color: getTypeColor(record.type) }}
                        ></i>
                        <span>{getTypeLabel(record.type)}</span>
                      </div>
                      <span className="service-page__timeline-car">
                        {record.carName}
                      </span>
                    </div>

                    <div className="service-page__timeline-description">
                      {record.description}
                    </div>

                    <div className="service-page__timeline-footer">
                      <span className="service-page__timeline-cost">
                        {formatAmount(record.cost)}
                      </span>
                      <span
                        className="service-page__timeline-status"
                        style={{ color: getStatusColor(record.status) }}
                      >
                        {getStatusLabel(record.status)}
                      </span>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </AnimatePresence>

        {/* Модальное окно подтверждения удаления */}
        <AnimatePresence>
          {showDeleteConfirm && selectedRecord && (
            <>
              <div
                className="service-page__modal-overlay"
                onClick={() => setShowDeleteConfirm(false)}
              />
              <motion.div
                className="service-page__delete-modal"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
              >
                <div className="service-page__delete-icon">
                  <i className="fas fa-exclamation-triangle"></i>
                </div>
                <h3 className="service-page__delete-title">Удалить запись?</h3>
                <p className="service-page__delete-text">
                  Вы уверены, что хотите удалить запись о{" "}
                  <strong>«{getTypeLabel(selectedRecord.type)}»</strong> для{" "}
                  {selectedRecord.carName} от {formatDate(selectedRecord.date)}?
                  Это действие нельзя отменить.
                </p>
                <div className="service-page__delete-actions">
                  <button
                    className="service-page__delete-btn service-page__delete-btn--cancel"
                    onClick={() => setShowDeleteConfirm(false)}
                  >
                    Отмена
                  </button>
                  <button
                    className="service-page__delete-btn service-page__delete-btn--confirm"
                    onClick={() => {
                      onDeleteRecord && onDeleteRecord(selectedRecord.id);
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
          {selectedRecord && !showDeleteConfirm && (
            <>
              <div
                className="service-page__modal-overlay"
                onClick={() => setSelectedRecord(null)}
              />
              <motion.div
                className="service-page__detail-modal"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
              >
                <div className="service-page__modal-header">
                  <h2 className="service-page__modal-title">
                    <i className="fas fa-wrench service-page__modal-title-icon"></i>
                    Детали обслуживания
                  </h2>
                  <button
                    className="service-page__modal-close"
                    onClick={() => setSelectedRecord(null)}
                  >
                    <i className="fas fa-times"></i>
                  </button>
                </div>

                <div className="service-page__modal-body">
                  <div className="service-page__detail-header">
                    <div
                      className="service-page__detail-type-icon"
                      style={{
                        backgroundColor:
                          getTypeColor(selectedRecord.type) + "20",
                      }}
                    >
                      <i
                        className={`fas ${getTypeIcon(selectedRecord.type)}`}
                        style={{ color: getTypeColor(selectedRecord.type) }}
                      ></i>
                    </div>
                    <div className="service-page__detail-header-info">
                      <span className="service-page__detail-type">
                        {getTypeLabel(selectedRecord.type)}
                      </span>
                      <span className="service-page__detail-car">
                        <i className="fas fa-car"></i>
                        {selectedRecord.carName}
                      </span>
                    </div>
                    <div
                      className="service-page__detail-status"
                      style={{
                        backgroundColor:
                          getStatusColor(selectedRecord.status) + "20",
                      }}
                    >
                      {getStatusLabel(selectedRecord.status)}
                    </div>
                  </div>

                  <div className="service-page__detail-grid">
                    <div className="service-page__detail-item">
                      <span className="service-page__detail-label">Дата</span>
                      <span className="service-page__detail-value">
                        <i className="far fa-calendar"></i>
                        {formatDate(selectedRecord.date)}
                      </span>
                    </div>

                    <div className="service-page__detail-item">
                      <span className="service-page__detail-label">Пробег</span>
                      <span className="service-page__detail-value">
                        <i className="fas fa-road"></i>
                        {selectedRecord.mileage} км
                      </span>
                    </div>

                    <div className="service-page__detail-item">
                      <span className="service-page__detail-label">
                        Следующее ТО
                      </span>
                      <span className="service-page__detail-value">
                        <i className="fas fa-chart-line"></i>
                        {selectedRecord.nextMileage
                          ? `${selectedRecord.nextMileage} км`
                          : "—"}
                      </span>
                    </div>

                    <div className="service-page__detail-item">
                      <span className="service-page__detail-label">
                        Стоимость
                      </span>
                      <span className="service-page__detail-value service-page__detail-value--cost">
                        {formatAmount(selectedRecord.cost)}
                      </span>
                    </div>

                    <div className="service-page__detail-item">
                      <span className="service-page__detail-label">
                        Сервисный центр
                      </span>
                      <span className="service-page__detail-value">
                        <i className="fas fa-map-marker-alt"></i>
                        {selectedRecord.serviceCenter || "—"}
                      </span>
                    </div>

                    <div className="service-page__detail-item">
                      <span className="service-page__detail-label">Мастер</span>
                      <span className="service-page__detail-value">
                        <i className="fas fa-user"></i>
                        {selectedRecord.master || "—"}
                      </span>
                    </div>
                  </div>

                  <div className="service-page__detail-section">
                    <h3 className="service-page__detail-section-title">
                      <i className="fas fa-file-alt"></i>
                      Описание работ
                    </h3>
                    <p className="service-page__detail-text">
                      {selectedRecord.description}
                    </p>
                  </div>

                  {selectedRecord.parts && selectedRecord.parts.length > 0 && (
                    <div className="service-page__detail-section">
                      <h3 className="service-page__detail-section-title">
                        <i className="fas fa-clipboard-list"></i>
                        Запчасти и материалы
                      </h3>
                      <table className="service-page__parts-table">
                        <thead>
                          <tr>
                            <th>Наименование</th>
                            <th>Кол-во</th>
                            <th>Цена</th>
                            <th>Сумма</th>
                          </tr>
                        </thead>
                        <tbody>
                          {selectedRecord.parts.map((part, index) => (
                            <tr key={index}>
                              <td>{part.name}</td>
                              <td>{part.quantity}</td>
                              <td>{formatAmount(part.price)}</td>
                              <td>
                                {formatAmount(part.quantity * part.price)}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}

                  {selectedRecord.recommendations && (
                    <div className="service-page__detail-section">
                      <h3 className="service-page__detail-section-title">
                        <i className="fas fa-notes-medical"></i>
                        Рекомендации
                      </h3>
                      <p className="service-page__detail-text">
                        {selectedRecord.recommendations}
                      </p>
                    </div>
                  )}

                  {selectedRecord.documents && (
                    <div className="service-page__detail-section">
                      <h3 className="service-page__detail-section-title">
                        <i className="fas fa-file-alt"></i>
                        Документы
                      </h3>
                      <button className="service-page__doc-btn">
                        <i className="fas fa-file-alt"></i>
                        Скачать акт выполненных работ
                      </button>
                    </div>
                  )}
                </div>

                <div className="service-page__modal-footer">
                  <button
                    className="service-page__modal-btn service-page__modal-btn--edit"
                    onClick={() => {
                      onEditRecord && onEditRecord(selectedRecord);
                      setSelectedRecord(null);
                    }}
                  >
                    <i className="fas fa-edit"></i>
                    Редактировать
                  </button>
                  <button
                    className="service-page__modal-btn service-page__modal-btn--delete"
                    onClick={() => {
                      setShowDeleteConfirm(true);
                    }}
                  >
                    <i className="fas fa-trash"></i>
                    Удалить
                  </button>
                  <button
                    className="service-page__modal-btn service-page__modal-btn--close"
                    onClick={() => setSelectedRecord(null)}
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

export default ServicePage;
