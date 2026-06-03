import { useState } from "react";
import { View, Text, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter, useLocalSearchParams } from "expo-router";
import { useAuth } from "@/contexts/AuthContext";
import { colors } from "@/lib/theme";
import { BackHeader } from "@/components/headers";
import { PrimaryButton, OutlineButton, Divider } from "@/components/ui";
import { TextField } from "@/components/forms";
import { Icon } from "@/components/Icon";
import { isValidEmail } from "@/lib/validation";

export default function EmailScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ email?: string; justRegistered?: string }>();
  const { requestCode, loading, error } = useAuth();
  const [loginEmail, setLoginEmail] = useState(params.email ?? "");
  const loginValid = isValidEmail(loginEmail);
  const justRegistered = params.justRegistered === "1";

  const login = async () => {
    if (!loginValid) return;
    const normalized = loginEmail.trim().toLowerCase();
    const result = await requestCode(normalized);
    if (result.ok) {
      router.push({ pathname: "/auth/code", params: { email: normalized, flow: "login" } });
    }
  };

  const signup = () => {
    router.push({ pathname: "/auth/register", params: { email: loginEmail.trim() } });
  };

  return (
    <SafeAreaView className="flex-1 bg-bg" edges={["top", "bottom"]}>
      <BackHeader onBack={() => router.back()} />
      <ScrollView contentContainerClassName="p-6 pt-2" keyboardShouldPersistTaps="handled">
        <Text className="text-2xl font-poppins-bold my-2 tracking-tight text-fg">Connexion</Text>
        {justRegistered ? (
          <Text className="text-[13px] text-primary-dark font-poppins-semibold mb-3">
            Ton compte est créé ! Connecte-toi pour accéder à la communauté.
          </Text>
        ) : null}
        <Text className="text-[15px] text-fg-muted leading-[22px] mb-7">
          Entre ton email — on t'envoie un code à <Text className="font-poppins-bold">4 chiffres</Text> pour confirmer
          que c'est bien toi.
        </Text>

        <TextField
          label="Adresse email"
          value={loginEmail}
          onChangeText={setLoginEmail}
          placeholder="prenom.nom@email.com"
          keyboardType="email-address"
          autoCapitalize="none"
          autoFocus
          icon={<Icon name="mail" size={18} color={colors.fgSoft} />}
        />

        {error ? <Text className="text-[13px] mb-2" style={{ color: colors.danger }}>{error}</Text> : null}

        <PrimaryButton title="Se connecter" onPress={login} disabled={!loginValid} loading={loading} className="mt-4" />

        <View className="flex-row items-center gap-3 my-[26px]">
          <View className="flex-1">
            <Divider />
          </View>
          <Text className="text-xs text-fg-soft">Première fois ?</Text>
          <View className="flex-1">
            <Divider />
          </View>
        </View>

        <OutlineButton
          title="S'inscrire"
          onPress={signup}
          iconLeft={<Icon name="plus" size={17} color={colors.fg} />}
          className="mt-3"
        />
        <Text className="text-center text-xs text-fg-soft mt-3.5 leading-[18px]">
          Pas encore membre ? Crée ton profil — on confirme ton email avec le code juste après.
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}
