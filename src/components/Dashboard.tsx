import React, { useState, useEffect } from "react";
import {
  Box,
  Container,
  Typography,
  FormControl,
  Select,
  MenuItem,
  SelectChangeEvent,
  Paper,
  TextField,
  Button,
  Chip
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
  const [deviceStatus, setDeviceStatus] = useState<{[key: string]: {online: boolean, lastUpdate: string}}>({});

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

  // Function to check if device is online based on formatted_time
  const checkDeviceOnline = (formattedTime: string): boolean => {
    try {
      // Parse the formatted time (HH:MM:SS)
      const [hours, minutes, seconds] = formattedTime.split(':').map(Number);
      const now = new Date();
      const deviceTime = new Date();
      deviceTime.setHours(hours, minutes, seconds, 0);
      
      // Calculate time difference in seconds
      const timeDiff = Math.abs(now.getTime() - deviceTime.getTime()) / 1000;
      
      // If device time is within 3 seconds of current time, consider it online
      return timeDiff <= 3;
    } catch (error) {
      console.error('Error parsing formatted time:', error);
      return false;
    }
  };

  // Monitor all devices for online status
  useEffect(() => {
    const deviceStatusUnsubscribes: (() => void)[] = [];

    devices.forEach((device) => {
      const dataRef = ref(database, `${device}/data`);
      const unsubscribe = onValue(dataRef, (snapshot) => {
        const data = snapshot.val();
        if (data) {
          const entries = Object.values(data);
          if (entries.length > 0) {
            const latestEntry = entries[entries.length - 1] as any;
            const isOnline = checkDeviceOnline(latestEntry.formatted_time || '');
            
            setDeviceStatus(prev => ({
              ...prev,
              [device]: {
                online: isOnline,
                lastUpdate: latestEntry.formatted_time || 'Unknown'
              }
            }));
          }
        }
      });
      deviceStatusUnsubscribes.push(unsubscribe);
    });

    return () => {
      deviceStatusUnsubscribes.forEach(unsubscribe => unsubscribe());
    };
  }, [devices]);

  // Continuous timer to check online status every 2 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setDeviceStatus(prev => {
        const updatedStatus = { ...prev };
        let hasChanges = false;

        Object.keys(updatedStatus).forEach(device => {
          const currentStatus = updatedStatus[device];
          if (currentStatus && currentStatus.lastUpdate !== 'Unknown') {
            const isOnline = checkDeviceOnline(currentStatus.lastUpdate);
            if (isOnline !== currentStatus.online) {
              updatedStatus[device] = {
                ...currentStatus,
                online: isOnline
              };
              hasChanges = true;
            }
          }
        });

        return hasChanges ? updatedStatus : prev;
      });
    }, 2000); // Check every 2 seconds

    return () => clearInterval(interval);
  }, []);

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
        <Paper elevation={2} sx={{ p: 3, mb: 4, maxWidth: 800, mx: 'auto' }}>
          <Typography variant="h6" sx={{ mb: 3, textAlign: 'center', fontWeight: 600 }}>
            Device Configuration
          </Typography>
          
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            {/* Device Selection Row */}
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 500, color: 'text.secondary' }}>
                Select Device
              </Typography>
              <FormControl fullWidth>
                <Select
                  value={selectedDevice}
                  onChange={handleDeviceChange}
                  displayEmpty
                  sx={{ minHeight: 48 }}
                >
                  {devices.map((device) => (
                    <MenuItem key={device} value={device}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, width: '100%' }}>
                        <span>{device.replace('device_', 'Device ')}</span>
                        {deviceStatus[device] && (
                          <Chip
                            label={deviceStatus[device].online ? "Online" : "Offline"}
                            color={deviceStatus[device].online ? "success" : "error"}
                            size="small"
                            variant="outlined"
                            sx={{ ml: 'auto' }}
                          />
                        )}
                      </Box>
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Box>

            {/* Place Input Row */}
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 500, color: 'text.secondary' }}>
                Device Place
              </Typography>
              <Box sx={{ display: 'flex', gap: 2, alignItems: 'flex-end' }}>
                <TextField
                  fullWidth
                  value={placeInput}
                  onChange={handlePlaceInputChange}
                  placeholder="Enter device place (e.g., Field A, Greenhouse 1)"
                  size="medium"
                  sx={{ flexGrow: 1 }}
                />
                <Button 
                  variant="contained" 
                  onClick={handleSavePlace}
                  disabled={!placeInput.trim()}
                  sx={{ 
                    minWidth: 100,
                    height: 48,
                    fontWeight: 600
                  }}
                >
                  Save Place
                </Button>
              </Box>
            </Box>
          </Box>
          
          {/* Device Status Display */}
          {selectedDevice && (
            <Box sx={{ mt: 3, p: 2, bgcolor: 'grey.50', borderRadius: 1, border: '1px solid', borderColor: 'grey.200' }}>
              <Typography variant="body2" sx={{ color: 'text.secondary', mb: 1, fontWeight: 500 }}>
                Current Device: {selectedDevice.replace('device_', 'Device ')}
                {selectedPlace && ` at ${selectedPlace}`}
              </Typography>
              {deviceStatus[selectedDevice] && (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Chip
                    label={deviceStatus[selectedDevice].online ? "Online" : "Offline"}
                    color={deviceStatus[selectedDevice].online ? "success" : "error"}
                    size="small"
                    sx={{ fontWeight: 600 }}
                  />
                  <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                    Last update: {deviceStatus[selectedDevice].lastUpdate}
                  </Typography>
                </Box>
              )}
            </Box>
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
