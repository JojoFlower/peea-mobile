import { useCallback, useRef, useState } from "react";
import { View, Text, ActivityIndicator, Alert, Pressable } from "react-native";
import { useFocusEffect } from "expo-router";
import { colors } from "@/lib/theme";
import { PrimaryButton, Tag } from "@/components/ui";
import { SwipeDeck, SwipeDecision } from "@/components/SwipeDeck";
import { MentorCard } from "@/components/MentorCard";
import { Icon } from "@/components/Icon";
import { API, PersonContact } from "@/services/api";
import { confirmAction } from "@/lib/confirm";

// Map a failed "Demander" to a human message so a like never fails silently.
function requestErrorMessage(code: string): string {
  switch (code) {
    case "already_matched":
      return "Tu as déjà un mentor attribué.";
    case "mentor_full":
      return "Ce mentor a déjà atteint son nombre maximum de mentoré·e·s.";
    case "not_found":
      return "Ce mentor n'est plus disponible.";
    case "forbidden":
      return "Action impossible avec ton profil actuel.";
    default:
      // Network / session errors already arrive as full French sentences.
      return code || "Ta demande n'a pas pu être envoyée. Réessaie.";
  }
}

// Mentee-facing swipe deck of mentors. A right swipe ("like") sends a mentorship
// request; the mentor sees it and accepts/declines. Once a mentor accepts, the
// mentee's `me.mentor` is set elsewhere and this deck is replaced by the binôme
// card (handled by the parent screen).
export function MenteeDeck({ field }: { field?: string | null }) {
  const [deck, setDeck] = useState<PersonContact[]>([]);
  const [sent, setSent] = useState<PersonContact[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const hasLoaded = useRef(false);

  const load = useCallback(async () => {
    if (!hasLoaded.current) setLoading(true);
    setError(null);
    try {
      // Deck + already-sent requests together, so the empty state and the
      // "en attente" hint stay in sync with what the mentee actually requested.
      const [deckData, sentData] = await Promise.all([
        API.listMentorDeck(),
        API.listMenteeRequests(),
      ]);
      setDeck(deckData);
      setSent(sentData);
      hasLoaded.current = true;
    } catch (e: any) {
      setError(e?.message ?? "Impossible de charger les mentors.");
    } finally {
      setLoading(false);
    }
  }, []);

  // Reload on focus so mentors swiped/claimed elsewhere drop out.
  useFocusEffect(
    useCallback(() => {
      load();
    }, [load]),
  );

  // Only a "like" is recorded — it sends a mentorship request. A "pass" isn't
  // persisted: the deck just rotates past it (see SwipeDeck) so passed mentors
  // come back around when we reach the end of the list. The card has already left
  // the stack, so on failure we surface an Alert (the request didn't go through)
  // and on success we add the mentor to the "en attente" list optimistically.
  const onSwipe = useCallback((p: PersonContact, decision: SwipeDecision) => {
    if (decision !== "like") return;
    API.requestMentor(p.inscription_id)
      .then(() => {
        setSent((prev) =>
          prev.some((m) => m.inscription_id === p.inscription_id) ? prev : [p, ...prev],
        );
      })
      .catch((e: any) => {
        Alert.alert("Demande non envoyée", requestErrorMessage(e?.message ?? ""));
      });
  }, []);

  // Cancel a pending request: the mentor becomes swipeable again, so reload the
  // deck after the server confirms.
  const cancel = useCallback(
    (m: PersonContact) => {
      confirmAction({
        title: "Annuler la demande ?",
        message: `Ta demande à ${m.full_name} sera retirée. Ce mentor pourra réapparaître dans ton deck.`,
        confirmLabel: "Retirer la demande",
        destructive: true,
        onConfirm: () => {
          setSent((prev) => prev.filter((x) => x.inscription_id !== m.inscription_id));
          API.cancelRequest(m.inscription_id)
            .then(() => load())
            .catch((e: any) => {
              Alert.alert("Oups", e?.message ?? "Impossible d'annuler la demande.");
              load(); // resync with server truth
            });
        },
      });
    },
    [load],
  );

  const sentCount = sent.length;

  // Empty deck has two very different meanings: nothing to show because no mentor
  // exists, vs. the mentee has already requested every available mentor.
  const emptyNode =
    sentCount > 0 ? (
      <View className="flex-1 items-center justify-center px-6">
        <View className="w-[72px] h-[72px] rounded-[22px] mb-[18px] bg-primary-soft items-center justify-center">
          <Icon name="clock" size={32} color={colors.primaryDark} />
        </View>
        <Text className="text-[17px] font-poppins-bold mb-1.5 text-fg text-center">
          En attente de réponse
        </Text>
        <Text className="text-sm text-fg-muted leading-[22px] text-center mb-4">
          Tu as déjà demandé tou·te·s les mentors disponibles. Tu seras notifié·e dès qu'un mentor
          accepte ta demande.
        </Text>
        <SentRequests sent={sent} onCancel={cancel} />
        <PrimaryButton title="Rafraîchir" onPress={load} className="self-stretch mt-5" />
      </View>
    ) : (
      <View className="flex-1 items-center justify-center px-6">
        <View className="w-[72px] h-[72px] rounded-[22px] mb-[18px] bg-primary-soft items-center justify-center">
          <Icon name="clock" size={32} color={colors.primaryDark} />
        </View>
        <Text className="text-[17px] font-poppins-bold mb-1.5 text-fg text-center">
          Aucun mentor disponible
        </Text>
        <Text className="text-sm text-fg-muted leading-[22px] text-center mb-5">
          Aucun mentor n'est inscrit pour le moment. Reviens un peu plus tard.
        </Text>
        <PrimaryButton title="Rafraîchir" onPress={load} className="self-stretch" />
      </View>
    );

  return (
    <View className="flex-1 px-[22px] pb-2">
      <View className="pb-3 flex-row items-center justify-between gap-2">
        <Tag className="py-1.5 px-3">🎯 Tu es Mentoré·e{field ? ` · ${field}` : ""}</Tag>
        {sentCount > 0 ? (
          <View className="flex-row items-center gap-1.5 py-1.5 px-3 rounded-full bg-primary-soft">
            <Icon name="clock" size={13} color={colors.primaryDark} />
            <Text className="text-xs font-poppins-medium" style={{ color: colors.primaryDark }}>
              {sentCount} en attente
            </Text>
          </View>
        ) : null}
      </View>

      {loading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator color={colors.primaryDark} />
        </View>
      ) : error ? (
        <View className="flex-1 items-center justify-center">
          <Text className="text-sm text-fg-muted text-center mb-4">{error}</Text>
          <PrimaryButton title="Réessayer" onPress={load} className="self-stretch" />
        </View>
      ) : (
        <SwipeDeck
          data={deck}
          keyOf={(p) => p.inscription_id}
          renderCard={(p) => <MentorCard p={p} />}
          onSwipe={onSwipe}
          empty={emptyNode}
        />
      )}
    </View>
  );
}

// Compact list of mentors the mentee is waiting on a reply from, each cancelable.
function SentRequests({
  sent,
  onCancel,
}: {
  sent: PersonContact[];
  onCancel: (m: PersonContact) => void;
}) {
  return (
    <View className="self-stretch gap-2">
      {sent.map((m) => (
        <View
          key={m.inscription_id}
          className="flex-row items-center gap-2 py-2.5 pl-3.5 pr-1.5 rounded-2xl bg-card border border-border"
        >
          <Icon name="clock" size={15} color={colors.fgSoft} />
          <Text numberOfLines={1} className="flex-1 text-[13px] font-poppins-medium text-fg">
            {m.full_name}
          </Text>
          <Pressable
            onPress={() => onCancel(m)}
            hitSlop={8}
            className="w-8 h-8 items-center justify-center rounded-full active:bg-bg"
          >
            <Icon name="x" size={16} color={colors.fgMuted} />
          </Pressable>
        </View>
      ))}
    </View>
  );
}
