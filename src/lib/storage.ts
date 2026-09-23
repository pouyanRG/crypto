import type { StateStorage } from "zustand/middleware";

function isValidPersistedValue(value: string): boolean {
  try {
    const parsed = JSON.parse(value);
    return parsed !== null && typeof parsed === "object";
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