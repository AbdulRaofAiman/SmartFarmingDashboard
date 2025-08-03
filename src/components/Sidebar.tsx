import React from "react";
import {
  useNavigate as useNavigateHook,
  useLocation as useLocationHook,
} from "react-router-dom";
import {
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  ListItemButton,
  Box,
  Typography,
  Divider,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  SelectChangeEvent,
} from "@mui/material";
import {
  Dashboard as DashboardIcon,
  WaterDrop as WaterDropIcon,
  Opacity as SoilMoistureIcon,
  Settings as SettingsIcon,
  MenuBook as MenuBookIcon,
  DeviceThermostat as TemperatureIcon,
  Opacity as PumpIcon,
  PowerSettingsNew as PumpSidebarIcon,
} from "@mui/icons-material";
import { useDevice } from "./DeviceProvider";

const drawerWidth = 240;

const menuItems = [
  { text: "Dashboard", icon: <DashboardIcon />, path: "/dashboard" },
  { text: "Humidity", icon: <WaterDropIcon />, path: "/humidity" },
  { text: "Temperature", icon: <TemperatureIcon />, path: "/temperature" },
  { text: "Soil Moisture", icon: <SoilMoistureIcon />, path: "/soil-moisture" },
  { text: "Pump", icon: <PumpSidebarIcon />, path: "/pump" },
  { text: "Settings", icon: <SettingsIcon />, path: "/settings" },
  { text: "Documentation", icon: <MenuBookIcon />, path: "/documentation" },
];

const Sidebar: React.FC = () => {
  const navigate = useNavigateHook();
  const location = useLocationHook();
  const { selectedDevice, devices, setSelectedDevice } = useDevice();

  const handleDeviceChange = (event: SelectChangeEvent) => {
    setSelectedDevice(event.target.value);
  };

  return (
    <Drawer
      variant="permanent"
      sx={{
        width: drawerWidth,
        flexShrink: 0,
        "& .MuiDrawer-paper": {
          width: drawerWidth,
          boxSizing: "border-box",
          backgroundColor: "primary.main",
          color: "white",
        },
      }}
    >
      <Box sx={{ p: 2 }}>
        <Typography variant="h6" component="div" sx={{ fontWeight: "bold" }}>
          IoT Farm Monitoring
        </Typography>
      </Box>
      <Divider sx={{ backgroundColor: "rgba(255, 255, 255, 0.12)" }} />
      
      {/* Device Selection */}
      <Box sx={{ p: 2 }}>
        <FormControl fullWidth size="small">
          <InputLabel 
            id="sidebar-device-select-label" 
            sx={{ color: 'rgba(255, 255, 255, 0.7)' }}
          >
            Select Device
          </InputLabel>
          <Select
            labelId="sidebar-device-select-label"
            id="sidebar-device-select"
            value={selectedDevice}
            label="Select Device"
            onChange={handleDeviceChange}
            sx={{
              color: 'white',
              '& .MuiOutlinedInput-notchedOutline': {
                borderColor: 'rgba(255, 255, 255, 0.3)',
              },
              '&:hover .MuiOutlinedInput-notchedOutline': {
                borderColor: 'rgba(255, 255, 255, 0.5)',
              },
              '& .MuiSvgIcon-root': {
                color: 'white',
              },
            }}
          >
            {devices.map((device) => (
              <MenuItem key={device} value={device}>
                {device.replace('device_', 'Device ')}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        {selectedDevice && (
          <Typography 
            variant="caption" 
            sx={{ 
              mt: 1, 
              display: 'block', 
              textAlign: 'center', 
              color: 'rgba(255, 255, 255, 0.7)',
              fontSize: '0.75rem'
            }}
          >
            {selectedDevice.replace('device_', 'Device ')}
          </Typography>
        )}
      </Box>
      
      <Divider sx={{ backgroundColor: "rgba(255, 255, 255, 0.12)" }} />
      <List>
        {menuItems.map((item) => (
          <ListItem key={item.text} disablePadding>
            <ListItemButton
              selected={location.pathname === item.path}
              onClick={() => navigate(item.path)}
              sx={{
                "&.Mui-selected": {
                  backgroundColor: "rgba(255, 255, 255, 0.08)",
                  "&:hover": {
                    backgroundColor: "rgba(255, 255, 255, 0.12)",
                  },
                },
                "&:hover": {
                  backgroundColor: "rgba(255, 255, 255, 0.04)",
                },
              }}
            >
              <ListItemIcon sx={{ color: "white", minWidth: 40 }}>
                {item.icon}
              </ListItemIcon>
              <ListItemText primary={item.text} />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
    </Drawer>
  );
};

export default Sidebar;
