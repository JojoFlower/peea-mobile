import { View, Text } from "react-native";
import { colors } from "@/lib/theme";
import { Icon, IconName } from "./Icon";

type Fact = { icon: IconName; label: string; value?: string | null };

function FactRow({ icon, label, value }: { icon: IconName; label: string; value?: string | null }) {
  if (!value) return null;
  return (
    <View className="flex-row gap-3 items-start">
      <View className="mt-px">
        <Icon name={icon} size={16} color={colors.fgSoft} />
      </View>
      <View className="flex-1 min-w-0">
        <Text className="text-[11px] text-fg-soft">{label}</Text>
        <Text className="text-sm text-fg font-poppins-medium mt-px">{value}</Text>
      </View>
    </View>
  );
}

export function ProfileFacts({ facts }: { facts: Fact[] }) {
  return (
    <View className="gap-2.5">
      {facts.map((f) => (
        <FactRow key={f.label} icon={f.icon} label={f.label} value={f.value} />
      ))}
    </View>
  );
}

export function mentorFacts(p: {
  mentor_job?: string | null;
  mentor_company?: string | null;
  mentor_field?: string | null;
}): Fact[] {
  return [
    { icon: "briefcase", label: "Métier", value: p.mentor_job },
    { icon: "badge", label: "Entreprise", value: p.mentor_company },
    { icon: "graduation", label: "Domaine de mentorat", value: p.mentor_field },
  ];
}

export function menteeFacts(p: {
  mentee_institution_name?: string | null;
  mentee_institution_subcategory?: string | null;
  mentee_field_of_study?: string | null;
  mentee_level?: string | null;
}): Fact[] {
  return [
    { icon: "graduation", label: "Établissement", value: p.mentee_institution_name },
    { icon: "badge", label: "Filière", value: p.mentee_institution_subcategory },
    { icon: "briefcase", label: "Domaine d'études", value: p.mentee_field_of_study },
    { icon: "clock", label: "Niveau", value: p.mentee_level },
  ];
}

export type { Fact };
