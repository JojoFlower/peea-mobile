import { View, Text, Image, ActivityIndicator } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Redirect, useRouter } from "expo-router";
import { useAuth } from "@/contexts/AuthContext";
import { colors } from "@/lib/theme";
import { PrimaryButton } from "@/components/ui";

export default function SplashScreen() {
  const { isAuthenticated, initializing } = useAuth();
  const router = useRouter();

  if (initializing) {
    return (
      <View className="flex-1 bg-bg items-center justify-center">
        <Image
          source={require("@/assets/images/logo.png")}
          style={{ width: 120, height: 120 }}
          className="mb-6"
          resizeMode="contain"
        />
        <ActivityIndicator color={colors.primaryDark} />
      </View>
    );
  }

  if (isAuthenticated) {
    return <Redirect href="/(tabs)" />;
  }

  return (
    <SafeAreaView className="flex-1 bg-bg">
      <View className="flex-1 items-center justify-center px-8">
        <Image
          source={require("@/assets/images/logo.png")}
          style={{ width: 180, height: 180 }}
          resizeMode="contain"
        />
        <Text className="text-[28px] font-poppins-bold mt-6 mb-1 tracking-tight text-primary-dark text-center leading-[33px]">
          PEEA
        </Text>
        <Text className="text-[18px] font-poppins-semibold text-fg text-center leading-[26px] mb-3">
          L'excellence africaine, connectée.
        </Text>
        <Text className="text-[14px] text-fg-muted leading-[22px] text-center max-w-[280px]">
          Connectez-vous à ceux qui partagent vos ambitions.
        </Text>
      </View>
      <View className="px-6 pb-6">
        <PrimaryButton title="Commencer" onPress={() => router.push("/auth/email")} />
      </View>
    </SafeAreaView>
  );
}
