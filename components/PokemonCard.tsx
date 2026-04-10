/**
 * PokemonCard
 * Carta de visualizacion de los datos del pokemon.
 *
 */
import { isEgg, scaleImage } from "@/utils/helpers";
import { Egg, Pokemon } from "@/utils/interfaces";
import { pokemonSprites } from "@/utils/sprites";
import { useEffect, useRef } from "react";
import {
  Animated,
  Dimensions,
  Image,
  StyleSheet,
  Text,
  View,
} from "react-native";

export default function PokemonCard({
  pokemon,
  selected = false,
}: {
  pokemon: Pokemon | Egg | null;
  selected?: boolean;
}) {
  const jumping = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (selected === false) {
      jumping.setValue(0);
      return;
    }
    const anim = Animated.loop(
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
    anim.start();
    return () => anim.stop();
  }, [selected, jumping]);

  const jumpY = jumping.interpolate({
    inputRange: [-1, 0, 1],
    outputRange: [3, 0, -3], // -3 sube, 3 baja
  });

  if (!pokemon) {
    return (
      <View style={styles.card}>
        <Image
          source={require("../assets/message.png")}
          style={[scaleImage(CARD_W, CARD_H), { position: "absolute" }]}
          resizeMode="stretch"
        />
        <Image
          source={require("../assets/pokeball-template.png")}
          style={[
            scaleImage(CARD_W * 0.6, CARD_H * 0.6),
            {
              width: CARD_W,
            },
          ]}
          resizeMode="contain"
        />
      </View>
    );
  }

  if (isEgg(pokemon)) {
    return (
      <View style={styles.card}>
        <View style={{ width: CARD_W, height: CARD_H, position: "absolute" }}>
          <Image
            source={require("../assets/message.png")}
            style={[scaleImage(CARD_W, CARD_H), { position: "absolute" }]}
            resizeMode="stretch"
          />
          {selected && (
            <View style={styles.selectedOverlay}>
              <Image
                source={require("../assets/pokeball-template.png")}
                style={[
                  scaleImage(CARD_W * 0.6, CARD_H * 0.6),
                  {
                    width: CARD_W,
                    opacity: 0.5,
                  },
                ]}
                resizeMode="contain"
              />
            </View>
          )}
        </View>
        <Image
          source={require("../assets/huevo.gif")}
          style={[
            scaleImage(CARD_W * 0.4, CARD_H * 0.4),
            {
              width: CARD_W,
            },
          ]}
          resizeMode="contain"
        />
      </View>
    );
  }

  return (
    <View style={styles.card}>
      <View style={{ width: CARD_W, height: CARD_H, position: "absolute" }}>
        <Image
          source={require("../assets/message.png")}
          style={[scaleImage(CARD_W, CARD_H), { position: "absolute" }]}
          resizeMode="stretch"
        />
        {selected && (
          <View style={styles.selectedOverlay}>
            <Image
              source={require("../assets/pokeball-template.png")}
              style={[
                scaleImage(CARD_W * 0.6, CARD_H * 0.6),
                {
                  width: CARD_W,
                  opacity: 0.5,
                },
              ]}
              resizeMode="contain"
            />
          </View>
        )}
      </View>
      <Animated.Image
        source={pokemon ? pokemonSprites[pokemon.pokemon] : null}
        style={[
          scaleImage(CARD_W * 0.7, CARD_H * 0.7),
          {
            width: CARD_W * 0.5,
            left: CARD_W / 25,
          },
          selected && { transform: [{ translateY: jumpY }] },
        ]}
        resizeMode="contain"
      />
      <View style={styles.infoContainer}>
        <Text style={styles.info}>{pokemon?.pokemon}</Text>
        <Text style={styles.info}>Nivel: {pokemon?.level}</Text>

        {/* HP Bar */}
        <View style={styles.barRow}>
          <View style={styles.barBg}>
            <View
              style={[
                styles.barFill,
                {
                  width: `${(pokemon ? pokemon.currentHp / pokemon.maxHp : 0) * 100}%`,
                  backgroundColor:
                    pokemon.state === "HEALTHY"
                      ? "#4caf50"
                      : pokemon.state === "WEAK"
                        ? "#cc8b1a"
                        : "#cc1a1a",
                },
              ]}
            />
          </View>
          <Text style={styles.barLabel}>
            {pokemon.state !== "FAINTED"
              ? `${pokemon.currentHp}/${pokemon.maxHp}`
              : "DRT"}
          </Text>
        </View>

        {/* EXP Bar */}
        <View style={styles.barRow}>
          <View style={styles.barBg}>
            <View
              style={[
                styles.barFill,
                {
                  width: `${pokemon ? Math.min((pokemon.exp / (pokemon.level * 20 + 50)) * 100, 100) : 0}%`,
                  backgroundColor: "#2196f3",
                },
              ]}
            />
          </View>
          <Text style={styles.barLabel}>{pokemon ? `EXP` : "-"}</Text>
        </View>
      </View>
    </View>
  );
}

const { width: SCREEN_W } = Dimensions.get("window");
const { height: SCREEN_H } = Dimensions.get("window");
const MAP_W = 600;
const MAP_H = 400;

const CARD_W = (Math.min(SCREEN_W, MAP_W) / 2) * 0.85;
const CARD_H = (Math.min(SCREEN_H, MAP_H) / 3) * 0.85;

const styles = StyleSheet.create({
  card: {
    width: Math.min(SCREEN_W, MAP_W) / 2,
    height: Math.min(SCREEN_H, MAP_H) / 3,
    justifyContent: "center",
    alignItems: "center",
    flexDirection: "row",
    paddingHorizontal: 5,
  },
  infoContainer: {
    width: CARD_W / 1.5,
    flexDirection: "column",
    justifyContent: "center",
    paddingRight: CARD_W / 7,
  },
  info: {
    fontFamily: "GameFont",
    fontSize: CARD_W / 13,
    color: "#1a1a1a",
    textAlign: "center",
  },
  barRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 2,
    gap: 4,
  },
  barBg: {
    flex: 1,
    height: 6,
    backgroundColor: "rgba(0,0,0,0.15)",
    borderRadius: 3,
    overflow: "hidden",
    minWidth: CARD_W / 2.8,
  },
  barFill: {
    height: "100%",
    borderRadius: 3,
  },
  barLabel: {
    fontFamily: "GameFont",
    fontSize: CARD_W / 17,
    width: 30,
    color: "#1a1a1a",
    textAlign: "center",
  },
  selectedOverlay: {
    width: CARD_W * 0.9674,
    height: CARD_H * 0.88,
    borderRadius: 3,
    backgroundColor: "rgba(59, 168, 42, 0.35)",
    justifyContent: "center",
    alignItems: "center",
    margin: "auto",
  },
});
