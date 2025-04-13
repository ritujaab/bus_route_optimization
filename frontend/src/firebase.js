// src/firebase.js
import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

// Replace these with your actual Firebase config values
const firebaseConfig = {
  apiKey: "AIzaSyBu8IoiEaTTVbAJFSf87s6JzSOPuT7W-po",
  authDomain: "bus-route-optimization-2050d.firebaseapp.com",
  projectId: "bus-route-optimization-2050d",
  storageBucket: "bus-route-optimization-2050d.firebasestorage.app",
  messagingSenderId: "1079606675922",
  appId: "1:1079606675922:web:c4eb9ba2e181a98ff7e00b"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
// Force auth provider to select account
googleProvider.setCustomParameters({
  prompt: 'select_account'
});

export default app;