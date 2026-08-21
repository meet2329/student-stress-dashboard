// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics, isSupported } from "firebase/analytics";
import { 
  getAuth, 
  GoogleAuthProvider, 
  signInWithPopup, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged,
  updateProfile,
  signInAnonymously
} from "firebase/auth";
import { 
  getFirestore, 
  doc, 
  setDoc, 
  getDoc, 
  serverTimestamp 
} from "firebase/firestore";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBNnTkGZyi_-e__PeYUxhpZlAQ1fNKJsDo",
  authDomain: "data-analysis-ae493.firebaseapp.com",
  projectId: "data-analysis-ae493",
  storageBucket: "data-analysis-ae493.firebasestorage.app",
  messagingSenderId: "858925433559",
  appId: "1:858925433559:web:87d83a29d8bab81ac7e692",
  measurementId: "G-GBTHFPBWBR"
};

// Initialize Firebase App
export const app = initializeApp(firebaseConfig);

// Initialize Firebase Authentication
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();

// Initialize Cloud Firestore Database safely
export let db = null;
try {
  db = getFirestore(app);
} catch (e) {
  console.warn("Firestore initialization notice:", e.message);
}

// Initialize Analytics safely
export let analytics = null;
if (typeof window !== 'undefined') {
  isSupported().then((yes) => {
    if (yes) {
      analytics = getAnalytics(app);
    }
  }).catch(() => {});
}

export { 
  signInWithPopup, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signInAnonymously,
  signOut, 
  onAuthStateChanged,
  updateProfile,
  doc,
  setDoc,
  getDoc,
  serverTimestamp
};
