export interface DeviceContextType {
  devices: string[];
  selectedDevice: string;
  setDevices: (devices: string[]) => void;
  setSelectedDevice: (device: string) => void;
} 