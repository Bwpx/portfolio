"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  useCallback,
  useEffect,
  useEffectEvent,
  useRef,
  useState,
  useSyncExternalStore,
} from "react";
import Window, { DOCK_SPACE, MENU_H, isSheet } from "./Window";
import Terminal from "./Terminal";
import BrowserApp from "./Browser";
import CalculatorApp from "./Calculator";
import ContextMenu from "./ContextMenu";
import NotesApp from "./Notes";
import SettingsApp from "./Settings";
import StartupScreen from "./StartupScreen";
import { AboutApp, ContactApp, ProjectsApp, ResumeApp, SkillsApp } from "./apps";
import { APP_IDS, APP_META, WALLPAPERS } from "./catalog";
import { Icon } from "./icons";
import { PROFILE } from "./profile";
import {
  SETTINGS_SCRIPT,
  applyWallpaper,
  getSettings,
  moveIcon,
  resetIcons,
  resetSettings,
  setPlacement,
  updateSettings,
  useSettings,
} from "./settings";
import { THEME_SCRIPT, ensureTheme, setAppearance, setTheme, useTheme } from "./theme";
import s from "./desktop.module.css";

const COMPONENTS = {
  about: AboutApp,
  projects: ProjectsApp,
  resume: ResumeApp,
  skills: SkillsApp,
  contact: ContactApp,
  browser: BrowserApp,
  terminal: Terminal,
  notes: NotesApp,
  calculator: CalculatorApp,
  settings: SettingsApp,
};
const APPS = Object.fromEntries(
  Object.entries(APP_META).map(([id, meta]) => [id, { ...meta, Component: COMPONENTS[id] }])
);

// Desktop icon grid: column-major from the top-left corner.
const CELL_W = 92;
const CELL_H = 100;
const GRID_LEFT = 12;
const GRID_TOP = MENU_H + 14;
const DRAG_THRESHOLD = 5;
const TAGLINE = "Software Engineer Student @ UTSA";
const PLACEHOLDER = "\0placeholder";

const cx = (...names) => names.filter(Boolean).join(" ");
const reduceMotion = () => window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const frontmost = (list) => list.reduce((top, w) => (!top || w.z > top.z ? w : top), null);
const slotOf = (index, rows) => ({
  left: GRID_LEFT + Math.floor(index / rows) * CELL_W,
  top: GRID_TOP + (index % rows) * CELL_H,
});

// Menu bar clock, kept outside React state so it never mismatches on hydration.
let clockFormat;
function readClock() {
  clockFormat ??= new Intl.DateTimeFormat(undefined, {
    weekday: "short",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
  return clockFormat.format(new Date());
}
function subscribeClock(onChange) {
  const timer = setInterval(onChange, 15000);
  return () => clearInterval(timer);
}

// How many icon rows fit between the menu bar and the dock.
function subscribeResize(onChange) {
  window.addEventListener("resize", onChange);
  return () => window.removeEventListener("resize", onChange);
}
const readRows = () =>
  Math.max(1, Math.floor((window.innerHeight - GRID_TOP - DOCK_SPACE - 8) / CELL_H));

export default function Desktop() {
  // Each window: { id, z, minimized, zoomed, phase: "open" | "closing" | "minimizing" }
  const [wins, setWins] = useState([]);
  const [focusRequest, setFocusRequest] = useState({ id: null, n: 0 });
  const [menuOpen, setMenuOpen] = useState(false);
  const [settingsSection, setSettingsSection] = useState({ name: null, n: 0 });
  // A page another app asked the Browser to show; `n` restarts the Browser on it.
  const [browserRequest, setBrowserRequest] = useState({ url: null, n: 0 });
  const [selected, setSelected] = useState(null);
  const [ctx, setCtx] = useState(null); // { x, y, label, items }
  const [drag, setDrag] = useState(null); // { id, from, x, y, target: { zone, index } }
  const router = useRouter();
  const settings = useSettings();
  const theme = useTheme();
  const clock = useSyncExternalStore(subscribeClock, readClock, () => "");
  const rows = useSyncExternalStore(subscribeResize, readRows, () => 6);
  const zTop = useRef(10);
  const dockRefs = useRef({});
  const dockRef = useRef(null);
  const sysBtnRef = useRef(null);
  const menuRef = useRef(null);
  const ghostRef = useRef(null);
  const gesture = useRef(null);
  const suppressClick = useRef(false);
  const ctxReturnFocus = useRef(null);
  const lastPointerTouch = useRef(false);

  const visible = wins.filter((w) => !w.minimized && w.phase === "open");
  const front = frontmost(visible);

  const requestFocus = (id) => setFocusRequest((f) => ({ id, n: f.n + 1 }));

  function bringToFront(id) {
    const z = ++zTop.current;
    setWins((ws) => ws.map((w) => (w.id === id ? { ...w, z } : w)));
  }

  function openApp(id, options) {
    const app = APPS[id];
    if (!app) return;
    if (app.external) {
      window.open(app.href, "_blank", "noopener,noreferrer");
      return;
    }
    if (app.href) {
      router.push(app.href);
      return;
    }
    if (id === "settings" && options?.section) {
      setSettingsSection((sec) => ({ name: options.section, n: sec.n + 1 }));
    }
    if (id === "browser") {
      const isOpen = wins.some((w) => w.id === "browser" && w.phase !== "closing");
      if (options?.url) setBrowserRequest((r) => ({ url: options.url, n: r.n + 1 }));
      // Opened plainly after being closed: start from the home page again.
      else if (!isOpen) setBrowserRequest((r) => ({ ...r, url: null }));
    }
    const z = ++zTop.current;
    setWins((ws) => {
      const existing = ws.find((w) => w.id === id);
      if (!existing) return [...ws, { id, z, minimized: false, zoomed: false, phase: "open" }];
      if (existing.phase === "closing") return ws;
      return ws.map((w) => (w.id === id ? { ...w, z, minimized: false, phase: "open" } : w));
    });
    requestFocus(id);
  }

  // After a window goes away, focus the next window, or its dock icon.
  function focusAfterLeaving(id) {
    const next = frontmost(visible.filter((w) => w.id !== id));
    if (next) requestFocus(next.id);
    else (dockRefs.current[id] ?? sysBtnRef.current)?.focus();
  }

  function closeWin(id) {
    const instant = reduceMotion();
    setWins((ws) =>
      instant
        ? ws.filter((w) => w.id !== id)
        : ws.map((w) => (w.id === id ? { ...w, phase: "closing" } : w))
    );
    focusAfterLeaving(id);
  }

  function minimizeWin(id) {
    const instant = reduceMotion();
    setWins((ws) =>
      ws.map((w) =>
        w.id !== id || w.minimized
          ? w
          : instant
            ? { ...w, minimized: true }
            : { ...w, phase: "minimizing" }
      )
    );
    focusAfterLeaving(id);
  }

  function toggleZoom(id) {
    if (isSheet()) return;
    setWins((ws) => ws.map((w) => (w.id === id ? { ...w, zoomed: !w.zoomed } : w)));
  }

  function closeAll() {
    const instant = reduceMotion();
    setWins((ws) =>
      instant ? [] : ws.filter((w) => !w.minimized).map((w) => ({ ...w, phase: "closing" }))
    );
    sysBtnRef.current?.focus();
  }

  function resetDesktop() {
    resetSettings();
    setAppearance("auto");
    closeAll();
  }

  const handleClosed = useCallback((id) => {
    setWins((ws) => ws.filter((w) => w.id !== id));
  }, []);

  const handleMinimized = useCallback((id) => {
    setWins((ws) =>
      ws.map((w) =>
        w.id === id && w.phase === "minimizing" ? { ...w, minimized: true, phase: "open" } : w
      )
    );
  }, []);

  const toggleTheme = () => setTheme(theme === "light" ? "dark" : "light");

  function nextWallpaper() {
    const i = WALLPAPERS.findIndex((w) => w.id === getSettings().wallpaper);
    updateSettings({ wallpaper: WALLPAPERS[(i + 1) % WALLPAPERS.length].id });
  }

  function sortIcons() {
    updateSettings((st) => ({
      desktop: [...st.desktop].sort((a, b) => APP_META[a].title.localeCompare(APP_META[b].title)),
    }));
  }

  // ── System menu ──────────────────────────────────────────────────────────
  const menuItems = () => Array.from(menuRef.current.querySelectorAll('[role="menuitem"]'));

  function openMenuAndFocus() {
    setMenuOpen(true);
    requestAnimationFrame(() => menuItems()[0]?.focus());
  }

  function runMenuAction(action) {
    setMenuOpen(false);
    action();
  }

  function handleMenuKeyDown(e) {
    const items = menuItems();
    const i = items.indexOf(document.activeElement);
    const go = (n) => {
      e.preventDefault();
      items[(n + items.length) % items.length].focus();
    };
    if (e.key === "ArrowDown") go(i + 1);
    else if (e.key === "ArrowUp") go(i - 1);
    else if (e.key === "Home") go(0);
    else if (e.key === "End") go(items.length - 1);
    else if (e.key === "Tab") setMenuOpen(false);
  }

  // ── Context menus ────────────────────────────────────────────────────────
  function showContextMenu(e, label, items) {
    e.preventDefault();
    e.stopPropagation();
    setMenuOpen(false);
    let { clientX: x, clientY: y } = e;
    // Keyboard-invoked menus (Shift+F10, menu key) have no pointer position.
    if (!x && !y) {
      const box = e.currentTarget.getBoundingClientRect();
      x = box.left + box.width / 2;
      y = box.top + box.height / 2;
    }
    ctxReturnFocus.current = document.activeElement;
    setCtx({ x, y, label, items });
  }

  const closeContextMenu = useCallback((restoreFocus) => {
    setCtx(null);
    if (restoreFocus) ctxReturnFocus.current?.focus?.();
  }, []);

  function iconMenu(e, id) {
    const st = getSettings();
    const app = APP_META[id];
    const onDesktop = st.desktop.includes(id);
    const inDock = st.dock.includes(id);
    const running = wins.some((w) => w.id === id && w.phase !== "closing");
    showContextMenu(e, `${app.title} options`, [
      { label: app.external ? "Open in New Tab" : app.href ? "Open Classic View" : "Open", action: () => openApp(id) },
      ...(running ? [{ label: "Close Window", action: () => closeWin(id) }] : []),
      "sep",
      {
        label: onDesktop ? "Remove from Desktop" : "Add to Desktop",
        action: () => setPlacement(id, "desktop", !onDesktop),
      },
      {
        label: inDock ? "Remove from Dock" : "Keep in Dock",
        action: () => setPlacement(id, "dock", !inDock),
      },
      "sep",
      { label: "Desktop & Dock Settings…", action: () => openApp("settings", { section: "icons" }) },
    ]);
  }

  function desktopMenu(e) {
    setSelected(null);
    showContextMenu(e, "Desktop options", [
      { label: "Change Wallpaper…", action: () => openApp("settings", { section: "wallpaper" }) },
      { label: "Next Wallpaper", action: nextWallpaper },
      "sep",
      { label: "Sort Icons by Name", action: sortIcons, disabled: getSettings().desktop.length < 2 },
      { label: "Reset Icons & Dock", action: resetIcons },
      "sep",
      { label: "Appearance…", action: () => openApp("settings", { section: "appearance" }) },
      { label: "Settings…", action: () => openApp("settings") },
    ]);
  }

  function dockMenu(e) {
    showContextMenu(e, "Dock options", [
      { label: "Dock Settings…", action: () => openApp("settings", { section: "icons" }) },
      { label: "Reset Icons & Dock", action: resetIcons },
    ]);
  }

  // ── Dragging icons ───────────────────────────────────────────────────────
  // Icons can be dragged within the desktop or dock to reorder them, and
  // between the two to move them. The lists re-render with a gap where the
  // icon would land; the icon itself follows the pointer as a "ghost".
  function dropTarget(x, y, id) {
    const dock = dockRef.current.getBoundingClientRect();
    if (y >= dock.top - 24 && x >= dock.left - 24 && x <= dock.right + 24) {
      // The dock stays centred while the gap moves around, so measure slots
      // from its centre: with n icons plus the gap, slot i is centred at
      // centre + (i - n/2) * slot.
      const n = getSettings().dock.filter((x) => x !== id).length;
      const first = dockRef.current.querySelector("[data-dock-id]");
      const slot = (first?.offsetWidth ?? 52) + parseFloat(getComputedStyle(dockRef.current).columnGap || 0);
      const centre = dock.left + dock.width / 2;
      const index = Math.max(0, Math.min(n, Math.round((x - centre) / slot + n / 2)));
      return { zone: "dock", index };
    }
    const count = getSettings().desktop.filter((x) => x !== id).length;
    const col = Math.max(0, Math.floor((x - GRID_LEFT) / CELL_W));
    const row = Math.max(0, Math.min(rows - 1, Math.floor((y - GRID_TOP) / CELL_H)));
    return { zone: "desktop", index: Math.min(count, col * rows + row) };
  }

  function placeGhost(x, y) {
    if (ghostRef.current) ghostRef.current.style.transform = `translate(${x - 26}px, ${y - 26}px)`;
  }

  const onDragMove = useEffectEvent((e) => {
    const g = gesture.current;
    if (!g || e.pointerId !== g.pointerId) return;
    if (!g.active) {
      if (Math.hypot(e.clientX - g.x0, e.clientY - g.y0) < DRAG_THRESHOLD) return;
      g.active = true;
      setCtx(null);
    }
    const target = dropTarget(e.clientX, e.clientY, g.id);
    placeGhost(e.clientX, e.clientY);
    if (!g.target || g.target.zone !== target.zone || g.target.index !== target.index) {
      g.target = target;
      setDrag({ id: g.id, from: g.from, x: e.clientX, y: e.clientY, target });
    }
  });

  const onDragEnd = useEffectEvent((e) => {
    const g = gesture.current;
    if (!g || e.pointerId !== g.pointerId) return;
    gesture.current = null;
    if (g.active && e.type === "pointerup") {
      moveIcon(g.id, g.from, g.target.zone, g.target.index);
      // The click that follows a drag shouldn't open the app.
      suppressClick.current = true;
      setTimeout(() => (suppressClick.current = false), 0);
    }
    setDrag(null);
  });

  function startDrag(e, id, from) {
    if (e.button !== 0 || gesture.current) return;
    gesture.current = { id, from, pointerId: e.pointerId, x0: e.clientX, y0: e.clientY, active: false, target: null };
  }

  // Preview of both lists while dragging.
  let desktopList = settings.desktop;
  let dockList = settings.dock;
  if (drag) {
    const without = (list) => list.filter((x) => x !== drag.id);
    if (drag.from === "desktop") desktopList = without(desktopList);
    else dockList = without(dockList);
    const target = without(drag.target.zone === "desktop" ? desktopList : dockList);
    target.splice(drag.target.index, 0, PLACEHOLDER);
    if (drag.target.zone === "desktop") desktopList = target;
    else dockList = target;
  }

  function handleIconClick(e, id) {
    if (suppressClick.current) return;
    // Keyboard (Enter/Space) and touch open right away; mouse needs a double-click.
    if (e.detail === 0 || lastPointerTouch.current) openApp(id);
  }

  // ── Global listeners ─────────────────────────────────────────────────────
  // Escape closes the menu first, then the front window.
  const onKeyDown = useEffectEvent((e) => {
    if (e.key !== "Escape" || e.defaultPrevented) return;
    if (menuOpen) {
      e.preventDefault();
      setMenuOpen(false);
      sysBtnRef.current?.focus();
    } else if (front) {
      e.preventDefault();
      closeWin(front.id);
    }
  });

  const onPointerDown = useEffectEvent((e) => {
    if (menuOpen && !menuRef.current.contains(e.target) && !sysBtnRef.current.contains(e.target)) {
      setMenuOpen(false);
    }
  });

  const boot = useEffectEvent(() => {
    // Deep links like /desktop/#projects open that window on load.
    const fromHash = window.location.hash.slice(1).toLowerCase();
    if (APPS[fromHash] && !APPS[fromHash].href) openApp(fromHash);
    else if (!isSheet()) openApp("about");
  });

  useEffect(() => {
    const keyHandler = (e) => onKeyDown(e);
    const pointerHandler = (e) => onPointerDown(e);
    const moveHandler = (e) => onDragMove(e);
    const endHandler = (e) => onDragEnd(e);
    document.addEventListener("keydown", keyHandler);
    document.addEventListener("pointerdown", pointerHandler);
    document.addEventListener("pointermove", moveHandler);
    document.addEventListener("pointerup", endHandler);
    document.addEventListener("pointercancel", endHandler);
    return () => {
      document.removeEventListener("keydown", keyHandler);
      document.removeEventListener("pointerdown", pointerHandler);
      document.removeEventListener("pointermove", moveHandler);
      document.removeEventListener("pointerup", endHandler);
      document.removeEventListener("pointercancel", endHandler);
    };
  }, []);

  useEffect(() => {
    ensureTheme();
    applyWallpaper(getSettings().wallpaper);
    const frame = requestAnimationFrame(() => boot());
    return () => cancelAnimationFrame(frame);
  }, []);

  function renderIcon(id) {
    return (
      <span className={s.appIcon} style={{ "--tile": APPS[id].tile }}>
        <Icon name={id} />
      </span>
    );
  }

  return (
    <div
      className={cx(s.desk, drag && s.isDraggingIcon)}
      data-desk-root=""
      suppressHydrationWarning
    >
      <script dangerouslySetInnerHTML={{ __html: THEME_SCRIPT }} />
      <script dangerouslySetInnerHTML={{ __html: SETTINGS_SCRIPT }} />
      <div className={s.wallpaper} aria-hidden="true" />
      <div className={s.deskTitle} aria-hidden="true">
        <p className={s.deskName}>{PROFILE.name}</p>
        <p className={s.deskTagline}>{TAGLINE}</p>
      </div>

      <header className={s.menubar}>
        <button
          ref={sysBtnRef}
          id="desk-sys-btn"
          type="button"
          className={cx(s.menubarBtn, s.monogram)}
          aria-haspopup="menu"
          aria-expanded={menuOpen}
          aria-controls="desk-sys-menu"
          aria-label="System menu"
          onClick={() => setMenuOpen((open) => !open)}
          onKeyDown={(e) => {
            if (e.key === "ArrowDown") {
              e.preventDefault();
              openMenuAndFocus();
            }
          }}
        >
          {PROFILE.handle}<span>@</span>portfolio<span>:~$</span>
        </button>
        <span className={s.activeApp} aria-live="polite">
          {front ? APPS[front.id].title : "Desktop"}
        </span>
        <span className={s.spacer} />
        <button
          type="button"
          className={s.menubarBtn}
          aria-label="Settings"
          onClick={() => openApp("settings")}
        >
          <Icon name="settings" />
        </button>
        <button
          type="button"
          className={s.menubarBtn}
          aria-label={theme === "light" ? "Switch to dark theme" : "Switch to light theme"}
          onClick={toggleTheme}
        >
          {theme && <Icon name={theme === "dark" ? "sun" : "moon"} />}
        </button>
        <span className={s.clock}>{clock}</span>
      </header>

      <div
        ref={menuRef}
        id="desk-sys-menu"
        className={s.sysMenu}
        role="menu"
        aria-labelledby="desk-sys-btn"
        hidden={!menuOpen}
        onKeyDown={handleMenuKeyDown}
      >
        <button type="button" role="menuitem" onClick={() => runMenuAction(() => openApp("about"))}>
          About {PROFILE.name.split(" ")[0]}
        </button>
        <button type="button" role="menuitem" onClick={() => runMenuAction(() => openApp("settings"))}>
          Settings…
        </button>
        <button
          type="button"
          role="menuitem"
          onClick={() => runMenuAction(() => openApp("settings", { section: "wallpaper" }))}
        >
          Change Wallpaper…
        </button>
        <hr role="separator" />
        <button type="button" role="menuitem" onClick={() => runMenuAction(() => openApp("terminal"))}>
          Open Terminal
        </button>
        <button
          type="button"
          role="menuitem"
          onClick={() =>
            runMenuAction(() => {
              toggleTheme();
              sysBtnRef.current?.focus();
            })
          }
        >
          Toggle light/dark
        </button>
        <button type="button" role="menuitem" onClick={() => runMenuAction(closeAll)}>
          Close all windows
        </button>
        <hr role="separator" />
        <Link role="menuitem" href={PROFILE.homepage} prefetch={false}>
          Back to main site <kbd>↩</kbd>
        </Link>
      </div>

      <main aria-label="Desktop">
        <h1 className={s.srOnly}>{PROFILE.name} — interactive desktop portfolio</h1>

        <div
          className={s.surface}
          onPointerDown={(e) => {
            if (e.target === e.currentTarget) setSelected(null);
          }}
          onContextMenu={desktopMenu}
        >
          <ul className={s.iconGrid} aria-label="Desktop icons">
            {desktopList.map((id, i) =>
              id === PLACEHOLDER ? (
                <li key={PLACEHOLDER} className={s.iconSlot} style={slotOf(i, rows)} aria-hidden="true" />
              ) : (
                <li key={id} className={s.iconCell} style={slotOf(i, rows)}>
                  <button
                    type="button"
                    className={cx(s.deskIcon, selected === id && s.isSelected)}
                    aria-label={`${APPS[id].title}${APPS[id].hint ? ` (${APPS[id].hint})` : ""}`}
                    onPointerDown={(e) => {
                      lastPointerTouch.current = e.pointerType === "touch";
                      setSelected(id);
                      startDrag(e, id, "desktop");
                    }}
                    onClick={(e) => handleIconClick(e, id)}
                    onDoubleClick={() => !suppressClick.current && openApp(id)}
                    onFocus={() => setSelected(id)}
                    onContextMenu={(e) => {
                      setSelected(id);
                      iconMenu(e, id);
                    }}
                  >
                    {renderIcon(id)}
                    <span className={s.deskLabel}>{APPS[id].title}</span>
                  </button>
                </li>
              )
            )}
          </ul>
        </div>

        {wins.map((w) => {
          const app = APPS[w.id];
          const App = app.Component;
          return (
            <Window
              key={w.id}
              app={app}
              win={w}
              active={front?.id === w.id}
              focusSignal={focusRequest.id === w.id ? focusRequest.n : 0}
              onActivate={bringToFront}
              onClose={closeWin}
              onMinimize={minimizeWin}
              onZoom={toggleZoom}
              onClosed={handleClosed}
              onMinimized={handleMinimized}
            >
              {w.id === "terminal" ? (
                <Terminal
                  profile={PROFILE}
                  openable={APP_IDS}
                  openApp={openApp}
                  theme={theme}
                  setTheme={setTheme}
                  onExit={() => closeWin("terminal")}
                />
              ) : w.id === "settings" ? (
                <SettingsApp section={settingsSection} onResetDesktop={resetDesktop} />
              ) : w.id === "browser" ? (
                <BrowserApp key={browserRequest.n} profile={PROFILE} startUrl={browserRequest.url} />
              ) : (
                <App profile={PROFILE} openApp={openApp} />
              )}
            </Window>
          );
        })}
      </main>

      <nav ref={dockRef} className={s.dock} aria-label="Dock" onContextMenu={dockMenu}>
        {dockList.length === 0 && (
          <span className={s.dockEmpty}>Drag apps here</span>
        )}
        {dockList.map((id) => {
          if (id === PLACEHOLDER) {
            return <span key={PLACEHOLDER} className={s.dockSlot} aria-hidden="true" />;
          }
          const app = APPS[id];
          const w = wins.find((win) => win.id === id && win.phase !== "closing");
          const status = w ? (w.minimized ? " (minimized)" : " (open)") : "";
          return (
            <button
              key={id}
              ref={(el) => {
                dockRefs.current[id] = el;
              }}
              type="button"
              className={cx(s.dockItem, w && s.isRunning)}
              data-dock-id={id}
              aria-label={app.title + (app.hint ? ` (${app.hint})` : "") + status}
              onPointerDown={(e) => startDrag(e, id, "dock")}
              onClick={() => !suppressClick.current && openApp(id)}
              onContextMenu={(e) => iconMenu(e, id)}
            >
              {renderIcon(id)}
              <span className={s.dockLabel} aria-hidden="true">
                {app.title}
              </span>
            </button>
          );
        })}
      </nav>

      {drag && (
        <div
          ref={ghostRef}
          className={s.dragGhost}
          style={{ transform: `translate(${drag.x - 26}px, ${drag.y - 26}px)` }}
          aria-hidden="true"
        >
          {renderIcon(drag.id)}
        </div>
      )}

      {ctx && (
        <ContextMenu x={ctx.x} y={ctx.y} label={ctx.label} items={ctx.items} onClose={closeContextMenu} />
      )}

      <span className={s.srOnly} aria-live="polite">
        {drag ? `Moving ${APPS[drag.id].title} to the ${drag.target.zone}` : ""}
      </span>

      <StartupScreen name={PROFILE.name} handle={PROFILE.handle} />
    </div>
  );
}
