"use client";

import { useEffect, useRef } from "react";

// Hero background: a small feed-forward network drawn like a textbook figure.
// Signals travel along the strongest weights layer by layer, lighting up the
// nodes they reach. Pauses when off screen; static when motion is reduced.

const LAYERS = [4, 6, 6, 3];
const LAYER_LABELS = ["input", "hidden", "hidden", "output"];
const PASS_MS = 1700; // a new forward pass starts this often
const SIGNAL_MS = 900; // time for a signal to cross one edge
const GLOW_MS = 650; // node glow half-life-ish decay
const AMBER = "245, 158, 11";
const ZINC = "161, 161, 170";

const SUB = "₀₁₂₃₄₅₆₇₈₉";
const sub = (n) => String(n).replace(/\d/g, (d) => SUB[d]);

// Deterministic weights so the figure looks the same on every visit.
function seeded(seed) {
  return () => {
    seed = (seed * 1664525 + 1013904223) % 4294967296;
    return seed / 4294967296;
  };
}

function buildNetwork() {
  const rand = seeded(7);
  const nodes = [];
  const edges = [];
  LAYERS.forEach((count, layer) => {
    for (let i = 0; i < count; i++) {
      nodes.push({ layer, index: i, count, x: 0, y: 0, glow: 0, firedPass: -1, out: [] });
    }
  });
  for (let layer = 0; layer < LAYERS.length - 1; layer++) {
    const from = nodes.filter((n) => n.layer === layer);
    const to = nodes.filter((n) => n.layer === layer + 1);
    for (const a of from) {
      for (const b of to) {
        const w = rand() * 2 - 1;
        const edge = { a, b, w, strength: Math.abs(w), heat: 0 };
        edges.push(edge);
        a.out.push(edge);
      }
    }
  }
  // Each node only passes signals along its strongest outgoing weights.
  for (const n of nodes) n.out.sort((e1, e2) => e2.strength - e1.strength);
  return { nodes, edges };
}

// Where the figure sits: beside the hero text on wide screens, behind it
// (and fainter) on narrow ones.
function layout(net, width, height) {
  const wide = width >= 1200;
  let left, right, top, bottom;
  if (wide) {
    const containerLeft = Math.max(0, (width - 1024) / 2) + 24;
    left = Math.min(width * 0.64, containerLeft + 680);
    right = width - Math.max(48, containerLeft * 0.55);
    top = height * 0.2;
    bottom = height * 0.8;
  } else {
    left = width * 0.12;
    right = width * 0.88;
    top = height * 0.14;
    bottom = height * 0.86;
  }
  const columns = LAYERS.length - 1;
  for (const n of net.nodes) {
    const span = (bottom - top) * Math.min(1, (n.count + 1) / 7);
    const mid = (top + bottom) / 2;
    n.x = left + ((right - left) * n.layer) / columns;
    n.y = n.count === 1 ? mid : mid - span / 2 + (span * n.index) / (n.count - 1);
  }
  return { wide, bottom };
}

export default function NeuralNet() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    const net = buildNetwork();
    const rand = seeded(42);
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let signals = [];
    let pass = 0;
    let lastPass = -Infinity;
    let last = performance.now();
    let frame = 0;
    let visible = true;
    let geo = { wide: true, bottom: 0 };
    let size = { w: 0, h: 0 };

    function resize() {
      const box = canvas.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      size = { w: box.width, h: box.height };
      canvas.width = Math.round(box.width * dpr);
      canvas.height = Math.round(box.height * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      geo = layout(net, box.width, box.height);
      if (reduced) draw();
    }

    function fire(node) {
      if (node.firedPass === pass) return;
      node.firedPass = pass;
      // Two or three of the strongest weights carry the signal on.
      const fanOut = 2 + (rand() < 0.4 ? 1 : 0);
      node.out
        .slice(0, 4)
        .sort(() => rand() - 0.5)
        .slice(0, fanOut)
        .forEach((edge) => signals.push({ edge, t: 0 }));
    }

    function startPass() {
      pass++;
      const inputs = net.nodes.filter((n) => n.layer === 0);
      // Light up a random subset of the inputs.
      inputs.forEach((n) => {
        if (rand() < 0.6) {
          n.glow = 1;
          fire(n);
        }
      });
    }

    function step(dt) {
      for (const s of signals) s.t += dt / SIGNAL_MS;
      const arrived = signals.filter((s) => s.t >= 1);
      signals = signals.filter((s) => s.t < 1);
      for (const s of arrived) {
        s.edge.b.glow = 1;
        s.edge.heat = 1;
        if (s.edge.b.layer < LAYERS.length - 1) fire(s.edge.b);
      }
      const decay = Math.pow(0.5, dt / GLOW_MS);
      for (const n of net.nodes) n.glow *= decay;
      for (const e of net.edges) e.heat *= decay;
      for (const s of signals) s.edge.heat = Math.max(s.edge.heat, 0.5);
    }

    function draw() {
      const { w, h } = size;
      ctx.clearRect(0, 0, w, h);
      const fade = geo.wide ? 1 : 0.3;

      // Edges: stronger weights are more visible; positive amber, negative grey.
      ctx.lineWidth = 1;
      for (const e of net.edges) {
        const base = 0.05 + e.strength * 0.13 + e.heat * 0.35;
        ctx.strokeStyle = `rgba(${e.w > 0 ? AMBER : ZINC}, ${base * fade})`;
        ctx.beginPath();
        ctx.moveTo(e.a.x, e.a.y);
        ctx.lineTo(e.b.x, e.b.y);
        ctx.stroke();
      }

      // Signals: a short bright streak moving along the edge.
      for (const s of signals) {
        const { a, b } = s.edge;
        const t0 = Math.max(0, s.t - 0.12);
        const x0 = a.x + (b.x - a.x) * t0;
        const y0 = a.y + (b.y - a.y) * t0;
        const x1 = a.x + (b.x - a.x) * s.t;
        const y1 = a.y + (b.y - a.y) * s.t;
        const grad = ctx.createLinearGradient(x0, y0, x1, y1);
        grad.addColorStop(0, `rgba(${AMBER}, 0)`);
        grad.addColorStop(1, `rgba(${AMBER}, ${0.9 * fade})`);
        ctx.strokeStyle = grad;
        ctx.lineWidth = 1.6;
        ctx.beginPath();
        ctx.moveTo(x0, y0);
        ctx.lineTo(x1, y1);
        ctx.stroke();
        ctx.fillStyle = `rgba(253, 230, 138, ${0.95 * fade})`;
        ctx.beginPath();
        ctx.arc(x1, y1, 1.8, 0, Math.PI * 2);
        ctx.fill();
      }

      // Nodes.
      for (const n of net.nodes) {
        if (n.glow > 0.02) {
          ctx.fillStyle = `rgba(${AMBER}, ${0.12 * n.glow * fade})`;
          ctx.beginPath();
          ctx.arc(n.x, n.y, 7 + 9 * n.glow, 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.fillStyle = "#0a0a0a";
        ctx.beginPath();
        ctx.arc(n.x, n.y, 6, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = `rgba(${AMBER}, ${(0.08 + 0.75 * n.glow) * fade})`;
        ctx.fill();
        ctx.strokeStyle = `rgba(${AMBER}, ${(0.45 + 0.5 * n.glow) * fade})`;
        ctx.lineWidth = 1.2;
        ctx.stroke();
      }

      // Textbook annotations (only beside the text, never behind it).
      if (!geo.wide) return;
      ctx.font = "11px ui-monospace, 'Cascadia Code', Menlo, Consolas, monospace";
      ctx.textBaseline = "middle";
      ctx.fillStyle = `rgba(${ZINC}, ${0.45 * fade})`;
      for (const n of net.nodes) {
        if (n.layer === 0) {
          ctx.textAlign = "right";
          ctx.fillText(`x${sub(n.index + 1)}`, n.x - 14, n.y);
        } else if (n.layer === LAYERS.length - 1) {
          ctx.textAlign = "left";
          ctx.fillText(`ŷ${sub(n.index + 1)}`, n.x + 14, n.y);
        }
      }
      ctx.textAlign = "center";
      ctx.fillStyle = `rgba(${ZINC}, ${0.3 * fade})`;
      const labelY = geo.bottom + 28;
      LAYERS.forEach((_, layer) => {
        const x = net.nodes.find((n) => n.layer === layer).x;
        ctx.fillText(LAYER_LABELS[layer], x, labelY);
      });
    }

    function tick(now) {
      frame = requestAnimationFrame(tick);
      const dt = Math.min(64, now - last);
      last = now;
      if (!visible || document.hidden) return;
      if (now - lastPass > PASS_MS) {
        lastPass = now;
        startPass();
      }
      step(dt);
      draw();
    }

    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(canvas);

    if (reduced) {
      // One still frame with a few nodes lit.
      net.nodes.forEach((n, i) => (n.glow = i % 3 === 0 ? 0.7 : 0));
      draw();
      return () => ro.disconnect();
    }

    const io = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
    });
    io.observe(canvas);
    frame = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(frame);
      ro.disconnect();
      io.disconnect();
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 h-full w-full pointer-events-none anim-fade-in"
      aria-hidden="true"
    />
  );
}
