import React from "react";
import { Box, Container, Typography, Paper } from "@mui/material";
import { Line } from "react-chartjs-2";
import { ref, onValue } from "firebase/database";
import { database } from "../config/firebase";
import { useState, useEffect } from "react";
import { useDevice } from "../components/DeviceProvider";
import "../config/chartConfig"; // Import Chart.js configuration

interface SensorData {
  timestamp: number;
  value: number;
  formatted_time: string;
}

const HumidityPage: React.FC = () => {
  const { selectedDevice } = useDevice();
  const [humidityHistory, setHumidityHistory] = useState<SensorData[]>([]);
  const [currentHumidity, setCurrentHumidity] = useState<number>(0);
  const [error, setError] = useState<string | null>(null);
  const [humidityThreshold, setHumidityThreshold] = useState({
    min: 40,
    max: 70,
  });

  useEffect(() => {
    if (!selectedDevice) return;
    const dataRef = ref(database, `${selectedDevice}/data`);
    const unsubscribe = onValue(
      dataRef,
      (snapshot) => {
        const data = snapshot.val();
        if (!data) {
          setHumidityHistory([]);
          setCurrentHumidity(0);
          return;
        }
        const arr = Object.values(data)
          .map((entry: any) => ({
            value: entry.humidity,
            timestamp: entry.timestamp,
            formatted_time: entry.formatted_time,
          }))
          .sort((a, b) => a.timestamp - b.timestamp);
        setHumidityHistory(arr);
        if (arr.length > 0) {
          setCurrentHumidity(arr[arr.length - 1].value);
        }
      },
      (error) => {
        console.error("Error fetching humidity data:", error);
        setError("Failed to fetch humidity data");
      }
    );
    return () => unsubscribe();
  }, [selectedDevice]);

  useEffect(() => {
    const settingsRef = ref(database, "settings/humidityThreshold");
    const unsubscribe = onValue(settingsRef, (snapshot) => {
      if (snapshot.exists()) setHumidityThreshold(snapshot.val());
    });
    return () => unsubscribe();
  }, []);

  const chartData = {
    labels: humidityHistory.map((data) => data.formatted_time),
    datasets: [
      {
        label: "Humidity (%)",
        data: humidityHistory.map((data) => data.value),
        borderColor: "rgb(75, 192, 192)",
        backgroundColor: "rgba(75, 192, 192, 0.5)",
        tension: 0.4,
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
        text: "Humidity History",
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        max: 100,
        title: {
          display: true,
          text: "Humidity (%)",
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
        Humidity Monitoring
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
            Current Humidity
          </Typography>
          <Typography variant="h3" color="primary">
            {currentHumidity}%
          </Typography>
        </Paper>

        <Paper
          elevation={3}
          sx={{
            p: 3,
            bgcolor:
              currentHumidity < humidityThreshold.min ||
              currentHumidity > humidityThreshold.max
                ? "error.main"
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
              currentHumidity > humidityThreshold.max
                ? "error"
                : currentHumidity < humidityThreshold.min
                ? "warning"
                : "success"
            }
          >
            {currentHumidity > humidityThreshold.max
              ? "Humidity too high"
              : currentHumidity < humidityThreshold.min
              ? "Humidity too low"
              : "Humidity normal"}
          </Typography>
        </Paper>
      </Box>

      <Paper elevation={3} sx={{ p: 3, mt: 3 }}>
        <Line 
          key={`humidity-${selectedDevice}`}
          data={chartData} 
          options={chartOptions} 
        />
      </Paper>

      {error && (
        <Paper elevation={3} sx={{ p: 2, mt: 3, bgcolor: "error.light" }}>
          <Typography color="error">{error}</Typography>
        </Paper>
      )}
    </Container>
  );
};

export default HumidityPage;
