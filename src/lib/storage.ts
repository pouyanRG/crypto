import type { StateStorage } from "zustand/middleware";

function isObjectLike(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isValidPersistedValue(value: string): boolean {
  try {
    const parsed = JSON.parse(value);
    return isObjectLike(parsed);
  } catch {
    return false;
  }
}

export const safeLocalStorage: StateStorage = {
  getItem: (name) => {
    if (typeof window === "undefined") return null;

    try {
      const value = window.localStorage.getItem(name);
      return value && isValidPersistedValue(value) ? value : null;
    } catch {
      return null;
    }
  },
  setItem: (name, value) => {
    if (typeof window === "undefined") return;

    try {
      const parsed = JSON.parse(value);
      if (!isObjectLike(parsed)) {
        return;
      }
      window.localStorage.setItem(name, value);
    } catch {
    }
  },
  removeItem: (name) => {
    if (typeof window === "undefined") return;

    try {
      window.localStorage.removeItem(name);
    } catch {
    }
  },
};