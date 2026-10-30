
/* FIREBASE CONFIGURATION */

// New D1 Dynasty Firebase project
const firebaseConfig = {
  apiKey: "AIzaSyDGuROUXTQd3YhTMNWPyO6tDeJNpWeSN4o",
  authDomain: "d1dynasty2.firebaseapp.com",
  projectId: "d1dynasty2",
  storageBucket: "d1dynasty2.firebasestorage.app",
  messagingSenderId: "783088754770",
  appId: "1:783088754770:web:bd557c0808109f94523f8b",
  measurementId: "G-RBX589QTGH"
};

// Initialize Firebase only once
if (!firebase.apps.length) {
  firebase.initializeApp(firebaseConfig);
}

// Initialize Authentication and Firestore
const auth = firebase.auth();
const db = firebase.firestore();

// Expose Firebase services for debugging
window.auth = auth;
window.db = db;

// Configure Firestore networking
db.settings({
  experimentalForceLongPolling: true
});

console.log(
  "Firebase initialized:",
  firebase.app().options.projectId
);
