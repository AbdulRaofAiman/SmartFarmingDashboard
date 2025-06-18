import React, { useEffect, useState, useRef, useCallback, memo } from "react";
import {
  Box,
  Container,
  Paper,
  Typography,
  Switch,
  FormControlLabel,
  CircularProgress,
  Alert,
  Grid as MuiGrid,
  useTheme,
  Button,
  Stack,
} from "@mui/material";
import { styled } from "@mui/material/styles";
import { ref, onValue, set, get, serverTimestamp } from "firebase/database";
import { database, auth, signIn } from "../config/firebase";
import { Line } from "react-chartjs-2";
import { Chart as ChartJS } from "chart.js/auto";
import {
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  TimeScale,
  ChartOptions,
  Filler,
} from "chart.js";
import "chartjs-adapter-date-fns";
import { enUS } from "date-fns/locale";
import { _adapters } from "chart.js";
import { initializeDatabase } from "../config/initializeDatabase";
import { FirebaseError } from "firebase/app";
import { onAuthStateChanged } from "firebase/auth";
import { PowerSettingsNew as PowerIcon, Circle } from "@mui/icons-material";
import { useDevice } from "./DeviceProvider";

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  TimeScale,
  Filler
);

// Configure Chart.js defaults
ChartJS.defaults.locale = "en-US";

const Item = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(2),
  textAlign: "center",
  color: theme.palette.text.secondary,
  height: "100%",
  display: "flex",
  flexDirection: "column",
  justifyContent: "center",
  transition: "all 0.3s ease-in-out",
  "&:hover": {
    transform: "translateY(-2px)",
    boxShadow: theme.shadows[4],
  },
}));

const ChartContainer = styled(Box)(({ theme }) => ({
  height: "300px",
  width: "100%",
  position: "relative",
  overflow: "hidden",
  borderRadius: theme.shape.borderRadius,
  backgroundColor: theme.palette.background.paper,
  transition: "all 0.3s ease-in-out",
  "&:hover": {
    boxShadow: theme.shadows[4],
  },
}));

const StatusIndicator = styled(Box)<{
  status: "normal" | "warning" | "critical";
}>(({ theme, status }) => ({
  width: "12px",
  height: "12px",
  borderRadius: "50%",
  marginRight: theme.spacing(1),
  backgroundColor:
    status === "normal"
      ? theme.palette.success.main
      : status === "warning"
      ? theme.palette.warning.main
      : theme.palette.error.main,
  boxShadow: `0 0 8px ${
    status === "normal"
      ? theme.palette.success.main
      : status === "warning"
      ? theme.palette.warning.main
      : theme.palette.error.main
  }`,
  transition: "all 0.3s ease-in-out",
}));

interface SensorData {
  timestamp: number;
  value: number;
  formatted_time: string;
}

// Separate component for the chart
const HumidityChart = memo(
  ({ data, error }: { data: SensorData[]; error: string | null }) => {
    const theme = useTheme();
    const getStatus = (value: number) => {
      if (value < 30) return "critical";
      if (value < 50) return "warning";
      return "normal";
    };

    const latestValue = data.length > 0 ? data[data.length - 1].value : 0;
    const status = getStatus(latestValue);

    const chartData = {
      labels: data.map((d) => d.formatted_time),
      datasets: [
        {
          label: "Humidity (%)",
          data: data.map((d) => d.value),
          borderColor: theme.palette.primary.main,
          backgroundColor: theme.palette.primary.light + "40",
          tension: 0.4,
          fill: true,
          pointBackgroundColor: data.map((d) =>
            getStatus(d.value) === "normal"
              ? theme.palette.success.main
              : getStatus(d.value) === "warning"
              ? theme.palette.warning.main
              : theme.palette.error.main
          ),
          pointRadius: 4,
          pointHoverRadius: 6,
        },
      ],
    };

    const chartOptions = {
      responsive: true,
      maintainAspectRatio: false,
      animation: {
        duration: 750,
        easing: "easeInOutQuad" as const,
      },
      interaction: {
        intersect: false,
        mode: "index" as const,
      },
      scales: {
        y: {
          beginAtZero: true,
          max: 100,
          grid: {
            color: theme.palette.divider,
          },
          title: {
            display: true,
            text: "Humidity (%)",
            color: theme.palette.text.secondary,
          },
        },
        x: {
          grid: {
            color: theme.palette.divider,
          },
          title: {
            display: true,
            text: "Time",
            color: theme.palette.text.secondary,
          },
        },
      },
      plugins: {
        legend: {
          display: false,
        },
        tooltip: {
          backgroundColor: theme.palette.background.paper,
          titleColor: theme.palette.text.primary,
          bodyColor: theme.palette.text.secondary,
          borderColor: theme.palette.divider,
          borderWidth: 1,
          padding: 12,
          boxPadding: 6,
          usePointStyle: true,
          callbacks: {
            label: (context: any) => {
              const value = context.raw;
              const status = getStatus(value);
              return [
                `Humidity: ${value}%`,
                `Status: ${status.charAt(0).toUpperCase() + status.slice(1)}`,
              ];
            },
          },
        },
      },
    };

    return (
      <Item elevation={2}>
        <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
          <StatusIndicator status={getStatus(latestValue)} />
          <Typography variant="h6" color="textPrimary">
            Humidity History
          </Typography>
          <Typography
            variant="h6"
            color={
              getStatus(latestValue) === "normal"
                ? "success.main"
                : getStatus(latestValue) === "warning"
                ? "warning.main"
                : "error.main"
            }
            sx={{ ml: "auto" }}
          >
            {latestValue}%
          </Typography>
        </Box>
        <ChartContainer>
          <Line data={chartData} options={chartOptions} />
          {error && (
            <Typography
              color="error"
              sx={{
                position: "absolute",
                top: "50%",
                left: "50%",
                transform: "translate(-50%, -50%)",
                backgroundColor: "rgba(255, 255, 255, 0.9)",
                padding: 1,
                borderRadius: 1,
              }}
            >
              {error}
            </Typography>
          )}
        </ChartContainer>
      </Item>
    );
  }
);

HumidityChart.displayName = "HumidityChart";

// Separate component for soil moisture chart
const SoilMoistureChart = memo(
  ({ data, error }: { data: SensorData[]; error: string | null }) => {
    const theme = useTheme();
    const getStatus = (value: number) => {
      if (value < 20) return "critical";
      if (value < 40) return "warning";
      return "normal";
    };

    const latestValue = data.length > 0 ? data[data.length - 1].value : 0;
    const status = getStatus(latestValue);

    const chartData = {
      labels: data.map((d) => d.formatted_time),
      datasets: [
        {
          label: "Soil Moisture (%)",
          data: data.map((d) => d.value),
          borderColor: theme.palette.secondary.main,
          backgroundColor: theme.palette.secondary.light + "40",
          tension: 0.4,
          fill: true,
          pointBackgroundColor: data.map((d) =>
            getStatus(d.value) === "normal"
              ? theme.palette.success.main
              : getStatus(d.value) === "warning"
              ? theme.palette.warning.main
              : theme.palette.error.main
          ),
          pointRadius: 4,
          pointHoverRadius: 6,
        },
      ],
    };

    const chartOptions = {
      responsive: true,
      maintainAspectRatio: false,
      animation: {
        duration: 750,
        easing: "easeInOutQuad" as const,
      },
      interaction: {
        intersect: false,
        mode: "index" as const,
      },
      scales: {
        y: {
          beginAtZero: true,
          max: 4095,
          grid: {
            color: theme.palette.divider,
          },
          title: {
            display: true,
            text: "Soil Moisture (raw value)",
            color: theme.palette.text.secondary,
          },
        },
        x: {
          grid: {
            color: theme.palette.divider,
          },
          title: {
            display: true,
            text: "Time",
            color: theme.palette.text.secondary,
          },
        },
      },
      plugins: {
        legend: {
          display: false,
        },
        tooltip: {
          backgroundColor: theme.palette.background.paper,
          titleColor: theme.palette.text.primary,
          bodyColor: theme.palette.text.secondary,
          borderColor: theme.palette.divider,
          borderWidth: 1,
          padding: 12,
          boxPadding: 6,
          usePointStyle: true,
          callbacks: {
            label: (context: any) => {
              const value = context.raw;
              const status = getStatus(value);
              return [
                `Soil Moisture: ${value}`,
                `Status: ${status.charAt(0).toUpperCase() + status.slice(1)}`,
              ];
            },
          },
        },
      },
    };

    return (
      <Item elevation={2}>
        <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
          <StatusIndicator status={getStatus(latestValue)} />
          <Typography variant="h6" color="textPrimary">
            Soil Moisture History
          </Typography>
          <Typography
            variant="h6"
            color={
              getStatus(latestValue) === "normal"
                ? "success.main"
                : getStatus(latestValue) === "warning"
                ? "warning.main"
                : "error.main"
            }
            sx={{ ml: "auto" }}
          >
            {latestValue}
          </Typography>
        </Box>
        <ChartContainer>
          <Line data={chartData} options={chartOptions} />
          {error && (
            <Typography
              color="error"
              sx={{
                position: "absolute",
                top: "50%",
                left: "50%",
                transform: "translate(-50%, -50%)",
                backgroundColor: "rgba(255, 255, 255, 0.9)",
                padding: 1,
                borderRadius: 1,
              }}
            >
              {error}
            </Typography>
          )}
        </ChartContainer>
      </Item>
    );
  }
);

SoilMoistureChart.displayName = "SoilMoistureChart";

export function Dashboard() {
  const { devices, selectedDevice, setSelectedDevice } = useDevice();
  const [soilMoisture, setSoilMoisture] = useState<number>(0);
  const [humidity, setHumidity] = useState<number>(0);
  const [pumpMode, setPumpMode] = useState<"auto" | "manual">("manual");
  const [pumpStatus, setPumpStatus] = useState<boolean | "on" | "off" | "auto">(
    false
  );
  const [soilMoistureHistory, setSoilMoistureHistory] = useState<SensorData[]>(
    []
  );
  const [humidityHistory, setHumidityHistory] = useState<SensorData[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const soilMoistureChartRef = useRef<ChartJS<"line"> | null>(null);
  const humidityChartRef = useRef<ChartJS<"line"> | null>(null);
  const chartContainerRef = useRef<HTMLCanvasElement>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const mountedRef = useRef(true);
  const humidityRef = useRef(ref(database, "humidity"));
  const humidityUnsubscribeRef = useRef<(() => void) | null>(null);
  const [humidityData, setHumidityData] = useState<SensorData[]>([]);
  const [soilMoistureData, setSoilMoistureData] = useState<SensorData[]>([]);
  const soilMoistureRef = useRef(ref(database, "soilMoisture"));
  const soilMoistureUnsubscribeRef = useRef<(() => void) | null>(null);
  const [isManualMode, setIsManualMode] = useState(false);
  const [manualPumpStatus, setManualPumpStatus] = useState<"on" | "off">("off");
  const [deviceData, setDeviceData] = useState<any[]>([]);
  const [deviceHumidity, setDeviceHumidity] = useState<SensorData[]>([]);
  const [deviceMoisture, setDeviceMoisture] = useState<SensorData[]>([]);

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    animation: {
      duration: 0, // Disable animations for better performance
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

  useEffect(() => {
    // Set mounted ref to true when component mounts
    mountedRef.current = true;

    const waitForAuth = async () => {
      try {
        console.log("Waiting for authentication...");

        // Try to sign in if not already authenticated
        const signedIn = await signIn();
        if (!signedIn) {
          console.error("Failed to sign in anonymously");
          if (mountedRef.current) {
            setError("Authentication failed. Please refresh the page.");
            setLoading(false);
          }
          return false;
        }

        // Wait for auth state to be confirmed
        return new Promise<boolean>((resolve) => {
          const unsubscribe = onAuthStateChanged(auth, (user) => {
            if (user) {
              console.log("User authenticated:", user.uid);
              if (mountedRef.current) {
                setIsAuthenticated(true);
              }
              unsubscribe();
              resolve(true);
            }
          });
        });
      } catch (error) {
        console.error("Error in authentication:", error);
        if (mountedRef.current) {
          setError("Authentication failed. Please refresh the page.");
          setLoading(false);
        }
        return false;
      }
    };

    const testDatabaseAccess = async () => {
      try {
        console.log("Testing basic database access...");

        // Try to read the root node
        const rootRef = ref(database, "/");
        console.log("Attempting to read root node...");
        const rootSnapshot = await get(rootRef);
        console.log("Root node data:", rootSnapshot.val());

        // Try to write a test value
        const testRef = ref(database, "test_access");
        console.log("Attempting to write test value...");
        await set(testRef, { test: true, timestamp: Date.now() });
        console.log("Test write successful");

        // Try to read the test value back
        const testSnapshot = await get(testRef);
        console.log("Test read successful:", testSnapshot.val());

        // Clean up test data
        await set(testRef, null);
        console.log("Test data cleaned up");

        return true;
      } catch (error) {
        console.error("Database access test failed:", error);
        if (error instanceof FirebaseError) {
          console.error("Firebase error details:", {
            code: error.code,
            message: error.message,
            name: error.name,
            stack: error.stack,
          });
          if (mountedRef.current) {
            setError(`Database access error: ${error.message} (${error.code})`);
          }
        } else {
          console.error("Unknown error:", error);
          if (mountedRef.current) {
            setError(
              "Failed to access database. Please check your connection and permissions."
            );
          }
        }
        return false;
      }
    };

    const initializeDashboard = async () => {
      try {
        if (mountedRef.current) {
          setLoading(true);
          setError(null);
        }

        console.log("Starting dashboard initialization...");
        console.log("Database URL:", database.app.options.databaseURL);

        // Test basic database access first
        const canAccessDatabase = await testDatabaseAccess();
        if (!canAccessDatabase) {
          console.error("Database access test failed");
          if (mountedRef.current) {
            setLoading(false);
          }
          return;
        }

        console.log(
          "Basic database access verified, proceeding with initialization..."
        );

        // Initialize database structure
        const structureInitialized = await initializeDatabaseStructure();
        if (!structureInitialized) {
          if (mountedRef.current) {
            setError(
              "Failed to initialize database structure. Please check your permissions."
            );
            setLoading(false);
          }
          return;
        }

        // Wait for authentication first
        const authenticated = await waitForAuth();
        if (!authenticated) {
          console.error("Authentication failed, cannot initialize dashboard");
          return;
        }

        console.log(
          "Authentication successful, proceeding with initialization..."
        );

        // Test database connection first
        const testRef = ref(database, ".info/connected");
        console.log("Setting up connection test...");

        const testUnsubscribe = onValue(
          testRef,
          (snapshot) => {
            if (!mountedRef.current) return;

            const connected = snapshot.val();
            console.log("Database connection status:", connected);

            if (connected === false) {
              console.error("Firebase connection lost");
              if (mountedRef.current) {
                setError(
                  "Lost connection to database. Please check your internet connection."
                );
                setLoading(false);
              }
            } else if (connected === true) {
              console.log("Successfully connected to Firebase database");
              // Try to read a test value to verify access
              const testDataRef = ref(database, "test");
              get(testDataRef)
                .then((snapshot) => {
                  console.log(
                    "Database access verified:",
                    snapshot.exists() ? "Data exists" : "No data"
                  );
                  if (mountedRef.current) {
                    setLoading(false);
                  }
                })
                .catch((error) => {
                  console.error("Database access test failed:", error);
                  if (mountedRef.current) {
                    setError(
                      "Cannot access database. Please check your permissions."
                    );
                    setLoading(false);
                  }
                });
            }
          },
          (error) => {
            console.error("Connection test error:", {
              error,
              code: error instanceof FirebaseError ? error.code : "unknown",
              message:
                error instanceof FirebaseError
                  ? error.message
                  : error.toString(),
            });
            if (mountedRef.current) {
              setError(
                "Failed to connect to database. Please check your internet connection."
              );
              setLoading(false);
            }
          }
        );

        // Set up listeners for data only after connection is confirmed
        console.log("Setting up data listeners...");

        // Humidity listener
        console.log("Setting up humidity listener...");

        // Update humidity data subscription
        console.log("Setting up humidity data subscription...");
        humidityUnsubscribeRef.current = onValue(
          humidityRef.current,
          (snapshot) => {
            if (!mountedRef.current) return;

            console.log("Received humidity data update");
            const data = snapshot.val();
            console.log("Humidity data:", data);

            if (!data) {
              console.log("No humidity data available");
              if (mountedRef.current) {
                setHumidityData([]);
                setError(null);
              }
              return;
            }

            try {
              // Convert object to array and sort by timestamp
              const humidityArray = Object.values(data) as SensorData[];
              humidityArray.sort((a, b) => a.timestamp - b.timestamp);

              // Keep only the last 20 readings
              const recentData = humidityArray.slice(-20);

              if (mountedRef.current) {
                setHumidityData(recentData);
                setError(null);
              }
            } catch (error) {
              console.error("Error processing humidity data:", error);
              if (mountedRef.current) {
                setError(
                  "Error processing humidity data. Please check the data format."
                );
              }
            }
          },
          (error) => {
            console.error("Error in humidity subscription:", error);
            if (mountedRef.current) {
              setError(`Failed to fetch humidity data: ${error.message}`);
            }
          }
        );

        // Update soil moisture data subscription
        soilMoistureUnsubscribeRef.current = onValue(
          soilMoistureRef.current,
          (snapshot) => {
            if (!mountedRef.current) return;

            console.log("Received soil moisture data update");
            const data = snapshot.val();
            console.log("Soil moisture data:", data);

            if (!data) {
              console.log("No soil moisture data available");
              if (mountedRef.current) {
                setSoilMoistureData([]);
                setError(null);
              }
              return;
            }

            try {
              // Convert object to array and sort by timestamp
              const moistureArray = Object.values(data) as SensorData[];
              moistureArray.sort((a, b) => a.timestamp - b.timestamp);

              // Keep only the last 20 readings
              const recentData = moistureArray.slice(-20);

              if (mountedRef.current) {
                setSoilMoistureData(recentData);
                setError(null);
              }
            } catch (error) {
              console.error("Error processing soil moisture data:", error);
              if (mountedRef.current) {
                setError(
                  "Error processing soil moisture data. Please check the data format."
                );
              }
            }
          },
          (error) => {
            console.error("Error in soil moisture subscription:", error);
            if (mountedRef.current) {
              setError(`Failed to fetch soil moisture data: ${error.message}`);
            }
          }
        );

        // Cleanup function
        return () => {
          console.log("Cleaning up dashboard...");
          mountedRef.current = false;
          testUnsubscribe();
          if (humidityUnsubscribeRef.current) {
            humidityUnsubscribeRef.current();
          }
          if (soilMoistureUnsubscribeRef.current) {
            soilMoistureUnsubscribeRef.current();
          }
        };
      } catch (error) {
        console.error("Error in useEffect:", error);
        if (error instanceof FirebaseError) {
          console.error("Firebase error:", {
            code: error.code,
            message: error.message,
            path: "humidity",
          });
        } else if (error instanceof Error) {
          console.error("Error details:", {
            name: error.name,
            message: error.message,
            stack: error.stack,
          });
        }
        if (mountedRef.current) {
          setError(
            "Failed to initialize dashboard. Please check the console for details."
          );
          setLoading(false);
        }
      }
    };

    initializeDashboard();
  }, []);

  useEffect(() => {
    const cleanup = () => {
      if (soilMoistureChartRef.current) {
        soilMoistureChartRef.current.destroy();
        soilMoistureChartRef.current = null;
      }
      if (humidityChartRef.current) {
        humidityChartRef.current.destroy();
        humidityChartRef.current = null;
      }
    };

    // Clean up charts before updating data
    cleanup();

    return cleanup;
  }, [soilMoistureHistory, humidityHistory]);

  const handlePumpToggle = async () => {
    if (!isManualMode) return;

    const newStatus = manualPumpStatus === "on" ? "off" : "on";
    setManualPumpStatus(newStatus);

    try {
      const pumpRef = ref(database, "pump");
      await set(pumpRef, {
        status: newStatus,
        mode: "manual",
        lastUpdated: serverTimestamp(),
      });
      console.log(`Pump turned ${newStatus} in manual mode`);
    } catch (error) {
      console.error("Error updating pump status:", error);
      setError("Failed to update pump status");
      setManualPumpStatus(manualPumpStatus);
    }
  };

  const handleModeToggle = async () => {
    const newMode = !isManualMode;
    setIsManualMode(newMode);

    try {
      const pumpRef = ref(database, "pump");
      await set(pumpRef, {
        status: newMode ? manualPumpStatus : "auto",
        mode: newMode ? "manual" : "auto",
        lastUpdated: serverTimestamp(),
      });
      console.log(`Pump mode changed to ${newMode ? "manual" : "auto"}`);
    } catch (error) {
      console.error("Error updating pump mode:", error);
      setError("Failed to update pump mode");
      setIsManualMode(!newMode);
    }
  };

  // Update the pump status subscription
  useEffect(() => {
    const pumpRef = ref(database, "pump");
    const pumpUnsubscribe = onValue(
      pumpRef,
      (snapshot) => {
        if (snapshot.exists()) {
          const pumpData = snapshot.val();
          setPumpStatus(pumpData.status);
          setIsManualMode(pumpData.mode === "manual");
          if (pumpData.mode === "manual") {
            setManualPumpStatus(
              typeof pumpData.status === "boolean"
                ? pumpData.status
                  ? "on"
                  : "off"
                : pumpData.status
            );
          }
        }
      },
      (error) => {
        console.error("Error fetching pump status:", error);
        setError("Failed to fetch pump status");
      }
    );

    return () => {
      pumpUnsubscribe();
    };
  }, []);

  const createChartData = (
    data: SensorData[],
    label: string,
    color: string
  ) => ({
    labels: data.map((d) => d.formatted_time),
    datasets: [
      {
        label,
        data: data.map((d) => ({
          x: d.timestamp,
          y: d.value,
        })),
        borderColor: color,
        backgroundColor: color + "33",
        tension: 0.4,
      },
    ],
  });

  const initializeDatabaseStructure = async () => {
    try {
      console.log("Starting database structure initialization...");

      // Initialize humidity data
      const humidityRef = ref(database, "humidity");
      console.log("Checking humidity data...");
      const humiditySnapshot = await get(humidityRef);

      if (!humiditySnapshot.exists()) {
        console.log("Initializing humidity data structure...");
        try {
          await set(humidityRef, []);
          console.log("Humidity data initialized successfully");
        } catch (error) {
          console.error("Failed to initialize humidity data:", error);
          throw error;
        }
      } else {
        console.log("Humidity data already exists");
      }

      // Initialize soil moisture data
      const soilMoistureRef = ref(database, "soilMoisture");
      console.log("Checking soil moisture data...");
      const soilMoistureSnapshot = await get(soilMoistureRef);

      if (!soilMoistureSnapshot.exists()) {
        console.log("Initializing soil moisture data structure...");
        try {
          await set(soilMoistureRef, []);
          console.log("Soil moisture data initialized successfully");
        } catch (error) {
          console.error("Failed to initialize soil moisture data:", error);
          throw error;
        }
      } else {
        console.log("Soil moisture data already exists");
      }

      // Initialize pump data
      const pumpRef = ref(database, "pump");
      console.log("Checking pump data...");
      const pumpSnapshot = await get(pumpRef);

      if (!pumpSnapshot.exists()) {
        console.log("Initializing pump data structure...");
        try {
          await set(pumpRef, {
            mode: "manual",
            status: false,
          });
          console.log("Pump data initialized successfully");
        } catch (error) {
          console.error("Failed to initialize pump data:", error);
          throw error;
        }
      } else {
        console.log("Pump data already exists");
      }

      console.log("Database structure initialization completed successfully");
      return true;
    } catch (error) {
      console.error("Error in database structure initialization:", error);
      if (error instanceof FirebaseError) {
        console.error("Firebase error details:", {
          code: error.code,
          message: error.message,
          name: error.name,
          stack: error.stack,
        });
        setError(`Database error: ${error.message} (${error.code})`);
      } else if (error instanceof Error) {
        console.error("Error details:", {
          name: error.name,
          message: error.message,
          stack: error.stack,
        });
        setError(`Error: ${error.message}`);
      } else {
        console.error("Unknown error:", error);
        setError("An unknown error occurred while initializing the database");
      }
      return false;
    }
  };

  // Fetch data for selected device
  useEffect(() => {
    if (!selectedDevice) return;
    const dataRef = ref(database, `${selectedDevice}/data`);
    const unsubscribe = onValue(
      dataRef,
      (snapshot) => {
        const data = snapshot.val();
        if (!data) {
          setDeviceData([]);
          setDeviceHumidity([]);
          setDeviceMoisture([]);
          return;
        }
        // Convert object to array and sort by timestamp
        const arr = Object.values(data)
          .map((entry: any) => ({
            humidity: entry.humidity,
            moisture: entry.moisture,
            timestamp: entry.timestamp,
            formatted_time: entry.formatted_time,
          }))
          .sort((a, b) => a.timestamp - b.timestamp);
        setDeviceData(arr);
        setDeviceHumidity(
          arr.map((d) => ({
            value: d.humidity,
            timestamp: d.timestamp,
            formatted_time: d.formatted_time,
          }))
        );
        setDeviceMoisture(
          arr.map((d) => ({
            value: d.moisture,
            timestamp: d.timestamp,
            formatted_time: d.formatted_time,
          }))
        );
      },
      (error) => {
        setError("Failed to fetch device data: " + error.message);
      }
    );
    return () => unsubscribe();
  }, [selectedDevice]);

  // Helper to convert "HH:mm:ss" to seconds since midnight
  function timeStringToSeconds(timeStr: string) {
    const [h, m, s] = timeStr.split(":").map(Number);
    return h * 3600 + m * 60 + s;
  }

  const malaysiaNow = new Date(Date.now() + 8 * 60 * 60 * 1000)
    .toISOString()
    .substr(11, 8);

  const latestFormattedTime =
    deviceData.length > 0
      ? deviceData[deviceData.length - 1].formatted_time
      : null;

  let isOnline = false;
  if (latestFormattedTime) {
    const nowSeconds = timeStringToSeconds(malaysiaNow);
    const latestSeconds = timeStringToSeconds(latestFormattedTime);
    isOnline = Math.abs(nowSeconds - latestSeconds) < 3;
  }

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4, textAlign: "center" }}>
        <CircularProgress />
        <Typography variant="h6" sx={{ mt: 2 }}>
          Connecting to database...
        </Typography>
      </Container>
    );
  }

  if (error) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
        <Typography variant="body1" sx={{ mb: 2 }}>
          Please check:
        </Typography>
        <ul>
          <li>Your internet connection is working</li>
          <li>You have access to the Firebase database</li>
          <li>The database rules allow read/write access</li>
        </ul>
        <Typography variant="body2" sx={{ mt: 2, color: "text.secondary" }}>
          If the problem persists, try refreshing the page or contact support.
        </Typography>
      </Container>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Container maxWidth="xl">
        {/* Device Selection Dropdown with Online/Offline Indicator */}
        <Box sx={{ mb: 3, display: "flex", alignItems: "center", gap: 2 }}>
          <Typography variant="h6">Select Device:</Typography>
          <select
            value={selectedDevice}
            onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
              setSelectedDevice(e.target.value)
            }
            style={{ fontSize: "1rem", padding: "0.5rem 1rem" }}
          >
            {devices.map((device: string) => (
              <option key={device} value={device}>
                {device}
              </option>
            ))}
          </select>
        </Box>
        {/* Online/Offline Status Indicator */}
        <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}>
          <Typography variant="h6">Status:</Typography>
          <Circle sx={{ color: isOnline ? "green" : "red", fontSize: 16 }} />
          <Typography variant="body1" color={isOnline ? "green" : "red"}>
            {isOnline ? "Online" : "Offline"}
          </Typography>
        </Box>
        <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
          {/* Current Readings */}
          <Item>
            <Typography variant="h6">Soil Moisture</Typography>
            <Typography variant="h3">
              {deviceMoisture.length > 0
                ? deviceMoisture[deviceMoisture.length - 1].value
                : 0}
            </Typography>
          </Item>
          <Item>
            <Typography variant="h6">Humidity</Typography>
            <Typography variant="h3">
              {deviceHumidity.length > 0
                ? deviceHumidity[deviceHumidity.length - 1].value + "%"
                : "0%"}
            </Typography>
          </Item>

          {/* Charts */}
          <Box sx={{ gridColumn: { xs: "1", md: "span 2" } }}>
            <Item>
              <Typography variant="h6">Soil Moisture History</Typography>
              <SoilMoistureChart data={deviceMoisture} error={error} />
            </Item>
          </Box>
          <Box sx={{ gridColumn: { xs: "1", md: "span 2" } }}>
            <Item>
              <Typography variant="h6">Humidity History</Typography>
              <HumidityChart data={deviceHumidity} error={error} />
            </Item>
          </Box>

          {/* AI Recommendations and Pump Control below the graphs */}
          <Box sx={{ display: "flex", gap: 3, flexWrap: "wrap", mt: 3 }}>
            <Item
              sx={{
                flex: 1,
                minHeight: 220,
                p: 4,
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                <Typography variant="h5" color="textPrimary">
                  Pump Control
                </Typography>
              </Box>
              <FormControlLabel
                control={
                  <Switch
                    checked={isManualMode}
                    onChange={handleModeToggle}
                    color="primary"
                  />
                }
                label={<span style={{ fontSize: "1.2rem" }}>Manual Mode</span>}
              />
              {isManualMode && (
                <FormControlLabel
                  control={
                    <Switch
                      checked={manualPumpStatus === "on"}
                      onChange={handlePumpToggle}
                      color="secondary"
                    />
                  }
                  label={
                    <span
                      style={{ fontSize: "1.2rem" }}
                    >{`Pump: ${manualPumpStatus.toUpperCase()}`}</span>
                  }
                />
              )}
            </Item>
          </Box>
        </Box>
      </Container>
    </Box>
  );
}

export default Dashboard;
