/* eslint-disable react-hooks/exhaustive-deps */
import BadgeWonView from "@/components/BadgeWonView";
import GameLayout, { ActionButton } from "@/components/GameLayout";
import PokemonTeam from "@/components/PokemonTeam";
import { isEgg, scaleImage } from "@/utils/helpers";
import { Egg, FoePokemon, Pokemon } from "@/utils/interfaces";
import { prologService } from "@/utils/PrologService";
import { pokeballSprites, pokemonSprites } from "@/utils/sprites";
import { router, useLocalSearchParams } from "expo-router";
import { useEffect, useRef, useState } from "react";
import {
  Animated,
  Dimensions,
  Image,
  StyleSheet,
  Text,
  View,
} from "react-native";

const { width: SCREEN_W } = Dimensions.get("window");
const SCENE_W = 600;
const SCENE_H = 400;
const VIEW_W = Math.min(SCREEN_W, SCENE_W);

const ENEMY_RIGHT = VIEW_W * 0.05;
const ENEMY_TOP = SCENE_H * 0.05;
const PLAYER_LEFT = VIEW_W * 0.05;
const PLAYER_BOTTOM = SCENE_H * 0.05;
const SPRITE_SIZE = VIEW_W * 0.3;
const STATS_W = VIEW_W * 0.3;

export default function BattleScreen() {
  const { eventType, gym, fights } = useLocalSearchParams();
  const isGym = gym === "true";
  const maxFights = isGym ? Number(fights ?? 1) : 1;
  const [message, setMessage] = useState("...");
  const [buttons, setButtons] = useState<ActionButton[]>(getEmptyButtons());
  const [enemy, setEnemy] = useState<[FoePokemon, string] | null>(null);
  const [pokemons, setPokemons] = useState<(Pokemon | Egg)[]>([]);
  const [pokemonViewOpen, setPokemonViewOpen] = useState(false);
  const selectedTagRef = useRef(0);
  const [activePokemon, setActivePokemon] = useState<Pokemon>({
    tag: 0,
    pokemon: "",
    state: "",
    level: 0,
    atk: 0,
    currentHp: 0,
    maxHp: 0,
    exp: 0,
    moves: [],
  });
  const [trainerVisible, setTrainerVisible] = useState(false);
  const [enemyPokemonVisible, setEnemyPokemonVisible] = useState(false);
  const [round, setRound] = useState(1);
  const [fight, setFight] = useState(1);
  const [badgeWon, setBadgeWon] = useState("");

  const enemyX = useRef(new Animated.Value(VIEW_W)).current;
  const playerX = useRef(new Animated.Value(-VIEW_W)).current;
  const enemyPokemonX = useRef(new Animated.Value(VIEW_W)).current;
  const blinking = useRef(new Animated.Value(0)).current;

  const blink = blinking.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 0.2],
  });

  const anim = Animated.loop(
    Animated.sequence([
      Animated.timing(blinking, {
        toValue: 1,
        duration: 150,
        useNativeDriver: true,
      }),
      Animated.timing(blinking, {
        toValue: 0,
        duration: 150,
        useNativeDriver: true,
      }),
    ]),
    { iterations: 3 },
  );

  useEffect(() => {
    async function loadData() {
      const enemyPokemon = await prologService.getEnemyPokemon();
      const trainer =
        eventType === "trainer"
          ? await prologService.getInRouteTrainer()
          : isGym
            ? await prologService.getGymLeader()
            : "";
      setEnemy([enemyPokemon, trainer]);

      if (trainer !== "") {
        setTrainerVisible(true);
      }

      const team = await prologService.getTeamPokemons();
      setPokemons(team);

      Animated.sequence([
        Animated.timing(enemyX, {
          toValue: 0,
          duration: 600,
          useNativeDriver: true,
        }),
      ]).start(() => {
        setTimeout(() => {
          if (isGym && trainer !== "") {
            setMessage(
              `El líder de gimnasio ${trainer}\n\nha aceptado tu desafío`,
            );
          } else if (trainer !== "") {
            setMessage("¡" + trainer + " quiere pelear!");
          } else {
            setMessage(
              "¡Un " + enemyPokemon.pokemon + " salvaje quiere pelear!",
            );
          }
          setButtons(getMainButtons());
        }, 1000);
      });
    }
    loadData();
  }, []);

  async function refreshStats() {
    const active = await prologService.getActivePokemon();
    setActivePokemon(active);
    const enemyPokemon = await prologService.getEnemyPokemon();
    setEnemy((prev) => (prev ? [enemyPokemon, prev[1]] : prev));
  }

  function getMainButtons(): ActionButton[] {
    return [
      { label: "", onPress: () => {} },
      {
        label: "Siguiente →",
        onPress: () => {
          setMessage("Elige un Pokémon para pelear:");
          setPokemonViewOpen(true);
          setButtons([
            { label: "", onPress: () => {} },
            {
              label: "Aceptar →",
              onPress: () => handleChoosePokemon(selectedTagRef.current),
            },
            { label: "", onPress: () => {} },
            { label: "", onPress: () => {} },
          ]);
        },
      },
      { label: "", onPress: () => {} },
      { label: "", onPress: () => {} },
    ];
  }

  function getEmptyButtons(): ActionButton[] {
    return [
      { label: "", onPress: () => {} },
      { label: "", onPress: () => {} },
      { label: "", onPress: () => {} },
      { label: "", onPress: () => {} },
    ];
  }

  async function handleChoosePokemon(tag: number) {
    const team = await prologService.getTeamPokemons();

    if (tag === 0) {
      setMessage("Elige un Pokémon para pelear:");
      return;
    }

    const found = team.find((p) => p.tag === tag);

    if (!found || isEgg(found)) {
      setMessage("No puedes elegir un huevo\n\nElige un Pokémon para pelear:");
      return;
    }

    if ((found as Pokemon).currentHp <= 0) {
      setMessage(
        "Este Pokémon está debilitado\n\nElige un Pokémon para pelear:",
      );
      return;
    }

    const chosen = await prologService.choosePokemon(tag);
    if (chosen) {
      const active = await prologService.getActivePokemon();
      setActivePokemon(active);
      setPokemonViewOpen(false);

      // animar entrada del pokemon del jugador
      Animated.timing(playerX, {
        toValue: 0,
        duration: 500,
        useNativeDriver: true,
      }).start(() => {
        // si es trainer, reemplazar sprite del trainer por el pokemon enemigo
        if (eventType === "trainer") {
          setTrainerVisible(false);
          setEnemyPokemonVisible(true);
          Animated.parallel([
            Animated.timing(enemyPokemonX, {
              toValue: 0,
              duration: 500,
              useNativeDriver: true,
            }),
          ]).start();
        }
      });

      goBattle();
    }
  }

  function goBattle() {
    setMessage("Elige una acción:");
    setButtons(getBattleButtons());
  }

  function getBattleButtons(): ActionButton[] {
    return [
      {
        label: "Pelear",
        onPress: () => {
          handleMoves();
        },
      },
      {
        label: "Mochila",
        onPress: () => {
          handleMochila();
        },
      },
      { label: "", onPress: () => {} },
      { label: "", onPress: () => {} },
    ];
  }

  async function handleMoves(startIndex = 0) {
    setMessage("Selecciona un movimiento:");
    const active = await prologService.getActivePokemon();
    const moves = active.moves;
    const nextIndex = startIndex === 0 ? 2 : 0;

    setButtons([
      {
        label: moves[startIndex] ?? "",
        onPress: () => {
          setMessage(active.pokemon + " ha usado " + moves[startIndex]);
          anim.start();
          setTimeout(() => {
            anim.stop();
            handlePlayerMove(moves[startIndex]);
          }, 1500);
        },
      },
      {
        label: moves[startIndex + 1] ?? "",
        onPress: () => {
          setMessage(active.pokemon + " ha usado " + moves[startIndex + 1]);
          anim.start();
          setTimeout(() => {
            anim.stop();
            handlePlayerMove(moves[startIndex + 1]);
          }, 1500);
        },
      },
      { label: "← Volver", onPress: () => goBattle() },
      {
        label: moves.length > 2 ? "Ver más →" : "",
        onPress: () => {
          if (moves.length > 2) handleMoves(nextIndex);
        },
      },
    ]);
  }

  async function handlePlayerMove(move: string) {
    const enemyHit = await prologService.hitEnemyWithMove(move);
    console.log(enemyHit);
    if (!enemyHit) return;

    await refreshStats();

    const battleEnd = await prologService.checkIfWinner(round);
    console.log(battleEnd);

    setRound((prev) => prev + 1);

    if (battleEnd) {
      await handleRoundEnd();
      return;
    }

    handleEnemyMove();
  }

  async function handleEnemyMove() {
    setMessage("Turno del contrincante");
    setButtons([
      { label: "", onPress: () => {} },
      {
        label: "Siguiente →",
        onPress: async () => {
          const playerHit = await prologService.hitPlayerWithMove();
          if (!playerHit) return;
          const enemyPokemon = await prologService.getEnemyPokemon();
          setMessage(enemyPokemon.pokemon + " ha usado " + playerHit);
          anim.start();

          setTimeout(async () => {
            anim.stop();
            await refreshStats();

            const battleEnd = await prologService.checkIfWinner(round);

            if (battleEnd) {
              await handleRoundEnd();
              return;
            }

            if (round >= 8) {
              await handleRoundEnd();
            } else {
              setRound((prev) => prev + 1);
              goBattle();
            }
          }, 1500);
        },
      },
      { label: "", onPress: () => {} },
      { label: "", onPress: () => {} },
    ]);
  }

  async function handleRoundEnd() {
    const winner = await prologService.getWinner();
    await refreshStats();

    if (isGym) {
      if (winner === "player") {
        if (fight >= maxFights) {
          await handleGymWin();
        } else {
          setFight((prev) => prev + 1);
          setRound(1);

          const newEnemy = await prologService.getEnemyPokemon();
          setEnemy((prev) => (prev ? [newEnemy, prev[1]] : prev));

          Animated.sequence([
            Animated.timing(enemyPokemonX, {
              toValue: VIEW_W,
              duration: 400,
              useNativeDriver: true,
            }),
            Animated.timing(enemyPokemonX, {
              toValue: 0,
              duration: 400,
              useNativeDriver: true,
            }),
          ]).start();

          setMessage(
            `¡Ganaste esta pelea!\n\nCombate ${fight} de ${maxFights}`,
          );
          setButtons([
            { label: "", onPress: () => {} },
            {
              label: "Siguiente →",
              onPress: () => {
                setMessage("¿Quieres cambiar de Pokémon?");
                setButtons([
                  {
                    label: "SI",
                    onPress: () => {
                      setPokemonViewOpen(true);
                      setMessage("Elige un Pokémon:");
                      setButtons([
                        { label: "", onPress: () => {} },
                        {
                          label: "Aceptar →",
                          onPress: () =>
                            handleChoosePokemonGym(selectedTagRef.current),
                        },
                        { label: "", onPress: () => {} },
                        { label: "", onPress: () => {} },
                      ]);
                    },
                  },
                  {
                    label: "NO",
                    onPress: () => {
                      setRound(1);
                      goBattle();
                    },
                  },
                  { label: "", onPress: () => {} },
                  { label: "", onPress: () => {} },
                ]);
              },
            },
            { label: "", onPress: () => {} },
            { label: "", onPress: () => {} },
          ]);
        }
      } else if (winner === "enemy") {
        const team = await prologService.getTeamPokemons();

        const isTeamDead = await prologService.checkIfTeamNuked();

        if (isTeamDead) {
          setMessage("¡Tu equipo ha sido derrotado!");
          const battleEnded = await prologService.endBattle();
          console.log("endBattle: ", battleEnded);
          setButtons([
            { label: "", onPress: () => {} },
            { label: "Volver →", onPress: () => router.push("/map" as any) },
            { label: "", onPress: () => {} },
            { label: "", onPress: () => {} },
          ]);
        } else {
          setPokemons(team);
          setMessage("¡Tu Pokémon ha sido derrotado!\n\nElige otro Pokémon:");
          setPokemonViewOpen(true);
          setRound(1);
          setButtons([
            { label: "", onPress: () => {} },
            {
              label: "Aceptar →",
              onPress: () => handleChoosePokemonGym(selectedTagRef.current),
            },
            { label: "", onPress: () => {} },
            { label: "", onPress: () => {} },
          ]);
        }
      } else {
        setRound(1);
        setMessage("¡Empate!\n\n¿Quieres cambiar de Pokémon?");
        setButtons([
          {
            label: "SI",
            onPress: () => {
              setPokemonViewOpen(true);
              setMessage("Elige un Pokémon:");
              setButtons([
                { label: "", onPress: () => {} },
                {
                  label: "Aceptar →",
                  onPress: () => handleChoosePokemonGym(selectedTagRef.current),
                },
                { label: "", onPress: () => {} },
                { label: "", onPress: () => {} },
              ]);
            },
          },
          {
            label: "NO",
            onPress: () => goBattle(),
          },
          { label: "", onPress: () => {} },
          { label: "", onPress: () => {} },
        ]);
      }
    } else {
      const exp = await prologService.getGainedExp();
      const money = await prologService.getGainedMoney();
      const battleEnded = await prologService.endBattle();
      console.log("endBattle: ", battleEnded);

      const resultMsg =
        winner === "player"
          ? `¡Ganaste!\n\nExp: +${exp}${money ? `\nDinero: +$${money}` : ""}`
          : winner === "enemy"
            ? `¡Perdiste!\n\n${money ? `Dinero perdido: $${-money}` : ""}`
            : `¡Empate!\n\nExp: +${exp}`;

      setMessage(resultMsg);
      setButtons([
        { label: "", onPress: () => {} },
        { label: "Siguiente →", onPress: () => router.push("/map" as any) },
        { label: "", onPress: () => {} },
        { label: "", onPress: () => {} },
      ]);
    }
  }

  async function handleGymWin() {
    const expTeam = await prologService.getGymGainedExp();
    const badge = await prologService.getGainedBadge(enemy![1].toLowerCase());
    setBadgeWon(badge);
    const battleEnded = await prologService.endBattle();
    console.log("endBattle: ", battleEnded);

    const team = await prologService.getTeamPokemons();

    // construir lista de entradas con nombre en vez de tag
    const expEntries = expTeam.map((e) => {
      const found = team.find((p) => p.tag === e.tag);
      const name = found ? found.pokemon : `Tag ${e.tag}`;
      return { name, exp: e.exp };
    });

    setMessage("¡Has ganado el gimnasio!");

    function showExpEntry(index: number) {
      const entry = expEntries[index];
      setMessage(`${entry.name}\n\n+${entry.exp} EXP`);

      const isLast = index === expEntries.length - 1;
      setButtons([
        { label: "", onPress: () => {} },
        {
          label: "Siguiente →",
          onPress: () => {
            if (isLast) {
              router.push("/map" as any);
            } else {
              showExpEntry(index + 1);
            }
          },
        },
        { label: "", onPress: () => {} },
        { label: "", onPress: () => {} },
      ]);
    }

    showExpEntry(0);
  }

  async function handleChoosePokemonGym(tag: number) {
    const team = await prologService.getTeamPokemons();

    if (tag === 0) {
      setMessage("Elige un Pokémon para pelear:");
      return;
    }

    const found = team.find((p) => p.tag === tag);

    if (!found || isEgg(found)) {
      setMessage("No puedes elegir un huevo\n\nElige un Pokémon para pelear:");
      return;
    }

    if ((found as Pokemon).currentHp <= 0) {
      setMessage(
        "Este Pokémon está debilitado\n\nElige un Pokémon para pelear:",
      );
      return;
    }

    const chosen = await prologService.choosePokemon(tag);
    if (chosen) {
      const active = await prologService.getActivePokemon();
      setActivePokemon(active);
      setPokemonViewOpen(false);

      Animated.sequence([
        Animated.timing(playerX, {
          toValue: -VIEW_W,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(playerX, {
          toValue: 0,
          duration: 400,
          useNativeDriver: true,
        }),
      ]).start();

      setRound(1);
      goBattle();
    }
  }

  async function handleMochila() {
    const backpack = await prologService.getBackpackContent();

    setMessage("Selecciona un objeto para usar:");

    const newButtons: ActionButton[] = [
      {
        label: "Pokebolas",
        onPress: () => {
          setMessage("Pokebolas guardadas:");
          setButtons([
            {
              iconLabel: (
                <Image
                  source={pokeballSprites["normal"]}
                  style={scaleImage(24, 24)}
                />
              ),
              label:
                " x " + backpack.pokeballs.filter((p) => p === "normal").length,
              onPress: () => {
                if (
                  backpack.pokeballs.filter((p) => p === "normal").length === 0
                )
                  return;

                setMessage("¿Utilizar Pokebola?");
                setButtons([
                  {
                    label: "SI",
                    onPress: async () => {
                      if (eventType === "trainer") {
                        setMessage(
                          "No puedes intentar atrapar el Pokémon\n\nde otro entrenador",
                        );
                        setButtons([
                          { label: "", onPress: () => {} },
                          {
                            label: "Siguiente →",
                            onPress: () => handleMochila(),
                          },
                          { label: "", onPress: () => {} },
                          { label: "", onPress: () => {} },
                        ]);
                      } else {
                        console.log("pendiente");
                      }
                    },
                  },
                  {
                    label: "NO",
                    onPress: () => {
                      handleMochila();
                    },
                  },
                  { label: "", onPress: () => {} },
                  { label: "", onPress: () => {} },
                ]);
              },
            },
            {
              iconLabel: (
                <Image
                  source={pokeballSprites["superball"]}
                  style={scaleImage(22, 22)}
                />
              ),
              label:
                " x " +
                backpack.pokeballs.filter((p) => p === "superball").length,
              onPress: () => {
                if (
                  backpack.pokeballs.filter((p) => p === "superball").length ===
                  0
                )
                  return;

                setMessage("¿Utilizar Superbola?");
                setButtons([
                  {
                    label: "SI",
                    onPress: async () => {
                      if (eventType === "trainer") {
                        setMessage(
                          "No puedes intentar atrapar el Pokémon\n\nde otro entrenador",
                        );
                        setButtons([
                          { label: "", onPress: () => {} },
                          {
                            label: "Siguiente →",
                            onPress: () => handleMochila(),
                          },
                          { label: "", onPress: () => {} },
                          { label: "", onPress: () => {} },
                        ]);
                      } else {
                        console.log("pendiente");
                      }
                    },
                  },
                  {
                    label: "NO",
                    onPress: () => {
                      handleMochila();
                    },
                  },
                  { label: "", onPress: () => {} },
                  { label: "", onPress: () => {} },
                ]);
              },
            },
            {
              label: "← Volver",
              onPress: () => handleMochila(),
            },
            { label: "", onPress: () => {} },
          ]);
        },
      },
      {
        label: "",
        onPress: () => {},
      },
      {
        label: "← Volver",
        onPress: () => goBattle(),
      },
      {
        label: "",
        onPress: () => {},
      },
    ];

    setButtons(newButtons);
  }

  function StatsBars({
    pokemon,
    enemy,
  }: {
    pokemon: Pokemon;
    enemy?: boolean;
  }) {
    return (
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
        {!enemy && (
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
        )}
      </View>
    );
  }

  return (
    <GameLayout message={message} buttons={buttons}>
      <View style={styles.scene}>
        {/* enemy — esquina superior derecha */}
        {enemy && (
          <Animated.View
            style={[
              styles.enemyContainer,
              {
                right: ENEMY_RIGHT,
                top: ENEMY_TOP,
                transform: [{ translateX: enemyX }],
              },
            ]}
          >
            {/* trainer */}
            {enemy[1] !== "" && trainerVisible && (
              <Animated.Image
                source={require("../assets/trainer.png")}
                style={[scaleImage(SPRITE_SIZE, SPRITE_SIZE)]}
                resizeMode="contain"
              />
            )}

            {enemy[0] && (enemy[1] === "" || !trainerVisible) && (
              <StatsBars
                pokemon={enemy[0] as unknown as Pokemon}
                enemy={true}
              />
            )}
            {enemy[1] === "" ? (
              <Animated.Image
                source={pokemonSprites[enemy[0].pokemon]}
                style={[
                  scaleImage(SPRITE_SIZE / 1.5, SPRITE_SIZE / 1.5),
                  { opacity: blink },
                ]}
                resizeMode="contain"
              />
            ) : (
              enemyPokemonVisible && (
                <Animated.Image
                  source={pokemonSprites[enemy[0].pokemon]}
                  style={[
                    scaleImage(SPRITE_SIZE / 1.5, SPRITE_SIZE / 1.5),
                    {
                      transform: [{ translateX: enemyPokemonX }],
                      opacity: blink,
                    },
                  ]}
                  resizeMode="contain"
                />
              )
            )}
          </Animated.View>
        )}

        {/* player pokemon — esquina inferior izquierda */}
        {activePokemon && (
          <Animated.View
            style={[
              styles.playerContainer,
              {
                left: PLAYER_LEFT,
                bottom: PLAYER_BOTTOM,
                transform: [{ translateX: playerX }],
              },
            ]}
          >
            <Animated.Image
              source={pokemonSprites[activePokemon.pokemon]}
              style={[
                scaleImage(SPRITE_SIZE / 1.5, SPRITE_SIZE / 1.5),
                { opacity: blink },
              ]}
              resizeMode="contain"
            />
            <StatsBars pokemon={activePokemon} enemy={false} />
          </Animated.View>
        )}

        {pokemonViewOpen && (
          <PokemonTeam
            pokemons={pokemons}
            onSelect={(tag) => {
              selectedTagRef.current = tag; // ← siempre actualizado
            }}
          />
        )}
      </View>

      {badgeWon !== "" && <BadgeWonView badge={badgeWon} />}
    </GameLayout>
  );
}

const styles = StyleSheet.create({
  scene: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    overflow: "hidden",
    width: VIEW_W,
    backgroundColor: "#fff",
  },
  enemyContainer: {
    position: "absolute",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  playerContainer: {
    position: "absolute",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  infoContainer: {
    width: STATS_W,
    flexDirection: "column",
    justifyContent: "center",
  },
  info: {
    fontFamily: "GameFont",
    fontSize: VIEW_W / 30,
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
    maxWidth: STATS_W / 2,
  },
  barFill: {
    height: "100%",
    borderRadius: 3,
  },
  barLabel: {
    fontFamily: "GameFont",
    fontSize: VIEW_W / 40,
    width: 30,
    color: "#1a1a1a",
    textAlign: "center",
  },
});
