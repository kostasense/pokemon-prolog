import GameLayout, { ActionButton } from "@/components/GameLayout";
import { scaleImage } from "@/utils/helpers";
import { prologService } from "@/utils/PrologService";
import { pokemonSprites } from "@/utils/sprites";
import { router } from "expo-router";
import { useEffect, useRef, useState } from "react";
import { Animated, Dimensions, Image, StyleSheet, View } from "react-native";

const POKEBALL_SIZE = 64;

function PokeballRow({
  starters,
  selectedIndex,
}: {
  starters: string[];
  selectedIndex: number | null;
}) {
  const wobble = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (selectedIndex === null) {
      wobble.setValue(0);
      return;
    }
    const anim = Animated.loop(
      Animated.sequence([
        Animated.timing(wobble, {
          toValue: 1,
          duration: 150,
          useNativeDriver: true,
        }),
        Animated.timing(wobble, {
          toValue: -1,
          duration: 150,
          useNativeDriver: true,
        }),
        Animated.timing(wobble, {
          toValue: 0,
          duration: 150,
          useNativeDriver: true,
        }),
      ]),
    );
    anim.start();
    return () => anim.stop();
  }, [selectedIndex, wobble]);

  const rotation = wobble.interpolate({
    inputRange: [-1, 0, 1],
    outputRange: ["-15deg", "0deg", "15deg"],
  });

  return (
    <View style={styles.pokeballRow}>
      {[0, 1, 2].map((i) => {
        const isSelected = selectedIndex === i;
        return (
          <Animated.Image
            key={i}
            source={require("../assets/pokeball.png")}
            style={[
              styles.pokeball,
              isSelected && { transform: [{ rotate: rotation }] },
            ]}
            resizeMode="contain"
          />
        );
      })}
    </View>
  );
}

export default function IntroScreen() {
  const [message, setMessage] = useState("Bienvenido a Pokémon Prolog.");
  const [buttons, setButtons] = useState(getMainButtons());
  const [selectedPokemon, setSelectedPokemon] = useState("");
  const [currentCase, setCurrentCase] = useState(0);
  const [starters, setStarters] = useState([""]);

  function getMainButtons(): [
    ActionButton,
    ActionButton,
    ActionButton,
    ActionButton,
  ] {
    return [
      { label: "", onPress: () => console.log() },
      { label: "Siguiente →", onPress: () => handleNext(1) },
      { label: "", onPress: () => console.log() },
      { label: "", onPress: () => console.log() },
    ];
  }

  async function handleNext(num: number, pokemon?: string) {
    setCurrentCase(num);
    switch (num) {
      case 1:
        {
          setMessage("Empezaremos seleccionando tu Pokémon inicial.");
          setButtons([
            { label: "", onPress: () => console.log() },
            { label: "Siguiente →", onPress: () => handleNext(2) },
            { label: "", onPress: () => console.log() },
            { label: "", onPress: () => console.log() },
          ]);
        }
        break;

      case 2:
        {
          const starters = await prologService.getStarters();
          setStarters(starters);
          setMessage("Selecciona a uno:");
          setButtons([
            {
              label: starters[0] ?? "",
              onPress: () => {
                setSelectedPokemon(starters[0]);
                handleNext(3, starters[0]);
              },
            },
            {
              label: starters[1] ?? "",
              onPress: () => {
                setSelectedPokemon(starters[1]);
                handleNext(3, starters[1]);
              },
            },
            {
              label: starters[2] ?? "",
              onPress: () => {
                setSelectedPokemon(starters[2]);
                handleNext(3, starters[2]);
              },
            },
            { label: "", onPress: () => console.log() },
          ]);
        }
        break;

      case 3:
        {
          const name = pokemon ?? selectedPokemon;
          setMessage(`Seleccionar a: \n${name}`);
          setButtons([
            {
              label: "SI",
              onPress: async () => {
                const starterSelected = await prologService.chooseStarter(name);
                if (starterSelected) {
                  handleNext(4);
                } else {
                  setMessage("Error al elegir el inicial. Intenta de nuevo.");
                  setButtons([
                    { label: "", onPress: () => console.log() },
                    { label: "Siguiente →", onPress: () => handleNext(2) },
                    { label: "", onPress: () => console.log() },
                    { label: "", onPress: () => console.log() },
                  ]);
                }
              },
            },
            {
              label: "NO",
              onPress: () => {
                setSelectedPokemon("");
                handleNext(2);
              },
            },
            { label: "", onPress: () => console.log() },
            { label: "", onPress: () => console.log() },
          ]);
        }
        break;

      case 4:
        {
          setMessage("Buena suerte.");
          setButtons([
            { label: "", onPress: () => console.log() },
            { label: "Siguiente →", onPress: () => router.push("/map" as any) },
            { label: "", onPress: () => console.log() },
            { label: "", onPress: () => console.log() },
          ]);
        }
        break;
    }
  }

  const selectedIndex = selectedPokemon
    ? starters.indexOf(selectedPokemon)
    : null;

  const isConfirming = currentCase >= 3;

  return (
    <GameLayout message={message} buttons={buttons}>
      {isConfirming ? (
        <View style={styles.confirmContainer}>
          <View style={styles.spriteBox}>
            <Image
              source={require("../assets/message.png")}
              style={scaleImage(SCREEN_W / 2, 120)}
              resizeMode="stretch"
            />
            <Image
              source={pokemonSprites[selectedPokemon]}
              style={[scaleImage(120, 120), { position: "absolute" }]}
              resizeMode="contain"
            />
          </View>
          <View style={styles.pokeballHalf}>
            <PokeballRow starters={starters} selectedIndex={selectedIndex} />
          </View>
        </View>
      ) : (
        <View style={styles.centered}>
          <PokeballRow starters={starters} selectedIndex={null} />
        </View>
      )}
    </GameLayout>
  );
}

const { width: SCREEN_W } = Dimensions.get("window");

const styles = StyleSheet.create({
  confirmContainer: {
    flex: 1,
  },
  spriteBox: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  pokeballHalf: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  pokeballRow: {
    flexDirection: "row",
    gap: 24,
    alignItems: "center",
  },
  pokeball: {
    width: POKEBALL_SIZE,
    height: POKEBALL_SIZE,
  },
});
