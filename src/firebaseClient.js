import { initializeApp } from 'firebase/app';
import { getDatabase } from 'firebase/database';
import { getStorage } from 'firebase/storage';

// Replace placeholders with credentials from your Firebase Console
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_PROJECT_ID.appspot.com",
  messagingSenderId: "YOUR_SENDER_ID",
  appId: "YOUR_APP_ID",
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
const app = initializeApp(isConfigured ? firebaseConfig : { apiKey: "placeholder", projectId: "placeholder" });
export const database = getDatabase(app, firebaseConfig.databaseURL);
export const storage = getStorage(app);
