import { ref, set } from "firebase/database";
import { database } from "./firebase";

export const initializeDatabase = async () => {
  try {
    // Initialize the database structure
    const initialData = {
      soilMoisture: {
        current: 0,
        history: []
      },
      humidity: {
        current: 0,
        history: []
      },
      pump: {
        mode: "manual",
        status: false
      },
      // Add sample device for testing
      device_001: {
        info: {
          place: "Sample Location"
        },
        data: {
          sample_reading: {
            humidity: 65,
            moisture: 2500,
            temperature: 25,
            timestamp: Date.now(),
            formatted_time: new Date().toLocaleTimeString("en-GB", { hour12: false }),
            place: "Sample Location"
          }
        }
      }
    };

    // Set the initial data
    await set(ref(database, "/"), initialData);
    console.log("Database initialized successfully");
    return true;
  } catch (error) {
    console.error("Error initializing database:", error);
    return false;
  }
}; 