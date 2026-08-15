import { useCallback, useState } from 'react';
import { Modal, StyleSheet, Text, View } from 'react-native';

import { colors, radius, spacing, typography } from '@shared/theme';

import { BigButton } from './BigButton';

export interface ConfirmDialogProps {
  visible: boolean;
  title: string;
  message?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  /** Estilo de énfasis para acciones irreversibles (eliminar). */
  destructive?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
  /** Ver docs/UX_UI_SYSTEM_SPEC.md §5.5: desactiva la transición de aparición. */
  reduceMotion?: boolean;
}

/**
 * Confirmación consistente en toda la app (R1, ver
 * docs/UX_UI_SYSTEM_SPEC.md §1.6, §2). Reemplaza `Alert.alert` nativo
 * (cuyo estilo varía entre Android/iOS y no sigue la identidad visual de
 * la app) para toda acción destructiva. Ver `useConfirmDialog` más abajo
 * para el patrón de uso habitual por pantalla.
 */
export function ConfirmDialog({
  visible,
  title,
  message,
  confirmLabel = 'Confirmar',
  cancelLabel = 'Cancelar',
  destructive = false,
  onConfirm,
  onCancel,
  reduceMotion = false,
}: ConfirmDialogProps) {
  return (
    <Modal
      visible={visible}
      transparent
      animationType={reduceMotion ? 'none' : 'fade'}
      onRequestClose={onCancel}
      accessibilityViewIsModal
    >
      <View style={styles.scrim}>
        <View style={styles.card}>
          <Text style={styles.title}>{title}</Text>
          {message ? <Text style={styles.message}>{message}</Text> : null}
          <View style={styles.actions}>
            <View style={styles.actionButton}>
              <BigButton label={cancelLabel} variant="ghost" onPress={onCancel} />
            </View>
            <View style={styles.actionButton}>
              <BigButton
                label={confirmLabel}
                variant={destructive ? 'danger' : 'primary'}
                onPress={onConfirm}
              />
            </View>
          </View>
        </View>
      </View>
    </Modal>
  );
}

export interface ConfirmOptions {
  title: string;
  message?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  destructive?: boolean;
}

interface ConfirmState extends ConfirmOptions {
  visible: boolean;
  resolve?: (value: boolean) => void;
}

/**
 * Hook con la misma ergonomía que `Alert.alert` (una llamada, una
 * decisión) pero respaldado por `ConfirmDialog`: `await confirm({...})`
 * resuelve `true`/`false` según lo que toque el usuario. Renderizar
 * `{dialog}` una vez en la pantalla que lo use.
 */
export function useConfirmDialog(reduceMotion = false) {
  const [state, setState] = useState<ConfirmState>({ visible: false, title: '' });

  const confirm = useCallback((options: ConfirmOptions) => {
    return new Promise<boolean>((resolve) => {
      setState({ ...options, visible: true, resolve });
    });
  }, []);

  const handleConfirm = useCallback(() => {
    state.resolve?.(true);
    setState((current) => ({ ...current, visible: false }));
  }, [state]);

  const handleCancel = useCallback(() => {
    state.resolve?.(false);
    setState((current) => ({ ...current, visible: false }));
  }, [state]);

  const dialog = (
    <ConfirmDialog
      visible={state.visible}
      title={state.title}
      message={state.message}
      confirmLabel={state.confirmLabel}
      cancelLabel={state.cancelLabel}
      destructive={state.destructive}
      onConfirm={handleConfirm}
      onCancel={handleCancel}
      reduceMotion={reduceMotion}
    />
  );

  return { confirm, dialog };
}

const styles = StyleSheet.create({
  scrim: {
    flex: 1,
    backgroundColor: colors.overlayScrim,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.lg,
  },
  card: {
    width: '100%',
    maxWidth: 420,
    backgroundColor: colors.surfaceElevated,
    borderRadius: radius.lg,
    padding: spacing.lg,
  },
  title: {
    fontFamily: typography.fontFamilyBold,
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.bold,
    color: colors.textPrimary,
    textAlign: 'center',
  },
  message: {
    marginTop: spacing.sm,
    fontSize: typography.sizes.md,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  actions: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: spacing.lg,
  },
  actionButton: {
    flex: 1,
  },
});
