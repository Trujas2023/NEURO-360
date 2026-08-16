import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import * as ImagePicker from 'expo-image-picker';
import { useMemo, useRef, useState } from 'react';
import { Alert, Pressable, StyleSheet, Switch, Text, TextInput, View } from 'react-native';

import type { RootStackParamList } from '@app/navigation/types';
import { useProfiles } from '@features/profiles/context/ProfilesContext';
import { BigButton, ProfileAvatar, ScreenContainer, useConfirmDialog } from '@shared/components';
import { AVATAR_COLORS, DEFAULT_PROFILE_PREFERENCES } from '@shared/constants/profiles';
import { useReduceMotion } from '@shared/hooks';
import { colors, radius, spacing, typography } from '@shared/theme';

type Props = NativeStackScreenProps<RootStackParamList, 'ProfileForm'>;

const SWATCH_HIT_SLOP = { top: 12, bottom: 12, left: 12, right: 12 };

export function ProfileFormScreen({ route, navigation }: Props) {
  const { profiles, createProfile, updateProfile } = useProfiles();
  const editingProfile = useMemo(
    () => profiles.find((profile) => profile.id === route.params?.profileId) ?? null,
    [profiles, route.params?.profileId],
  );

  const initialName = editingProfile?.name ?? '';
  const initialAvatarUri = editingProfile?.avatarUri;
  const initialAvatarColor = editingProfile?.avatarColor ?? AVATAR_COLORS[0];
  const initialSoundEnabled =
    editingProfile?.preferences.soundEnabled ?? DEFAULT_PROFILE_PREFERENCES.soundEnabled;
  const initialReduceMotionPref =
    editingProfile?.preferences.reduceMotion ?? DEFAULT_PROFILE_PREFERENCES.reduceMotion;

  const [name, setName] = useState(initialName);
  const [avatarUri, setAvatarUri] = useState<string | undefined>(initialAvatarUri);
  const [avatarColor, setAvatarColor] = useState(initialAvatarColor);
  const [soundEnabled, setSoundEnabled] = useState(initialSoundEnabled);
  const [reduceMotionPref, setReduceMotionPref] = useState(initialReduceMotionPref);
  const [saving, setSaving] = useState(false);
  // Guarda contra doble envío: `saving` (estado) deshabilita el botón, pero
  // un doble toque muy rápido puede disparar dos onPress antes de que React
  // vuelva a renderizar. Este ref se lee/escribe de forma síncrona.
  const savingRef = useRef(false);
  const reduceMotion = useReduceMotion(reduceMotionPref);
  const { confirm, dialog } = useConfirmDialog(reduceMotion);

  const isDirty =
    name !== initialName ||
    avatarUri !== initialAvatarUri ||
    avatarColor !== initialAvatarColor ||
    soundEnabled !== initialSoundEnabled ||
    reduceMotionPref !== initialReduceMotionPref;

  async function handleCancel() {
    if (isDirty) {
      const discard = await confirm({
        title: 'Descartar cambios',
        message: 'Todavía no guardaste. Si sales ahora, se pierden los cambios.',
        confirmLabel: 'Descartar',
        destructive: true,
      });
      if (!discard) {
        return;
      }
    }
    navigation.goBack();
  }

  async function pickFromLibrary() {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      Alert.alert('Permiso necesario', 'Activa el acceso a la galería para elegir una foto.');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.6,
    });
    if (!result.canceled && result.assets[0]) {
      setAvatarUri(result.assets[0].uri);
    }
  }

  async function takePhoto() {
    const permission = await ImagePicker.requestCameraPermissionsAsync();
    if (!permission.granted) {
      Alert.alert('Permiso necesario', 'Activa el acceso a la cámara para tomar una foto.');
      return;
    }
    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.6,
    });
    if (!result.canceled && result.assets[0]) {
      setAvatarUri(result.assets[0].uri);
    }
  }

  async function handleSave() {
    if (savingRef.current) {
      return;
    }
    const trimmedName = name.trim();
    if (!trimmedName) {
      Alert.alert('Falta el nombre', 'Escribe el nombre del niño o niña antes de guardar.');
      return;
    }

    savingRef.current = true;
    setSaving(true);
    const preferences = { soundEnabled, reduceMotion: reduceMotionPref };
    try {
      if (editingProfile) {
        await updateProfile(editingProfile.id, {
          name: trimmedName,
          avatarUri,
          avatarColor,
          preferences,
        });
      } else {
        await createProfile({ name: trimmedName, avatarUri, avatarColor, preferences });
      }
      navigation.goBack();
    } catch (error) {
      // R3: un fallo real de almacenamiento antes fallaba en silencio — el
      // botón dejaba de girar pero nada avisaba que no se guardó nada.
      console.warn('[ProfileForm] No se pudo guardar el perfil', error);
      Alert.alert('No se pudo guardar', 'Ocurrió un problema al guardar el perfil. Intenta de nuevo.');
    } finally {
      savingRef.current = false;
      setSaving(false);
    }
  }

  return (
    <ScreenContainer scrollable>
      <Text style={styles.title}>{editingProfile ? 'Editar perfil' : 'Nuevo perfil'}</Text>

      <View style={styles.avatarPreview}>
        <ProfileAvatar
          name={name || '?'}
          avatarUri={avatarUri}
          avatarColor={avatarColor}
          size={100}
        />
      </View>

      <View style={styles.photoButtons}>
        <View style={styles.photoButton}>
          <BigButton label="Elegir foto" emoji="🖼️" variant="secondary" onPress={pickFromLibrary} />
        </View>
        <View style={styles.photoButton}>
          <BigButton label="Tomar foto" emoji="📷" variant="secondary" onPress={takePhoto} />
        </View>
      </View>
      {avatarUri ? (
        <BigButton
          label="Quitar foto"
          variant="ghost"
          fullWidth={false}
          onPress={() => setAvatarUri(undefined)}
        />
      ) : null}

      <Text style={styles.label}>Color del avatar</Text>
      <View style={styles.swatchRow}>
        {AVATAR_COLORS.map((color) => (
          <Pressable
            key={color}
            onPress={() => setAvatarColor(color)}
            hitSlop={SWATCH_HIT_SLOP}
            accessibilityRole="button"
            accessibilityLabel={`Elegir color de avatar ${color}`}
            accessibilityState={{ selected: color === avatarColor }}
            style={[
              styles.swatch,
              { backgroundColor: color },
              color === avatarColor && styles.swatchSelected,
            ]}
          />
        ))}
      </View>

      <Text style={styles.label}>Nombre</Text>
      <TextInput
        value={name}
        onChangeText={setName}
        placeholder="Nombre del niño o niña"
        placeholderTextColor={colors.textSecondary}
        style={styles.input}
        accessibilityLabel="Nombre del perfil"
      />

      <View style={styles.preferenceRow}>
        <Text style={styles.preferenceLabel}>Sonido activado</Text>
        <Switch
          value={soundEnabled}
          onValueChange={setSoundEnabled}
          accessibilityLabel="Sonido activado"
        />
      </View>
      <View style={styles.preferenceRow}>
        <Text style={styles.preferenceLabel}>Reducir movimiento</Text>
        <Switch
          value={reduceMotionPref}
          onValueChange={setReduceMotionPref}
          accessibilityLabel="Reducir movimiento"
        />
      </View>

      <View style={styles.actions}>
        <BigButton label="Guardar" emoji="✅" onPress={handleSave} loading={saving} />
        <View style={styles.spacer} />
        <BigButton label="Cancelar" variant="ghost" onPress={handleCancel} disabled={saving} />
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
    marginBottom: spacing.lg,
  },
  avatarPreview: {
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  photoButtons: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  photoButton: {
    flex: 1,
  },
  label: {
    marginTop: spacing.lg,
    marginBottom: spacing.sm,
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.medium,
    color: colors.textPrimary,
  },
  swatchRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  swatch: {
    width: 40,
    height: 40,
    borderRadius: radius.pill,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  swatchSelected: {
    borderColor: colors.textPrimary,
  },
  input: {
    minHeight: spacing.xxl,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    paddingHorizontal: spacing.md,
    fontSize: typography.sizes.md,
    color: colors.textPrimary,
  },
  preferenceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: spacing.md,
  },
  preferenceLabel: {
    fontSize: typography.sizes.md,
    color: colors.textPrimary,
  },
  actions: {
    marginTop: spacing.xl,
  },
  spacer: {
    height: spacing.sm,
  },
});
