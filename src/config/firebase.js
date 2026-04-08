// src/config/firebase.js
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getStorage } from 'firebase/storage';
import { getFirestore } from 'firebase/firestore';

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyCnmAI2MA22Z22OkfjJUgY086YelIR15JA",
  authDomain: "aud2go-77639.firebaseapp.com",
  projectId: "aud2go-77639",
  storageBucket: "aud2go-77639.firebasestorage.app",
  messagingSenderId: "625025162525",
  appId: "1:625025162525:web:bda3db957e699d52ed55f4",
  measurementId: "G-BWRBWHXKKV"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Export the specific services you are responsible for
export const auth = getAuth(app);
export const storage = getStorage(app);
export const db = getFirestore(app);
