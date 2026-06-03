import { useEffect, useRef, useState } from "react";
import { View, Text, TextInput, Pressable, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter, useLocalSearchParams } from "expo-router";
import { useAuth } from "@/contexts/AuthContext";
import { colors } from "@/lib/theme";
import { BackHeader } from "@/components/headers";
import { PrimaryButton } from "@/components/ui";

export default function CodeScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ email: string; flow: "login" | "signup"; firstName?: string }>();
  const email = params.email ?? "";
  const flow = (params.flow as "login" | "signup") ?? "login";
  const isSignup = flow === "signup";

  const { verifyCode, requestCode, loading } = useAuth();
  const [code, setCode] = useState(["", "", "", ""]);
  const [timer, setTimer] = useState(42);
  const [localError, setLocalError] = useState<string | null>(null);
  const refs = useRef<(TextInput | null)[]>([]);

  useEffect(() => {
    const t = setInterval(() => setTimer((s) => Math.max(0, s - 1)), 1000);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    const id = setTimeout(() => refs.current[0]?.focus(), 250);
    return () => clearTimeout(id);
  }, []);

  const allFilled = code.every((c) => c);

  const submit = async (full?: string) => {
    const value = full ?? code.join("");
    if (value.length !== 4) return;
    setLocalError(null);
    const result = await verifyCode(email, value);
    if (result.ok) {
      if (isSignup) {
        router.replace({ pathname: "/auth/welcome", params: { firstName: params.firstName ?? "" } });
      } else {
        router.replace("/(tabs)");
      }
      return;
    }
    setCode(["", "", "", ""]);
    refs.current[0]?.focus();
    if (result.error === "invalid_code") {
      setLocalError(`Code incorrect. ${result.attemptsLeft} tentative(s) restante(s).`);
    } else if (result.error === "code_rotated") {
      setLocalError(result.message || "Un nouveau code vient d'être envoyé.");
      setTimer(42);
    } else if (result.error === "code_expired") {
      setLocalError("Code expiré. Renvoie un nouveau code.");
    } else if (result.error === "rate_limited") {
      setLocalError("Trop de tentatives. Réessaie plus tard.");
    } else {
      setLocalError(result.message || "Vérification échouée.");
    }
  };

  const handleChange = (i: number, v: string) => {
    const digit = v.replace(/\D/g, "").slice(-1);
    const next = [...code];
    next[i] = digit;
    setCode(next);
    if (digit && i < 3) refs.current[i + 1]?.focus();
    if (next.every((c) => c)) submit(next.join(""));
  };

  const handleKey = (i: number, key: string) => {
    if (key === "Backspace" && !code[i] && i > 0) refs.current[i - 1]?.focus();
  };

  const resend = async () => {
    setLocalError(null);
    const r = await requestCode(email);
    if (r.ok) setTimer(42);
  };

  return (
    <SafeAreaView className="flex-1 bg-bg" edges={["top", "bottom"]}>
      <BackHeader onBack={() => router.back()} />
      <ScrollView contentContainerClassName="p-6 pt-2" keyboardShouldPersistTaps="handled">
        <Text className="text-2xl font-poppins-bold my-2 tracking-tight text-fg">Vérifie ton email</Text>
        <Text className="text-[15px] text-fg-muted leading-[22px] mb-9">
          {isSignup
            ? "Pour finaliser ton inscription, saisis le code à 4 chiffres envoyé à"
            : "On a envoyé un code à 4 chiffres à"}{" "}
          <Text className="text-fg font-poppins-bold">{email}</Text>
        </Text>

        <View className="flex-row gap-3.5 justify-center">
          {code.map((v, i) => (
            <TextInput
              key={i}
              ref={(el) => {
                refs.current[i] = el;
              }}
              value={v}
              onChangeText={(t) => handleChange(i, t)}
              onKeyPress={({ nativeEvent }) => handleKey(i, nativeEvent.key)}
              keyboardType="number-pad"
              maxLength={1}
              className={`w-16 h-[72px] rounded-2xl border-[1.5px] text-[28px] font-poppins-semibold text-center text-fg ${
                v ? "bg-primary-soft border-primary" : "bg-card border-border"
              }`}
            />
          ))}
        </View>

        {localError ? (
          <Text className="text-[13px] text-center mt-5" style={{ color: colors.danger }}>
            {localError}
          </Text>
        ) : null}

        <View className="items-center mt-7">
          {timer > 0 ? (
            <Text className="text-[13px] text-fg-soft">
              Renvoyer le code dans <Text className="text-fg-muted font-poppins-bold">0:{String(timer).padStart(2, "0")}</Text>
            </Text>
          ) : (
            <Pressable onPress={resend}>
              <Text className="text-sm text-primary-dark font-poppins-semibold">Renvoyer le code</Text>
            </Pressable>
          )}
        </View>

        <PrimaryButton title="Vérifier" onPress={() => submit()} disabled={!allFilled} loading={loading} className="mt-8" />
        <Pressable onPress={() => router.back()} className="mt-5 self-center">
          <Text className="text-[13px] text-fg-muted">← Modifier l'email</Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}
