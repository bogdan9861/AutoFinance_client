import {
  BarChartOutlined,
  CarOutlined,
  CreditCardOutlined,
  DashboardOutlined,
  SettingOutlined,
  ToolOutlined,
} from "@ant-design/icons";
import React, { useEffect, useState } from "react";
import { useHref, useNavigate } from "react-router-dom";

const SideBar = () => {
  const routeName = useHref();
  const [activeNav, setActiveNav] = useState(routeName);
  const navigate = useNavigate();

  console.log(routeName);

  const navItems = [
    {
      id: "dashboard",
      label: "Дашборд",
      icon: <DashboardOutlined />,
      link: "/",
    },
    { id: "cars", label: "Автомобили", icon: <CarOutlined />, link: "/cars" },
    {
      id: "expenses",
      label: "Расходы",
      icon: <CreditCardOutlined />,
      link: "/expenses",
    },
    {
      id: "service",
      label: "Обслуживание",
      icon: <ToolOutlined />,
      link: "/service",
    },
    {
      id: "settings",
      label: "Настройки",
      icon: <SettingOutlined />,
      link: "/settings",
    },
  ];

  return (
    <nav className="sidebar">
      <div className="sidebar-logo">
        <i className="fas fa-car-side"></i>
        <span>AutoFinance</span>
      </div>

      <ul className="nav-menu">
        {navItems.map((item) => (
          <li
            key={item.id}
            className={`nav-item ${routeName === item.link ? "active" : ""}`}
            onClick={() => {
              setActiveNav(item.id);
              navigate(item.link);
            }}
          >
            {item.icon}
            <span>{item.label}</span>
            {activeNav === item.id && <div className="active-indicator" />}
          </li>
        ))}
      </ul>
      <div className="sidebar_wrapper">
        <div className="sidebar-footer">
          <div className="user-info">
            <div className="user-avatar">
              <i className="fas fa-user"></i>
            </div>
            <div className="user-details">
              <span className="user-name">Александр</span>
              <span className="user-role">Владелец</span>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default SideBar;
