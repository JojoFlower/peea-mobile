import { ReactNode } from "react";
import { View, Text, Pressable } from "react-native";
import { colors } from "@/lib/theme";
import { Icon } from "./Icon";

export function AppHeader({
  title,
  subtitle,
  right,
}: {
  title: string;
  subtitle?: string;
  right?: ReactNode;
}) {
  return (
    <View className="px-[22px] pt-2 pb-3.5 flex-row justify-between items-center">
      <View className="flex-1 min-w-0">
        {subtitle ? <Text className="text-[13px] text-fg-muted mb-0.5">{subtitle}</Text> : null}
        <Text className="text-2xl font-poppins-bold tracking-tight text-fg">{title}</Text>
      </View>
      {right}
    </View>
  );
}

export function BackHeader({
  onBack,
  title,
  right,
}: {
  onBack: () => void;
  title?: string;
  right?: ReactNode;
}) {
  return (
    <View className="h-[52px] flex-row items-center px-4 justify-between">
      <Pressable
        onPress={onBack}
        className="w-10 h-10 rounded-xl items-center justify-center"
        style={{ backgroundColor: "rgba(255,255,255,0.6)" }}
      >
        <Icon name="chevron-left" size={22} color={colors.fg} />
      </Pressable>
      {title ? <Text className="font-poppins-semibold text-base text-fg">{title}</Text> : null}
      <View className="w-10 items-end">{right}</View>
    </View>
  );
}
