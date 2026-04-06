/**
 * app/map.tsx
 */

import React, { useEffect, useState } from "react";
import { Image, ScrollView, StyleSheet, View } from "react-native";

import GameLayout from "../components/GameLayout";
import { getLocationById } from "../constants/mapLocations";
import { scaleImage } from "../utils/helpers";

const MAP_W = 600;
const MAP_H = 400;

const HEAD_W = 34;
const HEAD_H = 34;

export default function MapScreen() {
  const [playerLocationId, setPlayerLocationId] =
    useState<string>("littleroot");
  const [message, setMessage] = useState("Elige una opción:");

  useEffect(() => {
    console.log("[map] TODO: fetch estado del jugador desde Prolog");
  }, []);

  const location = getLocationById(playerLocationId);
  const headLeft = location ? (location.x / 100) * MAP_W - HEAD_W / 2 : 0;
  const headTop = location ? (location.y / 100) * MAP_H - HEAD_H / 2 : 0;

  const buttons: Parameters<typeof GameLayout>[0]["buttons"] = [
    {
      label: "Mover",
      onPress: () => console.log("[map] TODO: Mover a otra ubicación"),
    },
    {
      label: "Pokémon",
      onPress: () => console.log("[map] TODO: Revisar Pokémon"),
    },
    {
      label: "Mochila",
      onPress: () => console.log("[map] TODO: Revisar mochila"),
    },
    {
      label: "Menú",
      onPress: () => console.log("[map] TODO: Menú principal"),
    },
  ];

  return (
    <GameLayout message={message} buttons={buttons}>
      {/*
       * outer: ocupa todo el espacio que le deja GameLayout
       * y centra el mapa vertical y horizontalmente.
       */}
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
              style={[scaleImage(MAP_W, MAP_H)]}
              resizeMode="cover"
            />

            {location && (
              <Image
                source={require("../assets/head.png")}
                style={[
                  { position: "absolute" },
                  scaleImage(HEAD_W, HEAD_H),
                  { left: headLeft, top: headTop },
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
