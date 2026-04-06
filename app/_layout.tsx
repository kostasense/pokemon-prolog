import { useFonts } from "expo-font";
import { Slot } from "expo-router";
import { useEffect, useState } from "react";
import { ActivityIndicator, StyleSheet, Text, View } from "react-native";
import { prologEngine } from "../src/prolog/PrologEngine";
import { dinamicos } from "../src/prolog/pl/dinamicos";
import { evolutions } from "../src/prolog/pl/evolutions";
import { types } from "../src/prolog/pl/types";
import { wild_pokemon } from "../src/prolog/pl/wild_pokemon";

export default function RootLayout() {
  const [prologReady, setPrologReady] = useState(false);
  const [prologError, setPrologError] = useState<string | null>(null);

  const [fontsLoaded, fontError] = useFonts({
    GameFont: require("../assets/pokemon.ttf"),
  });

  useEffect(() => {
    (async () => {
      try {
        await prologEngine.loadPrograms([
          dinamicos,
          types,
          wild_pokemon,
          evolutions,
        ]);
        setPrologReady(true);
      } catch (e: any) {
        setPrologError(e.message);
      }
    })();
  }, [fontsLoaded, fontError]);

  if (!fontsLoaded && !fontError) return null;

  return (
    <View style={styles.root}>
      <Slot />

      {!prologReady && !prologError && (
        <View style={styles.overlay}>
          <ActivityIndicator size="large" color="#fff" />
          <Text style={styles.loadingText}>Iniciando motor Prolog...</Text>
        </View>
      )}

      {prologError && (
        <View style={[styles.overlay, styles.overlayError]}>
          <Text style={styles.errorText}>
            Error Prolog:{"\n"}
            {prologError}
          </Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.72)",
    justifyContent: "center",
    alignItems: "center",
    gap: 14,
  },
  overlayError: {
    backgroundColor: "rgba(80,0,0,0.88)",
  },
  loadingText: {
    fontFamily: "GameFont",
    color: "#fff",
    fontSize: 14,
  },
  errorText: {
    fontFamily: "GameFont",
    color: "#ff6b6b",
    fontSize: 13,
    textAlign: "center",
    padding: 24,
  },
});
