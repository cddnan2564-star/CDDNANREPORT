import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { initializeApp } from "firebase/app";
import { getAnalytics, isSupported } from "firebase/analytics";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDB5MJfnCZH1rkfnEu6cSwsimVqGztmssY",
  authDomain: "itcddnan-273cc.firebaseapp.com",
  projectId: "itcddnan-273cc",
  storageBucket: "itcddnan-273cc.firebasestorage.app",
  messagingSenderId: "630936261752",
  appId: "1:630936261752:web:d70c2267cc09c1881f898d",
  measurementId: "G-9K2FB42S0M"
};

// 1. Render App immediately (Priority #1)
// This ensures the user sees the interface regardless of Firebase status
const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

// 2. Initialize Firebase safely in background (Priority #2)
(async () => {
  try {
    const app = initializeApp(firebaseConfig);
    
    // Check support before calling getAnalytics to avoid "network" errors
    const analyticsSupported = await isSupported();
    if (analyticsSupported) {
      try {
        getAnalytics(app);
        console.log("Firebase Analytics initialized");
      } catch (e) {
        // Suppress errors silently so it doesn't look broken
        console.log("Firebase Analytics skipped (running in offline/restricted mode)");
      }
    }
  } catch (err) {
    console.log("Firebase skipped (running in offline/restricted mode)");
  }
})();