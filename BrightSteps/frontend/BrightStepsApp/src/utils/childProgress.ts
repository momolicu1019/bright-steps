export type ModuleVisitCounts = Record<string, number>;

export function bearLevelFromCoins(coins: number): number {
  return Math.max(1, Math.floor(coins / 15) + 1);
}

export function nextCoinMilestone(coins: number, step = 50): number {
  if (coins < step) {
    return step;
  }
  return Math.ceil((coins + 1) / step) * step;
}

export function favoriteModuleKey(visits: ModuleVisitCounts): string | null {
  const entries = Object.entries(visits);
  if (!entries.length) {
    return null;
  }
  return entries.sort((a, b) => b[1] - a[1])[0][0];
}

export function modulesExploredCount(visits: ModuleVisitCounts): number {
  return Object.keys(visits).length;
}

export function topModuleKeys(visits: ModuleVisitCounts, limit: number): string[] {
  return Object.entries(visits)
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit)
    .map(([key]) => key);
}
