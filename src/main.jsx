import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./index.scss";
import axios from "axios";
// Always send cookies (for refresh/access tokens)
axios.defaults.withCredentials = true;

// Create a root and render the app using createRoot
const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  // <React.StrictMode>
  <App />,
  // </React.StrictMode>
);
