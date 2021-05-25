import {
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  MenuItem,
  TextField,
  Divider,
  IconButton,
} from "@material-ui/core";
import { FirebaseAuthConsumer } from "@react-firebase/auth";
import axios from "axios";
import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import App from "./App";
import { API } from "./config";
import Sidebar from "./Sidebar";
import firebase from "firebase/app";
import { getAccList } from "./actions";
import { Pagination } from "@material-ui/lab";
import { MdDelete } from "react-icons/md";

export default function Transactions() {
  const acc = useSelector((state) => state.accounts);
  const transactions = useSelector((state) => state.transactions);
  const [val, setVal] = useState(0);
  const dispatch = useDispatch();
  const handleChange = (e) => {
    setVal(e.target.value);
  };
  useEffect(() => {
    axios
      .get(`${API}/accounts/${firebase.auth().currentUser.uid}`)
      .then((res) => {
        console.log(res.data);
        if (res.data.length > 1) dispatch(getAccList(res.data));
      })
      .catch((err) => console.error(err));
  }, []);
  return (
    <>
      <FirebaseAuthConsumer>
        {({ isSignedIn, user, providerId }) => (
          <>
            <App user={user} />
            <div className="main home">
              <div style={{ padding: "10px" }}>
                <TextField
                  id="account"
                  name="account"
                  style={{ minWidth: "200px" }}
                  select
                  label="Account"
                  variant="outlined"
                  value={val}
                  onChange={handleChange}>
                  {acc.map((data, index) => (
                    <MenuItem key={`${index}-menu`} value={index}>
                      {data.accountName}
                    </MenuItem>
                  ))}
                </TextField>
                {transactions && (
                  <Table id={acc[val].id} accountName={acc[val].accountName} />
                )}
              </div>
              <Sidebar />
            </div>
          </>
        )}
      </FirebaseAuthConsumer>
    </>
  );
}

const Table = (props) => {
  const [data, setData] = useState([]);
  const [page, setPage] = useState(1);
  const [count, setCount] = useState(0);
  const acc = useSelector((state) => state.accounts);
  const rows = (data, accountName) => {
    let rows = [];
    if (accountName === "Cash") {
      data.map((d) => {
        rows.push({
          id: d.id,
          amount: d.amount,
          description: d.description,
          updatedAt:
            d.updatedAt &&
            Intl.DateTimeFormat(undefined, {
              day: "numeric",
              month: "short",
            }).format(new Date(d.updatedAt)),
          balance: `${acc[0].initialBalance + d.balance}`,
          actions: <DeleteButton accountName={accountName} rowId={d.id} />,
        });
        return 0;
      });
    } else {
      data.map((d) => {
        rows.push({
          id: d.id,
          month:
            d.month &&
            Intl.DateTimeFormat(undefined, {
              month: "short",
              year: "numeric",
            }).format(new Date(d.month)),
          openingBalance: d.openingBalance,
          closingBalance: d.closingBalance,
          debit: d.debit,
          credit: d.credit,
          actions: (
            <DeleteButton
              accountName={accountName}
              id={d.account_id}
              rowId={d.id}
            />
          ),
        });
        return 0;
      });
    }
    return rows;
  };
  useEffect(() => {
    if (props.accountName === "Cash") {
      axios
        .get(`${API}/cash/all/count/${firebase.auth().currentUser.uid}`)
        .then((res) => {
          setCount(res.data[0]["count(*)"]);
          axios
            .get(`${API}/cash/all/${firebase.auth().currentUser.uid}/20/0`)
            .then((res) => {
              setPage(1);
              setData(res.data);
            })
            .catch((err) => console.error(err));
        })
        .catch((err) => console.error(err));
    } else {
      axios
        .get(
          `${API}/banks/all/count/${props.id}/${
            firebase.auth().currentUser.uid
          }`
        )
        .then((res) => {
          setCount(res.data[0]["count(*)"]);
          axios
            .get(
              `${API}/banks/${props.id}/${firebase.auth().currentUser.uid}/12/0`
            )
            .then((res) => {
              setPage(1);
              setData(res.data);
            })
            .catch((err) => console.error(err));
        })
        .catch((err) => console.error(err));
    }
  }, [props.accountName, props.id]);
  const deleteData = (accountName, id, data) => {
    if (accountName === "Cash") {
      axios
        .delete(`${API}/cash/delete/${data}`)
        .then((res) => {
          setCount((c) => c - 1);
          pageChange(accountName, id, page);
        })
        .catch((err) => console.error(err));
    } else {
      axios
        .delete(`${API}/banks/delete/${data}`)
        .then((res) => {
          setCount((c) => c - 1);
          pageChange(accountName, id, page);
        })
        .catch((err) => console.error(err));
    }
  };
  const DeleteButton = (props) => {
    return (
      <IconButton
        onClick={() => deleteData(props.accountName, props.id, props.rowId)}
        color="secondary">
        <MdDelete />
      </IconButton>
    );
  };
  const pageChange = (accountName, id, page) => {
    if (accountName === "Cash") {
      axios
        .get(
          `${API}/cash/all/${firebase.auth().currentUser.uid}/20/${
            (page - 1) * 20
          }`
        )
        .then((res) => {
          setData(res.data);
        })
        .catch((err) => console.error(err));
    } else {
      axios
        .get(
          `${API}/banks/${id}/${firebase.auth().currentUser.uid}/12/${
            (page - 1) * 12
          }`
        )
        .then((res) => {
          setData(res.data);
        })
        .catch((err) => console.error(err));
    }
  };
  return data.length > 0 ? (
    <div
      style={{ padding: "10px 0", display: "flex", flexDirection: "column" }}>
      <Transacs
        rows={rows(data, props.accountName)}
        accountName={props.accountName}
      />
      <div
        className="card transac-mob"
        style={{ padding: "0", display: "none", margin: "10px 0" }}>
        <TransacsMob
          rows={rows(data, props.accountName)}
          accountName={props.accountName}
        />
      </div>
      <Pagination
        className="pagination"
        style={{ alignSelf: "flex-end", margin: "10px 0" }}
        variant="outlined"
        count={Math.ceil(count / (props.accountName === "Cash" ? 20 : 12))}
        page={page}
        onChange={(event, value) => {
          setPage(value);
          pageChange(props.accountName, props.id, value);
        }}
      />
    </div>
  ) : (
    <p>No data available</p>
  );
};
function TransacsMob({ rows, accountName }) {
  const currencyFormat = (currency) => {
    let val = new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(currency);
    return val;
  };
  return (
    <List dense={true}>
      {accountName === "Cash"
        ? rows.map((data, index) => (
            <div key={index}>
              <ListItem>
                <ListItemText
                  primary={<b>{data.description}</b>}
                  secondary={`${data.updatedAt}`}
                />
                <ListItemSecondaryAction
                  style={{
                    textAlign: "right",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}>
                  <div
                    style={
                      ({ marginRight: "5px" },
                      data.amount > 0 ? { color: "green" } : { color: "red" })
                    }>
                    {`${data.amount > 0 ? "+" : ""}${currencyFormat(
                      data.amount
                    )}`}
                  </div>
                  <div
                    style={{
                      marginLeft: "5px",
                      borderLeft: "1px solid var(--border)",
                    }}>
                    {data.actions}
                  </div>
                </ListItemSecondaryAction>
              </ListItem>
              {index === rows.length - 1 ? null : <Divider />}
            </div>
          ))
        : rows.map((data, index) => (
            <div key={index}>
              <ListItem>
                <ListItemText
                  primary={data.month}
                  secondary={`${currencyFormat(data.closingBalance)} [${
                    -data.debit + data.credit
                  }]`}
                />
                <ListItemSecondaryAction
                  style={{ textAlign: "right", display: "flex" }}>
                  <div style={{ marginRight: "5px" }}>
                    <div style={{ color: "red" }}>
                      {currencyFormat(-data.debit)}
                    </div>
                    <div style={{ color: "green" }}>
                      {"+" + currencyFormat(data.credit)}
                    </div>
                  </div>
                  <div
                    style={{
                      marginLeft: "5px",
                      borderLeft: "1px solid var(--border)",
                    }}>
                    {data.actions}
                  </div>
                </ListItemSecondaryAction>
              </ListItem>
              {index === rows.length - 1 ? null : <Divider />}
            </div>
          ))}
    </List>
  );
}

function Transacs({ rows, accountName }) {
  // const currencyFormat = (currency) => {
  //   let val = new Intl.NumberFormat("en-IN", {
  //     style: "currency",
  //     currency: "INR",
  //     maximumFractionDigits: 0,
  //   }).format(currency);
  //   return val;
  // };
  return (
    <table
      style={{ width: "100%", margin: 0 }}
      id="transaction-table"
      className="transac-comp">
      <thead>
        {accountName === "Cash" ? (
          <tr>
            <th>Date</th>
            <th>Amount</th>
            <th>Description</th>
            <th>Balance</th>
            <th>Actions</th>
          </tr>
        ) : (
          <tr>
            <th>Month</th>
            <th>Opening Balance</th>
            <th>Debit (-)</th>
            <th>Credit (+)</th>
            <th>Closing Balance</th>
            <th>Actions</th>
          </tr>
        )}
      </thead>
      <tbody>
        {rows.map((data, index) =>
          accountName === "Cash" ? (
            <tr key={index}>
              <td>{data.updatedAt}</td>
              <td align="right">{data.amount}</td>
              <td>{data.description}</td>
              <td align="right">{data.balance}</td>
              <td align="center">{data.actions}</td>
            </tr>
          ) : (
            <tr key={index}>
              <td>{data.month}</td>
              <td align="right">{data.openingBalance}</td>
              <td align="right">{data.debit}</td>
              <td align="right">{data.credit}</td>
              <td align="right">{data.closingBalance}</td>
              <td align="center">{data.actions}</td>
            </tr>
          )
        )}
      </tbody>
    </table>
  );
}
