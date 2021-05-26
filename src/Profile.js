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
import { MdCheck, MdDelete, MdPersonAdd, MdSearch } from "react-icons/md";
import { GrCurrency } from "react-icons/gr";
import { Link } from "react-router-dom";
import App from "./App";
import firebase from "firebase/app";
import { signOut } from "./firebase";
import { banks } from "./banks";
import { Autocomplete } from "@material-ui/lab";
import Axios from "axios";
import { API } from "./config";
import { useDispatch, useSelector } from "react-redux";
import { getAccList } from "./actions";

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
  const acc = useSelector((state) => state.accounts);
  const dispatch = useDispatch();
  const readData = () => {
    Axios.get(`${API}/accounts/${firebase.auth().currentUser.uid}`)
      .then((res) => {
        console.log(res.data);
        if (res.data.length > 0) {
          dispatch(getAccList(res.data));
          setVal(res.data[0].initialBalance);
          setInitBal(res.data[0].initialBalance);
        }
      })
      .catch((err) => console.error(err));
  };
  useEffect(() => {
    readData();
  }, [dispatch]);
  const [val, setVal] = useState(0);
  const [initialBal, setInitBal] = useState(0);
  const handleChange = (event) => {
    console.log(initialBal);
    setVal(event.target.value);
  };
  const updateBal = (amount) => {
    Axios.put(`${API}/accounts/updateInitialBal`, {
      accountName: "Cash",
      initialBal: amount,
      updatedAt: new Date().toISOString().substr(0, 10),
      user_id: firebase.auth().currentUser.uid,
    })
      .then(() => {
        setInitBal(amount);
        readData();
      })
      .catch((err) => console.error(err));
  };
  const handleClick = (data) => {
    Axios.delete(`${API}/accounts/delete`, {
      data: {
        accountName: data.accountName,
        user_id: data.user_id,
      },
    })
      .then(() => {
        readData();
      })
      .catch((err) => console.error(err));
  };
  return (
    <>
      {acc[0].updatedAt === "Never" ? null : (
        <TextField
          placeholder="0"
          label="Cash Initial Balance"
          type="number"
          value={val}
          onChange={handleChange}
          style={{ margin: "10px 0" }}
          variant="outlined"
          fullWidth
          InputProps={{
            startAdornment: <InputAdornment position="start">₹</InputAdornment>,
            endAdornment:
              val !== "" && val !== initialBal ? (
                <InputAdornment position="end">
                  <IconButton
                    onClick={() => {
                      updateBal(Number(val));
                    }}>
                    <MdCheck style={{ color: "green" }} />
                  </IconButton>
                </InputAdornment>
              ) : null,
          }}
        />
      )}

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
  const acc = useSelector((state) => state.accounts);
  const dispatch = useDispatch();
  const handleClick = (d) => {
    const readData = () => {
      Axios.get(`${API}/accounts/${firebase.auth().currentUser.uid}`)
        .then((res) => {
          console.log(res.data);
          if (res.data.length > 0) dispatch(getAccList(res.data));
        })
        .catch((err) => console.error(err));
    };

    if (acc.length > 0) {
      Axios.post(`${API}/accounts/add`, [
        {
          accountName: d,
          balance: 0,
          user_id: firebase.auth().currentUser.uid,
          updatedAt: new Date().toISOString().substr(0, 10),
        },
      ])
        .then(() => {
          readData();
          handleClose();
          console.log("updated");
        })
        .catch((err) => console.error(err));
    } else {
      Axios.post(`${API}/accounts/add`, [
        {
          accountName: "Cash",
          balance: 0,
          user_id: firebase.auth().currentUser.uid,
          updatedAt: new Date().toISOString().substr(0, 10),
        },
        {
          accountName: d,
          balance: 0,
          user_id: firebase.auth().currentUser.uid,
          updatedAt: new Date().toISOString().substr(0, 10),
        },
      ])
        .then(() => {
          readData();
          handleClose();
          console.log("updated");
        })
        .catch((err) => console.error(err));
    }
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
                console.log(`${bank}${accountNo ? ` - ${accountNo}` : ""}`);
                handleClick(`${bank}${accountNo ? ` - ${accountNo}` : ""}`);
              }}>
              Continue
            </Button>
          )}
        </DialogActions>
      </Dialog>
    </>
  );
};
