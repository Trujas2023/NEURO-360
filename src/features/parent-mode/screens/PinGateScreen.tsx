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

/** Intentos fallidos consecutivos permitidos antes de una pausa (R2: cierra el hallazgo "sin bloqueo" de la auditoría de Centro de Adultos). */
const MAX_ATTEMPTS = 5;
/** Duración de la pausa tras agotar los intentos. Se reinicia al cerrar/reabrir la app (barrera parental, no un mecanismo de seguridad persistente — ver services/storage/pinRepository.ts). */
const LOCKOUT_MS = 30_000;

export function PinGateScreen({ navigation }: Props) {
  const [stage, setStage] = useState<Stage>('checking');
  const [value, setValue] = useState('');
  const [firstPin, setFirstPin] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [failedAttempts, setFailedAttempts] = useState(0);
  const [lockedUntil, setLockedUntil] = useState<number | null>(null);
  const [remainingSeconds, setRemainingSeconds] = useState(0);

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

  // Cuenta regresiva de la pausa por intentos fallidos.
  useEffect(() => {
    if (!lockedUntil) {
      return;
    }
    function tick() {
      const remaining = Math.max(0, Math.ceil(((lockedUntil ?? 0) - Date.now()) / 1000));
      setRemainingSeconds(remaining);
      if (remaining <= 0) {
        setLockedUntil(null);
        setFailedAttempts(0);
        setError(null);
      }
    }
    tick();
    const interval = setInterval(tick, 1000);
    return () => clearInterval(interval);
  }, [lockedUntil]);

  useEffect(() => {
    if (value.length < ADULT_PIN_LENGTH || lockedUntil) {
      return;
    }

    (async () => {
      if (stage === 'enter') {
        const valid = await verifyAdultPin(value);
        setValue('');
        if (valid) {
          setFailedAttempts(0);
          navigation.replace('AdultHome');
          return;
        }
        const nextAttempts = failedAttempts + 1;
        if (nextAttempts >= MAX_ATTEMPTS) {
          setFailedAttempts(0);
          setError(null);
          setLockedUntil(Date.now() + LOCKOUT_MS);
        } else {
          setFailedAttempts(nextAttempts);
          setError(
            `PIN incorrecto. Inténtalo de nuevo (${MAX_ATTEMPTS - nextAttempts} ${MAX_ATTEMPTS - nextAttempts === 1 ? 'intento' : 'intentos'} antes de una pausa).`,
          );
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
  }, [value, stage, firstPin, navigation, lockedUntil, failedAttempts]);

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
      {lockedUntil ? (
        <Text style={styles.error} accessibilityLiveRegion="polite">
          Demasiados intentos. Espera {remainingSeconds}{' '}
          {remainingSeconds === 1 ? 'segundo' : 'segundos'}.
        </Text>
      ) : error ? (
        <Text style={styles.error} accessibilityLiveRegion="polite">
          {error}
        </Text>
      ) : null}

      <PinPad
        value={value}
        onChange={setValue}
        length={ADULT_PIN_LENGTH}
        disabled={!!lockedUntil}
      />

      <BigButton
        label="Volver"
        variant="ghost"
        fullWidth={false}
        onPress={() => navigation.goBack()}
      />
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
