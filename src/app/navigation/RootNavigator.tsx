import { createNativeStackNavigator } from '@react-navigation/native-stack';

import { WelcomeScreen } from '@app/screens/WelcomeScreen';
import { AacCardFormScreen } from '@features/aac-communicator/screens/AacCardFormScreen';
import { AacManagerScreen } from '@features/aac-communicator/screens/AacManagerScreen';
import { AacSettingsScreen } from '@features/aac-communicator/screens/AacSettingsScreen';
import { OverwhelmFlowScreen } from '@features/calm/screens/OverwhelmFlowScreen';
import { PainFlowScreen } from '@features/calm/screens/PainFlowScreen';
import { RoutineFormScreen } from '@features/daily-routine/screens/RoutineFormScreen';
import { RoutineManagerScreen } from '@features/daily-routine/screens/RoutineManagerScreen';
import { CategorySortScreen } from '@features/games/screens/CategorySortScreen';
import { ColorMatchScreen } from '@features/games/screens/ColorMatchScreen';
import { EmotionsScreen } from '@features/games/screens/EmotionsScreen';
import { GamesHomeScreen } from '@features/games/screens/GamesHomeScreen';
import { GamesSettingsScreen } from '@features/games/screens/GamesSettingsScreen';
import { MemoryScreen } from '@features/games/screens/MemoryScreen';
import { SequenceScreen } from '@features/games/screens/SequenceScreen';
import { ShapeMatchScreen } from '@features/games/screens/ShapeMatchScreen';
import { HelpScreen } from '@features/help/screens/HelpScreen';
import { AdultCenterScreen } from '@features/parent-mode/screens/AdultCenterScreen';
import { PinGateScreen } from '@features/parent-mode/screens/PinGateScreen';
import { ProfileFormScreen } from '@features/profiles/screens/ProfileFormScreen';
import { ProfileSelectorScreen } from '@features/profiles/screens/ProfileSelectorScreen';
import { BreathingScreen } from '@features/sensory-world/screens/BreathingScreen';
import { BubblesScreen } from '@features/sensory-world/screens/BubblesScreen';
import { CauseEffectScreen } from '@features/sensory-world/screens/CauseEffectScreen';
import { SensoryHomeScreen } from '@features/sensory-world/screens/SensoryHomeScreen';
import { SensoryPaintScreen } from '@features/sensory-world/screens/SensoryPaintScreen';
import { SensorySettingsScreen } from '@features/sensory-world/screens/SensorySettingsScreen';
import { VisualTrackingScreen } from '@features/sensory-world/screens/VisualTrackingScreen';
import { colors } from '@shared/theme';

import { MainTabs } from './MainTabs';
import type { RootStackParamList } from './types';

const Stack = createNativeStackNavigator<RootStackParamList>();

/**
 * Cabeceras nativas ocultas a propósito: cada pantalla resuelve su propia
 * navegación con botones grandes en el cuerpo, para mantener el área
 * táctil y el estilo consistentes con el resto de la app. `MainTabs`
 * reemplaza a la antigua pantalla `Home`: es el shell de Modo Niño con la
 * barra inferior permanente (Inicio/Mi Voz/Calma/Mi Día).
 */
export function RootNavigator() {
  return (
    <Stack.Navigator
      initialRouteName="Welcome"
      screenOptions={{ headerShown: false, contentStyle: { backgroundColor: colors.background } }}
    >
      <Stack.Screen name="Welcome" component={WelcomeScreen} />
      <Stack.Screen name="ProfileSelector" component={ProfileSelectorScreen} />
      <Stack.Screen name="ProfileForm" component={ProfileFormScreen} />
      <Stack.Screen name="MainTabs" component={MainTabs} />
      <Stack.Screen name="PinGate" component={PinGateScreen} />
      <Stack.Screen name="AdultCenter" component={AdultCenterScreen} />
      <Stack.Screen name="AacManager" component={AacManagerScreen} />
      <Stack.Screen name="AacCardForm" component={AacCardFormScreen} />
      <Stack.Screen name="AacSettings" component={AacSettingsScreen} />
      <Stack.Screen name="RoutineManager" component={RoutineManagerScreen} />
      <Stack.Screen name="RoutineForm" component={RoutineFormScreen} />
      <Stack.Screen name="Help" component={HelpScreen} />
      <Stack.Screen name="CalmPain" component={PainFlowScreen} />
      <Stack.Screen name="CalmOverwhelm" component={OverwhelmFlowScreen} />
      <Stack.Screen name="SensoryHome" component={SensoryHomeScreen} />
      <Stack.Screen name="SensoryBubbles" component={BubblesScreen} />
      <Stack.Screen name="SensoryBreathing" component={BreathingScreen} />
      <Stack.Screen name="SensoryTracking" component={VisualTrackingScreen} />
      <Stack.Screen name="SensoryPaint" component={SensoryPaintScreen} />
      <Stack.Screen name="SensoryCauseEffect" component={CauseEffectScreen} />
      <Stack.Screen name="SensorySettings" component={SensorySettingsScreen} />
      <Stack.Screen name="GamesHome" component={GamesHomeScreen} />
      <Stack.Screen name="GameColors" component={ColorMatchScreen} />
      <Stack.Screen name="GameShapes" component={ShapeMatchScreen} />
      <Stack.Screen name="GameEmotions" component={EmotionsScreen} />
      <Stack.Screen name="GameCategories" component={CategorySortScreen} />
      <Stack.Screen name="GameMemory" component={MemoryScreen} />
      <Stack.Screen name="GameSequence" component={SequenceScreen} />
      <Stack.Screen name="GamesSettings" component={GamesSettingsScreen} />
    </Stack.Navigator>
  );
}
