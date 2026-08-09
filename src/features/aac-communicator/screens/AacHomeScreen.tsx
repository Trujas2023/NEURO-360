import type { NativeStackNavigationProp, NativeStackScreenProps } from '@react-navigation/native-stack';
import { StyleSheet, View } from 'react-native';

import type { RootStackParamList } from '@app/navigation/types';
import { spacing } from '@shared/theme';

import { AacLayout } from '../components/AacLayout';
import { CategoryTile } from '../components/CategoryTile';
import { AAC_CATEGORIES } from '../constants/categories';
import type { AacStackParamList } from '../navigation/types';

type Props = NativeStackScreenProps<AacStackParamList, 'AacHome'>;

/** Pantalla principal de "Mi Voz": grilla de categorías, siempre con la barra de frase visible. */
export function AacHomeScreen({ navigation }: Props) {
  const parentNavigation = navigation.getParent<NativeStackNavigationProp<RootStackParamList>>();

  return (
    <AacLayout title="Mi Voz" onBack={() => parentNavigation?.goBack()}>
      <View style={styles.grid}>
        {AAC_CATEGORIES.map((category) => (
          <View key={category.id} style={styles.gridItem}>
            <CategoryTile
              category={category}
              onPress={() => navigation.navigate('AacCategory', { categoryId: category.id })}
            />
          </View>
        ))}
      </View>
    </AacLayout>
  );
}

const styles = StyleSheet.create({
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: spacing.md,
  },
  gridItem: {
    marginBottom: spacing.sm,
  },
});
