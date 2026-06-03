import { ReactNode, useEffect, useState } from "react";
import { View, Text, Pressable, Dimensions } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  runOnJS,
  interpolate,
  Extrapolation,
} from "react-native-reanimated";
import { colors } from "@/lib/theme";
import { Icon } from "./Icon";

const SCREEN_W = Dimensions.get("window").width;
const OFFSCREEN = SCREEN_W * 1.6;

export type SwipeDecision = "like" | "pass";

type Props<T> = {
  data: T[];
  keyOf: (item: T) => string;
  renderCard: (item: T) => ReactNode;
  onSwipe: (item: T, decision: SwipeDecision) => void;
  empty?: ReactNode;
};

// Generic card stack driven entirely by the Pass / Demander buttons (no swipe
// gesture). Renders the top card with the next one peeking behind for depth.
// The deck is a rotating queue: a "pass" sends the card to the back so we loop
// back to it once we reach the end, while a "like" removes it. The deck only
// empties once every card has been liked. Built on Reanimated for the button
// fling-off animation — no extra dependency.
export function SwipeDeck<T>({ data, keyOf, renderCard, onSwipe, empty }: Props<T>) {
  const [queue, setQueue] = useState<T[]>(data);
  const [tick, setTick] = useState(0); // forces a clean remount per card
  const translateX = useSharedValue(0);

  // Restart from a fresh deck whenever a new list is loaded.
  useEffect(() => {
    setQueue(data);
    setTick(0);
    translateX.value = 0;
  }, [data, translateX]);

  // Runs on the JS thread once a card has animated off screen.
  const advance = (decision: SwipeDecision) => {
    translateX.value = 0;
    const top = queue[0];
    if (top) onSwipe(top, decision);
    setQueue((q) => {
      const [first, ...rest] = q;
      if (first === undefined) return q;
      // Pass → loop the mentor back in; like → drop them (request sent).
      return decision === "pass" ? [...rest, first] : rest;
    });
    setTick((t) => t + 1);
  };

  const fling = (decision: SwipeDecision) => {
    const dir = decision === "like" ? 1 : -1;
    translateX.value = withTiming(dir * OFFSCREEN, { duration: 240 }, (done) => {
      if (done) runOnJS(advance)(decision);
    });
  };

  const topStyle = useAnimatedStyle(() => {
    const rotate = interpolate(
      translateX.value,
      [-SCREEN_W, 0, SCREEN_W],
      [-9, 0, 9],
      Extrapolation.CLAMP,
    );
    return {
      transform: [{ translateX: translateX.value }, { rotateZ: `${rotate}deg` }],
    };
  });

  if (queue.length === 0) {
    return <View className="flex-1">{empty}</View>;
  }

  const top = queue[0];
  const next = queue.length > 1 ? queue[1] : undefined;

  return (
    <View className="flex-1">
      <View className="flex-1">
        {/* peeking card behind */}
        {next ? (
          <View
            className="absolute inset-0 px-1.5"
            style={{ transform: [{ scale: 0.95 }], opacity: 0.55 }}
            pointerEvents="none"
          >
            {renderCard(next)}
          </View>
        ) : null}

        {/* top card — animated off screen by the buttons */}
        <Animated.View key={`${keyOf(top)}-${tick}`} className="absolute inset-0" style={topStyle}>
          {renderCard(top)}
        </Animated.View>
      </View>

      {/* action buttons */}
      <View className="flex-row justify-center items-start gap-12 pt-5 pb-1">
        <View className="items-center gap-1.5">
          <Pressable
            onPress={() => fling("pass")}
            className="w-16 h-16 rounded-full bg-card border border-border items-center justify-center active:scale-95"
          >
            <Icon name="x" size={26} color={colors.fgMuted} />
          </Pressable>
          <Text className="text-[11px] font-poppins-medium text-fg-soft">Passer</Text>
        </View>
        <View className="items-center gap-1.5">
          <Pressable
            onPress={() => fling("like")}
            className="w-16 h-16 rounded-full bg-primary items-center justify-center active:scale-95"
          >
            <Icon name="check" size={28} color={colors.fg} />
          </Pressable>
          <Text className="text-[11px] font-poppins-medium text-fg-muted">Demander</Text>
        </View>
      </View>
    </View>
  );
}
