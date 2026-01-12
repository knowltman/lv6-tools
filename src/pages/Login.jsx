import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { OutlinedInput, Button } from "@mui/material";
import { membersStore } from "../stores/members";

const apiURL = import.meta.env.VITE_API_URL;

const Login = (props) => {
  const { setIsLoggedIn } = props;
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");

  const { members, setUser } = membersStore((state) => state);

  const navigate = useNavigate();

  const getMemberRecord = (userId) => {
    const filteredUser =
      members.find((user) => user.id === Number(userId)) || null;
    return filteredUser;
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post(`${apiURL}/api/login`, {
        username,
        password,
      });
      localStorage.setItem("token", response.data.token);
      localStorage.setItem("user", response.data.memberId);
      const userRecord = getMemberRecord(response.data.memberId);

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
