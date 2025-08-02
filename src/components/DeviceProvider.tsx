import React from "react";
import { ref, onValue } from "firebase/database";
import { database } from "../config/firebase";
import { DeviceContextType } from "../types/DeviceContext";

const DeviceContext = React.createContext<DeviceContextType | undefined>(
  undefined
);

interface DeviceProviderProps {
  children: React.ReactNode;
}

export const DeviceProvider: React.FC<DeviceProviderProps> = ({ children }) => {
  const [devices, setDevices] = React.useState<string[]>([]);
  const [selectedDevice, setSelectedDevice] = React.useState<string>("");

  React.useEffect(() => {
    const rootRef = ref(database, "/");
    const unsubscribe = onValue(rootRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const deviceKeys = Object.keys(data).filter((key) =>
          key.startsWith("device_")
        );
        setDevices(deviceKeys);
        setSelectedDevice((prev) => (prev ? prev : deviceKeys[0] || ""));
      }
    });
    return () => unsubscribe();
  }, []); // Only run once on mount

  return (
    <DeviceContext.Provider
      value={{ devices, selectedDevice, setDevices, setSelectedDevice }}
    >
      {children}
    </DeviceContext.Provider>
  );
};

export const useDevice = () => {
  const context = React.useContext(DeviceContext);
  if (!context) {
    throw new Error("useDevice must be used within a DeviceProvider");
  }
  return context;
};
