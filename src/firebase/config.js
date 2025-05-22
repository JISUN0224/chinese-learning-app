import firebase from 'firebase/app';
import 'firebase/firestore';

// Firebase 설정
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "your-project-id.firebaseapp.com",
  projectId: "your-project-id",
  storageBucket: "your-project-id.appspot.com",
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
  appId: "YOUR_APP_ID"
};

// Firebase 초기화
if (!firebase.apps.length) {
  firebase.initializeApp(firebaseConfig);
}

export const db = firebase.firestore();

export default firebase;