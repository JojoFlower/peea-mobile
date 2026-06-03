import { View, Text } from "react-native";
import { colors } from "@/lib/theme";
import { Icon } from "./Icon";
import { Avatar } from "./ui";
import { FeedPost } from "@/services/api";

export function FeedCard({ item }: { item: FeedPost }) {
  return (
    <View className="bg-card border border-border-soft rounded-[18px] overflow-hidden">
      {/* header */}
      <View className="flex-row gap-2.5 items-center px-4 pt-3.5 pb-2.5">
        <Avatar initials={item.initials} bg={item.avatar_bg} size={40} radius={13} textColor="#fff" />
        <View className="flex-1 min-w-0">
          <View className="flex-row items-center gap-1.5">
            <Text className="text-sm font-poppins-semibold text-fg">{item.author}</Text>
            <Icon name="badge" size={13} color={colors.primary} />
          </View>
          <Text className="text-[11px] text-fg-soft">
            {item.handle} · {item.time}
          </Text>
        </View>
      </View>

      {/* tag */}
      <View className="px-4 pb-2">
        <View className="self-start py-[3px] px-2.5 rounded-full" style={{ backgroundColor: `${item.tag_color}1a` }}>
          <Text className="text-[10px] font-poppins-semibold uppercase tracking-wide" style={{ color: item.tag_color }}>
            {item.tag}
          </Text>
        </View>
      </View>

      {/* body */}
      <View className="px-4 pb-3">
        <Text className="text-base font-poppins-bold mb-1.5 leading-[21px] text-fg">{item.title}</Text>
        <Text className="text-sm text-fg-muted leading-[21px]">{item.body}</Text>
      </View>

      {/* event block */}
      {item.event_date ? (
        <View className="px-4 pb-3.5">
          <View className="flex-row gap-3.5 items-center p-3.5 rounded-[14px] bg-fg">
            <View
              className="w-[54px] h-[62px] rounded-xl items-center justify-center"
              style={{ backgroundColor: "rgba(251,191,36,0.2)", borderWidth: 1, borderColor: "rgba(251,191,36,0.4)" }}
            >
              <Text className="text-[10px] font-poppins-semibold uppercase text-white opacity-85">{item.event_month}</Text>
              <Text className="text-2xl font-poppins-bold text-white">{item.event_date}</Text>
            </View>
            <View className="flex-1">
              <View className="flex-row items-center gap-1.5 mb-2">
                <Icon name="map-pin" size={12} color="#fff" />
                <Text className="text-xs text-white opacity-90">
                  {item.event_place} · {item.event_time}
                </Text>
              </View>
              <View className="self-start bg-primary py-2 px-3.5 rounded-[10px]">
                <Text className="text-fg font-poppins-semibold text-xs">Voir le programme →</Text>
              </View>
            </View>
          </View>
        </View>
      ) : null}
    </View>
  );
}
