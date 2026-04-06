import { useFonts } from "expo-font";
import { Slot, SplashScreen } from "expo-router";
import { useEffect, useState } from "react";
import { ActivityIndicator, StyleSheet, Text, View } from "react-native";
import { prologEngine } from "../src/prolog/PrologEngine";
import { dinamicos } from "../src/prolog/pl/dinamicos";
import { evolutions } from "../src/prolog/pl/evolutions";
import { types } from "../src/prolog/pl/types";
import { wild_pokemon } from "../src/prolog/pl/wild_pokemon";

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [prologReady, setPrologReady] = useState(false);
  const [prologError, setPrologError] = useState<string | null>(null);

  const [fontsLoaded, fontError] = useFonts({
    GameFont: require("../assets/pokemon.ttf"),
  });

  // ── Carga del motor Prolog ──────────────────────────────────────
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
  }, []);

  // ── Ocultar splash cuando ambos estén listos ───────────────────
  useEffect(() => {
    if ((fontsLoaded || fontError) && (prologReady || prologError)) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded, fontError, prologReady, prologError]);

  // ── Estados de carga ───────────────────────────────────────────
  if (!fontsLoaded && !fontError) return null; // splash visible

  if (prologError)
    return (
      <View style={styles.center}>
        <Text style={styles.error}>Error Prolog: {prologError}</Text>
      </View>
    );

  if (!prologReady)
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" />
        <Text style={styles.loadingText}>Iniciando motor Prolog...</Text>
      </View>
    );

  return <Slot />;
}

const styles = StyleSheet.create({
  center: { flex: 1, justifyContent: "center", alignItems: "center", gap: 12 },
  error: { color: "red", padding: 20, fontFamily: "GameFont" },
  loadingText: { fontFamily: "GameFont" },
});
