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
import { MdChevronRight, MdSettings } from "react-icons/md";
import { Link } from "react-router-dom";
import firebase from "firebase/app";
import App from "./App";
import Sidebar from "./Sidebar";

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
  const [bal, setBal] = useState([
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
            setBal(arr);
          }
          console.log(doc.data());
        }
      });
    return () => {
      unsub();
    };
  }, []);
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
        <h2 className="currency">
          {`${Intl.NumberFormat(undefined, {
            style: "currency",
            currency: "INR",
          }).format(props.balance)}`}
        </h2>
        <p className="email" style={{ fontSize: "small" }}>
          Last updated:{" "}
          {props.updatedAt === "Never"
            ? "Never"
            : new Date(props.updatedAt).toLocaleDateString()}
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
            updatedAt={data.updatedAt}
          />
        ))}
      </div>
    </div>
  );
};
const Analytics = () => {
  let labels = [];
  let months = [];
  useEffect(() => {}, []);
  for (let i = 0; i < 4; i++) {
    const today = new Date();
    const monthNow = new Date();
    let date = today.setDate(today.getDate() - i);
    let month = monthNow.setMonth(monthNow.getMonth() - (i + 1));
    labels.push(
      Intl.DateTimeFormat("en-IN", {
        day: "numeric",
        month: "numeric",
      }).format(date)
    );
    months.push(Intl.DateTimeFormat("en-IN", { month: "short" }).format(month));
  }
  console.log(months);
  const balance = {
    data: {
      labels: labels.reverse(),
      datasets: [
        {
          label: "Balance",
          data: [800, 500, 900, 1000].reverse(),
          fill: false,
          backgroundColor: "rgb(255, 99, 132)",
          borderColor: "rgb(255, 99, 132)",
          tension: 0.2,
        },
      ],
    },
    options: {
      responsive: true,
      plugins: {
        title: {
          display: true,
          text: "Balance",
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
          },
        },
      },
    },
  };
  const expenses = {
    data: {
      labels: months.reverse(),
      datasets: [
        {
          label: "Expenses",
          data: [NaN, 300, 400, 100].reverse(),
          fill: false,
          backgroundColor: "rgb(255, 99, 132)",
          borderColor: "rgb(255, 99, 132)",
          tension: 0.2,
        },
      ],
    },
    options: {
      responsive: true,
      plugins: {
        title: {
          display: true,
          text: "Expenses",
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
              if (context.tick.value === 300) return "#ff0000";
              else return Chart.defaults.borderColor;
            },
          },
        },
      },
    },
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
        <div>
          <div style={{ display: "flex", alignItems: "center" }}>
            <GrCurrency
              className="black"
              style={{ fontSize: "1.2rem", marginRight: "10px" }}
            />
            <p>Cash</p>
          </div>
          <div className="bal-grid">
            <div className="card">
              <Line data={balance.data} options={balance.options} />
            </div>
            <div className="card">
              <Line data={expenses.data} options={expenses.options} />
            </div>
          </div>
        </div>
        <Divider />
        <div>
          <div style={{ display: "flex", alignItems: "center" }}>
            <AiOutlineBank
              className="black"
              style={{ fontSize: "1.2rem", marginRight: "10px" }}
            />
            <p>HDFC</p>
          </div>
          <div className="bal-grid">
            <div className="card">
              <Line data={balance.data} options={balance.options} />
            </div>
            <div className="card">
              <Line data={expenses.data} options={expenses.options} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
const Transactions = () => {
  const cols = [
    { field: "id", headerName: "ID", width: 70, hide: true },
    { field: "month", headerName: "Month", width: 100 },
    {
      field: "openBal",
      headerName: "Opening Balance",
      type: "number",
      width: 190,
    },
    { field: "debit", headerName: "Debit (-)", type: "number", width: 125 },
    { field: "credit", headerName: "Credit (+)", type: "number", width: 125 },
    {
      field: "closeBal",
      headerName: "Closing Balance",
      type: "number",
      width: 190,
    },
  ];
  const rows = [
    {
      id: 1,
      month: "Apr",
      openBal: 25000,
      debit: 1000,
      credit: 25,
      closeBal: 25000 - 1000 + 25,
    },
    {
      id: 2,
      month: "Mar",
      openBal: 26000,
      debit: 1000,
      credit: 25,
      closeBal: 26000 - 1000 + 25,
    },
    {
      id: 3,
      month: "Feb",
      openBal: 27000,
      debit: 1000,
      credit: 25,
      closeBal: 27000 - 1000 + 25,
    },
    {
      id: 4,
      month: "Jan",
      openBal: 28000,
      debit: 1000,
      credit: 25,
      closeBal: 28000 - 1000 + 25,
    },
  ];
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
        <div>
          <div style={{ display: "flex", alignItems: "center" }}>
            <GrCurrency
              className="black"
              style={{ fontSize: "1.2rem", marginRight: "10px" }}
            />
            <p>Cash</p>
          </div>
          <div style={{ padding: "10px 0" }}>
            <DataGrid
              density="compact"
              columns={cols}
              rows={rows}
              autoHeight={true}
              hideFooter={true}
              autoPageSize={true}
              className="transac-comp"
            />
            <TransacsMob rows={rows} />
          </div>
        </div>
        <Divider />
        <div>
          <div style={{ display: "flex", alignItems: "center" }}>
            <AiOutlineBank
              className="black"
              style={{ fontSize: "1.2rem", marginRight: "10px" }}
            />
            <p>HDFC</p>
          </div>
          <div style={{ padding: "10px 0" }}>
            <DataGrid
              density="compact"
              columns={cols}
              rows={rows}
              autoHeight={true}
              hideFooter={true}
              autoPageSize={true}
            />
          </div>
        </div>
      </div>
    </div>
  );
};
function TransacsMob({ rows }) {
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
      style={{ padding: "5px", display: "none" }}>
      <List dense={true}>
        {rows.map((data, index) => (
          <div key={index}>
            <ListItem button>
              <ListItemText
                primary={data.month}
                secondary={`${currencyFormat(data.closeBal)} [${
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
