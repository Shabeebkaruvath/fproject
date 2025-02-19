
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore  } from 'firebase/firestore';

const firebaseConfig = {
    apiKey: "AIzaSyAB_9CjAJj4F91ZTmxjq2FZ-TOgNuPbeA0",
    authDomain: "fyp1-45472.firebaseapp.com",
    projectId: "fyp1-45472",
    storageBucket: "fyp1-45472.firebasestorage.app",
    messagingSenderId: "644782070246",
    appId: "1:644782070246:web:32c660a2775adab5db9e27",
    measurementId: "G-856T97XZ3T"
  }

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);