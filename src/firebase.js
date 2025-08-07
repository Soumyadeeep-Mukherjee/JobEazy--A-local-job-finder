// src/firebase.js
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

// ⬇️ REPLACE these with your actual Firebase config
const firebaseConfig = {
    apiKey: "AIzaSyAlR0HXZFwquxRweSHsv2CTpKtLBlm7ehI",
    authDomain: "jobs-finder-web.firebaseapp.com",
    projectId: "jobs-finder-web",
    storageBucket: "jobs-finder-web.firebasestorage.app",
    messagingSenderId: "268305989650",
    appId: "1:268305989650:web:6418953efa6723374c98cb",
    measurementId: "G-MBLJX0MTGD"
  };

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Export Firestore DB
const db = getFirestore(app);

export { db };
