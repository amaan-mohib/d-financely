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
import React, { useState } from "react";
import { MdAdd, MdCheck, MdRemove } from "react-icons/md";

export default function Sidebar() {
  const [val, setVal] = useState("");
  const [open, setOpen] = useState(false);
  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);
  const handleChange = (event) => {
    setVal(event.target.value);
  };
  const fs = useMediaQuery(useTheme().breakpoints.down("xs"));
  const formik = useFormik({
    initialValues: {
      account: "cash",
      desc: "",
      amount: 0,
      amountType: "debit",
      date: new Date().toISOString().substr(0, 10),
    },
    onSubmit: (values) => {
      console.log(values);
    },
  });

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
              <MenuItem value="cash">Cash</MenuItem>
              <MenuItem value="hdfc">HDFC</MenuItem>
            </TextField>
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
            <TextField
              id="date"
              name="date"
              fullWidth
              label="Date/Time"
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
            <Button type="submit" onClick={handleClose} color="primary">
              SAVE
            </Button>
          </DialogActions>
        </form>
      </Dialog>
      <div className="card" style={{ fontSize: "smaller" }}>
        <p>Base: ₹ (INR)</p>
        <p>Secondary: $ (USD)</p>
        <a href="#">Show more &gt;</a>
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
            val !== "" ? (
              <InputAdornment position="end">
                <IconButton>
                  <MdCheck style={{ color: "green" }} />
                </IconButton>
              </InputAdornment>
            ) : null,
        }}
      />
    </div>
  );
}
