import * as React from "react";
import { Box, Container, Typography, Paper } from "@mui/material";
import { Line } from "react-chartjs-2";
import { ref, onValue } from "firebase/database";
import { database } from "../config/firebase";
import { useDevice } from "../components/DeviceProvider";

interface SensorData {
  timestamp: number;
  value: number;
  formatted_time: string;
}

function TemperaturePage() {
  const { selectedDevice } = useDevice();
  const [temperatureHistory, setTemperatureHistory] = React.useState<
    SensorData[]
  >([]);
  const [currentTemperature, setCurrentTemperature] = React.useState<number>(0);
  const [error, setError] = React.useState<string | null>(null);
  const [temperatureThreshold, setTemperatureThreshold] = React.useState({
    min: 15,
    max: 35,
  });

  React.useEffect(() => {
    if (!selectedDevice) return;
    const dataRef = ref(database, `${selectedDevice}/data`);
    const unsubscribe = onValue(
      dataRef,
      (snapshot) => {
        const data = snapshot.val();
        if (!data) {
          setTemperatureHistory([]);
          setCurrentTemperature(0);
          return;
        }
        const arr = Object.values(data)
          .map((entry: any) => ({
            value: entry.temperature,
            timestamp: entry.timestamp,
            formatted_time: entry.formatted_time,
          }))
          .sort((a, b) => a.timestamp - b.timestamp);
        setTemperatureHistory(arr);
        if (arr.length > 0) {
          setCurrentTemperature(arr[arr.length - 1].value);
        }
      },
      (error) => {
        console.error("Error fetching temperature data:", error);
        setError("Failed to fetch temperature data");
      }
    );
    return () => unsubscribe();
  }, [selectedDevice]);

  React.useEffect(() => {
    const settingsRef = ref(database, "settings/temperatureThreshold");
    const unsubscribe = onValue(settingsRef, (snapshot) => {
      if (snapshot.exists()) setTemperatureThreshold(snapshot.val());
    });
    return () => unsubscribe();
  }, []);

  const chartData = {
    labels: temperatureHistory.map((data: SensorData) => data.formatted_time),
    datasets: [
      {
        label: "Temperature (°C)",
        data: temperatureHistory.map((data: SensorData) => data.value),
        borderColor: "rgb(255, 99, 132)",
        backgroundColor: "rgba(255, 99, 132, 0.5)",
        tension: 0.4,
        pointRadius: 0,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: "top" as const,
      },
      title: {
        display: true,
        text: "Temperature History",
      },
    },
    scales: {
      y: {
        beginAtZero: false,
        title: {
          display: true,
          text: "Temperature (°C)",
        },
      },
      x: {
        title: {
          display: true,
          text: "Time",
        },
      },
    },
  };

  return (
    <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Temperature Monitoring
      </Typography>

      <Box
        sx={{
          display: "grid",
          gap: 3,
          gridTemplateColumns: { xs: "1fr", md: "repeat(2, 1fr)" },
        }}
      >
        <Paper elevation={3} sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom>
            Current Temperature
          </Typography>
          <Typography variant="h3" color="primary">
            {currentTemperature}°C
          </Typography>
        </Paper>

        <Paper
          elevation={3}
          sx={{
            p: 3,
            bgcolor:
              currentTemperature > temperatureThreshold.max
                ? "error.main"
                : currentTemperature < temperatureThreshold.min
                ? "warning.main"
                : "success.main",
            color: "white",
          }}
        >
          <Typography variant="h6" gutterBottom>
            Status
          </Typography>
          <Typography
            variant="body1"
            color={
              currentTemperature > temperatureThreshold.max
                ? "error"
                : currentTemperature < temperatureThreshold.min
                ? "warning"
                : "success"
            }
          >
            {currentTemperature > temperatureThreshold.max
              ? "Temperature too high"
              : currentTemperature < temperatureThreshold.min
              ? "Temperature too low"
              : "Temperature normal"}
          </Typography>
          <Typography variant="body2" sx={{ mt: 1 }}>
            {currentTemperature > temperatureThreshold.max
              ? "The temperature is above the threshold."
              : currentTemperature < temperatureThreshold.min
              ? "The temperature is below the threshold."
              : "The temperature is within the normal range."}
          </Typography>
        </Paper>
      </Box>

      <Paper elevation={3} sx={{ p: 3, mt: 3 }}>
        <Line data={chartData} options={chartOptions} />
      </Paper>

      {error && (
        <Paper elevation={3} sx={{ p: 2, mt: 3, bgcolor: "error.light" }}>
          <Typography color="error">{error}</Typography>
        </Paper>
      )}
    </Container>
  );
}

export default TemperaturePage;
