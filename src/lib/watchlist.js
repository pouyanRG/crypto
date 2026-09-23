const STORAGE_KEY = "crypto-dashboard:watchlist";

function canUseStorage() {
  return typeof window !== "undefined" && Boolean(window.localStorage);
}

export function getWatchlist() {
  if (!canUseStorage()) return [];
  try {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    const parsed = stored ? JSON.parse(stored) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function setWatchlist(ids) {
  if (!canUseStorage()) return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify([...new Set(ids)]));
}

export function addToWatchlist(id) {
  if (!id) return getWatchlist();
  const next = [...new Set([...getWatchlist(), id])];
  setWatchlist(next);
  return next;
}

export function removeFromWatchlist(id) {
  const next = getWatchlist().filter((item) => item !== id);
  setWatchlist(next);
  return next;
}

export function isInWatchlist(id) {
  return getWatchlist().includes(id);
}

export { STORAGE_KEY };