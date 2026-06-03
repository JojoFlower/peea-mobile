import { useState } from "react";
import { View, Text, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { useAuth } from "@/contexts/AuthContext";
import { colors } from "@/lib/theme";
import { BackHeader } from "@/components/headers";
import { PrimaryButton } from "@/components/ui";
import { TextField } from "@/components/forms";
import { PhoneField } from "@/components/PhoneField";
import { CityField } from "@/components/CityField";
import { Icon } from "@/components/Icon";

// Edit the current user's inscription details (name, phone, city). Email is shown
// read-only — it's the login identifier and can't be changed here.
export default function ProfileEditScreen() {
  const router = useRouter();
  const { me, updateProfile, loading, error } = useAuth();
  const user = me?.user;

  const [firstName, setFirstName] = useState(user?.first_name ?? "");
  const [lastName, setLastName] = useState(user?.last_name ?? "");
  const [phone, setPhone] = useState(user?.phone ?? "");
  const [city, setCity] = useState(user?.city ?? "");

  if (!user) return null;

  const canSubmit = !!firstName.trim() && !!lastName.trim() && !!city.trim();

  const submit = async () => {
    if (!canSubmit) return;
    try {
      await updateProfile({
        first_name: firstName.trim(),
        last_name: lastName.trim(),
        city: city.trim(),
        phone: phone.trim() || undefined,
      });
      router.back();
    } catch {
      /* error surfaced via context */
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-bg" edges={["top", "bottom"]}>
      <BackHeader onBack={() => router.back()} title="Modifier mes informations" />
      <ScrollView contentContainerClassName="p-6 pt-1" keyboardShouldPersistTaps="handled">
        <Text className="text-sm text-fg-muted leading-5 mb-5">
          Mets à jour tes coordonnées d'inscription. Ton email de connexion ne peut pas être modifié
          ici.
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
          label="Email (non modifiable)"
          value={user.email}
          onChangeText={() => {}}
          editable={false}
          icon={<Icon name="mail" size={17} color={colors.fgSoft} />}
        />
        <PhoneField label="Téléphone" value={phone} onChangeText={setPhone} />
        <CityField label="Ville de résidence" value={city} onChangeText={setCity} placeholder="Paris" />

        {error ? <Text className="text-[13px] mt-1" style={{ color: colors.danger }}>{error}</Text> : null}

        <PrimaryButton
          title="Enregistrer"
          onPress={submit}
          disabled={!canSubmit}
          loading={loading}
          className="mt-4"
        />
      </ScrollView>
    </SafeAreaView>
  );
}
