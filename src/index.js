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
import { createStore } from "redux";
import allReducers from "./reducers";
import { Provider } from "react-redux";
import Analytics from "./Analytics";
import Transactions from "./Transactions";
import Currencies from "./Currencies";
import { Helmet } from "react-helmet";
import NotFound from "./NotFound";

const store = createStore(allReducers);

ReactDOM.render(
  <Provider store={store}>
    <Paths />
  </Provider>,
  document.getElementById("root")
);

function Paths() {
  useEffect(() => {
    firebaseInit();
  }, []);
  const TitleComp = ({ title, desc }) => {
    const defaultTitle = "δ Financely";
    const defaultDesc =
      "Keep track of your expenses and transactions without connecting with your bank.";
    return (
      <Helmet>
        <title>{title ? `${defaultTitle} - ${title}` : defaultTitle}</title>
        <meta
          name="description"
          content={desc ? desc : defaultDesc}
          data-react-helmet="true"
        />
      </Helmet>
    );
  };

  const withTitle =
    ({ ChildComp, title, desc }) =>
    (props) =>
      (
        <>
          <TitleComp title={title} desc={desc} />
          <ChildComp {...props} />
        </>
      );

  const HomeComp = withTitle({
    ChildComp: Home,
  });
  const LoginComp = withTitle({
    ChildComp: Login,
    title: "Login",
  });
  const ProfileComp = withTitle({
    ChildComp: Profile,
    title: "Profile",
  });
  const AnalyticsComp = withTitle({
    ChildComp: Analytics,
    title: "Analytics",
  });
  const TransactionsComp = withTitle({
    ChildComp: Transactions,
    title: "Transactions",
  });
  const CurrenciesComp = withTitle({
    ChildComp: Currencies,
    title: "Currencies",
  });
  const NFComp = withTitle({
    ChildComp: NotFound,
    title: "404. Not Found",
  });
  return (
    <Router>
      <FirebaseAuthProvider firebase={firebase} {...firebaseConfig}>
        <IfFirebaseAuthed>
          <Switch>
            <Route path="/" exact component={HomeComp} />
            <Route path="/login" component={LoginComp} />
            <Route path="/profile" component={ProfileComp} />
            <Route path="/analytics" component={AnalyticsComp} />
            <Route path="/transactions" component={TransactionsComp} />
            <Route path="/currencies" component={CurrenciesComp} />
            <Route path="*" component={NFComp} />
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
