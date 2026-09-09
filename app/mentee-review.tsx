import { useCallback, useEffect, useState } from "react";
import { View, Text, ScrollView, Pressable, ActivityIndicator, TextInput } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter, useLocalSearchParams } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { colors } from "@/lib/theme";
import { BackHeader } from "@/components/headers";
import { API, LmsMenteeAnswer, LmsReviewStatus } from "@/services/api";

export default function MenteeReviewScreen() {
  const router = useRouter();
  const { menteeId, name } = useLocalSearchParams<{ menteeId: string; name?: string }>();

  const [answers, setAnswers] = useState<LmsMenteeAnswer[]>([]);
  const [drafts, setDrafts] = useState<Record<string, string>>({});
  const [savingId, setSavingId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!menteeId) return;
    setLoading(true);
    setError(null);
    try {
      const data = await API.lmsMenteeAnswers(menteeId);
      setAnswers(data.answers);
      setDrafts(Object.fromEntries(data.answers.map((a) => [a.id, a.mentor_comment ?? ""])));
    } catch (e: any) {
      setError(e?.message ?? "Impossible de charger les réponses.");
    } finally {
      setLoading(false);
    }
  }, [menteeId]);

  useEffect(() => {
    load();
  }, [load]);

  const review = async (answer: LmsMenteeAnswer, status: LmsReviewStatus) => {
    setSavingId(answer.id);
    setError(null);
    try {
      const comment = drafts[answer.id] ?? "";
      await API.lmsReviewAnswer(answer.id, status, comment);
      setAnswers((prev) =>
        prev.map((a) =>
          a.id === answer.id
            ? { ...a, review_status: status, mentor_comment: comment || null, reviewed_at: new Date().toISOString() }
            : a,
        ),
      );
    } catch (e: any) {
      setError(e?.message ?? "Échec de l'enregistrement.");
    } finally {
      setSavingId(null);
    }
  };

  const pendingCount = answers.filter((a) => a.review_status === "pending").length;

  return (
    <SafeAreaView className="flex-1 bg-bg" edges={["top"]}>
      <BackHeader onBack={() => router.back()} title={name ?? "Relecture"} />

      {loading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator color={colors.accent} />
        </View>
      ) : error && answers.length === 0 ? (
        <View className="flex-1 items-center justify-center px-8">
          <Text className="text-fg-muted text-sm text-center mb-4">{error}</Text>
          <Pressable onPress={load} className="py-2.5 px-5 rounded-xl bg-primary">
            <Text className="font-poppins-semibold text-fg text-sm">Réessayer</Text>
          </Pressable>
        </View>
      ) : (
        <ScrollView contentContainerStyle={{ paddingHorizontal: 22, paddingBottom: 40, paddingTop: 4 }}>
          <Text className="text-[13px] text-fg-muted mb-4">
            {answers.length === 0
              ? "Aucune réponse libre à relire."
              : `${pendingCount} en attente sur ${answers.length} réponse${answers.length > 1 ? "s" : ""}`}
          </Text>

          {error && answers.length > 0 && <Text className="text-danger text-sm mb-3">{error}</Text>}

          {answers.map((a) => (
            <View key={a.id} className="bg-card border border-border-soft rounded-2xl p-4 mb-3.5">
              <Text className="text-[11px] uppercase tracking-wider font-poppins-semibold text-fg-soft">
                {a.lesson_title}
              </Text>
              <Text className="font-poppins-medium text-fg mt-1">{a.question_text}</Text>

              <View className="mt-2.5 rounded-xl bg-bg-soft border border-border-soft p-3">
                <Text className="text-sm text-fg">{a.open_answer}</Text>
              </View>

              <StatusChip status={a.review_status} />

              <Text className="text-[12px] text-fg-soft mt-3 mb-1 font-poppins-medium">Commentaire</Text>
              <TextInput
                value={drafts[a.id] ?? ""}
                onChangeText={(t) => setDrafts((prev) => ({ ...prev, [a.id]: t }))}
                multiline
                placeholder="Ton retour au mentoré…"
                placeholderTextColor={colors.fgSoft}
                className="min-h-[70px] rounded-xl border border-border bg-bg-soft p-3 text-fg"
                style={{ textAlignVertical: "top", fontFamily: "Poppins_400Regular" }}
              />

              <View className="flex-row gap-2 mt-3">
                <Pressable
                  onPress={() => review(a, "needs_revision")}
                  disabled={savingId === a.id}
                  className="flex-1 h-11 rounded-xl items-center justify-center border-[1.5px] active:opacity-70"
                  style={{ borderColor: colors.danger }}
                >
                  <Text className="font-poppins-semibold text-sm" style={{ color: colors.danger }}>
                    À revoir
                  </Text>
                </Pressable>
                <Pressable
                  onPress={() => review(a, "approved")}
                  disabled={savingId === a.id}
                  className="flex-1 h-11 rounded-xl items-center justify-center active:opacity-80"
                  style={{ backgroundColor: colors.primary }}
                >
                  {savingId === a.id ? (
                    <ActivityIndicator color={colors.fg} />
                  ) : (
                    <Text className="font-poppins-semibold text-sm text-fg">Valider</Text>
                  )}
                </Pressable>
              </View>
            </View>
          ))}
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

function StatusChip({ status }: { status: LmsReviewStatus }) {
  const map = {
    pending: { label: "En attente", color: colors.fgMuted, bg: colors.border, icon: "time-outline" as const },
    approved: { label: "Validé", color: "#166534", bg: "#DCFCE7", icon: "checkmark-circle" as const },
    needs_revision: { label: "À revoir", color: colors.danger, bg: colors.dangerSoft, icon: "alert-circle" as const },
  };
  const s = map[status];
  return (
    <View className="flex-row items-center gap-1.5 self-start mt-2.5 rounded-full px-2.5 py-1" style={{ backgroundColor: s.bg }}>
      <Ionicons name={s.icon} size={13} color={s.color} />
      <Text className="text-[12px] font-poppins-semibold" style={{ color: s.color }}>
        {s.label}
      </Text>
    </View>
  );
}
