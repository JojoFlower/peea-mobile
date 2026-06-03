import "../global.css";
import "react-native-url-polyfill/auto";
import React, { useEffect } from "react";
import { Stack, useRouter, useSegments, useRootNavigationState } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { View, Platform, Text, TextInput, Linking } from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { KeyboardProvider } from "react-native-keyboard-controller";
import * as SplashScreen from "expo-splash-screen";
import {
  useFonts,
  Poppins_400Regular,
  Poppins_500Medium,
  Poppins_600SemiBold,
  Poppins_700Bold,
} from "@expo-google-fonts/poppins";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { colors } from "@/lib/theme";

// Default every Text/TextInput to Poppins Regular so untagged text matches the
// mockup; weight utilities (font-poppins-bold, etc.) override the family.
const TextAny = Text as unknown as { defaultProps?: { style?: unknown } };
TextAny.defaultProps = TextAny.defaultProps ?? {};
TextAny.defaultProps.style = [{ fontFamily: "Poppins_400Regular" }, TextAny.defaultProps.style];
const InputAny = TextInput as unknown as { defaultProps?: { style?: unknown } };
InputAny.defaultProps = InputAny.defaultProps ?? {};
InputAny.defaultProps.style = [{ fontFamily: "Poppins_400Regular" }, InputAny.defaultProps.style];

SplashScreen.preventAutoHideAsync().catch(() => {});

// Redirect the entire app to the external networking site.
const REDIRECT_URL = "https://africaexcellenceawards.org/networking";

function RootNav() {
  const { isAuthenticated, initializing } = useAuth();
  const segments = useSegments();
  const router = useRouter();
  const navState = useRootNavigationState();

  useEffect(() => {
    if (!navState?.key) return;
    if (initializing) return;
    const inTabs = segments[0] === "(tabs)";
    if (!isAuthenticated && inTabs) {
      router.replace("/");
    }
  }, [isAuthenticated, initializing, segments, navState?.key, router]);

  const content = (
    <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: colors.bg } }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="auth" />
      <Stack.Screen name="(tabs)" />
      <Stack.Screen name="profile-detail" options={{ presentation: "card" }} />
      <Stack.Screen name="profile-edit" options={{ presentation: "card" }} />
    </Stack>
  );

  // Center on a phone-width column when running on web.
  if (Platform.OS === "web") {
    return (
      <View style={{ flex: 1, alignItems: "center", backgroundColor: "#e9e3d6" }}>
        <View style={{ flex: 1, width: "100%", maxWidth: 480, backgroundColor: colors.bg }}>
          {content}
        </View>
      </View>
    );
  }
  return content;
}

export default function RootLayout() {
  const [fontsLoaded, fontError] = useFonts({
    Poppins_400Regular,
    Poppins_500Medium,
    Poppins_600SemiBold,
    Poppins_700Bold,
  });

  // Send every visitor to the external networking site instead of the app.
  useEffect(() => {
    if (Platform.OS === "web") {
      if (typeof window !== "undefined") {
        window.location.replace(REDIRECT_URL);
      }
    } else {
      Linking.openURL(REDIRECT_URL).catch(() => {});
    }
  }, []);

  useEffect(() => {
    if (fontsLoaded || fontError) {
      SplashScreen.hideAsync().catch(() => {});
    }
  }, [fontsLoaded, fontError]);

  // Don't render the app UI; the redirect above takes over immediately.
  // Set this to false to restore the original app below.
  const REDIRECT_ENABLED = true;
  if (REDIRECT_ENABLED) {
    return null;
  }

  // Hold the splash screen until fonts are ready (or failed) to avoid a flash
  // of the fallback system font.
  if (!fontsLoaded && !fontError) {
    return null;
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <KeyboardProvider>
          <AuthProvider>
            <RootNav />
            <StatusBar style="dark" />
          </AuthProvider>
        </KeyboardProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
