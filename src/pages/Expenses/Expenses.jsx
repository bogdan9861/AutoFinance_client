import React, { useState, useMemo, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import "./Expenses.css";
import SideBar from "../../UI/components/SideBar/SideBar";
import {
  BankOutlined,
  CalendarOutlined,
  CarOutlined,
  ClockCircleOutlined,
  CloseCircleOutlined,
  DeleteOutlined,
  EllipsisOutlined,
  FieldNumberOutlined,
  FileOutlined,
  FilterOutlined,
  MoneyCollectOutlined,
  SearchOutlined,
  TableOutlined,
  ThunderboltOutlined,
  ToolOutlined,
  TransactionOutlined,
  UnorderedListOutlined,
} from "@ant-design/icons";
import ExpenseModal from "../../UI/widgets/ExpenseModal/ExpenseModal";
import { getCars } from "../../app/api/endpoints/cars";
import {
  getExpencess,
  removeExpencess,
} from "../../app/api/endpoints/expencess";
import { message, Spin } from "antd";

const categories = [
  {
    value: "all",
    label: "Все категории",
    icon: <FilterOutlined />,
    color: "#95a5a6",
  },
  {
    value: "FUEL",
    label: "Топливо",
    icon: <i className="fas fa-gas-pump"></i>,
    color: "#f39c12",
  },
  {
    value: "MAINTANCE",
    label: "Обслуживание",
    icon: <ToolOutlined />,
    color: "#3498db",
  },
  {
    value: "REPAIR",
    label: "Ремонт",
    icon: <ToolOutlined />,
    color: "#e74c3c",
  },
  {
    value: "INSURANCE",
    label: "Страховка",
    icon: <FileOutlined />,
    color: "#9b59b6",
  },
  {
    value: "TAXES",
    label: "Налоги",
    icon: <BankOutlined />,
    color: "#e67e22",
  },
  {
    value: "PARKING",
    label: "Парковка",
    icon: <CarOutlined />,
    color: "#1abc9c",
  },
  {
    value: "CHARGING",
    label: "Зарядка",
    icon: <ThunderboltOutlined />,
    color: "#2ecc71",
  },
  {
    value: "other",
    label: "Прочее",
    icon: <EllipsisOutlined />,
    color: "#7f8c8d",
  },
];

const ExpensesPage = ({
  expenses: initialExpenses,

  onAddExpense,
  onDeleteExpense,
}) => {
  const [filterPeriod, setFilterPeriod] = useState("month");
  const [filterCategory, setFilterCategory] = useState("all");
  const [filterCar, setFilterCar] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("date-desc");
  const [viewMode, setViewMode] = useState("list");
  const [selectedExpense, setSelectedExpense] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showExpenceInfo, setShowExpenceInfo] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [expenses, setExpenses] = useState([]);
  const [createExpenceModalOpen, setCreateExpenceModalOpen] = useState(false);
  const [editExpenceModalOpen, setEditExpenceModalOpen] = useState(false);
  const [carsList, setCarsList] = useState([]);
  const [loading, setLoading] = useState(false);

  console.log(filterCar);

  const periods = [
    { value: "week", label: "Неделя" },
    { value: "month", label: "Месяц" },
    { value: "quarter", label: "Квартал" },
    { value: "year", label: "Год" },
    { value: "all", label: "Все время" },
  ];

  useEffect(() => {
    setLoading(true);

    getExpencess()
      .then((res) => {
        setExpenses(res.data);
      })
      .catch((e) => {
        message.error(
          `Не удалось получить список расходов ${e.respose.data.message}`
        );
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  useEffect(() => {
    getCars()
      .then((res) => {
        setCarsList(
          res.data.map((c) => ({
            ...c,
            id: c.id,
            name: `${c.mark} ${c.model}`,
          }))
        );
      })
      .catch((e) => {
        console.log(e);
      });
  }, []);

  const getCategoryIcon = (categoryValue) => {
    const category = categories.find((c) => c.value === categoryValue);
    return category ? category.icon : "fa-receipt";
  };

  const getCategoryColor = (categoryValue) => {
    const category = categories.find((c) => c.value === categoryValue);
    return category ? category.color : "#95a5a6";
  };

  const getCategoryLabel = (categoryValue) => {
    const category = categories.find((c) => c.value === categoryValue);
    return category ? category.label : "Другое";
  };

  // Фильтрация расходов
  const filteredExpenses = useMemo(() => {
    const now = new Date();
    const periodsMap = {
      week: new Date(now.setDate(now.getDate() - 7)),
      month: new Date(now.setMonth(now.getMonth() - 1)),
      quarter: new Date(now.setMonth(now.getMonth() - 3)),
      year: new Date(now.setFullYear(now.getFullYear() - 1)),
      all: new Date(0),
    };

    const filterDate = periodsMap[filterPeriod];

    return expenses
      .filter((expense) => {
        const expenseDate = new Date(expense.date);
        const matchesPeriod =
          filterPeriod === "all" || expenseDate >= filterDate;
        const matchesCategory =
          filterCategory === "all" || expense.type === filterCategory;
        const matchesCar = filterCar === "all" || expense.auto.id === filterCar;

        const matchesSearch =
          searchTerm === "" ||
          expense.description
            ?.toLowerCase()
            ?.includes(searchTerm?.toLowerCase()) ||
          expense.auto.mark.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (expense.place &&
            expense.place.toLowerCase().includes(searchTerm.toLowerCase()));

        return matchesPeriod && matchesCategory && matchesCar && matchesSearch;
      })
      .sort((a, b) => {
        switch (sortBy) {
          case "date-desc":
            return new Date(b.date) - new Date(a.date);
          case "date-asc":
            return new Date(a.date) - new Date(b.date);
          case "amount-desc":
            return b.price - a.price;
          case "amount-asc":
            return a.price - b.price;
          default:
            return 0;
        }
      });
  }, [expenses, filterPeriod, filterCategory, filterCar, searchTerm, sortBy]);

  // Статистика расходов
  const stats = useMemo(() => {
    const total = filteredExpenses.reduce((sum, exp) => sum + exp.price, 0);
    const byCategory = categories
      .slice(1)
      .map((cat) => ({
        ...cat,
        total: filteredExpenses
          .filter((exp) => exp.type === cat.value)
          .reduce((sum, exp) => sum + exp.price, 0),
      }))
      .filter((cat) => cat.total > 0);

    const byCar = carsList
      .map((car) => ({
        ...car,
        total: filteredExpenses
          .filter((exp) => exp.carId === car.id)
          .reduce((sum, exp) => sum + exp.price, 0),
      }))
      .filter((car) => car.total > 0);

    const avgPerMonth =
      filteredExpenses.length > 0 ? total / (filteredExpenses.length / 30) : 0;

    return {
      total,
      byCategory,
      byCar,
      avgPerMonth,
      count: filteredExpenses.length,
    };
  }, [filteredExpenses, carsList]);

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
    return date.toLocaleDateString("ru-RU", { day: "numeric", month: "short" });
  };

  // Форматирование суммы
  const formatAmount = (amount) => {
    return new Intl.NumberFormat("ru-RU", {
      style: "currency",
      currency: "RUB",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  // Группировка расходов по дате для списка
  const groupedExpenses = useMemo(() => {
    const groups = {};
    filteredExpenses.forEach((expense) => {
      const date = expense.date;
      if (!groups[date]) {
        groups[date] = [];
      }
      groups[date].push(expense);
    });
    return Object.entries(groups).sort(
      (a, b) => new Date(b[0]) - new Date(a[0])
    );
  }, [filteredExpenses]);

  const removeExpence = (id) => {
    setExpenses((prev) => prev.filter((e) => e.id !== id));
    removeExpencess(id)
      .then((res) => {
        message.success("Расход удалён");
      })
      .catch((e) => {
        message.error(`Не удалось удалить расход ${e?.respose?.data?.message}`);
      });
  };

  return (
    <motion.div
      className="app expenses-page gap-20"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <SideBar />

      <div style={{ paddingTop: 30 }}>
        {/* Шапка страницы */}
        <div className="expenses-page__header">
          <motion.h1
            className="expenses-page__title"
            initial={{ x: -20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
          >
            <i className="fas fa-credit-card expenses-page__title-icon"></i>
            Расходы
          </motion.h1>
          <motion.div
            className="expenses-page__header-actions"
            initial={{ x: 20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
          >
            <button
              className="expenses-page__add-btn"
              onClick={() => setCreateExpenceModalOpen(true)}
            >
              <i className="fas fa-plus-circle"></i>
              Добавить расход
            </button>
          </motion.div>
        </div>

        {/* Статистика */}
        <div className="expenses-page__stats">
          <motion.div
            className="expenses-page__stat-card"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.1 }}
          >
            <div className="expenses-page__stat-icon expenses-page__stat-icon--total">
              <MoneyCollectOutlined />
            </div>
            <div className="expenses-page__stat-info">
              <span className="expenses-page__stat-label">Всего расходов</span>
              <span className="expenses-page__stat-value">
                {formatAmount(stats.total)}
              </span>
            </div>
          </motion.div>

          <motion.div
            className="expenses-page__stat-card"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            <div className="expenses-page__stat-icon expenses-page__stat-icon--count">
              <FieldNumberOutlined />
            </div>
            <div className="expenses-page__stat-info">
              <span className="expenses-page__stat-label">Количество</span>
              <span className="expenses-page__stat-value">{stats.count}</span>
            </div>
          </motion.div>

          <motion.div
            className="expenses-page__stat-card"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            <div className="expenses-page__stat-icon expenses-page__stat-icon--average">
              <TransactionOutlined />
            </div>
            <div className="expenses-page__stat-info">
              <span className="expenses-page__stat-label">Средний расход</span>
              <span className="expenses-page__stat-value">
                {formatAmount(stats.avgPerMonth)}/мес
              </span>
            </div>
          </motion.div>

          <motion.div
            className="expenses-page__stat-card"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.4 }}
          >
            <div className="expenses-page__stat-icon expenses-page__stat-icon--cars">
              <CarOutlined />
            </div>
            <div className="expenses-page__stat-info">
              <span className="expenses-page__stat-label">
                Авто с расходами
              </span>
              <span className="expenses-page__stat-value">
                {stats.byCar.length}
              </span>
            </div>
          </motion.div>
        </div>

        {/* Графики и аналитика */}
        <div className="expenses-page__charts">
          {/* График по категориям */}
          <motion.div
            className="expenses-page__chart-card"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            <h3 className="expenses-page__chart-title">
              <UnorderedListOutlined />
              Распределение по категориям
            </h3>
            <div className="expenses-page__category-chart">
              {stats.byCategory.length > 0 ? (
                stats.byCategory.map((cat, index) => (
                  <motion.div
                    key={cat.value}
                    className="expenses-page__chart-item"
                    initial={{ x: -20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: 0.6 + index * 0.1 }}
                  >
                    <div className="expenses-page__chart-row">
                      <div className="expenses-page__chart-label">
                        {cat?.icon}
                        <span>{cat.label}</span>
                      </div>
                      <span className="expenses-page__chart-amount">
                        {formatAmount(cat.total)}
                      </span>
                    </div>
                    <div className="expenses-page__progress-bar">
                      <motion.div
                        className="expenses-page__progress-fill"
                        style={{ backgroundColor: cat.color }}
                        initial={{ width: 0 }}
                        animate={{
                          width: `${(cat.total / stats.total) * 100}%`,
                        }}
                        transition={{ duration: 1, delay: 0.7 + index * 0.1 }}
                      />
                    </div>
                  </motion.div>
                ))
              ) : (
                <div className="expenses-page__chart-empty">
                  Нет данных за выбранный период
                </div>
              )}
            </div>
          </motion.div>

          {/* График по автомобилям */}
          <motion.div
            className="expenses-page__chart-card"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.55 }}
          >
            <h3 className="expenses-page__chart-title">
              <i className="fas fa-chart-bar"></i>
              Расходы по автомобилям
            </h3>
            <div className="expenses-page__cars-chart">
              {stats.byCar.length > 0 ? (
                stats.byCar.map((car, index) => (
                  <motion.div
                    key={car.id}
                    className="expenses-page__chart-item"
                    initial={{ x: -20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: 0.65 + index * 0.1 }}
                  >
                    <div className="expenses-page__chart-row">
                      <div className="expenses-page__chart-label">
                        <i
                          className="fas fa-car"
                          style={{ color: "#ffd966" }}
                        ></i>
                        <span>{car.name}</span>
                      </div>
                      <span className="expenses-page__chart-amount">
                        {formatAmount(car.total)}
                      </span>
                    </div>
                    <div className="expenses-page__progress-bar">
                      <motion.div
                        className="expenses-page__progress-fill"
                        style={{ backgroundColor: "#ffd966" }}
                        initial={{ width: 0 }}
                        animate={{
                          width: `${(car.total / stats.total) * 100}%`,
                        }}
                        transition={{ duration: 1, delay: 0.75 + index * 0.1 }}
                      />
                    </div>
                  </motion.div>
                ))
              ) : (
                <div className="expenses-page__chart-empty">
                  Нет данных за выбранный период
                </div>
              )}
            </div>
          </motion.div>
        </div>

        {/* Фильтры */}
        <div className="expenses-page__filters">
          <div className="expenses-page__search">
            <SearchOutlined className="expenses-page__search-icon" />
            <input
              type="text"
              className="expenses-page__search-input"
              placeholder="Поиск по описанию или месту..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            {searchTerm && (
              <button
                className="expenses-page__search-clear"
                onClick={() => setSearchTerm("")}
              >
                <CloseCircleOutlined />
              </button>
            )}
          </div>

          <div className="expenses-page__filter-group">
            <select
              className="expenses-page__select"
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
              className="expenses-page__select"
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
            >
              {categories.map((cat) => (
                <option key={cat.value} value={cat.value}>
                  {cat.label}
                </option>
              ))}
            </select>

            <select
              className="expenses-page__select"
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
              className="expenses-page__select"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
            >
              <option value="date-desc">Сначала новые</option>
              <option value="date-asc">Сначала старые</option>
              <option value="amount-desc">По убыванию суммы</option>
              <option value="amount-asc">По возрастанию суммы</option>
            </select>

            <div className="expenses-page__view-toggle">
              <button
                className={`expenses-page__view-btn ${
                  viewMode === "list" ? "expenses-page__view-btn--active" : ""
                }`}
                onClick={() => setViewMode("list")}
              >
                <TableOutlined />
              </button>
              <button
                className={`expenses-page__view-btn ${
                  viewMode === "grid" ? "expenses-page__view-btn--active" : ""
                }`}
                onClick={() => setViewMode("grid")}
              >
                <UnorderedListOutlined />
              </button>
            </div>
          </div>
        </div>

        {/* Результаты поиска */}
        <div className="expenses-page__results-info">
          <span>
            Найдено расходов: <strong>{filteredExpenses.length}</strong>
          </span>
          {(searchTerm ||
            filterCategory !== "all" ||
            filterCar !== "all" ||
            filterPeriod !== "month") && (
            <button
              className="expenses-page__clear-filters"
              onClick={() => {
                setSearchTerm("");
                setFilterCategory("all");
                setFilterCar("all");
                setFilterPeriod("month");
              }}
            >
              <i className="fas fa-times"></i>
              Сбросить все фильтры
            </button>
          )}
        </div>

        {/* Список расходов */}

        {loading ? (
          <Spin />
        ) : (
          <AnimatePresence mode="wait">
            {filteredExpenses.length === 0 ? (
              <motion.div
                className="expenses-page__empty"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
              >
                <i className="fas fa-receipt expenses-page__empty-icon"></i>
                <h3 className="expenses-page__empty-title">
                  Расходы не найдены
                </h3>
                <p className="expenses-page__empty-text">
                  Попробуйте изменить параметры фильтрации
                </p>
                <button
                  className="expenses-page__empty-btn"
                  onClick={() => setCreateExpenceModalOpen(true)}
                >
                  <i className="fas fa-plus-circle"></i>
                  Добавить первый расход
                </button>
              </motion.div>
            ) : viewMode === "list" ? (
              <div className="expenses-page__list">
                {groupedExpenses.map(([date, dayExpenses]) => (
                  <motion.div
                    key={date}
                    className="expenses-page__date-group"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                  >
                    <div className="expenses-page__date-header">
                      <span className="expenses-page__date">
                        {formatDate(date)}
                      </span>
                      <span className="expenses-page__date-total">
                        {formatAmount(
                          dayExpenses.reduce((sum, exp) => sum + exp.price, 0)
                        )}
                      </span>
                    </div>

                    {dayExpenses.map((expense, index) => (
                      <motion.div
                        key={expense.id}
                        className="expenses-page__list-item"
                        initial={{ x: -20, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        transition={{ delay: index * 0.05 }}
                        whileHover={{ scale: 1.01, x: 5 }}
                        onClick={() => setSelectedExpense(expense)}
                      >
                        <div className="expenses-page__item-category">
                          <div
                            className="expenses-page__category-icon"
                            style={{
                              backgroundColor:
                                getCategoryColor(expense.type) + "20",
                            }}
                          >
                            <i
                              className={`fas ${getCategoryIcon(expense.type)}`}
                              style={{
                                color: getCategoryColor(expense.type),
                              }}
                            >
                              {getCategoryIcon(expense.type)}
                            </i>
                          </div>
                        </div>

                        <div className="expenses-page__item-info">
                          <div className="expenses-page__item-header">
                            <span className="expenses-page__item-title">
                              {expense.description ||
                                getCategoryLabel(expense.type)}
                            </span>
                            <span className="expenses-page__item-amount">
                              {formatAmount(expense.price)}
                            </span>
                          </div>

                          <div className="expenses-page__item-details">
                            <span className="expenses-page__item-car">
                              <i className="fas fa-car"></i>
                              {expense.auto.mark} {expense.auto.model}
                            </span>
                            <span className="expenses-page__item-mileage">
                              <i className="fas fa-road"></i>
                              {expense.auto.mileageKM} км
                            </span>
                            {expense.place && (
                              <span className="expenses-page__item-location">
                                <i className="fas fa-map-marker-alt"></i>
                                {expense.place}
                              </span>
                            )}
                          </div>
                        </div>

                        <div className="expenses-page__item-actions">
                          <button
                            className="expenses-page__item-action"
                            onClick={(e) => {
                              e.stopPropagation();
                              setEditExpenceModalOpen(true);
                              setSelectedExpense(expense);
                            }}
                          >
                            <i className="fas fa-edit"></i>
                          </button>
                          <button
                            className="expenses-page__item-action expenses-page__item-action--delete"
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedExpense(expense);
                              setShowDeleteConfirm(true);
                            }}
                          >
                            <i className="fas fa-trash"></i>
                          </button>
                        </div>
                      </motion.div>
                    ))}
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="expenses-page__grid">
                {filteredExpenses.map((expense, index) => (
                  <motion.div
                    key={expense.id}
                    className="expenses-page__grid-card"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: index * 0.05 }}
                    whileHover={{ y: -5, scale: 1.02 }}
                    onClick={() => {
                      setSelectedExpense(expense);
                      setShowExpenceInfo(true);
                    }}
                  >
                    <div
                      className="expenses-page__grid-category"
                      style={{
                        backgroundColor: getCategoryColor(expense.type),
                      }}
                    >
                      <i className={`fas ${getCategoryIcon(expense.type)}`}></i>
                    </div>

                    <div className="expenses-page__grid-content">
                      <div className="expenses-page__grid-header">
                        <span className="expenses-page__grid-title">
                          {expense.description ||
                            getCategoryLabel(expense.type)}
                        </span>
                        <span className="expenses-page__grid-amount">
                          {formatAmount(expense.price)}
                        </span>
                      </div>

                      <div className="expenses-page__grid-car">
                        <CarOutlined />
                        {expense.auto.mark}
                      </div>

                      <div className="expenses-page__grid-footer">
                        <span className="expenses-page__grid-date">
                          <CalendarOutlined />
                          {formatShortDate(expense.date)}
                        </span>
                        <span className="expenses-page__grid-mileage">
                          <ClockCircleOutlined />
                          {expense.auto.mileageKM} км
                        </span>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </AnimatePresence>
        )}

        <ExpenseModal
          isOpen={createExpenceModalOpen}
          onClose={() => setCreateExpenceModalOpen(false)}
          cars={carsList}
          setExpenses={setExpenses}
        />

        <ExpenseModal
          isOpen={editExpenceModalOpen}
          onClose={() => setEditExpenceModalOpen(false)}
          expense={selectedExpense}
          cars={carsList}
          setExpenses={setExpenses}
        />

        {/* Модальное окно подтверждения удаления */}
        <AnimatePresence>
          {showDeleteConfirm && selectedExpense && (
            <>
              <div
                className="expenses-page__modal-overlay"
                onClick={() => setShowDeleteConfirm(false)}
              />
              <motion.div
                className="expenses-page__delete-modal"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
              >
                <div className="expenses-page__delete-icon">
                  <DeleteOutlined />
                </div>
                <h3 className="expenses-page__delete-title">Удалить расход?</h3>
                <p className="expenses-page__delete-text">
                  Вы уверены, что хотите удалить расход{" "}
                  <strong>«{selectedExpense.description}»</strong> на сумму{" "}
                  {formatAmount(selectedExpense.price)}? Это действие нельзя
                  отменить.
                </p>
                <div className="expenses-page__delete-actions">
                  <button
                    className="expenses-page__delete-btn expenses-page__delete-btn--cancel"
                    onClick={() => setShowDeleteConfirm(false)}
                  >
                    Отмена
                  </button>
                  <button
                    className="expenses-page__delete-btn expenses-page__delete-btn--confirm"
                    onClick={() => {
                      removeExpence(selectedExpense.id);
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

        {/* Детальная информация о расходе */}
        <AnimatePresence>
          {selectedExpense && showExpenceInfo && (
            <>
              <div
                className="expenses-page__modal-overlay"
                onClick={() => setSelectedExpense(null)}
              />

              <motion.div
                className="expenses-page__detail-modal"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
              >
                <div className="expenses-page__modal-header">
                  <h2 className="expenses-page__modal-title">
                    <i className="fas fa-receipt expenses-page__modal-title-icon"></i>
                    Детали расхода
                  </h2>
                  <button
                    className="expenses-page__modal-close"
                    onClick={() => setSelectedExpense(null)}
                  >
                    <i className="fas fa-times"></i>
                  </button>
                </div>

                <div className="expenses-page__modal-body">
                  <div className="expenses-page__detail-category">
                    <div
                      className="expenses-page__detail-category-icon"
                      style={{
                        backgroundColor:
                          getCategoryColor(selectedExpense.type) + "20",
                      }}
                    >
                      {getCategoryIcon(selectedExpense.type)}
                    </div>
                    <div className="expenses-page__detail-category-info">
                      <span className="expenses-page__detail-category-label">
                        Категория
                      </span>
                      <span className="expenses-page__detail-category-value">
                        {getCategoryLabel(selectedExpense.type)}
                      </span>
                    </div>
                    <div className="expenses-page__detail-amount">
                      <span className="expenses-page__detail-amount-label">
                        Сумма
                      </span>
                      <span className="expenses-page__detail-amount-value">
                        {formatAmount(selectedExpense.price)}
                      </span>
                    </div>
                  </div>

                  <div className="expenses-page__detail-grid">
                    <div className="expenses-page__detail-item">
                      <span className="expenses-page__detail-label">
                        Автомобиль
                      </span>
                      <span className="expenses-page__detail-value">
                        <i className="fas fa-car"></i>
                        {selectedExpense.auto.mark} {selectedExpense.auto.model}
                      </span>
                    </div>

                    <div className="expenses-page__detail-item">
                      <span className="expenses-page__detail-label">Дата</span>
                      <span className="expenses-page__detail-value">
                        <i className="far fa-calendar"></i>
                        {formatDate(selectedExpense.date)}
                      </span>
                    </div>

                    <div className="expenses-page__detail-item">
                      <span className="expenses-page__detail-label">
                        Пробег
                      </span>
                      <span className="expenses-page__detail-value">
                        <i className="fas fa-road"></i>
                        {selectedExpense.auto.mileageKM} км
                      </span>
                    </div>

                    <div className="expenses-page__detail-item">
                      <span className="expenses-page__detail-label">Место</span>
                      <span className="expenses-page__detail-value">
                        <i className="fas fa-map-marker-alt"></i>
                        {selectedExpense.place || "—"}
                      </span>
                    </div>
                  </div>

                  <div className="expenses-page__detail-description">
                    <span className="expenses-page__detail-description-label">
                      Описание
                    </span>
                    <p className="expenses-page__detail-description-text">
                      {selectedExpense.description}
                    </p>
                  </div>
                </div>

                <div className="expenses-page__modal-footer">
                  <button
                    className="expenses-page__modal-btn expenses-page__modal-btn--delete"
                    onClick={() => {
                      setShowDeleteConfirm(true);
                    }}
                  >
                    <i className="fas fa-trash"></i>
                    Удалить
                  </button>
                  <button
                    className="expenses-page__modal-btn expenses-page__modal-btn--close"
                    onClick={() => setSelectedExpense(null)}
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

export default ExpensesPage;
