import "windi.css";

import { render } from "solid-js/web";
import { Router } from "solid-app-router";
import App from "./app";
import { createClient, Provider } from 'solid-urql'

const client = createClient({
  url: "https://beta.pokeapi.co/graphql/v1beta"
})

render(
  () => (
    <Router>
      <Provider value={client}>
        <App />
      </Provider>
    </Router>
  ),
  document.getElementById("root") as HTMLElement
);
