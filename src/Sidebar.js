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
import axios from "axios";
import { API } from "./config";
import { useDispatch, useSelector } from "react-redux";
import { getAccList, transacUpdate } from "./actions";

export default function Sidebar() {
  const [open, setOpen] = useState(false);
  const [val, setVal] = useState("");
  const [budget, setBudget] = useState("");
  // const [bal, setBal] = useState([
  //   {
  //     accountName: "Cash",
  //     balance: 0,
  //     index: 0,
  //     updatedAt: "Never",
  //   },
  // ]);
  const bal = useSelector((state) => state.accounts);
  const dispatch = useDispatch();
  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);
  const handleChange = (event) => {
    setVal(event.target.value);
  };
  const fs = useMediaQuery(useTheme().breakpoints.down("xs"));
  const readData = () => {
    dispatch(transacUpdate());
    axios
      .get(`${API}/accounts/${firebase.auth().currentUser.uid}`)
      .then((res) => {
        console.log(res.data);
        if (res.data.length > 0) {
          dispatch(getAccList(res.data));
          dispatch(transacUpdate());
        }
      })
      .catch((err) => console.error(err));
  };
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
      if (values.account === 0) {
        axios
          .post(`${API}/cash/add`, [
            {
              amount:
                values.amountType === "debit"
                  ? -Math.abs(values.amount)
                  : values.amount,
              description: values.desc,
              updatedAt: values.date,
              balance:
                bal[0].balance +
                (values.amountType === "debit"
                  ? -Math.abs(values.amount)
                  : values.amount),
              user_id: firebase.auth().currentUser.uid,
            },
          ])
          .then(() => {
            if (bal[0].updatedAt !== "Never") {
              axios
                .put(`${API}/accounts/update`, {
                  balance:
                    bal[0].balance +
                    (values.amountType === "debit"
                      ? -Math.abs(values.amount)
                      : values.amount),
                  updatedAt: values.date,
                  accountName: "Cash",
                  user_id: firebase.auth().currentUser.uid,
                })
                .then(() => {
                  readData();
                })
                .catch((err) => console.error(err));
            } else {
              axios
                .post(`${API}/accounts/add`, [
                  {
                    accountName: "Cash",
                    balance:
                      bal[0].balance +
                      (values.amountType === "debit"
                        ? -Math.abs(values.amount)
                        : values.amount),
                    updatedAt: values.date,
                    user_id: firebase.auth().currentUser.uid,
                  },
                ])
                .then(() => {
                  readData();
                })
                .catch((err) => console.error(err));
            }
          })
          .catch((err) => console.error(err));
      } else {
        axios
          .get(
            `${API}/banks/${bal[values.account].id}/${
              firebase.auth().currentUser.uid
            }/1`
          )
          .then((res) => {
            axios
              .post(`${API}/banks/add`, [
                {
                  account: bal[values.account].accountName,
                  month: values.date,
                  openingBalance: values.openingBal,
                  debit: values.debit,
                  credit: values.credit,
                  closingBalance:
                    values.openingBal + values.credit - values.debit,
                  user_id: firebase.auth().currentUser.uid,
                  account_id: bal[values.account].id,
                },
              ])
              .then(() => {
                let bool = true;
                if (res.data.length > 0) {
                  if (new Date(res.data[0].month) > new Date(values.date)) {
                    bool = false;
                  }
                }
                if (bool) {
                  axios
                    .put(`${API}/accounts/update`, {
                      balance: values.openingBal + values.credit - values.debit,
                      updatedAt: values.date,
                      accountName: bal[values.account].accountName,
                      user_id: firebase.auth().currentUser.uid,
                    })
                    .then(() => {
                      readData();
                    })
                    .catch((err) => console.error(err));
                }
              })
              .catch((err) => console.error(err));
          })
          .catch((err) => console.error(err));
      }
      actions.resetForm();
      handleClose();
    },
  });
  const updateBudget = (amount) => {
    // let db = firebase.firestore();
    // let docRef = db
    //   .collection("users")
    //   .doc(`${firebase.auth().currentUser.uid}`);
    // docRef
    //   .set(
    //     {
    //       budget: budget,
    //     },
    //     { merge: true }
    //   )
    //   .then(() => setBudget(budget))
    //   .catch((err) => console.error(err));
    if (budget === "") {
      axios
        .post(`${API}/budget/add`, [
          {
            amount: amount,
            user_id: firebase.auth().currentUser.uid,
          },
        ])
        .then(() => {
          setBudget(amount.toString());
        })
        .catch((err) => console.error(err));
    } else {
      axios
        .put(`${API}/budget/update`, {
          amount: amount,
          user_id: firebase.auth().currentUser.uid,
        })
        .then(() => setBudget(amount.toString()))
        .catch((err) => console.error(err));
    }
  };
  const readBudget = () => {
    axios
      .get(`${API}/budget/${firebase.auth().currentUser.uid}`)
      .then((res) => {
        console.log(res.data);
        if (res.data.length > 0) {
          setVal(res.data[0].amount);
          setBudget(res.data[0].amount);
        }
      })
      .catch((err) => console.error(err));
  };
  useEffect(() => {
    // let db = firebase.firestore();
    // let docRef = db
    //   .collection("users")
    //   .doc(`${firebase.auth().currentUser.uid}`);
    // docRef.get().then((data) => {
    //   if (data.data().balance) {
    //     let arr = data.data().balance;
    //     arr.sort((a, b) => a.index - b.index);
    //     setBal(arr);
    //   }
    // });
    // let unsub = docRef.onSnapshot((data) => {
    //   if (data.exists) {
    //     if (data.data().budget) {
    //       setVal(data.data().budget);
    //       setBudget(data.data().budget);
    //     }
    //   }
    // });
    // return () => {
    //   unsub();
    // };
    readBudget();
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
                <MenuItem key={`${index}-menu`} value={index}>
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
