import GameLayout, { ActionButton } from "@/components/GameLayout";
import { prologService } from "@/utils/PrologService";
import { useState } from "react";

export default function IntroScreen() {
  const [message, setMessage] = useState("Bienvenido a Pokémon Prolog.");
  const [buttons, setButtons] = useState(getMainButtons());
  const [selectedPokemon, setSelectedPokemon] = useState("");

  function getMainButtons(): [
    ActionButton,
    ActionButton,
    ActionButton,
    ActionButton,
  ] {
    return [
      { label: "", onPress: () => console.log() },
      { label: "Siguiente", onPress: () => handleNext(1) },
      { label: "", onPress: () => console.log() },
      { label: "", onPress: () => console.log() },
    ];
  }

  async function handleNext(num: number) {
    switch (num) {
      case 1: {
        setMessage("Empezaremos seleccionando tu Pokémon inicial.");
        setButtons([
          { label: "", onPress: () => console.log() },
          { label: "Siguiente", onPress: () => handleNext(2) },
          { label: "", onPress: () => console.log() },
          { label: "", onPress: () => console.log() },
        ]);
      }

      case 2: {
        const starters = await prologService.getStarters();
        setMessage("Selecciona uno.");
        setButtons([
          {
            label: starters[0] ?? "",
            onPress: () => {
              setSelectedPokemon(starters[0]);
              handleNext(3);
            },
          },
          {
            label: starters[0] ?? "",
            onPress: () => {
              setSelectedPokemon(starters[1]);
              handleNext(3);
            },
          },
          {
            label: starters[0] ?? "",
            onPress: () => {
              setSelectedPokemon(starters[2]);
              handleNext(3);
            },
          },
          { label: "", onPress: () => console.log() },
        ]);
      }

      case 3: {
        setMessage(`Seleccionar a: \n${selectedPokemon}`);
        setButtons([
          {
            label: "SI",
            onPress: () => {
              setSelectedPokemon(starters[0]);
              handleNext(3);
            },
          },
          {
            label: "NO",
            onPress: () => {
              setSelectedPokemon(starters[1]);
              handleNext(3);
            },
          },
          { label: "", onPress: () => console.log() },
          { label: "", onPress: () => console.log() },
        ]);
      }
    }
  }

  return <GameLayout message={message} buttons={buttons}></GameLayout>;
}
