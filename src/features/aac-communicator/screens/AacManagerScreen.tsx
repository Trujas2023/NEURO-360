import { useFocusEffect } from '@react-navigation/native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useCallback } from 'react';
import { ActivityIndicator, Alert, Pressable, StyleSheet, Text, View } from 'react-native';

import type { RootStackParamList } from '@app/navigation/types';
import { BigButton, ScreenContainer } from '@shared/components';
import { colors, radius, spacing, typography } from '@shared/theme';

import { AacCardVisual } from '../components/AacCardVisual';
import { ASSIGNABLE_CATEGORIES } from '../constants/categories';
import { useAacCards } from '../hooks/useAacCards';
import type { AacCard } from '../types';

type Props = NativeStackScreenProps<RootStackParamList, 'AacManager'>;

/** Modo Adulto: alta, edición, eliminación, favoritos y orden de las tarjetas de un perfil. */
export function AacManagerScreen({ route, navigation }: Props) {
  const { profileId } = route.params;
  const { cards, loading, reload, deleteCard, toggleFavorite, moveCard } = useAacCards(profileId);

  useFocusEffect(
    useCallback(() => {
      reload();
    }, [reload]),
  );

  function confirmDelete(card: AacCard) {
    Alert.alert('Eliminar tarjeta', `¿Eliminar "${card.label}"? Esta acción no se puede deshacer.`, [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Eliminar', style: 'destructive', onPress: () => deleteCard(card.id) },
    ]);
  }

  const mostUsed = cards
    .filter((card) => card.useCount > 0)
    .sort((a, b) => b.useCount - a.useCount)
    .slice(0, 5);

  return (
    <ScreenContainer scrollable>
      <Text style={styles.title}>Comunicador AAC</Text>
      <Text style={styles.subtitle}>Tarjetas del perfil</Text>

      {mostUsed.length > 0 ? (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>📊 Más utilizados</Text>
          {mostUsed.map((card) => (
            <View key={card.id} style={styles.usageRow}>
              <Text style={styles.usageLabel} numberOfLines={1}>
                {card.emoji} {card.label}
              </Text>
              <Text style={styles.usageCount}>
                {card.useCount} {card.useCount === 1 ? 'uso' : 'usos'}
              </Text>
            </View>
          ))}
        </View>
      ) : null}

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
                      icon={card.isFavorite ? '⭐' : '☆'}
                      onPress={() => toggleFavorite(card.id)}
                    />
                    <IconButton
                      label="Mover arriba"
                      icon="↑"
                      onPress={() => moveCard(card.id, 'up')}
                      disabled={index === 0}
                    />
                    <IconButton
                      label="Mover abajo"
                      icon="↓"
                      onPress={() => moveCard(card.id, 'down')}
                      disabled={index === categoryCards.length - 1}
                    />
                    <View style={styles.smallButton}>
                      <BigButton
                        label="Editar"
                        variant="secondary"
                        fullWidth={false}
                        onPress={() => navigation.navigate('AacCardForm', { profileId, cardId: card.id })}
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
    </ScreenContainer>
  );
}

function IconButton({
  label,
  icon,
  onPress,
  disabled = false,
}: {
  label: string;
  icon: string;
  onPress: () => void;
  disabled?: boolean;
}) {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      accessibilityRole="button"
      accessibilityLabel={label}
      style={({ pressed }) => [
        styles.iconButton,
        { opacity: disabled ? 0.3 : pressed ? 0.7 : 1 },
      ]}
    >
      <Text style={styles.iconButtonText}>{icon}</Text>
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
    flexWrap: 'wrap',
  },
  rowLabel: {
    flex: 1,
    marginLeft: spacing.sm,
    fontSize: typography.sizes.md,
    color: colors.textPrimary,
  },
  usageRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.sm,
    marginBottom: spacing.xs,
  },
  usageLabel: {
    flex: 1,
    fontSize: typography.sizes.md,
    color: colors.textPrimary,
  },
  usageCount: {
    fontSize: typography.sizes.sm,
    color: colors.textSecondary,
    fontWeight: typography.weights.medium,
  },
  rowActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginTop: spacing.xs,
    width: '100%',
    justifyContent: 'flex-end',
  },
  iconButton: {
    width: 48,
    height: 48,
    borderRadius: radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border,
  },
  iconButtonText: {
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
