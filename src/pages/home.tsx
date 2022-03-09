import { Link } from "solid-app-router";
import { createSignal, createResource, For, Show, createEffect, onMount } from "solid-js";
import { createQuery, gql } from 'solid-urql'
import client from "../client";

const PER_PAGE = 50;

const getPokemonQuery = gql`
  query pokemon($limit: Int!, $offset: Int!){
    species: pokemon_v2_pokemonspecies(
      limit: $limit
      offset: $offset 
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
  const type = props.pokemon.pokemons[0].types[0].type.name

  return (
    <li class="grid-item rounded-xl py-1" classList={{
      ["bg-light--" + type]: true,
    }}>
      <Link class="nav no-underline relative" href={"/pokemon/" + props.pokemon.name}>
        <p class="text-gray-400 text-md p-1 absolute">#{String(props.pokemon.id).padStart(3, '0')}</p>
        <img class="pokemon-img mx-auto py-1 px-6" src={"https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/" + props.pokemon.id + ".png"} />
        <p class="capitalize text-center text-lg text-gray-900 font-bold">{props.pokemon.name}</p>

        <ul class="py-2 text-center text-white">
          <For each={props.pokemon.pokemons[0].types}>
            {t => 
              <li class="inline-block mx-1 px-3 py-1 rounded-xl text-xs capitalize" className={"bg--" + t.type.name}>
                {t.type.name}
              </li>
            }
          </For>
        </ul>
      </Link>
    </li>
  );
}

export default function Home() {
  const [isFetching, setIsFetching] = createSignal(false);
  const [pokemons, setPokemons] = createSignal([]);
  const [offset, setOffset] = createSignal(0);

  const loadData = () => {
    setIsFetching(true)
    client.query(getPokemonQuery, {
      limit: PER_PAGE,
      offset: offset()
    })
      .toPromise()
      .then(x => x.data.species)
      .then(s => {
        setPokemons(p => p.concat(s))
        setIsFetching(false);
        setOffset(offset => offset + PER_PAGE);
      })
  }

  onMount(() => {
    loadData();

    window.addEventListener('scroll', function () {
      if (!isFetching() && ((window.innerHeight + window.scrollY) >= document.body.offsetHeight - 600)) {
        loadData()
      }
    });
  })

  return (
    <section class="text-gray-700 p-5 mx-auto max-w-screen-sm">
      <ul class="grid grid-cols-2 gap-2">
        <For each={pokemons()}>
          {pokemon =>
            <Card pokemon={pokemon} />
          }
        </For>
        <Show when={isFetching()}>
          <For each={Array.from({ length: 30 })}>
            {() => <li class="rounded-sm shimmer"></li>}
          </For>
        </Show>
      </ul>
    </section>
  );
}
