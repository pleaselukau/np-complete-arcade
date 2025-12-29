import { readProgress } from "@/engine/storage/progress";

export function getGameCompletedCount(gameId: string): number {
  const data = readProgress();
  const completed = data.games[gameId]?.completed ?? {};
  return Object.values(completed).filter(Boolean).length;
}

export function getGameBestScoreSum(gameId: string): number {
  const data = readProgress();
  const best = data.games[gameId]?.bestScore ?? {};
  return Object.values(best).reduce((a, b) => a + (typeof b === "number" ? b : 0), 0);
}
