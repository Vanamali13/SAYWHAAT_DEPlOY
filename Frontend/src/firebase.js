// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, OAuthProvider } from "firebase/auth";

// Your web app's Firebase configuration
// TODO: Replace these with your project's actual config keys from the Firebase Console
const firebaseConfig = {
    apiKey: "AIzaSyD50naZfDJJFggS5fLlcoOgEOucVGvlExU",
    authDomain: "say-whaat.firebaseapp.com",
    projectId: "say-whaat",
    storageBucket: "say-whaat.firebasestorage.app",
    messagingSenderId: "28733213366",
    appId: "1:28733213366:web:5bcc4be4080217759f3417",
    measurementId: "G-HL45YGX3DG"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);

// Providers
export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({ prompt: 'select_account' });
