"use client";

import { useState } from "react";
import { Icon } from "./icons";
import s from "./desktop.module.css";

const STORAGE_KEY = "mg-desktop-notes";

const WELCOME = {
  id: "welcome",
  text: "Welcome to Notes\n\nJot anything down here. Notes are saved in this browser only, so they'll still be here next time you visit.",
  updated: 0,
};

function loadNotes() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY));
    if (Array.isArray(saved) && saved.length) return saved;
  } catch {
    // Fall through to the welcome note.
  }
  return [WELCOME];
}

function saveNotes(notes) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(notes));
  } catch {
    // Not fatal; notes just won't persist.
  }
}

const titleOf = (note) => note.text.trim().split("\n")[0].slice(0, 60) || "New note";
const previewOf = (note) => note.text.trim().split("\n").slice(1).join(" ").trim().slice(0, 80);

let dateFormat;
const formatDate = (time) => {
  if (!time) return "";
  dateFormat ??= new Intl.DateTimeFormat(undefined, { month: "short", day: "numeric" });
  return dateFormat.format(time);
};

export default function NotesApp() {
  // Windows only mount on the client, so reading storage here is safe.
  const [notes, setNotes] = useState(loadNotes);
  const [activeId, setActiveId] = useState(() => notes[0].id);
  const active = notes.find((n) => n.id === activeId) ?? notes[0];

  function commit(next) {
    setNotes(next);
    saveNotes(next);
  }

  function edit(text) {
    const updated = { ...active, text, updated: Date.now() };
    commit([updated, ...notes.filter((n) => n.id !== active.id)]);
  }

  function create() {
    const note = { id: `n${Date.now().toString(36)}`, text: "", updated: Date.now() };
    commit([note, ...notes]);
    setActiveId(note.id);
  }

  function remove() {
    const rest = notes.filter((n) => n.id !== active.id);
    const next = rest.length ? rest : [{ id: `n${Date.now().toString(36)}`, text: "", updated: Date.now() }];
    commit(next);
    setActiveId(next[0].id);
  }

  return (
    <div className={s.notes}>
      <aside className={s.notesSide}>
        <div className={s.notesTools}>
          <span>{notes.length === 1 ? "1 note" : `${notes.length} notes`}</span>
          <button type="button" className={s.iconBtn} aria-label="New note" onClick={create}>
            <Icon name="plus" />
          </button>
          <button type="button" className={s.iconBtn} aria-label="Delete note" onClick={remove}>
            <Icon name="trash" />
          </button>
        </div>
        <ul className={s.noteList} aria-label="Notes">
          {notes.map((note) => (
            <li key={note.id}>
              <button
                type="button"
                aria-current={note.id === active.id ? "true" : undefined}
                onClick={() => setActiveId(note.id)}
              >
                <strong>{titleOf(note)}</strong>
                <small>
                  {formatDate(note.updated)} {previewOf(note)}
                </small>
              </button>
            </li>
          ))}
        </ul>
      </aside>
      <textarea
        key={active.id}
        className={s.noteEditor}
        value={active.text}
        onChange={(e) => edit(e.target.value)}
        onFocus={(e) => {
          // Keyboard focus lands at the end of the note; clicks still place the caret.
          const end = e.target.value.length;
          e.target.setSelectionRange(end, end);
        }}
        placeholder="Start typing…"
        aria-label={`Note: ${titleOf(active)}`}
        data-autofocus=""
      />
    </div>
  );
}
