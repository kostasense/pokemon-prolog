import { scaleImage } from "@/utils/helpers";
import { medalSprites } from "@/utils/sprites";
import { Dimensions, Image, StyleSheet, View } from "react-native";

const { width: SCREEN_W } = Dimensions.get("window");
const { height: SCREEN_H } = Dimensions.get("window");
const MAP_W = 600;
const MAP_H = 400;

const CARD_W = (Math.min(SCREEN_W, MAP_W) / 2) * 0.85;
const CARD_H = (Math.min(SCREEN_H, MAP_H) / 3) * 0.85;

export default function BadgeWonView({ badge }: { badge: string }) {
  return (
    <View style={styles.badgeOverlay}>
      <Image
        source={require("../assets/message.png")}
        style={[scaleImage(CARD_W, CARD_H), styles.spriteBox]}
        resizeMode="stretch"
      />

      <Image
        source={medalSprites[badge]}
        style={[scaleImage(CARD_W * 0.7, CARD_H * 0.7)]}
        resizeMode="contain"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  badgeOverlay: {
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
