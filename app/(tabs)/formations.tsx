import { useCallback, useState } from "react";
import { View, Text, ScrollView, Pressable, ActivityIndicator, RefreshControl } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter, useFocusEffect } from "expo-router";
import { Ionicons, Feather } from "@expo/vector-icons";
import { useAuth } from "@/contexts/AuthContext";
import { colors } from "@/lib/theme";
import { AppHeader } from "@/components/headers";
import { Card } from "@/components/ui";
import { API, LmsQuestSummary, LmsLessonSummary } from "@/services/api";

export default function FormationsScreen() {
  const router = useRouter();
  const { me } = useAuth();
  const isMentor = me?.mentorship?.role === "mentor";

  const [quests, setQuests] = useState<LmsQuestSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [expanded, setExpanded] = useState<Set<string>>(new Set());

  const load = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);
    setError(null);
    try {
      const data = await API.lmsCatalog();
      setQuests(data.quests);
      // Ouvre la première quête par défaut pour éviter un écran « fermé ».
      setExpanded((prev) => (prev.size ? prev : new Set(data.quests.slice(0, 1).map((q) => q.id))));
    } catch (e: any) {
      setError(e?.message ?? "Impossible de charger les formations.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  // Recharge à chaque focus pour refléter la progression après une leçon.
  useFocusEffect(
    useCallback(() => {
      load();
    }, [load]),
  );

  const toggle = (id: string) =>
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  return (
    <SafeAreaView className="flex-1 bg-bg" edges={["top"]}>
      <AppHeader title="Formations" subtitle="Apprends à ton rythme" />

      <ScrollView
        contentContainerStyle={{ paddingHorizontal: 22, paddingBottom: 32 }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => load(true)} tintColor={colors.accent} />}
      >
        {isMentor && (
          <Card onPress={() => router.push("/mentees-lms")} className="mb-4 flex-row items-center gap-3">
            <View className="w-11 h-11 rounded-xl items-center justify-center" style={{ backgroundColor: colors.primarySoft }}>
              <Ionicons name="people-outline" size={22} color={colors.accent} />
            </View>
            <View className="flex-1">
              <Text className="font-poppins-semibold text-[15px] text-fg">Suivi de mes mentorés</Text>
              <Text className="text-[13px] text-fg-muted">Progression et relecture des réponses</Text>
            </View>
            <Feather name="chevron-right" size={20} color={colors.fgSoft} />
          </Card>
        )}

        {loading ? (
          <View className="items-center py-20">
            <ActivityIndicator color={colors.accent} />
          </View>
        ) : error ? (
          <View className="items-center py-16 px-6">
            <Text className="text-fg-muted text-sm text-center mb-4">{error}</Text>
            <Pressable onPress={() => load()} className="py-2.5 px-5 rounded-xl bg-primary">
              <Text className="font-poppins-semibold text-fg text-sm">Réessayer</Text>
            </Pressable>
          </View>
        ) : quests.length === 0 ? (
          <View className="items-center py-20 px-8">
            <Ionicons name="book-outline" size={40} color={colors.fgSoft} />
            <Text className="text-fg-muted text-sm text-center mt-3">
              Aucune formation disponible pour le moment.
            </Text>
          </View>
        ) : (
          quests.map((quest) => (
            <QuestBlock
              key={quest.id}
              quest={quest}
              open={expanded.has(quest.id)}
              onToggle={() => toggle(quest.id)}
              onOpenLesson={(lessonId) => router.push({ pathname: "/lesson", params: { lessonId } })}
            />
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

function QuestBlock({
  quest,
  open,
  onToggle,
  onOpenLesson,
}: {
  quest: LmsQuestSummary;
  open: boolean;
  onToggle: () => void;
  onOpenLesson: (lessonId: string) => void;
}) {
  const totalLessons = quest.paths.reduce((n, p) => n + p.lessons.length, 0);
  const doneLessons = quest.paths.reduce(
    (n, p) => n + p.lessons.filter((l) => l.is_completed).length,
    0,
  );

  return (
    <Card className="mb-3.5">
      <Pressable onPress={onToggle} className="flex-row items-center gap-3">
        <View className="flex-1 min-w-0">
          <Text className="font-poppins-semibold text-base text-fg">{quest.title}</Text>
          {quest.description ? (
            <Text className="text-[13px] text-fg-muted mt-0.5" numberOfLines={open ? undefined : 2}>
              {quest.description}
            </Text>
          ) : null}
          <Text className="text-[11px] text-fg-soft mt-1.5 font-poppins-medium">
            {doneLessons}/{totalLessons} leçon{totalLessons > 1 ? "s" : ""} terminée{doneLessons > 1 ? "s" : ""}
          </Text>
        </View>
        <Feather name={open ? "chevron-up" : "chevron-down"} size={20} color={colors.fgSoft} />
      </Pressable>

      {open && (
        <View className="mt-3">
          {quest.paths.length === 0 ? (
            <Text className="text-[13px] text-fg-soft italic">Bientôt disponible.</Text>
          ) : (
            quest.paths.map((path) => (
              <View key={path.id} className="mt-3">
                <Text className="text-xs uppercase tracking-wider font-poppins-semibold text-fg-soft mb-2">
                  {path.title}
                </Text>
                <View className="gap-2">
                  {path.lessons.map((lesson) => (
                    <LessonRow key={lesson.id} lesson={lesson} onPress={() => onOpenLesson(lesson.id)} />
                  ))}
                  {path.lessons.length === 0 && (
                    <Text className="text-[13px] text-fg-soft italic">Aucune leçon.</Text>
                  )}
                </View>
              </View>
            ))
          )}
        </View>
      )}
    </Card>
  );
}

function LessonRow({ lesson, onPress }: { lesson: LmsLessonSummary; onPress: () => void }) {
  return (
    <Pressable
      onPress={onPress}
      className="flex-row items-center gap-3 py-2.5 px-3 rounded-xl border border-border-soft bg-bg-soft active:opacity-80"
    >
      <View
        className="w-7 h-7 rounded-full items-center justify-center"
        style={{ backgroundColor: lesson.is_completed ? colors.primarySoft : colors.border }}
      >
        <Ionicons
          name={lesson.is_completed ? "checkmark" : "book-outline"}
          size={16}
          color={lesson.is_completed ? colors.accent : colors.fgSoft}
        />
      </View>
      <View className="flex-1 min-w-0">
        <Text className="text-sm font-poppins-medium text-fg" numberOfLines={2}>
          {lesson.title}
        </Text>
        <Text className="text-[11px] text-fg-soft mt-0.5">
          {lesson.question_count > 0 ? `${lesson.question_count} question${lesson.question_count > 1 ? "s" : ""}` : "Lecture"}
          {lesson.best_percentage != null ? ` · ${lesson.best_percentage}%` : ""}
        </Text>
      </View>
      <Feather name="chevron-right" size={18} color={colors.fgSoft} />
    </Pressable>
  );
}
