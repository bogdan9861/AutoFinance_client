import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { theme, ConfigProvider } from "antd";
import Main from "./pages/Main/Main";

import CarsPage from "./pages/Cars/Cars";
import ExpensesPage from "./pages/Expenses/Expenses";
import ServicePage from "./pages/Service/Service";
import SettingsPage from "./pages/Settings/Settings";
import AuthPage from "./pages/Auth/Auth";

const { darkAlgorithm } = theme;

function App() {
  return (
    <ConfigProvider theme={{ algorithm: darkAlgorithm }}>
      <Router>
        <Routes>
          <Route path="/" element={<Main />} />
          <Route path="/auth" element={<AuthPage />} />
          <Route path="/cars" element={<CarsPage />} />
          <Route path="/expenses" element={<ExpensesPage />} />
          <Route path="/service" element={<ServicePage />} />
          <Route path="/settings" element={<SettingsPage />} />
        </Routes>
      </Router>
    </ConfigProvider>
  );
}

export default App;
