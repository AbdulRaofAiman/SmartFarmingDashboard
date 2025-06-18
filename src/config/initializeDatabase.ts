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