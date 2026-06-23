import Dexie, { type Table } from "dexie";
import type { Duel } from "./types";

// Every duel the user has fought is kept locally (IndexedDB) so they can reopen
// a past exchange and re-read its verdict. Nothing leaves the device except the
// per-round prompts sent to the Claude function.
class DisputeDB extends Dexie {
  duels!: Table<Duel, number>;

  constructor() {
    super("la-dispute");
    this.version(1).stores({
      // index updatedAt for the history list ordering
      duels: "++id, updatedAt",
    });
  }
}

export const db = new DisputeDB();

export async function createDuel(conviction: string): Promise<number> {
  const now = Date.now();
  return db.duels.add({
    conviction: conviction.trim(),
    turns: [],
    verdict: null,
    stage: 1,
    createdAt: now,
    updatedAt: now,
  });
}

export async function saveDuel(duel: Duel): Promise<void> {
  if (duel.id == null) return;
  await db.duels.update(duel.id, { ...duel, updatedAt: Date.now() });
}

export async function deleteDuel(id: number): Promise<void> {
  await db.duels.delete(id);
}

export async function getDuel(id: number): Promise<Duel | undefined> {
  return db.duels.get(id);
}
