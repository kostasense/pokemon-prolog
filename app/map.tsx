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

import PokemonCard from "@/components/PokemonCard";
import { pokeballSprites } from "@/utils/sprites";
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
      { label: "", onPress: () => console.log() },
      { label: "Siguiente →", onPress: () => handleEvent() },
      { label: "", onPress: () => console.log() },
      { label: "", onPress: () => console.log() },
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
    const nextIndex = (actualIndex + 2) % cities.length;

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
              { label: "", onPress: () => console.log() },
              { label: "Siguiente →", onPress: () => handleMover() },
              { label: "", onPress: () => console.log() },
              { label: "", onPress: () => console.log() },
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
              { label: "", onPress: () => console.log() },
              { label: "Siguiente →", onPress: () => handleMover() },
              { label: "", onPress: () => console.log() },
              { label: "", onPress: () => console.log() },
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
    const pokemonsFetched = await prologService.getOwnedPokemons();

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
        onPress: () => console.log(),
      },
      {
        label: "",
        onPress: () => console.log(),
      },
      {
        label: "",
        onPress: () => console.log(),
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
                  source={require("../assets/pokeball.png")}
                  style={scaleImage(24, 24)}
                />
              ),
              label:
                " x " + backpack.pokeballs.filter((p) => p === "normal").length,
              onPress: () => console.log(),
            },
            {
              iconLabel: (
                <Image
                  source={require("../assets/superball.png")}
                  style={scaleImage(22, 22)}
                />
              ),
              label:
                " x " +
                backpack.pokeballs.filter((p) => p === "superball").length,
              onPress: () => console.log(),
            },
            {
              label: "← Volver",
              onPress: () => handleMochila(),
            },
            { label: "", onPress: () => console.log() },
          ]);
        },
      },
      { label: "", onPress: () => console.log() },
      {
        label: "← Volver",
        onPress: () => goMain(),
      },
      { label: "", onPress: () => console.log() },
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
      { label: "", onPress: () => console.log() },
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
          onPress: () => console.log(),
        },
        {
          label: "",
          onPress: () => console.log(),
        },
        {
          label: "",
          onPress: () => console.log(),
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
            onPress: () => console.log(),
          },
          {
            label: "",
            onPress: () => console.log(),
          },
          {
            label: "",
            onPress: () => console.log(),
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
            onPress: () => console.log(),
          },
          {
            label: "",
            onPress: () => console.log(),
          },
          {
            label: "",
            onPress: () => console.log(),
          },
        ];

        setButtons(newButtons);
      }
    }
  }

  function handleCurar() {
    console.log("handle curar");
  }

  function handleGimnasio() {
    console.log("handle gimnasio");
  }

  async function handleEvent() {
    console.log("handle event");
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
        {pokemonViewOpen && (
          <View style={styles.pokemonOverlay}>
            <View style={styles.pokemonGrid}>
              {Array.from({ length: 6 }, (_, i) => (
                <PokemonCard key={i} pokemon={pokemons[i] ?? null} />
              ))}
            </View>
          </View>
        )}
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
