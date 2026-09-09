import { useCallback, useState } from "react";
import { View, Text, ScrollView, Pressable, ActivityIndicator, RefreshControl } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter, useFocusEffect } from "expo-router";
import { Ionicons, Feather } from "@expo/vector-icons";
import { colors, initialsOf, avatarBg } from "@/lib/theme";
import { BackHeader } from "@/components/headers";
import { Card, Avatar } from "@/components/ui";
import { API, LmsMenteeSummary } from "@/services/api";

export default function MenteesLmsScreen() {
  const router = useRouter();
  const [mentees, setMentees] = useState<LmsMenteeSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);
    setError(null);
    try {
      const data = await API.lmsMentees();
      setMentees(data.mentees);
    } catch (e: any) {
      setError(e?.message ?? "Impossible de charger tes mentorés.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load]),
  );

  return (
    <SafeAreaView className="flex-1 bg-bg" edges={["top"]}>
      <BackHeader onBack={() => router.back()} title="Mes mentorés" />

      {loading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator color={colors.accent} />
        </View>
      ) : error ? (
        <View className="flex-1 items-center justify-center px-8">
          <Text className="text-fg-muted text-sm text-center mb-4">{error}</Text>
          <Pressable onPress={() => load()} className="py-2.5 px-5 rounded-xl bg-primary">
            <Text className="font-poppins-semibold text-fg text-sm">Réessayer</Text>
          </Pressable>
        </View>
      ) : (
        <ScrollView
          contentContainerStyle={{ paddingHorizontal: 22, paddingBottom: 32, paddingTop: 4 }}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => load(true)} tintColor={colors.accent} />}
        >
          {mentees.length === 0 ? (
            <View className="items-center py-24 px-8">
              <Ionicons name="people-outline" size={40} color={colors.fgSoft} />
              <Text className="text-fg-muted text-sm text-center mt-3">
                Aucun mentoré assigné pour le moment.
              </Text>
            </View>
          ) : (
            mentees.map((m) => {
              const parts = m.full_name.trim().split(/\s+/);
              const initials = initialsOf(parts[0], parts.length > 1 ? parts[parts.length - 1] : "");
              return (
              <Card
                key={m.inscription_id}
                onPress={() =>
                  router.push({
                    pathname: "/mentee-review",
                    params: { menteeId: m.inscription_id, name: m.full_name },
                  })
                }
                className="mb-3 flex-row items-center gap-3"
              >
                <Avatar initials={initials} bg={avatarBg(m.full_name)} />
                <View className="flex-1 min-w-0">
                  <Text className="font-poppins-semibold text-[15px] text-fg" numberOfLines={1}>
                    {m.full_name}
                  </Text>
                  <Text className="text-[13px] text-fg-muted mt-0.5">
                    {m.completed_lessons} leçon{m.completed_lessons > 1 ? "s" : ""} terminée{m.completed_lessons > 1 ? "s" : ""}
                  </Text>
                </View>
                {m.pending_reviews > 0 && (
                  <View className="rounded-full px-2.5 py-1" style={{ backgroundColor: colors.primarySoft }}>
                    <Text className="text-[12px] font-poppins-semibold" style={{ color: colors.accent }}>
                      {m.pending_reviews} à relire
                    </Text>
                  </View>
                )}
                <Feather name="chevron-right" size={20} color={colors.fgSoft} />
              </Card>
              );
            })
          )}
        </ScrollView>
      )}
    </SafeAreaView>
  );
}
