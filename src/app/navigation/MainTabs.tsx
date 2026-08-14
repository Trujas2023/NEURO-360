import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Text } from 'react-native';

import { MainTabHeader } from '@app/components/MainTabHeader';
import { HomeScreen } from '@app/screens/HomeScreen';
import { AacNavigator } from '@features/aac-communicator/navigation/AacNavigator';
import { CalmCommunicationScreen } from '@features/calm/screens/CalmCommunicationScreen';
import { MyDayScreen } from '@features/daily-routine/screens/MyDayScreen';
import { colors, touchTargets, typography } from '@shared/theme';

import type { MainTabParamList } from './types';

const Tab = createBottomTabNavigator<MainTabParamList>();

const TAB_CONFIG: Record<keyof MainTabParamList, { label: string; emoji: string }> = {
  Inicio: { label: 'Inicio', emoji: '🏠' },
  MiVoz: { label: 'Mi Voz', emoji: '🗣️' },
  Calma: { label: 'Calma', emoji: '😌' },
  MiDia: { label: 'Mi Día', emoji: '📅' },
};

/**
 * Barra inferior permanente de Modo Niño (Inicio/Mi Voz/Calma/Mi Día):
 * ninguno de los cuatro módulos principales queda a más de un toque de
 * distancia de los demás. `MainTabHeader` se comparte entre los cuatro
 * para que Ayuda también quede siempre a un toque, sin repetir el control
 * pantalla por pantalla.
 */
export function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        header: (props) => <MainTabHeader {...props} />,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textSecondary,
        tabBarStyle: {
          height: touchTargets.large,
          paddingBottom: 8,
          paddingTop: 6,
          backgroundColor: colors.surface,
          borderTopColor: colors.border,
        },
        tabBarLabelStyle: { fontSize: typography.sizes.sm, fontWeight: typography.weights.bold },
        tabBarIcon: ({ focused }) => (
          <Text style={{ fontSize: 22, opacity: focused ? 1 : 0.7 }}>{TAB_CONFIG[route.name].emoji}</Text>
        ),
        tabBarLabel: TAB_CONFIG[route.name].label,
        tabBarAccessibilityLabel: TAB_CONFIG[route.name].label,
      })}
    >
      <Tab.Screen name="Inicio" component={HomeScreen} />
      <Tab.Screen name="MiVoz" component={AacNavigator} />
      <Tab.Screen name="Calma" component={CalmCommunicationScreen} />
      <Tab.Screen name="MiDia" component={MyDayScreen} />
    </Tab.Navigator>
  );
}
