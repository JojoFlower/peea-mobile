import { useState } from "react";
import { View, Text, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter, useLocalSearchParams } from "expo-router";
import { useAuth } from "@/contexts/AuthContext";
import { colors } from "@/lib/theme";
import { BackHeader } from "@/components/headers";
import { PrimaryButton } from "@/components/ui";
import { TextField, SelectField } from "@/components/forms";
import { PhoneField } from "@/components/PhoneField";
import { CityField } from "@/components/CityField";
import { PickerSheet, PickerConfig } from "@/components/PickerSheet";
import { Icon } from "@/components/Icon";
import { HEARD_ABOUT_US_OPTIONS } from "@/lib/formOptions";
import { isValidEmail } from "@/lib/validation";

export default function RegisterScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ email: string }>();

  const { register, loading, error } = useAuth();
  const [email, setEmail] = useState(params.email ?? "");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phone, setPhone] = useState("");
  const [city, setCity] = useState("");
  const [heardAboutUs, setHeardAboutUs] = useState("");
  const [picker, setPicker] = useState<PickerConfig | null>(null);

  const canSubmit =
    isValidEmail(email) && !!firstName.trim() && !!lastName.trim() && !!city.trim() && !!heardAboutUs;

  const submit = async () => {
    if (!canSubmit) return;
    const normalizedEmail = email.trim().toLowerCase();
    const result = await register({
      email: normalizedEmail,
      first_name: firstName.trim(),
      last_name: lastName.trim(),
      phone: phone.trim() || undefined,
      city: city.trim(),
      heard_about_us: heardAboutUs,
    });
    if (!result.ok) return;
    // Account created — close the signup flow and let the user log in on their
    // own. No session is opened here and no verification code screen is shown.
    router.replace({ pathname: "/auth/email", params: { email: normalizedEmail, justRegistered: "1" } });
  };

  return (
    <SafeAreaView className="flex-1 bg-bg" edges={["top", "bottom"]}>
      <BackHeader onBack={() => router.back()} />
      <ScrollView contentContainerClassName="p-6 pt-1" keyboardShouldPersistTaps="handled">
        <Text className="text-2xl font-poppins-bold mb-1.5 tracking-tight text-fg">Crée ton compte</Text>
        <Text className="text-sm text-fg-muted leading-5 mb-5">
          Bienvenue dans la communauté PEEA ! Ces informations constituent ton inscription. Tu pourras rejoindre
          le programme de mentorat juste après.
        </Text>

        <View className="flex-row gap-3">
          <View className="flex-1">
            <TextField label="Prénom" value={firstName} onChangeText={setFirstName} placeholder="Sarah" />
          </View>
          <View className="flex-1">
            <TextField label="Nom" value={lastName} onChangeText={setLastName} placeholder="Kouassi" />
          </View>
        </View>

        <TextField
          label="Email"
          value={email}
          onChangeText={setEmail}
          placeholder="prenom.nom@email.com"
          keyboardType="email-address"
          autoCapitalize="none"
          icon={<Icon name="mail" size={17} color={colors.fgSoft} />}
        />
        <PhoneField label="Téléphone" value={phone} onChangeText={setPhone} />
        <CityField label="Ville de résidence" value={city} onChangeText={setCity} placeholder="Paris" />
        <SelectField
          label="Comment as-tu connu PEEA ?"
          value={heardAboutUs}
          placeholder="Sélectionner"
          onPress={() =>
            setPicker({ key: "heard_about_us", title: "Comment as-tu connu PEEA ?", options: HEARD_ABOUT_US_OPTIONS })
          }
        />

        {error ? <Text className="text-[13px] mt-1" style={{ color: colors.danger }}>{error}</Text> : null}

        <PrimaryButton title="Créer mon compte" onPress={submit} disabled={!canSubmit} loading={loading} className="mt-4" />
      </ScrollView>

      <PickerSheet
        config={picker}
        value={heardAboutUs}
        onPick={(v) => {
          setHeardAboutUs(v);
          setPicker(null);
        }}
        onClose={() => setPicker(null)}
      />
    </SafeAreaView>
  );
}
