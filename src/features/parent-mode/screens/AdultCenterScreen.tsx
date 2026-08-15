import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useState } from 'react';
import { Alert, StyleSheet, Text, View } from 'react-native';

import type { RootStackParamList } from '@app/navigation/types';
import { ProfileCard } from '@features/profiles/components/ProfileCard';
import { useProfiles } from '@features/profiles/context/ProfilesContext';
import { BigButton, EntityGridCard, ScreenContainer } from '@shared/components';
import { colors, spacing, typography } from '@shared/theme';

type Props = NativeStackScreenProps<RootStackParamList, 'AdultCenter'>;

/**
 * Centro Adulto (Fase 7D): reemplaza a la antigua `AdultHomeScreen`, que
 * repetía 7 botones por fila de perfil sin ninguna sección (ver
 * `docs/V7_PRODUCT_AUDIT.md` §4.8/§9). Nivel 1 en dos partes: arriba, a
 * qué perfil administrar; abajo, una grilla de secciones que actúan sobre
 * ese perfil (`docs/V7_UX_ARCHITECTURE.md` §7). Las pantallas de Nivel 2
 * (`AacManager`, `AacSettings`, `SensorySettings`, `GamesSettings`,
 * `RoutineManager`) no cambiaron: solo cambió cómo se llega a ellas.
 *
 * Accesibilidad y Respaldo (Fase 7H) son transversales: viven en su
 * propia sección "General", siempre visibles, sin depender de tener un
 * perfil elegido arriba — Respaldo respalda todos los perfiles a la vez;
 * Accesibilidad sí necesita uno para saber qué perfil editar, así que si
 * todavía no existe ninguno lo avisa en vez de navegar a una pantalla
 * rota. Estadísticas sí es por perfil (`docs/V7_UX_ARCHITECTURE.md` §9) y
 * vive en la grilla de "Ajustes de {perfil}", igual que Mi Voz/Sensorial/
 * Juegos/Mi Día.
 */
export function AdultCenterScreen({ navigation }: Props) {
  const { profiles, deleteProfile } = useProfiles();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const selected = profiles.find((profile) => profile.id === selectedId) ?? profiles[0] ?? null;

  function confirmDelete(id: string, name: string) {
    Alert.alert('Eliminar perfil', `¿Eliminar el perfil de ${name}? Esta acción no se puede deshacer.`, [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Eliminar', style: 'destructive', onPress: () => deleteProfile(id) },
    ]);
  }

  function openMiVoz(profileId: string, profileName: string) {
    Alert.alert('Mi Voz', `¿Qué quieres administrar de ${profileName}?`, [
      { text: 'Tarjetas', onPress: () => navigation.navigate('AacManager', { profileId }) },
      { text: 'Ajustes de voz', onPress: () => navigation.navigate('AacSettings', { profileId }) },
      { text: 'Cancelar', style: 'cancel' },
    ]);
  }

  function openAccessibility() {
    if (!selected) {
      Alert.alert('Primero un perfil', 'Crea un perfil para poder configurar su accesibilidad.');
      return;
    }
    navigation.navigate('Accessibility', { profileId: selected.id });
  }

  return (
    <ScreenContainer scrollable>
      <Text style={styles.title}>Centro Adulto</Text>

      <Text style={styles.sectionLabel}>Perfiles</Text>
      {profiles.length === 0 ? (
        <Text style={styles.empty}>Todavía no creaste ningún perfil.</Text>
      ) : (
        <View style={styles.profileRow}>
          {profiles.map((profile) => (
            <View key={profile.id} style={styles.profileItem}>
              <ProfileCard
                profile={profile}
                selected={profile.id === selected?.id}
                accessibilityLabel={`Administrar a ${profile.name}`}
                onPress={() => setSelectedId(profile.id)}
              />
            </View>
          ))}
        </View>
      )}

      <View style={styles.profileActions}>
        <BigButton
          label="Agregar perfil"
          emoji="➕"
          variant="secondary"
          fullWidth={false}
          onPress={() => navigation.navigate('ProfileForm')}
        />
        {selected ? (
          <>
            <BigButton
              label="Editar"
              variant="secondary"
              fullWidth={false}
              onPress={() => navigation.navigate('ProfileForm', { profileId: selected.id })}
            />
            <BigButton
              label="Eliminar"
              variant="danger"
              fullWidth={false}
              onPress={() => confirmDelete(selected.id, selected.name)}
            />
          </>
        ) : null}
      </View>

      {selected ? (
        <>
          <Text style={styles.sectionLabel}>Ajustes de {selected.name}</Text>
          <View style={styles.grid}>
            <EntityGridCard
              icon="chatbubbles"
              label="Mi Voz"
              accentColor={colors.primary}
              accessibilityLabel={`Administrar Mi Voz de ${selected.name}`}
              accessibilityHint="Tarjetas y ajustes del comunicador"
              onPress={() => openMiVoz(selected.id, selected.name)}
            />
            <EntityGridCard
              icon="leaf"
              label="Mundo Sensorial"
              accentColor={colors.lavender}
              accessibilityLabel={`Administrar Mundo Sensorial de ${selected.name}`}
              onPress={() => navigation.navigate('SensorySettings', { profileId: selected.id })}
            />
            <EntityGridCard
              icon="game-controller"
              label="Juega & Regula"
              accentColor={colors.accent}
              accessibilityLabel={`Administrar Juega y Regula de ${selected.name}`}
              onPress={() => navigation.navigate('GamesSettings', { profileId: selected.id })}
            />
            <EntityGridCard
              icon="calendar"
              label="Mi Día"
              accentColor={colors.secondary}
              accessibilityLabel={`Administrar Mi Día de ${selected.name}`}
              onPress={() => navigation.navigate('RoutineManager', { profileId: selected.id })}
            />
            <EntityGridCard
              icon="stats-chart"
              label="Estadísticas"
              accentColor={colors.warning}
              accessibilityLabel={`Ver estadísticas de ${selected.name}`}
              accessibilityHint="Tarjetas más usadas y recientes de Mi Voz"
              onPress={() => navigation.navigate('Statistics', { profileId: selected.id })}
            />
          </View>
        </>
      ) : null}

      <Text style={styles.sectionLabel}>General</Text>
      <View style={styles.grid}>
        <EntityGridCard
          icon="accessibility"
          label="Accesibilidad"
          accentColor={colors.success}
          accessibilityLabel="Accesibilidad"
          accessibilityHint="Sonido, movimiento y ajustes de Mi Voz"
          onPress={openAccessibility}
        />
        <EntityGridCard
          icon="cloud-upload"
          label="Respaldo"
          accentColor={colors.blush}
          accessibilityLabel="Respaldo"
          accessibilityHint="Exportar o restaurar todos los datos del dispositivo"
          onPress={() => navigation.navigate('Backup')}
        />
      </View>

      <View style={styles.actions}>
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
    marginBottom: spacing.lg,
  },
  sectionLabel: {
    marginTop: spacing.lg,
    marginBottom: spacing.sm,
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.bold,
    color: colors.textPrimary,
  },
  empty: {
    fontSize: typography.sizes.md,
    color: colors.textSecondary,
    textAlign: 'center',
    marginVertical: spacing.md,
  },
  profileRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  profileItem: {
    marginBottom: spacing.xs,
  },
  profileActions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginTop: spacing.sm,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: spacing.md,
  },
  actions: {
    marginTop: spacing.xl,
    marginBottom: spacing.md,
  },
});
