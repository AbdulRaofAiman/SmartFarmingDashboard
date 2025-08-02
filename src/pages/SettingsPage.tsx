import React, { useState, useEffect } from "react";
import {
  Container,
  Typography,
  Paper,
  Box,
  TextField,
  Button,
  Switch,
  FormControlLabel,
  Alert,
  Snackbar,
} from "@mui/material";
import { ref, onValue, set } from "firebase/database";
import { database } from "../config/firebase";
import { useDevice } from "../components/DeviceProvider";

interface Settings {
  humidityThreshold: {
    min: number;
    max: number;
  };
  temperatureThreshold: {
    min: number;
    max: number;
  };
  soilMoistureThreshold: {
    min: number;
    max: number;
  };
}

const SettingsPage: React.FC = () => {
  const { selectedDevice } = useDevice();
  const [settings, setSettings] = useState<Settings>({
    humidityThreshold: { min: 40, max: 80 },
    temperatureThreshold: { min: 15, max: 30 },
    soilMoistureThreshold: { min: 30, max: 70 },
  });
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    const settingsRef = ref(database, "settings");
    const unsubscribe = onValue(
      settingsRef,
      (snapshot) => {
        if (snapshot.exists()) {
          // Remove autoMode if present in the database
          const { autoMode, ...rest } = snapshot.val();
          setSettings(rest);
        }
      },
      (error) => {
        console.error("Error fetching settings:", error);
        setError("Failed to fetch settings");
      }
    );

    return () => unsubscribe();
  }, [selectedDevice]);

  const handleSave = async () => {
    try {
      const settingsRef = ref(database, "settings");
      await set(settingsRef, settings);
      setSuccess("Settings saved successfully");
    } catch (error) {
      console.error("Error saving settings:", error);
      setError("Failed to save settings");
    }
  };

  const handleChange = (field: keyof Settings, value: any) => {
    setSettings((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  return (
    <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        System Settings
      </Typography>

      <Paper elevation={3} sx={{ p: 3 }}>
        <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
          <Typography variant="h6">Threshold Settings</Typography>

          <Box
            sx={{
              display: "grid",
              gap: 3,
              gridTemplateColumns: { xs: "1fr", md: "repeat(3, 1fr)" },
            }}
          >
            {/* Humidity Thresholds */}
            <Box>
              <Typography variant="subtitle1" gutterBottom>
                Humidity Thresholds (%)
              </Typography>
              <Box sx={{ display: "flex", gap: 2 }}>
                <TextField
                  label="Min"
                  type="number"
                  value={settings.humidityThreshold.min}
                  onChange={(e) =>
                    handleChange("humidityThreshold", {
                      ...settings.humidityThreshold,
                      min: Number(e.target.value),
                    })
                  }
                  fullWidth
                />
                <TextField
                  label="Max"
                  type="number"
                  value={settings.humidityThreshold.max}
                  onChange={(e) =>
                    handleChange("humidityThreshold", {
                      ...settings.humidityThreshold,
                      max: Number(e.target.value),
                    })
                  }
                  fullWidth
                />
              </Box>
            </Box>

            {/* Temperature Thresholds */}
            <Box>
              <Typography variant="subtitle1" gutterBottom>
                Temperature Thresholds (°C)
              </Typography>
              <Box sx={{ display: "flex", gap: 2 }}>
                <TextField
                  label="Min"
                  type="number"
                  value={settings.temperatureThreshold.min}
                  onChange={(e) =>
                    handleChange("temperatureThreshold", {
                      ...settings.temperatureThreshold,
                      min: Number(e.target.value),
                    })
                  }
                  fullWidth
                />
                <TextField
                  label="Max"
                  type="number"
                  value={settings.temperatureThreshold.max}
                  onChange={(e) =>
                    handleChange("temperatureThreshold", {
                      ...settings.temperatureThreshold,
                      max: Number(e.target.value),
                    })
                  }
                  fullWidth
                />
              </Box>
            </Box>

            {/* Soil Moisture Thresholds */}
            <Box>
              <Typography variant="subtitle1" gutterBottom>
                Soil Moisture Thresholds (raw value)
              </Typography>
              <Box sx={{ display: "flex", gap: 2 }}>
                <TextField
                  label="Min"
                  type="number"
                  value={settings.soilMoistureThreshold.min}
                  onChange={(e) =>
                    handleChange("soilMoistureThreshold", {
                      ...settings.soilMoistureThreshold,
                      min: Number(e.target.value),
                    })
                  }
                  fullWidth
                />
                <TextField
                  label="Max"
                  type="number"
                  value={settings.soilMoistureThreshold.max}
                  onChange={(e) =>
                    handleChange("soilMoistureThreshold", {
                      ...settings.soilMoistureThreshold,
                      max: Number(e.target.value),
                    })
                  }
                  fullWidth
                />
              </Box>
            </Box>
          </Box>

          <Alert severity="info">
            Changing these thresholds will affect the status cards on the
            Humidity, Temperature, and Soil Moisture monitoring pages.
          </Alert>

          {/* Removed Automatic Mode Switch */}

          <Button
            variant="contained"
            color="primary"
            onClick={handleSave}
            sx={{ alignSelf: "flex-start" }}
          >
            Save Settings
          </Button>
        </Box>
      </Paper>

      <Snackbar
        open={!!error || !!success}
        autoHideDuration={6000}
        onClose={() => {
          setError(null);
          setSuccess(null);
        }}
      >
        <Alert
          onClose={() => {
            setError(null);
            setSuccess(null);
          }}
          severity={error ? "error" : "success"}
          sx={{ width: "100%" }}
        >
          {error || success}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default SettingsPage;
