import { scaleImage } from "@/utils/helpers";
import { pokemonSprites } from "@/utils/sprites";
import { useEffect, useRef, useState } from "react";
import { Animated, Dimensions, Image, StyleSheet, View } from "react-native";

const { width: SCREEN_W } = Dimensions.get("window");
const { height: SCREEN_H } = Dimensions.get("window");
const MAP_W = 600;
const MAP_H = 400;

const CARD_W = (Math.min(SCREEN_W, MAP_W) / 2) * 0.85;
const CARD_H = (Math.min(SCREEN_H, MAP_H) / 3) * 0.85;

export default function EvolutionView({
  pokemon,
  evolution,
  start,
}: {
  pokemon: string;
  evolution: string;
  start: boolean;
}) {
  const pokemonScale = useRef(new Animated.Value(1)).current;
  const evolutionScale = useRef(new Animated.Value(0)).current;
  const jumping = useRef(new Animated.Value(0)).current;
  const [animating, setAnimating] = useState(false);

  const jumpY = jumping.interpolate({
    inputRange: [-1, 0, 1],
    outputRange: [3, 0, -3],
  });

  const [evolved, setEvolved] = useState(false);

  useEffect(() => {
    if (!start) return;

    setAnimating(true);

    const evolutionLoop = Animated.loop(
      Animated.parallel([
        Animated.sequence([
          Animated.timing(pokemonScale, {
            toValue: 0,
            duration: 500,
            useNativeDriver: true,
          }),
          Animated.timing(pokemonScale, {
            toValue: 1,
            duration: 500,
            useNativeDriver: true,
          }),
        ]),
        Animated.sequence([
          Animated.timing(evolutionScale, {
            toValue: 1,
            duration: 500,
            useNativeDriver: true,
          }),
          Animated.timing(evolutionScale, {
            toValue: 0,
            duration: 500,
            useNativeDriver: true,
          }),
        ]),
      ]),
      { iterations: 4 },
    );

    evolutionLoop.start(() => {
      setAnimating(false);
      Animated.parallel([
        Animated.timing(pokemonScale, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(evolutionScale, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start(() => {
        setEvolved(true);
        Animated.loop(
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
        ).start();
        setTimeout(() => jumping.stopAnimation(), 1500);
      });
    });
  }, [pokemonScale, jumping, evolutionScale, start]);

  return (
    <View style={styles.evolutionOverlay}>
      <Image
        source={require("../assets/message.png")}
        style={[scaleImage(CARD_W, CARD_H), styles.spriteBox]}
        resizeMode="stretch"
      />

      {!evolved && (
        <Animated.Image
          source={pokemonSprites[pokemon.toUpperCase()]}
          style={[
            scaleImage(CARD_W * 0.7, CARD_H * 0.7),
            {
              position: "absolute",
              transform: [{ scale: pokemonScale }],
              tintColor: animating ? "rgb(175, 255, 181)" : undefined,
            },
          ]}
          resizeMode="contain"
        />
      )}

      <Animated.Image
        source={pokemonSprites[evolution.toUpperCase()]}
        style={[
          scaleImage(CARD_W * 0.7, CARD_H * 0.7),
          {
            position: "absolute",
            transform: [{ scale: evolutionScale }, { translateY: jumpY }],
            tintColor: animating ? "rgb(175, 255, 181)" : undefined,
          },
        ]}
        resizeMode="contain"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  evolutionOverlay: {
    position: "absolute",
    width: Math.min(SCREEN_W, MAP_W),
    height: Math.min(SCREEN_H, MAP_H),
    backgroundColor: "rgba(34, 139, 34, 0.75)",
    zIndex: 10,
    justifyContent: "center",
    alignItems: "center",
  },
  spriteBox: {
    justifyContent: "center",
    alignItems: "center",
  },
});
