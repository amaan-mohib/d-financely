import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  InputAdornment,
  MenuItem,
  TextField,
  useMediaQuery,
  useTheme,
} from "@material-ui/core";
import { ToggleButton, ToggleButtonGroup } from "@material-ui/lab";
import { useFormik } from "formik";
import React, { useEffect, useState } from "react";
import { MdAdd, MdCheck, MdRemove } from "react-icons/md";
import firebase from "firebase/app";
import { Link } from "react-router-dom";

export default function Sidebar() {
  const [open, setOpen] = useState(false);
  const [val, setVal] = useState("");
  const [budget, setBudget] = useState("");
  const [bal, setBal] = useState([
    {
      accountName: "Cash",
      balance: 0,
      index: 0,
      updatedAt: "Never",
    },
  ]);
  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);
  const handleChange = (event) => {
    setVal(event.target.value);
  };
  const fs = useMediaQuery(useTheme().breakpoints.down("xs"));
  const formik = useFormik({
    initialValues: {
      account: 0,
      desc: "",
      amount: 0,
      amountType: "debit",
      date: new Date().toISOString().substr(0, 10),
      debit: 0,
      credit: 0,
      openingBal: 0,
      createdAt: new Date(),
    },
    onSubmit: (values, actions) => {
      console.log(values);
      let db = firebase.firestore();
      let docRef = db.collection(
        `${firebase.auth().currentUser.uid}-${values.account}`
      );
      docRef
        .doc(`${values.date}`)
        .set(values)
        .then(() => {
          docRef
            .orderBy("date", "desc")
            .limit(1)
            .get()
            .then((query) => {
              query.forEach((doc) => {
                let arr = doc.data();
                let dr = db
                  .collection("users")
                  .doc(`${firebase.auth().currentUser.uid}`);
                dr.get()
                  .then((doc) => {
                    if (doc.data().balance) {
                      doc.data().balance.map((doc) => {
                        let d = doc;
                        if (d.updatedAt !== arr.date) {
                          if (d.index === arr.account) {
                            dr.update({
                              balance: firebase.firestore.FieldValue.arrayRemove(
                                d
                              ),
                            })
                              .then(() => {
                                console.log("removed");
                                dr.update({
                                  balance: firebase.firestore.FieldValue.arrayUnion(
                                    {
                                      accountName: d.accountName,
                                      balance:
                                        d.index === 0
                                          ? arr.amountType === "debit"
                                            ? Number(d.balance) -
                                              Number(arr.amount)
                                            : Number(d.balance) +
                                              Number(arr.amount)
                                          : Number(arr.openingBal) +
                                            Number(arr.credit) -
                                            Number(arr.debit),
                                      index: d.index,
                                      updatedAt: arr.date,
                                    }
                                  ),
                                })
                                  .then(() => {
                                    console.log("updated");
                                    //ho gaya
                                  })
                                  .catch((err) => console.error(err));
                              })
                              .catch((err) => console.error(err));
                          }
                        }
                      });
                    } else {
                      dr.set(
                        {
                          balance: [
                            {
                              accountName: "Cash",
                              balance:
                                arr.amountType === "debit"
                                  ? 0 - Number(arr.amount)
                                  : 0 + Number(arr.amount),
                              index: 0,
                              updatedAt: arr.date,
                            },
                          ],
                        },
                        { merge: true }
                      )
                        .then(() => {
                          console.log("set");
                          //ho gaya
                        })
                        .catch((err) => console.error(err));
                    }
                  })
                  .catch((err) => console.error(err));
              });
            });
        })
        .catch((err) => console.error(err));
      actions.resetForm();
      handleClose();
    },
  });
  const updateBudget = (budget) => {
    let db = firebase.firestore();
    let docRef = db
      .collection("users")
      .doc(`${firebase.auth().currentUser.uid}`);
    docRef
      .set(
        {
          budget: budget,
        },
        { merge: true }
      )
      .then(() => setBudget(budget))
      .catch((err) => console.error(err));
  };
  useEffect(() => {
    let db = firebase.firestore();
    let docRef = db
      .collection("users")
      .doc(`${firebase.auth().currentUser.uid}`);
    docRef.get().then((data) => {
      if (data.data().balance) {
        let arr = data.data().balance;
        arr.sort((a, b) => a.index - b.index);
        setBal(arr);
      }
    });
    let unsub = docRef.onSnapshot((data) => {
      if (data.exists) {
        if (data.data().budget) {
          setVal(data.data().budget);
          setBudget(data.data().budget);
        }
      }
    });
    return () => {
      unsub();
    };
  }, []);

  return (
    <div className="sidebar">
      <Button
        onClick={handleOpen}
        variant="outlined"
        color="primary"
        startIcon={<MdAdd />}
        fullWidth>
        Add Record
      </Button>
      <Dialog open={open} onClose={handleClose} fullScreen={fs}>
        <DialogTitle>Add Record</DialogTitle>

        <form onSubmit={formik.handleSubmit}>
          <DialogContent className="dialog">
            <TextField
              id="account"
              name="account"
              fullWidth
              select
              label="Account"
              variant="outlined"
              value={formik.values.account}
              onChange={formik.handleChange}>
              {bal.map((data, index) => (
                <MenuItem key={`${index}-menu`} value={data.index}>
                  {data.accountName}
                </MenuItem>
              ))}
            </TextField>
            {formik.values.account === 0 ? (
              <>
                <TextField
                  id="desc"
                  name="desc"
                  fullWidth
                  label="Description"
                  variant="outlined"
                  value={formik.values.desc}
                  onChange={formik.handleChange}
                />
                <TextField
                  id="amount"
                  name="amount"
                  placeholder="1000"
                  label="Amount"
                  type="number"
                  fullWidth
                  value={formik.values.amount}
                  onChange={formik.handleChange}
                  variant="outlined"
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">₹</InputAdornment>
                    ),
                    endAdornment: (
                      <InputAdornment position="end">
                        <ToggleButtonGroup
                          id="amountType"
                          name="amountType"
                          exclusive
                          value={formik.values.amountType}
                          onChange={formik.handleChange}>
                          <ToggleButton
                            title="Credit"
                            value="credit"
                            name="amountType">
                            <MdAdd name="amountType" />
                          </ToggleButton>
                          <ToggleButton
                            title="Debit"
                            value="debit"
                            name="amountType">
                            <MdRemove name="amountType" />
                          </ToggleButton>
                        </ToggleButtonGroup>
                      </InputAdornment>
                    ),
                  }}
                />
              </>
            ) : (
              <>
                <TextField
                  id="openingBal"
                  type="number"
                  name="openingBal"
                  placeholder="1000"
                  label="Opening Balance"
                  fullWidth
                  value={formik.values.openingBal}
                  onChange={formik.handleChange}
                  variant="outlined"
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">₹</InputAdornment>
                    ),
                  }}
                />
                <TextField
                  id="debit"
                  name="debit"
                  type="number"
                  placeholder="1000"
                  label="Debit"
                  fullWidth
                  value={formik.values.debit}
                  onChange={formik.handleChange}
                  variant="outlined"
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">₹</InputAdornment>
                    ),
                  }}
                />
                <TextField
                  id="credit"
                  name="credit"
                  type="number"
                  placeholder="1000"
                  label="Credit"
                  fullWidth
                  value={formik.values.credit}
                  onChange={formik.handleChange}
                  variant="outlined"
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">₹</InputAdornment>
                    ),
                  }}
                />
              </>
            )}
            <TextField
              id="date"
              name="date"
              fullWidth
              label="Date"
              type="date"
              variant="outlined"
              value={formik.values.date}
              onChange={formik.handleChange}
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={handleClose} color="primary">
              Cancel
            </Button>
            <Button type="submit" color="primary">
              SAVE
            </Button>
          </DialogActions>
        </form>
      </Dialog>
      <div className="card" style={{ fontSize: "smaller" }}>
        <p>Base: ₹ (INR)</p>
        <p>Secondary: $ (USD)</p>
        <Link to="/currencies">Show more &gt;</Link>
      </div>
      <TextField
        placeholder="1000"
        label="Budget"
        value={val}
        onChange={handleChange}
        variant="filled"
        InputProps={{
          startAdornment: <InputAdornment position="start">₹</InputAdornment>,
          endAdornment:
            val !== "" && val !== budget ? (
              <InputAdornment position="end">
                <IconButton
                  onClick={() => {
                    updateBudget(Number(val));
                  }}>
                  <MdCheck style={{ color: "green" }} />
                </IconButton>
              </InputAdornment>
            ) : null,
        }}
      />
    </div>
  );
}
