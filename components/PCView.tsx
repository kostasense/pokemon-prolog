import { isEgg, scaleImage } from "@/utils/helpers";
import { Egg, Pokemon } from "@/utils/interfaces";
import { pokemonPCSprites } from "@/utils/sprites";
import { useEffect, useRef } from "react";
import {
  Animated,
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

const IS_NARROW = SCREEN_W < MAP_W;
const COLS = IS_NARROW ? 4 : 5;
const ROWS = IS_NARROW ? 5 : 4;

const GRID_H = VIEW_H * 0.6;
const CARD_H = VIEW_H * 0.4;
const SLOT_W = VIEW_W / COLS;
const SLOT_H = GRID_H / ROWS;

function PokemonSlot({
  p,
  isSelected,
  onPress,
}: {
  p: Pokemon | Egg;
  isSelected: boolean;
  onPress: () => void;
}) {
  const jumping = useRef(new Animated.Value(0)).current;
  const anim = useRef<Animated.CompositeAnimation | null>(null);

  useEffect(() => {
    if (isSelected) {
      anim.current = Animated.loop(
        Animated.sequence([
          Animated.timing(jumping, {
            toValue: 1,
            duration: 150,
            useNativeDriver: true,
          }),
          Animated.timing(jumping, {
            toValue: -1,
            duration: 150,
            useNativeDriver: true,
          }),
          Animated.timing(jumping, {
            toValue: 0,
            duration: 150,
            useNativeDriver: true,
          }),
        ]),
      );
      anim.current.start();
    } else {
      anim.current?.stop();
      jumping.setValue(0);
    }
  }, [isSelected, jumping]);

  const jumpY = jumping.interpolate({
    inputRange: [-1, 0, 1],
    outputRange: [3, 0, -3],
  });

  return (
    <TouchableOpacity style={styles.slot} activeOpacity={0.7} onPress={onPress}>
      <Animated.Image
        source={
          isEgg(p)
            ? require("../assets/huevo.png")
            : pokemonPCSprites[p.pokemon.toLowerCase()]
        }
        style={[
          isEgg(p)
            ? scaleImage(SLOT_W / 3, SLOT_H / 3.5)
            : scaleImage(SLOT_W, SLOT_H),
          { transform: [{ translateY: jumpY }] },
        ]}
        resizeMode="contain"
      />
    </TouchableOpacity>
  );
}

export default function PCView({
  pcPokemons,
  selectedPokemon,
  onSelectPokemon,
}: {
  pcPokemons: (Pokemon | Egg)[];
  selectedPokemon?: Pokemon | Egg | null;
  onSelectPokemon: (pokemon: Pokemon | Egg) => void;
}) {
  const slots = Array.from(
    { length: COLS * ROWS },
    (_, i) => pcPokemons[i] ?? null,
  );

  return (
    <View style={styles.overlay}>
      <View style={styles.gridContainer}>
        <Image
          source={require("../assets/message.png")}
          style={[StyleSheet.absoluteFill, scaleImage(VIEW_W, GRID_H)]}
          resizeMode="stretch"
        />
        <View style={styles.grid}>
          {slots.map((p, i) =>
            p ? (
              <PokemonSlot
                key={i}
                p={p}
                isSelected={
                  !!(selectedPokemon && selectedPokemon.tag === p.tag)
                }
                onPress={() => onSelectPokemon(p)}
              />
            ) : (
              <View key={i} style={styles.slot} />
            ),
          )}
        </View>
      </View>

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
  },
  grid: {
    position: "absolute",
    top: 0,
    left: 0,
    width: VIEW_W,
    height: GRID_H,
    flexDirection: "row",
    flexWrap: "wrap",
    padding: 10,
  },
  slot: {
    width: SLOT_W,
    height: SLOT_H,
    justifyContent: "center",
    alignItems: "center",
  },
  cardArea: {
    width: VIEW_W,
    height: CARD_H,
    justifyContent: "center",
    alignItems: "center",
  },
});
