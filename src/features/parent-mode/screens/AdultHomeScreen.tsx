import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Alert, StyleSheet, Text, View } from 'react-native';

import type { RootStackParamList } from '@app/navigation/types';
import { useProfiles } from '@features/profiles/context/ProfilesContext';
import { BigButton, ProfileAvatar, ScreenContainer } from '@shared/components';
import { colors, radius, spacing, typography } from '@shared/theme';

type Props = NativeStackScreenProps<RootStackParamList, 'AdultHome'>;

/**
 * Fase 2: administración básica de perfiles dentro de Modo Adulto.
 * La Fase 8 amplía esta pantalla con vocabulario, fotos, audio y juegos
 * habilitados.
 */
export function AdultHomeScreen({ navigation }: Props) {
  const { profiles, deleteProfile } = useProfiles();

  function confirmDelete(id: string, name: string) {
    Alert.alert('Eliminar perfil', `¿Eliminar el perfil de ${name}? Esta acción no se puede deshacer.`, [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Eliminar', style: 'destructive', onPress: () => deleteProfile(id) },
    ]);
  }

  return (
    <ScreenContainer scrollable>
      <Text style={styles.title}>Modo Adulto</Text>
      <Text style={styles.subtitle}>Perfiles infantiles</Text>

      {profiles.length === 0 ? (
        <Text style={styles.empty}>Aún no creaste ningún perfil.</Text>
      ) : (
        profiles.map((profile) => (
          <View key={profile.id} style={styles.row}>
            <ProfileAvatar
              name={profile.name}
              avatarUri={profile.avatarUri}
              avatarColor={profile.avatarColor}
              size={48}
            />
            <Text style={styles.rowName}>{profile.name}</Text>
            <View style={styles.rowActions}>
              <BigButton
                label="Tarjetas"
                emoji="🗣️"
                variant="secondary"
                fullWidth={false}
                onPress={() => navigation.navigate('AacManager', { profileId: profile.id })}
              />
              <View style={styles.rowActionSpacer} />
              <BigButton
                label="Ajustes AAC"
                emoji="⚙️"
                variant="secondary"
                fullWidth={false}
                onPress={() => navigation.navigate('AacSettings', { profileId: profile.id })}
              />
              <View style={styles.rowActionSpacer} />
              <BigButton
                label="Mi Día"
                emoji="🗓️"
                variant="secondary"
                fullWidth={false}
                onPress={() => navigation.navigate('RoutineManager', { profileId: profile.id })}
              />
              <View style={styles.rowActionSpacer} />
              <BigButton
                label="Sensorial"
                emoji="🌈"
                variant="secondary"
                fullWidth={false}
                onPress={() => navigation.navigate('SensorySettings', { profileId: profile.id })}
              />
              <View style={styles.rowActionSpacer} />
              <BigButton
                label="Juegos"
                emoji="🎮"
                variant="secondary"
                fullWidth={false}
                onPress={() => navigation.navigate('GamesSettings', { profileId: profile.id })}
              />
              <View style={styles.rowActionSpacer} />
              <BigButton
                label="Editar"
                variant="secondary"
                fullWidth={false}
                onPress={() => navigation.navigate('ProfileForm', { profileId: profile.id })}
              />
              <View style={styles.rowActionSpacer} />
              <BigButton
                label="Eliminar"
                variant="danger"
                fullWidth={false}
                onPress={() => confirmDelete(profile.id, profile.name)}
              />
            </View>
          </View>
        ))
      )}

      <View style={styles.actions}>
        <BigButton label="Agregar perfil" emoji="➕" onPress={() => navigation.navigate('ProfileForm')} />
        <View style={styles.spacer} />
        <BigButton
          label="Salir de Modo Adulto"
          variant="ghost"
          onPress={() => navigation.navigate('ProfileSelector')}
        />
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  title: {
    fontSize: typography.sizes.xl,
    fontWeight: typography.weights.bold,
    color: colors.textPrimary,
    textAlign: 'center',
  },
  subtitle: {
    marginTop: spacing.sm,
    marginBottom: spacing.md,
    fontSize: typography.sizes.md,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  empty: {
    fontSize: typography.sizes.md,
    color: colors.textSecondary,
    textAlign: 'center',
    marginVertical: spacing.lg,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.sm,
    marginBottom: spacing.sm,
    flexWrap: 'wrap',
  },
  rowName: {
    marginLeft: spacing.sm,
    flex: 1,
    fontSize: typography.sizes.md,
    color: colors.textPrimary,
  },
  rowActions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    rowGap: spacing.xs,
    marginTop: spacing.sm,
    width: '100%',
  },
  rowActionSpacer: {
    width: spacing.sm,
  },
  actions: {
    marginTop: spacing.xl,
  },
  spacer: {
    height: spacing.sm,
  },
});
