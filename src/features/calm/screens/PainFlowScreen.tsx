import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import type { RootStackParamList } from '@app/navigation/types';
import { useProfiles } from '@features/profiles/context/ProfilesContext';
import { speak, speakOptionsForPreferences } from '@services/audio/speech';
import { BigButton, ScreenContainer } from '@shared/components';
import { colors, radius, spacing, typography } from '@shared/theme';

import { BodySilhouette } from '../components/BodySilhouette';
import { ChoiceStep } from '../components/ChoiceStep';
import {
  PAIN_INTENSITIES,
  PAIN_LOCATIONS,
  PAIN_QUALITIES,
  buildPainSentence,
} from '../data/painVocabulary';
import type { BodyRegion } from '../data/painVocabulary';

type Props = NativeStackScreenProps<RootStackParamList, 'CalmPain'>;

type Step = 'location' | 'intensity' | 'quality' | 'result';

const STEP_ORDER: Step[] = ['location', 'intensity', 'quality', 'result'];

/**
 * Flujo guiado "Me duele": dónde → cuánto → cómo se siente → frase final.
 * Cada elección avanza sola (en una crisis, cada toque de más cuesta), y
 * "Volver" retrocede un paso en vez de salir, salvo en el primero.
 *
 * La frase no se reproduce sola al llegar al resultado: se dice con un
 * botón explícito, igual que la barra de frase del comunicador. Audio
 * inesperado es justo lo que hay que evitar con un niño ya desbordado.
 */
export function PainFlowScreen({ navigation }: Props) {
  const { activeProfile } = useProfiles();
  const soundEnabled = activeProfile?.preferences.soundEnabled ?? true;
  const ttsOptions = speakOptionsForPreferences(activeProfile?.preferences);

  const [step, setStep] = useState<Step>('location');
  const [locationId, setLocationId] = useState<string | null>(null);
  const [intensityId, setIntensityId] = useState<string | null>(null);
  const [qualityId, setQualityId] = useState<string | null>(null);

  const location = PAIN_LOCATIONS.find((item) => item.id === locationId) ?? null;
  const intensity = PAIN_INTENSITIES.find((item) => item.id === intensityId) ?? null;
  const quality = PAIN_QUALITIES.find((item) => item.id === qualityId) ?? null;

  function goBack() {
    const index = STEP_ORDER.indexOf(step);
    if (index <= 0) {
      navigation.goBack();
      return;
    }
    setStep(STEP_ORDER[index - 1]);
  }

  function restart() {
    setLocationId(null);
    setIntensityId(null);
    setQualityId(null);
    setStep('location');
  }

  function say(text: string) {
    if (soundEnabled) {
      speak(text, ttsOptions);
    }
  }

  function selectRegion(region: BodyRegion) {
    const match = PAIN_LOCATIONS.find((item) => item.bodyRegion === region);
    if (match) {
      setLocationId(match.id);
      setStep('intensity');
    }
  }

  return (
    <ScreenContainer scrollable>
      <View style={styles.header}>
        <BigButton label="Volver" variant="ghost" fullWidth={false} onPress={goBack} />
        <Text style={styles.title}>🤕 Me duele</Text>
      </View>

      {step === 'location' ? (
        <ChoiceStep
          question="¿Dónde te duele?"
          options={PAIN_LOCATIONS}
          selectedId={locationId}
          onSelect={(id) => {
            setLocationId(id);
            setStep('intensity');
          }}
        >
          <BodySilhouette selectedRegion={location?.bodyRegion ?? null} onSelectRegion={selectRegion} />
        </ChoiceStep>
      ) : null}

      {step === 'intensity' ? (
        <ChoiceStep
          question="¿Cuánto te duele?"
          options={PAIN_INTENSITIES}
          selectedId={intensityId}
          onSelect={(id) => {
            setIntensityId(id);
            setStep('quality');
          }}
        />
      ) : null}

      {step === 'quality' ? (
        <ChoiceStep
          question="¿Cómo se siente?"
          options={PAIN_QUALITIES}
          selectedId={qualityId}
          onSelect={(id) => {
            setQualityId(id);
            setStep('result');
          }}
        />
      ) : null}

      {step === 'result' && location && intensity ? (
        <View>
          <View style={styles.resultCard}>
            <Text style={styles.resultText}>{buildPainSentence(location, intensity, quality)}</Text>
          </View>

          <BigButton
            label="Decirlo en voz alta"
            emoji="🔊"
            onPress={() => say(buildPainSentence(location, intensity, quality))}
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
    borderColor: colors.danger,
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
