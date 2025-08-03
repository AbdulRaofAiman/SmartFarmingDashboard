export interface DeviceContextType {
  devices: string[];
  selectedDevice: string;
  selectedPlace: string;
  setDevices: (devices: string[]) => void;
  setSelectedDevice: (device: string) => void;
  setSelectedPlace: (place: string) => void;
} 