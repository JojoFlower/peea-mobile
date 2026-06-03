import { View, Text, ScrollView, Pressable } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { useAuth } from "@/contexts/AuthContext";
import { colors, avatarBg, initialsOf } from "@/lib/theme";
import { EDITION } from "@/lib/formOptions";
import { AppHeader } from "@/components/headers";
import { Avatar, Card, Tag, FieldTag, SectionEyebrow, PrimaryButton } from "@/components/ui";
import { ProfileFacts, mentorFacts, menteeFacts } from "@/components/ProfileFacts";
import { Icon, IconName } from "@/components/Icon";

function Row({
  icon,
  label,
  value,
  onPress,
  danger,
}: {
  icon: IconName;
  label: string;
  value?: string | null;
  onPress?: () => void;
  danger?: boolean;
}) {
  const inner = (
    <View className="flex-row items-center gap-3.5 py-3.5 border-b border-border-soft">
      <View
        className={`w-9 h-9 rounded-[11px] items-center justify-center ${danger ? "" : "bg-primary-soft"}`}
        style={danger ? { backgroundColor: colors.dangerSoft } : undefined}
      >
        <Icon name={icon} size={18} color={danger ? colors.danger : colors.accent} />
      </View>
      <View className="flex-1 min-w-0">
        <Text className="text-sm font-poppins-medium" style={{ color: danger ? colors.danger : colors.fg }}>
          {label}
        </Text>
        {value ? (
          <Text numberOfLines={1} className="text-xs text-fg-muted mt-0.5">
            {value}
          </Text>
        ) : null}
      </View>
      {onPress ? <Icon name="chevron-right" size={18} color={colors.fgSoft} /> : null}
    </View>
  );
  return onPress ? (
    <Pressable onPress={onPress} className="active:opacity-70">
      {inner}
    </Pressable>
  ) : (
    inner
  );
}

export default function ProfilScreen() {
  const router = useRouter();
  const { me, logout } = useAuth();
  const user = me?.user;
  const mentorship = me?.mentorship ?? null;
  const hasMentorship = !!mentorship && mentorship.status === "active";
  const isMentor = mentorship?.role === "mentor";

  if (!user) return null;

  const fullName = `${user.first_name} ${user.last_name}`;
  const initials = initialsOf(user.first_name, user.last_name);
  const bg = avatarBg(user.email);
  const field = isMentor ? mentorship?.mentor_field : mentorship?.mentee_field_of_study;

  const subtitle = hasMentorship
    ? isMentor
      ? [mentorship?.mentor_job, mentorship?.mentor_company].filter(Boolean).join(" · ")
      : [mentorship?.mentee_level, mentorship?.mentee_institution_name].filter(Boolean).join(" · ")
    : `Membre PEEA · ${user.city ?? ""}`;

  const goMentorat = () => router.navigate("/(tabs)/mentorat");
  const goEditProfile = () => router.navigate("/profile-edit");

  return (
    <SafeAreaView className="flex-1 bg-bg" edges={["top"]}>
      <AppHeader title="Profil" />
      <ScrollView contentContainerClassName="pb-4">
        {/* identity */}
        <View className="px-[22px] pb-[22px] items-center">
          <Avatar initials={initials} bg={bg} size={88} radius={28} />
          <Text className="text-[22px] font-poppins-bold mt-3.5 mb-1 tracking-tight text-fg">{fullName}</Text>
          <Text className="text-[13px] text-fg-muted">{subtitle}</Text>
          <View className="flex-row justify-center gap-2 mt-3.5 flex-wrap">
            {hasMentorship ? (
              <>
                <Tag className="py-1.5 px-3">{isMentor ? "🎓 Mentor" : "🎯 Mentoré·e"}</Tag>
                {field ? <FieldTag field={field} /> : null}
              </>
            ) : (
              <Tag bg={colors.bg} color={colors.fgMuted} className="py-1.5 px-3">
                Inscription confirmée
              </Tag>
            )}
          </View>
        </View>

        {/* mentorship status */}
        <View className="px-[22px] pb-4">
          <SectionEyebrow>Programme de mentorat</SectionEyebrow>
          {hasMentorship ? (
            <Card className="flex-row items-center gap-3" onPress={goMentorat}>
              <View className="w-10 h-10 rounded-xl bg-primary-soft items-center justify-center">
                <Icon name="graduation" size={20} color={colors.accent} />
              </View>
              <View className="flex-1 min-w-0">
                <Text className="text-sm font-poppins-semibold text-fg">
                  Tu participes comme {isMentor ? "mentor" : "mentoré·e"}
                </Text>
                <Text className="text-xs text-fg-muted mt-0.5">{field}</Text>
              </View>
              <Icon name="chevron-right" size={18} color={colors.fgSoft} />
            </Card>
          ) : (
            <Card className="items-center p-[18px]">
              <Text className="text-[13px] text-fg-muted mb-3 leading-5 text-center">
                Tu n'as pas encore rejoint le programme. Choisis ton rôle (mentor ou mentoré·e) pour être mis·e en
                relation.
              </Text>
              <PrimaryButton
                title="Rejoindre le mentorat"
                onPress={goMentorat}
                iconLeft={<Icon name="graduation" size={17} color={colors.fg} />}
              />
            </Card>
          )}
        </View>

        {/* coordonnées */}
        <View className="px-[22px] pb-4">
          <SectionEyebrow>Coordonnées (inscription)</SectionEyebrow>
          <Row icon="mail" label="Email" value={user.email} />
          <Row icon="phone" label="Téléphone" value={user.phone} />
          <Row icon="map-pin" label="Ville" value={user.city} />
          {user.heard_about_us ? <Row icon="globe" label="Connu PEEA via" value={user.heard_about_us} /> : null}
          <Row icon="edit" label="Modifier mes informations" onPress={goEditProfile} />
        </View>

        {/* mentorship facts */}
        {hasMentorship ? (
          <View className="px-[22px] pb-4">
            <SectionEyebrow>{isMentor ? "Mon activité" : "Mes études"}</SectionEyebrow>
            <Card>
              <ProfileFacts facts={isMentor ? mentorFacts(mentorship!) : menteeFacts(mentorship!)} />
            </Card>
          </View>
        ) : null}

        {/* programme + logout */}
        <View className="px-[22px] pb-4">
          <SectionEyebrow>Programme</SectionEyebrow>
          <Row icon="badge" label="Édition" value={EDITION} />
        </View>
        <View className="px-[22px] pb-[30px]">
          <Row icon="log-out" label="Se déconnecter" danger onPress={logout} />
        </View>

        <Text className="text-center text-[11px] text-fg-soft pb-4">PEEA · Programme de mentorat · v1.0</Text>
      </ScrollView>
    </SafeAreaView>
  );
}
