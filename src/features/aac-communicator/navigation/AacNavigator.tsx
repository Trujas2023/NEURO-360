import { createNativeStackNavigator } from '@react-navigation/native-stack';

import { colors } from '@shared/theme';

import { PhraseProvider } from '../context/PhraseContext';
import { AacCategoryScreen } from '../screens/AacCategoryScreen';
import { AacHomeScreen } from '../screens/AacHomeScreen';
import type { AacStackParamList } from './types';

const Stack = createNativeStackNavigator<AacStackParamList>();

/**
 * Navegador propio del comunicador "Mi Voz", montado como una única
 * pantalla dentro del stack raíz (ver RootNavigator). `PhraseProvider` se
 * monta y desmonta junto con este navegador: la frase en construcción se
 * limpia sola al salir de "Mi Voz", sin lógica manual adicional.
 */
export function AacNavigator() {
  return (
    <PhraseProvider>
      <Stack.Navigator
        initialRouteName="AacHome"
        screenOptions={{ headerShown: false, contentStyle: { backgroundColor: colors.background } }}
      >
        <Stack.Screen name="AacHome" component={AacHomeScreen} />
        <Stack.Screen name="AacCategory" component={AacCategoryScreen} />
      </Stack.Navigator>
    </PhraseProvider>
  );
}
