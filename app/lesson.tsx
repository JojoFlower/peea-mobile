import { useCallback, useEffect, useMemo, useState } from "react";
import { View, Text, ScrollView, Pressable, ActivityIndicator, TextInput } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter, useLocalSearchParams } from "expo-router";
import { WebView } from "react-native-webview";
import { usePreventScreenCapture } from "expo-screen-capture";
import { Ionicons } from "@expo/vector-icons";
import { colors } from "@/lib/theme";
import { BackHeader } from "@/components/headers";
import { PrimaryButton } from "@/components/ui";
import {
  API,
  LmsLessonDetail,
  LmsQuestion,
  LmsSubmitAnswer,
  LmsSubmitResult,
} from "@/services/api";

type AnswerState = Record<
  string,
  { selected_option_id?: string | null; selected_option_ids?: string[]; open_answer?: string }
>;

// Wrap the lesson HTML so it renders richly BUT cannot be selected/copied, and
// the native long-press callout / context menu is suppressed.
function secureHtml(content: string): string {
  const body = content && content.trim() ? content : "<p><em>Leçon vide.</em></p>";
  return `<!doctype html><html><head>
<meta charset="utf-8"/>
<meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no"/>
<style>
  * { -webkit-user-select:none !important; -moz-user-select:none !important; -ms-user-select:none !important;
      user-select:none !important; -webkit-touch-callout:none !important; }
  html,body { margin:0; padding:0; background:${colors.bg}; }
  body { padding:4px 2px 24px; color:${colors.fg};
    font-family:-apple-system,"Poppins",Segoe UI,Roboto,Helvetica,Arial,sans-serif;
    font-size:16px; line-height:1.65; -webkit-tap-highlight-color:transparent; }
  h1,h2,h3,h4 { color:${colors.fg}; line-height:1.3; }
  h1{font-size:1.5rem;} h2{font-size:1.3rem;} h3{font-size:1.1rem;}
  p{margin:0 0 0.9em;} ul,ol{padding-left:1.25em; margin:0 0 0.9em;}
  a{color:${colors.primaryDark}; text-decoration:underline;}
  img{max-width:100%; height:auto; border-radius:10px; margin:0.4em 0;}
  iframe{max-width:100%; border:0; border-radius:10px; aspect-ratio:16/9; width:100%; height:auto;}
  blockquote{margin:0 0 0.9em; padding:0.4em 0 0.4em 0.9em; border-left:3px solid ${colors.border}; color:${colors.fgMuted};}
  pre{background:${colors.bgSoft}; padding:12px; border-radius:8px; overflow-x:auto;}
</style></head><body>
<div id="c">${body}</div>
<script>
  ['contextmenu','selectstart','copy','cut','dragstart'].forEach(function(ev){
    document.addEventListener(ev, function(e){ e.preventDefault(); return false; }, true);
  });
  function post(){ if(window.ReactNativeWebView){ window.ReactNativeWebView.postMessage(String(document.body.scrollHeight)); } }
  window.addEventListener('load', post);
  window.addEventListener('resize', post);
  setTimeout(post, 300); setTimeout(post, 1000);
</script>
</body></html>`;
}

function SecureReader({ content }: { content: string | null }) {
  const [height, setHeight] = useState(240);
  const html = useMemo(() => secureHtml(content ?? ""), [content]);

  return (
    <WebView
      originWhitelist={["*"]}
      source={{ html }}
      style={{ width: "100%", height, backgroundColor: "transparent" }}
      scrollEnabled={false}
      showsVerticalScrollIndicator={false}
      // iOS: empty selection menu removes Copy/Look Up on any accidental selection.
      menuItems={[]}
      // iOS: block the callout / selection entirely.
      allowsLinkPreview={false}
      onMessage={(e) => {
        const h = Number(e.nativeEvent.data);
        if (Number.isFinite(h) && h > 0) setHeight(h);
      }}
    />
  );
}

export default function LessonScreen() {
  // Block screenshots / screen recording while a lesson is open (FLAG_SECURE on
  // Android; best-effort on iOS, where the OS does not allow full blocking).
  usePreventScreenCapture();

  const router = useRouter();
  const { lessonId } = useLocalSearchParams<{ lessonId: string }>();

  const [detail, setDetail] = useState<LmsLessonDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [answers, setAnswers] = useState<AnswerState>({});
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<LmsSubmitResult | null>(null);
  const [completing, setCompleting] = useState(false);
  const [completed, setCompleted] = useState(false);

  const load = useCallback(async () => {
    if (!lessonId) return;
    setLoading(true);
    setError(null);
    try {
      const data = await API.lmsLesson(lessonId);
      setDetail(data);
      setCompleted(data.is_completed);
      // Préremplit depuis les réponses déjà données.
      const init: AnswerState = {};
      for (const q of data.questions) {
        if (q.my_answer) {
          init[q.id] = {
            selected_option_id: q.my_answer.selected_option_id,
            selected_option_ids: q.my_answer.selected_option_ids ?? [],
            open_answer: q.my_answer.open_answer ?? "",
          };
        }
      }
      setAnswers(init);
    } catch (e: any) {
      setError(e?.message ?? "Impossible de charger la leçon.");
    } finally {
      setLoading(false);
    }
  }, [lessonId]);

  useEffect(() => {
    load();
  }, [load]);

  const questions = detail?.questions ?? [];
  const hasQuiz = questions.length > 0;
  const resultByQ = useMemo(
    () => new Map((result?.results ?? []).map((r) => [r.question_id, r])),
    [result],
  );

  const setChoice = (q: LmsQuestion, optionId: string) => {
    setAnswers((prev) => {
      if (q.type === "quiz") {
        return { ...prev, [q.id]: { selected_option_id: optionId } };
      }
      // multi-quiz : toggle
      const current = new Set(prev[q.id]?.selected_option_ids ?? []);
      if (current.has(optionId)) current.delete(optionId);
      else current.add(optionId);
      return { ...prev, [q.id]: { selected_option_ids: [...current] } };
    });
  };

  const setOpen = (q: LmsQuestion, text: string) =>
    setAnswers((prev) => ({ ...prev, [q.id]: { open_answer: text } }));

  const submit = async () => {
    if (!lessonId) return;
    setSubmitting(true);
    setError(null);
    try {
      const payload: LmsSubmitAnswer[] = questions.map((q) => ({
        question_id: q.id,
        selected_option_id: q.type === "quiz" ? answers[q.id]?.selected_option_id ?? null : null,
        selected_option_ids: q.type === "multi-quiz" ? answers[q.id]?.selected_option_ids ?? [] : null,
        open_answer: q.type === "open" ? answers[q.id]?.open_answer ?? "" : null,
      }));
      const res = await API.lmsSubmit(lessonId, payload);
      setResult(res);
      setCompleted(true);
    } catch (e: any) {
      setError(e?.message ?? "Échec de l'envoi. Réessaie.");
    } finally {
      setSubmitting(false);
    }
  };

  const markComplete = async () => {
    if (!lessonId) return;
    setCompleting(true);
    try {
      await API.lmsComplete(lessonId);
      setCompleted(true);
    } catch (e: any) {
      setError(e?.message ?? "Échec. Réessaie.");
    } finally {
      setCompleting(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-bg" edges={["top"]}>
      <BackHeader onBack={() => router.back()} title={detail?.lesson.title ?? "Leçon"} />

      {loading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator color={colors.accent} />
        </View>
      ) : error && !detail ? (
        <View className="flex-1 items-center justify-center px-8">
          <Text className="text-fg-muted text-sm text-center mb-4">{error}</Text>
          <Pressable onPress={load} className="py-2.5 px-5 rounded-xl bg-primary">
            <Text className="font-poppins-semibold text-fg text-sm">Réessayer</Text>
          </Pressable>
        </View>
      ) : detail ? (
        <ScrollView contentContainerStyle={{ paddingHorizontal: 18, paddingBottom: 40 }}>
          <Text className="text-2xl font-poppins-bold text-fg mb-1">{detail.lesson.title}</Text>
          {completed && (
            <View className="flex-row items-center gap-1.5 mb-2">
              <Ionicons name="checkmark-circle" size={16} color={colors.accent} />
              <Text className="text-[13px] font-poppins-medium" style={{ color: colors.accent }}>
                Leçon terminée
              </Text>
            </View>
          )}

          <SecureReader content={detail.lesson.content} />

          {hasQuiz ? (
            <View className="mt-6">
              <Text className="text-xs uppercase tracking-wider font-poppins-semibold text-fg-soft mb-3">
                Quiz
              </Text>
              {questions.map((q, i) => (
                <QuestionCard
                  key={q.id}
                  index={i}
                  question={q}
                  answer={answers[q.id]}
                  result={resultByQ.get(q.id)}
                  locked={submitting}
                  onChoice={(oid) => setChoice(q, oid)}
                  onOpen={(t) => setOpen(q, t)}
                />
              ))}

              {result?.score && (
                <View
                  className="rounded-2xl p-4 mt-1 mb-4"
                  style={{ backgroundColor: result.score.passed ? "#DCFCE7" : colors.dangerSoft }}
                >
                  <Text className="font-poppins-bold text-base" style={{ color: result.score.passed ? "#166534" : colors.danger }}>
                    {result.score.passed ? "Réussi 🎉" : "À retravailler"}
                  </Text>
                  <Text className="text-sm mt-0.5" style={{ color: result.score.passed ? "#166534" : colors.danger }}>
                    {result.score.correct_count}/{result.score.total_questions} bonnes réponses ({result.score.percentage}%)
                  </Text>
                  {result.pending_review > 0 && (
                    <Text className="text-[13px] text-fg-muted mt-1.5">
                      {result.pending_review} réponse{result.pending_review > 1 ? "s" : ""} libre{result.pending_review > 1 ? "s" : ""} en attente de relecture par ton mentor.
                    </Text>
                  )}
                </View>
              )}

              {error && <Text className="text-danger text-sm mb-3">{error}</Text>}

              <PrimaryButton
                title={result ? "Renvoyer mes réponses" : "Valider mes réponses"}
                onPress={submit}
                loading={submitting}
              />
            </View>
          ) : (
            <View className="mt-6">
              {error && <Text className="text-danger text-sm mb-3">{error}</Text>}
              {!completed ? (
                <PrimaryButton title="Marquer comme terminé" onPress={markComplete} loading={completing} />
              ) : (
                <Text className="text-center text-fg-muted text-sm">Tu as terminé cette leçon.</Text>
              )}
            </View>
          )}
        </ScrollView>
      ) : null}
    </SafeAreaView>
  );
}

function QuestionCard({
  index,
  question,
  answer,
  result,
  locked,
  onChoice,
  onOpen,
}: {
  index: number;
  question: LmsQuestion;
  answer?: AnswerState[string];
  result?: { is_correct: boolean | null; correct_option_ids: string[] };
  locked: boolean;
  onChoice: (optionId: string) => void;
  onOpen: (text: string) => void;
}) {
  const my = question.my_answer;
  const selectedIds = new Set(
    question.type === "quiz"
      ? answer?.selected_option_id
        ? [answer.selected_option_id]
        : []
      : answer?.selected_option_ids ?? [],
  );
  const correctIds = new Set(result?.correct_option_ids ?? []);
  const graded = !!result;

  return (
    <View className="bg-card border border-border-soft rounded-2xl p-4 mb-3">
      <View className="flex-row gap-2 mb-3">
        <Text className="font-poppins-bold text-fg">{index + 1}.</Text>
        <Text className="flex-1 font-poppins-medium text-fg">{question.text}</Text>
        {graded && result?.is_correct != null && (
          <Ionicons
            name={result.is_correct ? "checkmark-circle" : "close-circle"}
            size={20}
            color={result.is_correct ? "#16A34A" : colors.danger}
          />
        )}
      </View>

      {question.type === "open" ? (
        <View>
          <TextInput
            value={answer?.open_answer ?? ""}
            onChangeText={onOpen}
            editable={!locked}
            multiline
            placeholder="Ta réponse…"
            placeholderTextColor={colors.fgSoft}
            className="min-h-[90px] rounded-xl border border-border bg-bg-soft p-3 text-fg"
            style={{ textAlignVertical: "top", fontFamily: "Poppins_400Regular" }}
          />
          {my && my.open_answer != null && <ReviewBadge status={my.review_status} comment={my.mentor_comment} />}
        </View>
      ) : (
        <View className="gap-2">
          {question.options.map((opt) => {
            const selected = selectedIds.has(opt.id);
            const isCorrect = graded && correctIds.has(opt.id);
            const isWrongPick = graded && selected && !correctIds.has(opt.id);
            const borderColor = isCorrect
              ? "#16A34A"
              : isWrongPick
                ? colors.danger
                : selected
                  ? colors.primary
                  : colors.border;
            return (
              <Pressable
                key={opt.id}
                onPress={() => !locked && !graded && onChoice(opt.id)}
                className="flex-row items-center gap-3 rounded-xl border p-3"
                style={{
                  borderColor,
                  borderWidth: selected || isCorrect ? 1.5 : 1,
                  backgroundColor: isCorrect ? "#F0FDF4" : selected ? colors.primarySoft : colors.bgSoft,
                }}
              >
                <View
                  className="w-5 h-5 items-center justify-center"
                  style={{
                    borderRadius: question.type === "multi-quiz" ? 6 : 10,
                    borderWidth: 2,
                    borderColor: selected || isCorrect ? colors.accent : colors.fgSoft,
                    backgroundColor: selected || isCorrect ? colors.accent : "transparent",
                  }}
                >
                  {(selected || isCorrect) && <Ionicons name="checkmark" size={13} color="#fff" />}
                </View>
                <Text className="flex-1 text-fg text-sm">{opt.text}</Text>
              </Pressable>
            );
          })}
        </View>
      )}
    </View>
  );
}

function ReviewBadge({
  status,
  comment,
}: {
  status: "pending" | "approved" | "needs_revision";
  comment: string | null;
}) {
  const map = {
    pending: { label: "En attente de relecture", color: colors.fgMuted, bg: colors.border },
    approved: { label: "Validé par ton mentor", color: "#166534", bg: "#DCFCE7" },
    needs_revision: { label: "À revoir", color: colors.danger, bg: colors.dangerSoft },
  } as const;
  const s = map[status];
  return (
    <View className="mt-2 rounded-xl p-3" style={{ backgroundColor: s.bg }}>
      <Text className="text-[13px] font-poppins-semibold" style={{ color: s.color }}>
        {s.label}
      </Text>
      {comment ? <Text className="text-[13px] text-fg mt-1">{comment}</Text> : null}
    </View>
  );
}
