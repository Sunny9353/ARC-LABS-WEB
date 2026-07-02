import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyDyXaKIqmMoO-GAZoG3E6teQ--G5gH0wmw",
  authDomain: "arclabs-478f1.firebaseapp.com",
  projectId: "arclabs-478f1",
  storageBucket: "arclabs-478f1.firebasestorage.app",
  messagingSenderId: "123009650421",
  appId: "1:123009650421:web:78a17e35f9b3a9583f7fbc",
};

const app = initializeApp(firebaseConfig);

export const db = getFirestore(app);
export const auth = getAuth(app);
export const storage = getStorage(app);
