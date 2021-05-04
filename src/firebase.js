import firebase from "firebase/app";
import "firebase/analytics";
import "firebase/auth";
import "firebase/firestore";
var firebaseui = require("firebaseui");

export const firebaseConfig = {
  apiKey: "AIzaSyCbAcZB8eDkdGyXdSdIPxbcq9iO-k1UH4U",
  authDomain: "d-financely.firebaseapp.com",
  projectId: "d-financely",
  storageBucket: "d-financely.appspot.com",
  messagingSenderId: "762847097835",
  appId: "1:762847097835:web:7fe83dd06b86dc416d5fae",
  measurementId: "G-4MRTCKZT4N",
};

export const firebaseInit = () => {
  //firebase.initializeApp(firebaseConfig);
  firebase.analytics();
  //firebase.auth();
  console.log(firebase);
};

export function firebaseUI() {
  let uiConfig = {
    callbacks: {
      // signInSuccessWithAuthResult: function (authResult, redirectUrl) {
      //   // User successfully signed in.
      //   // Return type determines whether we continue the redirect automatically
      //   // or whether we leave that to developer to handle.
      //   return true;
      // },
      uiShown: function () {
        // The widget is rendered.
        // Hide the loader.
        document.getElementById("loader").style.display = "none";
      },
    },
    // Will use popup for IDP Providers sign-in flow instead of the default, redirect.
    signInFlow: "popup",
    // signInSuccessUrl: "/",
    signInOptions: [
      // Leave the lines as is for the providers you want to offer your users.
      {
        provider: firebase.auth.GoogleAuthProvider.PROVIDER_ID,
        customParameters: { prompt: "select_account" },
      },
      firebase.auth.GithubAuthProvider.PROVIDER_ID,
    ],
    // Terms of service url.
    tosUrl: "<your-tos-url>",
    // Privacy policy url.
    privacyPolicyUrl: "<your-privacy-policy-url>",
  };

  let ui =
    firebaseui.auth.AuthUI.getInstance() ||
    new firebaseui.auth.AuthUI(firebase.auth());
  ui.start("#firebaseui-auth-container", uiConfig);
}
export const signOut = () => {
  firebase
    .auth()
    .signOut()
    .then(() => {
      window.location = "/";
    });
};
