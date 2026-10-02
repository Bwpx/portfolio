"use client";

import { useEffect } from "react";
import { wallpaperUrl } from "./catalog";
import { STARTUP_EVENT, getSettings } from "./settings";
import s from "./desktop.module.css";

const MIN_MS = 2600;
const MAX_MS = 6000;
const FADE_MS = 600;

// Boot screen. It shows whenever the desktop root has data-boot="in", which
// the inline settings script sets before first paint when startup is enabled.
// It stays up until the wallpaper has loaded (within limits), and any click
// or key press skips it.
export default function StartupScreen({ name, handle }) {
  useEffect(() => {
    const root = document.querySelector("[data-desk-root]");
    let timers = [];
    let run = 0;

    const clear = () => {
      timers.forEach(clearTimeout);
      timers = [];
    };

    function finish() {
      if (root.dataset.boot !== "in") return;
      clear();
      root.dataset.boot = "out";
      timers.push(setTimeout(() => delete root.dataset.boot, FADE_MS));
    }

    function schedule() {
      const id = ++run;
      const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      const started = performance.now();
      const minMs = reduced ? 900 : MIN_MS;
      const done = () => {
        if (id !== run) return;
        timers.push(setTimeout(finish, Math.max(0, minMs - (performance.now() - started))));
      };
      const { wallpaper } = getSettings();
      if (wallpaper === "classic") done();
      else {
        const img = new Image();
        img.src = wallpaperUrl(wallpaper);
        img.decode().then(done, done);
      }
      timers.push(setTimeout(finish, MAX_MS));
    }

    function start() {
      clear();
      delete root.dataset.boot;
      void root.offsetWidth; // restart the CSS animations
      root.dataset.boot = "in";
      schedule();
    }

    const skip = () => finish();

    // A client-side navigation skips the inline script, so start here instead.
    if (root.dataset.boot === "in") schedule();
    else if (getSettings().startup) start();

    window.addEventListener(STARTUP_EVENT, start);
    document.addEventListener("keydown", skip, true);
    document.addEventListener("pointerdown", skip, true);
    return () => {
      clear();
      run++;
      delete root.dataset.boot;
      window.removeEventListener(STARTUP_EVENT, start);
      document.removeEventListener("keydown", skip, true);
      document.removeEventListener("pointerdown", skip, true);
    };
  }, []);

  return (
    <div className={s.boot}>
      <div className={s.bootInner} aria-hidden="true">
        <div className={s.bootMark}>
          {handle}<span>@</span>portfolio<span>:~$</span>
          <i className={s.bootCursor} />
        </div>
        <p className={s.bootName}>{name}</p>
        <div className={s.bootBar}>
          <span />
        </div>
        <p className={s.bootCaption}>Starting desktop…</p>
      </div>
      <span className={s.srOnly} role="status">
        Starting desktop. Press any key to skip.
      </span>
    </div>
  );
}
