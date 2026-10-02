"use client";

import { useEffect, useLayoutEffect, useRef } from "react";
import s from "./desktop.module.css";

// Right-click menu. `items` holds { label, action, disabled? } entries and
// "sep" separators. Closes on outside click, Escape, Tab or window blur.
export default function ContextMenu({ x, y, label, items, onClose }) {
  const ref = useRef(null);

  // Keep the menu on screen, then focus its first item.
  useLayoutEffect(() => {
    const el = ref.current;
    const { width, height } = el.getBoundingClientRect();
    el.style.left = `${Math.max(4, Math.min(x, window.innerWidth - width - 4))}px`;
    el.style.top = `${Math.max(4, Math.min(y, window.innerHeight - height - 4))}px`;
    el.querySelector('[role="menuitem"]:not(:disabled)')?.focus({ preventScroll: true });
  }, [x, y]);

  useEffect(() => {
    const onPointer = (e) => {
      if (!ref.current.contains(e.target)) onClose(false);
    };
    const onBlur = () => onClose(false);
    document.addEventListener("pointerdown", onPointer, true);
    window.addEventListener("blur", onBlur);
    window.addEventListener("resize", onBlur);
    return () => {
      document.removeEventListener("pointerdown", onPointer, true);
      window.removeEventListener("blur", onBlur);
      window.removeEventListener("resize", onBlur);
    };
  }, [onClose]);

  function handleKeyDown(e) {
    const list = Array.from(ref.current.querySelectorAll('[role="menuitem"]:not(:disabled)'));
    const i = list.indexOf(document.activeElement);
    const go = (n) => {
      e.preventDefault();
      list[(n + list.length) % list.length]?.focus();
    };
    if (e.key === "ArrowDown") go(i + 1);
    else if (e.key === "ArrowUp") go(i - 1);
    else if (e.key === "Home") go(0);
    else if (e.key === "End") go(list.length - 1);
    else if (e.key === "Escape") {
      e.preventDefault();
      onClose(true);
    } else if (e.key === "Tab") {
      e.preventDefault();
      onClose(true);
    }
  }

  return (
    <div
      ref={ref}
      className={`${s.sysMenu} ${s.ctxMenu}`}
      role="menu"
      aria-label={label}
      style={{ left: x, top: y }}
      onKeyDown={handleKeyDown}
      onContextMenu={(e) => e.preventDefault()}
    >
      {items.map((item, i) =>
        item === "sep" ? (
          <hr key={i} role="separator" />
        ) : (
          <button
            key={i}
            type="button"
            role="menuitem"
            disabled={item.disabled}
            onClick={() => {
              onClose(false);
              item.action();
            }}
          >
            {item.label}
          </button>
        )
      )}
    </div>
  );
}
