import React from "react";
import { ref, onValue, set } from "firebase/database";
import { database } from "../config/firebase";
import {
  Container,
  Typography,
  Paper,
  Box,
  Card,
  CardContent,
  FormControlLabel,
  Switch,
  Button,
  TextField,
  MenuItem,
  Grid,
  useTheme,
} from "@mui/material";
import { PowerSettingsNew } from "@mui/icons-material";

const PumpPage = () => {
  const [pumps, setPumps] = React.useState({});
  const [deviceList, setDeviceList] = React.useState([]);
  const theme = useTheme();

  // Fetch all pumps
  React.useEffect(() => {
    const pumpRef = ref(database, "Pump");
    const unsubscribe = onValue(pumpRef, (snapshot) => {
      setPumps(snapshot.val() || {});
    });
    return () => unsubscribe();
  }, []);

  // Fetch all devices
  React.useEffect(() => {
    const deviceRef = ref(database, "/");
    const unsubscribe = onValue(deviceRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        setDeviceList(
          Object.keys(data).filter((key) => key.startsWith("device_"))
        );
      }
    });
    return () => unsubscribe();
  }, []);

  const PumpControlCard = ({ pumpId, pumpData, devices }) => {
    const handleModeToggle = async () => {
      const newMode = pumpData.mode === "manual" ? "auto" : "manual";
      await set(ref(database, `Pump/${pumpId}/mode`), newMode);
    };

    const handlePowerToggle = async () => {
      const newStatus = pumpData.status === "on" ? "off" : "on";
      await set(ref(database, `Pump/${pumpId}/status`), newStatus);
    };

    const handleDeviceChange = async (e) => {
      await set(ref(database, `Pump/${pumpId}/device`), e.target.value);
    };

    return (
      <Card
        sx={{
          minWidth: 280,
          maxWidth: 400,
          mx: "auto",
          mb: 2,
          boxShadow: 4,
          borderRadius: 3,
          background: theme.palette.background.paper,
        }}
      >
        <CardContent>
          <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
            <PowerSettingsNew
              sx={{ mr: 1, color: theme.palette.primary.main }}
            />
            {pumpId} Control
          </Typography>
          <Box sx={{ display: "flex", alignItems: "center", mt: 2, gap: 2 }}>
            <FormControlLabel
              control={
                <Switch
                  checked={pumpData.mode === "manual"}
                  onChange={handleModeToggle}
                  color="primary"
                />
              }
              label={pumpData.mode === "manual" ? "Manual" : "Auto"}
            />
            {pumpData.mode === "manual" && (
              <Button
                variant={pumpData.status === "on" ? "contained" : "outlined"}
                color={pumpData.status === "on" ? "success" : "error"}
                onClick={handlePowerToggle}
                sx={{ minWidth: 100, fontWeight: 600 }}
              >
                {pumpData.status === "on" ? "Turn Off" : "Turn On"}
              </Button>
            )}
            {pumpData.mode === "auto" && (
              <Box sx={{ ml: 2 }}>
                <Typography color="info.main">
                  Auto mode: Follows threshold of selected device
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Auto Based On: {pumpData.autoBasedOn || "Soil Moisture"}
                </Typography>
              </Box>
            )}
          </Box>
          <Box sx={{ mt: 3 }}>
            <TextField
              select
              label="Linked Device"
              value={pumpData.device || ""}
              onChange={handleDeviceChange}
              size="small"
              variant="outlined"
              sx={{ width: 220 }}
              disabled={pumpData.mode !== "auto"}
              helperText="Select device for auto mode"
            >
              {devices.map((dev) => (
                <MenuItem key={dev} value={dev}>
                  {dev}
                </MenuItem>
              ))}
            </TextField>
          </Box>
        </CardContent>
      </Card>
    );
  };

  return (
    <Box
      sx={{ minHeight: "100vh", background: theme.palette.background.default }}
    >
      <Container maxWidth="md" sx={{ py: 6 }}>
        <Typography
          variant="h3"
          component="h1"
          gutterBottom
          align="center"
          sx={{ fontWeight: 700, mb: 4, color: theme.palette.primary.main }}
        >
          Pump Control
        </Typography>
        <Paper
          elevation={3}
          sx={{ p: { xs: 2, sm: 4 }, maxWidth: 900, mx: "auto" }}
        >
          <Grid container spacing={4} justifyContent="center">
            {Object.entries(pumps).map(([pumpId, pumpData]) => (
              <Grid
                item
                xs={12}
                sm={6}
                md={6}
                key={pumpId}
                display="flex"
                justifyContent="center"
              >
                <PumpControlCard
                  pumpId={pumpId}
                  pumpData={pumpData}
                  devices={deviceList}
                />
              </Grid>
            ))}
          </Grid>
        </Paper>
      </Container>
    </Box>
  );
};

export default PumpPage;
