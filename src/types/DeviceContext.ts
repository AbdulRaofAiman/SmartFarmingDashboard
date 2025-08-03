export interface DeviceContextType {
  devices: string[];
  selectedDevice: string;
  selectedLocation: string;
  setDevices: (devices: string[]) => void;
  setSelectedDevice: (device: string) => void;
  setSelectedLocation: (location: string) => void;
} 