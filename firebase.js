// Substitua pelos dados do seu projeto Firebase
const firebaseConfig = {
  apiKey: "AIzaSyATdyPF48Wof2uDL_Jt5OwrjWHQ9obANZQ",

  authDomain: "gestapapprelatorios.firebaseapp.com",

  projectId: "gestapapprelatorios",

  storageBucket: "gestapapprelatorios.firebasestorage.app",

  messagingSenderId: "899787914377",

  appId: "1:899787914377:web:7612eea028052ffdaa5a58",

  measurementId: "G-S7HP69JFNP"
};
firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();
const auth = firebase.auth();