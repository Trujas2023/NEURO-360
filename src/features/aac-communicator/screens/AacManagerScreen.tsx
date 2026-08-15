import { useFocusEffect } from '@react-navigation/native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useCallback } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import type { RootStackParamList } from '@app/navigation/types';
import { useProfiles } from '@features/profiles/context/ProfilesContext';
import {
  BigButton,
  EmptyState,
  IconButton,
  ScreenContainer,
  useConfirmDialog,
} from '@shared/components';
import { DEFAULT_PROFILE_PREFERENCES } from '@shared/constants/profiles';
import { useReduceMotion } from '@shared/hooks';
import { colors, radius, spacing, typography } from '@shared/theme';

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
  const confirmBeforeDelete =
    profile?.preferences.confirmBeforeDelete ?? DEFAULT_PROFILE_PREFERENCES.confirmBeforeDelete;
  const { cards, loading, reload, deleteCard, toggleFavorite, moveCard } = useAacCards(profileId);
  const reduceMotion = useReduceMotion();
  const { confirm, dialog } = useConfirmDialog(reduceMotion);

  useFocusEffect(
    useCallback(() => {
      reload();
    }, [reload]),
  );

  async function confirmDelete(card: AacCard) {
    if (!confirmBeforeDelete) {
      deleteCard(card.id);
      return;
    }
    const ok = await confirm({
      title: 'Eliminar tarjeta',
      message: `¿Eliminar "${card.label}"? Esta acción no se puede deshacer.`,
      confirmLabel: 'Eliminar',
      destructive: true,
    });
    if (ok) {
      deleteCard(card.id);
    }
  }

  return (
    <ScreenContainer scrollable loading={loading} loadingLabel="Cargando tarjetas…">
      <Text style={styles.title}>Comunicador AAC</Text>
      <Text style={styles.subtitle}>Tarjetas del perfil</Text>

      {cards.length === 0 ? (
        <EmptyState emoji="🗂️" title="Todavía no hay tarjetas para este perfil." />
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
                    <Pressable
                      onPress={() => toggleFavorite(card.id)}
                      accessibilityRole="button"
                      accessibilityLabel={
                        card.isFavorite ? 'Quitar de favoritos' : 'Marcar como favorito'
                      }
                      style={({ pressed }) => [
                        styles.favoriteButton,
                        { opacity: pressed ? 0.7 : 1 },
                      ]}
                    >
                      <Text style={styles.favoriteButtonText}>{card.isFavorite ? '⭐' : '☆'}</Text>
                    </Pressable>
                    <IconButton
                      label="Mover arriba"
                      icon="chevron-up"
                      onPress={() => moveCard(card.id, 'up')}
                      disabled={index === 0}
                    />
                    <IconButton
                      label="Mover abajo"
                      icon="chevron-down"
                      onPress={() => moveCard(card.id, 'down')}
                      disabled={index === categoryCards.length - 1}
                    />
                    <View style={styles.smallButton}>
                      <BigButton
                        label="Editar"
                        variant="secondary"
                        fullWidth={false}
                        onPress={() =>
                          navigation.navigate('AacCardForm', { profileId, cardId: card.id })
                        }
                      />
                    </View>
                    <View style={styles.smallButton}>
                      <BigButton
                        label="Eliminar"
                        variant="danger"
                        fullWidth={false}
                        onPress={() => confirmDelete(card)}
                      />
                    </View>
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

      {dialog}
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
    flexWrap: 'wrap',
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
    marginTop: spacing.xs,
    width: '100%',
    justifyContent: 'flex-end',
  },
  favoriteButton: {
    width: 40,
    height: 40,
    borderRadius: radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border,
  },
  favoriteButtonText: {
    fontSize: typography.sizes.md,
  },
  smallButton: {
    marginLeft: spacing.xs,
  },
  actions: {
    marginTop: spacing.lg,
  },
  spacer: {
    height: spacing.sm,
  },
});
