import { View, Text } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter, useLocalSearchParams } from "expo-router";
import { colors } from "@/lib/theme";
import { PrimaryButton } from "@/components/ui";
import { Icon } from "@/components/Icon";

export default function WelcomeScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ firstName: string }>();

  return (
    <SafeAreaView className="flex-1 bg-bg" edges={["top", "bottom"]}>
      <View className="flex-1 items-center justify-center px-8">
        <View className="w-[84px] h-[84px] rounded-[26px] bg-primary items-center justify-center mb-[22px]">
          <Icon name="check" size={42} color={colors.fg} />
        </View>
        <Text className="text-[23px] font-poppins-bold mb-2.5 tracking-tight text-fg">Bienvenue {params.firstName} !</Text>
        <Text className="text-sm text-fg-muted leading-[22px] text-center mb-[30px]">
          Ton compte PEEA est créé. Découvre les actualités et toutes les ressources de la communauté.
        </Text>
        <View className="w-full">
          <PrimaryButton title="Découvrir les actualités" onPress={() => router.replace("/(tabs)")} />
        </View>
      </View>
    </SafeAreaView>
  );
}
