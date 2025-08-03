import React, { useState, useEffect } from "react";
import {
  Box,
  Container,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  SelectChangeEvent,
  Paper,
  TextField,
  Button
} from "@mui/material";
import { ref, onValue, set } from "firebase/database";
import { database } from "../config/firebase";
import { useDevice } from "./DeviceProvider";

export function Dashboard() {
  const { selectedDevice, devices, setSelectedDevice, selectedPlace, setSelectedPlace } = useDevice();
  const [sensorData, setSensorData] = useState({
    temperature: 0,
    humidity: 0,
    moisture: 0,
  });
  const [placeInput, setPlaceInput] = useState(selectedPlace || "");

  const handleDeviceChange = (event: SelectChangeEvent) => {
    setSelectedDevice(event.target.value);
  };

  const handlePlaceInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setPlaceInput(event.target.value);
  };

  const handleSavePlace = () => {
    if (placeInput.trim()) {
      setSelectedPlace(placeInput.trim());
      
      // Save place to Firebase
      if (selectedDevice) {
        const placeRef = ref(database, `${selectedDevice}/info/place`);
        set(placeRef, placeInput.trim());
      }
    }
  };

  useEffect(() => {
    if (!selectedDevice) return;

    const dataRef = ref(database, `${selectedDevice}/data`);
    const placeRef = ref(database, `${selectedDevice}/info/place`);
    
    // Listen for sensor data
    const dataUnsubscribe = onValue(
      dataRef,
      (snapshot) => {
        const data = snapshot.val();
        if (data) {
          // Get the latest data entry
          const entries = Object.values(data);
          if (entries.length > 0) {
            const latestEntry = entries[entries.length - 1] as any;
            setSensorData({
              temperature: latestEntry.temperature || 0,
              humidity: latestEntry.humidity || 0,
              moisture: latestEntry.moisture || 0,
            });
          }
        }
      },
      (error) => {
        console.error("Error fetching sensor data:", error);
      }
    );

    // Listen for place data
    const placeUnsubscribe = onValue(
      placeRef,
      (snapshot) => {
        const place = snapshot.val();
        if (place) {
          setSelectedPlace(place);
          setPlaceInput(place);
        }
      },
      (error) => {
        console.error("Error fetching place data:", error);
      }
    );

    return () => {
      dataUnsubscribe();
      placeUnsubscribe();
    };
  }, [selectedDevice, setSelectedPlace]);

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "background.default" }}>
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Typography variant="h3" align="center" sx={{ fontWeight: 700, mb: 4 }}>
          IoT Farm Monitoring Dashboard
        </Typography>

        <Typography variant="h5" align="center" sx={{ mb: 2 }}>
          Welcome to Smart Farming Dashboard
        </Typography>

        <Typography variant="body1" align="center" sx={{ mb: 4 }}>
          Real-time sensor data from your IoT devices
        </Typography>

        {/* Device and Place Selection */}
        <Paper elevation={2} sx={{ p: 3, mb: 4, maxWidth: 600, mx: 'auto' }}>
          <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', alignItems: 'flex-end' }}>
            <FormControl sx={{ minWidth: 200 }}>
              <InputLabel id="device-select-label">Select Device</InputLabel>
              <Select
                labelId="device-select-label"
                id="device-select"
                value={selectedDevice}
                label="Select Device"
                onChange={handleDeviceChange}
              >
                {devices.map((device) => (
                  <MenuItem key={device} value={device}>
                    {device.replace('device_', 'Device ')}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <Box sx={{ display: 'flex', gap: 1, alignItems: 'flex-end' }}>
              <TextField
                label="Place"
                value={placeInput}
                onChange={handlePlaceInputChange}
                placeholder="Enter device place"
                size="small"
                sx={{ minWidth: 200 }}
              />
              <Button 
                variant="contained" 
                onClick={handleSavePlace}
                size="small"
                disabled={!placeInput.trim()}
              >
                Save
              </Button>
            </Box>
          </Box>
          
          {selectedDevice && (
            <Typography variant="body2" sx={{ mt: 2, textAlign: 'center', color: 'text.secondary' }}>
              Currently viewing: {selectedDevice.replace('device_', 'Device ')}
              {selectedPlace && ` at ${selectedPlace}`}
            </Typography>
          )}
        </Paper>

        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            gap: 2,
            flexWrap: "wrap",
          }}
        >
          <Box
            sx={{
              p: 3,
              bgcolor: "primary.main",
              color: "white",
              borderRadius: 2,
              minWidth: 200,
              textAlign: "center",
            }}
          >
            <Typography variant="h6">Soil Moisture</Typography>
            <Typography variant="h4">{sensorData.moisture}</Typography>
          </Box>
          <Box
            sx={{
              p: 3,
              bgcolor: "success.main",
              color: "white",
              borderRadius: 2,
              minWidth: 200,
              textAlign: "center",
            }}
          >
            <Typography variant="h6">Humidity</Typography>
            <Typography variant="h4">{sensorData.humidity}%</Typography>
          </Box>
          <Box
            sx={{
              p: 3,
              bgcolor: "warning.main",
              color: "white",
              borderRadius: 2,
              minWidth: 200,
              textAlign: "center",
            }}
          >
            <Typography variant="h6">Temperature</Typography>
            <Typography variant="h4">{sensorData.temperature}°C</Typography>
          </Box>
        </Box>

        {!selectedDevice && devices.length === 0 && (
          <Paper elevation={3} sx={{ p: 3, mt: 4, textAlign: 'center', bgcolor: 'warning.light' }}>
            <Typography variant="h6" color="warning.dark">
              No devices found
            </Typography>
            <Typography variant="body2" color="warning.dark">
              Please ensure your IoT devices are connected and sending data to Firebase.
            </Typography>
          </Paper>
        )}
      </Container>
    </Box>
  );
}

export default Dashboard;
