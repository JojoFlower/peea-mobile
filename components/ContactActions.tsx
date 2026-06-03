import { View, Text, Pressable, Linking } from "react-native";
import { colors } from "@/lib/theme";
import { Icon, IconName } from "./Icon";
import { PersonContact } from "@/services/api";

function ContactRow({
  icon,
  label,
  value,
  onPress,
}: {
  icon: IconName;
  label: string;
  value: string;
  onPress?: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      disabled={!onPress}
      className="flex-row items-center gap-3 py-3 px-3.5 rounded-[14px] bg-bg-soft border border-border-soft active:border-primary"
    >
      <View className="w-[38px] h-[38px] rounded-[11px] bg-primary-soft items-center justify-center">
        <Icon name={icon} size={17} color={colors.accent} />
      </View>
      <View className="flex-1 min-w-0">
        <Text className="text-[11px] text-fg-soft">{label}</Text>
        <Text numberOfLines={1} className="text-sm font-poppins-medium text-fg">
          {value}
        </Text>
      </View>
      {onPress ? <Icon name="chevron-right" size={17} color={colors.fgSoft} /> : null}
    </Pressable>
  );
}

export function ContactActions({ p }: { p: PersonContact }) {
  return (
    <View className="gap-2">
      {p.email ? (
        <ContactRow icon="mail" label="Email" value={p.email} onPress={() => Linking.openURL(`mailto:${p.email}`)} />
      ) : null}
      {p.phone ? (
        <ContactRow
          icon="phone"
          label="Téléphone"
          value={p.phone}
          onPress={() => Linking.openURL(`tel:${p.phone!.replace(/\s/g, "")}`)}
        />
      ) : null}
      {p.city ? <ContactRow icon="map-pin" label="Ville" value={p.city} /> : null}
    </View>
  );
}
