export type RootStackParamList = {
  Welcome: undefined;
  ProfileSelector: undefined;
  ProfileForm: { profileId?: string } | undefined;
  Home: undefined;
  ComingSoon: { title: string; emoji: string };
  PinGate: undefined;
  AdultHome: undefined;
};

declare global {
  namespace ReactNavigation {
    // eslint-disable-next-line @typescript-eslint/no-empty-object-type -- patrón oficial de React Navigation para tipar useNavigation()
    interface RootParamList extends RootStackParamList {}
  }
}
