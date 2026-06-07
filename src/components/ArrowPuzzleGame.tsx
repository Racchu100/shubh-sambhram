"use client";

import React, { useEffect, useState, useRef } from "react";

// ── Types ──────────────────────────────────────────────────────────────────
export type ArrowDir = "up" | "right" | "down" | "left";

export interface ArrowCell {
  row: number;
  col: number;
  dir: ArrowDir | null; // null represents the goal cell
}

export interface MazeData {
  grid: ArrowCell[][];
  rows: number;
  cols: number;
  start: [number, number];
  end: [number, number];
  solutionPath: [number, number][];
}

// ── Pathfinding Solver (BFS) ──────────────────────────────────────────────
export function solveMaze(grid: ArrowCell[][], rows: number, cols: number): [number, number][] | null {
  const startKey = "0,0";
  const queue: { pos: [number, number]; path: [number, number][] }[] = [
    { pos: [0, 0], path: [[0, 0]] }
  ];
  const visited = new Set<string>([startKey]);

  while (queue.length > 0) {
    const { pos: [r, c], path } = queue.shift()!;
    if (r === rows - 1 && c === cols - 1) {
      return path;
    }
    const cell = grid[r][c];
    if (!cell || !cell.dir) continue;

    const dr = cell.dir === "up" ? -1 : cell.dir === "down" ? 1 : 0;
    const dc = cell.dir === "left" ? -1 : cell.dir === "right" ? 1 : 0;

    let nr = r + dr;
    let nc = c + dc;
    while (nr >= 0 && nr < rows && nc >= 0 && nc < cols) {
      const key = `${nr},${nc}`;
      if (!visited.has(key)) {
        visited.add(key);
        queue.push({ pos: [nr, nc], path: [...path, [nr, nc]] });
      }
      nr += dr;
      nc += dc;
    }
  }
  return null;
}

// ── Path Generator (DFS) ──────────────────────────────────────────────────
function generatePath(rows: number, cols: number, length: number): [number, number][] | null {
  const path: [number, number][] = [[0, 0]];
  const visited = new Set<string>(["0,0"]);

  function dfs(r: number, c: number): boolean {
    if (path.length === length) {
      return r === rows - 1 && c === cols - 1;
    }
    if (r === rows - 1 && c === cols - 1) {
      return false; // goal reached too early
    }

    const dirs: ArrowDir[] = ["up", "right", "down", "left"];
    // Shuffle directions
    for (let i = dirs.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [dirs[i], dirs[j]] = [dirs[j], dirs[i]];
    }

    for (const dir of dirs) {
      const dr = dir === "up" ? -1 : dir === "down" ? 1 : 0;
      const dc = dir === "left" ? -1 : dir === "right" ? 1 : 0;

      // Maximum possible jump distance in this direction
      const maxDist =
        dir === "up" ? r :
        dir === "down" ? (rows - 1 - r) :
        dir === "left" ? c : (cols - 1 - c);

      if (maxDist < 1) continue;

      const dists = Array.from({ length: maxDist }, (_, i) => i + 1);
      // Shuffle distances
      for (let i = dists.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [dists[i], dists[j]] = [dists[j], dists[i]];
      }

      for (const dist of dists) {
        const nr = r + dr * dist;
        const nc = c + dc * dist;
        const key = `${nr},${nc}`;

        if (!visited.has(key)) {
          visited.add(key);
          path.push([nr, nc]);

          if (dfs(nr, nc)) return true;

          path.pop();
          visited.delete(key);
        }
      }
    }
    return false;
  }

  if (dfs(0, 0)) return path;
  return null;
}

// ── Jump Arrow Maze Generator ─────────────────────────────────────────────
export function generateMaze(
  rows: number,
  cols: number,
  minSteps: number = 10,
  maxSteps: number = 13
): MazeData {
  let attempts = 0;
  const dirs: ArrowDir[] = ["up", "right", "down", "left"];

  while (attempts < 150) {
    attempts++;
    const targetLength = Math.floor(Math.random() * (maxSteps - minSteps + 1)) + minSteps;
    const path = generatePath(rows, cols, targetLength);
    if (!path) continue;

    // Build grid
    const grid: ArrowCell[][] = Array.from({ length: rows }, (_, r) =>
      Array.from({ length: cols }, (_, c) => ({
        row: r,
        col: c,
        dir: null,
      }))
    );

    // Lay down correct arrows along the path
    for (let i = 0; i < path.length - 1; i++) {
      const [r, c] = path[i];
      const [nr, nc] = path[i + 1];
      let dir: ArrowDir;
      if (nr < r) dir = "up";
      else if (nr > r) dir = "down";
      else if (nc < c) dir = "left";
      else dir = "right";
      grid[r][c].dir = dir;
    }
    // Set exit
    const [er, ec] = path[path.length - 1];
    grid[er][ec].dir = null;

    // Fill decoy arrows in the rest of the grid
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        if (!path.some(([pr, pc]) => pr === r && pc === c)) {
          grid[r][c].dir = dirs[Math.floor(Math.random() * dirs.length)];
        }
      }
    }

    // BFS verification: ensure the absolute shortest path is exactly our target length
    const shortest = solveMaze(grid, rows, cols);
    if (shortest && shortest.length === targetLength) {
      return {
        grid,
        rows,
        cols,
        start: [0, 0],
        end: [rows - 1, cols - 1],
        solutionPath: path,
      };
    }
  }

  // Fallback generation if BFS match fails (to guarantee load)
  const fallbackLength = Math.floor((minSteps + maxSteps) / 2);
  const path = generatePath(rows, cols, fallbackLength) || [[0, 0], [rows - 1, cols - 1]];
  const grid: ArrowCell[][] = Array.from({ length: rows }, (_, r) =>
    Array.from({ length: cols }, (_, c) => ({
      row: r,
      col: c,
      dir: null,
    }))
  );
  for (let i = 0; i < path.length - 1; i++) {
    const [r, c] = path[i];
    const [nr, nc] = path[i + 1];
    grid[r][c].dir = nr < r ? "up" : nr > r ? "down" : nc < c ? "left" : "right";
  }
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      if (!path.some(([pr, pc]) => pr === r && pc === c)) {
        grid[r][c].dir = dirs[Math.floor(Math.random() * dirs.length)];
      }
    }
  }
  return {
    grid,
    rows,
    cols,
    start: [0, 0],
    end: [rows - 1, cols - 1],
    solutionPath: path,
  };
}

// ── Component ──────────────────────────────────────────────────────────────
interface ArrowPuzzleGameProps {
  maze: MazeData | null;
  playerPos: [number, number];
  playerPath?: [number, number][];
  isFinished: boolean;
  onMoveTo: (r: number, c: number) => void;
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

export default function ArrowPuzzleGame({
  maze,
  playerPos,
  playerPath = [playerPos],
  isFinished,
  onMoveTo,
  difficulty,
  elapsedTime,
  finishRank,
  arrowFormat = "neon",
}: ArrowPuzzleGameProps) {
  const [selectedMoveIdx, setSelectedMoveIdx] = useState<number>(-1);
  const touchRef = useRef<{ x: number; y: number } | null>(null);

  // Compute valid jump destinations from the current position
  const getValidMoves = (r: number, c: number): [number, number][] => {
    if (!maze) return [];
    const cell = maze.grid[r][c];
    if (!cell || !cell.dir) return [];
    const dr = cell.dir === "up" ? -1 : cell.dir === "down" ? 1 : 0;
    const dc = cell.dir === "left" ? -1 : cell.dir === "right" ? 1 : 0;

    const moves: [number, number][] = [];
    let nr = r + dr;
    let nc = c + dc;
    while (nr >= 0 && nr < maze.rows && nc >= 0 && nc < maze.cols) {
      moves.push([nr, nc]);
      nr += dr;
      nc += dc;
    }
    return moves;
  };

  const validMoves = getValidMoves(playerPos[0], playerPos[1]);

  // Reset keyboard selection cursor when player position changes
  useEffect(() => {
    setSelectedMoveIdx(-1);
  }, [playerPos]);

  // Keyboard navigation
  useEffect(() => {
    if (isFinished || !maze) return;

    const handler = (e: KeyboardEvent) => {
      const cell = maze.grid[playerPos[0]][playerPos[1]];
      if (!cell || !cell.dir) return;

      const expectedKey = {
        up: "ArrowUp",
        right: "ArrowRight",
        down: "ArrowDown",
        left: "ArrowLeft"
      }[cell.dir];

      if (e.key === expectedKey) {
        e.preventDefault();
        if (validMoves.length === 1) {
          onMoveTo(validMoves[0][0], validMoves[0][1]);
        } else if (validMoves.length > 1) {
          setSelectedMoveIdx((prev) => (prev + 1) % validMoves.length);
        }
      } else if ((e.key === "Enter" || e.key === " ") && selectedMoveIdx !== -1) {
        e.preventDefault();
        const target = validMoves[selectedMoveIdx];
        if (target) {
          onMoveTo(target[0], target[1]);
        }
      }
    };

    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [isFinished, maze, playerPos, validMoves, selectedMoveIdx, onMoveTo]);

  if (!maze) {
    return (
      <div style={{ textAlign: "center", padding: "44px 20px", color: "var(--text-muted)" }}>
        <div style={{ fontSize: "3rem", marginBottom: "14px" }}>🏹</div>
        <h3 style={{ color: "white", margin: "0 0 6px" }}>Arrow Finisher Puzzle</h3>
        <p style={{ fontSize: "0.85rem", margin: 0 }}>Waiting for host to launch the maze...</p>
      </div>
    );
  }

  const CELL = difficulty === "easy" ? 50 : difficulty === "medium" ? 38 : 30;
  const dc = DIFF_COLORS[difficulty];

  // Helper to render the arrow content
  const renderArrowContent = (dir: ArrowDir | null, isHighlighted: boolean, isSelected: boolean) => {
    if (!dir) return <span style={{ fontSize: CELL > 36 ? "1.4rem" : "1rem" }}>🏁</span>;

    const color = isSelected ? "var(--gold-primary)" : isHighlighted ? "#10b981" : "#3b82f6";
    const glow = isSelected
      ? "drop-shadow(0 0 5px var(--gold-primary))"
      : isHighlighted
      ? "drop-shadow(0 0 4px #10b981)"
      : "none";

    if (arrowFormat === "neon") {
      const rotation = {
        up: "rotate(0deg)",
        right: "rotate(90deg)",
        down: "rotate(180deg)",
        left: "rotate(270deg)",
      }[dir];
      return (
        <svg
          viewBox="0 0 24 24"
          style={{
            width: "70%",
            height: "70%",
            transform: rotation,
            transition: "all 0.2s ease",
            filter: glow,
          }}
        >
          <path
            d="M12 4v16M12 4L6 10M12 4l6 6"
            stroke={color}
            strokeWidth="3.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      );
    }

    if (arrowFormat === "emoji") {
      const emojis = { up: "⬆️", right: "➡️", down: "⬇️", left: "⬅️" };
      return <span style={{ fontSize: CELL > 36 ? "1.3rem" : "0.95rem", filter: glow }}>{emojis[dir]}</span>;
    }

    if (arrowFormat === "unicode") {
      const unicodes = { up: "↑", right: "→", down: "↓", left: "←" };
      return (
        <span
          style={{
            fontSize: CELL > 36 ? "1.6rem" : "1.1rem",
            fontWeight: 700,
            color,
            filter: glow,
          }}
        >
          {unicodes[dir]}
        </span>
      );
    }

    if (arrowFormat === "cardinal") {
      const text = { up: "UP", right: "RGT", down: "DWN", left: "LFT" };
      return (
        <span
          style={{
            fontSize: CELL > 36 ? "0.8rem" : "0.55rem",
            fontWeight: 800,
            color,
            filter: glow,
          }}
        >
          {text[dir]}
        </span>
      );
    }

    return null;
  };

  const handleDpadPress = (dir: "up" | "down" | "left" | "right") => {
    const cell = maze.grid[playerPos[0]][playerPos[1]];
    if (!cell || cell.dir !== dir) return;

    if (validMoves.length === 1) {
      onMoveTo(validMoves[0][0], validMoves[0][1]);
    } else if (validMoves.length > 1) {
      setSelectedMoveIdx((prev) => (prev + 1) % validMoves.length);
    }
  };

  const handleDpadConfirm = () => {
    if (selectedMoveIdx !== -1) {
      const target = validMoves[selectedMoveIdx];
      if (target) {
        onMoveTo(target[0], target[1]);
      }
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "14px", width: "100%", paddingBottom: "8px" }}>
      {/* Status bar */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", width: "100%", maxWidth: `${maze.cols * CELL + 4}px` }}>
        <span style={{ padding: "3px 10px", borderRadius: "20px", fontSize: "0.72rem", fontWeight: 700, background: dc.bg, color: dc.text, border: `1px solid ${dc.border}` }}>
          {difficulty === "easy" ? "🟢 Easy" : difficulty === "medium" ? "🟡 Medium" : "🔴 Hard"} · {maze.rows}×{maze.cols}
        </span>
        <span style={{ fontFamily: "monospace", fontSize: "0.88rem", color: isFinished ? "var(--success)" : "var(--text-muted)" }}>
          ⏱ {fmtTime(elapsedTime)}
        </span>
      </div>

      {/* Grid */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: `repeat(${maze.cols}, ${CELL}px)`,
          gridTemplateRows: `repeat(${maze.rows}, ${CELL}px)`,
          borderRadius: "12px",
          border: "2px solid rgba(255,255,255,0.08)",
          overflow: "hidden",
          boxShadow: "0 8px 32px rgba(0,0,0,0.5), 0 0 15px rgba(59,130,246,0.15)",
          background: "rgba(15, 12, 38, 0.9)",
          position: "relative",
        }}
        onTouchStart={(e) => { const t = e.touches[0]; touchRef.current = { x: t.clientX, y: t.clientY }; }}
        onTouchEnd={(e) => {
          if (!touchRef.current || isFinished) return;
          const t = e.changedTouches[0];
          const dx = t.clientX - touchRef.current.x;
          const dy = t.clientY - touchRef.current.y;
          touchRef.current = null;
          if (Math.abs(dx) < 15 && Math.abs(dy) < 15) return;
          const swipeDir = Math.abs(dx) > Math.abs(dy) ? (dx > 0 ? "right" : "left") : (dy > 0 ? "down" : "up");
          
          // Swipe to execute or cycle
          const cell = maze.grid[playerPos[0]][playerPos[1]];
          if (cell && cell.dir === swipeDir) {
            if (validMoves.length === 1) {
              onMoveTo(validMoves[0][0], validMoves[0][1]);
            } else if (validMoves.length > 1) {
              setSelectedMoveIdx((prev) => (prev + 1) % validMoves.length);
            }
          }
        }}
      >
        {maze.grid.map((row, r) =>
          row.map((cell, c) => {
            const isPlayer = playerPos[0] === r && playerPos[1] === c;
            const isEnd = maze.end[0] === r && maze.end[1] === c;
            
            // Check if cell is in the player's path history trail
            const trailIndex = playerPath.findIndex(([pr, pc]) => pr === r && pc === c);
            const inTrail = trailIndex !== -1;

            // Check if this cell is highlighted as a valid jump option
            const isHighlighted = validMoves.some(([mr, mc]) => mr === r && mc === c);
            
            // Check if this cell is currently selected/focused by keyboard/D-pad
            const isSelected = selectedMoveIdx !== -1 && validMoves[selectedMoveIdx][0] === r && validMoves[selectedMoveIdx][1] === c;

            return (
              <div
                key={`${r}-${c}`}
                onClick={() => {
                  if (isHighlighted && !isFinished) {
                    onMoveTo(r, c);
                  }
                }}
                style={{
                  width: CELL,
                  height: CELL,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  boxSizing: "border-box",
                  border: "1px solid rgba(255,255,255,0.03)",
                  position: "relative",
                  cursor: isHighlighted ? "pointer" : "default",
                  transition: "all 0.2s ease",
                  background: isPlayer 
                    ? "rgba(255, 215, 0, 0.2)" 
                    : isSelected 
                    ? "rgba(255, 215, 0, 0.08)"
                    : isHighlighted 
                    ? "rgba(16, 185, 129, 0.06)" 
                    : inTrail 
                    ? "rgba(59, 130, 246, 0.06)"
                    : "transparent",
                  boxShadow: isPlayer 
                    ? "inset 0 0 10px rgba(255, 215, 0, 0.4)" 
                    : isSelected 
                    ? "inset 0 0 8px rgba(255, 215, 0, 0.3), 0 0 6px rgba(255, 215, 0, 0.2)"
                    : isHighlighted 
                    ? "inset 0 0 8px rgba(16, 185, 129, 0.2)" 
                    : "none",
                }}
              >
                {/* Visual trail link lines */}
                {inTrail && trailIndex < playerPath.length - 1 && (
                  <div style={{
                    position: "absolute",
                    width: "4px",
                    height: "4px",
                    background: "rgba(59, 130, 246, 0.5)",
                    borderRadius: "50%",
                    zIndex: 1
                  }} />
                )}

                {/* Main cell content */}
                {isPlayer ? (
                  <div style={{
                    width: "60%",
                    height: "60%",
                    background: "var(--gold-primary)",
                    borderRadius: "50%",
                    boxShadow: "0 0 10px var(--gold-primary)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: CELL > 36 ? "0.9rem" : "0.7rem",
                    fontWeight: "bold",
                    color: "#0a061c",
                    zIndex: 2,
                    animation: "pulse 1.5s infinite alternate"
                  }}>
                    {isFinished ? "🎉" : "🧑"}
                  </div>
                ) : (
                  <div style={{ zIndex: 2 }}>
                    {renderArrowContent(cell.dir, isHighlighted, isSelected)}
                  </div>
                )}

                {/* Valid jump target overlay dot */}
                {isHighlighted && !isPlayer && !isSelected && (
                  <div style={{
                    position: "absolute",
                    bottom: "4px",
                    width: "5px",
                    height: "5px",
                    background: "#10b981",
                    borderRadius: "50%",
                    boxShadow: "0 0 6px #10b981",
                  }} />
                )}
              </div>
            );
          })
        )}
      </div>

      {/* D-pad controls */}
      {!isFinished && (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 52px)", gridTemplateRows: "repeat(3, 52px)", gap: "4px", marginTop: "4px" }}>
          {/* Row 1 */}
          <div />
          <button
            onPointerDown={(e) => { e.preventDefault(); handleDpadPress("up"); }}
            disabled={maze.grid[playerPos[0]][playerPos[1]]?.dir !== "up"}
            style={getDpadStyle(maze.grid[playerPos[0]][playerPos[1]]?.dir === "up")}
          >
            ↑
          </button>
          <div />

          {/* Row 2 */}
          <button
            onPointerDown={(e) => { e.preventDefault(); handleDpadPress("left"); }}
            disabled={maze.grid[playerPos[0]][playerPos[1]]?.dir !== "left"}
            style={getDpadStyle(maze.grid[playerPos[0]][playerPos[1]]?.dir === "left")}
          >
            ←
          </button>
          <button
            onPointerDown={(e) => { e.preventDefault(); handleDpadConfirm(); }}
            disabled={selectedMoveIdx === -1}
            style={{
              background: selectedMoveIdx !== -1 ? "rgba(255,215,0,0.15)" : "rgba(255,255,255,0.02)",
              border: `1px solid ${selectedMoveIdx !== -1 ? "rgba(255,215,0,0.4)" : "rgba(255,255,255,0.08)"}`,
              borderRadius: "10px",
              color: selectedMoveIdx !== -1 ? "var(--gold-primary)" : "rgba(255,255,255,0.3)",
              fontSize: "0.75rem",
              fontWeight: 800,
              cursor: selectedMoveIdx !== -1 ? "pointer" : "not-allowed",
              display: "flex",
              alignItems: "center",
              justifyContent: "center"
            }}
          >
            JUMP
          </button>
          <button
            onPointerDown={(e) => { e.preventDefault(); handleDpadPress("right"); }}
            disabled={maze.grid[playerPos[0]][playerPos[1]]?.dir !== "right"}
            style={getDpadStyle(maze.grid[playerPos[0]][playerPos[1]]?.dir === "right")}
          >
            →
          </button>

          {/* Row 3 */}
          <div />
          <button
            onPointerDown={(e) => { e.preventDefault(); handleDpadPress("down"); }}
            disabled={maze.grid[playerPos[0]][playerPos[1]]?.dir !== "down"}
            style={getDpadStyle(maze.grid[playerPos[0]][playerPos[1]]?.dir === "down")}
          >
            ↓
          </button>
          <div />
        </div>
      )}

      {/* Instructions */}
      {!isFinished && (
        <p style={{ fontSize: "0.68rem", color: "var(--text-muted)", textAlign: "center", margin: 0, lineHeight: 1.4 }}>
          Tap glowing cells to jump · Arrow keys cycle target & Enter jumps
          <br />
          Current Arrow Dir dictates direction of movement.
        </p>
      )}

      {/* Finish banner */}
      {isFinished && (
        <div style={{ width: "100%", maxWidth: `${maze.cols * CELL + 4}px`, padding: "16px", background: "rgba(34,197,94,0.1)", border: "1px solid rgba(34,197,94,0.3)", borderRadius: "12px", textAlign: "center", animation: "fadeIn 0.4s" }}>
          <div style={{ fontSize: "2.2rem" }}>
            {finishRank === 1 ? "🥇" : finishRank === 2 ? "🥈" : finishRank === 3 ? "🥉" : "🎉"}
          </div>
          <div style={{ fontWeight: 700, color: "var(--success)", fontSize: "1.1rem" }}>
            {finishRank ? `Rank #${finishRank} — ` : ""}Escape Successful!
          </div>
          <div style={{ color: "var(--text-muted)", fontSize: "0.8rem", marginTop: "4px" }}>
            Your time: {fmtTime(elapsedTime)}
          </div>
        </div>
      )}

      {/* CSS Animations Injector */}
      <style jsx global>{`
        @keyframes pulse {
          from { transform: scale(0.9); box-shadow: 0 0 8px var(--gold-primary); }
          to { transform: scale(1.05); box-shadow: 0 0 15px var(--gold-primary); }
        }
      `}</style>
    </div>
  );
}

function getDpadStyle(isActive: boolean): React.CSSProperties {
  return {
    background: isActive ? "rgba(59,130,246,0.12)" : "rgba(255,255,255,0.02)",
    border: `1px solid ${isActive ? "rgba(59,130,246,0.35)" : "rgba(255,255,255,0.05)"}`,
    borderRadius: "10px",
    color: isActive ? "white" : "rgba(255,255,255,0.15)",
    fontSize: "1.3rem",
    cursor: isActive ? "pointer" : "not-allowed",
    userSelect: "none",
    touchAction: "none",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    transition: "all 0.15s ease",
  };
}
