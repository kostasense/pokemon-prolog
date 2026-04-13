import { Egg, Pokemon } from "@/utils/interfaces";
import { useState } from "react";
import { Dimensions, StyleSheet, TouchableOpacity, View } from "react-native";
import PokemonCard from "./PokemonCard";

const MAP_W = 600;
const MAP_H = 400;

const { width: SCREEN_W } = Dimensions.get("window");
const { height: SCREEN_H } = Dimensions.get("window");

const CARD_W = Math.min(SCREEN_W, MAP_W) / 2;
const CARD_H = Math.min(SCREEN_H, MAP_H) / 3;
const IMG_W = CARD_W * 0.85;
const IMG_H = CARD_H * 0.85;

export default function PokemonTeam({
  pokemons,
  onSelect,
}: {
  pokemons: (Pokemon | Egg | null)[];
  onSelect?: (tag: number) => void;
}) {
  const [selected, setSelected] = useState<number | null>(null);

  return (
    <View style={styles.pokemonOverlay}>
      <View style={styles.pokemonGrid}>
        {Array.from({ length: 6 }, (_, i) => (
          <View key={i} style={styles.cardWrapper}>
            <TouchableOpacity
              onPress={() => {
                setSelected(i);
                const p = pokemons[i];
                if (p) onSelect?.(p.tag);
              }}
              activeOpacity={0.75}
              style={styles.touchable}
            >
              <PokemonCard
                pokemon={pokemons[i] ?? null}
                selected={selected === i}
              />
            </TouchableOpacity>
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
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
  cardWrapper: {
    width: CARD_W,
    height: CARD_H,
    justifyContent: "center",
    alignItems: "center",
  },
  touchable: {
    width: IMG_W,
    height: IMG_H,
    justifyContent: "center",
    alignItems: "center",
  },
});
