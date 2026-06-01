const canvas = document.querySelector("#gameCanvas");
const ctx = canvas.getContext("2d");

const ui = {
  levelBadge: document.querySelector("#levelBadge"),
  scoreBadge: document.querySelector("#scoreBadge"),
  statusBadge: document.querySelector("#statusBadge"),
  energyValue: document.querySelector("#energyValue"),
  energyBar: document.querySelector("#energyBar"),
  heatValue: document.querySelector("#heatValue"),
  heatBar: document.querySelector("#heatBar"),
  movesValue: document.querySelector("#movesValue"),
  leaksValue: document.querySelector("#leaksValue"),
  timeValue: document.querySelector("#timeValue"),
  levelValue: document.querySelector("#levelValue"),
  messageLayer: document.querySelector("#messageLayer"),
  messageTitle: document.querySelector("#messageTitle"),
  messageText: document.querySelector("#messageText"),
  primaryButton: document.querySelector("#primaryButton"),
  primaryButtonText: document.querySelector("#primaryButtonText"),
  restartButton: document.querySelector("#restartButton"),
  nextButton: document.querySelector("#nextButton"),
  footerStatus: document.querySelector("#footerStatus"),
  dots: Array.from(document.querySelectorAll("[data-level-dot]"))
};

const dirs = [
  { key: "n", dx: 0, dy: -1 },
  { key: "e", dx: 1, dy: 0 },
  { key: "s", dx: 0, dy: 1 },
  { key: "w", dx: -1, dy: 0 }
];

const dirIndex = { n: 0, e: 1, s: 2, w: 3 };
const opposite = { n: "s", e: "w", s: "n", w: "e" };
const baseConnections = {
  line: ["n", "s"],
  corner: ["n", "e"],
  tee: ["n", "e", "s"],
  cross: ["n", "e", "s", "w"],
  end: ["e"]
};

const levels = [
  {
    name: "Boot Trace",
    drain: 2.9,
    leakDrain: 12,
    rotateCost: 1.8,
    cells: [
      ["source", 0, 3, "end", 0],
      ["core", 6, 3, "end", 2],
      ["wire", 1, 3, "line", 1],
      ["wire", 2, 3, "corner", 3],
      ["wire", 2, 2, "line", 0],
      ["wire", 2, 1, "corner", 1],
      ["wire", 3, 1, "line", 1],
      ["wire", 4, 1, "corner", 2],
      ["wire", 4, 2, "line", 0],
      ["wire", 4, 3, "corner", 0],
      ["wire", 5, 3, "line", 1],
      ["leak", 1, 2, "corner", 2],
      ["leak", 3, 3, "tee", 1],
      ["wire", 5, 1, "corner", 1],
      ["wire", 3, 5, "corner", 0],
      ["block", 0, 1],
      ["block", 6, 5]
    ]
  },
  {
    name: "Relay Bend",
    drain: 3.25,
    leakDrain: 13.5,
    rotateCost: 2,
    cells: [
      ["source", 0, 1, "end", 0],
      ["core", 6, 5, "end", 2],
      ["wire", 1, 1, "line", 1],
      ["wire", 2, 1, "corner", 2],
      ["wire", 2, 2, "line", 0],
      ["wire", 2, 3, "corner", 0],
      ["wire", 3, 3, "line", 1],
      ["wire", 4, 3, "corner", 2],
      ["wire", 4, 4, "line", 0],
      ["wire", 4, 5, "corner", 0],
      ["wire", 5, 5, "line", 1],
      ["leak", 3, 2, "tee", 0],
      ["leak", 5, 2, "corner", 2],
      ["wire", 1, 4, "tee", 3],
      ["wire", 5, 4, "line", 1],
      ["block", 0, 5],
      ["block", 3, 0],
      ["block", 6, 1]
    ]
  },
  {
    name: "Copper Maze",
    drain: 3.55,
    leakDrain: 14,
    rotateCost: 2.1,
    cells: [
      ["source", 0, 5, "end", 0],
      ["core", 6, 1, "end", 2],
      ["wire", 1, 5, "corner", 3],
      ["wire", 1, 4, "line", 0],
      ["wire", 1, 3, "corner", 1],
      ["wire", 2, 3, "line", 1],
      ["wire", 3, 3, "corner", 3],
      ["wire", 3, 2, "line", 0],
      ["wire", 3, 1, "corner", 1],
      ["wire", 4, 1, "line", 1],
      ["wire", 5, 1, "line", 1],
      ["leak", 2, 5, "tee", 2],
      ["leak", 4, 3, "corner", 1],
      ["leak", 5, 4, "tee", 3],
      ["wire", 2, 1, "corner", 0],
      ["wire", 5, 2, "line", 0],
      ["block", 0, 2],
      ["block", 2, 6],
      ["block", 6, 4]
    ]
  },
  {
    name: "Hot Bus",
    drain: 3.9,
    leakDrain: 15.5,
    rotateCost: 2.25,
    cells: [
      ["source", 0, 2, "end", 0],
      ["core", 6, 4, "end", 2],
      ["wire", 1, 2, "line", 1],
      ["wire", 2, 2, "tee", 1],
      ["wire", 3, 2, "line", 1],
      ["wire", 4, 2, "corner", 2],
      ["wire", 4, 3, "line", 0],
      ["wire", 4, 4, "corner", 0],
      ["wire", 5, 4, "line", 1],
      ["leak", 2, 3, "end", 1],
      ["leak", 3, 4, "corner", 0],
      ["leak", 5, 2, "tee", 2],
      ["wire", 1, 5, "corner", 1],
      ["wire", 2, 5, "line", 1],
      ["wire", 5, 0, "corner", 2],
      ["block", 0, 0],
      ["block", 3, 5],
      ["block", 6, 1]
    ]
  },
  {
    name: "Core Sprint",
    drain: 4.35,
    leakDrain: 17,
    rotateCost: 2.35,
    cells: [
      ["source", 0, 3, "end", 0],
      ["core", 6, 3, "end", 2],
      ["wire", 1, 3, "corner", 3],
      ["wire", 1, 2, "corner", 1],
      ["wire", 2, 2, "line", 1],
      ["wire", 3, 2, "corner", 2],
      ["wire", 3, 3, "line", 0],
      ["wire", 3, 4, "corner", 0],
      ["wire", 4, 4, "line", 1],
      ["wire", 5, 4, "corner", 3],
      ["wire", 5, 3, "corner", 1],
      ["leak", 2, 3, "tee", 0],
      ["leak", 4, 2, "tee", 2],
      ["leak", 5, 1, "corner", 1],
      ["wire", 1, 5, "tee", 1],
      ["wire", 4, 5, "corner", 2],
      ["block", 0, 1],
      ["block", 2, 0],
      ["block", 6, 6]
    ]
  }
];

const state = {
  size: 7,
  levelIndex: 0,
  status: "idle",
  energy: 100,
  heat: 0,
  score: 0,
  moves: 0,
  elapsed: 0,
  totalElapsed: 0,
  levelScores: Array(levels.length).fill(0),
  selected: { x: 0, y: 0 },
  hover: null,
  cells: [],
  completed: new Set(),
  network: { powered: new Set(), edges: [], leakCount: 0, corePowered: false },
  lastFrame: performance.now(),
  pixelRatio: 1
};

function key(x, y) {
  return `${x},${y}`;
}

function getCell(x, y) {
  return state.cells.find((cell) => cell.x === x && cell.y === y);
}

function rotateDir(dir, rotation) {
  const index = (dirIndex[dir] + rotation + 4) % 4;
  return dirs[index].key;
}

function connections(cell) {
  if (!cell || !cell.shape) {
    return [];
  }
  return baseConnections[cell.shape].map((dir) => rotateDir(dir, cell.rotation));
}

function normalizeRotation(shape, rotation) {
  if (shape === "cross") {
    return 0;
  }
  return ((rotation % 4) + 4) % 4;
}

function scrambleRotation(shape, solution, index, levelIndex) {
  if (shape === "cross") {
    return 0;
  }

  const offset = ((index + levelIndex * 2) % 3) + 1;
  return normalizeRotation(shape, solution + offset);
}

function loadLevel(levelIndex) {
  const level = levels[levelIndex];
  state.levelIndex = levelIndex;
  state.status = "idle";
  state.energy = 100;
  state.heat = 0;
  state.moves = 0;
  state.elapsed = 0;
  state.selected = { x: 0, y: 0 };
  state.hover = null;
  state.cells = [];

  level.cells.forEach((entry, index) => {
    const [kind, x, y, shape, solutionRotation] = entry;
    if (kind === "block") {
      state.cells.push({ kind, x, y, fixed: true });
      return;
    }

    const fixed = kind === "source" || kind === "core";
    const rotation = fixed
      ? solutionRotation
      : scrambleRotation(shape, solutionRotation, index, levelIndex);
    state.cells.push({
      kind,
      x,
      y,
      shape,
      rotation,
      solutionRotation,
      fixed,
      leak: kind === "leak"
    });
  });

  const source = state.cells.find((cell) => cell.kind === "source");
  state.selected = { x: source.x, y: source.y };
  refreshNetwork();
  showMessage("Volt Runner", level.name, "Start run");
  syncUi();
}

function refreshNetwork() {
  const source = state.cells.find((cell) => cell.kind === "source");
  const powered = new Set();
  const edges = [];
  const queue = [source];
  const visited = new Set();

  while (queue.length) {
    const cell = queue.shift();
    if (!cell || visited.has(key(cell.x, cell.y))) {
      continue;
    }

    visited.add(key(cell.x, cell.y));
    powered.add(key(cell.x, cell.y));

    connections(cell).forEach((dir) => {
      const nextDir = dirs[dirIndex[dir]];
      const nx = cell.x + nextDir.dx;
      const ny = cell.y + nextDir.dy;
      const neighbor = getCell(nx, ny);

      if (!neighbor || neighbor.kind === "block") {
        return;
      }

      if (connections(neighbor).includes(opposite[dir])) {
        edges.push({ from: { x: cell.x, y: cell.y }, to: { x: nx, y: ny }, dir });
        if (!visited.has(key(nx, ny))) {
          queue.push(neighbor);
        }
      }
    });
  }

  const leakCount = state.cells.filter((cell) => cell.leak && powered.has(key(cell.x, cell.y))).length;
  const core = state.cells.find((cell) => cell.kind === "core");
  state.network = {
    powered,
    edges,
    leakCount,
    corePowered: powered.has(key(core.x, core.y))
  };
}

function startRun() {
  if (state.status === "won") {
    nextLevel();
    return;
  }

  if (state.status === "lost") {
    loadLevel(state.levelIndex);
    state.status = "running";
    hideMessage();
    return;
  }

  if (state.status === "complete") {
    restartLevel();
    return;
  }

  state.status = "running";
  state.lastFrame = performance.now();
  hideMessage();
  syncUi();
}

function restartLevel() {
  loadLevel(state.levelIndex);
  state.status = "running";
  hideMessage();
  syncUi();
}

function nextLevel() {
  if (state.levelIndex >= levels.length - 1) {
    state.completed.clear();
    state.score = 0;
    state.levelScores = Array(levels.length).fill(0);
    loadLevel(0);
    return;
  }

  loadLevel(state.levelIndex + 1);
}

function rotateCell(x, y) {
  const cell = getCell(x, y);
  if (!cell || cell.fixed || !cell.shape || state.status !== "running") {
    return;
  }

  cell.rotation = normalizeRotation(cell.shape, cell.rotation + 1);
  state.moves += 1;
  state.energy = Math.max(0, state.energy - levels[state.levelIndex].rotateCost);
  refreshNetwork();

  if (state.network.corePowered) {
    completeLevel();
  }

  syncUi();
}

function completeLevel() {
  if (state.status !== "running") {
    return;
  }

  const levelScore = Math.round(600 + state.energy * 14 - state.moves * 12 + Math.max(0, 45 - state.elapsed) * 8);
  const finalScore = Math.max(100, levelScore);
  const previousScore = state.levelScores[state.levelIndex] || 0;
  if (finalScore > previousScore) {
    state.score += finalScore - previousScore;
    state.levelScores[state.levelIndex] = finalScore;
  }
  state.completed.add(state.levelIndex);
  state.status = "won";

  const finalLevel = state.levelIndex === levels.length - 1;
  showMessage(
    finalLevel ? "Grid online" : "Level stable",
    finalLevel ? `Final score ${state.score}` : `Score ${state.score}`,
    finalLevel ? "Run again" : "Next level"
  );
  syncUi();
}

function failLevel() {
  state.status = "lost";
  state.energy = 0;
  showMessage("Charge lost", levels[state.levelIndex].name, "Retry");
  syncUi();
}

function showMessage(title, text, buttonText) {
  ui.messageTitle.textContent = title;
  ui.messageText.textContent = text;
  ui.primaryButtonText.textContent = buttonText;
  ui.messageLayer.classList.add("is-visible");
}

function hideMessage() {
  ui.messageLayer.classList.remove("is-visible");
}

function syncUi() {
  const level = levels[state.levelIndex];
  const energy = Math.max(0, Math.min(100, state.energy));
  const heat = Math.max(0, Math.min(100, state.heat));

  ui.levelBadge.textContent = `Level ${state.levelIndex + 1}`;
  ui.scoreBadge.textContent = `Score ${state.score}`;
  ui.statusBadge.textContent = statusLabel();
  ui.energyValue.textContent = `${Math.round(energy)}%`;
  ui.energyBar.style.width = `${energy}%`;
  ui.heatValue.textContent = `${Math.round(heat)}%`;
  ui.heatBar.style.width = `${heat}%`;
  ui.movesValue.textContent = state.moves;
  ui.leaksValue.textContent = state.network.leakCount;
  ui.timeValue.textContent = `${state.elapsed.toFixed(1)}s`;
  ui.levelValue.textContent = `${state.levelIndex + 1}/${levels.length}`;
  ui.nextButton.disabled = state.status !== "won";
  ui.footerStatus.textContent = `${level.name} / ${statusLabel()}`;

  ui.dots.forEach((dot, index) => {
    dot.classList.toggle("is-active", index === state.levelIndex);
    dot.classList.toggle("is-complete", state.completed.has(index));
  });
}

function statusLabel() {
  if (state.status === "running") {
    return state.network.corePowered ? "Linked" : "Live";
  }

  if (state.status === "won") {
    return "Stable";
  }

  if (state.status === "lost") {
    return "Offline";
  }

  return "Standby";
}

function update(dt) {
  if (state.status !== "running") {
    return;
  }

  const level = levels[state.levelIndex];
  refreshNetwork();

  state.elapsed += dt;
  state.totalElapsed += dt;
  state.energy -= dt * (level.drain + state.network.leakCount * level.leakDrain);
  const targetHeat = Math.min(100, state.network.leakCount * 34 + (100 - state.energy) * 0.18);
  state.heat += (targetHeat - state.heat) * Math.min(1, dt * 5);

  if (state.network.corePowered) {
    completeLevel();
  } else if (state.energy <= 0) {
    failLevel();
  }

  syncUi();
}

function resizeCanvas() {
  const rect = canvas.getBoundingClientRect();
  const ratio = Math.min(window.devicePixelRatio || 1, 2);
  const width = Math.max(320, Math.floor(rect.width));
  const height = Math.max(320, Math.floor(rect.height));
  state.pixelRatio = ratio;

  if (canvas.width !== width * ratio || canvas.height !== height * ratio) {
    canvas.width = width * ratio;
    canvas.height = height * ratio;
    ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
  }
}

function metrics() {
  const width = canvas.width / state.pixelRatio;
  const height = canvas.height / state.pixelRatio;
  const boardSize = Math.min(width, height) * 0.92;
  const cell = boardSize / state.size;
  return {
    width,
    height,
    boardSize,
    cell,
    x: (width - boardSize) / 2,
    y: (height - boardSize) / 2
  };
}

function render(now) {
  resizeCanvas();
  const m = metrics();
  ctx.clearRect(0, 0, m.width, m.height);
  drawBoard(m);
  drawCells(m, now);
  drawPulse(m, now);
  drawSelection(m);
}

function drawBoard(m) {
  const radius = 10;
  ctx.save();
  roundedRect(m.x - 10, m.y - 10, m.boardSize + 20, m.boardSize + 20, radius);
  ctx.fillStyle = "#0b181c";
  ctx.fill();
  ctx.strokeStyle = "rgba(66, 232, 212, 0.25)";
  ctx.lineWidth = 1;
  ctx.stroke();

  for (let y = 0; y < state.size; y += 1) {
    for (let x = 0; x < state.size; x += 1) {
      const px = m.x + x * m.cell;
      const py = m.y + y * m.cell;
      ctx.fillStyle = (x + y) % 2 === 0 ? "#0e2023" : "#0b1a1e";
      ctx.fillRect(px + 2, py + 2, m.cell - 4, m.cell - 4);
      ctx.strokeStyle = "rgba(157, 188, 182, 0.08)";
      ctx.strokeRect(px + 2, py + 2, m.cell - 4, m.cell - 4);

      ctx.fillStyle = "rgba(66, 232, 212, 0.16)";
      ctx.beginPath();
      ctx.arc(px + m.cell / 2, py + m.cell / 2, Math.max(2, m.cell * 0.035), 0, Math.PI * 2);
      ctx.fill();
    }
  }
  ctx.restore();
}

function drawCells(m, now) {
  state.cells.forEach((cell) => {
    const px = m.x + cell.x * m.cell;
    const py = m.y + cell.y * m.cell;
    const cx = px + m.cell / 2;
    const cy = py + m.cell / 2;
    const powered = state.network.powered.has(key(cell.x, cell.y));

    if (cell.kind === "block") {
      drawBlock(px, py, m.cell);
      return;
    }

    drawTileBase(px, py, m.cell, cell, powered);
    drawTrace(cx, cy, m.cell, cell, powered);

    if (cell.kind === "source") {
      drawSource(cx, cy, m.cell, powered, now);
    } else if (cell.kind === "core") {
      drawCore(cx, cy, m.cell, powered, now);
    } else if (cell.leak) {
      drawLeak(cx, cy, m.cell, powered, now);
    }
  });
}

function drawTileBase(px, py, size, cell, powered) {
  const inset = size * 0.1;
  ctx.save();
  roundedRect(px + inset, py + inset, size - inset * 2, size - inset * 2, 8);
  ctx.fillStyle = cell.fixed ? "#14282d" : "#112126";
  ctx.fill();
  ctx.strokeStyle = powered ? "rgba(66, 232, 212, 0.58)" : "rgba(238, 247, 244, 0.1)";
  ctx.lineWidth = powered ? 2 : 1;
  ctx.stroke();
  ctx.restore();
}

function drawTrace(cx, cy, size, cell, powered) {
  const traceWidth = Math.max(8, size * 0.12);
  const length = size * 0.34;
  const pad = Math.max(10, size * 0.15);
  const color = cell.leak && powered ? "#ff5d57" : powered ? "#42e8d4" : "#6f8c86";

  ctx.save();
  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  ctx.lineWidth = traceWidth;
  ctx.strokeStyle = color;
  ctx.globalAlpha = powered ? 1 : 0.62;
  if (powered) {
    ctx.shadowBlur = 16;
    ctx.shadowColor = color;
  }

  connections(cell).forEach((dir) => {
    const vector = dirs[dirIndex[dir]];
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.lineTo(cx + vector.dx * length, cy + vector.dy * length);
    ctx.stroke();
  });

  ctx.globalAlpha = 1;
  ctx.fillStyle = powered ? "#effffb" : "#90aaa5";
  ctx.shadowBlur = powered ? 12 : 0;
  ctx.beginPath();
  ctx.arc(cx, cy, pad * 0.36, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

function drawPulse(m, now) {
  if (!state.network.edges.length) {
    return;
  }

  const t = (now / 520) % 1;
  ctx.save();
  ctx.lineWidth = Math.max(3, m.cell * 0.045);
  ctx.lineCap = "round";
  ctx.strokeStyle = "#f4bf4c";
  ctx.shadowBlur = 14;
  ctx.shadowColor = "#f4bf4c";

  state.network.edges.forEach((edge, index) => {
    const from = centerOf(edge.from.x, edge.from.y, m);
    const to = centerOf(edge.to.x, edge.to.y, m);
    const phase = (t + index * 0.12) % 1;
    const x = from.x + (to.x - from.x) * phase;
    const y = from.y + (to.y - from.y) * phase;
    ctx.beginPath();
    ctx.arc(x, y, Math.max(3, m.cell * 0.055), 0, Math.PI * 2);
    ctx.stroke();
  });
  ctx.restore();
}

function drawSource(cx, cy, size, powered, now) {
  const pulse = powered ? Math.sin(now / 180) * 0.08 + 1 : 1;
  const w = size * 0.35 * pulse;
  const h = size * 0.26 * pulse;
  ctx.save();
  ctx.fillStyle = "#65f16f";
  ctx.shadowBlur = 18;
  ctx.shadowColor = "#65f16f";
  roundedRect(cx - w / 2, cy - h / 2, w, h, 4);
  ctx.fill();
  ctx.fillStyle = "#071015";
  ctx.fillRect(cx - w * 0.08, cy - h * 0.36, w * 0.16, h * 0.72);
  ctx.fillRect(cx - w * 0.36, cy - h * 0.08, w * 0.72, h * 0.16);
  ctx.restore();
}

function drawCore(cx, cy, size, powered, now) {
  const chip = size * 0.44;
  ctx.save();
  ctx.fillStyle = powered ? "#f4bf4c" : "#2a363a";
  ctx.strokeStyle = powered ? "#fff1ad" : "rgba(238, 247, 244, 0.28)";
  ctx.lineWidth = 2;
  ctx.shadowBlur = powered ? 22 + Math.sin(now / 160) * 6 : 0;
  ctx.shadowColor = "#f4bf4c";
  roundedRect(cx - chip / 2, cy - chip / 2, chip, chip, 6);
  ctx.fill();
  ctx.stroke();

  ctx.strokeStyle = powered ? "#fff7c8" : "rgba(238, 247, 244, 0.34)";
  ctx.lineWidth = 2;
  for (let i = -2; i <= 2; i += 1) {
    ctx.beginPath();
    ctx.moveTo(cx - chip * 0.72, cy + i * chip * 0.18);
    ctx.lineTo(cx - chip * 0.52, cy + i * chip * 0.18);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(cx + chip * 0.52, cy + i * chip * 0.18);
    ctx.lineTo(cx + chip * 0.72, cy + i * chip * 0.18);
    ctx.stroke();
  }
  ctx.restore();
}

function drawLeak(cx, cy, size, powered, now) {
  ctx.save();
  ctx.lineWidth = 2;
  ctx.strokeStyle = powered ? "#ff5d57" : "rgba(255, 93, 87, 0.42)";
  ctx.shadowBlur = powered ? 16 : 0;
  ctx.shadowColor = "#ff5d57";
  const radius = size * 0.28 + (powered ? Math.sin(now / 130) * size * 0.025 : 0);
  ctx.beginPath();
  ctx.arc(cx, cy, radius, 0.1, Math.PI * 1.85);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(cx + radius * 0.55, cy - radius * 0.35);
  ctx.lineTo(cx + radius * 0.2, cy + radius * 0.1);
  ctx.lineTo(cx + radius * 0.62, cy + radius * 0.04);
  ctx.lineTo(cx + radius * 0.18, cy + radius * 0.52);
  ctx.stroke();
  ctx.restore();
}

function drawBlock(px, py, size) {
  const inset = size * 0.16;
  ctx.save();
  roundedRect(px + inset, py + inset, size - inset * 2, size - inset * 2, 8);
  ctx.fillStyle = "#182429";
  ctx.fill();
  ctx.strokeStyle = "rgba(238, 247, 244, 0.1)";
  ctx.stroke();
  ctx.fillStyle = "rgba(238, 247, 244, 0.08)";
  for (let i = 0; i < 3; i += 1) {
    ctx.fillRect(px + size * 0.28, py + size * (0.34 + i * 0.12), size * 0.44, 2);
  }
  ctx.restore();
}

function drawSelection(m) {
  const target = state.hover || state.selected;
  if (!target) {
    return;
  }

  const cell = getCell(target.x, target.y);
  if (!cell || cell.fixed || cell.kind === "block") {
    return;
  }

  const px = m.x + target.x * m.cell;
  const py = m.y + target.y * m.cell;
  ctx.save();
  ctx.strokeStyle = state.status === "running" ? "#f4bf4c" : "rgba(244, 191, 76, 0.45)";
  ctx.lineWidth = 3;
  roundedRect(px + 5, py + 5, m.cell - 10, m.cell - 10, 8);
  ctx.stroke();
  ctx.restore();
}

function centerOf(x, y, m) {
  return {
    x: m.x + x * m.cell + m.cell / 2,
    y: m.y + y * m.cell + m.cell / 2
  };
}

function roundedRect(x, y, width, height, radius) {
  const r = Math.min(radius, width / 2, height / 2);
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + width - r, y);
  ctx.quadraticCurveTo(x + width, y, x + width, y + r);
  ctx.lineTo(x + width, y + height - r);
  ctx.quadraticCurveTo(x + width, y + height, x + width - r, y + height);
  ctx.lineTo(x + r, y + height);
  ctx.quadraticCurveTo(x, y + height, x, y + height - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
}

function pointerCell(event) {
  const rect = canvas.getBoundingClientRect();
  const m = metrics();
  const x = event.clientX - rect.left;
  const y = event.clientY - rect.top;
  const gx = Math.floor((x - m.x) / m.cell);
  const gy = Math.floor((y - m.y) / m.cell);

  if (gx < 0 || gy < 0 || gx >= state.size || gy >= state.size) {
    return null;
  }

  return { x: gx, y: gy };
}

canvas.addEventListener("pointermove", (event) => {
  state.hover = pointerCell(event);
});

canvas.addEventListener("pointerleave", () => {
  state.hover = null;
});

canvas.addEventListener("click", (event) => {
  const cell = pointerCell(event);
  if (!cell) {
    return;
  }

  state.selected = cell;
  rotateCell(cell.x, cell.y);
});

canvas.addEventListener("keydown", (event) => {
  const keyName = event.key.toLowerCase();
  let handled = true;

  if (keyName === "arrowup") {
    state.selected.y = Math.max(0, state.selected.y - 1);
  } else if (keyName === "arrowright") {
    state.selected.x = Math.min(state.size - 1, state.selected.x + 1);
  } else if (keyName === "arrowdown") {
    state.selected.y = Math.min(state.size - 1, state.selected.y + 1);
  } else if (keyName === "arrowleft") {
    state.selected.x = Math.max(0, state.selected.x - 1);
  } else if (keyName === " " || keyName === "enter") {
    rotateCell(state.selected.x, state.selected.y);
  } else if (keyName === "r") {
    restartLevel();
  } else if (keyName === "n" && state.status === "won") {
    nextLevel();
  } else {
    handled = false;
  }

  if (handled) {
    event.preventDefault();
  }
});

ui.primaryButton.addEventListener("click", startRun);
ui.restartButton.addEventListener("click", restartLevel);
ui.nextButton.addEventListener("click", nextLevel);

function frame(now) {
  const dt = Math.min(0.08, (now - state.lastFrame) / 1000);
  state.lastFrame = now;
  update(dt);
  render(now);
  requestAnimationFrame(frame);
}

window.addEventListener("resize", resizeCanvas);
loadLevel(0);
requestAnimationFrame(frame);
