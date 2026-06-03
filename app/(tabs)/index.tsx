import { useEffect, useState, useCallback } from "react";
import { View, Text, Image, ScrollView, ActivityIndicator, RefreshControl } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { colors } from "@/lib/theme";
import { Icon } from "@/components/Icon";
import { FeedCard } from "@/components/FeedCard";
import { API, FeedPost } from "@/services/api";
import { EDITION } from "@/lib/formOptions";

export default function ActusScreen() {
  const [posts, setPosts] = useState<FeedPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      setError(null);
      const data = await API.listFeed();
      setPosts(data);
    } catch (e: any) {
      setError(e?.message ?? "Impossible de charger les actualités.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const onRefresh = () => {
    setRefreshing(true);
    load();
  };

  return (
    <SafeAreaView className="flex-1 bg-bg" edges={["top"]}>
      {/* header */}
      <View className="px-[22px] pt-2 pb-3.5 flex-row justify-between items-center">
        <View className="flex-row items-center gap-2.5">
          <Image source={require("@/assets/images/logo.png")} style={{ width: 34, height: 34 }} resizeMode="contain" />
          <Text className="text-2xl font-poppins-bold tracking-tight text-fg">Actualités</Text>
        </View>
        <View className="w-10 h-10 rounded-[14px] border border-border bg-card items-center justify-center">
          <Icon name="bell" size={20} color={colors.fg} />
        </View>
      </View>

      {loading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator color={colors.primaryDark} />
        </View>
      ) : (
        <ScrollView
          contentContainerClassName="pb-6"
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primaryDark} />}
        >
          <View className="px-[22px] pb-3 flex-row items-center gap-2">
            <View className="w-2 h-2 rounded-full" style={{ backgroundColor: colors.danger }} />
            <Text className="text-xs font-poppins-semibold text-fg-muted">Fil en temps réel · Édition {EDITION}</Text>
          </View>

          {error ? <Text className="text-center text-fg-muted text-sm p-6">{error}</Text> : null}

          <View className="gap-3 px-4">
            {posts.map((item) => (
              <FeedCard key={item.id} item={item} />
            ))}
          </View>

          {!error && posts.length === 0 ? (
            <Text className="text-center text-fg-soft text-sm p-10">Aucune actualité pour le moment.</Text>
          ) : null}
        </ScrollView>
      )}
    </SafeAreaView>
  );
}
