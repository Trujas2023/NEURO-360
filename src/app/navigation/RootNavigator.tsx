import { createNativeStackNavigator } from '@react-navigation/native-stack';

import { ComingSoonScreen } from '@app/screens/ComingSoonScreen';
import { HomeScreen } from '@app/screens/HomeScreen';
import { WelcomeScreen } from '@app/screens/WelcomeScreen';
import { AacNavigator } from '@features/aac-communicator/navigation/AacNavigator';
import { AacCardFormScreen } from '@features/aac-communicator/screens/AacCardFormScreen';
import { AacManagerScreen } from '@features/aac-communicator/screens/AacManagerScreen';
import { AdultHomeScreen } from '@features/parent-mode/screens/AdultHomeScreen';
import { PinGateScreen } from '@features/parent-mode/screens/PinGateScreen';
import { ProfileFormScreen } from '@features/profiles/screens/ProfileFormScreen';
import { ProfileSelectorScreen } from '@features/profiles/screens/ProfileSelectorScreen';
import { colors } from '@shared/theme';

import type { RootStackParamList } from './types';

const Stack = createNativeStackNavigator<RootStackParamList>();

/**
 * Cabeceras nativas ocultas a propósito: cada pantalla resuelve su propia
 * navegación con botones grandes en el cuerpo, para mantener el área
 * táctil y el estilo consistentes con el resto de la app.
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
      <Stack.Screen name="Home" component={HomeScreen} />
      <Stack.Screen name="ComingSoon" component={ComingSoonScreen} />
      <Stack.Screen name="PinGate" component={PinGateScreen} />
      <Stack.Screen name="AdultHome" component={AdultHomeScreen} />
      <Stack.Screen name="AacCommunicator" component={AacNavigator} />
      <Stack.Screen name="AacManager" component={AacManagerScreen} />
      <Stack.Screen name="AacCardForm" component={AacCardFormScreen} />
    </Stack.Navigator>
  );
}
