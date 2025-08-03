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
  const { selectedDevice, devices, setSelectedDevice, selectedLocation, setSelectedLocation } = useDevice();
  const [sensorData, setSensorData] = useState({
    temperature: 0,
    humidity: 0,
    moisture: 0,
  });
  const [locationInput, setLocationInput] = useState(selectedLocation || "");

  const handleDeviceChange = (event: SelectChangeEvent) => {
    setSelectedDevice(event.target.value);
  };

  const handleLocationChange = (event: SelectChangeEvent) => {
    const newLocation = event.target.value;
    setSelectedLocation(newLocation);
    setLocationInput(newLocation);
    
    // 保存位置到Firebase
    if (selectedDevice) {
      const locationRef = ref(database, `${selectedDevice}/location`);
      set(locationRef, newLocation);
    }
  };

  const handleLocationInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setLocationInput(event.target.value);
  };

  const handleSaveLocation = () => {
    setSelectedLocation(locationInput);
    
    // 保存位置到Firebase
    if (selectedDevice) {
      const locationRef = ref(database, `${selectedDevice}/location`);
      set(locationRef, locationInput);
    }
  };

  useEffect(() => {
    if (!selectedDevice) return;

    const dataRef = ref(database, `${selectedDevice}/data`);
    const locationRef = ref(database, `${selectedDevice}/location`);
    
    // 监听传感器数据
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

    // 监听位置数据
    const locationUnsubscribe = onValue(
      locationRef,
      (snapshot) => {
        const location = snapshot.val();
        if (location) {
          setSelectedLocation(location);
          setLocationInput(location);
        }
      },
      (error) => {
        console.error("Error fetching location data:", error);
      }
    );

    return () => {
      dataUnsubscribe();
      locationUnsubscribe();
    };
  }, [selectedDevice, setSelectedLocation]);

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

        {/* Device and Location Selection */}
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

            <FormControl sx={{ minWidth: 200 }}>
              <InputLabel id="location-select-label">Location</InputLabel>
              <Select
                labelId="location-select-label"
                id="location-select"
                value={selectedLocation}
                label="Location"
                onChange={handleLocationChange}
              >
                <MenuItem value="Field A">Field A</MenuItem>
                <MenuItem value="Field B">Field B</MenuItem>
                <MenuItem value="Field C">Field C</MenuItem>
                <MenuItem value="Greenhouse 1">Greenhouse 1</MenuItem>
                <MenuItem value="Greenhouse 2">Greenhouse 2</MenuItem>
                <MenuItem value="Custom">Custom Location</MenuItem>
              </Select>
            </FormControl>

            {selectedLocation === "Custom" && (
              <Box sx={{ display: 'flex', gap: 1, alignItems: 'flex-end' }}>
                <TextField
                  label="Custom Location"
                  value={locationInput}
                  onChange={handleLocationInputChange}
                  size="small"
                  sx={{ minWidth: 150 }}
                />
                <Button 
                  variant="contained" 
                  onClick={handleSaveLocation}
                  size="small"
                >
                  Save
                </Button>
              </Box>
            )}
          </Box>
          
          {selectedDevice && (
            <Typography variant="body2" sx={{ mt: 2, textAlign: 'center', color: 'text.secondary' }}>
              Currently viewing: {selectedDevice.replace('device_', 'Device ')}
              {selectedLocation && ` at ${selectedLocation}`}
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
