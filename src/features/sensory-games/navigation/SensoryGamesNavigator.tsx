import { createNativeStackNavigator } from '@react-navigation/native-stack';

import { colors } from '@shared/theme';

import { BubblePopScreen } from '../bubble-pop/BubblePopScreen';
import { SensoryGamesHomeScreen } from '../screens/SensoryGamesHomeScreen';
import type { SensoryGamesStackParamList } from './types';

const Stack = createNativeStackNavigator<SensoryGamesStackParamList>();

/**
 * Navegador propio de "Juega & Regula", montado como una única pantalla
 * dentro del stack raíz (ver RootNavigator), igual patrón que
 * `AacNavigator`.
 */
export function SensoryGamesNavigator() {
  return (
    <Stack.Navigator
      initialRouteName="SensoryGamesHome"
      screenOptions={{ headerShown: false, contentStyle: { backgroundColor: colors.background } }}
    >
      <Stack.Screen name="SensoryGamesHome" component={SensoryGamesHomeScreen} />
      <Stack.Screen name="BubblePop" component={BubblePopScreen} />
    </Stack.Navigator>
  );
}
