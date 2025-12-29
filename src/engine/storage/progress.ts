export type ProgressData = {
  version: 1;
  games: Record<
    string,
    {
      completed: Record<number, boolean>;
      bestScore: Record<number, number>;
    }
  >;
};

const KEY = "npca_progress_v1";

const EMPTY: ProgressData = {
  version: 1,
  games: {},
};

export function readProgress(): ProgressData {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return EMPTY;
    const parsed = JSON.parse(raw) as ProgressData;
    if (parsed?.version !== 1) return EMPTY;
    return parsed;
  } catch {
    return EMPTY;
  }
}

export function writeProgress(data: ProgressData) {
  localStorage.setItem(KEY, JSON.stringify(data));
}

export function markLevelComplete(gameId: string, level: number, score: number) {
  const data = readProgress();
  if (!data.games[gameId]) {
    data.games[gameId] = { completed: {}, bestScore: {} };
  }

  data.games[gameId].completed[level] = true;

  const prev = data.games[gameId].bestScore[level];
  if (prev === undefined || score > prev) {
    data.games[gameId].bestScore[level] = score;
  }

  writeProgress(data);
}

export function isLevelComplete(gameId: string, level: number): boolean {
  const data = readProgress();
  return Boolean(data.games[gameId]?.completed?.[level]);
}

export function getBestScore(gameId: string, level: number): number | null {
  const data = readProgress();
  const v = data.games[gameId]?.bestScore?.[level];
  return typeof v === "number" ? v : null;
}
