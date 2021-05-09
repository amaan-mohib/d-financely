import {
  Button,
  Dialog,
  Divider,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  useTheme,
  useMediaQuery,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  InputAdornment,
  ListItemSecondaryAction,
  IconButton,
} from "@material-ui/core";
import { FirebaseAuthConsumer } from "@react-firebase/auth";
import React, { useEffect, useState } from "react";
import { AiOutlineBank } from "react-icons/ai";
import { MdDelete, MdPersonAdd, MdSearch } from "react-icons/md";
import { GrCurrency } from "react-icons/gr";
import { Link } from "react-router-dom";
import App from "./App";
import firebase from "firebase/app";
import { signOut } from "./firebase";
import { banks } from "./banks";
import { Autocomplete } from "@material-ui/lab";

export default function Profile() {
  return (
    <FirebaseAuthConsumer>
      {({ isSigned, user, providerId }) => {
        if (user) {
          return (
            <>
              <App user={user} />
              <div className="main profile-div">
                <div className="profile">
                  <img
                    referrerPolicy="no-referrer"
                    alt={user.displayName}
                    src={user.photoURL}
                    className="pfp"
                  />
                  <div>
                    <p>{user.displayName}</p>
                    <p className="email">{user.email}</p>
                  </div>
                  <Divider />
                  <List style={{ padding: 0 }}>
                    <List>
                      <AccountList />
                      <ListItem>
                        <DialogBox />
                      </ListItem>
                    </List>
                    <Divider />
                    <Link to="/login" className="drawer-links">
                      <ListItem button>
                        <ListItemIcon>
                          <MdPersonAdd className="black" />
                        </ListItemIcon>
                        <ListItemText>Change Account</ListItemText>
                      </ListItem>
                    </Link>
                    <Divider />
                  </List>
                  <Button
                    color="secondary"
                    variant="outlined"
                    style={{ marginTop: "20px" }}
                    onClick={signOut}>
                    Sign out
                  </Button>
                </div>
              </div>
            </>
          );
        }
      }}
    </FirebaseAuthConsumer>
  );
}
const AccountList = () => {
  const [acc, setAcc] = useState([
    {
      accountName: "Cash",
      balance: 0,
      index: 0,
      updatedAt: "Never",
    },
  ]);
  useEffect(() => {
    const db = firebase.firestore();
    let unsub = db
      .collection("users")
      .doc(firebase.auth().currentUser.uid)
      .onSnapshot((doc) => {
        if (doc.exists) {
          if (doc.data().balance) {
            let arr = doc.data().balance;
            arr.sort((a, b) => a.index - b.index);
            setAcc(arr);
          }
          console.log(doc.data());
        }
      });
    return () => {
      unsub();
    };
  }, []);
  const handleClick = (data) => {
    let db = firebase.firestore();
    let docRef = db
      .collection("users")
      .doc(`${firebase.auth().currentUser.uid}`);
    docRef
      .update({
        balance: firebase.firestore.FieldValue.arrayRemove(data),
      })
      .then(() => {
        console.log("removed");
      })
      .catch((err) => console.error(err));
  };
  return (
    <>
      {acc.map((data, index) => (
        <ListItem key={index + "-accList"}>
          <ListItemIcon>
            {data.accountName === "Cash" ? (
              <GrCurrency
                className="black"
                style={{ fontSize: "1.2rem", marginRight: "10px" }}
              />
            ) : (
              <AiOutlineBank
                className="black"
                style={{ fontSize: "1.2rem", marginRight: "10px" }}
              />
            )}
          </ListItemIcon>
          <ListItemText>{data.accountName}</ListItemText>
          {data.accountName !== "Cash" ? (
            <ListItemSecondaryAction>
              <IconButton
                edge="end"
                color="secondary"
                onClick={() => {
                  handleClick(data);
                }}>
                <MdDelete />
              </IconButton>
            </ListItemSecondaryAction>
          ) : null}
        </ListItem>
      ))}
    </>
  );
};
const DialogBox = () => {
  const [open, setOpen] = useState(false);
  const [bank, setBank] = useState("");
  const [accountNo, setAccount] = useState("");
  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);
  const handleClick = (d) => {
    let db = firebase.firestore();
    let docRef = db
      .collection("users")
      .doc(`${firebase.auth().currentUser.uid}`);
    docRef.get().then((doc) => {
      if (doc.data().balance) {
        docRef
          .update({
            balance: firebase.firestore.FieldValue.arrayUnion({
              accountName: d,
              index: doc.data().balance.length,
              balance: 0,
              updatedAt: "Never",
            }),
          })
          .then(() => {
            handleClose();
            console.log("updated");
          })
          .catch((err) => console.error(err));
      } else {
        docRef
          .set(
            {
              balance: [
                {
                  accountName: "Cash",
                  balance: 0,
                  index: 0,
                  updatedAt: "Never",
                },
                {
                  accountName: d,
                  balance: 0,
                  index: 1,
                  updatedAt: "Never",
                },
              ],
            },
            { merge: true }
          )
          .then(() => {
            handleClose();
            console.log("set");
          })
          .catch((err) => console.error(err));
      }
    });
  };

  const fs = useMediaQuery(useTheme().breakpoints.down("xs"));
  return (
    <>
      <Button
        fullWidth
        variant="outlined"
        onClick={handleOpen}
        color="primary"
        startIcon={<AiOutlineBank />}>
        Add bank account
      </Button>
      <Dialog open={open} onClose={handleClose} fullScreen={fs}>
        <DialogTitle>Add Bank</DialogTitle>
        <DialogContent>
          {bank === "" ? (
            <>
              <Autocomplete
                id="banks"
                freeSolo
                onChange={(event, value) => setBank(value)}
                options={banks}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    placeholder="Search"
                    fullWidth
                    variant="outlined"
                    InputProps={{
                      ...params.InputProps,
                      startAdornment: (
                        <InputAdornment position="start">
                          <MdSearch style={{ fontSize: "1.5rem" }} />
                        </InputAdornment>
                      ),
                    }}
                  />
                )}
              />
              <p style={{ margin: "10px 0" }}>Popular banks</p>
              <div>
                {banks.slice(0, 4).map((d, i) => (
                  <Button
                    key={i}
                    variant="outlined"
                    style={{ margin: "10px" }}
                    onClick={() => setBank(d)}>
                    {d}
                  </Button>
                ))}
              </div>
            </>
          ) : (
            <div>
              <b>{`${bank} - `}</b>
              <TextField
                style={{ margin: "10px 0" }}
                fullWidth
                variant="outlined"
                label="Account No*"
                placeholder="Last 4 digits"
                value={accountNo}
                type="number"
                onChange={(event) => setAccount(event.target.valueAsNumber)}
              />
              <p style={{ fontSize: "smaller" }}>
                *Account number is optional, used only for your convenience.
              </p>
            </div>
          )}
        </DialogContent>
        <DialogActions>
          <Button
            color="primary"
            onClick={() => {
              handleClose();
              setBank("");
            }}>
            Cancel
          </Button>
          {bank === "" ? null : (
            <Button
              color="primary"
              onClick={() => {
                console.log(`${bank}${accountNo ? `-${accountNo}` : ""}`);
                handleClick(`${bank}${accountNo ? `-${accountNo}` : ""}`);
              }}>
              Continue
            </Button>
          )}
        </DialogActions>
      </Dialog>
    </>
  );
};
