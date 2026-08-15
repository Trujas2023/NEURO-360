import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';

import type { RootStackParamList } from '@app/navigation/types';
import { useProfiles } from '@features/profiles/context/ProfilesContext';
import { speak } from '@services/audio/speech';
import { softTap } from '@services/haptics/haptics';
import { BigButton, ScreenContainer } from '@shared/components';
import { colors, radius, spacing, typography } from '@shared/theme';

import { GameFrame } from '../components/GameFrame';
import type { GameFeedback } from '../components/GameFrame';
import { GAME_TILE_COLORS } from '../data/gameContent';
import { useGameSettings } from '../hooks/useGameSettings';
import { recordGameSession } from '../storage/gameStatsRepository';
import { ROUNDS_BY_LENGTH, SEQUENCE_LENGTH_BY_DIFFICULTY } from '../types';

type Props = NativeStackScreenProps<RootStackParamList, 'GameSequence'>;

const TILES = GAME_TILE_COLORS.slice(0, 4);
const TILE_LABELS = ['uno', 'dos', 'tres', 'cuatro'];
const STEP_MS = 800;
const START_DELAY_MS = 500;

function buildSequence(length: number): number[] {
  return Array.from({ length }, () => Math.floor(Math.random() * TILES.length));
}

/**
 * Secuencias: se enciende una serie de fichas y hay que repetirla en el
 * mismo orden. Equivocarse no termina la partida ni resta nada: vuelve a
 * mostrarse la secuencia completa y se intenta otra vez, tantas veces
 * como haga falta.
 */
export function SequenceScreen({ navigation }: Props) {
  const { activeProfile } = useProfiles();
  const { settings, loading } = useGameSettings(activeProfile?.id ?? null);

  const sequenceLength = SEQUENCE_LENGTH_BY_DIFFICULTY[settings.difficulty];
  const totalRounds = ROUNDS_BY_LENGTH[settings.sessionLength];

  const [sequence, setSequence] = useState<number[]>(() => buildSequence(sequenceLength));
  const [phase, setPhase] = useState<'showing' | 'input'>('showing');
  const [highlight, setHighlight] = useState<number | null>(null);
  const [inputIndex, setInputIndex] = useState(0);
  const [roundIndex, setRoundIndex] = useState(0);
  const [feedback, setFeedback] = useState<GameFeedback>('none');
  const [finished, setFinished] = useState(false);

  const soundOn = settings.soundEnabled && (activeProfile?.preferences.soundEnabled ?? true);
  const ttsOptions = {
    rate: activeProfile?.preferences.ttsRate,
    pitch: activeProfile?.preferences.ttsPitch,
  };

  useEffect(() => {
    if (phase !== 'showing' || finished) {
      return;
    }

    let cancelled = false;
    const timers: ReturnType<typeof setTimeout>[] = [];

    sequence.forEach((tile, index) => {
      timers.push(
        setTimeout(() => {
          if (!cancelled) {
            setHighlight(tile);
          }
        }, START_DELAY_MS + index * STEP_MS),
      );
      timers.push(
        setTimeout(
          () => {
            if (!cancelled) {
              setHighlight(null);
            }
          },
          START_DELAY_MS + index * STEP_MS + STEP_MS / 2,
        ),
      );
    });

    timers.push(
      setTimeout(
        () => {
          if (!cancelled) {
            setPhase('input');
            setInputIndex(0);
          }
        },
        START_DELAY_MS + sequence.length * STEP_MS,
      ),
    );

    return () => {
      cancelled = true;
      timers.forEach(clearTimeout);
    };
  }, [phase, sequence, finished]);

  // Registra una partida completada para Estadísticas (Fase 7I); solo
  // vuelve a ejecutarse cuando `finished` cambia de valor.
  useEffect(() => {
    if (finished && activeProfile?.id) {
      recordGameSession(activeProfile.id, 'sequence').catch(() => {});
    }
  }, [finished, activeProfile?.id]);

  function handleTile(tileIndex: number) {
    if (phase !== 'input') {
      return;
    }

    if (sequence[inputIndex] !== tileIndex) {
      // Sin castigo: se vuelve a mostrar la secuencia y se reintenta.
      setFeedback('retry');
      setPhase('showing');
      setInputIndex(0);
      return;
    }

    softTap(settings.hapticsEnabled);
    const nextIndex = inputIndex + 1;

    if (nextIndex < sequence.length) {
      setInputIndex(nextIndex);
      return;
    }

    setFeedback('good');
    if (soundOn) {
      speak('¡Bien!', ttsOptions);
    }

    const nextRound = roundIndex + 1;
    if (nextRound >= totalRounds) {
      setFinished(true);
      return;
    }

    setRoundIndex(nextRound);
    setSequence(buildSequence(sequenceLength));
    setPhase('showing');
    setInputIndex(0);
  }

  function restart() {
    setSequence(buildSequence(sequenceLength));
    setPhase('showing');
    setHighlight(null);
    setInputIndex(0);
    setRoundIndex(0);
    setFeedback('none');
    setFinished(false);
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
      <GameFrame title="🔢 Secuencias" onExit={() => navigation.goBack()}>
        <View style={styles.finished}>
          <Text style={styles.finishedEmoji}>🎉</Text>
          <Text style={styles.finishedTitle}>¡Terminaste!</Text>
          <Text style={styles.finishedSubtitle}>Completaste {totalRounds} secuencias.</Text>
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
      title="🔢 Secuencias"
      onExit={() => navigation.goBack()}
      round={{ current: roundIndex + 1, total: totalRounds }}
      feedback={feedback}
      footer={
        <BigButton
          label="Ver la secuencia otra vez"
          emoji="🔁"
          variant="secondary"
          onPress={() => {
            setPhase('showing');
            setInputIndex(0);
          }}
        />
      }
    >
      <Text style={styles.prompt}>{phase === 'showing' ? 'Mira con atención' : 'Ahora repite el orden'}</Text>

      <View style={styles.grid}>
        {TILES.map((color, index) => {
          const lit = highlight === index;
          return (
            <Pressable
              key={color}
              onPress={() => handleTile(index)}
              disabled={phase !== 'input'}
              accessibilityRole="button"
              accessibilityLabel={`Ficha ${TILE_LABELS[index]}`}
              style={({ pressed }) => [
                styles.tile,
                { backgroundColor: color, opacity: lit ? 1 : pressed ? 0.85 : 0.45 },
                lit && styles.tileLit,
              ]}
            />
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
    marginBottom: spacing.xl,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: spacing.md,
  },
  tile: {
    width: 130,
    height: 130,
    borderRadius: radius.lg,
    borderWidth: 3,
    borderColor: 'transparent',
  },
  tileLit: {
    borderColor: colors.textPrimary,
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
  finishedSubtitle: {
    marginTop: spacing.xs,
    fontSize: typography.sizes.md,
    color: colors.textSecondary,
  },
  finishedActions: {
    marginTop: spacing.xl,
    alignSelf: 'stretch',
  },
  spacer: {
    height: spacing.sm,
  },
});
