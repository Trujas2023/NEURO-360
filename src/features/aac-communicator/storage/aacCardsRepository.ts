import { getItem } from '@services/storage/asyncStorage';
import { getDb, getSetting, setSetting } from '@services/storage/db';
import { registerLegacyMigration } from '@services/storage/migrationRegistry';
import { registerProfileDataCleanup } from '@services/storage/profileDataRegistry';

import type { AacCard } from '../types';

function legacyCardsKey(profileId: string): string {
  return `sense-play/aac/cards/${profileId}`;
}

interface AacCardRow {
  id: string;
  profileId: string;
  categoryId: string;
  label: string;
  emoji: string;
  imageUri: string | null;
  audioUri: string | null;
  color: string;
  isFavorite: number;
  orderNum: number;
  usageCount: number | null;
  lastUsedAt: string | null;
  active: number | null;
  createdAt: string;
}

function seededKey(profileId: string): string {
  return `aacCardsSeeded:${profileId}`;
}

function rowToCard(row: AacCardRow): AacCard {
  return {
    id: row.id,
    categoryId: row.categoryId,
    label: row.label,
    emoji: row.emoji,
    imageUri: row.imageUri ?? undefined,
    audioUri: row.audioUri ?? undefined,
    color: row.color,
    isFavorite: row.isFavorite === 1,
    order: row.orderNum,
    usageCount: row.usageCount ?? undefined,
    lastUsedAt: row.lastUsedAt ?? undefined,
    active: row.active === null ? undefined : row.active === 1,
    createdAt: row.createdAt,
  };
}

/**
 * `null` significa "nunca se guardó nada para este perfil" (primera vez,
 * corresponde sembrar el vocabulario por defecto). Un array vacío `[]`
 * significa que el adulto eliminó todas las tarjetas a propósito, y no
 * debe volver a sembrarse. Igual semántica que la implementación anterior
 * sobre AsyncStorage; se distingue con una marca `aacCardsSeeded:<id>` en
 * `kv_settings` porque "cero filas en la tabla" por sí solo es ambiguo
 * entre ambos casos.
 */
export async function getAacCards(profileId: string): Promise<AacCard[] | null> {
  const seeded = await getSetting(seededKey(profileId));
  if (!seeded) {
    return null;
  }
  const db = await getDb();
  const rows = await db.getAllAsync<AacCardRow>(
    'SELECT * FROM aac_cards WHERE profileId = ? ORDER BY orderNum ASC',
    profileId,
  );
  return rows.map(rowToCard);
}

export async function saveAacCards(profileId: string, cards: AacCard[]): Promise<void> {
  const db = await getDb();
  await db.withTransactionAsync(async () => {
    await db.runAsync('DELETE FROM aac_cards WHERE profileId = ?', profileId);
    for (const card of cards) {
      await db.runAsync(
        `INSERT INTO aac_cards
          (id, profileId, categoryId, label, emoji, imageUri, audioUri, color, isFavorite, orderNum, usageCount, lastUsedAt, active, createdAt)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        card.id,
        profileId,
        card.categoryId,
        card.label,
        card.emoji,
        card.imageUri ?? null,
        card.audioUri ?? null,
        card.color,
        card.isFavorite ? 1 : 0,
        card.order,
        card.usageCount ?? null,
        card.lastUsedAt ?? null,
        card.active === undefined ? null : card.active ? 1 : 0,
        card.createdAt,
      );
    }
  });
  await setSetting(seededKey(profileId), '1');
}

export async function removeAacCards(profileId: string): Promise<void> {
  const db = await getDb();
  await db.runAsync('DELETE FROM aac_cards WHERE profileId = ?', profileId);
  await setSetting(seededKey(profileId), null);
}

// Borra las tarjetas AAC del perfil cuando `ProfilesContext` elimina ese
// perfil, para no dejar datos huérfanos en la base de datos.
registerProfileDataCleanup(removeAacCards);

// Migra las tarjetas AAC guardadas en AsyncStorage (Fases 3-4 / Mi Voz AAC
// Pro) hacia SQLite, una sola vez por perfil heredado (ver
// services/storage/migrateFromAsyncStorage.ts).
registerLegacyMigration(async (profileIds) => {
  for (const profileId of profileIds) {
    const legacyCards = await getItem<AacCard[]>(legacyCardsKey(profileId));
    if (legacyCards) {
      await saveAacCards(profileId, legacyCards);
    }
  }
});
