import { initializeApp } from 'firebase/app';
import { getDatabase } from 'firebase/database';
import { getStorage } from 'firebase/storage';

// Live Firebase configuration for Smart Civic Problem Solver
const firebaseConfig = {
  apiKey: "AIzaSyBHvd53F-6gWQ-aV8FtaokONPpZhSF5nP0",
  authDomain: "smart-civic-problem-solver.firebaseapp.com",
  databaseURL: "https://smart-civic-problem-solver-default-rtdb.firebaseio.com",
  projectId: "smart-civic-problem-solver",
  storageBucket: "smart-civic-problem-solver.firebasestorage.app",
  messagingSenderId: "903103371650",
  appId: "1:903103371650:web:0e814f7059141ddd73179b",
  measurementId: "G-NM7J7B94L4"
};

// Check if credentials are configured
const isConfigured = firebaseConfig.apiKey && firebaseConfig.apiKey !== "YOUR_API_KEY";

export const isFirebaseReady = isConfigured;

// Initialize App & Services
const app = initializeApp(firebaseConfig);
export const database = getDatabase(app, firebaseConfig.databaseURL);
export const storage = getStorage(app);
