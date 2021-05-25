import { MenuItem, TextField } from "@material-ui/core";
import { FirebaseAuthConsumer } from "@react-firebase/auth";
import axios from "axios";
import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import App from "./App";
import { API } from "./config";
import Sidebar from "./Sidebar";
import firebase from "firebase/app";
import { getAccList } from "./actions";
import { Line } from "react-chartjs-2";

export default function Analytics() {
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
                  <Graph id={acc[val].id} accountName={acc[val].accountName} />
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
const Graph = (props) => {
  const [data, setData] = useState([]);
  const acc = useSelector((state) => state.accounts);
  const [range, setRange] = useState(0);
  const [rangeList, setList] = useState(["Loading"]);
  const handleChangeRange = (e) => {
    setRange(e.target.value);
  };

  useEffect(() => {
    if (props.accountName === "Cash") {
      let interval = 7;
      if (range === 1) {
        interval = 31;
      } else if (range === 2) {
        interval = 365;
      }
      setList(["Last 7 days", "Last 31 days", "Last 12 months"]);
      axios
        .get(`${API}/cash/${firebase.auth().currentUser.uid}/${interval}`)
        .then((res) => {
          setData(res.data);
        })
        .catch((err) => console.error(err));
    } else {
      setList(["Last 12 months"]);
      axios
        .get(`${API}/banks/${props.id}/${firebase.auth().currentUser.uid}`)
        .then((res) => {
          setData(res.data);
        })
        .catch((err) => console.error(err));
    }
  }, [props.accountName, props.id, range]);
  const options = {
    responsive: true,
    maintainAspectRatio: true,
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
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        flexDirection: "column",
        margin: "10px 0",
      }}>
      <TextField
        id="range"
        name="range"
        select
        label="Range"
        value={range}
        style={{ minWidth: "200px", alignSelf: "flex-start" }}
        onChange={handleChangeRange}>
        {rangeList.map((data, index) => (
          <MenuItem key={`${index}-menu`} value={index}>
            {data}
          </MenuItem>
        ))}
      </TextField>
      <div
        style={{
          margin: "10px 0",
          width: "100%",
          maxWidth: "768px",
          alignSelf: "center",
        }}>
        {data.length > 0 ? (
          <Line data={balance(data)} options={options} />
        ) : (
          <p>No data available</p>
        )}
      </div>
    </div>
  );
};
