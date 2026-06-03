import { View, Text, ScrollView } from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { colors, initialsOf } from "@/lib/theme";
import { fieldColor, EDITION } from "@/lib/formOptions";
import { BackHeader } from "@/components/headers";
import { Avatar, Card, SectionEyebrow } from "@/components/ui";
import { ContactActions } from "@/components/ContactActions";
import { ProfileFacts, mentorFacts, menteeFacts } from "@/components/ProfileFacts";
import { Icon } from "@/components/Icon";
import { PersonContact } from "@/services/api";

// Read-only profile viewer. Opened from the swipe deck, the mentor's request
// list, or the binôme views. Contact details are shown only when present —
// they're gated server-side until a binôme is formed.
export default function ProfileDetailScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ person: string }>();

  let p: PersonContact | null = null;
  try {
    p = params.person ? (JSON.parse(params.person) as PersonContact) : null;
  } catch {
    p = null;
  }

  if (!p) {
    return (
      <View className="flex-1 bg-bg items-center justify-center px-8">
        <BackHeader onBack={() => router.back()} />
        <Text className="text-fg-muted text-sm">Profil introuvable.</Text>
      </View>
    );
  }

  const person = p;
  const isMentor = person.role === "mentor";
  const initials = initialsOf(person.first_name, person.last_name);
  const accent = fieldColor(person.field ?? "");
  const hasContact = !!(person.email || person.phone);

  return (
    <View className="flex-1 bg-bg">
      {/* header banner */}
      <View style={{ backgroundColor: accent }} className="pb-7">
        <BackHeader onBack={() => router.back()} />
        <View className="items-center px-[22px] pt-1">
          <Avatar initials={initials} bg="rgba(255,255,255,0.45)" size={84} radius={26} />
          <View className="mt-3 py-1 px-2.5 rounded-full" style={{ backgroundColor: "rgba(255,255,255,0.7)" }}>
            <Text className="text-[10px] font-poppins-semibold uppercase tracking-wide text-accent">
              {isMentor ? "🎓 Mentor" : "🎯 Mentoré·e"} · {EDITION}
            </Text>
          </View>
          <Text className="text-[22px] font-poppins-bold mt-2.5 mb-1 tracking-tight text-fg">{person.full_name}</Text>
          <Text className="text-[13px] text-accent font-poppins-medium text-center">
            {isMentor
              ? [person.mentor_job, person.mentor_company].filter(Boolean).join(" · ")
              : [person.mentee_level, person.mentee_field_of_study].filter(Boolean).join(" · ")}
          </Text>
        </View>
      </View>

      <ScrollView
        className="flex-1 -mt-3.5 bg-bg rounded-t-[24px]"
        contentContainerClassName="pt-5"
        style={{ backgroundColor: colors.bg }}
      >
        <View className="px-[22px] pb-[22px]">
          <SectionEyebrow>Coordonnées</SectionEyebrow>
          {hasContact ? (
            <ContactActions p={person} />
          ) : (
            <Card className="flex-row gap-3 items-center">
              <View className="w-10 h-10 rounded-xl bg-primary-soft items-center justify-center">
                <Icon name="clock" size={18} color={colors.primaryDark} />
              </View>
              <Text className="flex-1 text-[13px] text-fg-muted leading-[19px]">
                Email et téléphone se débloquent une fois le binôme formé.
              </Text>
            </Card>
          )}
        </View>

        <View className="px-[22px] pb-[22px]">
          <SectionEyebrow>{isMentor ? "Activité professionnelle" : "Parcours académique"}</SectionEyebrow>
          <Card>
            <ProfileFacts facts={isMentor ? mentorFacts(person) : menteeFacts(person)} />
          </Card>
        </View>

        {person.description ? (
          <View className="px-[22px] pb-[30px]">
            <SectionEyebrow>À propos</SectionEyebrow>
            <Card>
              <Text className="text-sm text-fg leading-[22px]">{person.description}</Text>
            </Card>
          </View>
        ) : null}
      </ScrollView>
    </View>
  );
}
