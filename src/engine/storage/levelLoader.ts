import { BaseLevelSchema, type BaseLevel } from "@/engine/validation/levelSchemas";

// Phase 0: only load coloring level-01.
// Later: expand to dynamic import mapping for all games.
const LEVEL_IMPORTS: Record<string, Record<number, () => Promise<unknown>>> = {
  coloring: {
    1: () => import("@/levels/coloring/level-01.json"),
  },
};

export async function loadLevel(gameId: string, level: number): Promise<BaseLevel> {
  const importer = LEVEL_IMPORTS[gameId]?.[level];
  if (!importer) {
    throw new Error(`No level found for gameId="${gameId}" level=${level}`);
  }

  const mod = await importer();
  // Vite JSON import returns { default: <json> }
  const raw = (mod as any).default ?? mod;

  const parsed = BaseLevelSchema.safeParse(raw);
  if (!parsed.success) {
    throw new Error(`Invalid level JSON: ${parsed.error.message}`);
  }
  return parsed.data;
}

export function getLevelList(gameId: string): number[] {
  const levels = LEVEL_IMPORTS[gameId];
  if (!levels) return [];
  return Object.keys(levels).map((k) => Number(k)).sort((a, b) => a - b);
}
