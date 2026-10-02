import { useSyncExternalStore } from "react";
import {
  APP_IDS,
  DEFAULT_DESKTOP,
  DEFAULT_DOCK,
  DEFAULT_WALLPAPER,
  WALLPAPERS,
  wallpaperUrl,
} from "./catalog";

// Desktop settings (wallpaper, icon layout, startup animation) persisted in
// localStorage. Like the theme, the wallpaper and startup flag are applied to
// the desktop root by an inline script before first paint.

const STORAGE_KEY = "mg-desktop-settings";
const ROOT_SELECTOR = "[data-desk-root]";
const PHOTO_IDS = WALLPAPERS.filter((w) => w.id !== "classic").map((w) => w.id);

export const DEFAULT_SETTINGS = {
  wallpaper: DEFAULT_WALLPAPER,
  desktop: DEFAULT_DESKTOP,
  dock: DEFAULT_DOCK,
  startup: true,
  seen: APP_IDS,
};

// Apps that existed before `seen` was saved. Anything newer gets added to a
// returning visitor's saved layout once, so new apps show up for them too.
const ORIGINAL_APPS = [
  "about", "projects", "resume", "skills", "contact", "browser",
  "terminal", "notes", "calculator", "settings", "classic",
];

export const SETTINGS_SCRIPT = `(function(){var s={};try{s=JSON.parse(localStorage.getItem(${JSON.stringify(
  STORAGE_KEY
)}))||{}}catch(e){}var r=document.currentScript.parentElement,p=${JSON.stringify(
  PHOTO_IDS
)},w=s.wallpaper==="classic"||p.indexOf(s.wallpaper)>=0?s.wallpaper:${JSON.stringify(
  DEFAULT_WALLPAPER
)};r.setAttribute("data-wallpaper",w);if(w!=="classic"){r.style.setProperty("--wall-img","url(/wallpapers/"+w+".jpg)");r.style.setProperty("--wall-thumb","url(/wallpapers/"+w+"-thumb.jpg)")}if(s.startup!==false)r.setAttribute("data-boot","in")})();`;

const listeners = new Set();
let cache = null;

const isList = (list) => Array.isArray(list) && list.every((id) => typeof id === "string");
const cleanList = (list) => [...new Set(list.filter((id) => APP_IDS.includes(id)))];

function load() {
  let saved = {};
  try {
    saved = JSON.parse(localStorage.getItem(STORAGE_KEY)) || {};
  } catch {
    // Missing or unreadable storage: fall back to defaults.
  }
  const seen = isList(saved.seen) ? saved.seen : ORIGINAL_APPS;
  const fresh = APP_IDS.filter((id) => !seen.includes(id));
  return {
    wallpaper: WALLPAPERS.some((w) => w.id === saved.wallpaper) ? saved.wallpaper : DEFAULT_WALLPAPER,
    desktop: isList(saved.desktop) ? addNew(cleanList(saved.desktop), DEFAULT_DESKTOP, fresh) : DEFAULT_DESKTOP,
    dock: isList(saved.dock) ? addNew(cleanList(saved.dock), DEFAULT_DOCK, fresh) : DEFAULT_DOCK,
    startup: saved.startup !== false,
    seen: APP_IDS,
  };
}

// Insert each new app that belongs in `defaults` right after the app that
// precedes it there (or at the start), keeping the visitor's own order.
function addNew(list, defaults, fresh) {
  const out = [...list];
  for (const id of fresh) {
    const at = defaults.indexOf(id);
    if (at < 0 || out.includes(id)) continue;
    const before = defaults.slice(0, at).reverse().find((x) => out.includes(x));
    out.splice(before ? out.indexOf(before) + 1 : 0, 0, id);
  }
  return out;
}

function getSnapshot() {
  cache ??= load();
  return cache;
}

function subscribe(listener) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function useSettings() {
  return useSyncExternalStore(subscribe, getSnapshot, () => DEFAULT_SETTINGS);
}

export function getSettings() {
  return getSnapshot();
}

// Accepts a partial object, or a function of the current settings returning one.
export function updateSettings(patch) {
  const current = getSnapshot();
  const next = { ...current, ...(typeof patch === "function" ? patch(current) : patch) };
  cache = next;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  } catch {
    // Not fatal; settings just won't persist.
  }
  if (next.wallpaper !== current.wallpaper) applyWallpaper(next.wallpaper);
  listeners.forEach((listener) => listener());
}

export function resetIcons() {
  updateSettings({ desktop: DEFAULT_DESKTOP, dock: DEFAULT_DOCK });
}

export function resetSettings() {
  updateSettings(DEFAULT_SETTINGS);
}

export function applyWallpaper(id) {
  const root = document.querySelector(ROOT_SELECTOR);
  if (!root) return;
  root.dataset.wallpaper = id;
  if (id === "classic") {
    root.style.removeProperty("--wall-img");
    root.style.removeProperty("--wall-thumb");
  } else {
    root.style.setProperty("--wall-img", `url(${wallpaperUrl(id)})`);
    root.style.setProperty("--wall-thumb", `url(${wallpaperUrl(id, true)})`);
  }
}

// ── Icon placement ───────────────────────────────────────────────────────────
// Moving an icon takes it out of the place it was dragged from and puts it at
// `index` in the target ("desktop" | "dock"), without duplicating it there.
export function moveIcon(id, from, to, index) {
  updateSettings((st) => {
    const lists = { desktop: [...st.desktop], dock: [...st.dock] };
    lists[from] = lists[from].filter((x) => x !== id);
    const target = lists[to].filter((x) => x !== id);
    target.splice(Math.max(0, Math.min(index, target.length)), 0, id);
    lists[to] = target;
    return lists;
  });
}

// Show or hide an app in one place, appending it at the end when added.
export function setPlacement(id, where, on) {
  updateSettings((st) => {
    const list = st[where].filter((x) => x !== id);
    return { [where]: on ? [...list, id] : list };
  });
}

// ── Startup animation ────────────────────────────────────────────────────────
export const STARTUP_EVENT = "mg-desktop-startup";

export function playStartup() {
  window.dispatchEvent(new Event(STARTUP_EVENT));
}
