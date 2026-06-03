import { View, Text, Pressable } from "react-native";
import { colors, initialsOf } from "@/lib/theme";
import { Icon } from "./Icon";
import { FieldTag } from "./ui";
import { PersonContact } from "@/services/api";

export function PersonRow({ p, onPress }: { p: PersonContact; onPress?: () => void }) {
  const roleLine =
    p.role === "mentor"
      ? [p.mentor_job, p.mentor_company].filter(Boolean).join(" · ")
      : [p.mentee_level, p.mentee_institution_name].filter(Boolean).join(" · ");
  return (
    <Pressable
      onPress={onPress}
      className="flex-row gap-3.5 p-3.5 bg-card border border-border-soft rounded-[18px] active:border-primary"
    >
      <View className="w-14 h-14 rounded-[18px] bg-bg items-center justify-center">
        <Text className="font-poppins-semibold text-lg text-fg">{initialsOf(p.first_name, p.last_name)}</Text>
      </View>
      <View className="flex-1 min-w-0">
        <Text className="text-[15px] font-poppins-semibold text-fg">{p.full_name}</Text>
        <Text numberOfLines={1} className="text-xs text-fg-muted mt-0.5">
          {roleLine}
        </Text>
        <View className="flex-row gap-2 mt-2 items-center">
          {p.field ? <FieldTag field={p.field} small /> : null}
          <View className="ml-auto flex-row items-center gap-1">
            <Icon name="map-pin" size={11} color={colors.fgSoft} />
            <Text className="text-[11px] text-fg-soft">{p.city}</Text>
          </View>
        </View>
      </View>
    </Pressable>
  );
}
