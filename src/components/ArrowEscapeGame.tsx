"use client";

import React, { useEffect, useState, useRef } from "react";

// ── Types ──────────────────────────────────────────────────────────────────
export type ArrowDir = "up" | "right" | "down" | "left";

export interface EscapePath {
  id: string;
  nodes: [number, number][]; // Grid coordinates [(r, c), (r, c), ...] leading out of bounds
  dir: ArrowDir;
  color: string;
}

export interface EscapePuzzleData {
  rows: number;
  cols: number;
  paths: EscapePath[];
  solveOrder: string[];
}

// ── Solvability Checker (DFS) ──────────────────────────────────────────────
export function solveEscapePuzzle(paths: EscapePath[], rows: number, cols: number): string[] | null {
  const activeIds = new Set(paths.map(p => p.id));
  const solveOrder: string[] = [];

  // Helper to check if a cell is currently occupied by another active arrow
  const isOccupied = (r: number, c: number, currentId: string) => {
    for (const p of paths) {
      if (p.id !== currentId && activeIds.has(p.id)) {
        const startNode = p.nodes[0];
        if (startNode[0] === r && startNode[1] === c) {
          return true;
        }
      }
    }
    return false;
  };

  // Helper to check if an arrow's path to exit is clear
  const isPathClear = (path: EscapePath) => {
    // Check all nodes after the start node
    for (let i = 1; i < path.nodes.length; i++) {
      const [r, c] = path.nodes[i];
      // If it's offgrid, it doesn't count as blocked
      if (r < 0 || r >= rows || c < 0 || c >= cols) continue;
      if (isOccupied(r, c, path.id)) {
        return true; // Blocked!
      }
    }
    return false; // Clear!
  };

  let progress = true;
  while (progress && activeIds.size > 0) {
    progress = false;
    for (const path of paths) {
      if (activeIds.has(path.id) && !isPathClear(path)) {
        activeIds.delete(path.id);
        solveOrder.push(path.id);
        progress = true;
        break; // Start over with updated active list
      }
    }
  }

  return activeIds.size === 0 ? solveOrder : null;
}

// ── Winding Path Level Generator ──────────────────────────────────────────
export function generateEscapePuzzle(
  rows: number,
  cols: number,
  targetArrows: number
): EscapePuzzleData {
  const colors = [
    "#3b82f6", "#10b981", "#fb923c", "#ec4899", "#8b5cf6",
    "#f59e0b", "#06b6d4", "#14b8a6", "#a855f7", "#f43f5e"
  ];

  const dirs = [
    { dir: "up" as ArrowDir, dr: -1, dc: 0 },
    { dir: "right" as ArrowDir, dr: 0, dc: 1 },
    { dir: "down" as ArrowDir, dr: 1, dc: 0 },
    { dir: "left" as ArrowDir, dr: 0, dc: -1 },
  ];

  let attempts = 0;
  while (attempts < 200) {
    attempts++;
    const paths: EscapePath[] = [];

    // Create a list of all cells and shuffle them to pick random starting points
    const cells: [number, number][] = [];
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        cells.push([r, c]);
      }
    }
    // Shuffle cells
    for (let i = cells.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [cells[i], cells[j]] = [cells[j], cells[i]];
    }

    const startCells = cells.slice(0, Math.min(targetArrows, cells.length));

    for (let i = 0; i < startCells.length; i++) {
      const [sr, sc] = startCells[i];
      const pathNodes: [number, number][] = [[sr, sc]];
      const visited = new Set<string>([`${sr},${sc}`]);

      let currR = sr;
      let currC = sc;
      let primaryDir = dirs[Math.floor(Math.random() * dirs.length)];
      let lastDir = primaryDir;

      // Keep stepping until we exit the grid
      let steps = 0;
      while (currR >= 0 && currR < rows && currC >= 0 && currC < cols && steps < 20) {
        steps++;
        let nextDir = lastDir;

        // 30% chance to turn 90 degrees
        if (Math.random() < 0.3) {
          const perpendiculars = dirs.filter(d => d.dr !== lastDir.dr && d.dc !== lastDir.dc);
          nextDir = perpendiculars[Math.floor(Math.random() * perpendiculars.length)];
        }

        const nr = currR + nextDir.dr;
        const nc = currC + nextDir.dc;
        const key = `${nr},${nc}`;

        if (visited.has(key)) {
          // Find any unvisited neighbor direction
          const valid = dirs.filter(d => {
            const tr = currR + d.dr;
            const tc = currC + d.dc;
            if (tr < 0 || tr >= rows || tc < 0 || tc >= cols) return true; // Exit is always valid
            return !visited.has(`${tr},${tc}`);
          });

          if (valid.length === 0) {
            // Force exit
            currR += lastDir.dr;
            currC += lastDir.dc;
            pathNodes.push([currR, currC]);
            break;
          }
          nextDir = valid[Math.floor(Math.random() * valid.length)];
        }

        currR += nextDir.dr;
        currC += nextDir.dc;
        pathNodes.push([currR, currC]);
        visited.add(`${currR},${currC}`);
        lastDir = nextDir;
      }

      // Determine initial direction (from node 0 to node 1)
      const dr = pathNodes[1][0] - pathNodes[0][0];
      const dc = pathNodes[1][1] - pathNodes[0][1];
      let dir: ArrowDir = "right";
      if (dr < 0) dir = "up";
      else if (dr > 0) dir = "down";
      else if (dc < 0) dir = "left";

      paths.push({
        id: `arrow_${i}`,
        nodes: pathNodes,
        dir,
        color: colors[i % colors.length]
      });
    }

    // Solve the generated layout to verify solvability
    const solveOrder = solveEscapePuzzle(paths, rows, cols);
    if (solveOrder && solveOrder.length === startCells.length) {
      return {
        rows,
        cols,
        paths,
        solveOrder
      };
    }
  }

  // Fallback generation (simple straight escapes if DFS fails to find a solvable winding structure)
  const paths: EscapePath[] = [];
  const spacing = Math.floor(rows / 3) || 1;
  let idx = 0;
  for (let r = 0; r < rows; r += spacing) {
    for (let c = 0; c < cols; c += spacing) {
      if (paths.length >= targetArrows) break;
      const dOptions: ArrowDir[] = ["up", "right", "down", "left"];
      const dir = dOptions[idx % dOptions.length];
      const nodes: [number, number][] = [[r, c]];
      let tr = r;
      let tc = c;
      const dr = dir === "up" ? -1 : dir === "down" ? 1 : 0;
      const dc = dir === "left" ? -1 : dir === "right" ? 1 : 0;
      while (tr >= 0 && tr < rows && tc >= 0 && tc < cols) {
        tr += dr;
        tc += dc;
        nodes.push([tr, tc]);
      }
      paths.push({
        id: `arrow_${idx}`,
        nodes,
        dir,
        color: colors[idx % colors.length]
      });
      idx++;
    }
  }

  return {
    rows,
    cols,
    paths,
    solveOrder: paths.map(p => p.id)
  };
}

// ── Component Props ────────────────────────────────────────────────────────
interface ArrowEscapeGameProps {
  maze: EscapePuzzleData | null;
  clearedIds: string[];
  isFinished: boolean;
  onClearArrow: (id: string) => void;
  difficulty: "easy" | "medium" | "hard";
  elapsedTime: number;
  finishRank?: number;
  arrowFormat?: "neon" | "unicode" | "emoji" | "cardinal";
}

const DIFF_COLORS = {
  easy:   { bg: "rgba(34,197,94,0.15)",   text: "#4ade80",  border: "rgba(34,197,94,0.35)"   },
  medium: { bg: "rgba(251,146,60,0.15)",  text: "#fb923c",  border: "rgba(251,146,60,0.35)"  },
  hard:   { bg: "rgba(239,68,68,0.15)",   text: "#f87171",  border: "rgba(239,68,68,0.35)"   },
};

function pad(n: number) { return n.toString().padStart(2, "0"); }
function fmtTime(s: number) { return `${pad(Math.floor(s / 60))}:${pad(s % 60)}`; }

export default function ArrowEscapeGame({
  maze,
  clearedIds = [],
  isFinished,
  onClearArrow,
  difficulty,
  elapsedTime,
  finishRank,
  arrowFormat = "neon",
}: ArrowEscapeGameProps) {
  const [selectedIdx, setSelectedIdx] = useState<number>(-1);
  const [animatingId, setAnimatingId] = useState<string | null>(null);
  const [shakingId, setShakingId] = useState<string | null>(null);

  // Filter to find active paths
  const activePaths = maze ? maze.paths.filter(p => !clearedIds.includes(p.id)) : [];

  // Helper to determine if an arrow is blocked on the current board
  const isArrowBlocked = (path: EscapePath) => {
    if (!maze) return true;
    for (let i = 1; i < path.nodes.length; i++) {
      const [r, c] = path.nodes[i];
      if (r < 0 || r >= maze.rows || c < 0 || c >= maze.cols) continue;
      // Check if another active arrow is occupying this grid cell
      const isOccupied = maze.paths.some(p => {
        if (p.id === path.id || clearedIds.includes(p.id)) return false;
        return p.nodes[0][0] === r && p.nodes[0][1] === c;
      });
      if (isOccupied) return true;
    }
    return false;
  };

  // Keyboard controls: cycle through unblocked (free) arrows
  useEffect(() => {
    if (isFinished || !maze) return;

    const handler = (e: KeyboardEvent) => {
      const freeArrows = activePaths.filter(p => !isArrowBlocked(p));
      if (freeArrows.length === 0) return;

      if (e.key === "ArrowRight" || e.key === "Tab") {
        e.preventDefault();
        setSelectedIdx(prev => {
          const next = prev + 1;
          return next >= freeArrows.length ? 0 : next;
        });
      } else if (e.key === "ArrowLeft") {
        e.preventDefault();
        setSelectedIdx(prev => {
          const next = prev - 1;
          return next < 0 ? freeArrows.length - 1 : next;
        });
      } else if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        const activeFree = freeArrows[selectedIdx === -1 ? 0 : selectedIdx];
        if (activeFree) {
          handleArrowTap(activeFree);
        }
      }
    };

    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [isFinished, maze, clearedIds, selectedIdx]);

  if (!maze) {
    return (
      <div style={{ textAlign: "center", padding: "44px 20px", color: "var(--text-muted)" }}>
        <div style={{ fontSize: "3rem", marginBottom: "14px" }}>🏹</div>
        <h3 style={{ color: "white", margin: "0 0 6px" }}>Arrow Escape Puzzle</h3>
        <p style={{ fontSize: "0.85rem", margin: 0 }}>Waiting for host to launch the escape board...</p>
      </div>
    );
  }

  // Visual scaling
  const GRID_SIZE = difficulty === "easy" ? 300 : difficulty === "medium" ? 340 : 380;
  const CELL_PX = GRID_SIZE / maze.rows;
  const dc = DIFF_COLORS[difficulty];

  const handleArrowTap = (path: EscapePath) => {
    if (isFinished || animatingId || shakingId) return;

    if (isArrowBlocked(path)) {
      // Shakes the blocked arrow
      setShakingId(path.id);
      setTimeout(() => setShakingId(null), 500);
    } else {
      // Animates successful escape
      setAnimatingId(path.id);
      setTimeout(() => {
        onClearArrow(path.id);
        setAnimatingId(null);
        setSelectedIdx(-1);
      }, 600);
    }
  };

  // Convert grid node to canvas pixels
  const getCoords = (r: number, c: number): { x: number; y: number } => {
    return {
      x: c * CELL_PX + CELL_PX / 2,
      y: r * CELL_PX + CELL_PX / 2
    };
  };

  // Renders the arrow text/icon according to format selection
  const renderArrowIcon = (dir: ArrowDir, color: string, size: number) => {
    if (arrowFormat === "neon") {
      const rot = { up: 0, right: 90, down: 180, left: 270 }[dir];
      return (
        <svg viewBox="0 0 24 24" style={{ width: size, height: size, transform: `rotate(${rot}deg)` }}>
          <path
            d="M12 4v16M12 4L6 10M12 4l6 6"
            stroke={color}
            strokeWidth="4"
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="none"
          />
        </svg>
      );
    }
    if (arrowFormat === "emoji") {
      const em = { up: "⬆️", right: "➡️", down: "⬇️", left: "⬅️" }[dir];
      return <span style={{ fontSize: `${size * 0.75}px` }}>{em}</span>;
    }
    if (arrowFormat === "unicode") {
      const uc = { up: "↑", right: "→", down: "↓", left: "←" }[dir];
      return <span style={{ fontSize: `${size * 0.9}px`, fontWeight: "bold", color }}>{uc}</span>;
    }
    if (arrowFormat === "cardinal") {
      const txt = { up: "UP", right: "RGT", down: "DWN", left: "LFT" }[dir];
      return <span style={{ fontSize: `${size * 0.45}px`, fontWeight: 800, color }}>{txt}</span>;
    }
    return null;
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "14px", width: "100%", paddingBottom: "8px" }}>
      {/* Title/Time Headers */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", width: "100%", maxWidth: `${GRID_SIZE}px` }}>
        <span style={{ padding: "3px 10px", borderRadius: "20px", fontSize: "0.72rem", fontWeight: 700, background: dc.bg, color: dc.text, border: `1px solid ${dc.border}` }}>
          {difficulty === "easy" ? "🟢 Easy" : difficulty === "medium" ? "🟡 Medium" : "🔴 Hard"} · {activePaths.length} left
        </span>
        <span style={{ fontFamily: "monospace", fontSize: "0.88rem", color: isFinished ? "var(--success)" : "var(--text-muted)" }}>
          ⏱ {fmtTime(elapsedTime)}
        </span>
      </div>

      {/* SVG Canvas for Escape Paths */}
      <div
        style={{
          width: GRID_SIZE,
          height: GRID_SIZE,
          position: "relative",
          borderRadius: "12px",
          border: "2px solid rgba(255,255,255,0.08)",
          background: "rgba(10, 6, 28, 0.85)",
          boxShadow: "0 8px 32px rgba(0,0,0,0.5), 0 0 15px rgba(139, 92, 246, 0.15)",
          overflow: "hidden"
        }}
      >
        <svg width="100%" height="100%" style={{ position: "absolute", inset: 0, overflow: "visible" }}>
          {/* Paths Render */}
          {maze.paths.map((path) => {
            const isCleared = clearedIds.includes(path.id);
            // Build the SVG path string
            let dString = "";
            path.nodes.forEach((n, idx) => {
              const { x, y } = getCoords(n[0], n[1]);
              if (idx === 0) dString += `M ${x} ${y}`;
              else dString += ` L ${x} ${y}`;
            });

            return (
              <path
                key={`line_${path.id}`}
                d={dString}
                fill="none"
                stroke={path.color}
                strokeWidth={isCleared ? "1.5" : "3"}
                strokeOpacity={isCleared ? 0.15 : 0.4}
                strokeDasharray={isCleared ? "3,3" : "none"}
                style={{
                  transition: "all 0.3s ease",
                  filter: isCleared ? "none" : `drop-shadow(0 0 4px ${path.color})`
                }}
              />
            );
          })}
        </svg>

        {/* Interactive Arrows Render */}
        {maze.paths.map((path) => {
          const isCleared = clearedIds.includes(path.id);
          if (isCleared) return null;

          const startNode = path.nodes[0];
          const { x, y } = getCoords(startNode[0], startNode[1]);

          const freeArrows = activePaths.filter(p => !isArrowBlocked(p));
          const isCurrentlySelected = selectedIdx !== -1 && freeArrows[selectedIdx]?.id === path.id;

          // Animations
          const isAnimating = animatingId === path.id;
          const isShaking = shakingId === path.id;

          // Compute path animations dynamically for offsets
          let animationName = "";
          let dPathString = "";
          if (isAnimating) {
            path.nodes.forEach((n, idx) => {
              const { x: nx, y: ny } = getCoords(n[0], n[1]);
              if (idx === 0) dPathString += `M ${nx} ${ny}`;
              else dPathString += ` L ${nx} ${ny}`;
            });
            animationName = `escape_slide_${path.id}`;
          }

          return (
            <div
              key={`arrow_${path.id}`}
              onClick={() => handleArrowTap(path)}
              style={{
                position: "absolute",
                left: x - CELL_PX * 0.4,
                top: y - CELL_PX * 0.4,
                width: CELL_PX * 0.8,
                height: CELL_PX * 0.8,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
                borderRadius: "50%",
                background: isCurrentlySelected ? "rgba(255,255,255,0.15)" : "transparent",
                border: isCurrentlySelected ? "1px dashed var(--gold-primary)" : "none",
                transition: "background 0.2s, border 0.2s",
                boxShadow: isCurrentlySelected ? "0 0 8px var(--gold-primary)" : "none",
                animation: isAnimating
                  ? `${animationName} 0.6s cubic-bezier(0.25, 1, 0.5, 1) forwards`
                  : isShaking
                  ? "shake 0.4s ease-in-out"
                  : "none",
                zIndex: isAnimating ? 10 : 3
              }}
            >
              {renderArrowIcon(path.dir, path.color, CELL_PX * 0.6)}

              {/* Dynamic Keyframe Injection for the winding path animation */}
              {isAnimating && (
                <style dangerouslySetInnerHTML={{ __html: `
                  @keyframes ${animationName} {
                    0% {
                      offset-path: path('${dPathString}');
                      offset-distance: 0%;
                    }
                    100% {
                      offset-path: path('${dPathString}');
                      offset-distance: 100%;
                      opacity: 0;
                    }
                  }
                `}} />
              )}
            </div>
          );
        })}
      </div>

      {/* Keyboard Accessibility Hints */}
      {!isFinished && activePaths.length > 0 && (
        <p style={{ fontSize: "0.68rem", color: "var(--text-muted)", textAlign: "center", margin: 0, lineHeight: 1.4 }}>
          Tap arrows whose paths to the edge are clear to let them escape!
          <br />
          Press Tab / Arrow keys to cycle free arrows · Enter/Space clears them.
        </p>
      )}

      {/* Finish podium report */}
      {isFinished && (
        <div style={{ width: "100%", maxWidth: `${GRID_SIZE}px`, padding: "16px", background: "rgba(139,92,246,0.1)", border: "1px solid rgba(139,92,246,0.3)", borderRadius: "12px", textAlign: "center", animation: "fadeIn 0.4s" }}>
          <div style={{ fontSize: "2.2rem" }}>
            {finishRank === 1 ? "🥇" : finishRank === 2 ? "🥈" : finishRank === 3 ? "🥉" : "🎉"}
          </div>
          <div style={{ fontWeight: 700, color: "#a78bfa", fontSize: "1.1rem" }}>
            {finishRank ? `Rank #${finishRank} — ` : ""}Escape Completed!
          </div>
          <div style={{ color: "var(--text-muted)", fontSize: "0.8rem", marginTop: "4px" }}>
            Your time: {fmtTime(elapsedTime)}
          </div>
        </div>
      )}

      {/* Embedded CSS Animations */}
      <style jsx global>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0); filter: drop-shadow(0 0 6px #ef4444); }
          20%, 60% { transform: translateX(-4px); }
          40%, 80% { transform: translateX(4px); }
        }
      `}</style>
    </div>
  );
}
