import React, { useEffect } from "react";
import ReactDOM from "react-dom";
import "./index.css";
import * as serviceWorkerRegistration from "./serviceWorkerRegistration";
import reportWebVitals from "./reportWebVitals";
import Home from "./Home";
import { firebaseConfig, firebaseInit } from "./firebase";
import { Route, BrowserRouter as Router, Switch } from "react-router-dom";
import Login, { IfUnAuthed } from "./Login";
import {
  FirebaseAuthProvider,
  IfFirebaseAuthed,
  IfFirebaseUnAuthed,
} from "@react-firebase/auth";
import firebase from "firebase/app";
import "firebase/auth";
import Profile from "./Profile";

ReactDOM.render(<Paths />, document.getElementById("root"));

function Paths() {
  useEffect(() => {
    firebaseInit();
  }, []);
  return (
    <Router>
      <FirebaseAuthProvider firebase={firebase} {...firebaseConfig}>
        <IfFirebaseAuthed>
          <Switch>
            <Route path="/" exact component={Home} />
            <Route path="/login" component={Login} />
            <Route path="/profile" component={Profile} />
          </Switch>
        </IfFirebaseAuthed>
        <IfFirebaseUnAuthed>
          <Switch>
            <Route path="/" component={IfUnAuthed} />
          </Switch>
        </IfFirebaseUnAuthed>
      </FirebaseAuthProvider>
    </Router>
  );
}

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://cra.link/PWA
serviceWorkerRegistration.register();

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
