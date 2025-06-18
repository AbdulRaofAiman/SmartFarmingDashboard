import { initializeApp } from 'firebase/app';
import { getDatabase, connectDatabaseEmulator } from 'firebase/database';
import { getAuth, signInAnonymously, onAuthStateChanged } from 'firebase/auth';
import { getAnalytics } from 'firebase/analytics';

const firebaseConfig = {
  apiKey: "AIzaSyAOXnI9gfYm9VjNQtmIm_WwJT8L4Ado2dw",
  authDomain: "fyp2025-263a5.firebaseapp.com",
  databaseURL: "https://fyp2025-263a5-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "fyp2025-263a5",
  storageBucket: "fyp2025-263a5.firebasestorage.app",
  messagingSenderId: "767424574789",
  appId: "1:767424574789:web:24418a9bad2fc71b8d7a2c",
  measurementId: "G-8JJ231T96D"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const database = getDatabase(app);
const analytics = getAnalytics(app);

// Authentication state observer
onAuthStateChanged(auth, (user) => {
  if (user) {
    console.log("User is signed in:", user.uid);
  } else {
    console.log("No user is signed in");
  }
});

// Sign in anonymously and handle errors
const signIn = async () => {
  try {
    console.log("Attempting anonymous sign in...");
    const userCredential = await signInAnonymously(auth);
    console.log("Successfully signed in anonymously:", userCredential.user.uid);
    return true;
  } catch (error) {
    console.error("Error signing in anonymously:", error);
    if (error instanceof Error) {
      console.error("Error details:", {
        code: error.name,
        message: error.message,
        stack: error.stack
      });
    }
    return false;
  }
};

// Initialize authentication
signIn();

export { database, auth, analytics, signIn }; 