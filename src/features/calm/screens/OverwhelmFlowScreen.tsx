import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import type { RootStackParamList } from '@app/navigation/types';
import { useProfiles } from '@features/profiles/context/ProfilesContext';
import { speak, speakOptionsForPreferences } from '@services/audio/speech';
import { BigButton, ScreenContainer } from '@shared/components';
import { colors, radius, spacing, typography } from '@shared/theme';

import { ChoiceStep } from '../components/ChoiceStep';
import { OVERWHELM_NEEDS, OVERWHELM_TRIGGERS, buildOverwhelmSentence } from '../data/overwhelmVocabulary';

type Props = NativeStackScreenProps<RootStackParamList, 'CalmOverwhelm'>;

type Step = 'trigger' | 'need' | 'result';

const STEP_ORDER: Step[] = ['trigger', 'need', 'result'];

/**
 * Flujo guiado "Tengo miedo / Estoy saturado": qué te molesta → qué
 * necesitas → frase final. Mismo criterio que `PainFlowScreen`: avanza
 * solo al elegir, "Volver" retrocede un paso, y la frase se dice con un
 * botón explícito (nunca audio por sorpresa).
 */
export function OverwhelmFlowScreen({ navigation }: Props) {
  const { activeProfile } = useProfiles();
  const soundEnabled = activeProfile?.preferences.soundEnabled ?? true;
  const ttsOptions = speakOptionsForPreferences(activeProfile?.preferences);

  const [step, setStep] = useState<Step>('trigger');
  const [triggerId, setTriggerId] = useState<string | null>(null);
  const [needId, setNeedId] = useState<string | null>(null);

  const trigger = OVERWHELM_TRIGGERS.find((item) => item.id === triggerId) ?? null;
  const need = OVERWHELM_NEEDS.find((item) => item.id === needId) ?? null;

  function goBack() {
    const index = STEP_ORDER.indexOf(step);
    if (index <= 0) {
      navigation.goBack();
      return;
    }
    setStep(STEP_ORDER[index - 1]);
  }

  function restart() {
    setTriggerId(null);
    setNeedId(null);
    setStep('trigger');
  }

  function say(text: string) {
    if (soundEnabled) {
      speak(text, ttsOptions);
    }
  }

  return (
    <ScreenContainer scrollable>
      <View style={styles.header}>
        <BigButton label="Volver" variant="ghost" fullWidth={false} onPress={goBack} />
        <Text style={styles.title}>😨 Me siento mal</Text>
      </View>

      {step === 'trigger' ? (
        <ChoiceStep
          question="¿Qué te molesta?"
          options={OVERWHELM_TRIGGERS}
          selectedId={triggerId}
          onSelect={(id) => {
            setTriggerId(id);
            setStep('need');
          }}
        />
      ) : null}

      {step === 'need' ? (
        <ChoiceStep
          question="¿Qué necesitas?"
          options={OVERWHELM_NEEDS}
          selectedId={needId}
          onSelect={(id) => {
            setNeedId(id);
            setStep('result');
          }}
        />
      ) : null}

      {step === 'result' && trigger && need ? (
        <View>
          <View style={styles.resultCard}>
            <Text style={styles.resultText}>{buildOverwhelmSentence(trigger, need)}</Text>
          </View>

          <BigButton
            label="Decirlo en voz alta"
            emoji="🔊"
            onPress={() => say(buildOverwhelmSentence(trigger, need))}
          />
          <View style={styles.spacer} />
          <BigButton label="Necesito ayuda" emoji="🆘" variant="danger" onPress={() => say('Necesito ayuda.')} />
          <View style={styles.spacer} />
          <BigButton label="Empezar de nuevo" variant="secondary" onPress={restart} />
        </View>
      ) : null}
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
  resultCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 2,
    borderColor: colors.lavender,
    padding: spacing.lg,
    marginBottom: spacing.lg,
  },
  resultText: {
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.bold,
    color: colors.textPrimary,
    textAlign: 'center',
  },
  spacer: {
    height: spacing.sm,
  },
});
