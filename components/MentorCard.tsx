import { View, Text } from "react-native";
import { initialsOf } from "@/lib/theme";
import { fieldColor } from "@/lib/formOptions";
import { Avatar, Card } from "./ui";
import { ProfileFacts, mentorFacts } from "./ProfileFacts";
import { Icon } from "./Icon";
import { PersonContact } from "@/services/api";

// Full-bleed mentor card shown in the mentee's swipe deck. Read-only — contact
// details are gated until a binôme is formed, so we only surface profile facts.
export function MentorCard({ p }: { p: PersonContact }) {
  const accent = fieldColor(p.field ?? "");
  const roleLine = [p.mentor_job, p.mentor_company].filter(Boolean).join(" · ");

  return (
    <Card className="flex-1 p-0 overflow-hidden">
      {/* banner */}
      <View style={{ backgroundColor: accent }} className="items-center pt-9 pb-6 px-5">
        <Avatar
          initials={initialsOf(p.first_name, p.last_name)}
          bg="rgba(255,255,255,0.45)"
          size={92}
          radius={28}
          textColor="#fff"
        />
        <Text className="text-[22px] font-poppins-bold text-white mt-4 text-center tracking-tight">
          {p.full_name}
        </Text>
        {roleLine ? (
          <Text className="text-[13px] text-white opacity-90 mt-1 text-center">{roleLine}</Text>
        ) : null}
        {p.city ? (
          <View className="flex-row items-center gap-1.5 mt-2.5">
            <Icon name="map-pin" size={13} color="rgba(255,255,255,0.9)" />
            <Text className="text-xs text-white opacity-90">{p.city}</Text>
          </View>
        ) : null}
      </View>

      {/* facts */}
      <View className="flex-1 p-5 gap-4">
        {p.field ? (
          <View
            className="self-start flex-row items-center gap-2 py-1.5 px-3 rounded-full"
            style={{ backgroundColor: `${accent}1a` }}
          >
            <View style={{ width: 7, height: 7, borderRadius: 4, backgroundColor: accent }} />
            <Text className="text-[13px] font-poppins-semibold" style={{ color: accent }}>
              {p.field}
            </Text>
          </View>
        ) : null}
        <ProfileFacts facts={mentorFacts(p)} />
        {p.description ? (
          <View className="gap-1.5">
            <Text className="text-[11px] text-fg-soft">À propos</Text>
            <Text className="text-sm text-fg leading-[21px]">{p.description}</Text>
          </View>
        ) : null}
      </View>
    </Card>
  );
}
