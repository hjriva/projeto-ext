// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyALtZ4J-F_DdpyjZ2YKZHnTMi9-z9u1MoI",
  authDomain: "salve-o-astronauta.firebaseapp.com",
  projectId: "salve-o-astronauta",
  storageBucket: "salve-o-astronauta.firebasestorage.app",
  messagingSenderId: "306032740549",
  appId: "1:306032740549:web:ed2607e4f2db6c90ebc8ac",
  measurementId: "G-7L1RJV12W7"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);