import { createSignal, createResource, For, Show } from "solid-js";
import { createQuery } from 'solid-urql'
import './home.css';

const getPokemonQuery = `
  query {
    species: pokemon_v2_pokemonspecies(
      limit: 100
      offset: 0
      order_by: { id: asc }
    ) {
      id
      name
      pokemons: pokemon_v2_pokemons {
        id
        types: pokemon_v2_pokemontypes {
          type: pokemon_v2_type {
            name
          }
        }
      }
    }
  }
`;

const Card = (props) => {
  const type =  props.pokemon.pokemons[0].types[0].type.name
  
  return (
    <div className={"bg-light--" + type}>
      <img alt="" src={"https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/"+props.pokemon.id+".png"}/>
      <p>{props.pokemon.name} {type}</p>
      <p>-
        <For each={props.pokemon.pokemons[0].types}>
          {t => <span className={"bg--" + t.type.name}>
            {t.type.name}
          </span>}
        </For>
      </p>

    </div>
  );
}

export default function Home() {
  const [items, itemsState] = createQuery({
    query: getPokemonQuery,
  })

  return (
    <section class="bg-gray-100 text-gray-700 p-8">
      <Show when={!itemsState().fetching}>
        <ul>
          <For each={items().species}>
            {pokemon =>
              <Card pokemon={pokemon} />
            }
          </For>
        </ul>
      </Show>
    </section>
  );
}
