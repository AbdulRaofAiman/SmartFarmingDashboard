import React from "react";
import {
  Box,
  Container,
  Typography,
  CircularProgress,
  Alert,
  Grid,
  Paper,
  useTheme,
} from "@mui/material";
import { styled } from "@mui/material/styles";
import { useDevice } from "./DeviceProvider";

const Item = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(3),
  textAlign: "center",
  color: theme.palette.text.secondary,
  height: "200px",
  display: "flex",
  flexDirection: "column",
  justifyContent: "center",
  alignItems: "center",
  transition: "all 0.3s ease-in-out",
  "&:hover": {
    transform: "translateY(-2px)",
    boxShadow: theme.shadows[4],
  },
}));

export function Dashboard() {
  const theme = useTheme();
  const { devices, selectedDevice } = useDevice();

  return (
    <Box
      sx={{ minHeight: "100vh", background: theme.palette.background.default }}
    >
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Typography variant="h3" align="center" sx={{ fontWeight: 700, mb: 4 }}>
          IoT Farm Monitoring Dashboard
        </Typography>

        <Grid container spacing={3}>
          <Grid item xs={12} md={4}>
            <Item elevation={2}>
              <Typography variant="h4" color="primary" gutterBottom>
                Soil Moisture
              </Typography>
              <Typography variant="h2" color="primary">
                0
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Raw sensor value
              </Typography>
            </Item>
          </Grid>
          <Grid item xs={12} md={4}>
            <Item elevation={2}>
              <Typography variant="h4" color="success.main" gutterBottom>
                Humidity
              </Typography>
              <Typography variant="h2" color="success.main">
                0%
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Relative humidity
              </Typography>
            </Item>
          </Grid>
          <Grid item xs={12} md={4}>
            <Item elevation={2}>
              <Typography variant="h4" color="warning.main" gutterBottom>
                Temperature
              </Typography>
              <Typography variant="h2" color="warning.main">
                0°C
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Ambient temperature
              </Typography>
            </Item>
          </Grid>
        </Grid>

        <Box sx={{ mt: 4, textAlign: "center" }}>
          <Typography variant="h6" color="text.secondary">
            Selected Device: {selectedDevice || "None"}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Available Devices: {devices.length}
          </Typography>
        </Box>
      </Container>
    </Box>
  );
}

export default Dashboard;
