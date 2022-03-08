import { createSignal, createResource, For, Show } from "solid-js";
import { createQuery} from 'solid-urql'

const getPokemonQuery = `
  query {
    pokemon_v2_pokemon {
      name
    }
  }
`;

const API = "https://pokeapi.co/api/v2";

const Card = (props) => {
  return (
    <p>{props.pokemon.name}</p>
  );
}

export default function Home() {
  const [items, itemsState, reexecuteQuery] = createQuery({
    query: getPokemonQuery,
  })

  return (
    <section class="bg-gray-100 text-gray-700 p-8">
      <Show when={!itemsState().fetching}>
        <ul>
          <For each={items().pokemon_v2_pokemon}>
            {pokemon => 
              <Card pokemon={pokemon}/>
            }
          </For>
        </ul>
      </Show>
    </section>
  );
}
