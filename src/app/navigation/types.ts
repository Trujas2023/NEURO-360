export type RootStackParamList = {
  Welcome: undefined;
  ProfileSelector: undefined;
  ProfileForm: { profileId?: string } | undefined;
  Home: undefined;
  ComingSoon: { title: string; emoji: string };
  PinGate: undefined;
  AdultHome: undefined;
  /** Comunicador "Mi Voz" (Modo Niño); usa el perfil activo del contexto de perfiles. */
  AacCommunicator: undefined;
  /** Modo Adulto: administración de tarjetas de un perfil concreto. */
  AacManager: { profileId: string };
  AacCardForm: { profileId: string; cardId?: string; categoryId?: string };
  /** Modo Adulto: personalización AAC (tablero, texto, qué mostrar) de un perfil concreto. */
  AacSettings: { profileId: string };
  /** Mi Día: agenda visual de rutinas del perfil activo (Modo Niño). */
  MyDay: undefined;
  /** Modo Adulto: alta/edición de rutinas y pasos de Mi Día de un perfil concreto. */
  RoutineManager: { profileId: string };
  RoutineForm: { profileId: string; routineId?: string };
};

declare global {
  namespace ReactNavigation {
    // eslint-disable-next-line @typescript-eslint/no-empty-object-type -- patrón oficial de React Navigation para tipar useNavigation()
    interface RootParamList extends RootStackParamList {}
  }
}
