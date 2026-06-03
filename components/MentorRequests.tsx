import { useCallback, useRef, useState } from "react";
import { View, Text, ActivityIndicator, Alert, Pressable } from "react-native";
import { useRouter, useFocusEffect } from "expo-router";
import { useAuth } from "@/contexts/AuthContext";
import { colors, initialsOf } from "@/lib/theme";
import { MAX_MENTEES } from "@/lib/formOptions";
import { PrimaryButton, OutlineButton, Card, SectionEyebrow, FieldTag } from "@/components/ui";
import { PersonRow } from "@/components/mentorship";
import { Icon } from "@/components/Icon";
import { API, PersonContact } from "@/services/api";
import { confirmAction } from "@/lib/confirm";

const capacityMessage = `Tu accompagnes déjà ${MAX_MENTEES} mentoré·e·s, la limite pour cette édition. Impossible d'en accepter davantage.`;

// Mentor-facing list of incoming mentorship requests (mentees who liked them),
// with accept/decline, plus the list of already-formed binômes (X/3).
export function MentorRequests({
  mentees,
  atCapacity,
}: {
  mentees: PersonContact[];
  atCapacity: boolean;
}) {
  const router = useRouter();
  const { respondToRequest, removeMentee } = useAuth();
  const [requests, setRequests] = useState<PersonContact[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actingId, setActingId] = useState<string | null>(null);
  const hasLoaded = useRef(false);

  const load = useCallback(async () => {
    if (!hasLoaded.current) setLoading(true);
    setError(null);
    try {
      setRequests(await API.listMentorRequests());
      hasLoaded.current = true;
    } catch (e: any) {
      setError(e?.message ?? "Impossible de charger les demandes.");
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load]),
  );

  const openProfile = (p: PersonContact) =>
    router.push({ pathname: "/profile-detail", params: { person: JSON.stringify(p) } });

  const respond = async (p: PersonContact, action: "accept" | "decline") => {
    setActingId(p.inscription_id);
    try {
      await respondToRequest(p.inscription_id, action);
      // Accepted → me.mentees updated by the context; declined → just drop it.
      setRequests((r) => r.filter((x) => x.inscription_id !== p.inscription_id));
    } catch (e: any) {
      const msg =
        e?.message === "capacity_reached"
          ? capacityMessage
          : e?.message === "already_taken"
            ? "Trop tard — ce·tte mentoré·e a déjà trouvé un mentor."
            : (e?.message ?? "L'action a échoué. Réessaie.");
      Alert.alert("Oups", msg);
      load(); // resync with server truth
    } finally {
      setActingId(null);
    }
  };

  // Remove one accepted mentee from the binôme (frees them back to the deck).
  const remove = (m: PersonContact) => {
    confirmAction({
      title: "Retirer ce·tte mentoré·e ?",
      message: `${m.full_name} sera retiré·e de ton binôme et repartira sur le deck. Cette action ne supprime pas tes autres mentoré·e·s.`,
      confirmLabel: "Retirer",
      destructive: true,
      onConfirm: async () => {
        setActingId(m.inscription_id);
        try {
          await removeMentee(m.inscription_id);
        } catch (e: any) {
          Alert.alert("Oups", e?.message ?? "L'action a échoué. Réessaie.");
        } finally {
          setActingId(null);
        }
      },
    });
  };

  if (loading) {
    return (
      <View className="py-[60px] items-center justify-center">
        <ActivityIndicator color={colors.primaryDark} />
      </View>
    );
  }

  return (
    <View className="px-[22px]">
      {error ? (
        <View className="items-center py-8">
          <Text className="text-sm text-fg-muted text-center mb-4">{error}</Text>
          <PrimaryButton title="Réessayer" onPress={load} className="self-stretch" />
        </View>
      ) : (
        <>
          {/* Incoming requests */}
          <SectionEyebrow>
            {requests.length > 0
              ? `${requests.length} demande${requests.length > 1 ? "s" : ""} reçue${requests.length > 1 ? "s" : ""}`
              : "Demandes reçues"}
          </SectionEyebrow>
          {requests.length === 0 ? (
            <Card className="flex-row gap-3 items-center mb-2">
              <View className="w-10 h-10 rounded-xl bg-primary-soft items-center justify-center">
                <Icon name="clock" size={18} color={colors.primaryDark} />
              </View>
              <Text className="flex-1 text-[13px] text-fg-muted leading-[19px]">
                Pas encore de demande. Les mentoré·e·s qui te « likent » apparaîtront ici.
              </Text>
            </Card>
          ) : (
            <View className="gap-2.5">
              {atCapacity ? (
                <Text className="text-xs leading-[18px] mb-1" style={{ color: colors.danger }}>
                  {capacityMessage}
                </Text>
              ) : null}
              {requests.map((p) => {
                const acting = actingId === p.inscription_id;
                const roleLine = [p.mentee_level, p.mentee_institution_name].filter(Boolean).join(" · ");
                return (
                  <Card key={p.inscription_id} className="gap-3">
                    <View className="flex-row gap-3.5 items-center" onTouchEnd={() => openProfile(p)}>
                      <View className="w-12 h-12 rounded-[16px] bg-bg items-center justify-center">
                        <Text className="font-poppins-semibold text-base text-fg">
                          {initialsOf(p.first_name, p.last_name)}
                        </Text>
                      </View>
                      <View className="flex-1 min-w-0">
                        <Text className="text-[15px] font-poppins-semibold text-fg">{p.full_name}</Text>
                        {roleLine ? (
                          <Text numberOfLines={1} className="text-xs text-fg-muted mt-0.5">
                            {roleLine}
                          </Text>
                        ) : null}
                        {p.field ? (
                          <View className="flex-row mt-1.5">
                            <FieldTag field={p.field} small />
                          </View>
                        ) : null}
                      </View>
                    </View>
                    <View className="flex-row gap-2.5">
                      <View className="flex-1">
                        <OutlineButton
                          title="Refuser"
                          onPress={() => respond(p, "decline")}
                          disabled={acting}
                        />
                      </View>
                      <View className="flex-1">
                        <PrimaryButton
                          title="Accepter"
                          onPress={() => respond(p, "accept")}
                          loading={acting}
                          disabled={atCapacity}
                          iconLeft={<Icon name="check" size={17} color={colors.fg} />}
                        />
                      </View>
                    </View>
                  </Card>
                );
              })}
            </View>
          )}

          {/* Already-formed binômes */}
          <View className="pt-6">
            <SectionEyebrow>
              {mentees.length}/{MAX_MENTEES} mentoré·e{mentees.length > 1 ? "s" : ""} accepté·e
              {mentees.length > 1 ? "s" : ""}
            </SectionEyebrow>
            {mentees.length === 0 ? (
              <Text className="text-sm text-fg-muted leading-[22px]">
                Accepte une demande pour former ton premier binôme.
              </Text>
            ) : (
              <>
                <View className="gap-2.5">
                  {mentees.map((m) => (
                    <View key={m.inscription_id}>
                      <PersonRow p={m} onPress={() => openProfile(m)} />
                      <Pressable
                        onPress={() => remove(m)}
                        disabled={actingId === m.inscription_id}
                        className="self-end mt-1 py-1.5 px-2"
                      >
                        <Text className="text-xs font-poppins-medium" style={{ color: colors.danger }}>
                          Retirer du binôme
                        </Text>
                      </Pressable>
                    </View>
                  ))}
                </View>
                <Text className="text-xs text-fg-soft text-center mt-4 leading-[18px] px-2">
                  Touche un·e mentoré·e pour voir ses coordonnées et le contacter.
                </Text>
              </>
            )}
          </View>
        </>
      )}
    </View>
  );
}
