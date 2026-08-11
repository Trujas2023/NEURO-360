/**
 * A dónde ir después de un PIN correcto. Por defecto (sin `redirect`) va a
 * `AdultHome`, que es el comportamiento que ya tenían todos los llamadores
 * antes de agregar Mundo Sensorial.
 */
export type PinGateRedirect =
  | { screen: 'AdultHome' }
  | { screen: 'SensorySettings'; params: { profileId: string } };

export type RootStackParamList = {
  Welcome: undefined;
  ProfileSelector: undefined;
  ProfileForm: { profileId?: string } | undefined;
  Home: undefined;
  ComingSoon: { title: string; emoji: string };
  PinGate: { redirect?: PinGateRedirect } | undefined;
  AdultHome: undefined;
  /** Comunicador "Mi Voz" (Modo Niño); usa el perfil activo del contexto de perfiles. */
  AacCommunicator: undefined;
  /** Modo Adulto: administración de tarjetas de un perfil concreto. */
  AacManager: { profileId: string };
  AacCardForm: { profileId: string; cardId?: string; categoryId?: string };
  /** Mundo Sensorial (Modo Niño); usa el perfil activo del contexto de perfiles. */
  SensoryWorld: undefined;
  /** Modo Adulto: ajustes sensoriales de un perfil concreto (alcanzable solo vía PIN). */
  SensorySettings: { profileId: string };
};

declare global {
  namespace ReactNavigation {
    // eslint-disable-next-line @typescript-eslint/no-empty-object-type -- patrón oficial de React Navigation para tipar useNavigation()
    interface RootParamList extends RootStackParamList {}
  }
}
