"use client";

import { useEffect, useId, useRef, useState } from "react";
import { ControlGlyph } from "./icons";
import s from "./desktop.module.css";

export const MENU_H = 30;
export const DOCK_SPACE = 88;
const MIN_W = 300;
const MIN_H = 200;
const ANIMATION_FALLBACK_MS = 450;

export const isSheet = () => window.matchMedia("(max-width: 719.98px)").matches;

const clamp = (n, min, max) => Math.max(min, Math.min(max, n));
const cx = (...names) => names.filter(Boolean).join(" ");

// Initial size and position from the app's preferred size and spot on screen.
function initialRect(app) {
  const vw = window.innerWidth;
  const areaH = window.innerHeight - MENU_H - DOCK_SPACE;
  const width = Math.min(app.w, vw - 32);
  const height = Math.max(MIN_H, Math.min(app.h, areaH - 24));
  return {
    width,
    height,
    left: clamp(Math.round(app.x * vw), 16, Math.max(16, vw - width - 16)),
    top: clamp(
      Math.round(MENU_H + 12 + app.y * areaH),
      MENU_H + 8,
      Math.max(MENU_H + 8, MENU_H + areaH - height - 8)
    ),
  };
}

// Keep at least part of the window (and its title bar) on screen.
function clampPosition(left, top, width) {
  return {
    left: clamp(left, 80 - width, window.innerWidth - 80),
    top: clamp(top, MENU_H, Math.max(MENU_H, window.innerHeight - 48)),
  };
}

export default function Window({
  app,
  win,
  active,
  focusSignal,
  onActivate,
  onClose,
  onMinimize,
  onZoom,
  onClosed,
  onMinimized,
  children,
}) {
  const ref = useRef(null);
  const gesture = useRef(null);
  const titleId = useId();
  const [rect, setRect] = useState(() => initialRect(app));
  const [mode, setMode] = useState(null); // "drag" | "resize" | null

  // Move focus into the window when the desktop asks for it.
  useEffect(() => {
    if (!focusSignal) return;
    const el = ref.current;
    (el.querySelector("[data-autofocus]") || el).focus({ preventScroll: true });
  }, [focusSignal]);

  // Finish close/minimize even if animationend never fires.
  useEffect(() => {
    if (win.phase === "open") return;
    const done = win.phase === "closing" ? onClosed : onMinimized;
    const timer = setTimeout(() => done(win.id), ANIMATION_FALLBACK_MS);
    return () => clearTimeout(timer);
  }, [win.phase, win.id, onClosed, onMinimized]);

  // Keep the window reachable when the viewport shrinks.
  useEffect(() => {
    function onResize() {
      if (isSheet()) return;
      setRect((r) => {
        const width = Math.max(MIN_W, Math.min(r.width, window.innerWidth - 16));
        return { ...r, width, ...clampPosition(r.left, r.top, width) };
      });
    }
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  function startGesture(e, kind) {
    if (e.button !== 0 || isSheet() || win.zoomed) return;
    if (kind === "drag" && e.target.closest("button")) return;
    e.preventDefault();
    const box = ref.current.getBoundingClientRect();
    gesture.current = { kind, x: e.clientX, y: e.clientY, box };
    e.currentTarget.setPointerCapture(e.pointerId);
    setMode(kind);
  }

  function moveGesture(e) {
    const g = gesture.current;
    if (!g) return;
    const dx = e.clientX - g.x;
    const dy = e.clientY - g.y;
    if (g.kind === "drag") {
      setRect((r) => ({ ...r, ...clampPosition(g.box.left + dx, g.box.top + dy, g.box.width) }));
    } else {
      setRect((r) => ({
        ...r,
        width: clamp(g.box.width + dx, MIN_W, window.innerWidth - g.box.left - 4),
        height: clamp(g.box.height + dy, MIN_H, window.innerHeight - g.box.top - 4),
      }));
    }
  }

  function endGesture() {
    gesture.current = null;
    setMode(null);
  }

  return (
    <section
      ref={ref}
      className={cx(
        s.window,
        active && s.isActive,
        win.zoomed && s.isZoomed,
        win.phase === "closing" && s.isClosing,
        win.phase === "minimizing" && s.isMinimizing,
        mode === "drag" && s.isDragging,
        mode === "resize" && s.isResizing
      )}
      data-app={win.id}
      role="dialog"
      aria-labelledby={titleId}
      tabIndex={-1}
      hidden={win.minimized}
      style={{ ...rect, zIndex: win.z }}
      onPointerDownCapture={() => !active && onActivate(win.id)}
      onFocus={() => !active && onActivate(win.id)}
      onAnimationEnd={(e) => {
        if (e.target !== e.currentTarget) return;
        if (win.phase === "closing") onClosed(win.id);
        else if (win.phase === "minimizing") onMinimized(win.id);
      }}
    >
      <div
        className={s.titlebar}
        onPointerDown={(e) => startGesture(e, "drag")}
        onPointerMove={moveGesture}
        onPointerUp={endGesture}
        onPointerCancel={endGesture}
        onDoubleClick={(e) => {
          if (!e.target.closest("button")) onZoom(win.id);
        }}
      >
        <div className={s.controls}>
          <button
            type="button"
            className={cx(s.ctl, s.ctlClose)}
            aria-label={`Close ${app.title}`}
            onClick={() => onClose(win.id)}
          >
            <ControlGlyph name="close" />
          </button>
          <button
            type="button"
            className={cx(s.ctl, s.ctlMin)}
            aria-label={`Minimize ${app.title}`}
            onClick={() => onMinimize(win.id)}
          >
            <ControlGlyph name="minimize" />
          </button>
          <button
            type="button"
            className={cx(s.ctl, s.ctlZoom)}
            aria-label={`Zoom ${app.title}`}
            aria-pressed={win.zoomed}
            onClick={() => onZoom(win.id)}
          >
            <ControlGlyph name="zoom" />
          </button>
        </div>
        <h2 id={titleId}>{app.title}</h2>
      </div>
      <div className={cx(s.content, win.id === "terminal" && s.terminalContent)}>{children}</div>
      <div
        className={s.resize}
        aria-hidden="true"
        onPointerDown={(e) => startGesture(e, "resize")}
        onPointerMove={moveGesture}
        onPointerUp={endGesture}
        onPointerCancel={endGesture}
      />
    </section>
  );
}
