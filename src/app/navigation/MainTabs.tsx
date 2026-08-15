import { Ionicons } from '@expo/vector-icons';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';

import { MainTabHeader } from '@app/components/MainTabHeader';
import { HomeScreen } from '@app/screens/HomeScreen';
import { AacNavigator } from '@features/aac-communicator/navigation/AacNavigator';
import { CalmCommunicationScreen } from '@features/calm/screens/CalmCommunicationScreen';
import { MyDayScreen } from '@features/daily-routine/screens/MyDayScreen';
import { colors, touchTargets, typography } from '@shared/theme';

import type { MainTabParamList } from './types';

const Tab = createBottomTabNavigator<MainTabParamList>();

type IoniconName = keyof typeof Ionicons.glyphMap;

/**
 * Íconos vectoriales (`@expo/vector-icons`, ya incluido con Expo SDK 57):
 * primer uso de la librería sancionada en el Design System de V7 (Fase
 * 7C) para el chrome persistente de la app, en vez de emoji. Relleno
 * cuando el tab está activo, contorno cuando no — convención estándar de
 * barras de navegación inferior.
 */
const TAB_CONFIG: Record<keyof MainTabParamList, { label: string; icon: IoniconName; iconActive: IoniconName }> = {
  Inicio: { label: 'Inicio', icon: 'home-outline', iconActive: 'home' },
  MiVoz: { label: 'Mi Voz', icon: 'chatbubbles-outline', iconActive: 'chatbubbles' },
  Calma: { label: 'Calma', icon: 'happy-outline', iconActive: 'happy' },
  MiDia: { label: 'Mi Día', icon: 'calendar-outline', iconActive: 'calendar' },
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
          <Ionicons
            name={focused ? TAB_CONFIG[route.name].iconActive : TAB_CONFIG[route.name].icon}
            size={24}
            color={focused ? colors.primary : colors.textSecondary}
          />
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
