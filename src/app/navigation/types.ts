export type RootStackParamList = {
  Welcome: undefined;
  ProfileSelector: undefined;
  ProfileForm: { profileId?: string } | undefined;
  /** Shell de Modo Niño: barra inferior con Inicio/Mi Voz/Calma/Mi Día (ver `MainTabParamList`). */
  MainTabs: undefined;
  ComingSoon: { title: string; emoji: string };
  PinGate: undefined;
  AdultHome: undefined;
  /** Modo Adulto: administración de tarjetas de un perfil concreto. */
  AacManager: { profileId: string };
  AacCardForm: { profileId: string; cardId?: string; categoryId?: string };
  /** Modo Adulto: personalización AAC (tablero, texto, qué mostrar) de un perfil concreto. */
  AacSettings: { profileId: string };
  /** Modo Adulto: alta/edición de rutinas y pasos de Mi Día de un perfil concreto. */
  RoutineManager: { profileId: string };
  RoutineForm: { profileId: string; routineId?: string };
  /** Ayuda: frases de auxilio inmediato, alcanzable en 1 toque desde cualquier tab principal. */
  Help: undefined;
  /** Calma: flujo guiado "Me duele" (dónde / cuánto / cómo se siente). */
  CalmPain: undefined;
  /** Calma: flujo guiado "Tengo miedo / Estoy saturado" (qué te molesta / qué necesitas). */
  CalmOverwhelm: undefined;
  /** Mundo Sensorial: entrada por necesidad ("¿qué necesitas ahora?"). */
  SensoryHome: undefined;
  SensoryBubbles: undefined;
  SensoryBreathing: undefined;
  SensoryTracking: undefined;
  SensoryPaint: undefined;
  SensoryCauseEffect: undefined;
  /** Modo Adulto: ajustes de Mundo Sensorial de un perfil concreto. */
  SensorySettings: { profileId: string };
  /** Juega & Regula: selector de juegos. */
  GamesHome: undefined;
  GameColors: undefined;
  GameShapes: undefined;
  GameEmotions: undefined;
  GameCategories: undefined;
  GameMemory: undefined;
  GameSequence: undefined;
  /** Modo Adulto: ajustes de Juega & Regula de un perfil concreto. */
  GamesSettings: { profileId: string };
};

/**
 * Barra inferior permanente de Modo Niño. Los cuatro módulos principales
 * comparten perfil activo, tema y almacenamiento; ninguno queda a más de
 * un toque de distancia de los demás.
 */
export type MainTabParamList = {
  Inicio: undefined;
  /** Hospeda `AacNavigator` (su propio stack anidado: AacHome/AacCategory). */
  MiVoz: undefined;
  Calma: undefined;
  MiDia: undefined;
};

declare global {
  namespace ReactNavigation {
    // eslint-disable-next-line @typescript-eslint/no-empty-object-type -- patrón oficial de React Navigation para tipar useNavigation()
    interface RootParamList extends RootStackParamList {}
  }
}
