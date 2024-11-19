import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
    apiKey: "AIzaSyCnIusN2kXesUqy5GBrP3uWuaAH85K6KNE",
    authDomain: "notes-app-f5310.firebaseapp.com",
    projectId: "notes-app-f5310",
    storageBucket: "notes-app-f5310.firebasestorage.app",
    messagingSenderId: "563844045225",
    appId: "1:563844045225:web:f3f6d8e991c1f12be90cb8",
    measurementId: "G-M1HT1RJLHP"
  };

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);