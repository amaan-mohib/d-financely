import React, { useEffect, useState } from "react";
import firebase from "firebase/app";
import "firebase/auth";
import { Link } from "react-router-dom";
import { firebaseUI } from "./firebase";

export default function Login() {
  const [home, setHome] = useState(false);
  useEffect(() => {
    firebaseUI();
    if (firebase.auth().currentUser) setHome(true);
  }, []);
  return (
    <div className="login">
      <div>
        <h1>Login</h1>
        <p style={{ fontSize: "small" }}>
          Sign in to keep track of your expenses and transactions.
        </p>
      </div>
      <div id="firebaseui-auth-container"></div>
      <div id="loader">Loading...</div>
      {home ? <Link to="/">Home</Link> : null}
    </div>
  );
}

export function IfUnAuthed() {
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    let unsub = firebase.auth().onAuthStateChanged((user) => {
      if (user) {
        setLoading(false);
      } else {
        setLoading(false);
      }
    });
    return () => {
      unsub();
    };
  }, []);
  return (
    <>
      <nav style={{ justifyContent: "center" }}>
        <Link to="/" className="drawer-links">
          <h1 className="heading">δ Financely</h1>
        </Link>
      </nav>
      <div className="main signed-out">
        {loading ? <div className="loader"></div> : <Login />}
      </div>
    </>
  );
}
