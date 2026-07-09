import type { StateStorage } from "zustand/middleware";
import { showToast } from "./toast";

/**
 * localStorage wrapper for zustand persist. Swallows write failures
 * (e.g. QuotaExceededError) instead of crashing the app, since this
 * is the only place data lives — a thrown error here would break the UI.
 */
export const guardedLocalStorage: StateStorage = {
  getItem: (name) => {
    if (typeof window === "undefined") return null;
    try {
      return window.localStorage.getItem(name);
    } catch {
      return null;
    }
  },
  setItem: (name, value) => {
    if (typeof window === "undefined") return;
    try {
      window.localStorage.setItem(name, value);
    } catch {
      showToast(
        "저장 공간이 부족해 최근 변경사항이 저장되지 않았습니다. 오래된 공고를 삭제한 뒤 다시 시도해주세요.",
      );
    }
  },
  removeItem: (name) => {
    if (typeof window === "undefined") return;
    try {
      window.localStorage.removeItem(name);
    } catch {
      // ignore
    }
  },
};
