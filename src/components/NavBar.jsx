import React, { useState } from "react";
import {
  Box,
  IconButton,
  Menu,
  Avatar,
  MenuItem,
  ListItemIcon,
  Divider,
  Skeleton,
  Drawer,
  List,
  ListItem,
  useMediaQuery,
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import Settings from "@mui/icons-material/Settings";
import { Group } from "@mui/icons-material";
import Logout from "@mui/icons-material/Logout";
import { useNavigate, useLocation } from "react-router-dom";
import { membersStore } from "../stores/members";
import MemberSearch from "./MemberSearch";
import { getImageName } from "../app.logic";

const NavBar = (props) => {
  const { handleLogout } = props;

  const user = membersStore((state) => state.user);
  const isLoaded = user && user.first_name && user.last_name;

  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const handleClick = (event) => setAnchorEl(event.currentTarget);
  const handleClose = () => setAnchorEl(null);
  const toggleDrawer = (open) => () => setDrawerOpen(open);

  const navigate = useNavigate();
  const location = useLocation();
  const isMobile = useMediaQuery("(max-width: 768px)");

  const handleMembersNavigate = (event) => {
    navigate("Members");
    handleClose();
  };

  const menuItems = [
    {
      label: "Home",
      icon: (
        <IconButton title="home" key="home" onClick={() => navigate("/")}>
          <img style={{ width: "30px" }} src="../lv6_Logo.svg" />
        </IconButton>
      ),
      path: "/",
    },
    { label: "Conduct", path: "/conduct" },
    { label: "Prayers", path: "/prayers" },
    { label: "Speakers", path: "/speakers" },
    { label: "Music", path: "/music" },
    { label: "Bulletin", path: "/bulletin" },
  ];

  return (
    <Box
      sx={{
        borderBottom: 1,
        borderColor: "divider",
        padding: ".5rem",
        width: "calc(100vw - 1rem)",
        position: "fixed",
        zIndex: 1,
        backdropFilter: "blur(16px) saturate(180%)",
        WebkitBackdropFilter: "blur(16px) saturate(180%)",
        backgroundColor: "rgba(255, 255, 255, 0.83)",
      }}
    >
      <Box display="flex" justifyContent={"space-between"} alignItems="center">
        {isMobile ? (
          <>
            <IconButton onClick={toggleDrawer(true)}>
              <MenuIcon />
            </IconButton>
            <Drawer
              anchor="left"
              open={drawerOpen}
              onClose={toggleDrawer(false)}
            >
              <List style={{ width: 300 }}>
                {menuItems.map((item) => (
                  <ListItem
                    button
                    key={item.label}
                    onClick={() => {
                      navigate(item.path);
                      setDrawerOpen(false);
                    }}
                  >
                    <h3>{item.label}</h3>
                  </ListItem>
                ))}
              </List>
            </Drawer>
          </>
        ) : (
          <div className="menu">
            {menuItems.map((item) =>
              item.icon ? (
                item.icon
              ) : (
                <div
                  key={item.label}
                  className={`menu-item ${
                    location.pathname === item.path ? "active" : ""
                  }`}
                  onClick={() => navigate(item.path)}
                >
                  {item.label}
                </div>
              )
            )}
          </div>
        )}

        <MemberSearch />
        <IconButton
          onClick={handleClick}
          size="small"
          sx={{ ml: 1 }}
          aria-controls={open ? "account-menu" : undefined}
          aria-haspopup="true"
          aria-expanded={open ? "true" : undefined}
        >
          {isLoaded ? (
            <Avatar sx={{ width: 32, height: 32 }}>
              <img
                className={"user-image"}
                src={getImageName(user)}
                alt={`${user.first_name} ${user.last_name}`}
              />
            </Avatar>
          ) : (
            <Skeleton
              variant="circular"
              width={32}
              height={32}
              animation="wave"
            />
          )}
        </IconButton>
        <Menu
          anchorEl={anchorEl}
          id="account-menu"
          open={open}
          onClose={handleClose}
          onClick={handleClose}
          slotProps={{
            paper: {
              elevation: 0,
              sx: {
                overflow: "visible",
                filter: "drop-shadow(0px 2px 8px rgba(0,0,0,0.32))",
                mt: 1.5,
                "& .MuiAvatar-root": {
                  width: 32,
                  height: 32,
                  ml: -0.5,
                  mr: 1,
                },
                "&::before": {
                  content: '""',
                  display: "block",
                  position: "absolute",
                  top: 0,
                  right: 14,
                  width: 10,
                  height: 10,
                  bgcolor: "background.paper",
                  transform: "translateY(-50%) rotate(45deg)",
                  zIndex: 0,
                },
              },
            },
          }}
          transformOrigin={{ horizontal: "right", vertical: "top" }}
          anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
        >
          <MenuItem onClick={handleClose}>
            <Avatar /> My account
          </MenuItem>
          <Divider />
          <MenuItem onClick={handleMembersNavigate}>
            <ListItemIcon>
              <Group fontSize="small" />
            </ListItemIcon>{" "}
            Members
          </MenuItem>
          <MenuItem onClick={handleClose}>
            <ListItemIcon>
              <Settings fontSize="small" />
            </ListItemIcon>
            Settings
          </MenuItem>
          <MenuItem onClick={handleLogout}>
            <ListItemIcon>
              <Logout fontSize="small" />
            </ListItemIcon>
            Logout
          </MenuItem>
        </Menu>
      </Box>
    </Box>
  );
};

export default NavBar;
