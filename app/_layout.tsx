import FontAwesome from "@expo/vector-icons/FontAwesome";
import { DarkTheme, ThemeProvider } from "@react-navigation/native";
import { useFonts } from "expo-font";
import { Stack, useRouter, useSegments } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { useEffect } from "react";
import { ActivityIndicator, View } from "react-native";

import { useColorScheme } from "@/components/useColorScheme";
import Colors from "@/constants/Colors";
import { AppProvider } from "@/contexts/AppContext";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";

export {
  // Catch any errors thrown by the Layout component.
  ErrorBoundary,
} from "expo-router";

export const unstable_settings = {
  // Ensure that reloading on `/modal` keeps a back button present.
  initialRouteName: "auth/login",
};

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [loaded, error] = useFonts({
    SpaceMono: require("../assets/fonts/SpaceMono-Regular.ttf"),
    ...FontAwesome.font,
  });

  // Expo Router uses Error Boundaries to catch errors in the navigation tree.
  useEffect(() => {
    if (error) throw error;
  }, [error]);

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  if (!loaded) {
    return null;
  }

  return <RootLayoutNav />;
}

function RootLayoutNav() {
  const colorScheme = useColorScheme();

  // Custom theme with neon colors
  const basketballTheme = {
    ...DarkTheme,
    colors: {
      ...DarkTheme.colors,
      primary: Colors[colorScheme ?? "light"].tint,
      background: Colors[colorScheme ?? "light"].background,
      card: Colors[colorScheme ?? "light"].surface,
      text: Colors[colorScheme ?? "light"].text,
      border: Colors[colorScheme ?? "light"].border,
    },
  };

  return (
    <AuthProvider>
      <AppProvider>
        <ThemeProvider value={basketballTheme}>
          <AuthenticatedApp />
        </ThemeProvider>
      </AppProvider>
    </AuthProvider>
  );
}

function AuthenticatedApp() {
  const { state } = useAuth();
  const router = useRouter();
  const segments = useSegments();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? "light"];

  // 인증 상태가 변경될 때마다 적절한 화면으로 리디렉션
  useEffect(() => {
    if (state.isLoading) return;

    const inAuthGroup = segments[0] === 'auth';

    console.log('Auth state:', state);
    console.log('Current segments:', segments);
    console.log('In auth group:', inAuthGroup);

    if (!state.isAuthenticated && !inAuthGroup) {
      // 인증되지 않았고 auth 그룹에 있지 않으면 로그인으로 리디렉션
      console.log('Redirecting to login');
      router.replace('/auth/login');
    } else if (state.isAuthenticated && inAuthGroup) {
      // 인증되었고 auth 그룹에 있으면 메인 앱으로 리디렉션
      console.log('Redirecting to tabs');
      router.replace('/(tabs)');
    }
  }, [state.isAuthenticated, state.isLoading, segments, router]);

  // 로딩 중일 때 스플래시 화면
  if (state.isLoading) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: colors.background,
        }}
      >
        <ActivityIndicator size="large" color={colors.tint} />
      </View>
    );
  }

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="auth/login" options={{ headerShown: false }} />
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="modal" options={{ presentation: "modal" }} />
    </Stack>
  );
}
