import { gql } from "@urql/core";
import Chart from "chart.js/auto";
import { Link, useParams } from "solid-app-router";
import { createEffect, createSignal, For, onMount, Show, Suspense } from "solid-js";
import client from "../client";


const capitalize = (s) => {
  if (typeof s !== 'string') return ''
  return s.charAt(0).toUpperCase() + s.slice(1)
}

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
            },
            pokemons: pokemon_v2_pokemons {
              types: pokemon_v2_pokemontypes {
                type: pokemon_v2_type {
                  name
                }
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

let chart = null;
export default function Pokemon(props) {
  let statChart;
  const params = useParams();
  const [detail, setDetail] = createSignal(null);

  let loadData = () => {
    client.query(queryGetPokemon, { name: params.name })
      .toPromise()
      .then(data => data.data.species[0])
      .then(data => {
        setDetail(data)

        chartdata.datasets[0].label = capitalize(data.name);
        chartdata.datasets[0].data[0] = data.pokemons[0].stats[1].base_stat;
        chartdata.datasets[0].data[1] = data.pokemons[0].stats[5].base_stat;
        chartdata.datasets[0].data[2] = data.pokemons[0].stats[4].base_stat;
        chartdata.datasets[0].data[3] = data.pokemons[0].stats[2].base_stat;
        chartdata.datasets[0].data[4] = data.pokemons[0].stats[0].base_stat;
        chartdata.datasets[0].data[5] = data.pokemons[0].stats[3].base_stat;

        chart = new Chart(
          statChart,
          {
            type: 'radar',
            data: chartdata,
            options: {
              elements: {

                line: {
                  borderWidth: 3
                }
              },
              plugins: {
                legend: {
                  display: true,
                  position: 'bottom',
                  labels: {
                  }
                }
              },
              scales: {
                r: {
                  min: 0,
                  max: 200,
                  ticks: {
                    stepSize: 20,
                    font: {
                      size: 6
                    }
                  },
                  pointLabels: {
                    fontSize: 20
                  }
                }
              }
            }
          }
        );
      });
  }

  createEffect(() => {
    if (chart != null) {
      chart.destroy();
    }
    loadData()
  })

  onMount(() => {
  })


  return (
    <section class="text-gray-700 max-w-screen-sm mx-auto pb-40">
      <Show when={detail() != null}>
        <div class="grid grid-cols-1 mb-5">
          <div class="bg-header pt-5 px-5 relative" className={"bg-light--" + detail().pokemons[0].types[0].type.name}  >
            <div class="grid mb-3">
              <div>
                <Link href="/">
                  <i class="icon text-gray-600 icon-chevron-left"></i>
                </Link>
              </div>
            </div>
            <div class="grid grid-cols-2">
              <h2 class="text-4xl font-bold capitalize">{detail().name}</h2>
              <div class="text-right"><span class="text-gray-500 text-xl">#{String(detail().id).padStart(3, '0')}</span></div>
            </div>
            <img class="pokemon-img mx-auto relative max-w-sm -mb-20" src={"https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/" + detail().id + ".png"} />
          </div>

          <div class="mt-20">
            <ul class="py-2 text-center text-white">
              <For each={detail().pokemons[0].types}>
                {t =>
                  <li class="inline-block mx-1 px-3 py-1 rounded-xl text-sm capitalize" className={"bg--" + t.type.name}>
                    {t.type.name}
                  </li>
                }
              </For>
            </ul>

            <p class="text-center px-3 mt-2">{detail().description[0].flavor_text}</p>

            <div class="grid grid-cols-2 gap-3 mt-5">
              <div class="text-center">
                <p class="font-bold text-xl">
                  {detail().pokemons[0].height / 10} m
                </p>
                <p class="text-sm text-gray-400">Height</p>
              </div>
              <div class="text-center">
                <p class="font-bold text-xl">
                  {detail().pokemons[0].weight / 10} kg
                </p>
                <p class="text-sm text-gray-400">Weight</p>
              </div>
              <div class="text-center">
                <p class="font-bold text-xl">
                  <span class="icon icon-gender-male inline-block text-blue-600" style="display: inline-block; !important;"></span>&nbsp; {((8 - detail().gender_rate) / 8) * 100}%
                  &nbsp;&nbsp;&nbsp;&nbsp;
                  <span class="icon icon-gender-female inline-block text-pink-600 mb-1" style="display: inline-block; !important;"></span> {(detail().gender_rate / 8) * 100}%
                </p>
                <p class="text-sm text-gray-400">Gender</p>
              </div>
              <div class="text-center">
                <p class="font-bold text-xl">
                  {detail().pokemons[0].abilities.map(x => capitalize(x.ability.name)).join(', ')}
                </p>
                <p class="text-sm text-gray-400">Abilities</p>
              </div>
              <div class="text-center">
                <p class="font-bold text-xl">
                  {detail().egg_groups.map(x => capitalize(x.group.name)).join(', ')}
                </p>
                <p class="text-sm text-gray-400">Egg Groups</p>
              </div>
              <div class="text-center">
                <p class="font-bold text-xl">
                  {detail().hatch_counter}
                </p>
                <p class="text-sm text-gray-400">Egg Cycles</p>
              </div>
            </div>


            <div>

            </div>
          </div>
        </div>
        <div class="grid grid-cols-1 mt-10">
          <div class="">
            <p class="text-center text-2xl font-bold mb-5">Stats</p>
            <canvas ref={statChart}></canvas>
          </div>
          <div>
          </div>
        </div>
        <div class="grid grid-cols-1 mt-10">
          <div>
            <p class="text-2xl font-bold text-center mb-5">Evolutions</p>
            <ul class="grid grid-cols-3">
              <For each={detail().evolutions.species}>
                {item =>

                  <li>
                    <Link class="nav no-underline" href={"/pokemon/" + item.name}>
                      <div >
                        <img class="pokemon-img rounded-full p-5 mx-auto" className={"bg-light--" + item.pokemons[0].types[0].type.name} src={"https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/" + item.id + ".png"} />
                      </div>
                      <div class="mt-5">
                        <p class="text-center capitalize">
                          <span class="font-bold text-gray-800 text-lg">{item.name}</span> <span class="text-gray-400">#{String(item.id).padStart(3, '0')}</span>
                        </p>
                      </div>
                      <div class="mt-1">
                        <ul class="py-2 text-center text-white">
                          <For each={item.pokemons[0].types}>
                            {t =>
                              <li class="inline-block mx-1 px-3 py-1 rounded-xl text-sm capitalize" className={"bg--" + t.type.name}>
                                {t.type.name}
                              </li>
                            }
                          </For>
                        </ul>
                      </div>
                    </Link>
                  </li>
                }
              </For>
            </ul>
          </div>
        </div>
      </Show>
      <Show when={detail() == null}>
        <div class="bg-header pt-5 px-5 relative h-80 bg-gray-300"  >
          <div class="grid mb-3">
            <div>
              <Link href="/">
                <i class="icon text-gray-600 icon-chevron-left"></i>
              </Link>
            </div>
          </div>
          <div class="grid grid-cols-2">
            <h2 class="text-4xl font-bold capitalize shimmer2">&nbsp;</h2>
            <div class="text-right"><span class="text-gray-500 text-xl shimmer">&nbsp;</span></div>
          </div>
          <img class="pokemon-img mx-auto relative max-w-sm -mb-20 shimmer" src={""} />
        </div>

        <div class="mt-20">
          <ul class="py-2 text-center text-white">
            <li class="inline-block mx-1 px-3 py-1 rounded-xl text-sm capitalize shimmer2" >
              &nbsp;&nbsp;&nbsp;
            </li>
            <li class="inline-block mx-1 px-3 py-1 rounded-xl text-sm capitalize shimmer2" >
              &nbsp;&nbsp;&nbsp;
            </li>
            
          </ul>

          <p class="text-center px-3 mt-2 shimmer2">&nbsp;</p>

          <div class="grid grid-cols-2 gap-3 mt-5">
            <div class="text-center">
              <p class="font-bold text-xl shimmer2">
                &nbsp;
              </p>
              <p class="text-sm text-gray-400">Height</p>
            </div>
            <div class="text-center">
              <p class="font-bold text-xl shimmer2">
                &nbsp;
              </p>
              <p class="text-sm text-gray-400">Weight</p>
            </div>
            <div class="text-center">
              <p class="font-bold text-xl shimmer2">
                &nbsp;
              </p>
              <p class="text-sm text-gray-400">Gender</p>
            </div>
            <div class="text-center">
              <p class="font-bold text-xl shimmer2">
                &nbsp;
              </p>
              <p class="text-sm text-gray-400">Abilities</p>
            </div>
            <div class="text-center">
              <p class="font-bold text-xl shimmer2">
                &nbsp;
              </p>
              <p class="text-sm text-gray-400">Egg Groups</p>
            </div>
            <div class="text-center">
              <p class="font-bold text-xl shimmer2">
                &nbsp;
              </p>
              <p class="text-sm text-gray-400">Egg Cycles</p>
            </div>
          </div>


          <div>

          </div>
        </div>

      </Show>

      <Suspense>
        <pre class="mt-4">
        </pre>
      </Suspense>
    </section>
  );
}
