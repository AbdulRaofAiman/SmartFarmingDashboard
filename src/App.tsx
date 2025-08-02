import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Box, CssBaseline, ThemeProvider, createTheme } from "@mui/material";
import Sidebar from "./components/Sidebar";
import DashboardPage from "./pages/DashboardPage";
import HumidityPage from "./pages/HumidityPage";
import SoilMoisturePage from "./pages/SoilMoisturePage";
import SettingsPage from "./pages/SettingsPage";
import DocumentationPage from "./pages/DocumentationPage";
import TemperaturePage from "./pages/TemperaturePage";
import PumpPage from "./pages/PumpPage";
import { DeviceProvider } from "./components/DeviceProvider";

// Create a theme instance
const theme = createTheme({
  palette: {
    primary: {
      main: "#1976d2",
    },
    secondary: {
      main: "#dc004e",
    },
    background: {
      default: "#f5f5f5",
    },
  },
});

const App: React.FC = () => {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <DeviceProvider>
        <BrowserRouter>
          <Box sx={{ display: "flex" }}>
            <Sidebar />
            <Box
              component="main"
              sx={{
                flexGrow: 1,
                height: "100vh",
                overflow: "auto",
                backgroundColor: "background.default",
              }}
            >
              <Routes>
                <Route
                  path="/"
                  element={<Navigate to="/dashboard" replace />}
                />
                <Route path="/dashboard" element={<DashboardPage />} />
                <Route path="/humidity" element={<HumidityPage />} />
                <Route path="/temperature" element={<TemperaturePage />} />
                <Route path="/soil-moisture" element={<SoilMoisturePage />} />
                <Route path="/pump" element={<PumpPage />} />
                <Route path="/settings" element={<SettingsPage />} />
                <Route path="/documentation" element={<DocumentationPage />} />
              </Routes>
            </Box>
          </Box>
        </BrowserRouter>
      </DeviceProvider>
    </ThemeProvider>
  );
};

export default App;
