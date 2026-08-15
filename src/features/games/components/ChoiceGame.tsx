import type { ReactNode } from 'react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { useProfiles } from '@features/profiles/context/ProfilesContext';
import { softTap } from '@services/haptics/haptics';
import { speak } from '@services/audio/speech';
import { BigButton } from '@shared/components';
import { colors, radius, spacing, typography } from '@shared/theme';

import { GameFrame } from './GameFrame';
import type { GameFeedback } from './GameFrame';
import { recordGameSession } from '../storage/gameStatsRepository';
import { OPTIONS_BY_DIFFICULTY, ROUNDS_BY_LENGTH } from '../types';
import type { GameId, GameSettings } from '../types';

export interface GameChoice {
  id: string;
  /** Se usa como etiqueta accesible y como texto hablado. */
  label: string;
  content: ReactNode;
}

export interface GameRound {
  /** Consigna escrita. */
  prompt: string;
  /** Consigna hablada; suele incluir algo más de contexto que la escrita. */
  spokenPrompt: string;
  /** Visual del objetivo a emparejar, si el juego lo tiene. */
  target?: ReactNode;
  choices: GameChoice[];
  correctId: string;
}

export interface ChoiceGameProps {
  title: string;
  /** Identifica el juego para las estadísticas de Centro Adulto (Fase 7I). */
  gameId: GameId;
  settings: GameSettings;
  /**
   * Debe ser una función estable — definirla a nivel de módulo, no dentro
   * del componente: el motor la usa en callbacks y efectos, y una
   * identidad que cambia en cada render haría avanzar rondas de más.
   */
  makeRound: (optionCount: number) => GameRound;
  onExit: () => void;
}

const ADVANCE_DELAY_MS = 1000;

/**
 * Motor compartido de los juegos de emparejar (colores, formas,
 * emociones, clasificar). Todos tienen la misma estructura —consigna,
 * opciones, elegir— así que comparten una sola implementación de la
 * interacción, y cada juego solo aporta su contenido.
 *
 * Reglas de la interacción, comunes a los cuatro:
 * - Equivocarse no penaliza ni interrumpe: la opción se atenúa, aparece
 *   "Intentemos otra vez" y el niño sigue probando en la misma ronda.
 * - El acierto confirma con voz y vibración suave; el error no vibra,
 *   para que el refuerzo táctil quede asociado solo al logro.
 * - No hay puntaje ni tiempo: solo "ronda X de Y".
 */
export function ChoiceGame({ title, gameId, settings, makeRound, onExit }: ChoiceGameProps) {
  const { activeProfile } = useProfiles();
  const profileId = activeProfile?.id;

  const optionCount = OPTIONS_BY_DIFFICULTY[settings.difficulty];
  const totalRounds = ROUNDS_BY_LENGTH[settings.sessionLength];

  const ttsRate = activeProfile?.preferences.ttsRate ?? 1;
  const ttsPitch = activeProfile?.preferences.ttsPitch ?? 1;
  // Memorizado a propósito: es dependencia del efecto que lee la consigna
  // en voz alta, y un objeto nuevo por render la repetiría sin parar.
  const ttsOptions = useMemo(() => ({ rate: ttsRate, pitch: ttsPitch }), [ttsRate, ttsPitch]);

  const [roundIndex, setRoundIndex] = useState(0);
  const [round, setRound] = useState<GameRound>(() => makeRound(optionCount));
  const [wrongIds, setWrongIds] = useState<string[]>([]);
  const [feedback, setFeedback] = useState<GameFeedback>('none');
  const [pendingAdvance, setPendingAdvance] = useState(false);
  const [finished, setFinished] = useState(false);

  const soundOn = settings.soundEnabled && (activeProfile?.preferences.soundEnabled ?? true);

  useEffect(() => {
    if (!soundOn || finished) {
      return;
    }
    speak(round.spokenPrompt, ttsOptions);
  }, [round, soundOn, finished, ttsOptions]);

  // Registra una partida completada para Estadísticas (Fase 7I). Depende
  // de `finished` para sumar una sola vez por partida, no en cada render
  // mientras la pantalla de "¡Terminaste!" sigue montada.
  useEffect(() => {
    if (finished && profileId) {
      recordGameSession(profileId, gameId).catch(() => {});
    }
  }, [finished, profileId, gameId]);

  const advance = useCallback(() => {
    setPendingAdvance(false);
    setFeedback('none');
    setWrongIds([]);

    setRoundIndex((current) => {
      const next = current + 1;
      if (next >= totalRounds) {
        setFinished(true);
        return current;
      }
      setRound(makeRound(optionCount));
      return next;
    });
  }, [makeRound, optionCount, totalRounds]);

  useEffect(() => {
    if (!pendingAdvance) {
      return;
    }
    const timer = setTimeout(advance, ADVANCE_DELAY_MS);
    return () => clearTimeout(timer);
  }, [pendingAdvance, advance]);

  function handleChoice(choice: GameChoice) {
    if (pendingAdvance) {
      return;
    }

    if (choice.id === round.correctId) {
      softTap(settings.hapticsEnabled);
      setFeedback('good');
      setPendingAdvance(true);
      if (soundOn) {
        speak('¡Bien!', ttsOptions);
      }
      return;
    }

    // Sin vibración ni sonido de error: el refuerzo táctil se reserva
    // para el acierto, y equivocarse no produce ningún castigo sensorial.
    setFeedback('retry');
    setWrongIds((current) => (current.includes(choice.id) ? current : [...current, choice.id]));
  }

  function restart() {
    setRoundIndex(0);
    setRound(makeRound(optionCount));
    setWrongIds([]);
    setFeedback('none');
    setPendingAdvance(false);
    setFinished(false);
  }

  if (finished) {
    return (
      <GameFrame title={title} onExit={onExit}>
        <View style={styles.finished}>
          <Text style={styles.finishedEmoji}>🎉</Text>
          <Text style={styles.finishedTitle}>¡Terminaste!</Text>
          <Text style={styles.finishedSubtitle}>Jugaste {totalRounds} rondas.</Text>

          <View style={styles.finishedActions}>
            <BigButton label="Jugar otra vez" emoji="🔁" onPress={restart} />
            <View style={styles.spacer} />
            <BigButton label="Terminar" variant="secondary" onPress={onExit} />
          </View>
        </View>
      </GameFrame>
    );
  }

  return (
    <GameFrame
      title={title}
      onExit={onExit}
      round={{ current: roundIndex + 1, total: totalRounds }}
      feedback={feedback}
      footer={
        <BigButton
          label="Escuchar de nuevo"
          emoji="🔊"
          variant="secondary"
          onPress={() => speak(round.spokenPrompt, ttsOptions)}
        />
      }
    >
      <Text style={styles.prompt}>{round.prompt}</Text>

      {round.target ? <View style={styles.target}>{round.target}</View> : null}

      <View style={styles.choices}>
        {round.choices.map((choice) => {
          const isWrong = wrongIds.includes(choice.id);
          return (
            <Pressable
              key={choice.id}
              onPress={() => handleChoice(choice)}
              accessibilityRole="button"
              accessibilityLabel={choice.label}
              style={({ pressed }) => [
                styles.choice,
                isWrong && styles.choiceWrong,
                { opacity: pressed ? 0.8 : isWrong ? 0.45 : 1 },
              ]}
            >
              {choice.content}
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
    marginBottom: spacing.md,
  },
  target: {
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  choices: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: spacing.md,
  },
  choice: {
    width: 140,
    minHeight: 140,
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 2,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.sm,
  },
  choiceWrong: {
    borderColor: colors.border,
    backgroundColor: colors.background,
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
