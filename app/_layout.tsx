import { useEffect } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useFrameworkReady } from '@/hooks/useFrameworkReady';
import { useAuthStore } from '@/store/authStore';
import { useCartStore } from '@/store/cartStore';

export default function RootLayout() {
  useFrameworkReady();
  const { sessionToken, setSessionToken, loadCustomer } = useAuthStore();
  const { loadCart } = useCartStore();

  useEffect(() => {
    // Initialize auth state
    if (sessionToken) {
      setSessionToken(sessionToken);
      loadCustomer();
      loadCart();
    }
  }, []);

  return (
    <>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="+not-found" />
      </Stack>
      <StatusBar style="auto" />
    </>
  );
}
