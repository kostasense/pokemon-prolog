import React, { useEffect, useRef, useState } from "react";
import { Animated, Image, ScrollView, StyleSheet, View } from "react-native";

import GameLayout, { ActionButton } from "../components/GameLayout";
import { getLocationById } from "../constants/mapLocations";
import { scaleImage } from "../utils/helpers";
import { prologService } from "../utils/PrologService";

const MAP_W = 600;
const MAP_H = 400;
const HEAD_W = 34;
const HEAD_H = 34;
const HEAD_SCALE_MAX = 1.25;

export default function MapScreen() {
  const [playerLocationId, setPlayerLocationId] = useState("littleroot");
  const [message, setMessage] = useState("Elige una opción:");
  const [buttons, setButtons] = useState(getMainButtons());

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

  const location = getLocationById(playerLocationId);
  const headLeft = location ? (location.x / 100) * MAP_W - HEAD_W / 2 : 0;
  const headTop = location ? (location.y / 100) * MAP_H - HEAD_H / 2 : 0;

  useEffect(() => {
    setMessage(
      "Ubicación actual -> " + location?.label + "\n\nElige una opción:",
    );
  }, [location]);

  function goMain() {
    setMessage(
      "Ubicación actual -> " + location?.label + "\n\nElige una opción:",
    );
    setButtons(getMainButtons());
  }

  function getMainButtons(): [
    ActionButton,
    ActionButton,
    ActionButton,
    ActionButton,
  ] {
    return [
      { label: "Mover", onPress: () => handleMover() },
      { label: "Pokémon", onPress: () => handlePokemon() },
      { label: "Mochila", onPress: () => console.log("[map] TODO: Mochila") },
      { label: "Menú", onPress: () => console.log("[map] TODO: Menú") },
    ];
  }

  function handleMover() {
    setMessage("¿A dónde quieres ir?");
    setButtons([
      { label: "Ruta 1", onPress: () => console.log("[map] TODO: ir Ruta 1") },
      { label: "Ciudad", onPress: () => console.log("[map] TODO: ir Ciudad") },
      { label: "Cueva", onPress: () => console.log("[map] TODO: ir Cueva") },
      { label: "← Atrás", onPress: () => goMain() },
    ]);
  }

  async function handlePokemon() {
    const names = await prologService.getWildPokemonNames(3);
    setMessage("¿Qué Pokémon te interesa?");
    setButtons([
      {
        label: names[0] ?? "???",
        onPress: () => console.log("[map] Seleccionó:", names[0]),
      },
      {
        label: names[1] ?? "???",
        onPress: () => console.log("[map] Seleccionó:", names[1]),
      },
      {
        label: names[2] ?? "???",
        onPress: () => console.log("[map] Seleccionó:", names[2]),
      },
      { label: "← Atrás", onPress: () => goMain() },
    ]);
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
      </View>
    </GameLayout>
  );
}

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
});
