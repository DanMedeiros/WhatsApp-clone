import { initializeApp } from "firebase/app";
import { getFirestore, collection, doc } from 'firebase/firestore';
import { getStorage } from "firebase/storage";
import { getAuth, signInWithPopup, GoogleAuthProvider } from "firebase/auth";

export class Firebase {

    constructor() {

        this._config = {
            apiKey: "AIzaSyAecEyumKBJUdvyXbjBa1dQD6GG-_5Ud1Y",
            authDomain: "whatsapp-clone-e8a66.firebaseapp.com",
            projectId: "whatsapp-clone-e8a66",
            storageBucket: "whatsapp-clone-e8a66.appspot.com",
            messagingSenderId: "905823337223",
            appId: "1:905823337223:web:499afce93520f5b52c23a2",
            measurementId: "G-CY72QN8QVS"
          };

        this.init();
    }

    init() {        
        // Initialize Firebase

        if(!window._initializedFirebase){

            const app = initializeApp(this._config);

            window._initializedFirebase = true;
        }
        
    }

    static db() {

        return getFirestore();

    }

    static hd() {

        return getStorage(app);

    }

    initAuth() {

        return new Promise((s, f) => {

            const provider = new GoogleAuthProvider();

            const auth = getAuth();
            signInWithPopup(auth, provider)
              .then((result) => {
                // This gives you a Google Access Token. You can use it to access the Google API.
                const credential = GoogleAuthProvider.credentialFromResult(result);
                const token = credential.accessToken;
                // The signed-in user info.
                const user = result.user;

                s({
                    user,
                    token
                })
                // ...
              }).catch((error) => {
                // Handle Errors here.
                const errorCode = error.code;
                const errorMessage = error.message;
                // The email of the user's account used.
                const email = error.email;
                // The AuthCredential type that was used.
                const credential = GoogleAuthProvider.credentialFromError(error);
                // ...
              });

        })
    }

}