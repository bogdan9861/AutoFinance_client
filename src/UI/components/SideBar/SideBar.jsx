import {
  BarChartOutlined,
  CarOutlined,
  CreditCardOutlined,
  DashboardOutlined,
  MoonOutlined,
  SettingOutlined,
  SunOutlined,
  ToolOutlined,
} from "@ant-design/icons";
import React, { useEffect, useState } from "react";
import { useHref, useNavigate } from "react-router-dom";
import { enums } from "../../../constants";
import useUser from "../../../hooks/useUser";

const SideBar = () => {
  const routeName = useHref();
  const [activeNav, setActiveNav] = useState(routeName);
  const navigate = useNavigate();
  const { user } = useUser();
  const [theme, setTheme] = useState("light");

  useEffect(() => {
    const theme = localStorage.getItem(enums.THEME);

    setTheme(theme);
  }, []);

  const toggleTheme = () => {
    localStorage.setItem(enums.THEME, theme === "light" ? "dark" : "light");

    const toggleTheme = window.dispatchEvent(
      new CustomEvent("themeChanged", {
        detail: {
          key: enums.THEME,
          newValue: theme === "light" ? "dark" : "light",
          url: window.location.href,
        },
      }),
    );

    setTheme(theme === "light" ? "dark" : "light");
  };

  useEffect(() => {
    if (theme === "light") {
      document.body.style.filter = "invert()";
    } else {
      document.body.style.filter = "";
    }
  }, [theme]);

  useEffect(() => {
    const token = localStorage.getItem(enums.TOKEN);

    if (!token) {
      navigate("/auth");
    }
  }, []);

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
    {
      id: "theme",
      label: "Тема",
      icon: theme === "dark" ? <SunOutlined /> : <MoonOutlined />,

      onClick: toggleTheme,
    },
  ];

  return (
    <nav className="sidebar">
      <div className="sidebar-logo">
        <i className="fas fa-car-side"></i>
        <span>Авто-финанс</span>
      </div>

      <ul className="nav-menu">
        {navItems.map((item) => (
          <li
            key={item.id}
            className={`nav-item ${routeName === item.link ? "active" : ""}`}
            onClick={() => {
              if (item.onClick) {
                item.onClick();
                return;
              }
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
              <span className="user-name">{user?.name}</span>
              <span className="user-role">{user?.email}</span>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default SideBar;
