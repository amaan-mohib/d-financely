import { FirebaseAuthConsumer } from "@react-firebase/auth";
import React from "react";
import App from "./App";

export default function NotFound() {
  return (
    <>
      <FirebaseAuthConsumer>
        {({ isSignedIn, user, providerId }) => (
          <>
            <App user={user} />
            <div
              className="main signed-out"
              style={{ flexDirection: "column" }}>
              <h1>404</h1>
              <p>Page not found</p>
            </div>
          </>
        )}
      </FirebaseAuthConsumer>
    </>
  );
}
