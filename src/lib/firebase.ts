import { initializeApp } from "firebase/app";
import { 
  getFirestore, 
  initializeFirestore, 
  persistentLocalCache, 
  persistentMultipleTabManager 
} from "firebase/firestore";

// Your Firebase project configuration
const firebaseConfig = {
  apiKey: "AIzaSyDwHGRcBUbonDwnP9cfT4ySwiXI5GgubP4",
  authDomain: "mdrrmo-system.firebaseapp.com",
  projectId: "mdrrmo-system",
  storageBucket: "mdrrmo-system.firebasestorage.app",
  messagingSenderId: "354112942235",
  appId: "1:354112942235:web:a0b4b0eae32192bd01163e",
  measurementId: "G-LMLQWLNS6M"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firestore with robust multi-tab offline persistence
export const db = initializeFirestore(app, {
  localCache: persistentLocalCache({
    tabManager: persistentMultipleTabManager()
  })
});

export default app;
