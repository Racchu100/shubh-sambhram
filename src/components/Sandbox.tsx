"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import AdminPanel from "./AdminPanel";
import PlayerScreen from "./PlayerScreen";
import { generateMaze, MazeData } from "./ArrowPuzzleGame";
import ArrowEscapeGame, { generateEscapePuzzle, EscapePuzzleData } from "./ArrowEscapeGame";

interface SandboxProps {
  initialEventName: string;
  initialEventPin: string;
  initialMaxPlayers: number;
  initialActiveGames: string[];
  onBackToDashboard?: () => void;
  role?: "admin" | "player" | "both";
}

export interface PlayerBanner {
  text: string;
  icon: string;
  visible: boolean;
}

export default function Sandbox({
  initialEventName,
  initialEventPin,
  initialMaxPlayers,
  initialActiveGames,
  onBackToDashboard,
  role = "both",
}: SandboxProps) {
  // --- VIEW TOGGLE STATE (RESPONSIVE) ---
  const [activeView, setActiveView] = useState<"admin" | "player">("admin");

  // --- GLOBAL EVENT STATE ---
  const [eventName, setEventName] = useState(initialEventName);
  const [eventPin, setEventPin] = useState(initialEventPin);
  const [maxPlayers, setMaxPlayers] = useState(initialMaxPlayers);
  const [activeGames, setActiveGames] = useState<string[]>(initialActiveGames);
  const [isStarted, setIsStarted] = useState(false);
  const [activeGame, setActiveGame] = useState<string>("lobby"); // lobby, housie, eliminate, boat, hunt, memory, report

  // --- PLAYER PROFILE STATE ---
  const [playerName, setPlayerName] = useState("Priya");
  const [playerJoined, setPlayerJoined] = useState(false);
  const [playerPoints, setPlayerPoints] = useState(0);

  // --- LOBBY MULTIPLAYER STATE ---
  const [lobbyPlayers, setLobbyPlayers] = useState([
    { name: "Rahul", points: 0, status: "Ready", active: true },
    { name: "Deepak", points: 0, status: "Ready", active: true },
    { name: "Sanya", points: 0, status: "Ready", active: true },
    { name: "Anjali", points: 0, status: "Ready", active: true },
    { name: "Vikram", points: 0, status: "Ready", active: true },
    { name: "Amit", points: 0, status: "Offline", active: false },
    { name: "Neha", points: 0, status: "Ready", active: true },
    { name: "Sanjay", points: 0, status: "Ready", active: true },
  ]);

  // --- BROADCAST BANNER STATE ---
  const [playerBanner, setPlayerBanner] = useState<PlayerBanner>({
    text: "Welcome to Shubh Sambhram!",
    icon: "🔔",
    visible: false,
  });
  const bannerTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const triggerPlayerBanner = (text: string, icon = "🔔", duration = 3000) => {
    if (bannerTimeoutRef.current) clearTimeout(bannerTimeoutRef.current);
    setPlayerBanner({ text, icon, visible: true });
    bannerTimeoutRef.current = setTimeout(() => {
      setPlayerBanner((prev) => ({ ...prev, visible: false }));
    }, duration);
  };

  // --- GAME 1: HOUSIE (TAMBOLA) STATE ---
  const [housieDrawnNumbers, setHousieDrawnNumbers] = useState<number[]>([]);
  const [housieLastDrawn, setHousieLastDrawn] = useState<number | null>(null);
  const [housieIsAutoDrawing, setHousieIsAutoDrawing] = useState(false);
  const [housieAutoDrawSpeed, setHousieAutoDrawSpeed] = useState(3000);
  const [housiePatterns, setHousiePatterns] = useState<Record<string, { active: boolean; winner: string | null }>>({
    "Five Numbers": { active: true, winner: null },
    "Top Row": { active: true, winner: null },
    "Middle Row": { active: true, winner: null },
    "Bottom Row": { active: true, winner: null },
    "Full House": { active: true, winner: null },
  });
  const [housieClaimsQueue, setHousieClaimsQueue] = useState<any[]>([]);
  const [housieTicket, setHousieTicket] = useState<number[][] | null>(null);
  const [housieMarkedCells, setHousieMarkedCells] = useState<boolean[][] | null>(null);
  const [housieAutoMark, setHousieAutoMark] = useState(true);
  const autoDrawIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // --- GAME 2: ELIMINATE THE IMAGE STATE ---
  const [eliminateRound, setEliminateRound] = useState<number | string>(1);
  const [eliminateOptions, setEliminateOptions] = useState([
    { id: "diya", label: "🪔 Diya Candle", eliminated: false, votes: 0 },
    { id: "sherwani", label: "👑 Sherwani Suit", eliminated: false, votes: 0 },
    { id: "ghaghra", label: "💃 Lehenga Dress", eliminated: false, votes: 0 },
    { id: "dhol", label: "🥁 Punjabi Dhol", eliminated: false, votes: 0 },
  ]);
  const [eliminateSelectedOption, setEliminateSelectedOption] = useState<string | null>(null);
  const [eliminatePlayerVote, setEliminatePlayerVote] = useState<string | null>(null);
  const [eliminateIsFinished, setEliminateIsFinished] = useState(false);
  const [eliminateFeedback, setEliminateFeedback] = useState("Waiting for your selection");
  const [eliminateSurvivors, setEliminateSurvivors] = useState<string[]>([]);
  const [eliminateBotVotes, setEliminateBotVotes] = useState<Record<string, string>>({});
  const [eliminateIsTieBreaker, setEliminateIsTieBreaker] = useState(false);
  const [eliminateTieWinners, setEliminateTieWinners] = useState<string[]>([]);
  const [eliminateWinner, setEliminateWinner] = useState<string | null>(null);

  // --- GAME 3: BOAT RACE STATE ---
  const [boatStatus, setBoatStatus] = useState<"waiting" | "countdown" | "racing" | "finished" | "tie">("waiting");
  const [boatPositions, setBoatPositions] = useState<Record<string, number>>({});
  const [boatResults, setBoatResults] = useState<string[]>([]);
  const [boatCountdownNum, setBoatCountdownNum] = useState<number | null>(null);
  const [boatTieWinners, setBoatTieWinners] = useState<string[]>([]);
  const [boatIsTieBreaker, setBoatIsTieBreaker] = useState(false);
  const boatTimerRef = useRef<NodeJS.Timeout | null>(null);

  // --- GAME 4: TREASURE HUNT STATE ---
  const [huntCurrentClueIdx, setHuntCurrentClueIdx] = useState(0);
  const [huntHintsReleased, setHuntHintsReleased] = useState<boolean[]>([false, false, false]);
  const [huntSolves, setHuntSolves] = useState<any[]>([]);
  const [playerHuntFeedback, setPlayerHuntFeedback] = useState("Unsolved");
  const [huntClues, setHuntClues] = useState([
    {
      question: "I am a thread that binds two souls, woven with love and golden goals. Worn on the wrist in sacred light, what am I?",
      answer: "Mangalsutra",
      hint: "A traditional necklace worn by married women, starting with 'M'",
      options: ["Sindoor", "Mangalsutra", "Bangle", "Dupatta"],
    },
    {
      question: "Sweet and golden, round and neat, no Indian wedding is complete without this treat. What am I?",
      answer: "Laddoo",
      hint: "A popular round yellow Indian sweet, starts with 'L'",
      options: ["Barfi", "Halwa", "Laddoo", "Jalebi"],
    },
    {
      question: "Deep beats fill the festive night, making everyone dance with all their might. What instrument am I?",
      answer: "Dhol",
      hint: "A large double-sided wooden drum, starts with 'D'",
      options: ["Tabla", "Sitar", "Flute", "Dhol"],
    },
  ]);

  // --- GAME 5: PICTURE MEMORY GAME STATE ---
  const [memoryGridSize, setMemoryGridSize] = useState(16);
  const [memoryTheme, setMemoryTheme] = useState("celebration");
  const [memoryPairsMatched, setMemoryPairsMatched] = useState(0);
  const [memoryIsFinished, setMemoryIsFinished] = useState(false);
  const [memoryDeck, setMemoryDeck] = useState<any[]>([]);
  const [memoryBotProgress, setMemoryBotProgress] = useState<Record<string, number>>({});

  // --- GAME 6: ARROW FINISHER PUZZLE STATE ---
  const [arrowDifficulty, setArrowDifficulty] = useState<"easy" | "medium" | "hard">("easy");
  const [arrowStatus, setArrowStatus]     = useState<"waiting" | "active" | "finished">("waiting");
  const [arrowMaze, setArrowMaze]         = useState<MazeData | null>(null);
  const [arrowPlayerPos, setArrowPlayerPos]     = useState<[number, number]>([0, 0]);
  const [arrowPlayerFinished, setArrowPlayerFinished] = useState(false);
  const [arrowFinishOrder, setArrowFinishOrder] = useState<Array<{ player: string; time: number; rank: number }>>([]);
  const [arrowElapsedTime, setArrowElapsedTime] = useState(0);
  const [arrowFormat, setArrowFormat] = useState<"neon" | "unicode" | "emoji" | "cardinal">("neon");
  const [arrowPlayerStates, setArrowPlayerStates] = useState<Record<string, { pos: [number, number]; path: [number, number][] }>>({});
  const arrowTimerRef = useRef<NodeJS.Timeout | null>(null);
  const arrowBotTimersRef = useRef<NodeJS.Timeout[]>([]);

  // --- GAME 7: ARROW ESCAPE PUZZLE STATE ---
  const [escapeDifficulty, setEscapeDifficulty] = useState<"easy" | "medium" | "hard">("easy");
  const [escapeStatus, setEscapeStatus]     = useState<"waiting" | "active" | "finished">("waiting");
  const [escapeMaze, setEscapeMaze]         = useState<EscapePuzzleData | null>(null);
  const [escapeElapsedTime, setEscapeElapsedTime] = useState(0);
  const [escapeFormat, setEscapeFormat] = useState<"neon" | "unicode" | "emoji" | "cardinal">("neon");
  const [escapePlayerStates, setEscapePlayerStates] = useState<Record<string, string[]>>({});
  const [escapeFinishOrder, setEscapeFinishOrder] = useState<Array<{ player: string; time: number; rank: number }>>([]);
  const escapeTimerRef = useRef<NodeJS.Timeout | null>(null);
  const escapeBotTimersRef = useRef<NodeJS.Timeout[]>([]);
  const processedClaimsRef = useRef<string[]>([]);
  const syncFromServerRef = useRef<((data: any) => void) | null>(null);
  const prevDrawnNumbersLengthRef = useRef<number>(0);

  // --- ANALYTICS / POST EVENT REPORT STATE ---
  const [reportWinners, setReportWinners] = useState<Array<{ gameName: string; winnerName: string; prizeTag: string }>>([]);

  // --- REAL-TIME STATE SYNC VIA SERVER API ---
  useEffect(() => {
    if (role === "both") return;

    // Helper to merge state differences into local React state
    const syncFromServer = (data: any) => {
      const updateIfDiff = (current: any, setter: Function, newVal: any) => {
        if (newVal === undefined) return;
        if (JSON.stringify(current) !== JSON.stringify(newVal)) {
          setter(newVal);
        }
      };

      updateIfDiff(activeGame, setActiveGame, data.activeGame);
      updateIfDiff(isStarted, setIsStarted, data.isStarted);
      updateIfDiff(eventName, setEventName, data.eventName);
      updateIfDiff(maxPlayers, setMaxPlayers, data.maxPlayers);
      updateIfDiff(activeGames, setActiveGames, data.activeGames);
      updateIfDiff(playerBanner, setPlayerBanner, data.playerBanner);
      updateIfDiff(lobbyPlayers, setLobbyPlayers, data.lobbyPlayers);
      updateIfDiff(housieDrawnNumbers, setHousieDrawnNumbers, data.housieDrawnNumbers);
 
      // Reset local ticket and marked cells when host resets game (server drawn numbers goes from non-empty to empty)
      if (
        data.housieDrawnNumbers !== undefined &&
        data.housieDrawnNumbers.length === 0
      ) {
        processedClaimsRef.current = [];
        if (prevDrawnNumbersLengthRef.current > 0 && (housieTicket !== null || housieMarkedCells !== null)) {
          setHousieTicket(null);
          setHousieMarkedCells(null);
        }
      }
      
      if (data.housieDrawnNumbers !== undefined) {
        prevDrawnNumbersLengthRef.current = data.housieDrawnNumbers.length;
      }
      updateIfDiff(housieLastDrawn, setHousieLastDrawn, data.housieLastDrawn);
      updateIfDiff(housiePatterns, setHousiePatterns, data.housiePatterns);
      
      // Filter out claims that have already been processed (approved or rejected) on the host side
      const incomingClaims = data.housieClaimsQueue;
      if (incomingClaims !== undefined) {
        const filteredClaims = incomingClaims.filter((c: any) => {
          const cid = c.id || `${c.player}-${c.pattern}`;
          return !processedClaimsRef.current.includes(cid);
        });
        updateIfDiff(housieClaimsQueue, setHousieClaimsQueue, filteredClaims);
      }

      updateIfDiff(eliminateRound, setEliminateRound, data.eliminateRound);
      updateIfDiff(eliminateOptions, setEliminateOptions, data.eliminateOptions);
      updateIfDiff(eliminateIsFinished, setEliminateIsFinished, data.eliminateIsFinished);
      updateIfDiff(eliminateWinner, setEliminateWinner, data.eliminateWinner);
      updateIfDiff(eliminateIsTieBreaker, setEliminateIsTieBreaker, data.eliminateIsTieBreaker);
      updateIfDiff(eliminateTieWinners, setEliminateTieWinners, data.eliminateTieWinners);
      updateIfDiff(boatStatus, setBoatStatus, data.boatStatus);
      updateIfDiff(boatPositions, setBoatPositions, data.boatPositions);
      updateIfDiff(boatResults, setBoatResults, data.boatResults);
      updateIfDiff(boatIsTieBreaker, setBoatIsTieBreaker, data.boatIsTieBreaker);
      updateIfDiff(boatTieWinners, setBoatTieWinners, data.boatTieWinners);
      updateIfDiff(huntCurrentClueIdx, setHuntCurrentClueIdx, data.huntCurrentClueIdx);
      updateIfDiff(huntHintsReleased, setHuntHintsReleased, data.huntHintsReleased);
      updateIfDiff(huntClues, setHuntClues, data.huntClues);
      updateIfDiff(huntSolves, setHuntSolves, data.huntSolves);
      updateIfDiff(memoryGridSize, setMemoryGridSize, data.memoryGridSize);
      updateIfDiff(memoryTheme, setMemoryTheme, data.memoryTheme);
      updateIfDiff(memoryPairsMatched, setMemoryPairsMatched, data.memoryPairsMatched);
      updateIfDiff(memoryDeck, setMemoryDeck, data.memoryDeck);
      updateIfDiff(arrowDifficulty, setArrowDifficulty, data.arrowDifficulty);
      updateIfDiff(arrowStatus, setArrowStatus, data.arrowStatus);
      updateIfDiff(arrowMaze, setArrowMaze, data.arrowMaze);
      updateIfDiff(arrowFinishOrder, setArrowFinishOrder, data.arrowFinishOrder);
      updateIfDiff(arrowElapsedTime, setArrowElapsedTime, data.arrowElapsedTime);
      updateIfDiff(arrowFormat, setArrowFormat, data.arrowFormat);
      updateIfDiff(arrowPlayerStates, setArrowPlayerStates, data.arrowPlayerStates);
      updateIfDiff(escapeDifficulty, setEscapeDifficulty, data.escapeDifficulty);
      updateIfDiff(escapeStatus, setEscapeStatus, data.escapeStatus);
      updateIfDiff(escapeMaze, setEscapeMaze, data.escapeMaze);
      updateIfDiff(escapeElapsedTime, setEscapeElapsedTime, data.escapeElapsedTime);
      updateIfDiff(escapeFormat, setEscapeFormat, data.escapeFormat);
      updateIfDiff(escapePlayerStates, setEscapePlayerStates, data.escapePlayerStates);
      updateIfDiff(escapeFinishOrder, setEscapeFinishOrder, data.escapeFinishOrder);
      updateIfDiff(reportWinners, setReportWinners, data.reportWinners);

      // If playing, sync points specifically from lobbyPlayers array
      if (role === "player") {
        const meInLobby = data.lobbyPlayers?.find((p: any) => p.name === playerName);
        if (meInLobby && meInLobby.points !== undefined) {
          updateIfDiff(playerPoints, setPlayerPoints, meInLobby.points);
        }
      }
    };

    syncFromServerRef.current = syncFromServer;

    // Host Outward Sync (Heartbeat POST every 1000ms)
    // Players Inward Sync (Polling GET every 1000ms)
    let syncInterval: NodeJS.Timeout;

    const performSync = async () => {
      try {
        if (role === "admin") {
          // Host sends current state to API
          const stateObj = {
            activeGame,
            isStarted,
            eventName,
            maxPlayers,
            activeGames,
            playerBanner,
            lobbyPlayers,
            housieDrawnNumbers,
            housieLastDrawn,
            housiePatterns,
            eliminateRound,
            eliminateOptions,
            eliminateIsFinished,
            eliminateWinner,
            eliminateIsTieBreaker,
            eliminateTieWinners,
            boatStatus,
            boatResults,
            boatIsTieBreaker,
            boatTieWinners,
            huntCurrentClueIdx,
            huntHintsReleased,
            huntClues,
            memoryGridSize,
            memoryTheme,
            memoryPairsMatched,
            memoryDeck,
            arrowDifficulty,
            arrowStatus,
            arrowMaze,
            arrowElapsedTime,
            arrowFormat,
            arrowPlayerStates,
            escapeDifficulty,
            escapeStatus,
            escapeMaze,
            escapeElapsedTime,
            escapeFormat,
            escapePlayerStates,
            housieProcessedClaims: processedClaimsRef.current,
          };

          const res = await fetch(`/api/event/${initialEventPin}`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ role: "admin", stateUpdate: stateObj }),
          });
          if (res.ok) {
            const data = await res.json();
            syncFromServer(data);
          }
        } else if (role === "player") {
          // Player pulls state from API
          const res = await fetch(`/api/event/${initialEventPin}`);
          if (res.ok) {
            const data = await res.json();
            syncFromServer(data);
          }
        }
      } catch (err) {
        console.error("Game state sync error:", err);
      }
    };

    // Run immediately on mount
    performSync();

    // Start periodic timer
    syncInterval = setInterval(performSync, 1000);

    return () => clearInterval(syncInterval);
  }, [
    role,
    initialEventPin,
    playerName,
    activeGame,
    isStarted,
    eventName,
    maxPlayers,
    activeGames,
    playerBanner,
    lobbyPlayers,
    housieDrawnNumbers,
    housieLastDrawn,
    housiePatterns,
    housieClaimsQueue,
    housieTicket,
    housieMarkedCells,
    eliminateRound,
    eliminateOptions,
    eliminateIsFinished,
    eliminateWinner,
    eliminateIsTieBreaker,
    eliminateTieWinners,
    boatStatus,
    boatPositions,
    boatResults,
    boatIsTieBreaker,
    boatTieWinners,
    huntCurrentClueIdx,
    huntHintsReleased,
    huntClues,
    huntSolves,
    memoryGridSize,
    memoryTheme,
    memoryPairsMatched,
    memoryDeck,
    arrowDifficulty,
    arrowStatus,
    arrowMaze,
    arrowFinishOrder,
    arrowElapsedTime,
    arrowFormat,
    arrowPlayerStates,
    escapeDifficulty,
    escapeStatus,
    escapeMaze,
    escapeElapsedTime,
    escapeFormat,
    escapePlayerStates,
    escapeFinishOrder,
    reportWinners,
  ]);

  // --- EVENT HANDLERS ---
  const handleStartEvent = () => {
    setIsStarted(true);
    triggerPlayerBanner("Host has started the event! Game on!", "🔥");
    // Switch to first active game automatically
    if (activeGames.length > 0) {
      handleSwitchGame(activeGames[0]);
    }
  };

  const handleEndEvent = () => {
    triggerPlayerBanner("Event concluded by Admin! Check ranks.", "🏆");
    setActiveGame("report");
  };

  const handleSwitchGame = (gameType: string) => {
    setActiveGame(gameType);
    
    // Stop Housie auto-draw if switching away from it
    if (gameType !== "housie" && housieIsAutoDrawing) {
      handleHousieAutoToggle(false);
    }

    if (gameType === "lobby") {
      triggerPlayerBanner("Switched to Waiting Lobby", "🏠");
    } else if (gameType === "housie") {
      triggerPlayerBanner("Tambola Bingo Unlocked!", "🎰");
    } else if (gameType === "eliminate") {
      triggerPlayerBanner("Eliminate the Image Unlocked!", "🚫");
      if (eliminateSurvivors.length === 0) {
        handleResetEliminate();
      }
    } else if (gameType === "boat") {
      triggerPlayerBanner("Boat Tap Race Unlocked!", "🚤");
      // Initial reset boat lanes
      handleResetBoatRace();
    } else if (gameType === "hunt") {
      triggerPlayerBanner("Treasure Hunt Unlocked!", "🗝️");
    } else if (gameType === "memory") {
      triggerPlayerBanner("Memory Game Unlocked!", "🧠");
      handleResetMemoryGame();
    } else if (gameType === "arrow") {
      triggerPlayerBanner("Arrow Finisher Puzzle Unlocked! 🏹", "🏹");
    } else if (gameType === "escape") {
      triggerPlayerBanner("Arrow Escape Puzzle Unlocked! 🏹", "🏹");
      handleEscapeReset();
    }
  };

  const handleBroadcast = (msg: string) => {
    triggerPlayerBanner(msg, "📢", 5000);
  };

  const handlePlayerJoin = (name: string) => {
    setPlayerName(name);
    setPlayerJoined(true);
    triggerPlayerBanner(`Connected to ${eventName}!`, "🎉");

    // Sync join event to API
    fetch(`/api/event/${initialEventPin}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ role: "player", playerName: name, action: "join" }),
    }).catch(console.error);
  };

  // --- GAME 1: HOUSIE (TAMBOLA) LOGIC ---
  const handleHousieDraw = () => {
    setHousieDrawnNumbers((prev) => {
      if (prev.length >= 90) {
        alert("All 90 numbers have been drawn!");
        handleHousieAutoToggle(false);
        return prev;
      }
      let num: number;
      do {
        num = Math.floor(Math.random() * 90) + 1;
      } while (prev.includes(num));
      
      setHousieLastDrawn(num);
      triggerPlayerBanner(`Number called: ${num}!`, "🎰", 1500);

      // Auto-mark logic for Priya
      const isAutoMark = true; // Hardcoded default
      if (isAutoMark && housieTicket && housieMarkedCells && Array.isArray(housieMarkedCells) && Array.isArray(housieMarkedCells[0])) {
        const updatedMarked = housieMarkedCells.map((row, r) =>
          row.map((cell, c) => {
            if (housieTicket[r][c] === num) return true;
            return cell;
          })
        );
        setHousieMarkedCells(updatedMarked);
      }

      return [...prev, num];
    });
  };

  const handleHousieAutoToggle = (start: boolean) => {
    setHousieIsAutoDrawing(start);
    if (start) {
      if (autoDrawIntervalRef.current) clearInterval(autoDrawIntervalRef.current);
      autoDrawIntervalRef.current = setInterval(handleHousieDraw, housieAutoDrawSpeed);
      // Run once immediately
      handleHousieDraw();
    } else {
      if (autoDrawIntervalRef.current) {
        clearInterval(autoDrawIntervalRef.current);
        autoDrawIntervalRef.current = null;
      }
    }
  };

  useEffect(() => {
    // Cleanup interval on speed change or unmount
    if (housieIsAutoDrawing) {
      if (autoDrawIntervalRef.current) clearInterval(autoDrawIntervalRef.current);
      autoDrawIntervalRef.current = setInterval(handleHousieDraw, housieAutoDrawSpeed);
    }
    return () => {
      if (autoDrawIntervalRef.current) clearInterval(autoDrawIntervalRef.current);
    };
  }, [housieAutoDrawSpeed, housieIsAutoDrawing, housieTicket, housieMarkedCells]);

  // Central auto-marking logic for player ticket cells
  useEffect(() => {
    if (housieAutoMark && housieTicket && housieMarkedCells) {
      let changed = false;
      const drawnSet = new Set(housieDrawnNumbers.map(Number));
      const updatedMarked = housieMarkedCells.map((row, r) =>
        row.map((cell, c) => {
          const val = housieTicket[r][c];
          if (val !== 0 && !cell && drawnSet.has(Number(val))) {
            changed = true;
            return true;
          }
          return cell;
        })
      );
      if (changed) {
        setHousieMarkedCells(updatedMarked);
      }
    }
  }, [housieDrawnNumbers, housieTicket, housieAutoMark, housieMarkedCells]);

  const handleHousieReset = () => {
    handleHousieAutoToggle(false);
    setHousieDrawnNumbers([]);
    setHousieLastDrawn(null);
    setHousieClaimsQueue([]);
    processedClaimsRef.current = [];
    setHousiePatterns((prev) => {
      const reset = { ...prev };
      Object.keys(reset).forEach((k) => (reset[k].winner = null));
      return reset;
    });
    setHousieTicket(null);
    setHousieMarkedCells(null);
    triggerPlayerBanner("Housie board reset by Host!", "🎰");
  };

  const handleHousiePatternToggle = (name: string, active: boolean) => {
    setHousiePatterns((prev) => ({
      ...prev,
      [name]: { ...prev[name], active },
    }));
  };

  const handleHousieSubmitClaim = (claim: any) => {
    const claimWithId = {
      id: claim.id || `${claim.player}-${claim.pattern}-${Date.now()}`,
      ...claim,
    };
    setHousieClaimsQueue((prev) => [...prev, claimWithId]);

    // Sync claim to API
    fetch(`/api/event/${initialEventPin}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        role: "player",
        playerName: claimWithId.player,
        action: "housie_claim",
        stateUpdate: { claim: claimWithId }
      }),
    }).catch(console.error);
  };

  const handleHousieVerifyClaim = (claimId: string, approve: boolean) => {
    const claim = housieClaimsQueue.find((c) => c.id === claimId);
    if (!claim) return;

    const cid = claim.id || `${claim.player}-${claim.pattern}`;

    if (approve) {
      // Validate claim logic
      let isValid = true;

      // 1. Check that all cells marked by the player have been drawn
      for (let r = 0; r < 3; r++) {
        for (let c = 0; c < 9; c++) {
          if (claim.marked[r][c]) {
            const num = claim.ticket[r][c];
            if (!housieDrawnNumbers.includes(num)) isValid = false;
          }
        }
      }

      // 2. Check that the pattern criteria are met
      if (isValid) {
        let markedCount = 0;
        for (let r = 0; r < 3; r++) {
          for (let c = 0; c < 9; c++) {
            if (claim.ticket[r][c] !== 0 && claim.marked[r][c]) {
              markedCount++;
            }
          }
        }

        switch (claim.pattern) {
          case "Five Numbers":
            if (markedCount < 5) isValid = false;
            break;
          case "Top Row":
            for (let c = 0; c < 9; c++) {
              if (claim.ticket[0][c] !== 0 && !claim.marked[0][c]) {
                isValid = false;
              }
            }
            break;
          case "Middle Row":
            for (let c = 0; c < 9; c++) {
              if (claim.ticket[1][c] !== 0 && !claim.marked[1][c]) {
                isValid = false;
              }
            }
            break;
          case "Bottom Row":
            for (let c = 0; c < 9; c++) {
              if (claim.ticket[2][c] !== 0 && !claim.marked[2][c]) {
                isValid = false;
              }
            }
            break;
          case "Full House":
            for (let r = 0; r < 3; r++) {
              for (let c = 0; c < 9; c++) {
                if (claim.ticket[r][c] !== 0 && !claim.marked[r][c]) {
                  isValid = false;
                }
              }
            }
            break;
          default:
            isValid = false;
        }
      }

      if (isValid) {
        // Mark winner
        setHousiePatterns((prev) => ({
          ...prev,
          [claim.pattern]: { ...prev[claim.pattern], winner: claim.player },
        }));

        // Award points
        if (claim.player === playerName) {
          setPlayerPoints((p) => p + 100);
        } else {
          setLobbyPlayers((prev) =>
            prev.map((lp) => (lp.name === claim.player ? { ...lp, points: lp.points + 100 } : lp))
          );
        }

        // Add to report
        setReportWinners((prev) => [
          ...prev,
          { gameName: "Housie — " + claim.pattern, winnerName: claim.player, prizeTag: "🥇 Pattern Winner" },
        ]);

        triggerPlayerBanner(`${claim.player} claimed ${claim.pattern}! 🏆`, "🎉", 4000);

        // Remove from local queue
        setHousieClaimsQueue((prev) => prev.filter((c) => c.id !== claimId));

        // Sync approval to server
        if (role === "admin") {
          processedClaimsRef.current.push(cid);

          fetch(`/api/event/${initialEventPin}`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              role: "admin",
              action: "housie_verify_claim",
              stateUpdate: {
                claimId: claim.id,
                claimPlayer: claim.player,
                claimPattern: claim.pattern,
                approved: true,
              },
            }),
          })
          .then((res) => {
            if (!res.ok) throw new Error("Approval fetch failed");
            return res.json();
          })
          .then((data) => {
            syncFromServerRef.current?.(data);
          })
          .catch(console.error);
        }
      } else {
        alert(`Claim verification failed! The pattern "${claim.pattern}" is not fully completed or contains undrawn numbers.`);
        
        // Auto-reject on failed validation
        handleHousieVerifyClaim(claim.id, false);
      }
    } else {
      // Remove from local queue
      setHousieClaimsQueue((prev) => prev.filter((c) => c.id !== claimId));

      // Sync rejection to server
      if (role === "admin") {
        processedClaimsRef.current.push(cid);

        fetch(`/api/event/${initialEventPin}`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            role: "admin",
            action: "housie_verify_claim",
            stateUpdate: {
              claimId: claim.id,
              claimPlayer: claim.player,
              claimPattern: claim.pattern,
              approved: false,
            },
          }),
        })
        .then((res) => {
          if (!res.ok) throw new Error("Rejection fetch failed");
          return res.json();
        })
        .then((data) => {
          syncFromServerRef.current?.(data);
        })
        .catch(console.error);
      }
    }
  };

  const handleHousieClearQueue = () => {
    housieClaimsQueue.forEach((claim) => {
      const cid = claim.id || `${claim.player}-${claim.pattern}`;
      processedClaimsRef.current.push(cid);
    });
    setHousieClaimsQueue([]);

    if (role === "admin") {
      fetch(`/api/event/${initialEventPin}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          role: "admin",
          action: "housie_clear_queue"
        }),
      })
      .then((res) => {
        if (!res.ok) throw new Error("Clear queue failed");
        return res.json();
      })
      .then((data) => {
        syncFromServerRef.current?.(data);
      })
      .catch(console.error);
    }
  };

  // --- GAME 2: ELIMINATE THE IMAGE LOGIC ---
  const simulateBotVotes = (currentSurvivors: string[], currentOptions: any[]) => {
    const remainingOptionIds = currentOptions.filter((o) => !o.eliminated).map((o) => o.id);
    if (remainingOptionIds.length === 0) return { votesMap: {} as Record<string, string>, voteCounts: {} as Record<string, number> };

    const votesMap: Record<string, string> = {};
    const voteCounts: Record<string, number> = {};
    remainingOptionIds.forEach((id) => {
      voteCounts[id] = 0;
    });

    currentSurvivors.forEach((name) => {
      if (name === playerName) return; // Priya votes manually
      const choice = remainingOptionIds[Math.floor(Math.random() * remainingOptionIds.length)];
      votesMap[name] = choice;
      voteCounts[choice] = (voteCounts[choice] || 0) + 1;
    });

    return { votesMap, voteCounts };
  };

  const handleResetEliminate = () => {
    setEliminateRound(1);
    setEliminateIsFinished(false);
    setEliminatePlayerVote(null);
    setEliminateSelectedOption(null);
    setEliminateFeedback("Waiting for your selection");
    setEliminateIsTieBreaker(false);
    setEliminateTieWinners([]);
    setEliminateWinner(null);
    const initialOptions = [
      { id: "diya", label: "🪔 Diya Candle", eliminated: false, votes: 0 },
      { id: "sherwani", label: "👑 Sherwani Suit", eliminated: false, votes: 0 },
      { id: "ghaghra", label: "💃 Lehenga Dress", eliminated: false, votes: 0 },
      { id: "dhol", label: "🥁 Punjabi Dhol", eliminated: false, votes: 0 },
    ];
    setEliminateOptions(initialOptions);

    const survivors = [playerName, ...lobbyPlayers.filter((p) => p.active).map((p) => p.name)];
    setEliminateSurvivors(survivors);

    // Initial bot votes simulation
    const { votesMap, voteCounts } = simulateBotVotes(survivors, initialOptions);
    setEliminateBotVotes(votesMap);

    // Apply vote counts to option state
    setEliminateOptions(
      initialOptions.map((o) => ({
        ...o,
        votes: voteCounts[o.id] || 0,
      }))
    );

    triggerPlayerBanner("Survival Game reset by Host!", "🚫");
  };

  const handleEliminateVote = (optionId: string) => {
    if (eliminateIsTieBreaker && !eliminateTieWinners.includes(playerName)) return;
    if (eliminateSurvivors.length > 0 && !eliminateSurvivors.includes(playerName)) return;

    setEliminateOptions((prev) =>
      prev.map((o) => {
        if (o.id === optionId) return { ...o, votes: o.votes + 1 };
        if (o.id === eliminatePlayerVote) return { ...o, votes: Math.max(0, o.votes - 1) };
        return o;
      })
    );
    const oldVote = eliminatePlayerVote;
    setEliminatePlayerVote(optionId);
    const label = eliminateOptions.find((o) => o.id === optionId)?.label || "";
    setEliminateFeedback(`Vote Status: 🔴 Backing ${label}`);

    // Sync vote to API
    fetch(`/api/event/${initialEventPin}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        role: "player",
        playerName,
        action: "vote",
        stateUpdate: { optionId, previousOptionId: oldVote }
      }),
    }).catch(console.error);
  };

  const handleConfirmElimination = () => {
    if (!eliminateSelectedOption) return;

    // 1. Mark selected option as eliminated
    const updatedOptions = eliminateOptions.map((o) =>
      o.id === eliminateSelectedOption ? { ...o, eliminated: true } : o
    );
    setEliminateOptions(updatedOptions);

    // 2. Identify remaining survivors
    const newSurvivors = eliminateSurvivors.filter((name) => {
      if (name === playerName) {
        return eliminatePlayerVote !== eliminateSelectedOption;
      } else {
        return eliminateBotVotes[name] !== eliminateSelectedOption;
      }
    });

    setEliminateSurvivors(newSurvivors);
    triggerPlayerBanner(`Image Eliminated: ${eliminateSelectedOption.toUpperCase()}!`, "❌", 2500);

    // Check player knockout feedback
    if (eliminateSurvivors.includes(playerName)) {
      if (eliminatePlayerVote === eliminateSelectedOption) {
        setEliminateFeedback("❌ Knocked Out! You backed the eliminated image.");
      } else {
        setEliminatePlayerVote(null);
      }
    }

    const remainingOptions = updatedOptions.filter((o) => !o.eliminated);

    if (remainingOptions.length === 1 || newSurvivors.length <= 1) {
      if (newSurvivors.length === 1) {
        setEliminateIsFinished(true);
        const soleWinner = newSurvivors[0];
        setEliminateWinner(soleWinner);

        if (soleWinner === playerName) {
          setPlayerPoints((p) => p + 150);
          setEliminateFeedback("🎉 You Won! You are the sole survivor! (+150 pts)");
        } else {
          setLobbyPlayers((prev) =>
            prev.map((lp) => (lp.name === soleWinner ? { ...lp, points: lp.points + 150 } : lp))
          );
        }

        setReportWinners((prev) => [
          ...prev,
          { gameName: "Survival Image Winner", winnerName: soleWinner, prizeTag: "👑 Surviving Image Champion" },
        ]);
        triggerPlayerBanner(`Game Finished! Winner is ${soleWinner}! 👑`, "🎉", 4000);
      } else if (newSurvivors.length > 1) {
        // TIE: Multiple players survived
        setEliminateIsFinished(true);
        setEliminateTieWinners(newSurvivors);
        setEliminateFeedback(`⚔️ Tie Detected! Survivors: ${newSurvivors.join(", ")}`);
        triggerPlayerBanner(`TIE DETECTED between ${newSurvivors.join(" and ")}! ⚔️`, "🏁", 4000);
      } else {
        // Everybody eliminated in same round: tie between previous round's survivors
        const prevSurvivors = eliminateSurvivors;
        setEliminateIsFinished(true);
        if (prevSurvivors.length > 1) {
          setEliminateTieWinners(prevSurvivors);
          setEliminateFeedback(`⚔️ Tie Detected! Previous Survivors: ${prevSurvivors.join(", ")}`);
          triggerPlayerBanner(`TIE DETECTED between ${prevSurvivors.join(" and ")}! ⚔️`, "🏁", 4000);
        } else if (prevSurvivors.length === 1) {
          const soleWinner = prevSurvivors[0];
          setEliminateWinner(soleWinner);
          if (soleWinner === playerName) {
            setPlayerPoints((p) => p + 150);
          } else {
            setLobbyPlayers((prev) =>
              prev.map((lp) => (lp.name === soleWinner ? { ...lp, points: lp.points + 150 } : lp))
            );
          }
          setReportWinners((prev) => [
            ...prev,
            { gameName: "Survival Image Winner", winnerName: soleWinner, prizeTag: "👑 Surviving Image Champion" },
          ]);
        } else {
          setEliminateFeedback("💀 No survivors left!");
        }
      }
    } else {
      // Continue next round
      const nextRound = typeof eliminateRound === "number" ? eliminateRound + 1 : 1;
      setEliminateRound(nextRound);

      // Simulate bot votes
      const { votesMap, voteCounts } = simulateBotVotes(newSurvivors, updatedOptions);
      setEliminateBotVotes(votesMap);

      // Apply bot + player vote counts
      setEliminateOptions(
        updatedOptions.map((o) => {
          let count = voteCounts[o.id] || 0;
          if (newSurvivors.includes(playerName) && eliminatePlayerVote === o.id) {
            count += 1;
          }
          return { ...o, votes: count };
        })
      );

      if (newSurvivors.includes(playerName)) {
        setEliminateFeedback(`Vote Status: Waiting for Round ${nextRound} selection`);
      } else {
        setEliminateFeedback("👁️ Spectating... You have been eliminated.");
      }
    }

    setEliminateSelectedOption(null);
  };

  const handleStartEliminateTieBreaker = () => {
    setEliminateIsTieBreaker(true);
    setEliminateIsFinished(false);
    setEliminatePlayerVote(null);
    setEliminateSelectedOption(null);
    setEliminateFeedback("⚔️ Sudden-Death Tie-Breaker! Waiting for selection.");

    const resetOptions = [
      { id: "diya", label: "🪔 Diya Candle", eliminated: false, votes: 0 },
      { id: "sherwani", label: "👑 Sherwani Suit", eliminated: false, votes: 0 },
      { id: "ghaghra", label: "💃 Lehenga Dress", eliminated: false, votes: 0 },
      { id: "dhol", label: "🥁 Punjabi Dhol", eliminated: false, votes: 0 },
    ];
    setEliminateOptions(resetOptions);
    setEliminateSurvivors(eliminateTieWinners);
    setEliminateRound("Tie-Breaker");

    const { votesMap, voteCounts } = simulateBotVotes(eliminateTieWinners, resetOptions);
    setEliminateBotVotes(votesMap);

    setEliminateOptions(
      resetOptions.map((o) => ({
        ...o,
        votes: voteCounts[o.id] || 0,
      }))
    );

    triggerPlayerBanner("Sudden-Death Tie-Breaker Started!", "⚔️", 4000);
  };

  // --- GAME 3: BOAT RACE LOGIC ---
  const handleResetBoatRace = () => {
    setBoatStatus("waiting");
    setBoatPositions({});
    setBoatResults([]);
    setBoatCountdownNum(null);
    setBoatIsTieBreaker(false);
    setBoatTieWinners([]);
    if (boatTimerRef.current) clearInterval(boatTimerRef.current);
    triggerPlayerBanner("Race reset by Host!", "🚤");
  };

  const handleStartBoatRace = () => {
    if (boatStatus !== "waiting") return;
    setBoatStatus("countdown");
    setBoatCountdownNum(3);

    // Reset fields for fresh race
    setBoatIsTieBreaker(false);
    setBoatTieWinners([]);
    setBoatResults([]);

    // Countdown simulation
    let count = 3;
    const interval = setInterval(() => {
      count--;
      if (count > 0) {
        setBoatCountdownNum(count);
      } else {
        clearInterval(interval);
        setBoatStatus("racing");
        setBoatCountdownNum(null);
        startRacingSimulation();
      }
    }, 1000);
  };

  const handleStartBoatTieBreaker = () => {
    setBoatIsTieBreaker(true);
    setBoatStatus("countdown");
    setBoatCountdownNum(3);
    setBoatResults([]);

    // Reset positions for only tied players
    const initialPos: Record<string, number> = {};
    boatTieWinners.forEach((name) => {
      initialPos[name] = 0;
    });
    setBoatPositions(initialPos);

    // Countdown simulation
    let count = 3;
    const interval = setInterval(() => {
      count--;
      if (count > 0) {
        setBoatCountdownNum(count);
      } else {
        clearInterval(interval);
        setBoatStatus("racing");
        setBoatCountdownNum(null);
        startRacingSimulation();
      }
    }, 1000);
  };

  const handlePlayerBoatTap = () => {
    if (boatStatus !== "racing") return;
    if (boatIsTieBreaker && !boatTieWinners.includes(playerName)) return;
    const current = boatPositions[playerName] || 0;
    const next = Math.min(100, current + 2.5);
    setBoatPositions((prev) => ({
      ...prev,
      [playerName]: next,
    }));

    // Sync boat position to API
    fetch(`/api/event/${initialEventPin}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        role: "player",
        playerName,
        action: "boat_tap",
        stateUpdate: { boatPositions: { [playerName]: next } }
      }),
    }).catch(console.error);
  };

  const startRacingSimulation = () => {
    // Reset positions (if not already set in tie-breaker)
    const initialPos: Record<string, number> = {};
    if (boatIsTieBreaker) {
      boatTieWinners.forEach((name) => {
        initialPos[name] = 0;
      });
    } else {
      initialPos[playerName] = 0;
      lobbyPlayers.forEach((lp) => {
        if (lp.active) initialPos[lp.name] = 0;
      });
    }
    setBoatPositions(initialPos);

    boatTimerRef.current = setInterval(() => {
      setBoatPositions((prev) => {
        const nextPositions = { ...prev };
        
        lobbyPlayers.forEach((lp) => {
          if (!lp.active) return;
          if (boatIsTieBreaker && !boatTieWinners.includes(lp.name)) return;
          
          const current = nextPositions[lp.name] || 0;
          if (current >= 100) return;

          const step = Math.random() * 2.2 + 0.8;
          const next = Math.min(100, current + step);
          nextPositions[lp.name] = next;
        });

        return nextPositions;
      });
    }, 200);
  };

  // Check finishes dynamically on positions update
  useEffect(() => {
    if (boatStatus !== "racing") return;

    const racers = boatIsTieBreaker
      ? boatTieWinners
      : [playerName, ...lobbyPlayers.filter((lp) => lp.active).map((lp) => lp.name)];

    const finishedRacers = racers.filter((name) => (boatPositions[name] || 0) >= 100);

    if (finishedRacers.length > 0) {
      const newFinishers = finishedRacers.filter((name) => !boatResults.includes(name));

      if (newFinishers.length > 0) {
        const updatedResults = [...boatResults, ...newFinishers];

        // Check for tie for 1st place
        if (boatResults.length === 0) {
          if (newFinishers.length > 1) {
            if (boatTimerRef.current) clearInterval(boatTimerRef.current);
            setBoatStatus("tie");
            setBoatTieWinners(newFinishers);
            setBoatResults(newFinishers);
            triggerPlayerBanner(`TIE DETECTED between ${newFinishers.join(" and ")}! ⚔️`, "🏁", 5000);
            return;
          }
        }

        setBoatResults(updatedResults);
        checkBoatRaceFinish(updatedResults);
      }
    }
  }, [boatPositions, boatStatus, boatResults, boatIsTieBreaker, boatTieWinners]);

  const checkBoatRaceFinish = (results: string[]) => {
    const activeCount = boatIsTieBreaker
      ? boatTieWinners.length
      : lobbyPlayers.filter((lp) => lp.active).length + 1;

    const endCondition = boatIsTieBreaker
      ? results.length >= activeCount
      : results.length >= 3 || results.length >= activeCount;

    if (endCondition) {
      setBoatStatus("finished");
      if (boatTimerRef.current) clearInterval(boatTimerRef.current);

      if (boatIsTieBreaker) {
        // Tie-breaker finish: award points in order
        results.forEach((winnerName, idx) => {
          const rank = idx + 1;
          const points = rank === 1 ? 200 : rank === 2 ? 150 : rank === 3 ? 100 : 0;
          if (points > 0) {
            if (winnerName === playerName) {
              setPlayerPoints((p) => p + points);
            } else {
              setLobbyPlayers((prev) =>
                prev.map((lp) => (lp.name === winnerName ? { ...lp, points: lp.points + points } : lp))
              );
            }
          }
          const medal = rank === 1 ? "🥇" : rank === 2 ? "🥈" : "🥉";
          if (winnerName === playerName) {
            triggerPlayerBanner(`TIE-BREAKER CHAMPION! You got Rank ${rank}! ${medal}`, "🎉", 5000);
          }
          setReportWinners((prev) => [
            ...prev,
            { gameName: "Boat Race Tie-Breaker", winnerName, prizeTag: `${medal} Tie-Breaker Winner` },
          ]);
        });
      } else {
        // Regular race finish
        results.forEach((winnerName, idx) => {
          const rank = idx + 1;
          const points = rank === 1 ? 200 : rank === 2 ? 150 : rank === 3 ? 100 : 0;
          if (points > 0) {
            if (winnerName === playerName) {
              setPlayerPoints((p) => p + points);
            } else {
              setLobbyPlayers((prev) =>
                prev.map((lp) => (lp.name === winnerName ? { ...lp, points: lp.points + points } : lp))
              );
            }
          }
          const medal = rank === 1 ? "🥇" : rank === 2 ? "🥈" : "🥉";
          if (winnerName === playerName) {
            triggerPlayerBanner(`PODIUM FINISH! You came in Rank ${rank}! ${medal}`, "🎉", 5000);
          }
          setReportWinners((prev) => [
            ...prev,
            { gameName: "Boat Race Podium", winnerName, prizeTag: `${medal} Podium Winner` },
          ]);
        });
      }
    }
  };

  // --- GAME 4: TREASURE HUNT LOGIC ---
  const handleResetTreasureHunt = () => {
    setHuntCurrentClueIdx(0);
    setHuntHintsReleased(Array(huntClues.length).fill(false));
    setHuntSolves([]);
    setPlayerHuntFeedback("Unsolved");
    triggerPlayerBanner("Treasure Hunt reset by Host!", "🗝️");
  };

  const handleUpdateHuntClue = (idx: number, updated: { question: string; answer: string; hint: string; options: string[] }) => {
    setHuntClues((prev) => prev.map((c, i) => (i === idx ? updated : c)));
  };

  const handleAddHuntClue = () => {
    setHuntClues((prev) => [
      ...prev,
      {
        question: "New Riddle Question: Type your riddle here.",
        answer: "Option A",
        hint: "Provide hint details here.",
        options: ["Option A", "Option B", "Option C", "Option D"],
      },
    ]);
    setHuntHintsReleased((prev) => [...prev, false]);
  };

  const handleReleaseHint = (idx: number) => {
    setHuntHintsReleased((prev) => {
      const next = [...prev];
      next[idx] = true;
      return next;
    });
    if (idx === huntCurrentClueIdx) {
      triggerPlayerBanner("New Hint Released by Host!", "💡", 4000);
    }
  };

  const handleSubmitHuntAnswer = (selectedOption: string) => {
    const clean = selectedOption.trim().toLowerCase();
    const correct = huntClues[huntCurrentClueIdx].answer.trim().toLowerCase();

    if (clean === correct) {
      setPlayerPoints((p) => p + 120);
      setPlayerHuntFeedback("✅ Correct! Unlocked next clue.");
      setHuntSolves((prev) => [...prev, { player: playerName, clueIdx: huntCurrentClueIdx, points: 120 }]);
      
      const nextClue = huntCurrentClueIdx + 1;
      setHuntCurrentClueIdx(nextClue);

      if (nextClue >= huntClues.length) {
        triggerPlayerBanner("Treasure Hunt Completed!", "🗝️");
        setPlayerHuntFeedback("Completed! Stand by for report.");
        setReportWinners((prev) => [
          ...prev,
          { gameName: "Treasure Hunt Speedrun", winnerName: playerName, prizeTag: "⛵ Scavenger Master" },
        ]);
      } else {
        triggerPlayerBanner("Correct! Next clue unlocked.", "🗝️");
      }

      // Sync solve to API
      fetch(`/api/event/${initialEventPin}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          role: "player",
          playerName,
          action: "hunt_solve",
          stateUpdate: { clueIdx: huntCurrentClueIdx, points: 120, wrong: false, skipped: false }
        }),
      }).catch(console.error);
    } else {
      setPlayerHuntFeedback("❌ Wrong answer! Moving to next clue.");
      setHuntSolves((prev) => [...prev, { player: playerName, clueIdx: huntCurrentClueIdx, points: 0, wrong: true }]);

      const nextClue = huntCurrentClueIdx + 1;
      setHuntCurrentClueIdx(nextClue);

      if (nextClue >= huntClues.length) {
        triggerPlayerBanner("Treasure Hunt Completed!", "🗝️");
        setPlayerHuntFeedback("Completed! Stand by for report.");
        setReportWinners((prev) => [
          ...prev,
          { gameName: "Treasure Hunt Speedrun", winnerName: playerName, prizeTag: "⛵ Scavenger Master" },
        ]);
      } else {
        triggerPlayerBanner("Wrong answer! Next clue unlocked.", "❌");
      }

      // Sync solve to API
      fetch(`/api/event/${initialEventPin}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          role: "player",
          playerName,
          action: "hunt_solve",
          stateUpdate: { clueIdx: huntCurrentClueIdx, points: 0, wrong: true, skipped: false }
        }),
      }).catch(console.error);
    }
  };

  const handleSkipHuntClue = () => {
    const nextClue = huntCurrentClueIdx + 1;
    setHuntSolves((prev) => [...prev, { player: playerName, clueIdx: huntCurrentClueIdx, points: 0, skipped: true }]);
    setHuntCurrentClueIdx(nextClue);
    setPlayerHuntFeedback("Skipped! Moving to next clue.");

    if (nextClue >= huntClues.length) {
      triggerPlayerBanner("Treasure Hunt Completed!", "🗝️");
      setPlayerHuntFeedback("Completed! Stand by for report.");
      setReportWinners((prev) => [
        ...prev,
        { gameName: "Treasure Hunt Speedrun", winnerName: playerName, prizeTag: "⛵ Scavenger Master" },
      ]);
    } else {
      triggerPlayerBanner("Clue Skipped! Next one unlocked.", "💨");
    }

    // Sync skip to API
    fetch(`/api/event/${initialEventPin}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        role: "player",
        playerName,
        action: "hunt_solve",
        stateUpdate: { clueIdx: huntCurrentClueIdx, points: 0, wrong: false, skipped: true }
      }),
    }).catch(console.error);
  };

  // --- GAME 5: PICTURE MEMORY LOGIC ---
  const handleResetMemoryGame = () => {
    setMemoryPairsMatched(0);
    setMemoryIsFinished(false);
    setMemoryBotProgress({});
    triggerPlayerBanner("Memory Board Generated! Go Match!", "🧠");
  };

  const handleMemoryStart = (gridSize: number, theme: string) => {
    setMemoryGridSize(gridSize);
    setMemoryTheme(theme);
    handleResetMemoryGame();

    // Generate deck
    const celebrationSymbols = ["🪔", "👑", "💃", "🥁", "🎺", "🏵️", "💍", "🎁", "🥭", "🥥", "🍨", "🍿"];
    const foodSymbols = ["🍛", "🧁", "🥭", "🍇", "🥥", "🧋", "🍵", "🍩", "🥯", "🥞", "🍕", "🍰"];
    const animalSymbols = ["🐘", "🦚", "🐅", "🦌", "🐪", "🐎", "🦜", "🦢", "🦅", "🦁", "🐻", "🐼"];

    let source = celebrationSymbols;
    if (theme === "food") source = foodSymbols;
    if (theme === "animals") source = animalSymbols;

    const numPairs = gridSize / 2;
    const icons = source.slice(0, numPairs);
    let deck = [...icons, ...icons];

    // Shuffle deck
    for (let i = deck.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [deck[i], deck[j]] = [deck[j], deck[i]];
    }

    setMemoryDeck(
      deck.map((icon, index) => ({
        id: index,
        icon,
        flipped: false,
        matched: false,
      }))
    );
  };

  const handlePlayerMemoryMatch = () => {
    const nextPairs = memoryPairsMatched + 1;
    setMemoryPairsMatched(nextPairs);

    if (nextPairs >= memoryGridSize / 2) {
      setMemoryIsFinished(true);
      setPlayerPoints((p) => p + 140);
      triggerPlayerBanner("Memory Game Board Completed!", "🧠");
      setReportWinners((prev) => [
        ...prev,
        { gameName: "Picture Memory Speedrun", winnerName: playerName, prizeTag: "🧠 Memory Wizard" },
      ]);
    }
  };

  // Update memory leaderboard (bot simulation)
  useEffect(() => {
    if (activeGame === "memory" && !memoryIsFinished) {
      const timer = setInterval(() => {
        setMemoryBotProgress((prev) => {
          const next = { ...prev };
          lobbyPlayers.forEach((lp) => {
            if (!lp.active) return;
            const current = next[lp.name] || 0;
            if (current < memoryGridSize / 2 && Math.random() > 0.6) {
              next[lp.name] = current + 1;
            }
          });
          return next;
        });
      }, 4000);
      return () => clearInterval(timer);
    }
  }, [activeGame, memoryIsFinished, memoryGridSize, lobbyPlayers]);

  // --- GAME 6: ARROW PUZZLE HANDLERS ---
  // --- GAME 6: ARROW PUZZLE HANDLERS ---
  const getValidMovesForMaze = (maze: MazeData, r: number, c: number): [number, number][] => {
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

  const handleArrowStart = (diff: "easy" | "medium" | "hard") => {
    const sizes = { easy: [6, 6], medium: [8, 8], hard: [10, 10] };
    const lengths = { easy: [10, 13], medium: [15, 18], hard: [20, 25] };
    const [rows, cols] = sizes[diff];
    const [minL, maxL] = lengths[diff];
    const maze = generateMaze(rows, cols, minL, maxL);

    setArrowDifficulty(diff);
    setArrowMaze(maze);
    setArrowPlayerPos([0, 0]);
    setArrowPlayerFinished(false);
    setArrowFinishOrder([]);
    setArrowElapsedTime(0);
    setArrowStatus("active");

    // Initialize player states on the grid
    const initialStates: Record<string, { pos: [number, number]; path: [number, number][] }> = {
      [playerName]: { pos: [0, 0], path: [[0, 0]] }
    };
    const activeBots = lobbyPlayers.filter((p: any) => p.active !== false).slice(0, 6);
    activeBots.forEach((b: any) => {
      const name = typeof b === "string" ? b : b.name;
      initialStates[name] = { pos: [0, 0], path: [[0, 0]] };
    });
    setArrowPlayerStates(initialStates);

    // Clear previous bot intervals
    arrowBotTimersRef.current.forEach(clearInterval);
    arrowBotTimersRef.current = [];

    // Bot step-by-step simulation interval
    const botInterval = setInterval(() => {
      let timeNow = 0;
      setArrowElapsedTime(e => { timeNow = e; return e; });

      setArrowPlayerStates(prev => {
        const next = { ...prev };
        
        activeBots.forEach((bot: any) => {
          const name = typeof bot === "string" ? bot : bot.name;
          const state = next[name];
          if (!state) return;
          const [r, c] = state.pos;
          if (r === rows - 1 && c === cols - 1) return; // already finished

          const valid = getValidMovesForMaze(maze, r, c);
          let nextPos: [number, number];
          let nextPath = [...state.path];

          if (valid.length === 0) {
            if (state.path.length > 1) {
              nextPath.pop();
              nextPos = nextPath[nextPath.length - 1];
            } else {
              nextPos = [0, 0];
            }
          } else {
            const solutionIdx = maze.solutionPath.findIndex(([sr, sc]) => sr === r && sc === c);
            if (solutionIdx !== -1 && solutionIdx < maze.solutionPath.length - 1) {
              const nextCorrect = maze.solutionPath[solutionIdx + 1];
              if (Math.random() < 0.75) {
                nextPos = nextCorrect;
              } else {
                const decoys = valid.filter(([vr, vc]) => vr !== nextCorrect[0] || vc !== nextCorrect[1]);
                nextPos = decoys.length > 0 ? decoys[Math.floor(Math.random() * decoys.length)] : nextCorrect;
              }
            } else {
              if (Math.random() < 0.6 && state.path.length > 1) {
                nextPath.pop();
                nextPos = nextPath[nextPath.length - 1];
              } else {
                const unvisited = valid.filter(([vr, vc]) => !state.path.some(([pr, pc]) => pr === vr && pc === vc));
                nextPos = unvisited.length > 0 ? unvisited[Math.floor(Math.random() * unvisited.length)] : valid[Math.floor(Math.random() * valid.length)];
              }
            }
            
            if (nextPos[0] !== state.pos[0] || nextPos[1] !== state.pos[1]) {
              nextPath.push(nextPos);
            }
          }

          next[name] = { pos: nextPos, path: nextPath };

          if (nextPos[0] === rows - 1 && nextPos[1] === cols - 1) {
            setArrowFinishOrder(prevOrder => {
              if (prevOrder.find(f => f.player === name)) return prevOrder;
              const rank = prevOrder.length + 1;
              const medal = rank === 1 ? "🥇" : rank === 2 ? "🥈" : rank === 3 ? "🥉" : "";
              if (rank <= 3) {
                triggerPlayerBanner(`${name} escaped the maze! ${medal}`, "🏆", 3000);
              }
              // Award points to bots
              setLobbyPlayers(prevLobby =>
                prevLobby.map(lp =>
                  lp.name === name
                    ? { ...lp, points: lp.points + (rank === 1 ? 200 : rank === 2 ? 150 : rank === 3 ? 100 : 60) }
                    : lp
                )
              );
              return [...prevOrder, { player: name, time: timeNow, rank }];
            });
          }
        });

        return next;
      });
    }, 2200);

    arrowBotTimersRef.current.push(botInterval);

    // Main Clock Timer
    if (arrowTimerRef.current) clearInterval(arrowTimerRef.current);
    arrowTimerRef.current = setInterval(() => {
      setArrowElapsedTime(prev => prev + 1);
    }, 1000);

    triggerPlayerBanner("Arrow Finisher Puzzle started! Find the exit! 🏹", "🏹", 4000);
  };

  const handleArrowMove = useCallback((nr: number, nc: number) => {
    if (!arrowMaze || arrowPlayerFinished || arrowStatus !== "active") return;
    
    setArrowPlayerPos([nr, nc]);
    setArrowPlayerStates(prev => {
      const state = prev[playerName] || { pos: [0, 0], path: [[0, 0]] };
      return {
        ...prev,
        [playerName]: {
          pos: [nr, nc],
          path: [...state.path, [nr, nc]]
        }
      };
    });

    if (nr === arrowMaze.end[0] && nc === arrowMaze.end[1]) {
      setArrowPlayerFinished(true);
      const rank = arrowFinishOrder.length + 1;
      setArrowFinishOrder(prev => {
        if (prev.find(f => f.player === playerName)) return prev;
        return [...prev, { player: playerName, time: arrowElapsedTime, rank }];
      });
      if (arrowTimerRef.current) clearInterval(arrowTimerRef.current);
      triggerPlayerBanner(`You escaped! Rank #${rank} 🏹`, "🏆", 5000);
      const pts = rank === 1 ? 200 : rank === 2 ? 150 : rank === 3 ? 100 : 60;
      setPlayerPoints(p => p + pts);
      
      // Add winner to post-event report
      const medal = rank === 1 ? "🥇" : rank === 2 ? "🥈" : rank === 3 ? "🥉" : "🎖️";
      setReportWinners(prev => [
        ...prev,
        { gameName: "Arrow Finisher", winnerName: playerName, prizeTag: `${medal} Escape Champion` }
      ]);

      // Sync finish to API
      fetch(`/api/event/${initialEventPin}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          role: "player",
          playerName,
          action: "arrow_finish",
          stateUpdate: { time: arrowElapsedTime, rank, points: pts }
        }),
      }).catch(console.error);
    }
  }, [arrowMaze, arrowPlayerFinished, arrowStatus, arrowFinishOrder, arrowElapsedTime, playerName, initialEventPin]);

  const handleArrowReset = () => {
    if (arrowTimerRef.current) clearInterval(arrowTimerRef.current);
    arrowBotTimersRef.current.forEach(clearInterval);
    arrowBotTimersRef.current = [];
    setArrowMaze(null);
    setArrowStatus("waiting");
    setArrowPlayerPos([0, 0]);
    setArrowPlayerFinished(false);
    setArrowFinishOrder([]);
    setArrowElapsedTime(0);
    setArrowPlayerStates({});
  };

  // --- GAME 7: ARROW ESCAPE HANDLERS ---
  const handleEscapeStart = (diff: "easy" | "medium" | "hard") => {
    const sizes = { easy: 6, medium: 8, hard: 10 };
    const arrowCounts = { easy: 12, medium: 16, hard: 22 };
    const gridDim = sizes[diff];
    const targetArrows = arrowCounts[diff];
    const maze = generateEscapePuzzle(gridDim, gridDim, targetArrows);

    setEscapeDifficulty(diff);
    setEscapeMaze(maze);
    setEscapeElapsedTime(0);
    setEscapeStatus("active");
    setEscapeFinishOrder([]);

    // Initialize player states
    const initialStates: Record<string, string[]> = {
      [playerName]: []
    };
    const activeBots = lobbyPlayers.filter((p: any) => p.active !== false).slice(0, 6);
    activeBots.forEach((b: any) => {
      const name = typeof b === "string" ? b : b.name;
      initialStates[name] = [];
    });
    setEscapePlayerStates(initialStates);

    // Clear previous bot intervals
    escapeBotTimersRef.current.forEach(clearInterval);
    escapeBotTimersRef.current = [];

    // Bot step-by-step simulation interval
    const botInterval = setInterval(() => {
      let timeNow = 0;
      setEscapeElapsedTime(e => { timeNow = e; return e; });

      setEscapePlayerStates(prev => {
        const next = { ...prev };
        
        activeBots.forEach((bot: any) => {
          const name = typeof bot === "string" ? bot : bot.name;
          const cleared = next[name];
          if (!cleared || cleared.length === targetArrows) return; // already finished

          // Find active paths for this bot
          const activeArrows = maze.paths.filter(p => !cleared.includes(p.id));
          if (activeArrows.length === 0) return;

          // Find unblocked active arrows for this bot
          const unblocked = activeArrows.filter(path => {
            // Check all nodes in path after start node
            for (let i = 1; i < path.nodes.length; i++) {
              const [r, c] = path.nodes[i];
              if (r < 0 || r >= gridDim || c < 0 || c >= gridDim) continue;
              // Check if another active arrow is occupying this grid cell
              const isOccupied = maze.paths.some(p => {
                if (p.id === path.id || cleared.includes(p.id)) return false;
                return p.nodes[0][0] === r && p.nodes[0][1] === c;
              });
              if (isOccupied) return true;
            }
            return false;
          });

          if (unblocked.length > 0) {
            // Pick a random unblocked arrow and clear it
            const targetArrow = unblocked[Math.floor(Math.random() * unblocked.length)];
            const nextCleared = [...cleared, targetArrow.id];
            next[name] = nextCleared;

            if (nextCleared.length === targetArrows) {
              setEscapeFinishOrder(prevOrder => {
                if (prevOrder.find(f => f.player === name)) return prevOrder;
                const rank = prevOrder.length + 1;
                const medal = rank === 1 ? "🥇" : rank === 2 ? "🥈" : rank === 3 ? "🥉" : "";
                if (rank <= 3) {
                  triggerPlayerBanner(`${name} escaped the arrows! ${medal}`, "🏆", 3000);
                }
                // Award points to bots
                setLobbyPlayers(prevLobby =>
                  prevLobby.map(lp =>
                    lp.name === name
                      ? { ...lp, points: lp.points + (rank === 1 ? 200 : rank === 2 ? 150 : rank === 3 ? 100 : 60) }
                      : lp
                  )
                );
                return [...prevOrder, { player: name, time: timeNow, rank }];
              });
            }
          }
        });

        return next;
      });
    }, 2200);

    escapeBotTimersRef.current.push(botInterval);

    // Main Clock Timer
    if (escapeTimerRef.current) clearInterval(escapeTimerRef.current);
    escapeTimerRef.current = setInterval(() => {
      setEscapeElapsedTime(prev => prev + 1);
    }, 1000);

    triggerPlayerBanner("Arrow Escape started! Clear all arrows! 🏹", "🏹", 4000);
  };

  const handleEscapeClearArrow = useCallback((id: string) => {
    if (!escapeMaze || escapeStatus !== "active") return;

    setEscapePlayerStates(prev => {
      const cleared = prev[playerName] || [];
      if (cleared.includes(id)) return prev;
      const nextCleared = [...cleared, id];
      const targetArrows = escapeMaze.paths.length;

      if (nextCleared.length === targetArrows) {
        // Player finished!
        const rank = escapeFinishOrder.length + 1;
        setEscapeFinishOrder(prevOrder => {
          if (prevOrder.find(f => f.player === playerName)) return prevOrder;
          return [...prevOrder, { player: playerName, time: escapeElapsedTime, rank }];
        });
        setEscapeStatus("finished");
        if (escapeTimerRef.current) clearInterval(escapeTimerRef.current);
        escapeBotTimersRef.current.forEach(clearInterval);

        triggerPlayerBanner(`You escaped the arrows! Rank #${rank} 🏹`, "🏆", 5000);
        const pts = rank === 1 ? 200 : rank === 2 ? 150 : rank === 3 ? 100 : 60;
        setPlayerPoints(p => p + pts);

        // Add winner to post-event report
        const medal = rank === 1 ? "🥇" : rank === 2 ? "🥈" : rank === 3 ? "🥉" : "🎖️";
        setReportWinners(prevWinners => [
          ...prevWinners,
          { gameName: "Arrow Escape", winnerName: playerName, prizeTag: `${medal} Winding Path Champion` }
        ]);

        // Sync finish to API
        fetch(`/api/event/${initialEventPin}`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            role: "player",
            playerName,
            action: "escape_finish",
            stateUpdate: { time: escapeElapsedTime, rank, points: pts }
          }),
        }).catch(console.error);
      }

      return {
        ...prev,
        [playerName]: nextCleared
      };
    });
  }, [escapeMaze, escapeStatus, escapeFinishOrder, escapeElapsedTime, playerName]);

  const handleEscapeReset = () => {
    if (escapeTimerRef.current) clearInterval(escapeTimerRef.current);
    escapeBotTimersRef.current.forEach(clearInterval);
    escapeBotTimersRef.current = [];
    setEscapeMaze(null);
    setEscapeStatus("waiting");
    setEscapeElapsedTime(0);
    setEscapePlayerStates({});
    setEscapeFinishOrder([]);
  };

  if (role === "admin") {
    return (
      <main id="sandbox-page" style={{ display: "flex", height: "calc(100vh - var(--header-height))" }}>
        <div className="sandbox-container" style={{ display: "flex", width: "100%", height: "100%" }}>
          <section className="admin-panel active-view" style={{ flex: 1, display: "flex", flexDirection: "column", borderRight: "none" }}>
            <AdminPanel
              eventName={eventName}
              eventPin={eventPin}
              maxPlayers={maxPlayers}
              activeGames={activeGames}
              isStarted={isStarted}
              activeGame={activeGame}
              lobbyPlayers={lobbyPlayers}
              playerName={playerName}
              playerPoints={playerPoints}
              playerJoined={playerJoined}
              // Tambola
              housieDrawnNumbers={housieDrawnNumbers}
              housieLastDrawn={housieLastDrawn}
              housieIsAutoDrawing={housieIsAutoDrawing}
              housiePatterns={housiePatterns}
              housieClaimsQueue={housieClaimsQueue}
              onHousieDraw={handleHousieDraw}
              onHousieAutoToggle={handleHousieAutoToggle}
              onHousieReset={handleHousieReset}
              onHousiePatternToggle={handleHousiePatternToggle}
              onHousieVerifyClaim={handleHousieVerifyClaim}
              onHousieClearQueue={handleHousieClearQueue}
              onHousieSpeedChange={setHousieAutoDrawSpeed}
              // Eliminate
              eliminateRound={eliminateRound}
              eliminateOptions={eliminateOptions}
              eliminateSelectedOption={eliminateSelectedOption}
              eliminateFeedback={eliminateFeedback}
              eliminateIsFinished={eliminateIsFinished}
              eliminateSurvivors={eliminateSurvivors}
              eliminateIsTieBreaker={eliminateIsTieBreaker}
              eliminateTieWinners={eliminateTieWinners}
              eliminateWinner={eliminateWinner}
              onEliminateReset={handleResetEliminate}
              onEliminateSelectOption={setEliminateSelectedOption}
              onEliminateConfirm={handleConfirmElimination}
              onStartEliminateTieBreaker={handleStartEliminateTieBreaker}
              // Boat
              boatStatus={boatStatus}
              boatPositions={boatPositions}
              boatResults={boatResults}
              boatTieWinners={boatTieWinners}
              boatIsTieBreaker={boatIsTieBreaker}
              onBoatReset={handleResetBoatRace}
              onBoatStart={handleStartBoatRace}
              onStartBoatTieBreaker={handleStartBoatTieBreaker}
              // Hunt
              huntClues={huntClues}
              huntCurrentClueIdx={huntCurrentClueIdx}
              huntHintsReleased={huntHintsReleased}
              huntSolves={huntSolves}
              onHuntReset={handleResetTreasureHunt}
              onHuntReleaseHint={handleReleaseHint}
              onUpdateClue={handleUpdateHuntClue}
              onAddClue={handleAddHuntClue}
              // Memory
              memoryGridSize={memoryGridSize}
              memoryTheme={memoryTheme}
              memoryPairsMatched={memoryPairsMatched}
              memoryBotProgress={memoryBotProgress}
              onMemoryStart={handleMemoryStart}
              onMemoryReset={handleResetMemoryGame}
              // Arrow Puzzle
              arrowDifficulty={arrowDifficulty}
              arrowStatus={arrowStatus}
              arrowFinishOrder={arrowFinishOrder}
              arrowMaze={arrowMaze}
              onArrowStart={handleArrowStart}
              onArrowReset={handleArrowReset}
              arrowFormat={arrowFormat}
              onArrowSelectFormat={setArrowFormat}
              arrowPlayerStates={arrowPlayerStates}
              // Arrow Escape
              escapeDifficulty={escapeDifficulty}
              escapeStatus={escapeStatus}
              escapeFinishOrder={escapeFinishOrder}
              escapeMaze={escapeMaze}
              onEscapeStart={handleEscapeStart}
              onEscapeReset={handleEscapeReset}
              escapeFormat={escapeFormat}
              onEscapeSelectFormat={setEscapeFormat}
              escapePlayerStates={escapePlayerStates}
              // Config
              onStartEvent={handleStartEvent}
              onEndEvent={handleEndEvent}
              onSwitchGame={handleSwitchGame}
              onBroadcast={handleBroadcast}
              // Report
              reportWinners={reportWinners}
            />
          </section>
        </div>
      </main>
    );
  }

  if (role === "player") {
    return (
      <main id="sandbox-page" style={{ display: "flex", height: "100vh" }}>
        <div className="sandbox-container" style={{ display: "flex", width: "100%", height: "100%" }}>
          <section className="player-panel active-view" style={{ flex: 1, display: "flex", flexDirection: "column", padding: 0 }}>
            <PlayerScreen
              eventName={eventName}
              eventPin={eventPin}
              isStarted={isStarted}
              activeGame={activeGame}
              playerName={playerName}
              playerJoined={playerJoined}
              playerPoints={playerPoints}
              lobbyPlayers={lobbyPlayers}
              playerBanner={playerBanner}
              // Join
              onJoin={handlePlayerJoin}
              // Tambola
              housieDrawnNumbers={housieDrawnNumbers}
              housiePatterns={housiePatterns}
              housieTicket={housieTicket}
              housieMarkedCells={housieMarkedCells}
              housieClaimsQueue={housieClaimsQueue}
              onHousieTicketChange={setHousieTicket}
              onHousieMarkedCellsChange={setHousieMarkedCells}
              onHousieSubmitClaim={handleHousieSubmitClaim}
              onHousieDrawLog={housieDrawnNumbers.slice(-5).reverse()}
              onTriggerBanner={triggerPlayerBanner}
              housieAutoMark={housieAutoMark}
              onHousieAutoMarkChange={setHousieAutoMark}
              // Eliminate
              eliminateRound={eliminateRound}
              eliminateOptions={eliminateOptions}
              eliminatePlayerVote={eliminatePlayerVote}
              eliminateFeedback={eliminateFeedback}
              eliminateIsFinished={eliminateIsFinished}
              eliminateSurvivors={eliminateSurvivors}
              eliminateIsTieBreaker={eliminateIsTieBreaker}
              eliminateTieWinners={eliminateTieWinners}
              eliminateWinner={eliminateWinner}
              onEliminateVote={handleEliminateVote}
              // Boat
              boatStatus={boatStatus}
              boatPositions={boatPositions}
              boatResults={boatResults}
              boatCountdownNum={boatCountdownNum}
              boatTieWinners={boatTieWinners}
              boatIsTieBreaker={boatIsTieBreaker}
              onBoatTap={handlePlayerBoatTap}
              // Hunt
              huntClues={huntClues}
              huntCurrentClueIdx={huntCurrentClueIdx}
              huntHintsReleased={huntHintsReleased}
              playerHuntFeedback={playerHuntFeedback}
              onHuntSubmitAnswer={handleSubmitHuntAnswer}
              onHuntSkip={handleSkipHuntClue}
              // Memory
              memoryGridSize={memoryGridSize}
              memoryTheme={memoryTheme}
              memoryPairsMatched={memoryPairsMatched}
              memoryDeck={memoryDeck}
              onMemoryMatch={handlePlayerMemoryMatch}
              onMemoryDeckChange={setMemoryDeck}
              // Arrow Puzzle
              arrowMaze={arrowMaze}
              arrowPlayerPos={arrowPlayerPos}
              arrowPlayerFinished={arrowPlayerFinished}
              arrowElapsedTime={arrowElapsedTime}
              arrowDifficulty={arrowDifficulty}
              arrowFinishOrder={arrowFinishOrder}
              onArrowMoveTo={handleArrowMove}
              arrowFormat={arrowFormat}
              arrowPlayerPath={arrowPlayerStates[playerName]?.path || [[0, 0]]}
              // Arrow Escape
              escapeDifficulty={escapeDifficulty}
              escapeStatus={escapeStatus}
              escapeFinishOrder={escapeFinishOrder}
              escapeMaze={escapeMaze}
              escapeElapsedTime={escapeElapsedTime}
              escapeFormat={escapeFormat}
              escapePlayerStates={escapePlayerStates}
              onEscapeClearArrow={handleEscapeClearArrow}
              hideFrame={true}
            />
          </section>
        </div>
      </main>
    );
  }

  return (
    <main id="sandbox-page" style={{ display: "flex" }}>
      {/* Responsive Toggle Switch */}
      <div className="screen-toggle-switch" style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
        {onBackToDashboard && (
          <button
            className="btn btn-outline"
            style={{ padding: "7px 14px", fontSize: "0.8rem", borderColor: "rgba(255,215,0,0.3)", color: "var(--gold-primary)" }}
            onClick={onBackToDashboard}
          >
            ← Dashboard
          </button>
        )}
        <button
          className={`btn ${activeView === "admin" ? "btn-primary" : "btn-primary btn-outline"}`}
          onClick={() => setActiveView("admin")}
        >
          🖥️ Admin Console
        </button>
        <button
          className={`btn ${activeView === "player" ? "btn-secondary" : "btn-secondary btn-outline"}`}
          onClick={() => setActiveView("player")}
        >
          📱 Player Mobile
        </button>
      </div>

      <div className="sandbox-container" style={{ display: "flex", width: "100%", height: "100%" }}>
        {/* LEFT PANEL: ADMIN DASHBOARD */}
        <section className={`admin-panel ${activeView === "admin" ? "active-view" : ""}`}>
          <AdminPanel
            eventName={eventName}
            eventPin={eventPin}
            maxPlayers={maxPlayers}
            activeGames={activeGames}
            isStarted={isStarted}
            activeGame={activeGame}
            lobbyPlayers={lobbyPlayers}
            playerName={playerName}
            playerPoints={playerPoints}
            playerJoined={playerJoined}
            // Tambola
            housieDrawnNumbers={housieDrawnNumbers}
            housieLastDrawn={housieLastDrawn}
            housieIsAutoDrawing={housieIsAutoDrawing}
            housiePatterns={housiePatterns}
            housieClaimsQueue={housieClaimsQueue}
            onHousieDraw={handleHousieDraw}
            onHousieAutoToggle={handleHousieAutoToggle}
            onHousieReset={handleHousieReset}
            onHousiePatternToggle={handleHousiePatternToggle}
            onHousieVerifyClaim={handleHousieVerifyClaim}
            onHousieClearQueue={handleHousieClearQueue}
            onHousieSpeedChange={setHousieAutoDrawSpeed}
            // Eliminate
            eliminateRound={eliminateRound}
            eliminateOptions={eliminateOptions}
            eliminateSelectedOption={eliminateSelectedOption}
            eliminateFeedback={eliminateFeedback}
            eliminateIsFinished={eliminateIsFinished}
            eliminateSurvivors={eliminateSurvivors}
            eliminateIsTieBreaker={eliminateIsTieBreaker}
            eliminateTieWinners={eliminateTieWinners}
            eliminateWinner={eliminateWinner}
            onEliminateReset={handleResetEliminate}
            onEliminateSelectOption={setEliminateSelectedOption}
            onEliminateConfirm={handleConfirmElimination}
            onStartEliminateTieBreaker={handleStartEliminateTieBreaker}
            // Boat
            boatStatus={boatStatus}
            boatPositions={boatPositions}
            boatResults={boatResults}
            boatTieWinners={boatTieWinners}
            boatIsTieBreaker={boatIsTieBreaker}
            onBoatReset={handleResetBoatRace}
            onBoatStart={handleStartBoatRace}
            onStartBoatTieBreaker={handleStartBoatTieBreaker}
            // Hunt
            huntClues={huntClues}
            huntCurrentClueIdx={huntCurrentClueIdx}
            huntHintsReleased={huntHintsReleased}
            huntSolves={huntSolves}
            onHuntReset={handleResetTreasureHunt}
            onHuntReleaseHint={handleReleaseHint}
            onUpdateClue={handleUpdateHuntClue}
            onAddClue={handleAddHuntClue}
            // Memory
            memoryGridSize={memoryGridSize}
            memoryTheme={memoryTheme}
            memoryPairsMatched={memoryPairsMatched}
            memoryBotProgress={memoryBotProgress}
            onMemoryStart={handleMemoryStart}
            onMemoryReset={handleResetMemoryGame}
            // Arrow Puzzle
            arrowDifficulty={arrowDifficulty}
            arrowStatus={arrowStatus}
            arrowFinishOrder={arrowFinishOrder}
            arrowMaze={arrowMaze}
            onArrowStart={handleArrowStart}
            onArrowReset={handleArrowReset}
            arrowFormat={arrowFormat}
            onArrowSelectFormat={setArrowFormat}
            arrowPlayerStates={arrowPlayerStates}
            // Arrow Escape
            escapeDifficulty={escapeDifficulty}
            escapeStatus={escapeStatus}
            escapeFinishOrder={escapeFinishOrder}
            escapeMaze={escapeMaze}
            onEscapeStart={handleEscapeStart}
            onEscapeReset={handleEscapeReset}
            escapeFormat={escapeFormat}
            onEscapeSelectFormat={setEscapeFormat}
            escapePlayerStates={escapePlayerStates}
            // Config
            onStartEvent={handleStartEvent}
            onEndEvent={handleEndEvent}
            onSwitchGame={handleSwitchGame}
            onBroadcast={handleBroadcast}
            // Report
            reportWinners={reportWinners}
          />
        </section>

        {/* RIGHT PANEL: PLAYER SCREEN MOCKUP */}
        <section className={`player-panel ${activeView === "player" ? "active-view" : ""}`}>
          <PlayerScreen
            eventName={eventName}
            eventPin={eventPin}
            isStarted={isStarted}
            activeGame={activeGame}
            playerName={playerName}
            playerJoined={playerJoined}
            playerPoints={playerPoints}
            lobbyPlayers={lobbyPlayers}
            playerBanner={playerBanner}
            // Join
            onJoin={handlePlayerJoin}
            // Tambola
            housieDrawnNumbers={housieDrawnNumbers}
            housiePatterns={housiePatterns}
            housieTicket={housieTicket}
            housieMarkedCells={housieMarkedCells}
            housieClaimsQueue={housieClaimsQueue}
            onHousieTicketChange={setHousieTicket}
            onHousieMarkedCellsChange={setHousieMarkedCells}
            onHousieSubmitClaim={handleHousieSubmitClaim}
            onHousieDrawLog={housieDrawnNumbers.slice(-5).reverse()}
            onTriggerBanner={triggerPlayerBanner}
            housieAutoMark={housieAutoMark}
            onHousieAutoMarkChange={setHousieAutoMark}
            // Eliminate
            eliminateRound={eliminateRound}
            eliminateOptions={eliminateOptions}
            eliminatePlayerVote={eliminatePlayerVote}
            eliminateFeedback={eliminateFeedback}
            eliminateIsFinished={eliminateIsFinished}
            eliminateSurvivors={eliminateSurvivors}
            eliminateIsTieBreaker={eliminateIsTieBreaker}
            eliminateTieWinners={eliminateTieWinners}
            eliminateWinner={eliminateWinner}
            onEliminateVote={handleEliminateVote}
            // Boat
            boatStatus={boatStatus}
            boatPositions={boatPositions}
            boatResults={boatResults}
            boatCountdownNum={boatCountdownNum}
            boatTieWinners={boatTieWinners}
            boatIsTieBreaker={boatIsTieBreaker}
            onBoatTap={handlePlayerBoatTap}
            // Hunt
            huntClues={huntClues}
            huntCurrentClueIdx={huntCurrentClueIdx}
            huntHintsReleased={huntHintsReleased}
            playerHuntFeedback={playerHuntFeedback}
            onHuntSubmitAnswer={handleSubmitHuntAnswer}
            onHuntSkip={handleSkipHuntClue}
            // Memory
            memoryGridSize={memoryGridSize}
            memoryTheme={memoryTheme}
            memoryPairsMatched={memoryPairsMatched}
            memoryDeck={memoryDeck}
            onMemoryMatch={handlePlayerMemoryMatch}
            onMemoryDeckChange={setMemoryDeck}
            // Arrow Puzzle
            arrowMaze={arrowMaze}
            arrowPlayerPos={arrowPlayerPos}
            arrowPlayerFinished={arrowPlayerFinished}
            arrowElapsedTime={arrowElapsedTime}
            arrowDifficulty={arrowDifficulty}
            arrowFinishOrder={arrowFinishOrder}
            onArrowMoveTo={handleArrowMove}
            arrowFormat={arrowFormat}
            arrowPlayerPath={arrowPlayerStates[playerName]?.path || [[0, 0]]}
            // Arrow Escape
            escapeDifficulty={escapeDifficulty}
            escapeStatus={escapeStatus}
            escapeFinishOrder={escapeFinishOrder}
            escapeMaze={escapeMaze}
            escapeElapsedTime={escapeElapsedTime}
            escapeFormat={escapeFormat}
            escapePlayerStates={escapePlayerStates}
            onEscapeClearArrow={handleEscapeClearArrow}
          />
        </section>
      </div>
    </main>
  );
}
