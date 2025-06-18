import React from "react";
import {
  Container,
  Typography,
  Paper,
  Box,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider,
} from "@mui/material";
import {
  Info as InfoIcon,
  WaterDrop as WaterDropIcon,
  Thermostat as ThermostatIcon,
  Settings as SettingsIcon,
  Power as PowerIcon,
} from "@mui/icons-material";

const DocumentationPage: React.FC = () => {
  return (
    <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        System Documentation
      </Typography>

      <Paper elevation={3} sx={{ p: 3 }}>
        <Box sx={{ display: "flex", flexDirection: "column", gap: 4 }}>
          {/* Overview Section */}
          <Box>
            <Typography variant="h5" gutterBottom>
              System Overview
            </Typography>
            <Typography paragraph>
              The IoT Farm Monitoring System is designed to monitor and control
              various environmental parameters in your farm. The system provides
              real-time monitoring of humidity, temperature, and soil moisture
              levels, along with automated control of the irrigation system.
            </Typography>
          </Box>

          <Divider />

          {/* Features Section */}
          <Box>
            <Typography variant="h5" gutterBottom>
              Key Features
            </Typography>
            <List>
              <ListItem>
                <ListItemIcon>
                  <WaterDropIcon color="primary" />
                </ListItemIcon>
                <ListItemText
                  primary="Humidity Monitoring"
                  secondary="Real-time monitoring of air humidity levels with historical data visualization"
                />
              </ListItem>
              <ListItem>
                <ListItemIcon>
                  <ThermostatIcon color="primary" />
                </ListItemIcon>
                <ListItemText
                  primary="Soil Moisture Monitoring"
                  secondary="Continuous soil moisture tracking with alerts for extreme conditions"
                />
              </ListItem>
              <ListItem>
                <ListItemIcon>
                  <PowerIcon color="primary" />
                </ListItemIcon>
                <ListItemText
                  primary="Irrigation Control"
                  secondary="Automated and manual control of the irrigation system based on soil moisture levels"
                />
              </ListItem>
            </List>
          </Box>

          <Divider />

          {/* Usage Guide Section */}
          <Box>
            <Typography variant="h5" gutterBottom>
              Usage Guide
            </Typography>
            <List>
              <ListItem>
                <ListItemIcon>
                  <InfoIcon color="primary" />
                </ListItemIcon>
                <ListItemText
                  primary="Dashboard"
                  secondary="The main dashboard provides an overview of all system parameters and current status"
                />
              </ListItem>
              <ListItem>
                <ListItemIcon>
                  <SettingsIcon color="primary" />
                </ListItemIcon>
                <ListItemText
                  primary="Settings"
                  secondary="Configure system thresholds and control parameters in the settings page"
                />
              </ListItem>
            </List>
          </Box>

          <Divider />

          {/* Thresholds Section */}
          <Box>
            <Typography variant="h5" gutterBottom>
              Recommended Thresholds
            </Typography>
            <List>
              <ListItem>
                <ListItemText
                  primary="Humidity"
                  secondary="Optimal range: 40-80%"
                />
              </ListItem>
              <ListItem>
                <ListItemText
                  primary="Soil Moisture"
                  secondary="Optimal range: 30-70%"
                />
              </ListItem>
            </List>
          </Box>

          <Divider />

          {/* Troubleshooting Section */}
          <Box>
            <Typography variant="h5" gutterBottom>
              Troubleshooting
            </Typography>
            <List>
              <ListItem>
                <ListItemText
                  primary="Sensor Readings Not Updating"
                  secondary="Check the sensor connections and ensure the system is properly powered"
                />
              </ListItem>
              <ListItem>
                <ListItemText
                  primary="Pump Not Responding"
                  secondary="Verify the pump connection and check if the system is in manual mode"
                />
              </ListItem>
              <ListItem>
                <ListItemText
                  primary="Data Not Syncing"
                  secondary="Ensure stable internet connection and check Firebase configuration"
                />
              </ListItem>
            </List>
          </Box>
        </Box>
      </Paper>
    </Container>
  );
};

export default DocumentationPage;
