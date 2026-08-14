import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import * as ImagePicker from 'expo-image-picker';
import { useMemo, useState } from 'react';
import { Alert, Pressable, StyleSheet, Switch, Text, TextInput, View } from 'react-native';

import type { RootStackParamList } from '@app/navigation/types';
import { useProfiles } from '@features/profiles/context/ProfilesContext';
import { speak, speakOptionsForPreferences } from '@services/audio';
import { BigButton, ScreenContainer } from '@shared/components';
import { AVATAR_COLORS as PALETTE_COLORS, DEFAULT_PROFILE_PREFERENCES } from '@shared/constants/profiles';
import { colors, radius, spacing, typography } from '@shared/theme';

import { AacCardVisual } from '../components/AacCardVisual';
import { VoiceRecorderField } from '../components/VoiceRecorderField';
import { ASSIGNABLE_CATEGORIES, getCategory } from '../constants/categories';
import { useAacCards } from '../hooks/useAacCards';

type Props = NativeStackScreenProps<RootStackParamList, 'AacCardForm'>;

/**
 * Modo Adulto: crear o editar una tarjeta. Nunca se navega aquí desde
 * Modo Niño (ver `AacManagerScreen`, alcanzable solo tras el PIN de
 * `PinGateScreen`).
 */
export function AacCardFormScreen({ route, navigation }: Props) {
  const { profileId, cardId, categoryId: initialCategoryId } = route.params;
  const { profiles } = useProfiles();
  const profile = profiles.find((item) => item.id === profileId);
  const ttsOptions = speakOptionsForPreferences(profile?.preferences ?? DEFAULT_PROFILE_PREFERENCES);
  const { cards, createCard, updateCard } = useAacCards(profileId);
  const editingCard = useMemo(() => cards.find((card) => card.id === cardId) ?? null, [cards, cardId]);

  const defaultCategoryId = editingCard?.categoryId ?? initialCategoryId ?? ASSIGNABLE_CATEGORIES[0].id;

  const [categoryId, setCategoryId] = useState(defaultCategoryId);
  const [label, setLabel] = useState(editingCard?.label ?? '');
  const [spokenText, setSpokenText] = useState(editingCard?.spokenText ?? '');
  const [emoji, setEmoji] = useState(editingCard?.emoji ?? getCategory(defaultCategoryId)?.emoji ?? '🙂');
  const [imageUri, setImageUri] = useState<string | undefined>(editingCard?.imageUri);
  const [audioUri, setAudioUri] = useState<string | undefined>(editingCard?.audioUri);
  const [color, setColor] = useState(editingCard?.color ?? getCategory(defaultCategoryId)?.color ?? PALETTE_COLORS[0]);
  const [isFavorite, setIsFavorite] = useState(editingCard?.isFavorite ?? false);
  const [saving, setSaving] = useState(false);

  function tryVoice() {
    const textToSpeak = spokenText.trim() || label.trim();
    if (textToSpeak) {
      speak(textToSpeak, ttsOptions);
    }
  }

  function handleSelectCategory(nextCategoryId: string) {
    setCategoryId(nextCategoryId);
    if (!editingCard) {
      // Solo autocompleta emoji/color al crear; al editar se respeta lo ya elegido.
      setEmoji(getCategory(nextCategoryId)?.emoji ?? emoji);
      setColor(getCategory(nextCategoryId)?.color ?? color);
    }
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
      setImageUri(result.assets[0].uri);
    }
  }

  async function takePhoto() {
    const permission = await ImagePicker.requestCameraPermissionsAsync();
    if (!permission.granted) {
      Alert.alert('Permiso necesario', 'Activa el acceso a la cámara para tomar una foto.');
      return;
    }
    const result = await ImagePicker.launchCameraAsync({ allowsEditing: true, aspect: [1, 1], quality: 0.6 });
    if (!result.canceled && result.assets[0]) {
      setImageUri(result.assets[0].uri);
    }
  }

  async function handleSave() {
    const trimmedLabel = label.trim();
    if (!trimmedLabel) {
      Alert.alert('Falta la palabra o frase', 'Escribe el texto de la tarjeta antes de guardar.');
      return;
    }

    const trimmedSpokenText = spokenText.trim();

    setSaving(true);
    try {
      if (editingCard) {
        await updateCard(editingCard.id, {
          categoryId,
          label: trimmedLabel,
          spokenText: trimmedSpokenText || undefined,
          emoji: emoji.trim() || '🙂',
          imageUri,
          imageType: imageUri ? 'photo' : 'icon',
          audioUri,
          color,
          isFavorite,
        });
      } else {
        await createCard({
          categoryId,
          label: trimmedLabel,
          spokenText: trimmedSpokenText || undefined,
          emoji: emoji.trim() || '🙂',
          imageUri,
          audioUri,
          color,
          isFavorite,
        });
      }
      navigation.goBack();
    } finally {
      setSaving(false);
    }
  }

  return (
    <ScreenContainer scrollable>
      <Text style={styles.title}>{editingCard ? 'Editar tarjeta' : 'Nueva tarjeta'}</Text>

      <View style={styles.preview}>
        <AacCardVisual emoji={emoji} imageUri={imageUri} size={80} />
      </View>

      <View style={styles.photoButtons}>
        <View style={styles.photoButton}>
          <BigButton label="Elegir foto" emoji="🖼️" variant="secondary" onPress={pickFromLibrary} />
        </View>
        <View style={styles.photoButton}>
          <BigButton label="Tomar foto" emoji="📷" variant="secondary" onPress={takePhoto} />
        </View>
      </View>
      {imageUri ? (
        <BigButton label="Quitar foto" variant="ghost" fullWidth={false} onPress={() => setImageUri(undefined)} />
      ) : null}

      <Text style={styles.label}>Palabra o frase</Text>
      <TextInput
        value={label}
        onChangeText={setLabel}
        placeholder="Ej: Agua, Quiero mi vaso, Mamá"
        placeholderTextColor={colors.textSecondary}
        style={styles.input}
        accessibilityLabel="Palabra o frase de la tarjeta"
      />

      <Text style={styles.label}>Qué dirá en voz alta (opcional, si es distinto del texto)</Text>
      <TextInput
        value={spokenText}
        onChangeText={setSpokenText}
        placeholder="Ej: Quiero a mi mamá"
        placeholderTextColor={colors.textSecondary}
        style={styles.input}
        accessibilityLabel="Texto que se lee en voz alta"
      />
      <View style={styles.tryVoiceButton}>
        <BigButton label="Probar voz" emoji="🔊" variant="secondary" fullWidth={false} onPress={tryVoice} />
      </View>

      <VoiceRecorderField audioUri={audioUri} onChange={setAudioUri} />

      <Text style={styles.label}>Pictograma (emoji, si no hay foto)</Text>
      <TextInput
        value={emoji}
        onChangeText={setEmoji}
        placeholder="🙂"
        placeholderTextColor={colors.textSecondary}
        style={styles.input}
        accessibilityLabel="Pictograma de la tarjeta"
      />

      <Text style={styles.label}>Categoría</Text>
      <View style={styles.categoryRow}>
        {ASSIGNABLE_CATEGORIES.map((category) => (
          <Pressable
            key={category.id}
            onPress={() => handleSelectCategory(category.id)}
            accessibilityRole="button"
            accessibilityLabel={category.label}
            style={[
              styles.categoryChip,
              { borderColor: category.color },
              category.id === categoryId && { backgroundColor: category.color },
            ]}
          >
            <Text style={styles.categoryChipText}>
              {category.emoji} {category.label}
            </Text>
          </Pressable>
        ))}
      </View>

      <Text style={styles.label}>Color</Text>
      <View style={styles.swatchRow}>
        {PALETTE_COLORS.map((swatch) => (
          <Pressable
            key={swatch}
            onPress={() => setColor(swatch)}
            accessibilityRole="button"
            accessibilityLabel={`Elegir color ${swatch}`}
            style={[styles.swatch, { backgroundColor: swatch }, swatch === color && styles.swatchSelected]}
          />
        ))}
      </View>

      <View style={styles.preferenceRow}>
        <Text style={styles.preferenceLabel}>Favorita</Text>
        <Switch value={isFavorite} onValueChange={setIsFavorite} accessibilityLabel="Marcar como favorita" />
      </View>

      <View style={styles.actions}>
        <BigButton label="Guardar" emoji="✅" onPress={handleSave} disabled={saving} />
        <View style={styles.spacer} />
        <BigButton label="Cancelar" variant="ghost" onPress={() => navigation.goBack()} disabled={saving} />
      </View>
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
  preview: {
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
  tryVoiceButton: {
    marginTop: spacing.sm,
    alignItems: 'flex-start',
  },
  label: {
    marginTop: spacing.lg,
    marginBottom: spacing.sm,
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.medium,
    color: colors.textPrimary,
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
  categoryRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  categoryChip: {
    borderWidth: 2,
    borderRadius: radius.pill,
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.md,
  },
  categoryChipText: {
    fontSize: typography.sizes.sm,
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
