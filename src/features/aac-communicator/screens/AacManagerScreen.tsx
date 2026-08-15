import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useCallback } from 'react';
import { ActionSheetIOS, ActivityIndicator, Alert, Platform, Pressable, StyleSheet, Text, View } from 'react-native';

import type { RootStackParamList } from '@app/navigation/types';
import { useProfiles } from '@features/profiles/context/ProfilesContext';
import { BigButton, ScreenContainer } from '@shared/components';
import { DEFAULT_PROFILE_PREFERENCES } from '@shared/constants/profiles';
import { colors, radius, spacing, touchTargets, typography } from '@shared/theme';

import { AacCardVisual } from '../components/AacCardVisual';
import { ASSIGNABLE_CATEGORIES } from '../constants/categories';
import { useAacCards } from '../hooks/useAacCards';
import type { AacCard } from '../types';

type Props = NativeStackScreenProps<RootStackParamList, 'AacManager'>;

/** Modo Adulto: alta, edición, eliminación, favoritos y orden de las tarjetas de un perfil. */
export function AacManagerScreen({ route, navigation }: Props) {
  const { profileId } = route.params;
  const { profiles } = useProfiles();
  const profile = profiles.find((item) => item.id === profileId);
  const confirmBeforeDelete = profile?.preferences.confirmBeforeDelete ?? DEFAULT_PROFILE_PREFERENCES.confirmBeforeDelete;
  const { cards, loading, reload, deleteCard, toggleFavorite, moveCard } = useAacCards(profileId);

  useFocusEffect(
    useCallback(() => {
      reload();
    }, [reload]),
  );

  function confirmDelete(card: AacCard) {
    if (!confirmBeforeDelete) {
      deleteCard(card.id);
      return;
    }
    Alert.alert('Eliminar tarjeta', `¿Eliminar "${card.label}"? Esta acción no se puede deshacer.`, [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Eliminar', style: 'destructive', onPress: () => deleteCard(card.id) },
    ]);
  }

  /**
   * Antes eran 5 controles siempre visibles por tarjeta (favorito, mover
   * arriba, mover abajo, Editar, Eliminar) — fila densa señalada en
   * `docs/V7_PRODUCT_AUDIT.md` §6.9. Favorito queda como toque único (es
   * la acción más frecuente); el resto vive en este menú, igual que el
   * patrón ya usado en `AdultCenterScreen` para "Mi Voz".
   */
  function openMoreActions(card: AacCard, index: number, total: number) {
    const options: { label: string; destructive?: boolean; onPress: () => void }[] = [];
    if (index > 0) {
      options.push({ label: 'Mover arriba', onPress: () => moveCard(card.id, 'up') });
    }
    if (index < total - 1) {
      options.push({ label: 'Mover abajo', onPress: () => moveCard(card.id, 'down') });
    }
    options.push({
      label: 'Editar',
      onPress: () => navigation.navigate('AacCardForm', { profileId, cardId: card.id }),
    });
    options.push({ label: 'Eliminar', destructive: true, onPress: () => confirmDelete(card) });

    if (Platform.OS === 'ios') {
      ActionSheetIOS.showActionSheetWithOptions(
        {
          title: card.label,
          options: [...options.map((option) => option.label), 'Cancelar'],
          destructiveButtonIndex: options.findIndex((option) => option.destructive),
          cancelButtonIndex: options.length,
        },
        (buttonIndex) => {
          options[buttonIndex]?.onPress();
        },
      );
      return;
    }

    Alert.alert(card.label, undefined, [
      ...options.map((option) => ({
        text: option.label,
        style: option.destructive ? ('destructive' as const) : undefined,
        onPress: option.onPress,
      })),
      { text: 'Cancelar', style: 'cancel' as const },
    ]);
  }

  return (
    <ScreenContainer scrollable>
      <Text style={styles.title}>Comunicador AAC</Text>
      <Text style={styles.subtitle}>Tarjetas del perfil</Text>

      {loading ? (
        <ActivityIndicator size="large" color={colors.primary} />
      ) : cards.length === 0 ? (
        <Text style={styles.empty}>Todavía no hay tarjetas para este perfil.</Text>
      ) : (
        ASSIGNABLE_CATEGORIES.map((category) => {
          const categoryCards = cards
            .filter((card) => card.categoryId === category.id)
            .sort((a, b) => a.order - b.order);
          if (categoryCards.length === 0) {
            return null;
          }
          return (
            <View key={category.id} style={styles.section}>
              <Text style={styles.sectionTitle}>
                {category.emoji} {category.label}
              </Text>
              {categoryCards.map((card, index) => (
                <View key={card.id} style={styles.row}>
                  <AacCardVisual emoji={card.emoji} imageUri={card.imageUri} size={40} />
                  <Text style={styles.rowLabel} numberOfLines={1}>
                    {card.label}
                  </Text>
                  <View style={styles.rowActions}>
                    <IconButton
                      label={card.isFavorite ? 'Quitar de favoritos' : 'Marcar como favorito'}
                      icon={card.isFavorite ? 'star' : 'star-outline'}
                      onPress={() => toggleFavorite(card.id)}
                    />
                    <IconButton
                      label={`Más acciones para "${card.label}"`}
                      icon="ellipsis-vertical"
                      onPress={() => openMoreActions(card, index, categoryCards.length)}
                    />
                  </View>
                </View>
              ))}
            </View>
          );
        })
      )}

      <View style={styles.actions}>
        <BigButton
          label="Crear tarjeta"
          emoji="➕"
          onPress={() => navigation.navigate('AacCardForm', { profileId })}
        />
        <View style={styles.spacer} />
        <BigButton label="Volver" variant="ghost" onPress={() => navigation.goBack()} />
      </View>
    </ScreenContainer>
  );
}

function IconButton({
  label,
  icon,
  onPress,
}: {
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={label}
      style={({ pressed }) => [styles.iconButton, { opacity: pressed ? 0.7 : 1 }]}
    >
      <Ionicons name={icon} size={22} color={colors.textPrimary} />
    </Pressable>
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
  section: {
    marginBottom: spacing.md,
  },
  sectionTitle: {
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.bold,
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.sm,
    marginBottom: spacing.xs,
  },
  rowLabel: {
    flex: 1,
    marginLeft: spacing.sm,
    fontSize: typography.sizes.md,
    color: colors.textPrimary,
  },
  rowActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginLeft: spacing.sm,
  },
  iconButton: {
    width: touchTargets.minimum,
    height: touchTargets.minimum,
    borderRadius: radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border,
  },
  actions: {
    marginTop: spacing.lg,
  },
  spacer: {
    height: spacing.sm,
  },
});
