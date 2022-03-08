import { createClient } from "solid-urql";

const client = createClient({
  url: "https://beta.pokeapi.co/graphql/v1beta"
})

export default client;