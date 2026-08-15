import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useState } from 'react';
import { Alert, StyleSheet, Text, View } from 'react-native';

import type { RootStackParamList } from '@app/navigation/types';
import { exportBackup, pickBackupFile, restoreBackup } from '@services/backup/backupService';
import { BigButton, ScreenContainer } from '@shared/components';
import { colors, radius, spacing, typography } from '@shared/theme';

type Props = NativeStackScreenProps<RootStackParamList, 'Backup'>;

/**
 * Respaldo (Fase 7H): exportar/importar todo lo que hay en el
 * dispositivo a un único archivo JSON. Global, no depende de qué perfil
 * esté seleccionado en Centro Adulto — respalda todos los perfiles a la
 * vez. Nunca sube nada a ningún servidor: el archivo se guarda donde el
 * adulto elija con el selector nativo de Android.
 */
export function BackupScreen({ navigation }: Props) {
  const [exporting, setExporting] = useState(false);
  const [restoring, setRestoring] = useState(false);

  async function handleExport() {
    setExporting(true);
    try {
      const { shared } = await exportBackup();
      if (!shared) {
        Alert.alert(
          'Respaldo creado',
          'No se encontró ninguna app para compartir/guardar el archivo en este dispositivo.',
        );
      }
    } catch {
      Alert.alert('No se pudo crear el respaldo', 'Intenta de nuevo.');
    } finally {
      setExporting(false);
    }
  }

  async function handleImport() {
    setRestoring(true);
    try {
      const backup = await pickBackupFile();
      if (!backup) {
        return;
      }
      setRestoring(false);
      Alert.alert(
        'Restaurar respaldo',
        `Este archivo tiene ${backup.profiles.length} perfil(es). Restaurarlo reemplaza TODOS los datos actuales del dispositivo (perfiles, tarjetas, rutinas, ajustes). Esta acción no se puede deshacer, salvo que tengas otro respaldo. ¿Continuar?`,
        [
          { text: 'Cancelar', style: 'cancel' },
          {
            text: 'Restaurar',
            style: 'destructive',
            onPress: async () => {
              setRestoring(true);
              try {
                await restoreBackup(backup);
                Alert.alert(
                  'Respaldo restaurado',
                  'Cierra la app por completo y vuelve a abrirla para ver los datos restaurados.',
                );
              } catch {
                Alert.alert('No se pudo restaurar el respaldo', 'Intenta de nuevo.');
              } finally {
                setRestoring(false);
              }
            },
          },
        ],
      );
    } catch {
      Alert.alert('No se pudo leer el archivo', 'Elige un archivo de respaldo válido de esta app (.json).');
      setRestoring(false);
    }
  }

  return (
    <ScreenContainer scrollable>
      <View style={styles.header}>
        <BigButton label="Volver" variant="ghost" fullWidth={false} onPress={() => navigation.goBack()} />
        <Text style={styles.title}>💾 Respaldo</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardText}>
          Guarda una copia de todos los perfiles, tarjetas de Mi Voz, frases guardadas, rutinas de Mi Día y
          ajustes de Mundo Sensorial/Juegos en un solo archivo. Nunca se sube a internet: eliges tú dónde
          guardarlo (el teléfono, una nube personal, etc.).
        </Text>
        <Text style={styles.cardText}>
          No incluye las grabaciones de voz de las tarjetas ni el PIN de adulto.
        </Text>
      </View>

      <BigButton label="Exportar respaldo" emoji="⬆️" onPress={handleExport} loading={exporting} />
      <View style={styles.spacer} />
      <BigButton
        label="Restaurar desde un respaldo"
        emoji="⬇️"
        variant="secondary"
        onPress={handleImport}
        loading={restoring}
      />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  header: {
    marginBottom: spacing.lg,
  },
  title: {
    marginTop: spacing.sm,
    fontSize: typography.sizes.xl,
    fontWeight: typography.weights.bold,
    color: colors.textPrimary,
    textAlign: 'center',
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
    marginBottom: spacing.lg,
    gap: spacing.sm,
  },
  cardText: {
    fontSize: typography.sizes.md,
    color: colors.textPrimary,
  },
  spacer: {
    height: spacing.sm,
  },
});
