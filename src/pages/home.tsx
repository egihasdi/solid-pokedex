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
    <li class="rounded-sm" classList={{
      ["bg-light--" + type]: true,
    }}>
      <Link class="nav" href={"pokemon/" + props.pokemon.name}>
        <img class="pokemon-img" src={"https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/" + props.pokemon.id + ".png"} />
        <p>#{String(props.pokemon.id).padStart(3, '0')}</p>
        <p>{props.pokemon.name}</p>

        <p>-
          <For each={props.pokemon.pokemons[0].types}>
            {t => <span className={"bg--" + t.type.name}>
              {t.type.name}
            </span>}
          </For>
        </p>
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
    <section class="text-gray-700 p-8 md:container md:px-10 mx-auto">
      <ul class="grid lg:grid-cols-4 md:grid-cols-3 xs:grid-cols-1 grid-cols-2 gap-2">
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
