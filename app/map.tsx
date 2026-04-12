/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect, useRef, useState } from "react";
import {
  Animated,
  Dimensions,
  Image,
  ScrollView,
  StyleSheet,
  View,
} from "react-native";

import PokemonTeam from "@/components/PokemonTeam";
import { medalSprites, pokeballSprites } from "@/utils/sprites";
import GameLayout, { ActionButton } from "../components/GameLayout";
import { getLocationById } from "../constants/mapLocations";
import { scaleImage } from "../utils/helpers";
import { Egg, Location, Pokeball, Pokemon } from "../utils/interfaces";
import { prologService } from "../utils/PrologService";

const MAP_W = 600;
const MAP_H = 400;
const HEAD_W = 34;
const HEAD_H = 34;
const HEAD_SCALE_MAX = 1.25;

export default function MapScreen() {
  const [playerLocation, setPlayerLocation] = useState<Location>({
    main: "littleroot",
    place: "plaza",
  });
  const [message, setMessage] = useState("Elige una opción:");
  const [buttons, setButtons] = useState(getMainButtons());
  const [pokemonViewOpen, setPokemonViewOpen] = useState(false);
  const [pokemons, setPokemons] = useState<(Pokemon | Egg)[]>([]);

  const pulse = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    const anim = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, {
          toValue: HEAD_SCALE_MAX,
          duration: 500,
          useNativeDriver: true,
        }),
        Animated.timing(pulse, {
          toValue: 1,
          duration: 500,
          useNativeDriver: true,
        }),
      ]),
    );
    anim.start();
    return () => anim.stop();
  });

  useEffect(() => {
    async function loadData() {
      const location = await prologService.getCurrentLocation();
      setPlayerLocation(location);
    }
    loadData();
  }, []);

  const currentLocationData = playerLocation
    ? getLocationById(playerLocation.main)
    : null;

  const headLeft = currentLocationData
    ? (currentLocationData.x / 100) * MAP_W - HEAD_W / 2
    : 0;
  const headTop = currentLocationData
    ? (currentLocationData.y / 100) * MAP_H - HEAD_H / 2
    : 0;

  const getLocationMessage = (loc: Location) => {
    const data = loc ? getLocationById(loc.main) : null;
    if (!data) return "Elige una opción:";

    const isRuta = data.label.startsWith("Ruta");
    const placePart = isRuta ? "" : ` - ${loc?.place.toUpperCase()}`;
    return `Ubicación actual → ${data.label}${placePart}\n\nElige una opción:`;
  };

  useEffect(() => {
    if (playerLocation.place !== "") {
      setMessage(getLocationMessage(playerLocation));
      setButtons(getMainButtons());
    } else {
      setMessage(getLocationMessage(playerLocation));
      setButtons(getRouteButtons());
    }
  }, [playerLocation]);

  function goMain() {
    setMessage(getLocationMessage(playerLocation));
    setButtons(getMainButtons());
  }

  function getMainButtons(): ActionButton[] {
    const placeLabels: Record<string, { label: string; onPress: () => void }> =
      {
        plaza: { label: "Mover", onPress: () => handleMover() },
        tienda: { label: "Comprar", onPress: () => handleComprar() },
        enfermeria: { label: "Curar Pokémon", onPress: () => handleCurar() },
        gimnasio: { label: "Desafiar líder", onPress: () => handleGimnasio() },
      };

    const first = placeLabels[playerLocation.place] ?? {
      label: "Mover",
      onPress: () => handleMover(),
    };

    return [
      { label: first.label, onPress: first.onPress },
      { label: "Pokémon", onPress: () => handlePokemon() },
      { label: "Mochila", onPress: () => handleMochila() },
      { label: "Acciones", onPress: () => handleActions() },
    ];
  }

  function getRouteButtons(): ActionButton[] {
    return [
      { label: "", onPress: () => {} },
      { label: "Siguiente →", onPress: () => handleEvent() },
      { label: "", onPress: () => {} },
      { label: "", onPress: () => {} },
    ];
  }

  async function handleMover(startIndex = 0) {
    const cities = await prologService.getCitiesToMove();

    if (!cities || cities.length === 0) {
      setMessage("No hay lugares a donde ir.");
      return;
    }

    setMessage("Mover\n\n¿A dónde quieres ir?");

    const actualIndex = startIndex % cities.length;
    const nextIndex = actualIndex + 2 >= cities.length ? 0 : actualIndex + 2;

    const city1 = cities[actualIndex];
    const city2 = cities[actualIndex + 1];

    const newButtons: ActionButton[] = [
      {
        label: getLocationById(city1)?.label || "",
        onPress: async () => {
          const citySelected = await prologService.moveToCity(city1);
          if (citySelected) {
            const route = await prologService.getInRouteLocation();
            setPlayerLocation(route);
          } else {
            setMessage("Error al elegir ubicación. Intenta de nuevo.");
            setButtons([
              { label: "", onPress: () => {} },
              { label: "Siguiente →", onPress: () => handleMover() },
              { label: "", onPress: () => {} },
              { label: "", onPress: () => {} },
            ]);
          }
        },
      },
      {
        label: getLocationById(city2)?.label || "",
        onPress: async () => {
          const citySelected = await prologService.moveToCity(city2);
          if (citySelected) {
            const route = await prologService.getInRouteLocation();
            setPlayerLocation(route);
          } else {
            setMessage("Error al elegir ubicación. Intenta de nuevo.");
            setButtons([
              { label: "", onPress: () => {} },
              { label: "Siguiente →", onPress: () => handleMover() },
              { label: "", onPress: () => {} },
              { label: "", onPress: () => {} },
            ]);
          }
        },
      },
      {
        label: "← Volver",
        onPress: () => goMain(),
      },
      {
        label: cities.length > 2 ? "Ver más →" : "",
        onPress: () => {
          if (cities.length > 2) {
            handleMover(nextIndex);
          }
        },
      },
    ];

    setButtons(newButtons);
  }

  async function handlePokemon() {
    const pokemonsFetched = await prologService.getTeamPokemons();

    setPokemons(pokemonsFetched);
    setPokemonViewOpen(true);

    setMessage("Pokémon");

    const newButtons: ActionButton[] = [
      {
        label: "← Volver",
        onPress: () => {
          goMain();
          setPokemonViewOpen(false);
        },
      },
      {
        label: "",
        onPress: () => {},
      },
      {
        label: "",
        onPress: () => {},
      },
      {
        label: "",
        onPress: () => {},
      },
    ];

    setButtons(newButtons);
  }

  async function handleMochila() {
    const backpack = await prologService.getBackpackContent();

    setMessage("Mochila\n\nDinero: $ " + backpack.money);

    const newButtons: ActionButton[] = [
      {
        label: "Pokebolas",
        onPress: async () => {
          setMessage("Pokebolas guardadas:");
          setButtons([
            {
              iconLabel: (
                <Image
                  source={pokeballSprites["normal"]}
                  style={scaleImage(24, 24)}
                />
              ),
              label:
                " x " + backpack.pokeballs.filter((p) => p === "normal").length,
              onPress: () => {},
            },
            {
              iconLabel: (
                <Image
                  source={pokeballSprites["superball"]}
                  style={scaleImage(22, 22)}
                />
              ),
              label:
                " x " +
                backpack.pokeballs.filter((p) => p === "superball").length,
              onPress: () => {},
            },
            {
              label: "← Volver",
              onPress: () => handleMochila(),
            },
            { label: "", onPress: () => {} },
          ]);
        },
      },
      {
        label: "Medallas",
        onPress: async () => {
          setMessage("Medallas conseguidas:");
          handleMedals(backpack.medals);
        },
      },
      {
        label: "← Volver",
        onPress: () => goMain(),
      },
      { label: "", onPress: () => {} },
    ];

    setButtons(newButtons);
  }

  function handleMedals(medals: string[], startIndex = 0) {
    const actualIndex = startIndex % medals.length;
    const nextIndex = actualIndex + 2 >= medals.length ? 0 : actualIndex + 2;

    const medal1 = medals[actualIndex];
    const medal2 = medals[actualIndex + 1];

    const newButtons: ActionButton[] = [
      {
        iconLabel: (
          <Image
            source={medal1 ? medalSprites[medal1] : ""}
            style={scaleImage(24, 24)}
          />
        ),
        label: medal1 ? " Medalla " + medal1.toUpperCase() : "",
        onPress: () => {},
      },
      {
        iconLabel: (
          <Image
            source={medal2 ? medalSprites[medal2] : ""}
            style={scaleImage(24, 24)}
          />
        ),
        label: medal2 ? " Medalla " + medal2.toUpperCase() : "",
        onPress: () => {},
      },
      {
        label: "← Volver",
        onPress: () => handleMochila(),
      },
      {
        label: medals.length > 2 ? "Ver más →" : "",
        onPress: () => {
          if (medals.length > 2) {
            handleMedals(medals, nextIndex);
          }
        },
      },
    ];

    setButtons(newButtons);
  }

  async function handleActions(startIndex = 0) {
    setMessage("Acciones");

    const locations = (await prologService.getLocationsInCity()).filter(
      (l) => l !== playerLocation.place,
    );

    const nextIndex = startIndex === 0 ? 2 : 0;

    const newButtons: ActionButton[] = [
      {
        label: locations[startIndex] ? "Ir a " + locations[startIndex] : "",
        onPress: async () => {
          const locationSelected = await prologService.moveToLocationInCity(
            locations[startIndex],
          );
          if (locationSelected) {
            const location = await prologService.getCurrentLocation();
            setPlayerLocation(location);
            goMain();
          }
        },
      },
      {
        label: locations[startIndex + 1]
          ? "Ir a " + locations[startIndex + 1]
          : "",
        onPress: async () => {
          const locationSelected = await prologService.moveToLocationInCity(
            locations[startIndex + 1],
          );
          if (locationSelected) {
            const location = await prologService.getCurrentLocation();
            setPlayerLocation(location);
            goMain();
          }
        },
      },
      {
        label: "← Volver",
        onPress: () => goMain(),
      },
      {
        label: locations.length > 2 ? "Ver más →" : "",
        onPress: () => {
          if (locations.length > 2) handleActions(nextIndex);
        },
      },
    ];

    setButtons(newButtons);
  }

  async function handleComprar() {
    const pokeballs = await prologService.getPokeballs();
    const backpack = await prologService.getBackpackContent();

    setMessage("Comprar\n\nDinero: $ " + backpack.money);

    const newButtons: ActionButton[] = [
      {
        iconLabel: (
          <Image
            source={pokeballSprites[pokeballs[0].name]}
            style={scaleImage(24, 24)}
          />
        ),
        label: pokeballs[0].name === "normal" ? " Pokebolas" : "",
        onPress: async () => handleGrabPokeballs(pokeballs[0], 0),
      },
      {
        iconLabel: (
          <Image
            source={pokeballSprites[pokeballs[1].name]}
            style={scaleImage(22, 22)}
          />
        ),
        label: pokeballs[1].name === "superball" ? " Superbolas" : "",
        onPress: async () => handleGrabPokeballs(pokeballs[1], 0),
      },
      {
        label: "← Volver",
        onPress: () => goMain(),
      },
      { label: "", onPress: () => {} },
    ];

    setButtons(newButtons);
  }

  function handleGrabPokeballs(ball: Pokeball, cant: number) {
    setMessage(
      "Pokebolas a comprar: " + cant + "\n\nCosto total: $" + cant * ball.cost,
    );

    setButtons([
      {
        iconLabel: (
          <Image
            source={pokeballSprites[ball.name]}
            style={
              pokeballSprites[ball.name] === "normal"
                ? scaleImage(24, 24)
                : scaleImage(22, 22)
            }
          />
        ),
        label: " - 1 ",
        onPress: () => handleGrabPokeballs(ball, Math.max(0, cant - 1)),
      },
      {
        iconLabel: (
          <Image
            source={pokeballSprites[ball.name]}
            style={
              pokeballSprites[ball.name] === "normal"
                ? scaleImage(24, 24)
                : scaleImage(22, 22)
            }
          />
        ),
        label: " + 1 ",
        onPress: () => handleGrabPokeballs(ball, Math.max(0, cant + 1)),
      },
      {
        label: "← Volver",
        onPress: () => handleComprar(),
      },
      { label: "Comprar", onPress: () => handlePay(ball, cant) },
    ]);
  }

  async function handlePay(ball: Pokeball, cant: number) {
    const backpack = await prologService.getBackpackContent();

    if (backpack.money < ball.cost * cant) {
      setMessage("Dinero insuficiente :(");

      const newButtons: ActionButton[] = [
        {
          label: "← Volver",
          onPress: () => handleGrabPokeballs(ball, cant),
        },
        {
          label: "",
          onPress: () => {},
        },
        {
          label: "",
          onPress: () => {},
        },
        {
          label: "",
          onPress: () => {},
        },
      ];

      setButtons(newButtons);
    } else {
      const ticket = await prologService.buyPokeball(ball.name, cant);

      if (ticket[0]) {
        setMessage("Bolas agregadas a tu inventario\n\nMuchas gracias :)");

        const newButtons: ActionButton[] = [
          {
            label: "← Volver",
            onPress: () => handleComprar(),
          },
          {
            label: "",
            onPress: () => {},
          },
          {
            label: "",
            onPress: () => {},
          },
          {
            label: "",
            onPress: () => {},
          },
        ];

        setButtons(newButtons);
      } else {
        setMessage(
          "Error al procesar la compra, una disculpa\n\nAgregadas correctamente: " +
            (cant - ticket[1]),
        );

        const newButtons: ActionButton[] = [
          {
            label: "← Volver",
            onPress: () => handleComprar(),
          },
          {
            label: "",
            onPress: () => {},
          },
          {
            label: "",
            onPress: () => {},
          },
          {
            label: "",
            onPress: () => {},
          },
        ];

        setButtons(newButtons);
      }
    }
  }

  function handleCurar() {
    setPokemonViewOpen(true);
    setMessage("Curar Pokémon");

    const newButtons: ActionButton[] = [
      {
        label: "Curar completamente",
        onPress: async () => {
          const healed = await prologService.healTeam(pokemons);
          if (healed) {
            const pokemonsFetched = await prologService.getTeamPokemons();

            setPokemons(pokemonsFetched);
            setMessage("Equipo curado completamente\n\nCuidense mucho :)");

            const newButtons: ActionButton[] = [
              {
                label: "← Volver",
                onPress: () => {
                  setPokemonViewOpen(false);
                  goMain();
                },
              },
              {
                label: "",
                onPress: () => {},
              },
              {
                label: "",
                onPress: () => {},
              },
              {
                label: "",
                onPress: () => {},
              },
            ];

            setButtons(newButtons);
          }
        },
      },
      {
        label: "",
        onPress: () => {},
      },
      {
        label: "← Volver",
        onPress: () => {
          setPokemonViewOpen(false);
          goMain();
        },
      },
      { label: "", onPress: () => {} },
    ];

    setButtons(newButtons);
  }

  async function handleGimnasio() {
    setMessage(
      "Estas desafiando al lider de gimnasio\n\nde " +
        getLocationById(playerLocation.main)?.label,
    );

    const newButtons: ActionButton[] = [
      {
        label: "Combatir",
        onPress: async () => {
          const isChallengeEffective = await prologService.challengeLeader();

          if (isChallengeEffective) {
            console.log(isChallengeEffective);
          } else {
            setMessage("Error al continuar con el reto :(");
            setButtons([
              { label: "", onPress: () => {} },
              { label: "Reintentar →", onPress: () => goMain() },
              { label: "", onPress: () => {} },
              { label: "", onPress: () => {} },
            ]);
          }
        },
      },
      {
        label: "Cancelar",
        onPress: () => goMain(),
      },
      { label: "", onPress: () => {} },
      { label: "", onPress: () => {} },
    ];

    setButtons(newButtons);
  }

  async function handleEvent() {
    const eventType = await prologService.generateEvent();
    console.log(eventType);

    switch (eventType) {
      case "pokeball":
        {
          const eventResult = await prologService.getEventDetails(eventType);

          setMessage(
            "¡Has encontrado una " +
              (eventResult === "normal" ? "Pokebola!" : "Superbola!"),
          );

          const newButtons: ActionButton[] = [
            {
              label: "Recoger",
              onPress: async () => {
                const ballPickedUp =
                  await prologService.pickupPokeball(eventResult);

                if (ballPickedUp) {
                  setMessage("Bola agregada a tu inventario");

                  const newButtons: ActionButton[] = [
                    { label: "", onPress: () => {} },
                    {
                      label: "Siguiente →",
                      onPress: async () => {
                        const isTravelFinished =
                          await prologService.finishRouteTravel();

                        if (isTravelFinished) {
                          const location =
                            await prologService.getCurrentLocation();
                          setPlayerLocation(location);
                          goMain();
                        } else {
                          setMessage("Error al continuar con el viaje :(");
                          setButtons([
                            { label: "", onPress: () => {} },
                            { label: "Reintentar →", onPress: () => goMain() },
                            { label: "", onPress: () => {} },
                            { label: "", onPress: () => {} },
                          ]);
                        }
                      },
                    },
                    { label: "", onPress: () => {} },
                    { label: "", onPress: () => {} },
                  ];

                  setButtons(newButtons);
                } else {
                  setMessage("Error al continuar con el viaje :(");
                  setButtons([
                    { label: "", onPress: () => {} },
                    { label: "Reintentar →", onPress: () => goMain() },
                    { label: "", onPress: () => {} },
                    { label: "", onPress: () => {} },
                  ]);
                }
              },
            },
            {
              label: "Ignorar",
              onPress: async () => {
                const isTravelFinished =
                  await prologService.finishRouteTravel();

                if (isTravelFinished) {
                  const location = await prologService.getCurrentLocation();
                  setPlayerLocation(location);
                  goMain();
                } else {
                  setMessage("Error al continuar con el viaje :(");
                  setButtons([
                    { label: "", onPress: () => {} },
                    { label: "Reintentar →", onPress: () => goMain() },
                    { label: "", onPress: () => {} },
                    { label: "", onPress: () => {} },
                  ]);
                }
              },
            },
            { label: "", onPress: () => {} },
            { label: "", onPress: () => {} },
          ];

          setButtons(newButtons);
        }
        break;

      case "egg":
        {
          const eventResult = await prologService.getEventDetails(eventType);

          setMessage("¡Has encontrado un huevo!");

          const newButtons: ActionButton[] = [
            {
              label: "Recoger",
              onPress: async () => {
                const eggPickedUp = await prologService.pickupEgg(eventResult);

                if (eggPickedUp[0]) {
                  setMessage(
                    "Huevo recogido\n\nAgregado a la " + eggPickedUp[1],
                  );

                  const newButtons: ActionButton[] = [
                    { label: "", onPress: () => {} },
                    {
                      label: "Siguiente →",
                      onPress: async () => {
                        const isTravelFinshed =
                          await prologService.finishRouteTravel();

                        if (isTravelFinshed) {
                          const location =
                            await prologService.getCurrentLocation();
                          setPlayerLocation(location);
                          goMain();
                        } else {
                          setMessage("Error al continuar con el viaje :(");
                          setButtons([
                            { label: "", onPress: () => {} },
                            { label: "Reintentar →", onPress: () => goMain() },
                            { label: "", onPress: () => {} },
                            { label: "", onPress: () => {} },
                          ]);
                        }
                      },
                    },
                    { label: "", onPress: () => {} },
                    { label: "", onPress: () => {} },
                  ];

                  setButtons(newButtons);
                } else {
                  setMessage("Error al continuar con el viaje :(");
                  setButtons([
                    { label: "", onPress: () => {} },
                    { label: "Reintentar →", onPress: () => goMain() },
                    { label: "", onPress: () => {} },
                    { label: "", onPress: () => {} },
                  ]);
                }
              },
            },
            {
              label: "Ignorar",
              onPress: async () => {
                const isTravelFinished =
                  await prologService.finishRouteTravel();

                if (isTravelFinished) {
                  const location = await prologService.getCurrentLocation();
                  setPlayerLocation(location);
                  goMain();
                } else {
                  setMessage("Error al continuar con el viaje :(");
                  setButtons([
                    { label: "", onPress: () => {} },
                    { label: "Reintentar →", onPress: () => goMain() },
                    { label: "", onPress: () => {} },
                    { label: "", onPress: () => {} },
                  ]);
                }
              },
            },
            { label: "", onPress: () => {} },
            { label: "", onPress: () => {} },
          ];

          setButtons(newButtons);
        }
        break;

      case "pokemon":
        {
          setMessage("¡Has encontrado un pokemon salvaje!");

          const newButtons: ActionButton[] = [
            {
              label: "Combatir",
              onPress: async () => {
                const eventResult = await prologService.startBattle(eventType);

                if (eventResult) {
                  console.log(eventResult);
                } else {
                  setMessage("Error al continuar con el viaje :(");
                  setButtons([
                    { label: "", onPress: () => {} },
                    { label: "Reintentar →", onPress: () => goMain() },
                    { label: "", onPress: () => {} },
                    { label: "", onPress: () => {} },
                  ]);
                }
              },
            },
            {
              label: "Huir",
              onPress: async () => {
                const isTravelFinished =
                  await prologService.finishRouteTravel();

                if (isTravelFinished) {
                  const location = await prologService.getCurrentLocation();
                  setPlayerLocation(location);
                  goMain();
                } else {
                  setMessage("Error al continuar con el viaje :(");
                  setButtons([
                    { label: "", onPress: () => {} },
                    { label: "Reintentar →", onPress: () => goMain() },
                    { label: "", onPress: () => {} },
                    { label: "", onPress: () => {} },
                  ]);
                }
              },
            },
            { label: "", onPress: () => {} },
            { label: "", onPress: () => {} },
          ];

          setButtons(newButtons);
        }
        break;

      case "trainer":
        {
          setMessage(
            "¡Has encontrado un entrenador!\n\nTe está retando a un combate",
          );

          const newButtons: ActionButton[] = [
            {
              label: "Aceptar",
              onPress: async () => {
                const eventResult = await prologService.startBattle(eventType);

                if (eventResult) {
                  console.log(eventResult);
                } else {
                  setMessage("Error al continuar con el viaje :(");
                  setButtons([
                    { label: "", onPress: () => {} },
                    { label: "Reintentar →", onPress: () => goMain() },
                    { label: "", onPress: () => {} },
                    { label: "", onPress: () => {} },
                  ]);
                }
              },
            },
            {
              label: "Rechazar",
              onPress: async () => {
                const isTravelFinished =
                  await prologService.finishRouteTravel();

                if (isTravelFinished) {
                  const location = await prologService.getCurrentLocation();
                  setPlayerLocation(location);
                  goMain();
                } else {
                  setMessage("Error al continuar con el viaje :(");
                  setButtons([
                    { label: "", onPress: () => {} },
                    { label: "Reintentar →", onPress: () => goMain() },
                    { label: "", onPress: () => {} },
                    { label: "", onPress: () => {} },
                  ]);
                }
              },
            },
            { label: "", onPress: () => {} },
            { label: "", onPress: () => {} },
          ];

          setButtons(newButtons);
        }
        break;
    }
  }

  return (
    <GameLayout message={message} buttons={buttons}>
      <View style={styles.outer}>
        <ScrollView
          horizontal
          centerContent
          showsHorizontalScrollIndicator={false}
          bounces={false}
          style={{ height: MAP_H }}
          contentContainerStyle={styles.scrollContent}
        >
          <View style={{ width: MAP_W, height: MAP_H, overflow: "hidden" }}>
            <Image
              source={require("../assets/map.png")}
              style={scaleImage(MAP_W, MAP_H)}
              resizeMode="cover"
            />
            {location && (
              <Animated.Image
                source={require("../assets/head.png")}
                style={[
                  { position: "absolute" },
                  scaleImage(HEAD_W, HEAD_H),
                  { left: headLeft, top: headTop },
                  { transform: [{ scale: pulse }] },
                ]}
                resizeMode="contain"
              />
            )}
          </View>
        </ScrollView>
        {pokemonViewOpen && <PokemonTeam pokemons={pokemons} />}
      </View>
    </GameLayout>
  );
}

const { width: SCREEN_W } = Dimensions.get("window");
const { height: SCREEN_H } = Dimensions.get("window");

const styles = StyleSheet.create({
  outer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    overflow: "hidden",
  },
  scrollContent: {
    alignItems: "center",
    justifyContent: "center",
  },
  pokemonOverlay: {
    position: "absolute",
    width: Math.min(SCREEN_W, MAP_W),
    height: Math.min(SCREEN_H, MAP_H),
    backgroundColor: "rgba(34, 139, 34, 0.75)",
    zIndex: 10,
  },
  pokemonGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    width: Math.min(SCREEN_W, MAP_W),
  },
});
