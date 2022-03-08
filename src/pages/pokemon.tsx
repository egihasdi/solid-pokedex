import { gql } from "@urql/core";
import Chart from "chart.js/auto";
import { useParams } from "solid-app-router";
import { createSignal, onMount, Show, Suspense } from "solid-js";
import client from "../client";



const queryGetPokemon = gql`
    query getPokemon($name: String!) {
      species: pokemon_v2_pokemonspecies(
        where: { name: { _eq: $name} }
        limit: 1
      ) {
        id
        gender_rate
        hatch_counter
        name
        description: pokemon_v2_pokemonspeciesflavortexts(
          limit: 1
          where: { pokemon_v2_language: { name: { _eq: "en" } } }
        ) {
          flavor_text
        }
        evolutions: pokemon_v2_evolutionchain {
          species: pokemon_v2_pokemonspecies(order_by: { order: asc }) {
            id
            name
            evolves_from_species_id
            evolutions: pokemon_v2_pokemonevolutions {
              min_level
              min_affection
              min_beauty
              min_happiness
              gender_id
              time_of_day
              move: pokemon_v2_move {
                name
              }
              by_held_item: pokemonV2ItemByHeldItemId {
                name
              }
              item: pokemon_v2_item {
                name
              }
              evolution_trigger: pokemon_v2_evolutiontrigger {
                name
              }
              location: pokemon_v2_location {
                name
              }
            }
          }
        }
        egg_groups: pokemon_v2_pokemonegggroups {
          group: pokemon_v2_egggroup {
            name
          }
        }
        pokemons: pokemon_v2_pokemons {
          id
          name
          height
          weight
          types: pokemon_v2_pokemontypes {
            type: pokemon_v2_type {
              name
            }
          }
          abilities: pokemon_v2_pokemonabilities {
            ability: pokemon_v2_ability {
              name
            }
          }
          stats: pokemon_v2_pokemonstats {
            base_stat
            stat: pokemon_v2_stat {
              name
            }
          }
        }
      }
      species_aggregate: pokemon_v2_pokemonspecies_aggregate {
        aggregate {
          count
        }
      }
    }
`;


const chartdata = {
  labels: [
    'Attack',
    'Speed',
    'SP. Defense',
    'Defense',
    'HP',
    'SP. Attack'
  ],
  datasets: [{
    label: 'My First Dataset',
    data: [45, 45, 45, 45, 45, 45],
    fill: true,
    backgroundColor: 'rgba(255, 99, 132, 0.2)',
    borderColor: 'rgb(255, 99, 132)',
    pointBackgroundColor: 'rgb(255, 99, 132)',
    pointBorderColor: '#fff',
    pointHoverBackgroundColor: '#fff',
    pointHoverBorderColor: 'rgb(255, 99, 132)'
  }]
};;

const config = {
  type: 'radar',
  data: chartdata,
  options: {
    elements: {
      line: {
        borderWidth: 3
      }
    }
  },
};

export default function Pokemon(props) {
  let statChart;
  const params = useParams();
  const [detail, setDetail] = createSignal(null);

  onMount(() => {
    client.query(queryGetPokemon, { name: params.name })
      .toPromise()
      .then(data => data.data.species[0])
      .then(data => {
        setDetail(data)

        chartdata.datasets[0].data[0] = data.pokemons[0].stats[1].base_stat;
        chartdata.datasets[0].data[1] = data.pokemons[0].stats[5].base_stat;
        chartdata.datasets[0].data[2] = data.pokemons[0].stats[4].base_stat;
        chartdata.datasets[0].data[3] = data.pokemons[0].stats[2].base_stat;
        chartdata.datasets[0].data[4] = data.pokemons[0].stats[0].base_stat;
        chartdata.datasets[0].data[5] = data.pokemons[0].stats[3].base_stat;

        console.log(chartdata)

        new Chart(
          statChart,
          {
            type: 'radar',
            data: chartdata,
            options: {
              scales: {
                scale: {
                  min: 0,
                  max: 150,
                  
                }
              }
            }
          }
        );
      });
  })

  return (
    <section class="text-gray-700 container mx-auto p-8">
      <h1 class="text-2xl font-bold">About</h1>
      <Show when={detail() != null}>
        <div className={"bg-light--" + detail().pokemons[0].types[0].type.name}  >
          <img class="pokemon-img" src={"https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/" + detail().id + ".png"} />
        </div>

        <canvas ref={statChart}></canvas>
      </Show>

      <p class="mt-4">A page all about this website.</p>

      <Suspense>
        <pre class="mt-4">
        </pre>
      </Suspense>
    </section>
  );
}
