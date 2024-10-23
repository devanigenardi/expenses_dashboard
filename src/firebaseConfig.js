import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
    apiKey: "AIzaSyAsyhqWKw4bP4odKwTNxgp5S2NqXpDsWLM",
    authDomain: "expenses-trips.firebaseapp.com",
    projectId: "expenses-trips",
    storageBucket: "expenses-trips.appspot.com",
    messagingSenderId: "776544237476",
    appId: "1:776544237476:web:566f5f6a4c5986523eb331",
    measurementId: "G-BGXVFFZ1VR"
  };

// Inicializar Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

export { db };