import "windi.css";

import { render } from "solid-js/web";
import { Router, hashIntegration, pathIntegration } from "solid-app-router";
import App from "./app";

render(
  () => (
    <Router source={pathIntegration()}>
      <App />
    </Router>
  ),
  document.getElementById("root") as HTMLElement
);
