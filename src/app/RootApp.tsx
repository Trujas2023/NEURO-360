import { NavigationContainer } from '@react-navigation/native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { RootNavigator } from '@app/navigation/RootNavigator';
import { ProfilesProvider } from '@features/profiles/context/ProfilesContext';

/**
 * Composición raíz de la app: proveedores globales (área segura, perfiles)
 * y el navegador raíz definido en Fase 2.
 */
export default function RootApp() {
  return (
    <SafeAreaProvider>
      <ProfilesProvider>
        <NavigationContainer>
          <RootNavigator />
          <StatusBar style="dark" />
        </NavigationContainer>
      </ProfilesProvider>
    </SafeAreaProvider>
  );
}
