import { initializeApp } from 'firebase/app';
import { getDatabase } from 'firebase/database';
import { getStorage } from 'firebase/storage';

// Your Firebase credentials (Project ID, DB URL, and domains are pre-configured!)
const firebaseConfig = {
  apiKey: "YOUR_API_KEY", // Replace with your Web API Key from Firebase General settings
  authDomain: "smart-civic-problem-solver.firebaseapp.com",
  projectId: "smart-civic-problem-solver",
  storageBucket: "smart-civic-problem-solver.appspot.com",
  messagingSenderId: "YOUR_SENDER_ID", // Replace if messaging/notifications are added
  appId: "YOUR_APP_ID", // Replace with your App ID (e.g. 1:12345:web:abcd...)
  databaseURL: "https://smart-civic-problem-solver-default-rtdb.firebaseio.com/"
};

// Check if credentials are configured (non-default)
const isConfigured = firebaseConfig.apiKey && firebaseConfig.apiKey !== "YOUR_API_KEY";

if (!isConfigured) {
  console.warn(
    "⚠️ Firebase configuration is not set yet. The application will run in Mock/Offline mode using local seed data. " +
    "To connect your live database, replace the config object in src/firebaseClient.js with your real Firebase keys."
  );
}

export const isFirebaseReady = isConfigured;

// Initialize App & Services (fallback to dummy config if keys are missing to prevent crash)
const app = initializeApp(isConfigured ? firebaseConfig : { apiKey: "placeholder", projectId: "smart-civic-problem-solver" });
export const database = getDatabase(app, firebaseConfig.databaseURL);
export const storage = getStorage(app);
