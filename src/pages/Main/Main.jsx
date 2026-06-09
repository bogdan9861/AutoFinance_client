import React, { useEffect, useState } from "react";
import AddCarModal from "../../UI/components/AddCar/AddCarModal";
import { CarOutlined, UpOutlined } from "@ant-design/icons";

import SideBar from "../../UI/components/SideBar/SideBar";
import CarItem from "../../UI/components/CarItem/CarItem";

import "./Main.css";
import { getDashboard } from "../../app/api/endpoints/dashboard";
import { message, Spin } from "antd";
import useUser from "../../hooks/useUser";
import { getCars } from "../../app/api/endpoints/cars";

const Main = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [statistics, setStatistics] = useState([]);
  const [loading, setLoading] = useState(false);
  const [carsLoading, setCarsLoading] = useState(false);
  const [cars, setCars] = useState([]);
  const { user } = useUser();

  useEffect(() => {
    setCarsLoading(true);

    getCars()
      .then((res) => {
        console.log(res.data);

        setCars(res.data);
      })
      .catch((e) => {
        console.log(e);
      })
      .finally(() => {
        setCarsLoading(false);
      });
  }, []);

  useEffect(() => {
    setLoading(true);

    getDashboard()
      .then((res) => {
        setStatistics(res.data);
      })
      .catch((e) => {
        console.log(e);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  const handleAddCar = (carData) => {
    console.log("Новый автомобиль:", carData);
  };

  return (
    <>
      <div className="app">
        {/* Анимированные фоновые элементы */}
        <div className="bg-sphere"></div>
        <div className="bg-sphere bg-sphere-2"></div>

        {/* Боковое меню навигации */}
        <SideBar />

        {/* Основной контент */}

        {loading ? (
          <div
            style={{
              width: "100%",
              height: "100vh",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Spin />
          </div>
        ) : (
          <main className="main-content scroll">
            <div className="dashboard">
              {/* Хедер */}
              <div className="header">
                <div className="greeting">
                  <h1>Привет, {user?.name} 👋</h1>
                  <p>Вот что происходит с твоим автопарком сегодня</p>
                </div>
                <div className="header-actions">
                  <div className="date-badge">
                    <i className="fas fa-calendar-alt"></i>
                    <span>{new Date(Date.now()).toLocaleString()}</span>
                  </div>
                </div>
              </div>

              {/* Статистика затрат */}
              <div className="stats-grid">
                {statistics?.map((stat, i) => (
                  <div key={i} className="stat-card">
                    <div
                      className="stat-title"
                      style={{ textTransform: "lowercase" }}
                    >
                      <i
                        className={`fas ${
                          i === 0
                            ? "fa-credit-card"
                            : stat.id === 1
                              ? "fa-gas-pump"
                              : stat.id === 2
                                ? "fa-wrench"
                                : "fa-car"
                        }`}
                      ></i>
                      {stat.label}
                    </div>
                    <div className="stat-number">
                      {stat.value} <span className="stat-unit">₽</span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Мои автомобили */}
              <div className="cars-section">
                <div className="section-header">
                  <h2>Мои автомобили</h2>
                </div>

                <div className="cars-grid">
                  {cars.map((car) => (
                    <CarItem car={car} />
                  ))}
                </div>
              </div>
            </div>
          </main>
        )}
      </div>
    </>
  );
};

export default Main;
