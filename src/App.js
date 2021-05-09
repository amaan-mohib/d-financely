import {
  Divider,
  Drawer,
  IconButton,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Tooltip,
} from "@material-ui/core";
import { IoAnalyticsOutline } from "react-icons/io5";
import { AiOutlineHistory } from "react-icons/ai";
import { MdClose, MdMenu } from "react-icons/md";
import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";

function App({ user }) {
  const [open, setOpen] = useState(false);
  useEffect(() => {}, []);
  const handleOpen = () => {
    setOpen(true);
  };
  const handleClose = () => {
    setOpen(false);
  };
  let icon = (
    <img
      referrerPolicy="no-referrer"
      alt={user.displayName}
      src={user.photoURL}
      className="profile-img"
    />
  );

  const list = [
    {
      text: "Analytics",
      icon: <IoAnalyticsOutline className="black" />,
      link: "/analytics",
    },
    {
      text: "Transactions",
      icon: <AiOutlineHistory className="black" />,
      link: "/transactions",
    },
    { text: "Profile", icon: icon, link: "/profile" },
  ];
  return (
    <nav>
      <div>
        <Tooltip title="Menu">
          <IconButton onClick={handleOpen} className="menu">
            <MdMenu className="black" />
          </IconButton>
        </Tooltip>
        <Link to="/" className="drawer-links">
          <h1 className="heading">δ Financely</h1>
        </Link>
        <Drawer
          className="drawer"
          variant="temporary"
          open={open}
          onClose={handleClose}>
          <div className="drawer">
            <div className="drawer-top">
              <IconButton onClick={handleClose}>
                <MdClose className="black" />
              </IconButton>
            </div>
            <Divider />
            <List>
              {list.map((text, index) => (
                <Link to={text.link} key={index} className="drawer-links">
                  <ListItem button>
                    <ListItemIcon>{text.icon}</ListItemIcon>
                    <ListItemText>{text.text}</ListItemText>
                  </ListItem>
                </Link>
              ))}
            </List>
          </div>
        </Drawer>
      </div>
      <div>
        <div className="nav-links" style={{ display: "flex" }}>
          {list.map((data, index) =>
            index < list.length - 1 ? (
              <Link to={data.link} key={index}>
                <Tooltip title={data.text}>
                  <IconButton>{data.icon}</IconButton>
                </Tooltip>
              </Link>
            ) : null
          )}
        </div>
        <Link to={list[list.length - 1].link}>
          <Tooltip title={list[list.length - 1].text}>
            <IconButton>{icon}</IconButton>
          </Tooltip>
        </Link>
      </div>
    </nav>
  );
}

export default App;
