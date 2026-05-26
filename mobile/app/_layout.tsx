import '../services/i18n';
import { useEffect } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import Toast from 'react-native-toast-message';
import { useAuthStore } from '../store/useAuthStore';
import { useLanguageStore } from '../store/useLanguageStore';
import { useThemeColor } from '../hooks/useThemeColor';

const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: 2, staleTime: 30000 } },
});

export default function RootLayout() {
  const loadFromStorage = useAuthStore((s) => s.loadFromStorage);
  const loadLanguage    = useLanguageStore((s) => s.loadLanguage);
  const theme = useThemeColor();

  useEffect(() => {
    loadFromStorage();
    loadLanguage();
  }, []);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <QueryClientProvider client={queryClient}>
          <StatusBar style="light" backgroundColor={theme.primary} />
          <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: theme.background } }}>
            <Stack.Screen name="index" />
            <Stack.Screen name="(auth)" />
            <Stack.Screen name="(main)" />
          </Stack>
          <Toast />
        </QueryClientProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
