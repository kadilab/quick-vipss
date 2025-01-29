import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useState } from "react";
import 'react-native-reanimated';
import { Stack, useRouter } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";


import { useColorScheme } from '@/hooks/useColorScheme';

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [userRole, setUserRole] = useState<string | null>(null); // État du rôle utilisateur
  const [isReady, setIsReady] = useState(false); // État de préparation
  const router = useRouter();

  const [loaded] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
  });

    const checkAuth = async () => {
      try {
        const userToken = await AsyncStorage.getItem("user");
        if (userToken) {
          const user = JSON.parse(userToken);
          setUserRole(user.role); // Stocke le rôle utilisateur
          setIsAuthenticated(true);
        } else {
          setIsAuthenticated(false);  
        }
      } catch (error) {
        console.error("Erreur Auth:", error);
        setIsAuthenticated(false);
      } finally {
        setIsReady(true); // Une fois la vérification terminée
        SplashScreen.hideAsync(); // Cache l'écran de lancement
      }
    };

  useEffect(() => {
    if (loaded) {
      checkAuth();
    }
  }, [loaded]);

  useEffect(() => {
    if (isReady && isAuthenticated !== null) {
      if (!isAuthenticated) {
        router.replace("/login"); // Redirige si non authentifié
      } else if (userRole === "driver") {
        router.replace("/driver"); // Redirige les drivers directement vers home
      }
      else if (userRole === "customer") {
        router.replace("/customer"); // Redirige les drivers directement vers home
      }
    }
  }, [isReady, isAuthenticated, userRole]);
  if (!loaded) {
    return null;
  }
  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <Stack>
        <Stack.Screen name="(customer)" options={{ headerShown: false }} />
        <Stack.Screen name="(driver)" options={{ headerShown: false }} />
        <Stack.Screen name="(auth)" options={{ headerShown: false }} />
        <Stack.Screen name="(detaill)" options={{ headerShown: false }} />
\        <Stack.Screen name="+not-found" />
      </Stack>
      <StatusBar style="auto" />
    </ThemeProvider>
  );
}
