import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { OutlinedInput, Button } from "@mui/material";
import { membersStore } from "../stores/members";

const Login = (props) => {
  const { setIsLoggedIn } = props;
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");

  const { members, setUser } = membersStore((state) => state);

  const navigate = useNavigate();

  const getMemberRecord = async (userId) => {
    let filteredUser = members.find((user) => user.id === Number(userId));

    // If user not found in current members list, refresh the data
    if (!filteredUser) {
      await membersStore.getState().fetchAllMembers();
      // Get the updated members list
      const updatedMembers = membersStore.getState().members;
      filteredUser =
        updatedMembers.find((user) => user.id === Number(userId)) || null;
    }

    return filteredUser;
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post(`/api/login`, {
        username,
        password,
      });
      // The backend sets the cookie; do not overwrite it here.
      const userRecord = await getMemberRecord(response.data.memberId);

      setUser(userRecord);
      setMessage("Login successful!");
      setIsLoggedIn(true);
      navigate("/");
    } catch (error) {
      setMessage("Login failed: " + error.response.data.message);
    }
  };

  return (
    <div className="login-screen">
      <div className="login-form">
        <img style={{ width: "80px" }} src="../lv6_Logo.svg" />
        <form
          onSubmit={handleLogin}
          style={{
            display: "flex",
            flexDirection: "column",
            rowGap: "1rem",
            width: "100%",
          }}
        >
          <OutlinedInput
            type="text"
            fullWidth
            placeholder="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
          <OutlinedInput
            fullWidth
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <Button fullWidth variant="contained" type="submit">
            Sign In
          </Button>
        </form>
        {message && <p>{message}</p>}
      </div>
    </div>
  );
};

export default Login;
