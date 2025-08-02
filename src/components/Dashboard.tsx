import React from "react";
import { Box, Container, Typography } from "@mui/material";

export function Dashboard() {
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
          This is a simplified version of the dashboard that will be enhanced with real-time sensor data.
        </Typography>
        
        <Box sx={{ display: "flex", justifyContent: "center", gap: 2, flexWrap: "wrap" }}>
          <Box sx={{ p: 3, bgcolor: "primary.main", color: "white", borderRadius: 2, minWidth: 200, textAlign: "center" }}>
            <Typography variant="h6">Soil Moisture</Typography>
            <Typography variant="h4">0</Typography>
          </Box>
          <Box sx={{ p: 3, bgcolor: "success.main", color: "white", borderRadius: 2, minWidth: 200, textAlign: "center" }}>
            <Typography variant="h6">Humidity</Typography>
            <Typography variant="h4">0%</Typography>
          </Box>
          <Box sx={{ p: 3, bgcolor: "warning.main", color: "white", borderRadius: 2, minWidth: 200, textAlign: "center" }}>
            <Typography variant="h6">Temperature</Typography>
            <Typography variant="h4">0°C</Typography>
          </Box>
        </Box>
      </Container>
    </Box>
  );
}

export default Dashboard;
