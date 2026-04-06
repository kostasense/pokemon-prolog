/**
 * GameLayout
 * Layout global que engloba todas las escenas del juego.
 * Siempre muestra:
 *   - Zona de contenido (escena actual via children / router)
 *   - Cuadro de mensaje con message.png como fondo
 *   - 4 botones de acción con boton.png como fondo
 *
 * Uso en _layout.tsx:
 *   <GameLayout message={...} buttons={[...]}>
 *     <Stack />
 *   </GameLayout>
 */

import React from "react";
import {
    Dimensions,
    ImageBackground,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";

const { width: SCREEN_W } = Dimensions.get("window");

export type ActionButton = {
  label: string;
  onPress: () => void;
  disabled?: boolean;
};

type GameLayoutProps = {
  message: string;
  buttons: [ActionButton, ActionButton, ActionButton, ActionButton];
  children: React.ReactNode;
};

export default function GameLayout({
  message,
  buttons,
  children,
}: GameLayoutProps) {
  return (
    <View style={styles.root}>
      {/* ── Escena principal (cambia con el router) ── */}
      <View style={styles.scene}>{children}</View>

      {/* ── Cuadro de mensajes ── */}
      <ImageBackground
        source={require("../assets/message.png")}
        style={styles.messageBg}
        resizeMode="stretch"
      >
        <Text style={styles.messageText}>{message}</Text>
      </ImageBackground>

      {/* ── Botonera 2×2 ── */}
      <View style={styles.buttonGrid}>
        {buttons.map((btn, i) => (
          <TouchableOpacity
            key={i}
            onPress={btn.onPress}
            disabled={btn.disabled}
            activeOpacity={0.75}
            style={styles.buttonWrapper}
          >
            <ImageBackground
              source={require("../assets/boton.png")}
              style={styles.buttonBg}
              resizeMode="stretch"
            >
              <Text style={styles.buttonText}>{btn.label}</Text>
            </ImageBackground>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}

const MSG_HEIGHT = 90;
const BTN_HEIGHT = 110;

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: "#000",
  },

  scene: {
    flex: 1,
  },

  messageBg: {
    width: SCREEN_W,
    height: MSG_HEIGHT,
    justifyContent: "center",
  },
  messageText: {
    fontFamily: "GameFont",
    fontSize: 20,
    color: "#1a1a1a",
    textAlign: "center",
    lineHeight: 18,
  },

  buttonGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    width: SCREEN_W,
    height: BTN_HEIGHT,
  },
  buttonWrapper: {
    width: "50%",
    height: BTN_HEIGHT / 2,
  },
  buttonBg: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    height: BTN_HEIGHT / 2,
    width: SCREEN_W / 2,
  },
  buttonText: {
    fontFamily: "GameFont",
    fontSize: 20,
    color: "#1a1a1a",
    textAlign: "center",
  },
});
