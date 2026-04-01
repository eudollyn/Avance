import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  // Pegue essas credenciais no console do Firebase
  apiKey: "AIzaSyBHV9xYTmnYhOiXBrWwC6VsY3fx5uMjy1I",
  authDomain: "avance-projeto.firebaseapp.com",
  projectId: "avance-projeto",
  storageBucket: "avance-projeto.firebasestorage.app",
  messagingSenderId: "256572581922",
  appId: "1:256572581922:web:10d8e7c20ea26d6590027b"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);