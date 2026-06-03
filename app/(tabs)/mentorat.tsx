import { useCallback, useEffect, useRef, useState } from "react";
import { View, Text, ScrollView, Pressable } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter, useFocusEffect } from "expo-router";
import { useAuth } from "@/contexts/AuthContext";
import { colors, initialsOf } from "@/lib/theme";
import {
  fieldColor,
  FIELD_OF_STUDY_OPTIONS,
  MENTOR_JOB_OPTIONS,
  INSTITUTION_OPTIONS,
  LEVEL_OPTIONS,
  EDITION,
  MAX_MENTEES,
} from "@/lib/formOptions";
import { AppHeader, BackHeader } from "@/components/headers";
import { PrimaryButton, OutlineButton, Card, Avatar, Tag, SectionEyebrow } from "@/components/ui";
import { TextField, SelectField } from "@/components/forms";
import { PickerSheet, PickerConfig } from "@/components/PickerSheet";
import { RoleCard } from "@/components/RoleCard";
import { ContactActions } from "@/components/ContactActions";
import { MenteeDeck } from "@/components/MenteeDeck";
import { MentorRequests } from "@/components/MentorRequests";
import { Icon } from "@/components/Icon";
import { MentorRole, PersonContact } from "@/services/api";
import { confirmAction } from "@/lib/confirm";

type Phase = "landing" | "details" | "match";

export default function MentoratScreen() {
  const router = useRouter();
  const { me, upsertMentorship, leaveMentor, refresh, loading, error } = useAuth();
  const mentorship = me?.mentorship ?? null;

  const [phase, setPhase] = useState<Phase>(mentorship ? "match" : "landing");
  const [role, setRole] = useState<MentorRole | "">(mentorship?.role ?? "");
  const [draft, setDraft] = useState<Record<string, string>>({});
  const [picker, setPicker] = useState<PickerConfig | null>(null);
  // True when the details form was opened to edit an EXISTING profile (from the
  // match view), vs. the onboarding flow (landing → role → details). It flips
  // the back target back to "match" and switches the submit copy to "save".
  const [editing, setEditing] = useState(false);

  // (#2) The session can resolve *after* this tab mounted, leaving the one-shot
  // `useState` initializer locked to "landing". Sync to "match" once, the first
  // time a mentorship appears. The `settled` ref makes this fire exactly once so
  // it never fights a deliberate role switch (which clears `role` later).
  const settled = useRef(false);
  useEffect(() => {
    if (settled.current || !mentorship) return;
    settled.current = true;
    setPhase("match");
  }, [mentorship]);

  // While on the binôme view, refresh "me" on focus so a freshly-assigned mentor
  // (mentee side) or a newly-accepted mentee appears without restarting the app.
  useFocusEffect(
    useCallback(() => {
      if (phase === "match") refresh();
    }, [phase, refresh]),
  );

  // If the user tapped "Rôle" then left without re-submitting, reflect the real
  // state on return rather than stranding them on the role picker. Runs only on a
  // genuine focus *gain* (stable callback, current values via ref), so it never
  // interrupts an in-progress switch while the tab stays focused.
  const liveRef = useRef({ mentorship, role, phase });
  liveRef.current = { mentorship, role, phase };
  useFocusEffect(
    useCallback(() => {
      const s = liveRef.current;
      if (s.mentorship && !s.role && s.phase !== "details") setPhase("match");
    }, []),
  );

  const setD = (k: string, v: string) =>
    setDraft((prev) => {
      const next = { ...prev, [k]: v };
      if (k === "mentee_institution_category" && v !== prev.mentee_institution_category) {
        next.mentee_institution_subcategory = "";
      }
      return next;
    });

  const subOptions =
    INSTITUTION_OPTIONS.find((o) => o.category === draft.mentee_institution_category)?.sub ?? [];

  const detailsValid =
    role === "mentor"
      ? !!draft.mentor_field && !!draft.mentor_job && !!draft.mentor_company
      : !!draft.mentee_institution_category &&
        !!draft.mentee_institution_subcategory &&
        !!draft.mentee_institution_name &&
        !!draft.mentee_field_of_study &&
        !!draft.mentee_level;

  // Snapshot the saved mentorship into the editable draft shape.
  const draftFromMentorship = () => ({
    mentor_field: mentorship?.mentor_field ?? "",
    mentor_job: mentorship?.mentor_job ?? "",
    mentor_company: mentorship?.mentor_company ?? "",
    mentee_institution_category: mentorship?.mentee_institution_category ?? "",
    mentee_institution_subcategory: mentorship?.mentee_institution_subcategory ?? "",
    mentee_institution_name: mentorship?.mentee_institution_name ?? "",
    mentee_field_of_study: mentorship?.mentee_field_of_study ?? "",
    mentee_level: mentorship?.mentee_level ?? "",
    description: mentorship?.description ?? "",
  });

  // Onboarding step: landing → role → details. Pre-fill the form when re-editing
  // the same role so fields (incl. "À propos") aren't silently wiped on a revisit.
  const goToDetails = () => {
    if (mentorship && mentorship.role === role) setDraft(draftFromMentorship());
    setEditing(false);
    setPhase("details");
  };

  // Edit the existing mentorship profile in place (mentor or mentee) without
  // touching the role — the binôme, requests and swipes are preserved because
  // upsertMentorship only resets when the role actually changes.
  const goEditDetails = () => {
    if (!mentorship) return;
    setRole(mentorship.role);
    setDraft(draftFromMentorship());
    setEditing(true);
    setPhase("details");
  };

  const submit = async () => {
    if (!detailsValid || !role) return;
    try {
      const description = draft.description?.trim() || undefined;
      if (role === "mentor") {
        await upsertMentorship({
          role: "mentor",
          mentor_field: draft.mentor_field,
          mentor_job: draft.mentor_job,
          mentor_company: draft.mentor_company,
          description,
        });
      } else {
        await upsertMentorship({
          role: "mentee",
          mentee_institution_category: draft.mentee_institution_category,
          mentee_institution_subcategory: draft.mentee_institution_subcategory,
          mentee_institution_name: draft.mentee_institution_name,
          mentee_field_of_study: draft.mentee_field_of_study,
          mentee_level: draft.mentee_level,
          description,
        });
      }
      setEditing(false);
      setPhase("match");
    } catch {
      /* error surfaced via context */
    }
  };

  // Switch role. Changing role RESETS the whole mentorship on the backend
  // (binôme dissolved, mentees released, AND every sent/received request wiped),
  // so always confirm while there's a mentorship to lose — including pending
  // requests that aren't a binôme yet.
  const changeRole = () => {
    const toLanding = () => {
      setDraft({});
      setRole("");
      setPhase("landing");
    };
    if (!mentorship) return toLanding();

    confirmAction({
      title: "Changer de rôle ?",
      message:
        "Ton mentorat actuel sera réinitialisé : binôme, demandes envoyées/reçues et swipes seront effacés.",
      confirmLabel: "Changer de rôle",
      destructive: true,
      onConfirm: toLanding,
    });
  };

  // Mentee leaves their assigned mentor (stays a mentee, back to the deck).
  const leave = () => {
    confirmAction({
      title: "Quitter ce mentor ?",
      message:
        "Tu repartiras sur le deck pour choisir un autre mentor. Ton mentor actuel sera retiré de ton binôme.",
      confirmLabel: "Quitter",
      destructive: true,
      onConfirm: () => {
        leaveMentor().catch(() => {});
      },
    });
  };

  const openProfile = (p: PersonContact) => {
    router.push({ pathname: "/profile-detail", params: { person: JSON.stringify(p) } });
  };

  // ── LANDING ──────────────────────────────────────────────────────────────
  if (phase === "landing") {
    return (
      <SafeAreaView className="flex-1 bg-bg" edges={["top"]}>
        <AppHeader title="Mentorat" subtitle={`Programme ${EDITION}`} />
        <ScrollView contentContainerClassName="pb-6">
          <View className="px-[22px] pb-[18px]">
            <View className="rounded-[20px] p-[22px] bg-fg overflow-hidden">
              <View
                className="absolute -right-6 -top-6 w-[120px] h-[120px] rounded-full"
                style={{ backgroundColor: "rgba(251,191,36,0.18)" }}
              />
              <Icon name="graduation" size={30} color="#fff" />
              <Text className="text-xl font-poppins-bold text-white mt-3 mb-2">Rejoins le programme de mentorat</Text>
              <Text className="text-[13.5px] text-white opacity-90 leading-5">
                On associe chaque mentoré·e à un mentor de son domaine. Choisis ton rôle pour commencer.
              </Text>
            </View>
          </View>

          <View className="px-[22px]">
            <SectionEyebrow>Je rejoins comme</SectionEyebrow>
            <View className="gap-3">
              <RoleCard
                active={role === "mentee"}
                onPress={() => setRole("mentee")}
                icon={<Icon name="graduation" size={22} color={role === "mentee" ? colors.fg : colors.primaryDark} />}
                title="Je cherche un mentor"
                subtitle="Étudiant·e accompagné·e par un·e professionnel·le de ton domaine."
              />
              <RoleCard
                active={role === "mentor"}
                onPress={() => setRole("mentor")}
                icon={<Icon name="briefcase" size={22} color={role === "mentor" ? colors.fg : colors.primaryDark} />}
                title="Je veux mentorer"
                subtitle="Professionnel·le qui accompagne des étudiant·e·s de ton domaine."
              />
            </View>
            <PrimaryButton title="Continuer" onPress={goToDetails} disabled={!role} className="mt-5" />
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }

  // ── DETAILS ──────────────────────────────────────────────────────────────
  if (phase === "details") {
    return (
      <SafeAreaView className="flex-1 bg-bg" edges={["top", "bottom"]}>
        <BackHeader
          onBack={() => {
            setEditing(false);
            setPhase(editing ? "match" : "landing");
          }}
          title={role === "mentor" ? "Profil mentor" : "Profil mentoré·e"}
        />
        <ScrollView contentContainerClassName="p-6 pt-1" keyboardShouldPersistTaps="handled">
          {role === "mentor" ? (
            <>
              <Text className="text-2xl font-poppins-bold mb-1.5 tracking-tight text-fg">Ton activité</Text>
              <Text className="text-sm text-fg-muted mb-5 leading-5">
                C'est ce que tes mentorés verront pour te reconnaître.
              </Text>
              <SelectField
                label="Domaine de mentorat"
                value={draft.mentor_field}
                placeholder="Sélectionner un domaine"
                onPress={() => setPicker({ key: "mentor_field", title: "Domaine de mentorat", options: FIELD_OF_STUDY_OPTIONS })}
              />
              <SelectField
                label="Métier"
                value={draft.mentor_job}
                placeholder="Sélectionner un métier"
                onPress={() => setPicker({ key: "mentor_job", title: "Métier", options: MENTOR_JOB_OPTIONS })}
              />
              <TextField
                label="Entreprise / Organisation"
                value={draft.mentor_company ?? ""}
                onChangeText={(v) => setD("mentor_company", v)}
                placeholder="Ex : Google"
                icon={<Icon name="briefcase" size={17} color={colors.fgSoft} />}
              />
            </>
          ) : (
            <>
              <Text className="text-2xl font-poppins-bold mb-1.5 tracking-tight text-fg">Tes études</Text>
              <Text className="text-sm text-fg-muted mb-5 leading-5">On t'attribuera un mentor du même domaine.</Text>
              <SelectField
                label="Établissement — catégorie"
                value={draft.mentee_institution_category}
                placeholder="Sélectionner"
                onPress={() =>
                  setPicker({
                    key: "mentee_institution_category",
                    title: "Catégorie d'établissement",
                    options: INSTITUTION_OPTIONS.map((o) => o.category),
                  })
                }
              />
              <SelectField
                label="Établissement — sous-catégorie"
                value={draft.mentee_institution_subcategory}
                placeholder={draft.mentee_institution_category ? "Sélectionner" : "Choisis d'abord une catégorie"}
                disabled={!draft.mentee_institution_category}
                onPress={() => setPicker({ key: "mentee_institution_subcategory", title: "Sous-catégorie", options: subOptions })}
              />
              <TextField
                label="Nom de l'établissement"
                value={draft.mentee_institution_name ?? ""}
                onChangeText={(v) => setD("mentee_institution_name", v)}
                placeholder="Ex : Université Paris-Saclay"
                icon={<Icon name="graduation" size={17} color={colors.fgSoft} />}
              />
              <SelectField
                label="Domaine d'études"
                value={draft.mentee_field_of_study}
                placeholder="Sélectionner"
                onPress={() => setPicker({ key: "mentee_field_of_study", title: "Domaine d'études", options: FIELD_OF_STUDY_OPTIONS })}
              />
              <SelectField
                label="Niveau"
                value={draft.mentee_level}
                placeholder="Sélectionner"
                onPress={() => setPicker({ key: "mentee_level", title: "Niveau d'études", options: LEVEL_OPTIONS })}
              />
            </>
          )}

          <TextField
            label="À propos (optionnel)"
            value={draft.description ?? ""}
            onChangeText={(v) => setD("description", v)}
            placeholder={
              role === "mentor"
                ? "Présente-toi, ton parcours, ce que tu peux apporter, tes disponibilités…"
                : "Présente-toi, tes objectifs, ce que tu attends de ton mentor…"
            }
            multiline
            maxLength={600}
          />

          {error ? <Text className="text-[13px] mt-1" style={{ color: colors.danger }}>{error}</Text> : null}

          <PrimaryButton
            title={editing ? "Enregistrer les modifications" : "Valider mon inscription au mentorat"}
            onPress={submit}
            disabled={!detailsValid}
            loading={loading}
            className="mt-4"
          />
        </ScrollView>

        <PickerSheet
          config={picker}
          value={picker ? draft[picker.key] : undefined}
          onPick={(v) => {
            if (picker) setD(picker.key, v);
            setPicker(null);
          }}
          onClose={() => setPicker(null)}
        />
      </SafeAreaView>
    );
  }

  // ── MATCH ────────────────────────────────────────────────────────────────
  const isMentor = mentorship?.role === "mentor";
  const myField = isMentor ? mentorship?.mentor_field : mentorship?.mentee_field_of_study;
  const assignedMentor = me?.mentor ?? null;
  const myMentees = me?.mentees ?? [];
  const atCapacity = myMentees.length >= MAX_MENTEES;

  // Mentee without a mentor yet → swipe deck. Mentor or matched mentee → binôme view.
  const showDeck = !isMentor && !assignedMentor;
  const title = isMentor ? "Mes mentoré·e·s" : assignedMentor ? "Mon binôme" : "Trouve ton mentor";

  return (
    <SafeAreaView className="flex-1 bg-bg" edges={["top"]}>
      <View className="px-[22px] pt-2 pb-3.5 flex-row justify-between items-center">
        <View className="flex-1 min-w-0">
          <Text className="text-[13px] text-fg-muted mb-0.5">Mentorat · {EDITION}</Text>
          <Text className="text-2xl font-poppins-bold tracking-tight text-fg">{title}</Text>
        </View>
        <View className="flex-row items-center gap-2 ml-3">
          <Pressable
            onPress={goEditDetails}
            className="h-10 px-3 rounded-[14px] border border-border bg-card flex-row items-center gap-1.5"
          >
            <Icon name="edit" size={15} color={colors.fg} />
            <Text className="text-xs font-poppins-medium text-fg">Modifier</Text>
          </Pressable>
          <Pressable
            onPress={changeRole}
            className="h-10 px-3 rounded-[14px] border border-border bg-card flex-row items-center gap-1.5"
          >
            <Icon name="settings" size={15} color={colors.fg} />
            <Text className="text-xs font-poppins-medium text-fg">Rôle</Text>
          </Pressable>
        </View>
      </View>

      {showDeck ? (
        <MenteeDeck field={myField} />
      ) : (
        <ScrollView contentContainerClassName="pb-6">
          {isMentor ? (
            <>
              <View className="px-[22px] pb-4">
                <Tag className="py-1.5 px-3">🎓 Tu es Mentor{myField ? ` · ${myField}` : ""}</Tag>
              </View>
              <MentorRequests mentees={myMentees} atCapacity={atCapacity} />
            </>
          ) : assignedMentor ? (
            <>
              <View className="px-[22px] pb-4">
                <Tag className="py-1.5 px-3">🎯 Tu es Mentoré·e{myField ? ` · ${myField}` : ""}</Tag>
              </View>
              <View className="px-[22px]">
                <SectionEyebrow>Ton mentor attribué</SectionEyebrow>
                <Card className="p-0 overflow-hidden">
                  <View
                    className="p-[18px] flex-row gap-3.5 items-center"
                    style={{ backgroundColor: `${fieldColor(assignedMentor.field ?? "")}1a` }}
                  >
                    <Avatar
                      initials={initialsOf(assignedMentor.first_name, assignedMentor.last_name)}
                      bg={fieldColor(assignedMentor.field ?? "")}
                      size={62}
                      radius={20}
                      textColor="#fff"
                    />
                    <View className="flex-1 min-w-0">
                      <Text className="text-[19px] font-poppins-bold tracking-tight text-fg">{assignedMentor.full_name}</Text>
                      <Text className="text-[13px] text-fg-muted">{assignedMentor.mentor_job}</Text>
                      <Text className="text-xs text-accent font-poppins-medium mt-0.5">{assignedMentor.mentor_company}</Text>
                    </View>
                  </View>
                  <View className="p-[18px]">
                    <ContactActions p={assignedMentor} />
                  </View>
                </Card>
                <OutlineButton title="Voir la fiche complète" onPress={() => openProfile(assignedMentor)} className="mt-3" />
                <Text className="text-xs text-fg-soft text-center mt-3.5 leading-[18px] px-2">
                  Prends contact directement par email ou téléphone pour convenir d'un premier échange.
                </Text>
                <Pressable onPress={leave} disabled={loading} className="mt-4 self-center py-2">
                  <Text className="text-[13px] font-poppins-medium" style={{ color: colors.danger }}>
                    Quitter ce mentor
                  </Text>
                </Pressable>
              </View>
            </>
          ) : null}
        </ScrollView>
      )}
    </SafeAreaView>
  );
}
