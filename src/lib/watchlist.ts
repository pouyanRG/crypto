const STORAGE_KEY = "crypto-dashboard:watchlist";

function canUseStorage(): boolean {
  if (typeof window === "undefined") return false;

  try {
    return Boolean(window.localStorage);
  } catch {
    return false;
  }
}

export function getWatchlist(): string[] {
  if (!canUseStorage()) return [];
  try {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    const parsed = stored ? JSON.parse(stored) : [];
    return Array.isArray(parsed) && parsed.every((id): id is string => typeof id === "string") ? parsed : [];
  } catch {
    return [];
  }
}

export function setWatchlist(ids: string[]): void {
  if (!canUseStorage()) return;

  try {
    const nextIds = Array.isArray(ids) ? ids : [];
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify([...new Set(nextIds)]));
  } catch {
  }
}

export function addToWatchlist(id: string): string[] {
  if (!id) return getWatchlist();
  const next = [...new Set([...getWatchlist(), id])];
  setWatchlist(next);
  return next;
}

export function removeFromWatchlist(id: string): string[] {
  const next = getWatchlist().filter((item) => item !== id);
  setWatchlist(next);
  return next;
}

export function isInWatchlist(id: string): boolean {
  return getWatchlist().includes(id);
}

export { STORAGE_KEY };