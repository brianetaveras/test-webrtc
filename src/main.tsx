import React from "react";
import ReactDOM from "react-dom";
import "./index.css";
import App from "./App";
import {GlobalProvider} from "./context/globalProvider";
ReactDOM.render(
  <GlobalProvider>
    <React.StrictMode>
      <App />
    </React.StrictMode>
  </GlobalProvider>,
  document.getElementById("root")
);
