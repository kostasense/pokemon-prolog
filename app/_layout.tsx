import { Slot } from "expo-router";
import { useEffect, useState } from "react";
import { ActivityIndicator, StyleSheet, Text, View } from "react-native";
import { prologEngine } from "./prolog/PrologEngine";
import { dinamicos } from "./prolog/pl/dinamicos";
import { evolutions } from "./prolog/pl/evolutions";
import { types } from "./prolog/pl/types";
import { wild_pokemon } from "./prolog/pl/wild_pokemon";

export default function RootLayout() {
  const [ready, setReady] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        await prologEngine.loadPrograms([
          types,
          wild_pokemon,
          evolutions,
          dinamicos,
        ]);
        setReady(true);
      } catch (e: any) {
        setError(e.message);
      }
    })();
  }, []);

  if (error)
    return (
      <View style={styles.center}>
        <Text style={styles.error}>Error Prolog: {error}</Text>
      </View>
    );

  if (!ready)
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" />
        <Text>Iniciando motor Prolog...</Text>
      </View>
    );

  // <Slot> renderiza la pantalla activa (index, world, battle, etc.)
  return <Slot />;
}

const styles = StyleSheet.create({
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  error: { color: "red", padding: 20 },
});
