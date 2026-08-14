import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';

import type { RootStackParamList } from '@app/navigation/types';
import { useProfiles } from '@features/profiles/context/ProfilesContext';
import { speak } from '@services/audio/speech';
import { softTap } from '@services/haptics/haptics';
import { BigButton, ScreenContainer } from '@shared/components';
import { colors, radius, spacing, typography } from '@shared/theme';
import { createId } from '@shared/utils/id';

import { GameFrame } from '../components/GameFrame';
import { ShapeGlyph } from '../components/ShapeGlyph';
import { GAME_SHAPES, GAME_TILE_COLORS, pickRandom, shuffle } from '../data/gameContent';
import type { ShapeKind } from '../data/gameContent';
import { useGameSettings } from '../hooks/useGameSettings';
import { MEMORY_PAIRS_BY_DIFFICULTY } from '../types';

type Props = NativeStackScreenProps<RootStackParamList, 'GameMemory'>;

interface Card {
  id: string;
  pairId: string;
  shape: ShapeKind;
  color: string;
  matched: boolean;
}

const FLIP_BACK_MS = 900;

function buildDeck(pairCount: number): Card[] {
  const shapes = pickRandom(GAME_SHAPES, pairCount);
  const cards = shapes.flatMap((shape, index) => {
    const color = GAME_TILE_COLORS[index % GAME_TILE_COLORS.length];
    return [
      { id: createId(), pairId: shape.id, shape: shape.id, color, matched: false },
      { id: createId(), pairId: shape.id, shape: shape.id, color, matched: false },
    ];
  });
  return shuffle(cards);
}

/**
 * Memoria visual: encontrar las parejas. Destapar dos cartas distintas no
 * es un error sino parte del juego, así que no muestra "intentemos otra
 * vez" ni ningún aviso: simplemente se vuelven a tapar. El refuerzo
 * aparece solo cuando hay pareja.
 */
export function MemoryScreen({ navigation }: Props) {
  const { activeProfile } = useProfiles();
  const { settings, loading } = useGameSettings(activeProfile?.id ?? null);
  const pairCount = MEMORY_PAIRS_BY_DIFFICULTY[settings.difficulty];

  const [cards, setCards] = useState<Card[]>(() => buildDeck(pairCount));
  const [flippedIds, setFlippedIds] = useState<string[]>([]);
  const [awaitingFlipBack, setAwaitingFlipBack] = useState(false);
  const [feedback, setFeedback] = useState<'none' | 'good'>('none');

  const soundOn = settings.soundEnabled && (activeProfile?.preferences.soundEnabled ?? true);
  const matchedCount = cards.filter((card) => card.matched).length / 2;
  const finished = cards.length > 0 && matchedCount === pairCount;

  const resetFlipped = useCallback(() => {
    setFlippedIds([]);
    setAwaitingFlipBack(false);
  }, []);

  useEffect(() => {
    if (!awaitingFlipBack) {
      return;
    }
    const timer = setTimeout(resetFlipped, FLIP_BACK_MS);
    return () => clearTimeout(timer);
  }, [awaitingFlipBack, resetFlipped]);

  function restart() {
    setCards(buildDeck(pairCount));
    setFlippedIds([]);
    setAwaitingFlipBack(false);
    setFeedback('none');
  }

  function flipCard(card: Card) {
    if (awaitingFlipBack || card.matched || flippedIds.includes(card.id)) {
      return;
    }

    const nextFlipped = [...flippedIds, card.id];

    if (nextFlipped.length < 2) {
      setFlippedIds(nextFlipped);
      setFeedback('none');
      return;
    }

    const first = cards.find((item) => item.id === nextFlipped[0]);
    const isPair = first?.pairId === card.pairId;

    if (isPair) {
      softTap(settings.hapticsEnabled);
      setFeedback('good');
      if (soundOn) {
        speak('¡Bien!', { rate: activeProfile?.preferences.ttsRate, pitch: activeProfile?.preferences.ttsPitch });
      }
      setCards((current) =>
        current.map((item) => (item.pairId === card.pairId ? { ...item, matched: true } : item)),
      );
      setFlippedIds([]);
      return;
    }

    setFlippedIds(nextFlipped);
    setAwaitingFlipBack(true);
  }

  if (loading) {
    return (
      <ScreenContainer centered>
        <ActivityIndicator size="large" color={colors.primary} />
      </ScreenContainer>
    );
  }

  if (finished) {
    return (
      <GameFrame title="🧠 Memoria" onExit={() => navigation.goBack()}>
        <View style={styles.finished}>
          <Text style={styles.finishedEmoji}>🎉</Text>
          <Text style={styles.finishedTitle}>¡Encontraste todas!</Text>
          <View style={styles.finishedActions}>
            <BigButton label="Jugar otra vez" emoji="🔁" onPress={restart} />
            <View style={styles.spacer} />
            <BigButton label="Terminar" variant="secondary" onPress={() => navigation.goBack()} />
          </View>
        </View>
      </GameFrame>
    );
  }

  return (
    <GameFrame
      title="🧠 Memoria"
      onExit={() => navigation.goBack()}
      round={{ current: matchedCount, total: pairCount }}
      feedback={feedback === 'good' ? 'good' : 'none'}
    >
      <Text style={styles.prompt}>Encuentra las parejas</Text>

      <View style={styles.grid}>
        {cards.map((card) => {
          const revealed = card.matched || flippedIds.includes(card.id);
          return (
            <Pressable
              key={card.id}
              onPress={() => flipCard(card)}
              accessibilityRole="button"
              accessibilityLabel={revealed ? `Carta ${card.shape}` : 'Carta tapada'}
              accessibilityState={{ selected: revealed }}
              style={({ pressed }) => [
                styles.card,
                revealed ? styles.cardUp : styles.cardDown,
                card.matched && styles.cardMatched,
                { opacity: pressed ? 0.85 : 1 },
              ]}
            >
              {revealed ? <ShapeGlyph shape={card.shape} color={card.color} size={56} /> : null}
            </Pressable>
          );
        })}
      </View>
    </GameFrame>
  );
}

const styles = StyleSheet.create({
  prompt: {
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.bold,
    color: colors.textPrimary,
    textAlign: 'center',
    marginBottom: spacing.lg,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: spacing.md,
  },
  card: {
    width: 92,
    height: 92,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
  },
  cardDown: {
    backgroundColor: colors.border,
    borderColor: colors.border,
  },
  cardUp: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
  },
  cardMatched: {
    borderColor: colors.success,
  },
  finished: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  finishedEmoji: {
    fontSize: 64,
  },
  finishedTitle: {
    marginTop: spacing.sm,
    fontSize: typography.sizes.xl,
    fontWeight: typography.weights.bold,
    color: colors.textPrimary,
  },
  finishedActions: {
    marginTop: spacing.xl,
    alignSelf: 'stretch',
  },
  spacer: {
    height: spacing.sm,
  },
});
