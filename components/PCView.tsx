import { scaleImage } from "@/utils/helpers";
import { Egg, Pokemon } from "@/utils/interfaces";
import { pokemonPCSprites } from "@/utils/sprites";
import {
  Dimensions,
  Image,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";
import PokemonCard from "./PokemonCard";

const MAP_W = 600;
const MAP_H = 400;
const { width: SCREEN_W } = Dimensions.get("window");
const { height: SCREEN_H } = Dimensions.get("window");
const VIEW_W = Math.min(SCREEN_W, MAP_W);
const VIEW_H = Math.min(SCREEN_H, MAP_H);

const GRID_H = VIEW_H * 0.6;
const CARD_H = VIEW_H * 0.4;
const SLOT_W = VIEW_W / 5;
const SLOT_H = GRID_H / 4;

export default function PCView({
  pcPokemons,
  selectedPokemon,
  onSelectPokemon,
}: {
  pcPokemons: (Pokemon | Egg)[];
  selectedPokemon?: Pokemon | Egg | null;
  onSelectPokemon: (pokemon: Pokemon | Egg) => void;
}) {
  const slots = Array.from({ length: 20 }, (_, i) => pcPokemons[i] ?? null);

  return (
    <View style={styles.overlay}>
      {/* Grid superior — 20 slots */}
      <View style={styles.gridContainer}>
        <Image
          source={require("../assets/message.png")}
          style={StyleSheet.absoluteFill}
          resizeMode="stretch"
        />
        <View style={styles.grid}>
          {slots.map((p, i) => (
            <TouchableOpacity
              key={i}
              style={[
                styles.slot,
                selectedPokemon &&
                  p &&
                  selectedPokemon.tag === p.tag &&
                  styles.slotSelected,
              ]}
              activeOpacity={0.7}
              onPress={() => p && onSelectPokemon(p)}
            >
              {p && (
                <Image
                  source={pokemonPCSprites[p.pokemon.toLowerCase()]}
                  style={scaleImage(SLOT_W * 0.75, SLOT_H * 0.75)}
                  resizeMode="contain"
                />
              )}
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Card inferior */}
      <View style={styles.cardArea}>
        <PokemonCard pokemon={selectedPokemon ?? null} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    position: "absolute",
    width: VIEW_W,
    height: VIEW_H,
    backgroundColor: "rgba(34, 139, 34, 0.75)",
    zIndex: 10,
  },
  gridContainer: {
    width: VIEW_W,
    height: GRID_H,
    justifyContent: "center",
    alignItems: "center",
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    width: VIEW_W,
    height: GRID_H,
    padding: 4,
  },
  slot: {
    width: SLOT_W,
    height: SLOT_H,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.2)",
  },
  slotSelected: {
    backgroundColor: "rgba(255, 255, 100, 0.35)",
    borderColor: "yellow",
    borderWidth: 2,
  },
  cardArea: {
    width: VIEW_W,
    height: CARD_H,
    justifyContent: "center",
    alignItems: "center",
  },
});
