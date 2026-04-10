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
import GameLayout, { ActionButton } from "../components/GameLayout";
import { getLocationById } from "../constants/mapLocations";
import { scaleImage } from "../utils/helpers";
import { Egg, Location, Pokemon } from "../utils/interfaces";
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
    return [
      { label: "Mover", onPress: () => handleMover() },
      { label: "Pokémon", onPress: () => handlePokemon() },
      { label: "Mochila", onPress: () => handleMochila() },
      { label: "Menú", onPress: () => handleMenu() },
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
    const locations = await prologService.getMoveLocations();

    if (!locations || locations.length === 0) {
      setMessage("No hay lugares a donde ir.");
      return;
    }

    setMessage("¿A dónde quieres ir?");

    const actualIndex = startIndex % locations.length;
    const nextIndex = (actualIndex + 2) % locations.length;

    const loc1 = locations[actualIndex];
    const loc2 = locations[actualIndex + 1];

    const newButtons: ActionButton[] = [
      {
        label: getLocationById(loc1)?.label || "",
        onPress: async () => {
          const locationSelected = await prologService.moveToLocation(loc1);
          if (locationSelected) {
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
        label: getLocationById(loc2)?.label || "",
        onPress: async () => {
          const locationSelected = await prologService.moveToLocation(loc2);
          if (locationSelected) {
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
        label: locations.length > 2 ? "Ver más →" : "",
        onPress: () => {
          if (locations.length > 2) {
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

    setMessage("Pokémon en tu equipo:");

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

    setMessage("Contenido de la mochila\n\nDinero: $ " + backpack.money);

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

  async function handleMenu() {
    console.log("handle menu");
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
