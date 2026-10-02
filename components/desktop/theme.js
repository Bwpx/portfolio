import { useSyncExternalStore } from "react";

// The theme lives as data-theme on the desktop root element (not <html>), so
// it never affects the rest of the site. A tiny inline script sets it before
// first paint; this store keeps React in sync with it.

const STORAGE_KEY = "mg-desktop-theme";
const ROOT_SELECTOR = "[data-desk-root]";
const THEME_COLORS = { dark: "#0a0a0a", light: "#f4f4f5" };

export const THEME_SCRIPT = `(function(){var t;try{t=localStorage.getItem(${JSON.stringify(
  STORAGE_KEY
)})}catch(e){}if(t!=="light"&&t!=="dark"){t=window.matchMedia&&matchMedia("(prefers-color-scheme: light)").matches?"light":"dark"}document.currentScript.parentElement.setAttribute("data-theme",t)})();`;

const listeners = new Set();

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

function savedOrSystemTheme() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved === "light" || saved === "dark") return saved;
  } catch {
    // Storage can be unavailable (private mode, blocked site data).
  }
  return window.matchMedia("(prefers-color-scheme: light)").matches ? "light" : "dark";
}

function syncThemeColor(theme) {
  document
    .querySelector('meta[name="theme-color"]')
    ?.setAttribute("content", THEME_COLORS[theme]);
}

export function setTheme(theme) {
  const root = getRoot();
  if (!root) return;
  root.dataset.theme = theme;
  syncThemeColor(theme);
  try {
    localStorage.setItem(STORAGE_KEY, theme);
  } catch {
    // Not fatal; the theme just won't persist.
  }
  notify();
}

// The inline script doesn't run after a client-side navigation, so apply the
// theme on mount if it's missing.
export function ensureTheme() {
  const root = getRoot();
  if (!root) return;
  if (!getSnapshot()) root.dataset.theme = savedOrSystemTheme();
  syncThemeColor(getSnapshot());
  notify();
}

export function useTheme() {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}
