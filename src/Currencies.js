import {
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  MenuItem,
  TextField,
  Divider,
  IconButton,
  Button,
  ListSubheader,
  ListItemIcon,
} from "@material-ui/core";
import { FirebaseAuthConsumer } from "@react-firebase/auth";
import axios from "axios";
import React, { useEffect, useState } from "react";
import App from "./App";
import { API, key } from "./config";
import Sidebar from "./Sidebar";
import firebase from "firebase/app";
import { MdAdd, MdDelete } from "react-icons/md";

export default function Currencies() {
  const [list, setList] = useState([
    {
      currency: "INR",
      name: "Indian Rupee",
      symbol: "₹",
    },
    {
      currency: "USD",
      name: "United States Dollar",
      symbol: "$",
    },
  ]);
  const [rates, setRates] = useState([]);
  const [val, setVal] = useState(0);
  const handleChange = (e) => {
    setVal(e.target.value);
  };
  const currencyList = [
    {
      currency: "",
      name: "Select",
      symbol: "",
    },
    {
      currency: "INR",
      name: "Indian Rupee",
      symbol: "₹",
    },
    {
      currency: "USD",
      name: "United States Dollar",
      symbol: "$",
    },
    {
      currency: "GBP",
      name: "Great Britain Pound",
      symbol: "£",
    },
    {
      currency: "EUR",
      name: "Euro",
      symbol: "€",
    },
    {
      currency: "JPY",
      name: "Japanese Yen",
      symbol: "¥",
    },
    {
      currency: "AUD",
      name: "Australian Dollar",
      symbol: "$",
    },
  ];
  const readData = () => {
    axios
      .get(`${API}/currencies/${firebase.auth().currentUser.uid}`)
      .then((res) => {
        console.log(res.data);
        if (res.data.length > 0) {
          setList(res.data);
          setVal(0);
        }
      })
      .catch((err) => console.error(err));
  };
  useEffect(() => {
    readData();
    let c = "USD,AUD,INR,GBP,JPY,EUR";
    axios
      .get(
        `http://data.fixer.io/api/latest?access_key=${key}&symbols=${c}&format=1`
      )
      .then((res) => {
        console.log(res.data.rates);
        setRates(res.data.rates);
      })
      .catch((err) => console.error(err));
  }, []);
  const handleClick = () => {
    let arr = [];
    if (val !== 0) {
      if (list.length === 2) {
        arr = [
          {
            currency: "INR",
            name: "Indian Rupee",
            symbol: "₹",
            user_id: firebase.auth().currentUser.uid,
            updatedAt: new Date().toISOString().substr(0, 10),
            createdAt: new Date().toISOString().substr(0, 10),
          },
          {
            currency: "USD",
            name: "United States Dollar",
            symbol: "$",
            user_id: firebase.auth().currentUser.uid,
            updatedAt: new Date().toISOString().substr(0, 10),
            createdAt: new Date().toISOString().substr(0, 10),
          },
          {
            currency: currencyList[val].currency,
            symbol: currencyList[val].symbol,
            name: currencyList[val].name,
            user_id: firebase.auth().currentUser.uid,
            updatedAt: new Date().toISOString().substr(0, 10),
            createdAt: new Date().toISOString().substr(0, 10),
          },
        ];
        axios
          .post(`${API}/currencies/add`, arr)
          .then(() => readData())
          .catch((err) => console.error(err));
      } else {
        axios
          .post(`${API}/currencies/add`, [
            {
              currency: currencyList[val].currency,
              symbol: currencyList[val].symbol,
              name: currencyList[val].name,
              user_id: firebase.auth().currentUser.uid,
              updatedAt: new Date().toISOString().substr(0, 10),
              createdAt: new Date().toISOString().substr(0, 10),
            },
          ])
          .then(() => readData())
          .catch((err) => console.error(err));
      }
    }
  };
  const deleteData = (id) => {
    axios
      .delete(`${API}/currencies/delete/${id}`)
      .then(() => readData())
      .catch((err) => console.error(err));
  };
  const currencyFormat = (currency, symbol) => {
    let val = new Intl.NumberFormat(undefined, {
      style: "currency",
      currency: symbol,
      maximumFractionDigits: 3,
    }).format(currency);
    return val;
  };
  return (
    <>
      <FirebaseAuthConsumer>
        {({ isSignedIn, user, providerId }) => (
          <>
            <App user={user} />
            <div className="main home">
              <div style={{ padding: "10px 0" }}>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "flex-start",
                  }}>
                  <TextField
                    id="currency"
                    name="currency"
                    style={{ minWidth: "250px" }}
                    select
                    label="Add currency"
                    variant="outlined"
                    value={val}
                    onChange={handleChange}>
                    {currencyList.map((data, index) => {
                      let bool = true;
                      list.map((data2) => {
                        if (data2.name === data.name) {
                          bool = false;
                        }
                      });
                      return (
                        bool && (
                          <MenuItem key={`${index}-menu`} value={index}>
                            {`${data.symbol} ${data.name}`}
                          </MenuItem>
                        )
                      );
                    })}
                  </TextField>
                  <Button
                    onClick={handleClick}
                    style={{ marginLeft: "10px" }}
                    variant="contained"
                    color="primary"
                    startIcon={<MdAdd />}>
                    Add
                  </Button>
                </div>
                <div>
                  <List>
                    <ListSubheader>Your Currencies</ListSubheader>
                    {list.map((data, index) => (
                      <div key={index}>
                        <ListItem>
                          <ListItemIcon className="transac-comp">{`${data.symbol}`}</ListItemIcon>
                          <ListItemText
                            primary={`${data.name}`}
                            secondary={data.currency}
                          />
                          <ListItemSecondaryAction>
                            <div
                              style={{
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                              }}>
                              {index > 0 && (
                                <div>
                                  <p
                                    style={{
                                      padding: "0",
                                      fontSize: "smaller",
                                    }}>{`₹1 = ${currencyFormat(
                                    rates["INR"] / rates[data.currency],
                                    data.currency
                                  )}`}</p>
                                  <p
                                    style={{
                                      padding: "0",
                                      fontSize: "smaller",
                                    }}>{`${data.symbol}1 = ${currencyFormat(
                                    rates[data.currency] / rates["INR"],
                                    "INR"
                                  )}`}</p>
                                </div>
                              )}
                              {index > 1 && (
                                <div
                                  style={{
                                    marginLeft: "5px",
                                    borderLeft: "1px solid var(--border)",
                                  }}>
                                  <IconButton
                                    color="secondary"
                                    onClick={() => deleteData(data.id)}>
                                    <MdDelete />
                                  </IconButton>
                                </div>
                              )}
                            </div>
                          </ListItemSecondaryAction>
                        </ListItem>
                        {index === list.length - 1 ? null : <Divider />}
                      </div>
                    ))}
                  </List>
                </div>
              </div>
              <Sidebar />
            </div>
          </>
        )}
      </FirebaseAuthConsumer>
    </>
  );
}
