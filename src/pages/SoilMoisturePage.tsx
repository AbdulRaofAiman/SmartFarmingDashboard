import React from "react";
import { Box, Container, Typography, Paper } from "@mui/material";
import { Line } from "react-chartjs-2";
import "../config/chartConfig"; // Import Chart.js configuration
import { ref, onValue } from "firebase/database";
import { database } from "../config/firebase";
import { useState, useEffect } from "react";
import { useDevice } from "../components/DeviceProvider";

interface SensorData {
  timestamp: number;
  value: number;
  formatted_time: string;
}

const SoilMoisturePage: React.FC = () => {
  const { selectedDevice } = useDevice();
  const [soilMoistureHistory, setSoilMoistureHistory] = useState<SensorData[]>(
    []
  );
  const [currentSoilMoisture, setCurrentSoilMoisture] = useState<number>(0);
  const [error, setError] = useState<string | null>(null);
  const [soilMoistureThreshold, setSoilMoistureThreshold] = useState({
    min: 1200,
    max: 3500,
  });

  useEffect(() => {
    if (!selectedDevice) return;
    const dataRef = ref(database, `${selectedDevice}/data`);
    const unsubscribe = onValue(
      dataRef,
      (snapshot) => {
        const data = snapshot.val();
        if (!data) {
          setSoilMoistureHistory([]);
          setCurrentSoilMoisture(0);
          return;
        }
        const arr = Object.values(data)
          .map((entry: any) => ({
            value: entry.moisture,
            timestamp: entry.timestamp,
            formatted_time: entry.formatted_time,
          }))
          .sort((a, b) => a.timestamp - b.timestamp);
        setSoilMoistureHistory(arr);
        if (arr.length > 0) {
          setCurrentSoilMoisture(arr[arr.length - 1].value);
        }
      },
      (error) => {
        console.error("Error fetching soil moisture data:", error);
        setError("Failed to fetch soil moisture data");
      }
    );
    return () => unsubscribe();
  }, [selectedDevice]);

  useEffect(() => {
    const settingsRef = ref(database, "settings/soilMoistureThreshold");
    const unsubscribe = onValue(settingsRef, (snapshot) => {
      if (snapshot.exists()) setSoilMoistureThreshold(snapshot.val());
    });
    return () => unsubscribe();
  }, []);

  const chartData = {
    labels: soilMoistureHistory.map((data) => data.formatted_time),
    datasets: [
      {
        label: "Soil Moisture (raw value)",
        data: soilMoistureHistory.map((data) => data.value),
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
        text: "Soil Moisture History",
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        max: 4095,
        title: {
          display: true,
          text: "Soil Moisture (raw value)",
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
        Soil Moisture Monitoring
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
            Current Soil Moisture
          </Typography>
          <Typography variant="h3" color="primary">
            {currentSoilMoisture}
          </Typography>
        </Paper>

        <Paper
          elevation={3}
          sx={{
            p: 3,
            bgcolor:
              currentSoilMoisture < soilMoistureThreshold.min ||
              currentSoilMoisture > soilMoistureThreshold.max
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
              currentSoilMoisture > soilMoistureThreshold.max
                ? "error"
                : currentSoilMoisture < soilMoistureThreshold.min
                ? "warning"
                : "success"
            }
          >
            {currentSoilMoisture > soilMoistureThreshold.max
              ? "Soil moisture too high"
              : currentSoilMoisture < soilMoistureThreshold.min
              ? "Soil moisture too low"
              : "Soil moisture normal"}
          </Typography>
        </Paper>
      </Box>

      <Paper elevation={3} sx={{ p: 3, mt: 3 }}>
        <Line 
          key={`soil-moisture-${selectedDevice}`}
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

export default SoilMoisturePage;
