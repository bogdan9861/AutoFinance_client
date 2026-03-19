import React, { useState } from "react";
import AddCarModal from "../../UI/components/AddCar/AddCarModal";
import { CarOutlined, UpOutlined } from "@ant-design/icons";

import SideBar from "../../UI/components/SideBar/SideBar";
import CarItem from "../../UI/components/CarItem/CarItem";

import "./Main.css";

const Main = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleAddCar = (carData) => {
    console.log("Новый автомобиль:", carData);
  };

  // Данные для автомобилей
  const cars = [
    {
      id: 1,
      name: "Porsche Cayenne",
      year: 2021,
      mileage: 78400,
      fuelConsumption: 14.2,
      fuelUnit: "л/100км",
      nextService: 1700,
      serviceProgress: 83,
      serviceNote: "Масло через 900 км",
      url: "https://e-n-cars.ru/wp-content/uploads/2024/10/porsche-cayenne-s-e1729874775649.webp",
    },
    {
      id: 2,
      name: "Toyota Hilux",
      year: 2020,
      mileage: 112400,
      fuelConsumption: 11.8,
      fuelUnit: "л/100км",
      nextService: 4200,
      serviceProgress: 42,
      serviceNote: "Замена ремня",
      url: "https://www.masmotors.ru/resources/models/97/colors/color/5_600x310.webp",
    },
    {
      id: 3,
      name: "Tesla Model 3",
      year: 2023,
      mileage: 34200,
      fuelConsumption: 16,
      fuelUnit: "кВт·ч/100км",
      nextService: 9500,
      serviceProgress: 20,
      serviceNote: "Охлаждение ок",
      url: "https://e-n-cars.ru/images/products/69496a12f34ea_tesla-model-3_1.png",
    },
  ];

  // Статистика затрат
  const stats = [
    {
      id: 1,
      title: "Общие затраты",
      value: "184 750",
      unit: "₽",
      trend: "+12%",
      trendIcon: "fa-arrow-up",
      trendColor: "#7ae0b0",
      isPositiveTrend: true,
    },
    {
      id: 2,
      title: "Топливо",
      value: "58 430",
      unit: "₽",
      trend: "-3%",
      trendIcon: "fa-arrow-down",
      trendColor: "#ff8a7a",
      isPositiveTrend: true,
    },
    {
      id: 3,
      title: "Обслуживание",
      value: "34 890",
      unit: "₽",
      trend: "+8%",
      trendIcon: "fa-arrow-up",
      trendColor: "#7ae0b0",
      isPositiveTrend: true,
    },
    {
      id: 4,
      title: "Среднее на авто",
      value: "61 580",
      unit: "₽",
      trend: "за год",
      trendIcon: null,
      trendColor: "#b0b0b0",
      isPositiveTrend: true,
    },
  ];

  return (
    <>
      <div className="app">
        {/* Анимированные фоновые элементы */}
        <div className="bg-sphere"></div>
        <div className="bg-sphere bg-sphere-2"></div>

        {/* Боковое меню навигации */}
        <SideBar />

        {/* Основной контент */}
        <main className="main-content scroll">
          <div className="dashboard">
            {/* Хедер */}
            <div className="header">
              <div className="greeting">
                <h1>Привет, Александр 👋</h1>
                <p>Вот что происходит с твоим автопарком сегодня</p>
              </div>
              <div className="header-actions">
                <div className="date-badge">
                  <i className="fas fa-calendar-alt"></i>
                  <span>19 марта 2026</span>
                </div>
                <button className="notification-btn">
                  <i className="fas fa-bell"></i>
                  <span className="notification-badge">3</span>
                </button>
              </div>
            </div>

            {/* Статистика затрат */}
            <div className="stats-grid">
              {stats.map((stat) => (
                <div key={stat.id} className="stat-card">
                  <div className="stat-title">
                    <i
                      className={`fas ${
                        stat.id === 1
                          ? "fa-credit-card"
                          : stat.id === 2
                          ? "fa-gas-pump"
                          : stat.id === 3
                          ? "fa-wrench"
                          : "fa-car"
                      }`}
                    ></i>
                    {stat.title}
                  </div>
                  <div className="stat-number">
                    {stat.value} <span className="stat-unit">{stat.unit}</span>
                  </div>
                  <div
                    className="stat-trend"
                    style={{ color: stat.trendColor }}
                  >
                    <UpOutlined
                      style={{
                        color: stat?.isPositiveTrend ? "green" : "redƒ",
                        transform: `rotate(${
                          stat?.isPositiveTrend ? "0deg" : "180deg"
                        })`,
                      }}
                    />
                    {stat.trend}
                  </div>
                </div>
              ))}
            </div>

            {/* Мои автомобили */}
            <div className="cars-section">
              <div className="section-header">
                <h2>Мои автомобили</h2>
                <button
                  className="add-car-btn"
                  onClick={() => setIsModalOpen(true)}
                >
                  <i className="fas fa-plus-circle"></i> Добавить авто
                </button>
              </div>

              <div className="cars-grid">
                {cars.map((car) => (
                  <CarItem car={car} />
                ))}
              </div>
            </div>
          </div>
        </main>
        <AddCarModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onAddCar={handleAddCar}
        />
      </div>
    </>
  );
};

export default Main;
