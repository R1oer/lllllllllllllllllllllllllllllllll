import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { CartProvider } from '../contexts/CartContext';

export default function Layout() {
  return (
    <SafeAreaProvider>
      <CartProvider>
        <StatusBar style="auto" />
        <Stack screenOptions={{ headerShown: false }} />
      </CartProvider>
    </SafeAreaProvider>
  );
} 