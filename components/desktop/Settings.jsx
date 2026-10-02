"use client";

import { useEffect, useState } from "react";
import { APP_IDS, APP_META, SOURCE_URL, WALLPAPERS, wallpaperUrl } from "./catalog";
import { Icon } from "./icons";
import { playStartup, resetIcons, setPlacement, updateSettings, useSettings } from "./settings";
import { setAppearance, useAppearance } from "./theme";
import s from "./desktop.module.css";

const SECTIONS = [
  { id: "wallpaper", label: "Wallpaper" },
  { id: "appearance", label: "Appearance" },
  { id: "icons", label: "Desktop & Dock" },
  { id: "startup", label: "Startup" },
  { id: "about", label: "About" },
];

const APPEARANCE_OPTIONS = [
  { id: "auto", label: "Auto", note: "Match system" },
  { id: "light", label: "Light" },
  { id: "dark", label: "Dark" },
];

function scrollToSection(id) {
  // Scroll only the settings pane; scrollIntoView would also shift the window.
  const el = document.getElementById(`settings-${id}`);
  const pane = el?.parentElement;
  if (!pane) return;
  const smooth = !window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  pane.scrollTo({
    top: pane.scrollTop + el.getBoundingClientRect().top - pane.getBoundingClientRect().top,
    behavior: smooth ? "smooth" : "auto",
  });
}

export default function SettingsApp({ section, onResetDesktop }) {
  const settings = useSettings();
  const appearance = useAppearance();
  const [confirmReset, setConfirmReset] = useState(false);
  const selectedWall = WALLPAPERS.find((w) => w.id === settings.wallpaper);

  // Jump to a section when another part of the desktop asks for one.
  useEffect(() => {
    if (section?.name) scrollToSection(section.name);
  }, [section]);

  useEffect(() => {
    if (!confirmReset) return;
    const timer = setTimeout(() => setConfirmReset(false), 4000);
    return () => clearTimeout(timer);
  }, [confirmReset]);

  const sectionProps = (id) => ({
    id: `settings-${id}`,
    className: s.setSection,
    "aria-labelledby": `set-${id}`,
  });

  return (
    <div className={s.settings}>
      <nav className={s.setNav} aria-label="Settings sections">
        {SECTIONS.map((sec) => (
          <button
            key={sec.id}
            type="button"
            onClick={() => scrollToSection(sec.id)}
          >
            {sec.label}
          </button>
        ))}
      </nav>

      <div className={s.setBody}>
        {/* ── Wallpaper ── */}
        <section {...sectionProps("wallpaper")}>
          <h3 id="set-wallpaper">Wallpaper</h3>
          <div className={s.wallGrid} role="radiogroup" aria-labelledby="set-wallpaper">
            {WALLPAPERS.map((w) => (
              <button
                key={w.id}
                type="button"
                role="radio"
                aria-checked={settings.wallpaper === w.id}
                className={s.wallOption}
                onClick={() => updateSettings({ wallpaper: w.id })}
                data-autofocus={settings.wallpaper === w.id ? "" : undefined}
              >
                <span
                  className={w.id === "classic" ? `${s.wallThumb} ${s.wallThumbClassic}` : s.wallThumb}
                  style={w.id === "classic" ? undefined : { backgroundImage: `url(${wallpaperUrl(w.id, true)})` }}
                  aria-hidden="true"
                />
                <span className={s.wallName}>{w.name}</span>
                <span className={s.wallKind}>{w.kind}</span>
              </button>
            ))}
          </div>
          <p className={s.setNote}>
            {selectedWall.author ? (
              <>
                “{selectedWall.name}” by {selectedWall.author}, {selectedWall.license}, via{" "}
                <a href={selectedWall.source} target="_blank" rel="noopener noreferrer">
                  Wikimedia Commons
                </a>
                .
              </>
            ) : (
              "The original wallpaper, drawn in CSS. It follows the light and dark appearance."
            )}
          </p>
        </section>

        {/* ── Appearance ── */}
        <section {...sectionProps("appearance")}>
          <h3 id="set-appearance">Appearance</h3>
          <div className={s.appearanceRow} role="radiogroup" aria-labelledby="set-appearance">
            {APPEARANCE_OPTIONS.map((opt) => (
              <button
                key={opt.id}
                type="button"
                role="radio"
                aria-checked={appearance === opt.id}
                className={s.appearanceOption}
                onClick={() => setAppearance(opt.id)}
              >
                <span className={`${s.appearancePreview} ${s[`preview_${opt.id}`]}`} aria-hidden="true">
                  <span />
                </span>
                <span>{opt.label}</span>
                {opt.note && <small>{opt.note}</small>}
              </button>
            ))}
          </div>
        </section>

        {/* ── Desktop & Dock ── */}
        <section {...sectionProps("icons")}>
          <h3 id="set-icons">Desktop &amp; Dock</h3>
          <p className={s.setNote}>
            Drag icons to rearrange them, or drag an app between the desktop and the dock to move it.
            Right-click any icon for more options, or choose where each app appears below.
          </p>
          <table className={s.placeTable}>
            <thead>
              <tr>
                <th scope="col">App</th>
                <th scope="col">Desktop</th>
                <th scope="col">Dock</th>
              </tr>
            </thead>
            <tbody>
              {APP_IDS.map((id) => (
                <tr key={id}>
                  <th scope="row">
                    <span className={s.miniIcon} style={{ "--tile": APP_META[id].tile }} aria-hidden="true">
                      <Icon name={id} />
                    </span>
                    {APP_META[id].title}
                  </th>
                  {["desktop", "dock"].map((where) => (
                    <td key={where}>
                      <input
                        type="checkbox"
                        className={s.check}
                        checked={settings[where].includes(id)}
                        onChange={(e) => setPlacement(id, where, e.target.checked)}
                        aria-label={`Show ${APP_META[id].title} on the ${where}`}
                      />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
          <button type="button" className={s.btn} onClick={resetIcons}>
            Reset Icons &amp; Dock
          </button>
        </section>

        {/* ── Startup ── */}
        <section {...sectionProps("startup")}>
          <h3 id="set-startup">Startup</h3>
          <div className={s.setRow}>
            <div>
              <strong id="startup-label">Play startup animation</strong>
              <small>Shows the boot screen each time you visit the desktop.</small>
            </div>
            <button
              type="button"
              role="switch"
              aria-checked={settings.startup}
              aria-labelledby="startup-label"
              className={s.switch}
              onClick={() => updateSettings({ startup: !settings.startup })}
            >
              <span />
            </button>
          </div>
          <button type="button" className={s.btn} onClick={playStartup}>
            Play it now
          </button>
        </section>

        {/* ── About ── */}
        <section {...sectionProps("about")}>
          <h3 id="set-about">About This Desktop</h3>
          <p>
            A desktop-style take on my portfolio, built with Next.js and React. Every window, the
            dock, the terminal and these settings are written from scratch, with no UI library.
            Your wallpaper, appearance, icon layout and notes are saved in this browser only.
          </p>
          <div className={s.btnRow}>
            <a className={`${s.btn} ${s.btnPrimary}`} href={SOURCE_URL} target="_blank" rel="noopener noreferrer">
              <Icon name="github" />
              View source on GitHub
            </a>
            <button
              type="button"
              className={`${s.btn} ${confirmReset ? s.btnDanger : ""}`}
              onClick={() => {
                if (!confirmReset) return setConfirmReset(true);
                setConfirmReset(false);
                onResetDesktop();
              }}
            >
              {confirmReset ? "Click again to reset" : "Reset Desktop"}
            </button>
          </div>
          <p className={s.setNote}>
            Reset restores the default wallpaper, appearance, icons and startup setting. Your notes
            are kept.
          </p>
        </section>
      </div>
    </div>
  );
}
