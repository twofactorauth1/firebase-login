import firebase from 'firebase';
import 'firebase/auth';
import 'firebase/database';

const prodConfig = {
    apiKey: "AIzaSyAHUVdYP4FCN7t2rfvjoIWCpTWOBzVbsPc",
    authDomain: "funapp-3efa1.firebaseapp.com",
    databaseURL: "https://funapp-3efa1.firebaseio.com",
    projectId: "funapp-3efa1",
    storageBucket: "funapp-3efa1.appspot.com",
    messagingSenderId: "55272362360"
  };

const devConfig = {
    apiKey: "AIzaSyAHUVdYP4FCN7t2rfvjoIWCpTWOBzVbsPc",
    authDomain: "funapp-3efa1.firebaseapp.com",
    databaseURL: "https://funapp-3efa1.firebaseio.com",
    projectId: "funapp-3efa1",
    storageBucket: "funapp-3efa1.appspot.com",
    messagingSenderId: "55272362360"
  };

const config = process.env.NODE_ENV === 'production'
  ? prodConfig
  : devConfig;
let initializedApp;
if (!firebase.apps.length) {
   firebase.initializeApp(config);
}

console.log('initializedApp',initializedApp);
const db = firebase.database().ref('mvp');
const auth = firebase.auth();

export {
  db,
  auth,
  firebase
};
