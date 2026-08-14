import { createNativeStackNavigator } from '@react-navigation/native-stack';

import { ComingSoonScreen } from '@app/screens/ComingSoonScreen';
import { WelcomeScreen } from '@app/screens/WelcomeScreen';
import { AacCardFormScreen } from '@features/aac-communicator/screens/AacCardFormScreen';
import { AacManagerScreen } from '@features/aac-communicator/screens/AacManagerScreen';
import { AacSettingsScreen } from '@features/aac-communicator/screens/AacSettingsScreen';
import { OverwhelmFlowScreen } from '@features/calm/screens/OverwhelmFlowScreen';
import { PainFlowScreen } from '@features/calm/screens/PainFlowScreen';
import { RoutineFormScreen } from '@features/daily-routine/screens/RoutineFormScreen';
import { RoutineManagerScreen } from '@features/daily-routine/screens/RoutineManagerScreen';
import { HelpScreen } from '@features/help/screens/HelpScreen';
import { AdultHomeScreen } from '@features/parent-mode/screens/AdultHomeScreen';
import { PinGateScreen } from '@features/parent-mode/screens/PinGateScreen';
import { ProfileFormScreen } from '@features/profiles/screens/ProfileFormScreen';
import { ProfileSelectorScreen } from '@features/profiles/screens/ProfileSelectorScreen';
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
      <Stack.Screen name="ComingSoon" component={ComingSoonScreen} />
      <Stack.Screen name="PinGate" component={PinGateScreen} />
      <Stack.Screen name="AdultHome" component={AdultHomeScreen} />
      <Stack.Screen name="AacManager" component={AacManagerScreen} />
      <Stack.Screen name="AacCardForm" component={AacCardFormScreen} />
      <Stack.Screen name="AacSettings" component={AacSettingsScreen} />
      <Stack.Screen name="RoutineManager" component={RoutineManagerScreen} />
      <Stack.Screen name="RoutineForm" component={RoutineFormScreen} />
      <Stack.Screen name="Help" component={HelpScreen} />
      <Stack.Screen name="CalmPain" component={PainFlowScreen} />
      <Stack.Screen name="CalmOverwhelm" component={OverwhelmFlowScreen} />
    </Stack.Navigator>
  );
}
