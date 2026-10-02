import { useSyncExternalStore } from "react";

// The theme lives as data-theme on the desktop root element (not <html>), so
// it never affects the rest of the site. A tiny inline script sets it before
// first paint; this store keeps React in sync with it.
//
// The saved appearance is "light", "dark" or "auto" (follow the system).

const STORAGE_KEY = "mg-desktop-theme";
const ROOT_SELECTOR = "[data-desk-root]";
const THEME_COLORS = { dark: "#0a0a0a", light: "#f4f4f5" };
const APPEARANCES = ["auto", "light", "dark"];

export const THEME_SCRIPT = `(function(){var t;try{t=localStorage.getItem(${JSON.stringify(
  STORAGE_KEY
)})}catch(e){}if(t!=="light"&&t!=="dark"){t=window.matchMedia&&matchMedia("(prefers-color-scheme: light)").matches?"light":"dark"}document.currentScript.parentElement.setAttribute("data-theme",t)})();`;

const listeners = new Set();
let appearance = "auto";
let systemQuery = null;

function getRoot() {
  return document.querySelector(ROOT_SELECTOR);
}

function notify() {
  listeners.forEach((listener) => listener());
}

function subscribe(listener) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function getSnapshot() {
  const theme = getRoot()?.dataset.theme;
  return theme === "light" || theme === "dark" ? theme : null;
}

function getServerSnapshot() {
  return null;
}

function savedAppearance() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (APPEARANCES.includes(saved)) return saved;
  } catch {
    // Storage can be unavailable (private mode, blocked site data).
  }
  return "auto";
}

const systemTheme = () =>
  window.matchMedia("(prefers-color-scheme: light)").matches ? "light" : "dark";

function applyTheme(theme) {
  const root = getRoot();
  if (!root) return;
  root.dataset.theme = theme;
  document
    .querySelector('meta[name="theme-color"]')
    ?.setAttribute("content", THEME_COLORS[theme]);
  notify();
}

export function setAppearance(next) {
  if (!APPEARANCES.includes(next)) return;
  appearance = next;
  try {
    localStorage.setItem(STORAGE_KEY, next);
  } catch {
    // Not fatal; the appearance just won't persist.
  }
  applyTheme(next === "auto" ? systemTheme() : next);
}

// Picking light or dark directly (menu bar button, terminal) pins that theme.
export function setTheme(theme) {
  setAppearance(theme);
}

// The inline script doesn't run after a client-side navigation, so apply the
// theme on mount, and follow system changes while the appearance is "auto".
export function ensureTheme() {
  appearance = savedAppearance();
  applyTheme(appearance === "auto" ? systemTheme() : appearance);
  if (!systemQuery) {
    systemQuery = window.matchMedia("(prefers-color-scheme: light)");
    systemQuery.addEventListener("change", () => {
      if (appearance === "auto") applyTheme(systemTheme());
    });
  }
}

export function useTheme() {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}

export function useAppearance() {
  return useSyncExternalStore(subscribe, () => appearance, () => "auto");
}
