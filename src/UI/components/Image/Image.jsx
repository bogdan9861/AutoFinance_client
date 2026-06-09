import React, { useEffect, useState } from "react";
import { enums } from "../../../constants";

const Image = (props) => {
  const [theme, setTheme] = useState("dark");

  // Функция для обновления темы
  const updateTheme = () => {
    const currentTheme = localStorage.getItem(enums.THEME);
    setTheme(currentTheme || "dark");
  };

  useEffect(() => {
    updateTheme();

    const handleThemeChange = (event) => {
      updateTheme();
    };

    window.addEventListener("themeChanged", handleThemeChange);

    return () => {
      window.removeEventListener("themeChanged", handleThemeChange);
    };
  }, []);

  return (
    <img
      {...props}
      style={{
        ...props.style,
        filter: theme === "light" ? "invert()" : "none",
      }}
    />
  );
};

export default Image;
