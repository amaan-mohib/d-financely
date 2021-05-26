import React, { useEffect, useState } from "react";
import {
  Divider,
  IconButton,
  List,
  ListItem,
  ListItemSecondaryAction,
  ListItemText,
  Tooltip,
} from "@material-ui/core";
import { DataGrid } from "@material-ui/data-grid";
import { FirebaseAuthConsumer } from "@react-firebase/auth";
import { Chart, Line } from "react-chartjs-2";
import { AiOutlineBank } from "react-icons/ai";
import { GrCurrency } from "react-icons/gr";
import { MdChevronRight, MdInfoOutline, MdSettings } from "react-icons/md";
import { Link } from "react-router-dom";
import firebase from "firebase/app";
import App from "./App";
import Sidebar from "./Sidebar";
import { useDispatch, useSelector } from "react-redux";
import { getAccList } from "./actions";
import axios from "axios";
import { API } from "./config";

export default function Home() {
  let img = null;
  let src = "";
  const status = () => {
    let time = new Date().getHours();
    let stat = "Good ";
    if (time < 12) {
      stat += "morning";
      src = "https://img.icons8.com/color/48/000000/sun--v1.png";
    } else if (time >= 12 && time <= 17) {
      stat += "afternoon";
      src = "https://img.icons8.com/color/48/000000/partly-cloudy-day--v1.png";
    } else {
      stat += "evening";
      src = "https://img.icons8.com/color/48/000000/full-moon.png";
    }

    return stat;
  };
  let hr = status();
  img = <img alt={hr} src={src} style={{ marginRight: "10px" }} />;
  return (
    <>
      <FirebaseAuthConsumer>
        {({ isSignedIn, user, providerId }) => (
          <>
            <App user={user} />
            <div className="main home">
              <header>
                <h1 className="salute" style={{ fontSize: "1.5rem" }}>
                  {img}
                  {Intl.DateTimeFormat("en", {
                    weekday: "short",
                    month: "short",
                    day: "numeric",
                  }).format(new Date())}
                </h1>
                <h1>
                  {hr}, {user.displayName.split(" ")[0]}
                </h1>
              </header>
              <Divider />
              <Balance />
              <Divider />
              <Sidebar />
              <Analytics />
              <Divider />
              <Transactions />
            </div>
          </>
        )}
      </FirebaseAuthConsumer>
    </>
  );
}
const Balance = () => {
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
  const readData = () => {
    axios
      .get(`${API}/accounts/${firebase.auth().currentUser.uid}`)
      .then((res) => {
        console.log(res.data);
        if (res.data.length > 0) dispatch(getAccList(res.data));
      })
      .catch((err) => console.error(err));
  };
  useEffect(() => {
    readData();
  }, [dispatch]);
  const BalCard = (props) => {
    return (
      <div className="card">
        <div style={{ display: "flex", alignItems: "center" }}>
          {props.accountName === "Cash" ? (
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
          <p>{props.accountName}</p>
        </div>
        {props.initialBalance === 0 && props.accountName === "Cash" ? (
          <Link to="/profile">
            <p
              className="email"
              style={{
                fontSize: "small",
                display: "flex",
                alignItems: "center",
              }}>
              <MdInfoOutline style={{ marginRight: 5 }} />
              Set initial balance to avoid discrepancies &gt;
            </p>
          </Link>
        ) : null}

        <h2 className="currency">
          {`${Intl.NumberFormat(undefined, {
            style: "currency",
            currency: "INR",
          }).format(
            props.accountName === "Cash"
              ? props.updatedAt === "Never"
                ? 0
                : Number(props.initialBalance + props.balance)
              : props.balance
          )}`}
        </h2>
        <p className="email" style={{ fontSize: "small" }}>
          Last record:&nbsp;
          {props.updatedAt === "Never"
            ? "Never"
            : new Date(props.updatedAt).toLocaleDateString(["en-IN", "en-US"])}
        </p>
      </div>
    );
  };
  return (
    <div className="balance">
      <div className="head">
        <p>
          <b>BALANCE</b>
        </p>
        <Link to="/profile">
          <Tooltip title="Settings">
            <IconButton>
              <MdSettings />
            </IconButton>
          </Tooltip>
        </Link>
      </div>
      <div className="bal-grid">
        {bal.map((data, index) => (
          <BalCard
            key={`${index}-${data.accountName}`}
            accountName={data.accountName}
            balance={data.balance}
            initialBalance={data.initialBalance}
            updatedAt={data.updatedAt}
          />
        ))}
      </div>
    </div>
  );
};
const Analytics = () => {
  const transactions = useSelector((state) => state.transactions);
  const acc = useSelector((state) => state.accounts);
  const [budget, setBudget] = useState(0);
  useEffect(() => {
    axios
      .get(`${API}/budget/${firebase.auth().currentUser.uid}`)
      .then((res) => {
        if (res.data.length > 0) {
          setBudget(res.data[0].amount);
        }
      })
      .catch((err) => console.error(err));
  }, []);

  const options = (e) => {
    return {
      responsive: true,
      plugins: {
        title: {
          display: true,
          text: e,
          align: "start",
        },
        legend: {
          display: false,
        },
      },
      scales: {
        x: {
          grid: {
            drawBorder: false,
            drawOnChartArea: false,
          },
        },
        y: {
          grid: {
            drawBorder: false,
            color: function (context) {
              if (context.tick.value === budget && e === "Expenses")
                return "#ff0000";
              else return Chart.defaults.borderColor;
            },
          },
        },
      },
    };
  };
  const balance = (data) => {
    let labels = [];
    let datasets = [];
    data.map((doc) => {
      labels.push(
        doc.month
          ? Intl.DateTimeFormat(undefined, {
              month: "short",
              year: "2-digit",
            }).format(new Date(doc.month))
          : Intl.DateTimeFormat(undefined, {
              day: "numeric",
              month: "numeric",
            }).format(new Date(doc.updatedAt))
      );
      datasets.push(
        doc.closingBalance
          ? doc.closingBalance
          : acc[0].initialBalance + doc.balance
      );
      return 0;
    });
    return {
      labels: labels.reverse(),
      datasets: [
        {
          label: "Balance",
          data: datasets.reverse(),
          fill: false,
          backgroundColor: "rgb(255, 99, 132)",
          borderColor: "rgb(255, 99, 132)",
          tension: 0.2,
        },
      ],
    };
  };
  const expenses = (data) => {
    let labels = [];
    let datasets = [];
    data.map((doc) => {
      labels.push(
        doc.month
          ? Intl.DateTimeFormat(undefined, {
              month: "short",
              year: "2-digit",
            }).format(new Date(doc.month))
          : Intl.DateTimeFormat(undefined, {
              day: "numeric",
              month: "numeric",
            }).format(new Date(doc.updatedAt))
      );
      datasets.push(doc.debit ? Math.abs(doc.credit - doc.debit) : doc.amount);
      return 0;
    });
    return {
      labels: labels.reverse(),
      datasets: [
        {
          label: "Expenses",
          data: datasets.reverse(),
          fill: false,
          backgroundColor: "rgb(255, 99, 132)",
          borderColor: "rgb(255, 99, 132)",
          tension: 0.2,
        },
      ],
    };
  };
  const Grid = (props) => {
    const [data, setData] = useState([]);
    useEffect(() => {
      if (props.accountName === "Cash") {
        axios
          .get(`${API}/cash/${firebase.auth().currentUser.uid}/4`)
          .then((res) => {
            setData(res.data);
          })
          .catch((err) => console.error(err));
      } else {
        axios
          .get(`${API}/banks/${props.id}/${firebase.auth().currentUser.uid}/4`)
          .then((res) => {
            setData(res.data);
          })
          .catch((err) => console.error(err));
      }
    }, [props.accountName, props.id]);
    return data.length > 0 ? (
      <div className="bal-grid">
        <div className="card">
          <Line data={balance(data)} options={options("Balance")} />
        </div>
        <div className="card">
          <Line data={expenses(data)} options={options("Expenses")} />
        </div>
      </div>
    ) : (
      <p>No data available</p>
    );
  };
  return (
    <div className="balance">
      <div className="head">
        <p>
          <b>ANALYTICS</b>
        </p>
        <Link to="/analytics">
          <Tooltip title="Show More">
            <IconButton>
              <MdChevronRight />
            </IconButton>
          </Tooltip>
        </Link>
      </div>
      <div className="card">
        {transactions &&
          acc.map((d, index) => {
            return (
              <div key={`${d.accountName}-${index}`}>
                <div>
                  <div style={{ display: "flex", alignItems: "center" }}>
                    {d.accountName === "Cash" ? (
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
                    <p>{d.accountName}</p>
                  </div>
                  <Grid id={d.id} accountName={d.accountName} />
                </div>
                <Divider />
              </div>
            );
          })}
      </div>
    </div>
  );
};
const Transactions = () => {
  const transactions = useSelector((state) => state.transactions);
  const acc = useSelector((state) => state.accounts);
  const cols = [
    { field: "id", headerName: "ID", width: 70, hide: true },
    { field: "month", headerName: "Month", width: 100 },
    {
      field: "openingBalance",
      headerName: "Opening Balance",
      type: "number",
      width: 190,
    },
    { field: "debit", headerName: "Debit (-)", type: "number", width: 125 },
    { field: "credit", headerName: "Credit (+)", type: "number", width: 125 },
    {
      field: "closingBalance",
      headerName: "Closing Balance",
      type: "number",
      width: 190,
    },
  ];
  const colsCash = [
    { field: "id", headerName: "ID", width: 70, hide: true },
    { field: "updatedAt", headerName: "Date", width: 100 },
    {
      field: "amount",
      headerName: "Amount",
      type: "number",
      width: 125,
    },
    { field: "description", headerName: "Description", width: 190 },
    { field: "balance", headerName: "Balance", type: "number", width: 125 },
  ];
  const rows = (data, accountName) => {
    let rows = [];
    if (accountName === "Cash") {
      data.map((d) => {
        rows.push({
          id: d.id,
          amount: d.amount,
          description: d.description,
          updatedAt: Intl.DateTimeFormat(undefined, {
            day: "numeric",
            month: "short",
          }).format(new Date(d.updatedAt)),
          balance: acc[0].initialBalance + d.balance,
        });
        return 0;
      });
    } else {
      data.map((d) => {
        rows.push({
          id: d.id,
          month: Intl.DateTimeFormat(undefined, {
            month: "short",
            year: "numeric",
          }).format(new Date(d.month)),
          openingBalance: d.openingBalance,
          closingBalance: d.closingBalance,
          debit: d.debit,
          credit: d.credit,
        });
        return 0;
      });
    }
    return rows;
  };
  const Table = (props) => {
    const [data, setData] = useState([]);
    useEffect(() => {
      if (props.accountName === "Cash") {
        axios
          .get(`${API}/cash/${firebase.auth().currentUser.uid}/4`)
          .then((res) => {
            setData(res.data);
          })
          .catch((err) => console.error(err));
      } else {
        axios
          .get(`${API}/banks/${props.id}/${firebase.auth().currentUser.uid}/4`)
          .then((res) => {
            setData(res.data);
          })
          .catch((err) => console.error(err));
      }
    }, [props.accountName, props.id]);
    return data.length > 0 ? (
      <>
        <div style={{ margin: "10px 0" }}>
          <DataGrid
            density="compact"
            columns={props.accountName === "Cash" ? colsCash : cols}
            rows={rows(data, props.accountName)}
            autoHeight={true}
            hideFooter={true}
            autoPageSize={true}
            className="transac-comp"
          />
        </div>
        <TransacsMob
          rows={rows(data, props.accountName)}
          accountName={props.accountName}
        />
      </>
    ) : (
      <p>No data available</p>
    );
  };
  return (
    <div className="balance">
      <div className="head">
        <p>
          <b>TRANSACTIONS</b>
        </p>
        <Link to="/transactions">
          <Tooltip title="Show More">
            <IconButton>
              <MdChevronRight />
            </IconButton>
          </Tooltip>
        </Link>
      </div>
      <div className="card">
        {transactions &&
          acc.map((d, index) => {
            return (
              <div key={`${d.accountName}-${index}`}>
                <div>
                  <div style={{ display: "flex", alignItems: "center" }}>
                    {d.accountName === "Cash" ? (
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
                    <p>{d.accountName}</p>
                  </div>
                  <Table id={d.id} accountName={d.accountName} />
                </div>
                {index === acc.length - 1 ? null : <Divider />}
              </div>
            );
          })}
      </div>
    </div>
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
    <div
      className="card transac-mob"
      style={{ padding: "0 5px", display: "none", margin: "10px 0" }}>
      <List dense={true}>
        {accountName === "Cash"
          ? rows.map((data, index) => (
              <div key={index}>
                <ListItem button>
                  <ListItemText
                    primary={<b>{data.description}</b>}
                    secondary={`${data.updatedAt}`}
                  />
                  <ListItemSecondaryAction style={{ textAlign: "right" }}>
                    <div
                      style={
                        data.amount > 0 ? { color: "green" } : { color: "red" }
                      }>
                      {`${data.amount > 0 ? "+" : ""}${currencyFormat(
                        data.amount
                      )}`}
                    </div>
                  </ListItemSecondaryAction>
                </ListItem>
                {index === rows.length - 1 ? null : <Divider />}
              </div>
            ))
          : rows.map((data, index) => (
              <div key={index}>
                <ListItem button>
                  <ListItemText
                    primary={data.month}
                    secondary={`${currencyFormat(data.closingBalance)} [${
                      -data.debit + data.credit
                    }]`}
                  />
                  <ListItemSecondaryAction style={{ textAlign: "right" }}>
                    <div style={{ color: "red" }}>
                      {currencyFormat(-data.debit)}
                    </div>
                    <div style={{ color: "green" }}>
                      {"+" + currencyFormat(data.credit)}
                    </div>
                  </ListItemSecondaryAction>
                </ListItem>
                {index === rows.length - 1 ? null : <Divider />}
              </div>
            ))}
      </List>
    </div>
  );
}
