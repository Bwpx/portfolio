"use client";

import { useState } from "react";
import s from "./desktop.module.css";

const START = { display: "0", acc: null, op: null, fresh: true };
const OPS = { "+": "+", "-": "−", "*": "×", "/": "÷" };
const MAX_DIGITS = 12;

// Fit a result in MAX_DIGITS digits, rounding away float noise (0.1 + 0.2).
function format(n) {
  if (!Number.isFinite(n)) return "Error";
  const abs = Math.abs(n);
  if (abs !== 0 && (abs >= 10 ** MAX_DIGITS || abs < 1e-8)) return n.toExponential(5);
  const intDigits = abs < 1 ? 1 : Math.floor(Math.log10(abs)) + 1;
  return String(Number(n.toFixed(Math.max(0, MAX_DIGITS - intDigits))));
}

function compute(a, b, op) {
  const x = Number(a);
  const y = Number(b);
  if (op === "+") return format(x + y);
  if (op === "-") return format(x - y);
  if (op === "*") return format(x * y);
  return format(x / y);
}

function reduce(st, key) {
  const error = st.display === "Error";
  if (/^\d$/.test(key)) {
    if (st.fresh || error) return { ...st, display: key, fresh: false };
    if (st.display.replace(/[-.]/g, "").length >= MAX_DIGITS) return st;
    return { ...st, display: st.display === "0" ? key : st.display + key };
  }
  switch (key) {
    case ".":
      if (st.fresh || error) return { ...st, display: "0.", fresh: false };
      return st.display.includes(".") ? st : { ...st, display: st.display + "." };
    case "+":
    case "-":
    case "*":
    case "/": {
      if (error) return st;
      if (st.op && !st.fresh) {
        const result = compute(st.acc, st.display, st.op);
        return { display: result, acc: result, op: key, fresh: true };
      }
      return { ...st, acc: st.op ? st.acc : st.display, op: key, fresh: true };
    }
    case "=": {
      if (!st.op || error) return st;
      return { display: compute(st.acc, st.display, st.op), acc: null, op: null, fresh: true };
    }
    case "clear":
      return !st.fresh && st.display !== "0" ? { ...st, display: "0", fresh: true } : START;
    case "sign":
      if (error || st.display === "0") return st;
      return { ...st, display: st.display.startsWith("-") ? st.display.slice(1) : "-" + st.display };
    case "%":
      return error ? st : { ...st, display: format(Number(st.display) / 100), fresh: true };
    case "back":
      if (st.fresh || error) return st;
      return { ...st, display: st.display.length > 1 && st.display !== "-0" ? st.display.slice(0, -1).replace(/^-$/, "0") : "0" };
    default:
      return st;
  }
}

const KEYMAP = {
  Enter: "=",
  "=": "=",
  Escape: "clear",
  Delete: "clear",
  Backspace: "back",
  "%": "%",
  x: "*",
  X: "*",
};

export default function CalculatorApp() {
  const [st, setSt] = useState(START);
  const press = (key) => setSt((cur) => reduce(cur, key));

  const clearLabel = !st.fresh && st.display !== "0" ? "C" : "AC";
  const rows = [
    [
      { key: "clear", label: clearLabel, kind: "fn", aria: clearLabel === "C" ? "Clear entry" : "All clear" },
      { key: "sign", label: "±", kind: "fn", aria: "Change sign" },
      { key: "%", label: "%", kind: "fn", aria: "Percent" },
      { key: "/", label: "÷", kind: "op", aria: "Divide" },
    ],
    [{ key: "7" }, { key: "8" }, { key: "9" }, { key: "*", label: "×", kind: "op", aria: "Multiply" }],
    [{ key: "4" }, { key: "5" }, { key: "6" }, { key: "-", label: "−", kind: "op", aria: "Subtract" }],
    [{ key: "1" }, { key: "2" }, { key: "3" }, { key: "+", label: "+", kind: "op", aria: "Add" }],
    [{ key: "0", wide: true }, { key: ".", label: ".", aria: "Decimal point" }, { key: "=", label: "=", kind: "op", aria: "Equals" }],
  ];

  return (
    <div
      className={s.calc}
      tabIndex={-1}
      data-autofocus=""
      onKeyDown={(e) => {
        if (e.ctrlKey || e.metaKey || e.altKey) return;
        const key = KEYMAP[e.key] ?? (/^[\d.+\-*/]$/.test(e.key) ? e.key : null);
        if (!key) return;
        // Escape clears here instead of closing the window.
        e.preventDefault();
        press(key);
      }}
    >
      <output className={s.calcDisplay} aria-live="polite" aria-label="Result">
        {st.op && st.fresh && st.acc !== null && (
          <span className={s.calcPending}>
            {st.acc} {OPS[st.op]}
          </span>
        )}
        <span className={s.calcValue} style={{ fontSize: st.display.length > 9 ? 28 : 44 }}>
          {st.display}
        </span>
      </output>
      <div className={s.calcKeys}>
        {rows.flat().map((b) => (
          <button
            key={b.key}
            type="button"
            className={[
              s.calcKey,
              b.kind === "op" && s.calcOp,
              b.kind === "fn" && s.calcFn,
              b.wide && s.calcWide,
              b.kind === "op" && b.key !== "=" && st.op === b.key && st.fresh && s.calcOpActive,
            ]
              .filter(Boolean)
              .join(" ")}
            aria-label={b.aria}
            onClick={() => press(b.key)}
          >
            {b.label ?? b.key}
          </button>
        ))}
      </div>
    </div>
  );
}
