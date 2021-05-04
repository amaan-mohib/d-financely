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
} from "@material-ui/core";
import { FirebaseAuthConsumer } from "@react-firebase/auth";
import React, { useState } from "react";
import { AiOutlineBank } from "react-icons/ai";
import { MdPersonAdd, MdSearch } from "react-icons/md";
import { GrCurrency } from "react-icons/gr";
import { Link } from "react-router-dom";
import App from "./App";
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
                      <ListItem>
                        <ListItemIcon>
                          <GrCurrency
                            className="black"
                            style={{ fontSize: "1.2rem" }}
                          />
                        </ListItemIcon>
                        <ListItemText>Cash</ListItemText>
                      </ListItem>
                      <ListItem>
                        <ListItemIcon>
                          <AiOutlineBank
                            className="black"
                            style={{ fontSize: "1.2rem" }}
                          />
                        </ListItemIcon>
                        <ListItemText>HDFC</ListItemText>
                      </ListItem>
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
const DialogBox = () => {
  const [open, setOpen] = useState(false);
  const [bank, setBank] = useState("");
  const [accountNo, setAccount] = useState("");
  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);
  // const handleClick = (d) => setBank(d);
  const fs = useMediaQuery(useTheme().breakpoints.down("xs"));
  return (
    <>
      <Button
        fullWidth
        variant="outlined"
        onClick={handleOpen}
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
              onClick={() => console.log(`${bank}-${accountNo}`)}>
              Continue
            </Button>
          )}
        </DialogActions>
      </Dialog>
    </>
  );
};
