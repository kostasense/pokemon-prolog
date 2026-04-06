import { useRouter } from "expo-router";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

export default function MenuScreen() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Pokémon Prolog</Text>
      <TouchableOpacity
        style={styles.btn}
        onPress={() => router.push("/map" as any)}
      >
        <Text style={styles.btnText}>Nueva partida</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    gap: 16,
  },
  title: { fontFamily: "GameFont", fontSize: 32, fontWeight: "bold" },
  btn: {
    backgroundColor: "#e63",
    padding: 14,
    borderRadius: 8,
    minWidth: 180,
    alignItems: "center",
  },
  btnText: {
    color: "#fff",
    fontFamily: "GameFont",
    fontSize: 16,
    fontWeight: "bold",
  },
});
