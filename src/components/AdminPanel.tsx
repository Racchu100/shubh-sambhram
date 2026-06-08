"use client";

import React, { useState } from "react";

interface AdminPanelProps {
  eventName: string;
  eventPin: string;
  maxPlayers: number;
  activeGames: string[];
  isStarted: boolean;
  activeGame: string;
  lobbyPlayers: any[];
  playerName: string;
  playerPoints: number;
  playerJoined: boolean;
  // Tambola
  housieDrawnNumbers: number[];
  housieLastDrawn: number | null;
  housieIsAutoDrawing: boolean;
  housiePatterns: Record<string, { active: boolean; winner: string | null }>;
  housieClaimsQueue: any[];
  onHousieDraw: () => void;
  onHousieAutoToggle: (start: boolean) => void;
  onHousieReset: () => void;
  onHousiePatternToggle: (name: string, active: boolean) => void;
  onHousieVerifyClaim: (claimPlayer: string, claimPattern: string, approve: boolean) => void;
  onHousieClearQueue?: () => void;
  onHousieSpeedChange: (speed: number) => void;
  // Eliminate
  eliminateRound: number | string;
  eliminateOptions: any[];
  eliminateSelectedOption: string | null;
  eliminateFeedback: string;
  eliminateIsFinished: boolean;
  eliminateSurvivors: string[];
  eliminateIsTieBreaker: boolean;
  eliminateTieWinners: string[];
  eliminateWinner: string | null;
  onEliminateReset: () => void;
  onEliminateSelectOption: (id: string) => void;
  onEliminateConfirm: () => void;
  onStartEliminateTieBreaker: () => void;
  // Boat
  boatStatus: string;
  boatPositions: Record<string, number>;
  boatResults: string[];
  boatTieWinners: string[];
  boatIsTieBreaker: boolean;
  onBoatReset: () => void;
  onBoatStart: () => void;
  onStartBoatTieBreaker: () => void;
  // Hunt
  huntClues: any[];
  huntCurrentClueIdx: number;
  huntHintsReleased: boolean[];
  huntSolves: any[];
  onHuntReset: () => void;
  onHuntReleaseHint: (idx: number) => void;
  onUpdateClue: (index: number, updated: { question: string; answer: string; hint: string; options: string[] }) => void;
  onAddClue: () => void;
  // Memory
  memoryGridSize: number;
  memoryTheme: string;
  memoryPairsMatched: number;
  memoryBotProgress: Record<string, number>;
  onMemoryStart: (gridSize: number, theme: string) => void;
  onMemoryReset: () => void;
  // Arrow Puzzle
  arrowDifficulty: "easy" | "medium" | "hard";
  arrowStatus: "waiting" | "active" | "finished";
  arrowFinishOrder: Array<{ player: string; time: number; rank: number }>;
  arrowMaze: any;
  onArrowStart: (difficulty: "easy" | "medium" | "hard") => void;
  onArrowReset: () => void;
  arrowFormat: "neon" | "unicode" | "emoji" | "cardinal";
  onArrowSelectFormat: (format: "neon" | "unicode" | "emoji" | "cardinal") => void;
  arrowPlayerStates: Record<string, { pos: [number, number]; path: [number, number][] }>;
  // Arrow Escape
  escapeDifficulty: "easy" | "medium" | "hard";
  escapeStatus: "waiting" | "active" | "finished";
  escapeFinishOrder: Array<{ player: string; time: number; rank: number }>;
  escapeMaze: any;
  onEscapeStart: (difficulty: "easy" | "medium" | "hard") => void;
  onEscapeReset: () => void;
  escapeFormat: "neon" | "unicode" | "emoji" | "cardinal";
  onEscapeSelectFormat: (format: "neon" | "unicode" | "emoji" | "cardinal") => void;
  escapePlayerStates: Record<string, string[]>;
  // Config
  onStartEvent: () => void;
  onEndEvent: () => void;
  onSwitchGame: (gameType: string) => void;
  onBroadcast: (msg: string) => void;
  // Report
  reportWinners: any[];
}

export default function AdminPanel({
  eventName,
  eventPin,
  maxPlayers,
  activeGames,
  isStarted,
  activeGame,
  lobbyPlayers,
  playerName,
  playerPoints,
  playerJoined,
  // Tambola
  housieDrawnNumbers,
  housieLastDrawn,
  housieIsAutoDrawing,
  housiePatterns,
  housieClaimsQueue,
  onHousieDraw,
  onHousieAutoToggle,
  onHousieReset,
  onHousiePatternToggle,
  onHousieVerifyClaim,
  onHousieClearQueue,
  onHousieSpeedChange,
  // Eliminate
  eliminateRound,
  eliminateOptions,
  eliminateSelectedOption,
  eliminateFeedback,
  eliminateIsFinished,
  eliminateSurvivors,
  eliminateIsTieBreaker,
  eliminateTieWinners,
  eliminateWinner,
  onEliminateReset,
  onEliminateSelectOption,
  onEliminateConfirm,
  onStartEliminateTieBreaker,
  // Boat
  boatStatus,
  boatPositions,
  boatResults,
  boatTieWinners,
  boatIsTieBreaker,
  onBoatReset,
  onBoatStart,
  onStartBoatTieBreaker,
  // Hunt
  huntClues,
  huntCurrentClueIdx,
  huntHintsReleased,
  huntSolves,
  onHuntReset,
  onHuntReleaseHint,
  onUpdateClue,
  onAddClue,
  // Memory
  memoryGridSize,
  memoryTheme,
  memoryPairsMatched,
  memoryBotProgress,
  onMemoryStart,
  onMemoryReset,
  // Arrow Puzzle
  arrowDifficulty,
  arrowStatus,
  arrowFinishOrder,
  arrowMaze,
  onArrowStart,
  onArrowReset,
  arrowFormat,
  onArrowSelectFormat,
  arrowPlayerStates,
  // Arrow Escape
  escapeDifficulty,
  escapeStatus,
  escapeFinishOrder,
  escapeMaze,
  onEscapeStart,
  onEscapeReset,
  escapeFormat,
  onEscapeSelectFormat,
  escapePlayerStates,
  // Config
  onStartEvent,
  onEndEvent,
  onSwitchGame,
  onBroadcast,
  // Report
  reportWinners,
}: AdminPanelProps) {
  const [broadcastInput, setBroadcastInput] = useState("");
  const [memorySizeSelect, setMemorySizeSelect] = useState(16);
  const [memoryThemeSelect, setMemoryThemeSelect] = useState("celebration");
  const [selectedEscapeTrackPlayer, setSelectedEscapeTrackPlayer] = useState(playerName);
 
  // Clue editing state
  const [editingClueIdx, setEditingClueIdx] = useState<number | null>(null);
  const [tempQuestion, setTempQuestion] = useState("");
  const [tempAnswer, setTempAnswer] = useState("");
  const [tempHint, setTempHint] = useState("");
  const [tempOptions, setTempOptions] = useState<string[]>(["Option A", "Option B", "Option C", "Option D"]);

  const startEditingClue = (idx: number) => {
    setEditingClueIdx(idx);
    setTempQuestion(huntClues[idx].question);
    setTempAnswer(huntClues[idx].answer);
    setTempHint(huntClues[idx].hint);
    setTempOptions((huntClues[idx] as any).options || ["Option A", "Option B", "Option C", "Option D"]);
  };

  const saveEditedClue = (idx: number) => {
    if (!tempQuestion.trim() || !tempAnswer.trim() || !tempHint.trim()) {
      alert("Please fill out all fields!");
      return;
    }
    const cleanedOptions = tempOptions.map((o) => o.trim()).filter(Boolean);
    if (cleanedOptions.length < 2) {
      alert("Please provide at least 2 options!");
      return;
    }
    const correctIsInOptions = cleanedOptions.some(
      (o) => o.toLowerCase() === tempAnswer.trim().toLowerCase()
    );
    if (!correctIsInOptions) {
      alert("The correct answer must match one of the 4 options exactly (case-insensitive)!");
      return;
    }
    onUpdateClue(idx, {
      question: tempQuestion.trim(),
      answer: tempAnswer.trim(),
      hint: tempHint.trim(),
      options: cleanedOptions,
    });
    setEditingClueIdx(null);
  };

  // Leaderboard lists
  const getLeaderboardList = () => {
    const list = [];
    list.push({ name: playerName, points: playerPoints, isPriya: true });
    lobbyPlayers.forEach((p) => {
      list.push({ name: p.name, points: p.points, isPriya: false });
    });
    return list.sort((a, b) => b.points - a.points);
  };

  const sortedLeaderboard = getLeaderboardList();
  const leaderTopText = sortedLeaderboard.length > 0 ? `${sortedLeaderboard[0].name} (${sortedLeaderboard[0].points} pts)` : "None";

  // Counter
  const activeCount = lobbyPlayers.filter((p) => p.active).length + (playerJoined ? 1 : 0);

  const handleSendBroadcast = () => {
    if (!broadcastInput.trim()) return;
    onBroadcast(broadcastInput.trim());
    setBroadcastInput("");
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%", width: "100%" }}>
      {/* Admin Header */}
      <div className="admin-header">
        <div className="admin-title-area">
          <h2 style={{ fontSize: "1.25rem", margin: 0 }}>{eventName}</h2>
          <span className="admin-badge">SUPER ADMIN</span>
        </div>
        <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
          <span style={{ fontSize: "0.85rem", color: "var(--text-muted)" }}>
            Join PIN: <strong className="gradient-text-gold">{eventPin}</strong>
          </span>
          <button className="btn btn-danger" style={{ padding: "6px 12px", fontSize: "0.8rem" }} onClick={onEndEvent}>
            End Event
          </button>
        </div>
      </div>

      <div className="admin-layout" style={{ display: "flex", flex: 1, overflow: "hidden" }}>
        {/* Admin Sidebar */}
        <aside className="admin-sidebar">
          <div className="sidebar-title">Control Room</div>
          <div
            className={`sidebar-menu-item ${activeGame === "lobby" ? "active" : ""}`}
            onClick={() => onSwitchGame("lobby")}
          >
            Lobby
          </div>

          <div className="sidebar-title">Game Playlist</div>
          {activeGames.includes("housie") && (
            <div
              className={`sidebar-menu-item ${activeGame === "housie" ? "active" : ""}`}
              onClick={() => onSwitchGame("housie")}
            >
              🎰 Housie / Tambola
            </div>
          )}
          {activeGames.includes("eliminate") && (
            <div
              className={`sidebar-menu-item ${activeGame === "eliminate" ? "active" : ""}`}
              onClick={() => onSwitchGame("eliminate")}
            >
              🚫 Eliminate Image
            </div>
          )}
          {activeGames.includes("boat") && (
            <div
              className={`sidebar-menu-item ${activeGame === "boat" ? "active" : ""}`}
              onClick={() => onSwitchGame("boat")}
            >
              🚤 Boat Race
            </div>
          )}
          {activeGames.includes("hunt") && (
            <div
              className={`sidebar-menu-item ${activeGame === "hunt" ? "active" : ""}`}
              onClick={() => onSwitchGame("hunt")}
            >
              🗝️ Treasure Hunt
            </div>
          )}
          {activeGames.includes("memory") && (
            <div
              className={`sidebar-menu-item ${activeGame === "memory" ? "active" : ""}`}
              onClick={() => onSwitchGame("memory")}
            >
              🧠 Picture Memory
            </div>
          )}
          {activeGames.includes("arrow") && (
            <div
              className={`sidebar-menu-item ${activeGame === "arrow" ? "active" : ""}`}
              onClick={() => onSwitchGame("arrow")}
            >
              🏹 Arrow Finisher
            </div>
          )}
          {activeGames.includes("escape") && (
            <div
              className={`sidebar-menu-item ${activeGame === "escape" ? "active" : ""}`}
              onClick={() => onSwitchGame("escape")}
            >
              🧩 Arrow Escape
            </div>
          )}

          <div className="sidebar-title">Analytics</div>
          <div
            className={`sidebar-menu-item ${activeGame === "report" ? "active" : ""}`}
            onClick={() => onSwitchGame("report")}
          >
            📊 Post-Event Report
          </div>
        </aside>

        {/* Workspace Panels */}
        <div className="admin-workspace" style={{ flex: 1, overflowY: "auto", padding: "1.5rem" }}>
          {/* Stats Bar */}
          <div className="admin-grid-dashboard">
            <div className="admin-stat-card glass-panel">
              <div className="admin-stat-icon">👥</div>
              <div className="admin-stat-info">
                <h4>Total Players</h4>
                <div className="stat-value">{activeCount} / {maxPlayers}</div>
              </div>
            </div>
            <div className="admin-stat-card glass-panel">
              <div className="admin-stat-icon">🏠</div>
              <div className="admin-stat-info">
                <h4>Game Status</h4>
                <div className="stat-value" style={{ fontSize: "1.15rem" }}>
                  {activeGame === "lobby" ? "Lobby Mode" : activeGame.toUpperCase() + " Mode"}
                </div>
              </div>
            </div>
            <div className="admin-stat-card glass-panel">
              <div className="admin-stat-icon">🏆</div>
              <div className="admin-stat-info">
                <h4>Leaderboard Top</h4>
                <div className="stat-value" style={{ fontSize: "1.1rem", color: "var(--gold-primary)" }}>
                  {leaderTopText}
                </div>
              </div>
            </div>
          </div>

          {/* LOBBY PANEL */}
          {activeGame === "lobby" && (
            <div className="workspace-panel active">
              <div className="admin-section-header">
                <h2>Event Lobby Management</h2>
                <button className="btn btn-primary" onClick={onStartEvent} disabled={isStarted}>
                  {isStarted ? "Event Active" : "🚀 Start Event & Unlock Games"}
                </button>
              </div>
              <div className="glass-panel" style={{ padding: "1.5rem" }}>
                <h3>Active Players in Lobby</h3>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(120px, 1fr))", gap: "10px", marginTop: "15px" }}>
                  {playerJoined && (
                    <div className="glass-panel" style={{ padding: "8px", textAlign: "center", border: "1.5px solid var(--gold-primary)" }}>
                      <span style={{ fontWeight: 700, color: "var(--gold-primary)" }}>👩‍🦰 {playerName}</span>
                      <div style={{ fontSize: "0.75rem", color: "var(--success)" }}>Connected 🟢</div>
                    </div>
                  )}
                  {lobbyPlayers.map((lp, idx) => (
                    <div key={idx} className="glass-panel" style={{ padding: "8px", textAlign: "center", opacity: lp.active ? 1 : 0.5 }}>
                      <span style={{ fontWeight: 600 }}>👤 {lp.name}</span>
                      <div style={{ fontSize: "0.75rem", color: lp.active ? "var(--success)" : "var(--text-muted)" }}>
                        {lp.status} {lp.active ? "🟢" : "⚫"}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="glass-panel" style={{ padding: "1.5rem" }}>
                <h3>Broadcast Message to Lobby</h3>
                <p style={{ color: "var(--text-muted)", fontSize: "0.85rem", marginBottom: "15px" }}>
                  Sends a real-time banner alert to all active player screens.
                </p>
                <div style={{ display: "flex", gap: "10px" }}>
                  <input
                    type="text"
                    className="input-field"
                    placeholder="E.g., Welcome everyone! Grab a seat, we are starting in 2 minutes!"
                    value={broadcastInput}
                    onChange={(e) => setBroadcastInput(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleSendBroadcast()}
                  />
                  <button className="btn btn-secondary" onClick={handleSendBroadcast}>
                    Broadcast
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* HOUSIE PANEL */}
          {activeGame === "housie" && (
            <div className="workspace-panel active">
              <div className="admin-section-header">
                <h2>🎰 Housie / Tambola Controls</h2>
                <div style={{ display: "flex", gap: "10px" }}>
                  <button className="btn btn-outline" onClick={onHousieReset}>
                    Reset Board
                  </button>
                  <button className="btn btn-primary" onClick={onHousieDraw} disabled={housieIsAutoDrawing}>
                    Draw Number
                  </button>
                </div>
              </div>

              {/* Approved Claims Status Strip */}
              {Object.entries(housiePatterns).some(([_, v]) => v.winner) && (
                <div className="glass-panel" style={{ padding: "10px 15px", marginBottom: "15px", borderColor: "var(--gold-primary)", display: "flex", gap: "10px", alignItems: "center", flexWrap: "wrap", animation: "fadeIn 0.3s" }}>
                  <span style={{ fontSize: "0.85rem", fontWeight: "bold", color: "var(--gold-primary)" }}>🏆 Approved Claims:</span>
                  {Object.entries(housiePatterns)
                    .filter(([_, v]) => v.winner)
                    .map(([pat, v]) => {
                      const label = pat === "Five Numbers" ? "5 done" : pat === "Top Row" ? "top done" : pat === "Middle Row" ? "middle done" : pat === "Bottom Row" ? "bottom done" : "full house done";
                      return (
                        <span key={pat} style={{ fontSize: "0.8rem", background: "rgba(255, 215, 0, 0.1)", border: "1px solid rgba(255, 215, 0, 0.2)", padding: "2px 8px", borderRadius: "4px", color: "white" }}>
                          <strong>{label}</strong> ({v.winner})
                        </span>
                      );
                    })}
                </div>
              )}

              <div style={{ display: "grid", gridTemplateColumns: "1.8fr 1fr", gap: "20px" }}>
                <div className="glass-panel" style={{ padding: "1.5rem" }}>
                  <h3>Tambola Number Draw Board</h3>
                  <div style={{ margin: "10px 0", display: "flex", gap: "15px", alignItems: "center" }}>
                    <label style={{ fontSize: "0.9rem", color: "var(--text-muted)" }}>Auto-Draw Speed:</label>
                    <select
                      className="input-field"
                      style={{ width: "auto", padding: "4px 8px", fontSize: "0.85rem" }}
                      onChange={(e) => onHousieSpeedChange(parseInt(e.target.value))}
                      defaultValue={3000}
                    >
                      <option value={5000}>Slow (5s)</option>
                      <option value={3000}>Medium (3s)</option>
                      <option value={1500}>Fast (1.5s)</option>
                    </select>
                    <button
                      className={`btn ${housieIsAutoDrawing ? "btn-danger" : "btn-secondary"}`}
                      style={{ padding: "6px 12px", fontSize: "0.8rem" }}
                      onClick={() => onHousieAutoToggle(!housieIsAutoDrawing)}
                    >
                      {housieIsAutoDrawing ? "Stop Auto-Draw" : "Start Auto-Draw"}
                    </button>
                  </div>

                  <div className="tambola-board-container">
                    {Array.from({ length: 90 }, (_, i) => i + 1).map((n) => {
                      let cellClass = "tambola-board-cell";
                      if (n === housieLastDrawn) cellClass += " last-drawn";
                      else if (housieDrawnNumbers.includes(n)) cellClass += " drawn";

                      return (
                        <div key={n} className={cellClass}>
                          {n}
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
                  <div className="glass-panel" style={{ padding: "1.25rem" }}>
                    <h3>Active Winning Patterns</h3>
                    <p style={{ color: "var(--text-muted)", fontSize: "0.75rem", marginBottom: "10px" }}>
                      Enable patterns players can claim:
                    </p>
                    <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                      {Object.keys(housiePatterns).map((pat) => (
                        <div key={pat} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: "0.85rem" }}>
                          <label style={{ cursor: "pointer" }}>{pat}</label>
                          <input
                            type="checkbox"
                            checked={housiePatterns[pat].active}
                            style={{ accentColor: "var(--gold-primary)" }}
                            onChange={(e) => onHousiePatternToggle(pat, e.target.checked)}
                          />
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="glass-panel" style={{ padding: "1.25rem", borderColor: "var(--magenta-primary)" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <h3 className="gradient-text-magenta" style={{ margin: 0 }}>Claims Verification Queue</h3>
                      {housieClaimsQueue.length > 0 && (
                        <button 
                          className="btn btn-outline" 
                          style={{ padding: "4px 10px", fontSize: "0.75rem", borderColor: "var(--danger)", color: "var(--danger)" }}
                          onClick={onHousieClearQueue}
                        >
                          Clear Queue
                        </button>
                      )}
                    </div>
                    <div style={{ marginTop: "10px", display: "flex", flexDirection: "column", gap: "10px" }}>
                      {housieClaimsQueue.length === 0 ? (
                        <p style={{ color: "var(--text-muted)", fontSize: "0.85rem" }}>No claims submitted yet.</p>
                      ) : (
                        housieClaimsQueue.map((claim) => (
                          <div
                            key={`${claim.player}-${claim.pattern}`}
                            className="glass-panel"
                            style={{ padding: "10px", display: "flex", flexDirection: "column", gap: "8px", borderColor: "var(--gold-primary)" }}
                          >
                            <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.85rem" }}>
                              <span>
                                Claimant: <strong>{claim.player}</strong>
                              </span>
                              <span style={{ color: "var(--gold-primary)" }}>
                                Pattern: <strong>{claim.pattern}</strong>
                              </span>
                            </div>
                            <div style={{ display: "flex", justifyContent: "flex-end", gap: "8px" }}>
                              <button className="btn btn-outline" style={{ padding: "4px 8px", fontSize: "0.75rem" }} onClick={() => onHousieVerifyClaim(claim.player, claim.pattern, false)}>
                                Reject
                              </button>
                              <button className="btn btn-primary" style={{ padding: "4px 8px", fontSize: "0.75rem" }} onClick={() => onHousieVerifyClaim(claim.player, claim.pattern, true)}>
                                Verify & Approve
                              </button>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ELIMINATE PANEL */}
          {activeGame === "eliminate" && (
            <div className="workspace-panel active">
              <div className="admin-section-header">
                <h2>🚫 Eliminate the Image</h2>
                <button className="btn btn-outline" onClick={onEliminateReset}>
                  Reset Game
                </button>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: "20px" }}>
                <div className="glass-panel" style={{ padding: "1.5rem" }}>
                  <h3>Image Elimination Panel</h3>
                  <p style={{ color: "var(--text-muted)", fontSize: "0.85rem" }}>
                    Select an image to eliminate for the current round. Players holding the eliminated card will be knocked out.
                  </p>

                  <div className="admin-images-grid">
                    {eliminateOptions.map((o) => {
                      let cardClass = "image-selection-card";
                      if (o.eliminated) cardClass += " eliminated";
                      else if (eliminateSelectedOption === o.id) cardClass += " selected";

                      return (
                        <div key={o.id} className={cardClass} onClick={() => !o.eliminated && !eliminateIsFinished && onEliminateSelectOption(o.id)}>
                          <div className="placeholder-visual">{o.label.split(" ")[0]}</div>
                          <div className="image-card-info">
                            <span>{o.label}</span>
                            <span style={{ fontSize: "0.75rem", background: "rgba(255,255,255,0.1)", padding: "2px 6px", borderRadius: "3px" }}>
                              Votes: {o.votes}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  <div style={{ marginTop: "20px", display: "flex", justifyContent: "flex-end" }}>
                    <button className="btn btn-secondary" onClick={onEliminateConfirm} disabled={!eliminateSelectedOption}>
                      Confirm Elimination
                    </button>
                  </div>
                </div>

                <div className="glass-panel" style={{ padding: "1.25rem" }}>
                  <h3>Elimination Standings</h3>
                  <div style={{ marginTop: "10px", display: "flex", flexDirection: "column", gap: "10px" }}>
                    <div className="activity-feed-item">
                      <span>Round State:</span>
                      <strong>{eliminateRound === "Tie-Breaker" ? "⚔️ Tie-Breaker" : `Round ${eliminateRound}`}</strong>
                    </div>
                    <div className="activity-feed-item">
                      <span>Images Left:</span>
                      <strong>{eliminateOptions.filter((o) => !o.eliminated).length} / 4</strong>
                    </div>
                    {eliminateWinner && (
                      <div className="activity-feed-item" style={{ borderColor: "var(--gold-primary)" }}>
                        <span>🏆 Winner:</span>
                        <strong className="gradient-text-gold">{eliminateWinner}</strong>
                      </div>
                    )}
                    {eliminateTieWinners.length > 0 && !eliminateWinner && !eliminateIsTieBreaker && (
                      <div style={{ marginTop: "15px", display: "flex", flexDirection: "column", gap: "10px" }}>
                        <div className="glass-panel" style={{ padding: "8px", borderColor: "var(--magenta-primary)", textAlign: "center" }}>
                          <span style={{ fontSize: "0.85rem", color: "var(--magenta-primary)", fontWeight: "bold" }}>
                            ⚔️ Tie Detected!
                          </span>
                          <p style={{ fontSize: "0.75rem", margin: "5px 0 0", color: "var(--text-muted)" }}>
                            Tied: {eliminateTieWinners.join(", ")}
                          </p>
                        </div>
                        <button
                          className="btn btn-primary"
                          style={{ width: "100%", padding: "8px", fontSize: "0.85rem" }}
                          onClick={onStartEliminateTieBreaker}
                        >
                          ⚔️ Trigger Sudden-Death
                        </button>
                      </div>
                    )}
                    {!eliminateWinner && (eliminateTieWinners.length === 0 || eliminateIsTieBreaker) && (
                      <div style={{ marginTop: "10px" }}>
                        <span style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>
                          {eliminateIsTieBreaker ? "⚔️ Tie-Breaker Survivors:" : "Survivors Left:"}
                        </span>
                        <div style={{ display: "flex", flexWrap: "wrap", gap: "5px", marginTop: "5px" }}>
                          {eliminateSurvivors.map((s, idx) => (
                            <span
                              key={idx}
                              style={{
                                fontSize: "0.7rem",
                                background: "rgba(255, 255, 255, 0.05)",
                                padding: "2px 6px",
                                borderRadius: "4px",
                              }}
                            >
                              👤 {s === playerName ? "You" : s}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* BOAT RACE PANEL */}
          {activeGame === "boat" && (
            <div className="workspace-panel active">
              <div className="admin-section-header">
                <h2>🚤 Boat Race Panel {boatIsTieBreaker && <span style={{ color: "var(--magenta-primary)", fontSize: "1.1rem" }}>⚔️ (TIE-BREAKER)</span>}</h2>
                <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
                  {boatStatus === "tie" && (
                    <div style={{ marginRight: "5px", padding: "6px 12px", background: "rgba(239, 68, 68, 0.2)", borderRadius: "4px", fontSize: "0.85rem", color: "#f87171", fontWeight: "bold" }}>
                      ⚔️ Tie: {boatTieWinners.join(" & ")}
                    </div>
                  )}
                  {boatStatus === "tie" && (
                    <button className="btn btn-secondary" onClick={onStartBoatTieBreaker}>
                      🚀 Start Tie-Breaker
                    </button>
                  )}
                  <button className="btn btn-outline" onClick={onBoatReset}>
                    Reset Race
                  </button>
                  <button className="btn btn-primary" onClick={onBoatStart} disabled={boatStatus !== "waiting"}>
                    🏁 Trigger Start Sequence
                  </button>
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "2.2fr 1fr", gap: "20px" }}>
                <div className="glass-panel" style={{ padding: "1.5rem" }}>
                  <h3>Live Boat Tracker</h3>
                  <p style={{ color: "var(--text-muted)", fontSize: "0.85rem", marginBottom: "15px" }}>
                    Simulated real-time positions of boats based on player taps (max tap rate 10/sec enforced).
                  </p>

                  <div className="race-track-container" id="admin-boat-race-track">
                    <div className="race-finish-line"></div>
                    {/* lanes */}
                    {[{ name: playerName, isPriya: true }, ...lobbyPlayers.filter((p) => p.active).map((p) => ({ name: p.name, isPriya: false }))]
                      .filter((p) => !boatIsTieBreaker || boatTieWinners.includes(p.name))
                      .map((p, i) => {
                        const pos = boatPositions[p.name] || 0;
                        const leftPercent = (pos / 100) * 80;
                        return (
                          <div key={i} className={`race-lane ${p.isPriya ? "my-lane" : ""}`}>
                            <div className="race-boat" style={{ left: `${leftPercent}%` }}>
                              <span>{p.isPriya ? "🚤" : "⛵"}</span>
                              <span className="race-boat-name">{p.isPriya ? "👨‍🦰 You" : p.name}</span>
                            </div>
                          </div>
                        );
                      })}
                  </div>
                </div>

                <div className="glass-panel" style={{ padding: "1.25rem" }}>
                  <h3>Race Results</h3>
                  <div style={{ marginTop: "10px", display: "flex", flexDirection: "column", gap: "8px" }}>
                    {boatResults.length === 0 ? (
                      <p style={{ color: "var(--text-muted)", fontSize: "0.85rem" }}>Race has not started yet.</p>
                    ) : (
                      boatResults.map((winner, index) => {
                        const medal = index === 0 ? "🥇" : index === 1 ? "🥈" : index === 2 ? "🥉" : "🎖️";
                        return (
                          <div key={index} className="activity-feed-item">
                            <span>
                              {medal} {winner}
                            </span>
                            <strong>Rank {index + 1}</strong>
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TREASURE HUNT PANEL */}
          {activeGame === "hunt" && (
            <div className="workspace-panel active">
              <div className="admin-section-header">
                <h2>🗝️ Treasure Hunt Manager</h2>
                <button className="btn btn-outline" onClick={onHuntReset}>
                  Reset Hunt
                </button>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1.8fr 1.2fr", gap: "20px" }}>
                <div className="glass-panel" style={{ padding: "1.5rem" }}>
                  <h3>Active Clues Sequencer</h3>
                  <p style={{ color: "var(--text-muted)", fontSize: "0.85rem", marginBottom: "15px" }}>
                    Reveal clues one by one to the players. Send optional hints to help players advance.
                  </p>

                  <div style={{ display: "flex", flexDirection: "column", gap: "15px" }}>
                    {huntClues.map((c, index) => {
                      const isRevealed = index <= huntCurrentClueIdx;
                      const isHintSent = huntHintsReleased[index];
                      const isEditing = editingClueIdx === index;

                      if (isEditing) {
                        return (
                          <div key={index} className="glass-panel" style={{ padding: "1rem", display: "flex", flexDirection: "column", gap: "10px", border: "1px solid var(--gold-primary)" }}>
                            <span className="gradient-text-gold" style={{ fontWeight: 600, fontSize: "0.95rem" }}>
                              Editing Clue Riddle #{index + 1}
                            </span>
                            
                            <div className="input-group" style={{ marginBottom: "5px" }}>
                              <label style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>Clue Riddle Text</label>
                              <textarea
                                className="input-field"
                                style={{ minHeight: "60px", fontSize: "0.85rem", padding: "8px", background: "rgba(0,0,0,0.2)", color: "white", border: "1px solid rgba(255,255,255,0.1)" }}
                                value={tempQuestion}
                                onChange={(e) => setTempQuestion(e.target.value)}
                                placeholder="Type the riddle question here..."
                              />
                            </div>

                            <div style={{ marginBottom: "5px" }}>
                              <label style={{ fontSize: "0.75rem", color: "var(--text-muted)", display: "block", marginBottom: "6px" }}>4 Answer Options</label>
                              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "6px" }}>
                                {["A", "B", "C", "D"].map((letter, i) => (
                                  <div key={i} style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                                    <span style={{ fontSize: "0.75rem", fontWeight: 700, color: "var(--gold-primary)", minWidth: "16px" }}>{letter}.</span>
                                    <input
                                      type="text"
                                      className="input-field"
                                      style={{ fontSize: "0.8rem", padding: "5px", background: "rgba(0,0,0,0.2)", color: "white", border: `1px solid ${
                                        tempOptions[i]?.toLowerCase() === tempAnswer.trim().toLowerCase()
                                          ? "var(--success)"
                                          : "rgba(255,255,255,0.1)"
                                      }` }}
                                      value={tempOptions[i] || ""}
                                      onChange={(e) => {
                                        const next = [...tempOptions];
                                        next[i] = e.target.value;
                                        setTempOptions(next);
                                      }}
                                      placeholder={`Option ${letter}`}
                                    />
                                  </div>
                                ))}
                              </div>
                              <p style={{ fontSize: "0.7rem", color: "var(--text-muted)", marginTop: "4px" }}>Green border = matches the correct answer</p>
                            </div>

                            <div className="input-group" style={{ marginBottom: "5px" }}>
                              <label style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>Correct Answer (must match one option exactly)</label>
                              <input
                                type="text"
                                className="input-field"
                                style={{ fontSize: "0.85rem", padding: "6px", background: "rgba(0,0,0,0.2)", color: "white", border: "1px solid rgba(255,255,255,0.1)" }}
                                value={tempAnswer}
                                onChange={(e) => setTempAnswer(e.target.value)}
                                placeholder="E.g., Mangalsutra"
                              />
                            </div>

                            <div className="input-group" style={{ marginBottom: "5px" }}>
                              <label style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>Hint Details</label>
                              <input
                                type="text"
                                className="input-field"
                                style={{ fontSize: "0.85rem", padding: "6px", background: "rgba(0,0,0,0.2)", color: "white", border: "1px solid rgba(255,255,255,0.1)" }}
                                value={tempHint}
                                onChange={(e) => setTempHint(e.target.value)}
                                placeholder="E.g., starts with 'M'..."
                              />
                            </div>

                            <div style={{ display: "flex", justifyContent: "flex-end", gap: "8px", marginTop: "5px" }}>
                              <button
                                className="btn btn-outline"
                                style={{ padding: "4px 10px", fontSize: "0.75rem" }}
                                onClick={() => setEditingClueIdx(null)}
                              >
                                Cancel
                              </button>
                              <button
                                className="btn btn-primary"
                                style={{ padding: "4px 12px", fontSize: "0.75rem" }}
                                onClick={() => saveEditedClue(index)}
                              >
                                Save Clue
                              </button>
                            </div>
                          </div>
                        );
                      }

                      return (
                        <div key={index} className="glass-panel" style={{ padding: "1rem", display: "flex", flexDirection: "column", gap: "8px" }}>
                          <div style={{ display: "flex", justifyContent: "space-between", fontWeight: 600, fontSize: "0.95rem" }}>
                            <span className="gradient-text-gold">Clue Riddle #{index + 1}</span>
                            <span style={{ color: isRevealed ? "var(--success)" : "var(--text-muted)", fontSize: "0.8rem" }}>
                              {isRevealed ? "Unlocked 🔓" : "Locked 🔒"}
                            </span>
                          </div>
                          <p style={{ fontSize: "0.85rem", lineHeight: 1.3, color: isRevealed ? "white" : "var(--text-muted)" }}>
                            {c.question}
                          </p>
                          {(c as any).options && (
                            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "4px", marginTop: "4px" }}>
                              {(c as any).options.map((opt: string, oIdx: number) => {
                                const isCorrect = opt.toLowerCase() === c.answer.toLowerCase();
                                return (
                                  <div key={oIdx} style={{
                                    fontSize: "0.75rem",
                                    padding: "3px 8px",
                                    borderRadius: "4px",
                                    background: isCorrect ? "rgba(34, 197, 94, 0.15)" : "rgba(255,255,255,0.04)",
                                    border: `1px solid ${isCorrect ? "var(--success)" : "rgba(255,255,255,0.1)"}`,
                                    color: isCorrect ? "var(--success)" : "var(--text-muted)",
                                    fontWeight: isCorrect ? 700 : 400,
                                  }}>
                                    {["A","B","C","D"][oIdx]}. {opt}{isCorrect ? " ✓" : ""}
                                  </div>
                                );
                              })}
                            </div>
                          )}
                          <div style={{ fontSize: "0.8rem", background: "rgba(0,0,0,0.3)", padding: "4px 8px", borderRadius: "4px" }}>
                            🔑 Answer: <strong style={{ color: "var(--gold-primary)" }}>{c.answer}</strong>
                          </div>
                          {c.hint && (
                            <div style={{ fontSize: "0.8rem", color: "var(--text-muted)", padding: "2px 8px" }}>
                              💡 Hint: {c.hint}
                            </div>
                          )}
                          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "5px" }}>
                            <button
                              className="btn btn-outline"
                              style={{ padding: "4px 10px", fontSize: "0.75rem", borderColor: "rgba(255, 215, 0, 0.3)", color: "var(--gold-primary)" }}
                              onClick={() => startEditingClue(index)}
                            >
                              ✏️ Edit Clue
                            </button>
                            <button
                              className="btn btn-outline"
                              style={{ padding: "4px 10px", fontSize: "0.75rem" }}
                              disabled={isHintSent || !isRevealed}
                              onClick={() => onHuntReleaseHint(index)}
                            >
                              {isHintSent ? "Hint Pushed" : "Push Clue Hint"}
                            </button>
                          </div>
                        </div>
                      );
                    })}

                    <button
                      className="btn btn-secondary"
                      style={{ width: "100%", padding: "10px", fontSize: "0.85rem", display: "flex", alignItems: "center", justifyContent: "center", gap: "6px" }}
                      onClick={onAddClue}
                    >
                      ➕ Add Clue Riddle
                    </button>
                  </div>
                </div>

                <div className="glass-panel" style={{ padding: "1.25rem", display: "flex", flexDirection: "column", gap: "15px" }}>
                  <h3>🏆 Player Leaderboard</h3>
                  <div className="activity-feed-list" style={{ maxHeight: "460px" }}>
                    {(() => {
                      const allPlayers: string[] = lobbyPlayers.map((p: any) => (typeof p === "string" ? p : p.name));
                      const statsMap: Record<string, { points: number; correct: number; total: number; lastSolveIdx: number }> = {};
                      allPlayers.forEach((name) => {
                        statsMap[name] = { points: 0, correct: 0, total: 0, lastSolveIdx: Infinity };
                      });

                      huntSolves.forEach((s: any, idx: number) => {
                        if (!statsMap[s.player]) statsMap[s.player] = { points: 0, correct: 0, total: 0, lastSolveIdx: Infinity };
                        statsMap[s.player].points += s.points || 0;
                        statsMap[s.player].total += 1;
                        if (!s.wrong && !s.skipped && s.points > 0) statsMap[s.player].correct += 1;
                        statsMap[s.player].lastSolveIdx = idx; // keep updating = last solve position
                      });

                      // Sort: most correct first → if tied, who answered last-correct earliest (ascending)
                      const sorted = Object.entries(statsMap).sort((a, b) => {
                        if (b[1].correct !== a[1].correct) return b[1].correct - a[1].correct;
                        return a[1].lastSolveIdx - b[1].lastSolveIdx; // finished earlier = ranked higher
                      });

                      if (sorted.length === 0) {
                        return <p style={{ color: "var(--text-muted)", fontSize: "0.85rem" }}>No players in lobby yet.</p>;
                      }

                      // Track finish order (only players who answered at least 1 question)
                      const finishedOrder = [...sorted]
                        .filter(([, s]) => s.total > 0)
                        .sort((a, b) => a[1].lastSolveIdx - b[1].lastSolveIdx);
                      const finishPosition: Record<string, number> = {};
                      finishedOrder.forEach(([name], i) => { finishPosition[name] = i + 1; });

                      return sorted.map(([name, stat], rank) => {
                        const medal = rank === 0 ? "🥇" : rank === 1 ? "🥈" : rank === 2 ? "🥉" : `#${rank + 1}`;
                        const correctPct = stat.total > 0 ? Math.round((stat.correct / stat.total) * 100) : 0;
                        const pos = finishPosition[name];
                        const posLabel = pos === 1 ? "1st to finish" : pos === 2 ? "2nd to finish" : pos === 3 ? "3rd to finish" : pos ? `${pos}th to finish` : null;
                        return (
                          <div key={name} style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "10px",
                            padding: "10px 12px",
                            borderRadius: "8px",
                            background: rank === 0 ? "rgba(255,215,0,0.08)" : "rgba(255,255,255,0.03)",
                            border: `1px solid ${rank === 0 ? "rgba(255,215,0,0.25)" : "rgba(255,255,255,0.07)"}`,
                            marginBottom: "6px",
                          }}>
                            <span style={{ fontSize: "1.1rem", minWidth: "28px" }}>{medal}</span>
                            <div style={{ flex: 1 }}>
                              <div style={{ fontWeight: 600, fontSize: "0.9rem", color: rank === 0 ? "var(--gold-primary)" : "white" }}>{name}</div>
                              <div style={{ fontSize: "0.72rem", color: "var(--text-muted)", marginTop: "2px", display: "flex", gap: "8px", flexWrap: "wrap" }}>
                                <span>✅ {stat.correct} correct / {stat.total} answered</span>
                                {stat.total > 0 && <span>({correctPct}%)</span>}
                                {posLabel && (
                                  <span style={{ color: pos === 1 ? "var(--gold-primary)" : "rgba(150,150,200,0.9)", fontWeight: pos === 1 ? 700 : 400 }}>
                                    ⚡ {posLabel}
                                  </span>
                                )}
                              </div>
                            </div>
                            <strong style={{
                              fontSize: "1rem",
                              color: stat.points > 0 ? "var(--success)" : "var(--text-muted)",
                            }}>
                              {stat.points > 0 ? "+" : ""}{stat.points} pts
                            </strong>
                          </div>
                        );
                      });
                    })()}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* PICTURE MEMORY PANEL */}
          {activeGame === "memory" && (
            <div className="workspace-panel active">
              <div className="admin-section-header">
                <h2>🧠 Picture Memory Controller</h2>
                <button className="btn btn-outline" onClick={onMemoryReset}>
                  Reset Board
                </button>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1.5fr 1fr", gap: "20px" }}>
                <div className="glass-panel" style={{ padding: "1.5rem", display: "flex", flexDirection: "column", gap: "15px" }}>
                  <h3>Game Configuration</h3>
                  <div className="input-group">
                    <label>Grid Size (Cards)</label>
                    <select
                      className="input-field"
                      value={memorySizeSelect}
                      onChange={(e) => setMemorySizeSelect(parseInt(e.target.value))}
                    >
                      <option value={16}>4 × 4 (8 pairs)</option>
                      <option value={24}>4 × 6 (12 pairs)</option>
                    </select>
                  </div>
                  <div className="input-group">
                    <label>Image Theme Set</label>
                    <select
                      className="input-field"
                      value={memoryThemeSelect}
                      onChange={(e) => setMemoryThemeSelect(e.target.value)}
                    >
                      <option value="celebration">Indian Wedding & Celebration (🪔, 👑, 💃, etc.)</option>
                      <option value="food">Royal Indian Food (🍛, 🧁, 🥭, etc.)</option>
                      <option value="animals">Sacred Animals (🐘, 🦚, 🐅, etc.)</option>
                    </select>
                  </div>
                  <button className="btn btn-primary" onClick={() => onMemoryStart(memorySizeSelect, memoryThemeSelect)}>
                    Start Game Board
                  </button>
                </div>

                <div className="glass-panel" style={{ padding: "1.25rem" }}>
                  <h3>Live Completion Progress</h3>
                  <div style={{ marginTop: "10px", display: "flex", flexDirection: "column", gap: "10px" }}>
                    {/* Priya progress */}
                    <div style={{ marginBottom: "10px" }}>
                      <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.85rem", marginBottom: "4px" }}>
                        <span>👩‍🦰 Priya (You)</span>
                        <strong>
                          {memoryPairsMatched} / {memoryGridSize / 2} Pairs ({Math.round((memoryPairsMatched / (memoryGridSize / 2)) * 100)}%)
                        </strong>
                      </div>
                      <div className="speed-bar-outer" style={{ width: "100%", height: "8px" }}>
                        <div
                          className="speed-bar-inner"
                          style={{
                            width: `${(memoryPairsMatched / (memoryGridSize / 2)) * 100}%`,
                            background: "var(--gold-primary)",
                          }}
                        ></div>
                      </div>
                    </div>

                    {/* Bot progress */}
                    {lobbyPlayers
                      .filter((lp) => lp.active)
                      .map((lp, idx) => {
                        const pairs = memoryBotProgress[lp.name] || 0;
                        const pct = Math.round((pairs / (memoryGridSize / 2)) * 100);
                        return (
                          <div key={idx} style={{ marginBottom: "10px", opacity: 0.75 }}>
                            <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.85rem", marginBottom: "4px" }}>
                              <span>👤 {lp.name}</span>
                              <strong>
                                {pairs} / {memoryGridSize / 2} Pairs ({pct}%)
                              </strong>
                            </div>
                            <div className="speed-bar-outer" style={{ width: "100%", height: "6px" }}>
                              <div className="speed-bar-inner" style={{ width: `${pct}%` }}></div>
                            </div>
                          </div>
                        );
                      })}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ARROW FINISHER PUZZLE PANEL */}
          {activeGame === "arrow" && (
            <div className="workspace-panel active">
              <div className="admin-section-header">
                <h2>🏹 Arrow Finisher Puzzle Controller</h2>
                <button className="btn btn-outline" onClick={onArrowReset}>↺ Reset</button>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1.2fr 1fr", gap: "20px" }}>
                {/* Left: Setup */}
                <div className="glass-panel" style={{ padding: "1.5rem", display: "flex", flexDirection: "column", gap: "16px" }}>
                  <h3>Game Setup</h3>

                  <div className="input-group">
                    <label>Difficulty Level</label>
                    <div style={{ display: "flex", gap: "8px" }}>
                      {(["easy", "medium", "hard"] as const).map((d) => (
                        <button
                          key={d}
                          className="btn btn-outline"
                          style={{
                            flex: 1,
                            fontSize: "0.8rem",
                            padding: "8px 4px",
                            borderColor: arrowDifficulty === d
                              ? d === "easy" ? "#4ade80" : d === "medium" ? "#fb923c" : "#f87171"
                              : "rgba(255,255,255,0.15)",
                            color: arrowDifficulty === d
                              ? d === "easy" ? "#4ade80" : d === "medium" ? "#fb923c" : "#f87171"
                              : "var(--text-muted)",
                            background: arrowDifficulty === d ? "rgba(255,255,255,0.05)" : "transparent",
                          }}
                          onClick={() => onArrowStart(d)}
                        >
                          {d === "easy" ? "🟢 Easy\n6×6" : d === "medium" ? "🟡 Medium\n8×8" : "🔴 Hard\n10×10"}
                        </button>
                      ))}
                    </div>
                    <p style={{ fontSize: "0.75rem", color: "var(--text-muted)", margin: "4px 0 0" }}>
                      Click a difficulty to generate & start a new maze immediately.
                    </p>
                  </div>

                  {/* Format Selector */}
                  <div className="input-group">
                    <label>Arrow Format / Visual Style</label>
                    <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
                      {([
                        { id: "neon", label: "🌟 Neon SVGs" },
                        { id: "emoji", label: "⬆️ Emojis" },
                        { id: "unicode", label: "↑ Unicode" },
                        { id: "cardinal", label: "🔤 Cardinal" }
                      ] as const).map((f) => (
                        <button
                          key={f.id}
                          className="btn btn-outline"
                          style={{
                            flex: "1 1 calc(50% - 4px)",
                            fontSize: "0.75rem",
                            padding: "6px 8px",
                            borderColor: arrowFormat === f.id ? "var(--gold-primary)" : "rgba(255,255,255,0.15)",
                            color: arrowFormat === f.id ? "var(--gold-primary)" : "var(--text-muted)",
                            background: arrowFormat === f.id ? "rgba(255,215,0,0.05)" : "transparent",
                          }}
                          onClick={() => onArrowSelectFormat(f.id)}
                        >
                          {f.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "10px" }}>
                    <div className="glass-panel" style={{ padding: "12px", textAlign: "center" }}>
                      <div style={{ fontSize: "0.65rem", color: "var(--text-muted)", textTransform: "uppercase" }}>Status</div>
                      <div style={{ fontWeight: 700, marginTop: "4px", color: arrowStatus === "active" ? "var(--success)" : "var(--text-muted)" }}>
                        {arrowStatus === "waiting" ? "Waiting" : arrowStatus === "active" ? "🟢 Live" : "Finished"}
                      </div>
                    </div>
                    <div className="glass-panel" style={{ padding: "12px", textAlign: "center" }}>
                      <div style={{ fontSize: "0.65rem", color: "var(--text-muted)", textTransform: "uppercase" }}>Grid</div>
                      <div style={{ fontWeight: 700, marginTop: "4px" }}>
                        {arrowMaze ? `${arrowMaze.rows}×${arrowMaze.cols}` : "—"}
                      </div>
                    </div>
                    <div className="glass-panel" style={{ padding: "12px", textAlign: "center" }}>
                      <div style={{ fontSize: "0.65rem", color: "var(--text-muted)", textTransform: "uppercase" }}>Finished</div>
                      <div style={{ fontWeight: 700, marginTop: "4px", color: "var(--gold-primary)" }}>
                        {arrowFinishOrder.length}
                      </div>
                    </div>
                  </div>

                  <div className="glass-panel" style={{ padding: "14px", fontSize: "0.8rem", color: "var(--text-muted)", lineHeight: 1.6 }}>
                    <div style={{ fontWeight: 600, color: "white", marginBottom: "6px" }}>📖 How it works</div>
                    <div>• Players navigate by jumping in the direction of the arrow in their current cell.</div>
                    <div>• Highlighted cells show valid jump locations. Tapping is supported.</div>
                    <div>• 🟢 Easy: 10–13 steps (6×6)</div>
                    <div>• 🟡 Medium: 15–18 steps (8×8)</div>
                    <div>• 🔴 Tough: 20–25 steps (10×10)</div>
                  </div>
                </div>

                {/* Center: Live Board Viewer */}
                <div className="glass-panel" style={{ padding: "1.25rem", display: "flex", flexDirection: "column", alignItems: "center", gap: "12px" }}>
                  <h3 style={{ alignSelf: "flex-start", margin: "0 0 4px" }}>🟢 Live Board Tracker</h3>
                  {arrowMaze ? (
                    (() => {
                      const CELL_SIZE = arrowDifficulty === "easy" ? 36 : arrowDifficulty === "medium" ? 28 : 22;
                      const getBotColor = (name: string) => {
                        const colors: Record<string, string> = {
                          Rahul: "#f87171",
                          Deepak: "#fb923c",
                          Sanya: "#ec4899",
                          Anjali: "#a78bfa",
                          Vikram: "#60a5fa",
                          Neha: "#2dd4bf",
                          Sanjay: "#a3e635",
                        };
                        return colors[name] || "#94a3b8";
                      };

                      return (
                        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "12px", width: "100%" }}>
                          <div
                            style={{
                              display: "grid",
                              gridTemplateColumns: `repeat(${arrowMaze.cols}, ${CELL_SIZE}px)`,
                              gridTemplateRows: `repeat(${arrowMaze.rows}, ${CELL_SIZE}px)`,
                              border: "2px solid rgba(255,255,255,0.08)",
                              borderRadius: "8px",
                              background: "rgba(10, 6, 28, 0.8)",
                              overflow: "hidden"
                            }}
                          >
                            {arrowMaze.grid.map((row: any, r: number) =>
                              row.map((cell: any, c: number) => {
                                const isEnd = arrowMaze.end[0] === r && arrowMaze.end[1] === c;
                                
                                // Find players on this cell
                                const playersHere = Object.entries(arrowPlayerStates).filter(
                                  ([_, state]) => state.pos && state.pos[0] === r && state.pos[1] === c
                                ).map(([name]) => name);

                                return (
                                  <div
                                    key={`${r}-${c}`}
                                    style={{
                                      width: CELL_SIZE,
                                      height: CELL_SIZE,
                                      border: "1px solid rgba(255,255,255,0.02)",
                                      position: "relative",
                                      display: "flex",
                                      alignItems: "center",
                                      justifyContent: "center",
                                      background: isEnd ? "rgba(34,197,94,0.05)" : "transparent"
                                    }}
                                  >
                                    {/* Arrow symbol (faint) */}
                                    {!isEnd && cell.dir && (
                                      <span style={{
                                        opacity: 0.15,
                                        fontSize: CELL_SIZE > 25 ? "0.85rem" : "0.6rem",
                                        transform: cell.dir === "up" ? "rotate(0deg)" : cell.dir === "right" ? "rotate(90deg)" : cell.dir === "down" ? "rotate(180deg)" : "rotate(270deg)",
                                        display: "inline-block",
                                        color: "#3b82f6"
                                      }}>
                                        ↑
                                      </span>
                                    )}
                                    {isEnd && <span style={{ opacity: 0.3, fontSize: CELL_SIZE > 25 ? "0.95rem" : "0.7rem" }}>🏁</span>}

                                    {/* Player dots */}
                                    {playersHere.length > 0 && (
                                      <div style={{
                                        position: "absolute",
                                        display: "flex",
                                        flexWrap: "wrap",
                                        justifyContent: "center",
                                        alignItems: "center",
                                        gap: "1px",
                                        width: "90%",
                                        height: "90%"
                                      }}>
                                        {playersHere.map((name) => {
                                          const isPriya = name === playerName;
                                          const initial = name[0].toUpperCase();
                                          const bg = isPriya ? "var(--gold-primary)" : getBotColor(name);
                                          return (
                                            <div
                                              key={name}
                                              title={name}
                                              style={{
                                                width: playersHere.length > 2 ? "10px" : "16px",
                                                height: playersHere.length > 2 ? "10px" : "16px",
                                                borderRadius: "50%",
                                                background: bg,
                                                color: isPriya ? "#0a061c" : "white",
                                                fontSize: playersHere.length > 2 ? "6px" : "9px",
                                                fontWeight: 800,
                                                display: "flex",
                                                alignItems: "center",
                                                justifyContent: "center",
                                                boxShadow: "0 0 4px rgba(0,0,0,0.6)"
                                              }}
                                            >
                                              {initial}
                                            </div>
                                          );
                                        })}
                                      </div>
                                    )}
                                  </div>
                                );
                              })
                            )}
                          </div>
                          
                          {/* Legend */}
                          <div style={{ display: "flex", flexWrap: "wrap", gap: "8px 12px", justifyContent: "center", marginTop: "4px" }}>
                            <div style={{ display: "flex", alignItems: "center", gap: "4px", fontSize: "0.68rem", color: "var(--text-muted)" }}>
                              <div style={{ width: "8px", height: "8px", borderRadius: "50%", background: "var(--gold-primary)" }} />
                              <span>Priya (You)</span>
                            </div>
                            {Object.keys(arrowPlayerStates).filter(n => n !== playerName).slice(0, 4).map((name) => (
                              <div key={name} style={{ display: "flex", alignItems: "center", gap: "4px", fontSize: "0.68rem", color: "var(--text-muted)" }}>
                                <div style={{ width: "8px", height: "8px", borderRadius: "50%", background: getBotColor(name) }} />
                                <span>{name}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      );
                    })()
                  ) : (
                    <div style={{ textAlign: "center", padding: "60px 10px", color: "var(--text-muted)" }}>
                      <div style={{ fontSize: "2.5rem" }}>⏳</div>
                      <p style={{ fontSize: "0.85rem", marginTop: "8px" }}>Live grid layout will load here when game starts</p>
                    </div>
                  )}
                </div>

                {/* Right: Live finish order leaderboard */}
                <div className="glass-panel" style={{ padding: "1.25rem", display: "flex", flexDirection: "column", gap: "12px" }}>
                  <h3>🏆 Finish Order</h3>
                  <div style={{ display: "flex", flexDirection: "column", gap: "8px", maxHeight: "440px", overflowY: "auto" }}>
                    {arrowFinishOrder.length === 0 ? (
                      <div style={{ textAlign: "center", padding: "40px 20px", color: "var(--text-muted)" }}>
                        <div style={{ fontSize: "2.5rem" }}>⏳</div>
                        <p style={{ fontSize: "0.85rem", marginTop: "8px" }}>
                          {arrowStatus === "waiting" ? "Start a maze to begin" : "Players are solving the maze..."}
                        </p>
                      </div>
                    ) : (
                      arrowFinishOrder.map((entry) => {
                        const medal = entry.rank === 1 ? "🥇" : entry.rank === 2 ? "🥈" : entry.rank === 3 ? "🥉" : `#${entry.rank}`;
                        const mins = Math.floor(entry.time / 60).toString().padStart(2, "0");
                        const secs = (entry.time % 60).toString().padStart(2, "0");
                        return (
                          <div key={entry.player} style={{
                            display: "flex", alignItems: "center", gap: "10px",
                            padding: "10px 12px", borderRadius: "8px",
                            background: entry.rank === 1 ? "rgba(255,215,0,0.08)" : "rgba(255,255,255,0.03)",
                            border: `1px solid ${entry.rank === 1 ? "rgba(255,215,0,0.25)" : "rgba(255,255,255,0.07)"}`
                          }}>
                            <span style={{ fontSize: "1.1rem", minWidth: "28px" }}>{medal}</span>
                            <div style={{ flex: 1 }}>
                              <div style={{ fontWeight: 600, color: entry.rank === 1 ? "var(--gold-primary)" : "white" }}>{entry.player}</div>
                              <div style={{ fontSize: "0.72rem", color: "var(--text-muted)" }}>⏱ {mins}:{secs}</div>
                            </div>
                            <span style={{ fontSize: "0.75rem", padding: "2px 8px", borderRadius: "12px", background: "rgba(34,197,94,0.1)", color: "var(--success)" }}>Escaped!</span>
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ARROW ESCAPE PUZZLE PANEL */}
          {activeGame === "escape" && (
            <div className="workspace-panel active">
              <div className="admin-section-header">
                <h2>🧩 Arrow Escape Puzzle Controller</h2>
                <button className="btn btn-outline" onClick={onEscapeReset}>↺ Reset</button>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1.2fr 1fr", gap: "20px" }}>
                {/* Left: Setup */}
                <div className="glass-panel" style={{ padding: "1.5rem", display: "flex", flexDirection: "column", gap: "16px" }}>
                  <h3>Game Setup</h3>

                  <div className="input-group">
                    <label>Difficulty Level</label>
                    <div style={{ display: "flex", gap: "8px" }}>
                      {(["easy", "medium", "hard"] as const).map((d) => (
                        <button
                          key={d}
                          className="btn btn-outline"
                          style={{
                            flex: 1,
                            fontSize: "0.8rem",
                            padding: "8px 4px",
                            borderColor: escapeDifficulty === d
                              ? d === "easy" ? "#4ade80" : d === "medium" ? "#fb923c" : "#f87171"
                              : "rgba(255,255,255,0.15)",
                            color: escapeDifficulty === d
                              ? d === "easy" ? "#4ade80" : d === "medium" ? "#fb923c" : "#f87171"
                              : "var(--text-muted)",
                            background: escapeDifficulty === d ? "rgba(255,255,255,0.05)" : "transparent",
                          }}
                          onClick={() => onEscapeStart(d)}
                        >
                          {d === "easy" ? "🟢 Easy\n12 Arrows" : d === "medium" ? "🟡 Medium\n16 Arrows" : "🔴 Hard\n22 Arrows"}
                        </button>
                      ))}
                    </div>
                    <p style={{ fontSize: "0.75rem", color: "var(--text-muted)", margin: "4px 0 0" }}>
                      Generates winding paths with blocking arrow structures.
                    </p>
                  </div>

                  {/* Format Selector */}
                  <div className="input-group">
                    <label>Arrow Format / Visual Style</label>
                    <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
                      {([
                        { id: "neon", label: "🌟 Neon SVGs" },
                        { id: "emoji", label: "⬆️ Emojis" },
                        { id: "unicode", label: "↑ Unicode" },
                        { id: "cardinal", label: "🔤 Cardinal" }
                      ] as const).map((f) => (
                        <button
                          key={f.id}
                          className="btn btn-outline"
                          style={{
                            flex: "1 1 calc(50% - 4px)",
                            fontSize: "0.75rem",
                            padding: "6px 8px",
                            borderColor: escapeFormat === f.id ? "var(--gold-primary)" : "rgba(255,255,255,0.15)",
                            color: escapeFormat === f.id ? "var(--gold-primary)" : "var(--text-muted)",
                            background: escapeFormat === f.id ? "rgba(255,215,0,0.05)" : "transparent",
                          }}
                          onClick={() => onEscapeSelectFormat(f.id)}
                        >
                          {f.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "10px" }}>
                    <div className="glass-panel" style={{ padding: "12px", textAlign: "center" }}>
                      <div style={{ fontSize: "0.65rem", color: "var(--text-muted)", textTransform: "uppercase" }}>Status</div>
                      <div style={{ fontWeight: 700, marginTop: "4px", color: escapeStatus === "active" ? "var(--success)" : "var(--text-muted)" }}>
                        {escapeStatus === "waiting" ? "Waiting" : escapeStatus === "active" ? "🟢 Live" : "Finished"}
                      </div>
                    </div>
                    <div className="glass-panel" style={{ padding: "12px", textAlign: "center" }}>
                      <div style={{ fontSize: "0.65rem", color: "var(--text-muted)", textTransform: "uppercase" }}>Grid</div>
                      <div style={{ fontWeight: 700, marginTop: "4px" }}>
                        {escapeMaze ? `${escapeMaze.rows}×${escapeMaze.cols}` : "—"}
                      </div>
                    </div>
                    <div className="glass-panel" style={{ padding: "12px", textAlign: "center" }}>
                      <div style={{ fontSize: "0.65rem", color: "var(--text-muted)", textTransform: "uppercase" }}>Finished</div>
                      <div style={{ fontWeight: 700, marginTop: "4px", color: "var(--gold-primary)" }}>
                        {escapeFinishOrder.length}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Center: Live Board Viewer */}
                <div className="glass-panel" style={{ padding: "1.25rem", display: "flex", flexDirection: "column", alignItems: "center", gap: "12px" }}>
                  <h3 style={{ alignSelf: "flex-start", margin: "0 0 4px" }}>🟢 Live Board Tracker</h3>
                  {escapeMaze ? (
                    (() => {
                      const activeLobby = lobbyPlayers.filter(p => p.active !== false);
                      const trackPlayer = escapePlayerStates[selectedEscapeTrackPlayer] ? selectedEscapeTrackPlayer : playerName;
                      const cleared = escapePlayerStates[trackPlayer] || [];

                      const MAP_SIZE = 260;
                      const CELL_SIZE = MAP_SIZE / escapeMaze.rows;

                      return (
                        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "12px", width: "100%" }}>
                          <div className="input-group" style={{ width: "100%", margin: 0 }}>
                            <select
                              className="input-field"
                              value={trackPlayer}
                              onChange={(e) => setSelectedEscapeTrackPlayer(e.target.value)}
                              style={{ padding: "4px 8px", fontSize: "0.8rem" }}
                            >
                              <option value={playerName}>{playerName} (You) — {cleared.length}/{escapeMaze.paths.length} cleared</option>
                              {activeLobby.map((p) => {
                                const botCleared = escapePlayerStates[p.name] || [];
                                return (
                                  <option key={p.name} value={p.name}>
                                    🤖 {p.name} — {botCleared.length}/{escapeMaze.paths.length} cleared
                                  </option>
                                );
                              })}
                            </select>
                          </div>

                          <div
                            style={{
                              width: MAP_SIZE,
                              height: MAP_SIZE,
                              position: "relative",
                              borderRadius: "8px",
                              border: "2px solid rgba(255,255,255,0.08)",
                              background: "rgba(10, 6, 28, 0.8)",
                              overflow: "hidden"
                            }}
                          >
                            <svg width="100%" height="100%" style={{ position: "absolute", inset: 0 }}>
                              {/* Paths Render */}
                              {escapeMaze.paths.map((path: any) => {
                                const isCleared = cleared.includes(path.id);
                                let dString = "";
                                path.nodes.forEach((n: any, idx: number) => {
                                  const x = n[1] * CELL_SIZE + CELL_SIZE / 2;
                                  const y = n[0] * CELL_SIZE + CELL_SIZE / 2;
                                  if (idx === 0) dString += `M ${x} ${y}`;
                                  else dString += ` L ${x} ${y}`;
                                });

                                return (
                                  <path
                                    key={`track_${path.id}`}
                                    d={dString}
                                    fill="none"
                                    stroke={path.color}
                                    strokeWidth={isCleared ? "1" : "2"}
                                    strokeOpacity={isCleared ? 0.1 : 0.45}
                                    strokeDasharray={isCleared ? "2,2" : "none"}
                                  />
                                );
                              })}
                            </svg>

                            {/* Arrow dots remaining */}
                            {escapeMaze.paths.map((path: any) => {
                              const isCleared = cleared.includes(path.id);
                              if (isCleared) return null;

                              const startNode = path.nodes[0];
                              const x = startNode[1] * CELL_SIZE + CELL_SIZE / 2;
                              const y = startNode[0] * CELL_SIZE + CELL_SIZE / 2;

                              return (
                                <div
                                  key={`dot_${path.id}`}
                                  style={{
                                    position: "absolute",
                                    left: x - 5,
                                    top: y - 5,
                                    width: 10,
                                    height: 10,
                                    borderRadius: "50%",
                                    background: path.color,
                                    boxShadow: `0 0 6px ${path.color}`
                                  }}
                                  title={`Arrow ${path.id}`}
                                />
                              );
                            })}
                          </div>

                          <div style={{ fontSize: "0.75rem", color: "var(--text-muted)", textAlign: "center" }}>
                            Viewing live board of <strong>{trackPlayer}</strong>.
                          </div>
                        </div>
                      );
                    })()
                  ) : (
                    <div style={{ textAlign: "center", padding: "60px 10px", color: "var(--text-muted)" }}>
                      <div style={{ fontSize: "2.5rem" }}>⏳</div>
                      <p style={{ fontSize: "0.85rem", marginTop: "8px" }}>Live board tracker will load when game starts</p>
                    </div>
                  )}
                </div>

                {/* Right: Live finish order leaderboard */}
                <div className="glass-panel" style={{ padding: "1.25rem", display: "flex", flexDirection: "column", gap: "12px" }}>
                  <h3>🏆 Finish Order</h3>
                  <div style={{ display: "flex", flexDirection: "column", gap: "8px", maxHeight: "440px", overflowY: "auto" }}>
                    {escapeFinishOrder.length === 0 ? (
                      <div style={{ textAlign: "center", padding: "40px 20px", color: "var(--text-muted)" }}>
                        <div style={{ fontSize: "2.5rem" }}>⏳</div>
                        <p style={{ fontSize: "0.85rem", marginTop: "8px" }}>
                          {escapeStatus === "waiting" ? "Start a puzzle to begin" : "Players are solving..."}
                        </p>
                      </div>
                    ) : (
                      escapeFinishOrder.map((entry) => {
                        const medal = entry.rank === 1 ? "🥇" : entry.rank === 2 ? "🥈" : entry.rank === 3 ? "🥉" : `#${entry.rank}`;
                        const mins = Math.floor(entry.time / 60).toString().padStart(2, "0");
                        const secs = (entry.time % 60).toString().padStart(2, "0");
                        return (
                          <div key={entry.player} style={{
                            display: "flex", alignItems: "center", gap: "10px",
                            padding: "10px 12px", borderRadius: "8px",
                            background: entry.rank === 1 ? "rgba(167,139,250,0.08)" : "rgba(255,255,255,0.03)",
                            border: `1px solid ${entry.rank === 1 ? "rgba(167,139,250,0.25)" : "rgba(255,255,255,0.07)"}`
                          }}>
                            <span style={{ fontSize: "1.1rem", minWidth: "28px" }}>{medal}</span>
                            <div style={{ flex: 1 }}>
                              <div style={{ fontWeight: 600, color: entry.rank === 1 ? "#a78bfa" : "white" }}>{entry.player}</div>
                              <div style={{ fontSize: "0.72rem", color: "var(--text-muted)" }}>⏱ {mins}:{secs}</div>
                            </div>
                            <span style={{ fontSize: "0.75rem", padding: "2px 8px", borderRadius: "12px", background: "rgba(139,92,246,0.15)", color: "#a78bfa" }}>Escaped!</span>
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* POST-EVENT REPORT PANEL */}
          {activeGame === "report" && (
            <div className="workspace-panel active">
              <div className="admin-section-header">
                <h2>📊 Post-Event Analytics Summary</h2>
                <button className="btn btn-primary" onClick={() => alert("Report Exported (CSV/PDF) Mockup!")}>
                  💾 Export to PDF / CSV
                </button>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "15px" }}>
                <div className="glass-panel" style={{ padding: "1rem", textAlign: "center" }}>
                  <h4 style={{ fontSize: "0.75rem", color: "var(--text-muted)", textTransform: "uppercase" }}>Peak Players</h4>
                  <div style={{ fontSize: "2rem", fontWeight: 700, marginTop: "5px" }}>{activeCount}</div>
                </div>
                <div className="glass-panel" style={{ padding: "1rem", textAlign: "center" }}>
                  <h4 style={{ fontSize: "0.75rem", color: "var(--text-muted)", textTransform: "uppercase" }}>Avg Game Time</h4>
                  <div style={{ fontSize: "2rem", fontWeight: 700, marginTop: "5px" }}>8m 24s</div>
                </div>
                <div className="glass-panel" style={{ padding: "1rem", textAlign: "center" }}>
                  <h4 style={{ fontSize: "0.75rem", color: "var(--text-muted)", textTransform: "uppercase" }}>Completion Rate</h4>
                  <div style={{ fontSize: "2rem", fontWeight: 700, marginTop: "5px" }}>94%</div>
                </div>
                <div className="glass-panel" style={{ padding: "1rem", textAlign: "center" }}>
                  <h4 style={{ fontSize: "0.75rem", color: "var(--text-muted)", textTransform: "uppercase" }}>Event Duration</h4>
                  <div style={{ fontSize: "2rem", fontWeight: 700, marginTop: "5px" }}>22m 15s</div>
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px", marginTop: "10px" }}>
                <div className="glass-panel" style={{ padding: "1.5rem" }}>
                  <h3>Event Cumulative Leaderboard</h3>
                  <div style={{ marginTop: "15px", display: "flex", flexDirection: "column", gap: "10px" }}>
                    {sortedLeaderboard.map((item, idx) => (
                      <div key={idx} className={`leaderboard-item ${idx === 0 ? "rank-1" : ""}`}>
                        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                          <div className="leaderboard-rank">{idx + 1}</div>
                          <span>
                            {item.isPriya ? "👩‍🦰 Priya (You)" : `👤 ${item.name}`}
                          </span>
                        </div>
                        <strong>{item.points} pts</strong>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="glass-panel" style={{ padding: "1.5rem" }}>
                  <h3>Game-wise Winner Standings</h3>
                  <div style={{ marginTop: "15px", display: "flex", flexDirection: "column", gap: "10px" }}>
                    {reportWinners.length === 0 ? (
                      <p style={{ color: "var(--text-muted)", fontSize: "0.85rem" }}>
                        No games completed yet. Host must unlock games to log winners!
                      </p>
                    ) : (
                      reportWinners.map((winner, idx) => (
                        <div key={idx} className="leaderboard-item" style={{ animation: "slideDownIn 0.3s" }}>
                          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                            <div className="leaderboard-rank" style={{ background: "var(--magenta-gradient)", color: "white", fontSize: "0.7rem" }}>
                              🏆
                            </div>
                            <span>
                              <strong>{winner.gameName}</strong>: {winner.winnerName}
                            </span>
                          </div>
                          <span
                            style={{
                              fontSize: "0.75rem",
                              background: "rgba(255,215,0,0.1)",
                              border: "1px solid rgba(255,215,0,0.2)",
                              padding: "2px 6px",
                              borderRadius: "4px",
                              color: "var(--gold-primary)",
                            }}
                          >
                            {winner.prizeTag}
                          </span>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
