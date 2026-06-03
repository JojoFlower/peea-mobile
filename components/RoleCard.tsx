import { ReactNode } from "react";
import { View, Text, Pressable } from "react-native";
import { colors } from "@/lib/theme";
import { Icon } from "./Icon";

export function RoleCard({
  active,
  onPress,
  icon,
  title,
  subtitle,
}: {
  active: boolean;
  onPress: () => void;
  icon: ReactNode;
  title: string;
  subtitle: string;
}) {
  return (
    <Pressable
      onPress={onPress}
      className={`p-[18px] rounded-[18px] flex-row gap-3.5 items-start ${
        active ? "border-2 border-primary bg-primary-soft" : "border-[1.5px] border-border bg-card"
      }`}
    >
      <View
        className={`w-[46px] h-[46px] rounded-[14px] items-center justify-center ${active ? "bg-primary" : "bg-bg"}`}
      >
        {icon}
      </View>
      <View className="flex-1">
        <Text className="text-base font-poppins-bold mb-1 text-fg">{title}</Text>
        <Text className="text-[13px] text-fg-muted leading-[19px]">{subtitle}</Text>
      </View>
      {active ? <Icon name="check" size={20} color={colors.primaryDark} /> : null}
    </Pressable>
  );
}
