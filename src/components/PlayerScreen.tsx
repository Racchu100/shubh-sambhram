"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { PlayerBanner } from "./Sandbox";
import ArrowPuzzleGame, { MazeData } from "./ArrowPuzzleGame";
import ArrowEscapeGame, { EscapePuzzleData } from "./ArrowEscapeGame";

interface PlayerScreenProps {
  eventName: string;
  eventPin: string;
  isStarted: boolean;
  activeGame: string;
  playerName: string;
  playerJoined: boolean;
  playerPoints: number;
  lobbyPlayers: any[];
  playerBanner: PlayerBanner;
  // Join
  onJoin: (name: string) => void;
  // Tambola
  housieDrawnNumbers: number[];
  housiePatterns: Record<string, { active: boolean; winner: string | null }>;
  housieTicket: number[][] | null;
  housieMarkedCells: boolean[][] | null;
  housieClaimsQueue: any[];
  onHousieTicketChange: (ticket: number[][]) => void;
  onHousieMarkedCellsChange: (marked: boolean[][]) => void;
  onHousieSubmitClaim: (claim: any) => void;
  onHousieDrawLog: number[];
  onTriggerBanner: (text: string, icon?: string, duration?: number) => void;
  housieAutoMark: boolean;
  onHousieAutoMarkChange: (val: boolean) => void;
  // Eliminate
  eliminateRound: number | string;
  eliminateOptions: any[];
  eliminatePlayerVote: string | null;
  eliminateFeedback: string;
  eliminateIsFinished: boolean;
  eliminateSurvivors: string[];
  eliminateIsTieBreaker: boolean;
  eliminateTieWinners: string[];
  eliminateWinner: string | null;
  onEliminateVote: (id: string) => void;
  // Boat
  boatStatus: string;
  boatPositions: Record<string, number>;
  boatResults: string[];
  boatCountdownNum: number | null;
  boatTieWinners: string[];
  boatIsTieBreaker: boolean;
  onBoatTap: () => void;
  // Hunt
  huntClues: any[];
  huntCurrentClueIdx: number;
  huntHintsReleased: boolean[];
  playerHuntFeedback: string;
  onHuntSubmitAnswer: (answer: string) => void;
  onHuntSkip: () => void;
  // Memory
  memoryGridSize: number;
  memoryTheme: string;
  memoryPairsMatched: number;
  memoryDeck: any[];
  onMemoryMatch: () => void;
  onMemoryDeckChange: (deck: any[]) => void;
  // Arrow Puzzle
  arrowMaze: MazeData | null;
  arrowPlayerPos: [number, number];
  arrowPlayerFinished: boolean;
  arrowElapsedTime: number;
  arrowDifficulty: "easy" | "medium" | "hard";
  arrowFinishOrder: Array<{ player: string; time: number; rank: number }>;
  onArrowMoveTo: (r: number, c: number) => void;
  arrowFormat: "neon" | "unicode" | "emoji" | "cardinal";
  arrowPlayerPath: [number, number][];
  // Arrow Escape
  escapeDifficulty: "easy" | "medium" | "hard";
  escapeStatus: "waiting" | "active" | "finished";
  escapeFinishOrder: Array<{ player: string; time: number; rank: number }>;
  escapeMaze: EscapePuzzleData | null;
  escapeElapsedTime: number;
  escapeFormat: "neon" | "unicode" | "emoji" | "cardinal";
  escapePlayerStates: Record<string, string[]>;
  onEscapeClearArrow: (id: string) => void;
  hideFrame?: boolean;
}

export default function PlayerScreen({
  eventName,
  eventPin,
  isStarted,
  activeGame,
  playerName,
  playerJoined,
  playerPoints,
  lobbyPlayers,
  playerBanner,
  // Join
  onJoin,
  // Tambola
  housieDrawnNumbers,
  housiePatterns,
  housieTicket,
  housieMarkedCells,
  housieClaimsQueue,
  onHousieTicketChange,
  onHousieMarkedCellsChange,
  onHousieSubmitClaim,
  onHousieDrawLog,
  onTriggerBanner,
  housieAutoMark,
  onHousieAutoMarkChange,
  // Eliminate
  eliminateRound,
  eliminateOptions,
  eliminatePlayerVote,
  eliminateFeedback,
  eliminateIsFinished,
  eliminateSurvivors,
  eliminateIsTieBreaker,
  eliminateTieWinners,
  eliminateWinner,
  onEliminateVote,
  // Boat
  boatStatus,
  boatPositions,
  boatResults,
  boatCountdownNum,
  boatTieWinners,
  boatIsTieBreaker,
  onBoatTap,
  // Hunt
  huntClues,
  huntCurrentClueIdx,
  huntHintsReleased,
  playerHuntFeedback,
  onHuntSubmitAnswer,
  onHuntSkip,
  // Memory
  memoryGridSize,
  memoryTheme,
  memoryPairsMatched,
  memoryDeck,
  onMemoryMatch,
  onMemoryDeckChange,
  // Arrow Puzzle
  arrowMaze,
  arrowPlayerPos,
  arrowPlayerFinished,
  arrowElapsedTime,
  arrowDifficulty,
  arrowFinishOrder,
  onArrowMoveTo,
  arrowFormat,
  arrowPlayerPath,
  // Arrow Escape
  escapeDifficulty,
  escapeStatus,
  escapeFinishOrder,
  escapeMaze,
  escapeElapsedTime,
  escapeFormat,
  escapePlayerStates,
  onEscapeClearArrow,
  hideFrame = false,
}: PlayerScreenProps) {
  // --- JOIN FORM STATE ---
  const [joinNameInput, setJoinNameInput] = useState("Priya");
  const [joinPinInput, setJoinPinInput] = useState("SHUBH99");
  const [showOtp, setShowOtp] = useState(false);
  const [otpInput, setOtpInput] = useState("");

  // --- SYSTEM CLOCK STATE ---
  const [phoneClock, setPhoneClock] = useState("12:50");

  // --- BOAT SPEEDOMETER STATE ---
  const [boatTapRate, setBoatTapRate] = useState(0);
  const lastBoatTapTimeRef = useRef<number>(0);
  const boatTapIntervalsRef = useRef<number[]>([]);

  // --- TREASURE HUNT ANSWER STATE ---
  const [huntInput, setHuntInput] = useState("");

  // --- MEMORY FLIPPING STATE ---
  const [memoryFirstCard, setMemoryFirstCard] = useState<any | null>(null);
  const [memorySecondCard, setMemorySecondCard] = useState<any | null>(null);
  const [memoryLockBoard, setMemoryLockBoard] = useState(false);

  // Update Clock
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      let hours = now.getHours();
      let minutes = now.getMinutes();
      const hStr = hours < 10 ? "0" + hours : hours.toString();
      const mStr = minutes < 10 ? "0" + minutes : minutes.toString();
      setPhoneClock(`${hStr}:${mStr}`);
    };
    updateTime();
    const interval = setInterval(updateTime, 60000);
    return () => clearInterval(interval);
  }, []);

  // On Join click
  const handleJoinSubmit = () => {
    if (!joinNameInput.trim() || !joinPinInput.trim()) {
      alert("Please enter both Name and PIN code!");
      return;
    }
    if (joinPinInput.trim().toUpperCase() !== eventPin) {
      alert("Invalid Access PIN! Use the code shown on the Admin Header.");
      return;
    }

    if (!showOtp) {
      setShowOtp(true);
      setTimeout(() => {
        setOtpInput("7869");
      }, 400);
      return;
    }

    onJoin(joinNameInput.trim());
  };

  // --- TAMBOLA TICKET GENERATION ---
  useEffect(() => {
    if (activeGame === "housie" && playerJoined && !housieTicket) {
      // Generate Tambola Ticket
      const columns = Array.from({ length: 9 }, (_, i) => {
        const min = i === 0 ? 1 : i * 10;
        const max = i === 8 ? 90 : i * 10 + 9;
        const nums = [];
        for (let n = min; n <= max; n++) nums.push(n);
        return nums;
      });

      const ticket = Array.from({ length: 3 }, () => Array(9).fill(0));
      const colRowIndices = Array.from({ length: 9 }, () => Math.floor(Math.random() * 3));
      const rowCounts = [0, 0, 0];

      for (let c = 0; c < 9; c++) {
        const r = colRowIndices[c];
        const numIdx = Math.floor(Math.random() * columns[c].length);
        ticket[r][c] = columns[c].splice(numIdx, 1)[0];
        rowCounts[r]++;
      }

      let attempts = 0;
      while (rowCounts.reduce((a, b) => a + b, 0) < 15 && attempts < 100) {
        attempts++;
        const r = Math.floor(Math.random() * 3);
        const c = Math.floor(Math.random() * 9);
        if (ticket[r][c] !== 0 || rowCounts[r] >= 5 || ticket.filter((row) => row[c] !== 0).length >= 2) {
          continue;
        }
        if (columns[c].length > 0) {
          const numIdx = Math.floor(Math.random() * columns[c].length);
          ticket[r][c] = columns[c].splice(numIdx, 1)[0];
          rowCounts[r]++;
        }
      }

      // Sort columns ascending
      for (let c = 0; c < 9; c++) {
        const columnValues = [];
        for (let r = 0; r < 3; r++) {
          if (ticket[r][c] !== 0) columnValues.push(ticket[r][c]);
        }
        columnValues.sort((a, b) => a - b);
        let valIdx = 0;
        for (let r = 0; r < 3; r++) {
          if (ticket[r][c] !== 0) {
            ticket[r][c] = columnValues[valIdx++];
          }
        }
      }

      onHousieTicketChange(ticket);
      onHousieMarkedCellsChange(Array.from({ length: 3 }, () => Array(9).fill(false)));
    }
  }, [activeGame, playerJoined, housieTicket, onHousieTicketChange, onHousieMarkedCellsChange]);



  const handleHousieCellClick = (r: number, c: number, val: number) => {
    if (!housieMarkedCells) return;
    const isCurrentlyMarked = housieMarkedCells[r][c];
    if (isCurrentlyMarked) {
      const updated = housieMarkedCells.map((row, rIdx) =>
        row.map((cell, cIdx) => (rIdx === r && cIdx === c ? false : cell))
      );
      onHousieMarkedCellsChange(updated);
    } else {
      const drawnSet = new Set(housieDrawnNumbers.map(Number));
      if (drawnSet.has(Number(val))) {
        const updated = housieMarkedCells.map((row, rIdx) =>
          row.map((cell, cIdx) => (rIdx === r && cIdx === c ? true : cell))
        );
        onHousieMarkedCellsChange(updated);
      } else {
        onTriggerBanner("Number has not been called yet!", "❌");
      }
    }
  };

  const handleHousieClaimSubmit = (pattern: string) => {
    if (!housieTicket || !housieMarkedCells) return;
    onHousieSubmitClaim({
      id: `${playerName}-${pattern}-${Date.now()}`,
      player: playerName,
      pattern,
      ticket: housieTicket,
      marked: housieMarkedCells,
    });
    onTriggerBanner(`Submitted claim for ${pattern}!`, "🎰", 2000);
  };

  // --- BOAT TAP WITH SPEED LIMITER ---
  const handlePlayerBoatTapClick = () => {
    if (boatStatus !== "racing") return;
    if (boatIsTieBreaker && !boatTieWinners.includes(playerName)) return;
    const now = Date.now();

    if (lastBoatTapTimeRef.current > 0) {
      const elapsed = now - lastBoatTapTimeRef.current;
      boatTapIntervalsRef.current.push(elapsed);
      if (boatTapIntervalsRef.current.length > 5) boatTapIntervalsRef.current.shift();

      const avgInterval = boatTapIntervalsRef.current.reduce((a, b) => a + b, 0) / boatTapIntervalsRef.current.length;
      const tapRate = 1000 / avgInterval;
      setBoatTapRate(Math.round(tapRate));

      if (tapRate > 10) {
        lastBoatTapTimeRef.current = now;
        return; // drop click
      }
    }

    lastBoatTapTimeRef.current = now;
    onBoatTap();
  };

  // Decelerate tapping speed slowly on interval
  useEffect(() => {
    if (boatStatus === "racing") {
      const timer = setInterval(() => {
        setBoatTapRate((prev) => Math.max(0, Math.round(prev * 0.8)));
      }, 500);
      return () => clearInterval(timer);
    }
  }, [boatStatus]);

  // --- TREASURE HUNT ANSWER SUBMIT ---
  const handleHuntSubmit = () => {
    if (!huntInput.trim()) {
      alert("Please type a solution!");
      return;
    }
    onHuntSubmitAnswer(huntInput);
    setHuntInput("");
  };

  // --- PICTURE MEMORY LOGIC ---
  const handleMemoryCardClick = (card: any) => {
    if (memoryLockBoard || card.flipped || card.matched) return;

    // Flip card visually
    const nextDeck = memoryDeck.map((c) => (c.id === card.id ? { ...c, flipped: true } : c));
    onMemoryDeckChange(nextDeck);

    if (!memoryFirstCard) {
      setMemoryFirstCard(card);
      return;
    }

    setMemorySecondCard(card);
    setMemoryLockBoard(true);

    if (memoryFirstCard.icon === card.icon) {
      // MATCH
      setTimeout(() => {
        const matchedDeck = nextDeck.map((c) =>
          c.id === memoryFirstCard.id || c.id === card.id ? { ...c, matched: true } : c
        );
        onMemoryDeckChange(matchedDeck);
        onMemoryMatch();
        setMemoryFirstCard(null);
        setMemorySecondCard(null);
        setMemoryLockBoard(false);
      }, 300);
    } else {
      // NO MATCH
      setTimeout(() => {
        const resetDeck = nextDeck.map((c) =>
          c.id === memoryFirstCard.id || c.id === card.id ? { ...c, flipped: false } : c
        );
        onMemoryDeckChange(resetDeck);
        setMemoryFirstCard(null);
        setMemorySecondCard(null);
        setMemoryLockBoard(false);
      }, 1000);
    }
  };

  // Podium standings rank & badge
  const getPodiumBadge = () => {
    const list = [];
    list.push({ name: playerName, points: playerPoints, isPriya: true });
    lobbyPlayers.forEach((p) => {
      list.push({ name: p.name, points: p.points, isPriya: false });
    });
    list.sort((a, b) => b.points - a.points);
    const priyaIdx = list.findIndex((p) => p.isPriya);

    if (priyaIdx === 0) return "🥇 Event Champion Winner";
    if (priyaIdx === 1) return "🥈 Event Runner Up";
    if (priyaIdx === 2) return "🥉 Event Bronze Medalist";
    return "🎗️ Event Active Competitor";
  };

  return (
    <div className={hideFrame ? "" : "phone-mockup"} style={hideFrame ? { width: "100%", maxWidth: "520px", margin: "0 auto", height: "auto", minHeight: "100vh", background: "none", border: "none", boxShadow: "none" } : undefined}>
      {!hideFrame && (
        <>
          <div className="phone-notch">
            <div className="notch-camera"></div>
          </div>

          <div className="phone-status-bar">
            <span>{phoneClock}</span>
            <div style={{ display: "flex", gap: "6px", alignItems: "center" }}>
              <span>📶</span>
              <span>🔋 85%</span>
            </div>
          </div>
        </>
      )}

      <div className="phone-screen" style={hideFrame ? { padding: "16px 16px 20px", minHeight: "100vh" } : undefined}>
        {/* Banner Alert */}
        <div className="inapp-banner" style={{ display: playerBanner.visible ? "flex" : "none" }}>
          <span className="inapp-banner-icon">{playerBanner.icon}</span>
          <span>{playerBanner.text}</span>
        </div>

        {/* Mobile Header when frame is hidden */}
        {hideFrame && playerJoined && (
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px", borderBottom: "1px solid rgba(255, 215, 0, 0.15)", paddingBottom: "10px" }}>
            <span style={{ fontSize: "1rem", fontWeight: 700 }}>
              <span className="gradient-text-gold">Shubh</span> <span className="gradient-text-magenta">Sambhram</span>
            </span>
            <span style={{ fontSize: "0.8rem", color: "var(--gold-primary)", fontWeight: 600 }}>
              📌 PIN: {eventPin}
            </span>
          </div>
        )}

        {/* 1. ONBOARDING SCREEN */}
        {!playerJoined && (
          <div className="lobby-waiting-container" style={{ display: "flex", justifyContent: "center", gap: "15px" }}>
            <div style={{ fontSize: "3.5rem" }}>📱</div>
            <h2 style={{ fontSize: "1.5rem" }} className="gradient-text-gold">
              Join Live Event
            </h2>
            <p style={{ color: "var(--text-muted)", fontSize: "0.85rem" }}>
              Enter the credentials sent by your event coordinator to step inside.
            </p>

            <div style={{ width: "100%", textAlign: "left", marginTop: "10px" }}>
              <div className="input-group">
                <label>Your Nickname</label>
                <input
                  type="text"
                  className="input-field"
                  value={joinNameInput}
                  onChange={(e) => setJoinNameInput(e.target.value)}
                  placeholder="E.g., Priya Kumar"
                />
              </div>
              <div className="input-group">
                <label>Event Access PIN</label>
                <input
                  type="text"
                  className="input-field"
                  value={joinPinInput}
                  onChange={(e) => setJoinPinInput(e.target.value)}
                  placeholder="E.g., SHUBH99"
                />
              </div>

              {showOtp && (
                <div style={{ animation: "fadeIn 0.3s" }}>
                  <div className="input-group">
                    <label>Simulated OTP Code (Auto-fills)</label>
                    <input
                      type="text"
                      className="input-field"
                      value={otpInput}
                      onChange={(e) => setOtpInput(e.target.value)}
                      placeholder="Enter 4-digit code"
                      maxLength={4}
                    />
                  </div>
                </div>
              )}

              <button className="btn btn-primary" style={{ width: "100%", marginTop: "10px" }} onClick={handleJoinSubmit}>
                {showOtp ? "Verify OTP & Join" : "Step into Lobby"}
              </button>
            </div>
          </div>
        )}

        {/* 2. LOBBY WAITING SCREEN */}
        {playerJoined && activeGame === "lobby" && (
          <div className="lobby-waiting-container" style={{ display: "flex" }}>
            <div className="lobby-loader"></div>
            <h2>
              Welcome, <span className="gradient-text-gold">{playerName}</span>!
            </h2>
            <p style={{ color: "var(--text-muted)", fontSize: "0.85rem" }}>
              You are in the waiting lobby.
              <br />
              The host will unlock the game suite shortly.
            </p>

            <div className="glass-panel" style={{ padding: "10px", width: "100%", fontSize: "0.8rem", textAlign: "left" }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "5px" }}>
                <span>Host Name:</span>
                <strong className="gradient-text-gold">Super Admin</strong>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span>Lobby Status:</span>
                <span style={{ color: "var(--success)", fontWeight: 600 }}>Active 🟢</span>
              </div>
            </div>

            <div className="marquee-container">
              <div className="marquee-text">Wait in lobby... Game suite unlocks once admin triggers start!</div>
            </div>
          </div>
        )}

        {/* 3. HOUSIE (TAMBOLA) GAME SCREEN */}
        {playerJoined && activeGame === "housie" && (
          <div className="lobby-waiting-container" style={{ display: "flex", justifyContent: "flex-start", textAlign: "left", gap: "10px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", width: "100%" }}>
              <h3 className="tambola-ticket-title" style={{ margin: 0 }}>
                🎰 Tambola Ticket
              </h3>
              <span style={{ fontSize: "0.8rem", background: "rgba(255,255,255,0.05)", padding: "2px 8px", borderRadius: "4px" }}>
                {playerPoints} pts
              </span>
            </div>


            {/* Approved Claims Status Strip */}
            {Object.entries(housiePatterns).some(([_, v]) => v.winner) && (
              <div className="glass-panel" style={{ padding: "6px 10px", width: "100%", borderColor: "var(--gold-primary)", display: "flex", gap: "6px", alignItems: "center", flexWrap: "wrap", fontSize: "0.75rem", marginBottom: "5px", animation: "fadeIn 0.3s" }}>
                <span style={{ fontWeight: "bold", color: "var(--gold-primary)" }}>🏆 Claimed:</span>
                {Object.entries(housiePatterns)
                  .filter(([_, v]) => v.winner)
                  .map(([pat, v]) => {
                    const label = pat === "Five Numbers" ? "5 done" : pat === "Top Row" ? "top done" : pat === "Middle Row" ? "middle done" : pat === "Bottom Row" ? "bottom done" : "full house done";
                    return (
                      <span key={pat} style={{ background: "rgba(255, 215, 0, 0.1)", border: "1px solid rgba(255, 215, 0, 0.15)", padding: "1px 5px", borderRadius: "3px", color: "white" }}>
                        {label} ({v.winner === playerName ? "You" : v.winner})
                      </span>
                    );
                  })}
              </div>
            )}

            <p style={{ fontSize: "0.75rem", color: "var(--text-muted)", margin: "0 0 5px" }}>
              Tap drawn numbers on your ticket to mark. Rows must have 5 numbers.
            </p>

            {/* Ticket Grid */}
            <div className="tambola-ticket">
              {housieTicket &&
                housieMarkedCells &&
                housieTicket.map((row, r) => (
                  <div key={r} className="tambola-ticket-row">
                    {row.map((val, c) => {
                      if (val === 0) {
                        return <div key={c} className="tambola-ticket-cell empty"></div>;
                      }

                      const marked = housieMarkedCells[r][c];
                      let cellClass = "tambola-ticket-cell";
                      if (marked) {
                        cellClass += " marked verified"; // auto-marked
                      }

                      return (
                        <div key={c} className={cellClass} onClick={() => handleHousieCellClick(r, c, val)}>
                          {val}
                        </div>
                      );
                    })}
                  </div>
                ))}
            </div>

            {/* Auto Mark Toggle */}
            <div
              className="glass-panel"
              style={{
                padding: "10px 14px",
                width: "100%",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                fontSize: "0.85rem",
                marginBottom: "8px",
                border: "1px solid rgba(255, 215, 0, 0.2)",
              }}
            >
              <span>Auto-mark drawn numbers:</span>
              <div 
                onClick={() => onHousieAutoMarkChange(!housieAutoMark)}
                style={{
                  width: "44px",
                  height: "24px",
                  borderRadius: "12px",
                  background: housieAutoMark ? "var(--gold-gradient)" : "rgba(255,255,255,0.1)",
                  padding: "2px",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: housieAutoMark ? "flex-end" : "flex-start",
                  transition: "all 0.3s ease",
                  boxShadow: housieAutoMark ? "var(--gold-glow)" : "none",
                }}
              >
                <div style={{
                  width: "20px",
                  height: "20px",
                  borderRadius: "50%",
                  background: housieAutoMark ? "#120924" : "#9CA3AF",
                  transition: "all 0.3s ease",
                }} />
              </div>
            </div>

            {/* Claim patterns */}
            <h4 style={{ fontSize: "0.85rem", textTransform: "uppercase", letterSpacing: "0.5px", color: "var(--text-muted)", marginTop: "5px" }}>
              Submit Patterns Claim
            </h4>
            <div className="pattern-claims-container">
              {Object.keys(housiePatterns).map((pat) => {
                if (!housiePatterns[pat].active) return null;
                const winner = housiePatterns[pat].winner;
                const isPending = housieClaimsQueue && housieClaimsQueue.some(
                  (claim) => claim.player === playerName && claim.pattern === pat
                );

                let btnClass = "pattern-claim-btn";
                if (winner) {
                  btnClass += " claimed";
                } else if (isPending) {
                  btnClass += " pending";
                } else {
                  btnClass += " unlocked";
                }

                return (
                  <div
                    key={pat}
                    className={btnClass}
                    onClick={() => !winner && !isPending && handleHousieClaimSubmit(pat)}
                  >
                    {winner ? `${pat} (Won by ${winner})` : pat}
                  </div>
                );
              })}
            </div>

            {/* Called numbers log strip */}
            <div style={{ marginTop: "10px", width: "100%" }}>
              <h4 style={{ fontSize: "0.85rem", textTransform: "uppercase", color: "var(--text-muted)" }}>Number Called Log</h4>
              <div className="drawn-numbers-strip">
                {onHousieDrawLog.length === 0 ? (
                  <p style={{ color: "var(--text-muted)", fontSize: "0.8rem" }}>No numbers called yet.</p>
                ) : (
                  onHousieDrawLog.map((n, idx) => (
                    <div key={idx} className={`drawn-number-bubble drawn ${idx === 0 ? "current" : ""}`}>
                      {n}
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}

        {/* 4. ELIMINATE THE IMAGE SCREEN */}
        {playerJoined && activeGame === "eliminate" && (
          <div className="lobby-waiting-container" style={{ display: "flex", justifyContent: "flex-start", textAlign: "left", gap: "10px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", width: "100%" }}>
              <h3 style={{ margin: 0, fontSize: "1.25rem" }}>
                🚫 Survival Voting {eliminateIsTieBreaker && <span style={{ color: "var(--magenta-primary)", fontSize: "0.95rem" }}>⚔️ (TIE-BREAKER)</span>}
              </h3>
              <span style={{ fontSize: "0.75rem", background: "rgba(239, 68, 68, 0.15)", color: "#f87171", padding: "2px 6px", borderRadius: "4px" }}>
                {eliminateRound === "Tie-Breaker" ? "Tie-Breaker" : `Round ${eliminateRound}`}
              </span>
            </div>

            <p style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginBottom: "5px" }}>
              {eliminateIsTieBreaker && !eliminateTieWinners.includes(playerName)
                ? "👁️ You are spectating the sudden-death tie-breaker."
                : "Tap to select the image you want to back. Avoid the Admin's elimination target!"}
            </p>

            <div className="player-images-container">
              {eliminateOptions.map((o) => {
                const isWinner = eliminateIsFinished && !o.eliminated;
                const isSpectatingTieBreaker = eliminateIsTieBreaker && !eliminateTieWinners.includes(playerName);
                const isEliminated = eliminateSurvivors.length > 0 && !eliminateSurvivors.includes(playerName);
                const canVote = !o.eliminated && !eliminateIsFinished && !isSpectatingTieBreaker && !isEliminated;

                let cardClass = "player-image-card";
                if (o.eliminated) cardClass += " eliminated";
                else if (eliminatePlayerVote === o.id) cardClass += " voted";
                else if (isWinner) cardClass += " winner-card";

                return (
                  <div key={o.id} className={cardClass} onClick={() => canVote && onEliminateVote(o.id)}>
                    <div className="placeholder-visual">{o.label.split(" ")[0]}</div>
                    <div style={{ fontSize: "0.8rem", padding: "6px", textAlign: "center", background: "rgba(0,0,0,0.3)" }}>
                      {o.label.split(" ")[1]}
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="glass-panel" style={{ padding: "10px", width: "100%", fontSize: "0.8rem", marginTop: "15px" }}>
              <span>
                {eliminateIsTieBreaker && !eliminateTieWinners.includes(playerName)
                  ? "👁️ Spectating Sudden-Death Tie-Breaker..."
                  : eliminateFeedback}
              </span>
            </div>
          </div>
        )}

        {/* 5. BOAT RACE GAME SCREEN */}
        {playerJoined && activeGame === "boat" && (
          <div className="lobby-waiting-container" style={{ display: "flex", justifyContent: "flex-start", gap: "15px" }}>
            <h3 style={{ fontSize: "1.25rem", width: "100%", textAlign: "left", margin: 0 }}>
              🚤 Power Clicker Race {boatIsTieBreaker && <span style={{ color: "var(--magenta-primary)", fontSize: "0.95rem" }}>⚔️ (TIE-BREAKER)</span>}
            </h3>
            <p style={{ fontSize: "0.75rem", color: "var(--text-muted)", width: "100%", textAlign: "left", margin: 0 }}>
              {boatIsTieBreaker && !boatTieWinners.includes(playerName)
                ? "👁️ You are spectating the tie-breaker race."
                : "Tap the button below as fast as possible to advance your boat. Rates > 10 taps/sec are dropped."}
            </p>

            {/* Tap area */}
            <div className="tap-area-container" style={{ width: "100%" }}>
              <div className="speed-o-meter">
                <span>
                  Tapping Speed: <strong>{boatTapRate}</strong> taps/s
                </span>
                <div className="speed-bar-outer">
                  <div className="speed-bar-inner" style={{ width: `${Math.min(100, (boatTapRate / 10) * 100)}%` }}></div>
                </div>
              </div>

              <button
                className="tap-button"
                onClick={handlePlayerBoatTapClick}
                disabled={boatStatus !== "racing" || (boatIsTieBreaker && !boatTieWinners.includes(playerName))}
              >
                TAP!
              </button>
              <div style={{ fontSize: "1.2rem", fontWeight: 700, color: "var(--gold-primary)", textAlign: "center", minHeight: "30px", marginTop: "5px" }}>
                {boatCountdownNum !== null && `RACE STARTING IN: ${boatCountdownNum}...`}
                {boatStatus === "racing" && (
                  boatIsTieBreaker
                    ? (boatTieWinners.includes(playerName) ? "🔥 TIE-BREAKER! TAP!!!" : "👁️ Spectating Tie-Breaker...")
                    : "GO GO GO GO!!!"
                )}
                {boatStatus === "finished" && "RACE CONCLUDED!"}
                {boatStatus === "tie" && "🏁 TIE DETECTED!"}
                {boatStatus === "waiting" && "Waiting for Admin..."}
              </div>
            </div>

            {/* Compact Mini Track */}
            <div className="glass-panel" style={{ padding: "8px 12px", width: "100%", display: "flex", flexDirection: "column", gap: "6px" }}>
              <h4 style={{ fontSize: "0.8rem", textTransform: "uppercase", color: "var(--text-muted)", margin: "0 0 2px" }}>Live Track</h4>
              <div className="race-track-container mini-track">
                <div className="race-finish-line"></div>
                {/* lanes */}
                {[{ name: playerName, isPriya: true }, ...lobbyPlayers.filter((p) => p.active).map((p) => ({ name: p.name, isPriya: false }))]
                  .filter((p) => !boatIsTieBreaker || boatTieWinners.includes(p.name))
                  .map((p, i) => {
                    const pos = boatPositions[p.name] || 0;
                    const leftPercent = (pos / 100) * 82;
                    return (
                      <div key={i} className={`race-lane ${p.isPriya ? "my-lane" : ""}`}>
                        <div className="race-boat" style={{ left: `${leftPercent}%` }}>
                          <span>{p.isPriya ? "🚤" : "⛵"}</span>
                          {p.isPriya ? (
                            <span className="race-boat-name-mini">You</span>
                          ) : (
                            <span className="race-boat-name-mini" style={{ fontSize: "0.55rem", opacity: 0.8, top: "-10px", background: "rgba(0,0,0,0.4)", padding: "0 2px" }}>{p.name}</span>
                          )}
                        </div>
                      </div>
                    );
                  })}
              </div>
            </div>

            {/* Small stats card */}
            <div className="glass-panel" style={{ padding: "10px", width: "100%", fontSize: "0.75rem", textAlign: "left" }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "4px" }}>
                <span>Your Boat Pos:</span>
                <span>{Math.round(boatPositions[playerName] || 0)}m / 100m</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span>Your Rank:</span>
                <strong className="gradient-text-gold">
                  {boatResults.includes(playerName)
                    ? `Finished (Rank ${boatResults.indexOf(playerName) + 1})`
                    : "Racing"}
                </strong>
              </div>
            </div>
          </div>
        )}

        {/* 6. TREASURE HUNT SCREEN */}
        {playerJoined && activeGame === "hunt" && (
          <div className="lobby-waiting-container" style={{ display: "flex", justifyContent: "flex-start", textAlign: "left", gap: "10px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", width: "100%" }}>
              <h3 style={{ margin: 0, fontSize: "1.25rem" }}>🗝️ Clue Solving</h3>
              <span style={{ fontSize: "0.75rem", background: "rgba(255, 215, 0, 0.15)", color: "var(--gold-primary)", padding: "2px 6px", borderRadius: "4px" }}>
                Clue {Math.min(huntClues.length, huntCurrentClueIdx + 1)} of {huntClues.length}
              </span>
            </div>

            <p style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginBottom: "5px" }}>
              Solve the riddle sequence below. Correct answer unlocks the next clue.
            </p>

            {huntCurrentClueIdx < huntClues.length ? (
              <>
                <div className="clue-box" style={{ width: "100%" }}>
                  <span className="clue-text">{huntClues[huntCurrentClueIdx].question}</span>
                  {huntHintsReleased[huntCurrentClueIdx] && (
                    <div className="clue-hint-banner">
                      💡 Hint: <span>{huntClues[huntCurrentClueIdx].hint}</span>
                    </div>
                  )}
                </div>

                <div style={{ width: "100%", display: "flex", flexDirection: "column", gap: "10px" }}>
                  <label style={{ fontSize: "0.8rem", color: "var(--text-muted)", margin: 0 }}>Choose the correct answer:</label>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
                    {((huntClues[huntCurrentClueIdx] as any).options || []).map((opt: string, idx: number) => {
                      const letters = ["A", "B", "C", "D"];
                      return (
                        <button
                          key={idx}
                          onClick={() => onHuntSubmitAnswer(opt)}
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "10px",
                            padding: "12px 14px",
                            borderRadius: "10px",
                            border: "2px solid rgba(255,255,255,0.15)",
                            background: "rgba(255,255,255,0.04)",
                            color: "white",
                            cursor: "pointer",
                            textAlign: "left",
                            fontSize: "0.88rem",
                            fontFamily: "inherit",
                            transition: "all 0.2s ease",
                          }}
                          onMouseEnter={(e) => {
                            (e.currentTarget as HTMLElement).style.borderColor = "var(--gold-primary)";
                            (e.currentTarget as HTMLElement).style.background = "rgba(255,215,0,0.08)";
                          }}
                          onMouseLeave={(e) => {
                            (e.currentTarget as HTMLElement).style.borderColor = "rgba(255,255,255,0.15)";
                            (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.04)";
                          }}
                        >
                          <span style={{
                            display: "inline-flex",
                            alignItems: "center",
                            justifyContent: "center",
                            minWidth: "26px",
                            height: "26px",
                            borderRadius: "50%",
                            background: "rgba(255,215,0,0.15)",
                            color: "var(--gold-primary)",
                            fontWeight: 700,
                            fontSize: "0.75rem",
                          }}>
                            {letters[idx]}
                          </span>
                          {opt}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </>
            ) : (
              <div className="clue-box" style={{ width: "100%" }}>
                <span className="clue-text" style={{ color: "var(--success)" }}>
                  🎉 All clues solved successfully! Waiting for host to transition event.
                </span>
              </div>
            )}

            <div className="glass-panel" style={{ padding: "10px", width: "100%", fontSize: "0.8rem", marginTop: "10px", display: "flex", justifyContent: "space-between" }}>
              <span>Solve Status:</span>
              <strong style={{ color: playerHuntFeedback.includes("✅") ? "var(--success)" : playerHuntFeedback.includes("❌") ? "#f87171" : "var(--text-muted)" }}>
                {playerHuntFeedback}
              </strong>
            </div>

          </div>
        )}

        {/* 7. PICTURE MEMORY SCREEN */}
        {playerJoined && activeGame === "memory" && (
          <div className="lobby-waiting-container" style={{ display: "flex", justifyContent: "flex-start", textAlign: "left", gap: "10px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", width: "100%" }}>
              <h3 style={{ margin: 0, fontSize: "1.25rem" }}>🧠 Card Match</h3>
              <span style={{ fontSize: "0.75rem", background: "rgba(16, 185, 129, 0.15)", color: "#34d399", padding: "2px 6px", borderRadius: "4px" }}>
                Pairs: {memoryPairsMatched} / {memoryGridSize / 2}
              </span>
            </div>

            <p style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginBottom: "5px" }}>
              Tap two cards face-down to flip them. Match all pairs as quickly as possible!
            </p>

            <div className="memory-grid" style={{ width: "100%" }}>
              {memoryDeck.map((card) => {
                let cardClass = "memory-card";
                if (card.flipped) cardClass += " flipped";
                if (card.matched) cardClass += " matched";

                return (
                  <div key={card.id} className={cardClass} onClick={() => handleMemoryCardClick(card)}>
                    <div className="memory-card-inner">
                      <div className="memory-card-back">✨</div>
                      <div className="memory-card-front">{card.icon}</div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ARROW FINISHER PUZZLE */}
        {playerJoined && activeGame === "arrow" && (
          <div className="game-section" style={{ padding: "16px 12px" }}>
            <ArrowPuzzleGame
              maze={arrowMaze}
              playerPos={arrowPlayerPos}
              playerPath={arrowPlayerPath}
              isFinished={arrowPlayerFinished}
              onMoveTo={onArrowMoveTo}
              difficulty={arrowDifficulty}
              elapsedTime={arrowElapsedTime}
              finishRank={arrowFinishOrder.find(f => f.player === playerName)?.rank}
              arrowFormat={arrowFormat}
            />
          </div>
        )}

        {/* ARROW ESCAPE PUZZLE */}
        {playerJoined && activeGame === "escape" && (
          <div className="game-section" style={{ padding: "16px 12px" }}>
            <ArrowEscapeGame
              maze={escapeMaze}
              clearedIds={escapePlayerStates[playerName] || []}
              isFinished={escapeStatus === "finished" || (escapeMaze ? ((escapePlayerStates[playerName] || []).length === escapeMaze.paths.length) : false)}
              onClearArrow={onEscapeClearArrow}
              difficulty={escapeDifficulty}
              elapsedTime={escapeElapsedTime}
              finishRank={escapeFinishOrder.find(f => f.player === playerName)?.rank}
              arrowFormat={escapeFormat}
            />
          </div>
        )}

        {/* 8. PODIUM / RANKINGS SCREEN */}
        {playerJoined && activeGame === "report" && (
          <div className="lobby-waiting-container" style={{ display: "flex" }}>
            <div style={{ fontSize: "4rem", animation: "bounceEmoji 1s infinite alternate" }}>🏆</div>
            <h2 className="gradient-text-gold">Event Concluded!</h2>
            <p style={{ color: "var(--text-muted)", fontSize: "0.85rem" }}>Check your position on the final podium.</p>

            <div className="glass-panel" style={{ padding: "15px", width: "100%", textAlign: "left", margin: "10px 0" }}>
              <h3 style={{ fontSize: "1.1rem", marginBottom: "10px", textAlign: "center", borderBottom: "1px dashed var(--border-glass)", paddingBottom: "5px" }}>
                Your Summary
              </h3>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "6px", fontSize: "0.85rem" }}>
                <span>Total Score:</span>
                <strong className="gradient-text-gold">{playerPoints} pts</strong>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.85rem" }}>
                <span>Prize Badge:</span>
                <strong style={{ color: "var(--gold-primary)" }}>{getPodiumBadge()}</strong>
              </div>
            </div>

            <button className="btn btn-outline" style={{ width: "100%" }} onClick={() => alert("Podium results copied to clipboard! Mockup.")}>
              🔗 Share Podium Standings
            </button>
          </div>
        )}

        <div className="phone-bottom-bar"></div>
      </div>
    </div>
  );
}
