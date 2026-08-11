import { createNativeStackNavigator } from '@react-navigation/native-stack';

import { colors } from '@shared/theme';

import { BubblesScreen } from '../screens/BubblesScreen';
import { CalmWavesScreen } from '../screens/CalmWavesScreen';
import { FollowTheLightScreen } from '../screens/FollowTheLightScreen';
import { MagicColorsScreen } from '../screens/MagicColorsScreen';
import { SensoryDrawingScreen } from '../screens/SensoryDrawingScreen';
import { SensoryHomeScreen } from '../screens/SensoryHomeScreen';
import { TouchAndListenScreen } from '../screens/TouchAndListenScreen';
import type { SensoryStackParamList } from './types';

const Stack = createNativeStackNavigator<SensoryStackParamList>();

/**
 * Navegador propio de Mundo Sensorial, montado como una única pantalla
 * dentro del stack raíz (ruta `SensoryWorld`), igual que `AacNavigator`
 * para el comunicador.
 */
export function SensoryNavigator() {
  return (
    <Stack.Navigator
      initialRouteName="SensoryHome"
      screenOptions={{ headerShown: false, contentStyle: { backgroundColor: colors.background } }}
    >
      <Stack.Screen name="SensoryHome" component={SensoryHomeScreen} />
      <Stack.Screen name="Bubbles" component={BubblesScreen} />
      <Stack.Screen name="MagicColors" component={MagicColorsScreen} />
      <Stack.Screen name="FollowTheLight" component={FollowTheLightScreen} />
      <Stack.Screen name="TouchAndListen" component={TouchAndListenScreen} />
      <Stack.Screen name="CalmWaves" component={CalmWavesScreen} />
      <Stack.Screen name="SensoryDrawing" component={SensoryDrawingScreen} />
    </Stack.Navigator>
  );
}
