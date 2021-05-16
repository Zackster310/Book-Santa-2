import firebase from 'firebase'
require('@firebase/firestore')

// Your web app's Firebase configuration
var firebaseConfig = {
  apiKey: "AIzaSyA8KK4-PTKz0HCJfTRwClBk_wycIvhKL8A",
  authDomain: "book-santa-5a1f9.firebaseapp.com",
  projectId: "book-santa-5a1f9",
  storageBucket: "book-santa-5a1f9.appspot.com",
  messagingSenderId: "785233491489",
  appId: "1:785233491489:web:d96a1d086fe4839d849560"
};
// Initialize Firebase
firebase.initializeApp(firebaseConfig);

export default firebase.firestore()