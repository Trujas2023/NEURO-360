import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text } from 'react-native';

import type { RootStackParamList } from '@app/navigation/types';
import { PinPad } from '@features/parent-mode/components/PinPad';
import { hasAdultPin, setAdultPin, verifyAdultPin } from '@services/storage';
import { BigButton, ScreenContainer } from '@shared/components';
import { ADULT_PIN_LENGTH } from '@shared/constants/profiles';
import { colors, spacing, typography } from '@shared/theme';

type Props = NativeStackScreenProps<RootStackParamList, 'PinGate'>;

type Stage = 'checking' | 'enter' | 'create-step1' | 'create-step2';

export function PinGateScreen({ navigation }: Props) {
  const [stage, setStage] = useState<Stage>('checking');
  const [value, setValue] = useState('');
  const [firstPin, setFirstPin] = useState('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    hasAdultPin().then((exists) => {
      if (isMounted) {
        setStage(exists ? 'enter' : 'create-step1');
      }
    });
    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    if (value.length < ADULT_PIN_LENGTH) {
      return;
    }

    (async () => {
      if (stage === 'enter') {
        const valid = await verifyAdultPin(value);
        if (valid) {
          navigation.replace('AdultHome');
        } else {
          setError('PIN incorrecto. Inténtalo de nuevo.');
          setValue('');
        }
      } else if (stage === 'create-step1') {
        setFirstPin(value);
        setValue('');
        setError(null);
        setStage('create-step2');
      } else if (stage === 'create-step2') {
        if (value === firstPin) {
          await setAdultPin(value);
          navigation.replace('AdultHome');
        } else {
          setError('Los PIN no coinciden. Vuelve a crearlo.');
          setValue('');
          setFirstPin('');
          setStage('create-step1');
        }
      }
    })();
  }, [value, stage, firstPin, navigation]);

  if (stage === 'checking') {
    return (
      <ScreenContainer centered>
        <ActivityIndicator size="large" color={colors.primary} />
      </ScreenContainer>
    );
  }

  const title =
    stage === 'enter'
      ? 'Modo Adulto'
      : stage === 'create-step1'
        ? 'Crea un PIN de adulto'
        : 'Repite el PIN';
  const subtitle =
    stage === 'enter'
      ? 'Ingresa el PIN para acceder a la configuración.'
      : stage === 'create-step1'
        ? 'Este PIN protegerá el Modo Adulto.'
        : 'Ingresa el mismo PIN otra vez para confirmarlo.';

  return (
    <ScreenContainer centered>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.subtitle}>{subtitle}</Text>
      {error ? <Text style={styles.error}>{error}</Text> : null}

      <PinPad value={value} onChange={setValue} length={ADULT_PIN_LENGTH} />

      <BigButton label="Volver" variant="ghost" fullWidth={false} onPress={() => navigation.goBack()} />
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
    marginBottom: spacing.lg,
    fontSize: typography.sizes.md,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  error: {
    marginBottom: spacing.md,
    fontSize: typography.sizes.md,
    color: colors.danger,
    textAlign: 'center',
  },
});
