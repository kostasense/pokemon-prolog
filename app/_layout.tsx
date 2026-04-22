import * as Font from "expo-font";
import { Slot } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  BackHandler,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { prologEngine } from "../src/prolog/PrologEngine";
import { dynamics } from "../src/prolog/pl/dynamics";
import { engine } from "../src/prolog/pl/engine";
import { map } from "../src/prolog/pl/map";
import { pokemon } from "../src/prolog/pl/pokemon";
import { trainers } from "../src/prolog/pl/trainers";

export default function RootLayout() {
  const [prologReady, setPrologReady] = useState(false);
  const [prologError, setPrologError] = useState<string | null>(null);
  const [appReady, setAppReady] = useState(false);

  useEffect(() => {
    const sub = BackHandler.addEventListener("hardwareBackPress", () => true);
    return () => sub.remove();
  }, []);

  useEffect(() => {
    async function init() {
      try {
        // Carga fuente y Prolog en paralelo
        await Promise.all([
          Font.loadAsync({ GameFont: require("../assets/pokemon.ttf") }),
          (async () => {
            await prologEngine.loadPrograms([
              dynamics,
              pokemon,
              engine,
              map,
              trainers,
            ]);
            await prologEngine.queryOne("init_game");
            setPrologReady(true);
          })(),
        ]);
      } catch (e: any) {
        // La fuente falló pero dejamos pasar — Prolog puede haber cargado bien
        console.warn("Init error:", e.message);
        setPrologError(e.message.includes("prolog") ? e.message : null);
        setPrologReady(true);
      } finally {
        setAppReady(true); // ✅ siempre desbloquea la app
      }
    }
    init();
  }, []);

  if (!appReady) return null;

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
  root: { flex: 1 },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.72)",
    justifyContent: "center",
    alignItems: "center",
    gap: 14,
  },
  overlayError: { backgroundColor: "rgba(80,0,0,0.88)" },
  loadingText: { fontFamily: "GameFont", color: "#fff", fontSize: 14 },
  errorText: {
    fontFamily: "GameFont",
    color: "#ff6b6b",
    fontSize: 13,
    textAlign: "center",
    padding: 24,
  },
});
