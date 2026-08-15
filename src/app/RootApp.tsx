import { NavigationContainer } from '@react-navigation/native';
import { useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { RootNavigator } from '@app/navigation/RootNavigator';
import { ProfilesProvider } from '@features/profiles/context/ProfilesContext';
import { initializeStorage } from '@services/storage';
import { useAppFonts } from '@shared/hooks';
import { colors } from '@shared/theme';

/**
 * Composición raíz de la app: inicializa la base de datos (esquema +
 * migración de datos heredados de AsyncStorage, ver
 * services/storage/db.ts) y carga la tipografía del design system antes de
 * montar cualquier pantalla, para que ningún repositorio lea una base
 * vacía y no haya "salto" visible de fuente del sistema a Atkinson
 * Hyperlegible.
 */
export default function RootApp() {
  const [storageReady, setStorageReady] = useState(false);
  const fontsReady = useAppFonts();

  useEffect(() => {
    let isMounted = true;
    initializeStorage().then(() => {
      if (isMounted) {
        setStorageReady(true);
      }
    });
    return () => {
      isMounted = false;
    };
  }, []);

  if (!storageReady || !fontsReady) {
    return (
      <SafeAreaProvider>
        <View style={styles.loading}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
        <StatusBar style="dark" />
      </SafeAreaProvider>
    );
  }

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

const styles = StyleSheet.create({
  loading: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.background,
  },
});
