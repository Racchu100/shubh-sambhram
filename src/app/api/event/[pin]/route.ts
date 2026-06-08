import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

// Ensure state directory exists
const STATES_DIR = path.join(process.cwd(), ".game_states");
if (!fs.existsSync(STATES_DIR)) {
  fs.mkdirSync(STATES_DIR, { recursive: true });
}

function getFilePath(pin: string) {
  return path.join(STATES_DIR, `state_${pin.toUpperCase()}.json`);
}

// Memory cache of real players in the event to identify who is a real player vs a bot
const REAL_PLAYERS: Record<string, string[]> = {};

interface GameState {
  activeGame: string;
  isStarted: boolean;
  eventName: string;
  maxPlayers: number;
  activeGames: string[];
  playerBanner?: any;
  lobbyPlayers?: any[];
  housieDrawnNumbers?: number[];
  housieLastDrawn?: number | null;
  housiePatterns?: any;
  housieClaimsQueue?: any[];
  eliminateRound?: any;
  eliminateOptions?: any[];
  eliminateIsFinished?: boolean;
  eliminateWinner?: string | null;
  eliminateIsTieBreaker?: boolean;
  eliminateTieWinners?: string[];
  boatStatus?: string;
  boatPositions?: Record<string, number>;
  boatResults?: string[];
  boatIsTieBreaker?: boolean;
  boatTieWinners?: string[];
  huntCurrentClueIdx?: number;
  huntHintsReleased?: boolean[];
  huntClues?: any[];
  huntSolves?: any[];
  memoryGridSize?: number;
  memoryTheme?: string;
  memoryPairsMatched?: number;
  memoryDeck?: any[];
  arrowDifficulty?: string;
  arrowStatus?: string;
  arrowMaze?: any;
  arrowFinishOrder?: any[];
  arrowElapsedTime?: number;
  arrowFormat?: string;
  arrowPlayerStates?: any;
  escapeDifficulty?: string;
  escapeStatus?: string;
  escapeMaze?: any;
  escapeElapsedTime?: number;
  escapeFormat?: string;
  escapePlayerStates?: any;
  escapeFinishOrder?: any[];
  reportWinners?: any[];
}

function loadState(pin: string): GameState {
  const filePath = getFilePath(pin);
  if (fs.existsSync(filePath)) {
    try {
      return JSON.parse(fs.readFileSync(filePath, "utf-8"));
    } catch (err) {
      console.error(`Error loading state for event ${pin}:`, err);
    }
  }
  return {
    activeGame: "lobby",
    isStarted: false,
    eventName: "Shubh Event",
    maxPlayers: 100,
    activeGames: ["housie", "eliminate", "boat", "hunt", "memory", "arrow", "escape"],
    lobbyPlayers: [],
    boatPositions: {},
    housieClaimsQueue: [],
    arrowFinishOrder: [],
    escapeFinishOrder: [],
    reportWinners: [],
    huntSolves: [],
  };
}

function saveState(pin: string, state: GameState) {
  const filePath = getFilePath(pin);
  try {
    fs.writeFileSync(filePath, JSON.stringify(state, null, 2), "utf-8");
  } catch (err) {
    console.error(`Error saving state for event ${pin}:`, err);
  }
}

export async function GET(request: Request, { params }: { params: Promise<{ pin: string }> }) {
  const { pin } = await params;
  const eventPin = pin.toUpperCase();
  const state = loadState(eventPin);
  return NextResponse.json(state);
}

export async function POST(request: Request, { params }: { params: Promise<{ pin: string }> }) {
  const { pin } = await params;
  const eventPin = pin.toUpperCase();
  const body = await request.json();

  const { role, playerName, action, stateUpdate } = body;
  const state = loadState(eventPin);

  // Initialize Real Players list if not present
  if (!REAL_PLAYERS[eventPin]) {
    REAL_PLAYERS[eventPin] = [];
  }
  const realPlayers = REAL_PLAYERS[eventPin];

  // Helper to ensure player exists in real players list
  const ensureRealPlayer = (name: string) => {
    if (name && !realPlayers.includes(name)) {
      realPlayers.push(name);
    }
  };

  // Helper to update/add a player in the lobbyPlayers array
  const upsertLobbyPlayer = (stateObj: GameState, name: string, points = 0, status = "Ready", active = true) => {
    if (!stateObj.lobbyPlayers) stateObj.lobbyPlayers = [];
    const idx = stateObj.lobbyPlayers.findIndex((p: any) => p.name === name);
    if (idx >= 0) {
      stateObj.lobbyPlayers[idx].points = points;
      stateObj.lobbyPlayers[idx].status = status;
      stateObj.lobbyPlayers[idx].active = active;
    } else {
      stateObj.lobbyPlayers.push({ name, points, status, active });
    }
  };

  if (role === "admin") {
    // HOST SYNC
    // Merge host's state updates, but preserve player-generated server state
    const currentLobbyPlayers = state.lobbyPlayers || [];
    const incomingLobbyPlayers = stateUpdate.lobbyPlayers || [];

    // Combine lobbyPlayers: keep bots from host, but keep server's data for real players
    const mergedLobbyPlayers = incomingLobbyPlayers.map((incomingP: any) => {
      const isReal = realPlayers.includes(incomingP.name);
      if (isReal) {
        // Find in server state
        const serverP = currentLobbyPlayers.find((p: any) => p.name === incomingP.name);
        return serverP || incomingP;
      }
      return incomingP;
    });

    // Ensure any real player on server that might have been dropped by host is added back
    realPlayers.forEach((name) => {
      const exists = mergedLobbyPlayers.some((p: any) => p.name === name);
      if (!exists) {
        const serverP = currentLobbyPlayers.find((p: any) => p.name === name);
        if (serverP) {
          mergedLobbyPlayers.push(serverP);
        } else {
          mergedLobbyPlayers.push({ name, points: 0, status: "Ready", active: true });
        }
      }
    });

    // Update main state variables
    Object.assign(state, stateUpdate);

    // Override merged properties
    state.lobbyPlayers = mergedLobbyPlayers;

    // Preserve real players' boat positions
    if (state.boatPositions && stateUpdate.boatPositions) {
      realPlayers.forEach((name) => {
        if (state.boatPositions && state.boatPositions[name] !== undefined) {
          state.boatPositions[name] = state.boatPositions[name];
        }
      });
    }

    // Preserve player-driven queues/arrays
    state.housieClaimsQueue = state.housieClaimsQueue || [];
    state.arrowFinishOrder = state.arrowFinishOrder || [];
    state.escapeFinishOrder = state.escapeFinishOrder || [];
    state.reportWinners = state.reportWinners || [];
    state.huntSolves = state.huntSolves || [];

    saveState(eventPin, state);
    return NextResponse.json(state);
  } else if (role === "player" && playerName) {
    // PLAYER ACTION OR HEARTBEAT
    ensureRealPlayer(playerName);

    if (action === "join") {
      upsertLobbyPlayer(state, playerName, 0, "Ready", true);
      saveState(eventPin, state);
      return NextResponse.json(state);
    }

    if (action === "boat_tap") {
      const nextPos = stateUpdate?.boatPositions?.[playerName] || 0;
      if (!state.boatPositions) state.boatPositions = {};
      state.boatPositions[playerName] = nextPos;
      saveState(eventPin, state);
      return NextResponse.json(state);
    }

    if (action === "vote") {
      const { optionId, previousOptionId } = stateUpdate;
      if (state.eliminateOptions) {
        state.eliminateOptions = state.eliminateOptions.map((o: any) => {
          if (o.id === optionId) return { ...o, votes: o.votes + 1 };
          if (o.id === previousOptionId) return { ...o, votes: Math.max(0, o.votes - 1) };
          return o;
        });
      }
      saveState(eventPin, state);
      return NextResponse.json(state);
    }

    if (action === "housie_claim") {
      const { claim } = stateUpdate;
      if (!state.housieClaimsQueue) state.housieClaimsQueue = [];
      const alreadyClaimed = state.housieClaimsQueue.some(
        (c: any) => c.player === claim.player && c.pattern === claim.pattern
      );
      if (!alreadyClaimed) {
        state.housieClaimsQueue.push(claim);
      }
      saveState(eventPin, state);
      return NextResponse.json(state);
    }

    if (action === "hunt_solve") {
      const { clueIdx, points, wrong, skipped } = stateUpdate;
      if (!state.huntSolves) state.huntSolves = [];
      state.huntSolves.push({ player: playerName, clueIdx, points, wrong, skipped });

      // Update player points in lobby
      upsertLobbyPlayer(state, playerName, (state.lobbyPlayers?.find((p: any) => p.name === playerName)?.points || 0) + points);

      if (clueIdx + 1 >= (state.huntClues?.length || 0)) {
        if (!state.reportWinners) state.reportWinners = [];
        state.reportWinners.push({
          gameName: "Treasure Hunt Speedrun",
          winnerName: playerName,
          prizeTag: "⛵ Scavenger Master",
        });
      }

      saveState(eventPin, state);
      return NextResponse.json(state);
    }

    if (action === "arrow_finish") {
      const { time, rank, points } = stateUpdate;
      if (!state.arrowFinishOrder) state.arrowFinishOrder = [];
      if (!state.arrowFinishOrder.some((f: any) => f.player === playerName)) {
        state.arrowFinishOrder.push({ player: playerName, time, rank });
      }

      upsertLobbyPlayer(state, playerName, (state.lobbyPlayers?.find((p: any) => p.name === playerName)?.points || 0) + points);

      const medal = rank === 1 ? "🥇" : rank === 2 ? "🥈" : rank === 3 ? "🥉" : "🎖️";
      if (!state.reportWinners) state.reportWinners = [];
      state.reportWinners.push({
        gameName: "Arrow Finisher",
        winnerName: playerName,
        prizeTag: `${medal} Escape Champion`,
      });

      saveState(eventPin, state);
      return NextResponse.json(state);
    }

    if (action === "escape_finish") {
      const { time, rank, points } = stateUpdate;
      if (!state.escapeFinishOrder) state.escapeFinishOrder = [];
      if (!state.escapeFinishOrder.some((f: any) => f.player === playerName)) {
        state.escapeFinishOrder.push({ player: playerName, time, rank });
      }

      upsertLobbyPlayer(state, playerName, (state.lobbyPlayers?.find((p: any) => p.name === playerName)?.points || 0) + points);

      const medal = rank === 1 ? "🥇" : rank === 2 ? "🥈" : rank === 3 ? "🥉" : "🎖️";
      if (!state.reportWinners) state.reportWinners = [];
      state.reportWinners.push({
        gameName: "Arrow Escape",
        winnerName: playerName,
        prizeTag: `${medal} Maze Master`,
      });

      saveState(eventPin, state);
      return NextResponse.json(state);
    }

    // Default: player heartbeat, return current state
    return NextResponse.json(state);
  }

  return NextResponse.json({ error: "Invalid role or input" }, { status: 400 });
}
