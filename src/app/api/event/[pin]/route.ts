import { NextResponse } from "next/server";

const REGISTRY_BLOB_ID = "019ea6a7-1062-7669-adb8-86ec162e17ae";
const REGISTRY_URL = `https://jsonblob.com/api/jsonBlob/${REGISTRY_BLOB_ID}`;

// Local memory backup map in case JSONBlob service has network issues or is rate limited
const localBackupStates: Record<string, any> = {};
const localBackupRegistry: Record<string, string> = {};

// Helper to fetch the registry map (PIN -> Blob ID)
async function getRegistry(): Promise<Record<string, string>> {
  try {
    const res = await fetch(REGISTRY_URL, { 
      method: "GET",
      headers: { "Content-Type": "application/json" },
      cache: "no-store" 
    });
    if (res.ok) {
      const data = await res.json();
      Object.assign(localBackupRegistry, data);
      return data;
    }
  } catch (err) {
    console.error("Error fetching JSONBlob registry:", err);
  }
  return localBackupRegistry;
}

// Helper to save/update the registry map
async function saveRegistry(registry: Record<string, string>) {
  try {
    Object.assign(localBackupRegistry, registry);
    await fetch(REGISTRY_URL, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(registry),
    });
  } catch (err) {
    console.error("Error saving JSONBlob registry:", err);
  }
}

// Helper to get or create the Blob ID for an event PIN
async function getEventBlobId(pin: string): Promise<string> {
  const upperPin = pin.toUpperCase();
  const registry = await getRegistry();
  if (registry[upperPin]) {
    return registry[upperPin];
  }

  // Create a new blank state blob on JSONBlob
  const defaultState: GameState = {
    activeGame: "lobby",
    isStarted: false,
    eventName: "Shubh Milan Sangeet",
    maxPlayers: 100,
    activeGames: ["housie", "eliminate", "boat", "hunt", "memory", "arrow", "escape"],
    lobbyPlayers: [],
    boatPositions: {},
    housieClaimsQueue: [],
    arrowFinishOrder: [],
    escapeFinishOrder: [],
    reportWinners: [],
    huntSolves: [],
    realPlayers: [], // Track real players persistently in the state!
  };

  try {
    const res = await fetch("https://jsonblob.com/api/jsonBlob", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(defaultState),
    });
    if (res.ok) {
      const blobId = res.headers.get("X-jsonblob-id") || res.headers.get("Location")?.split("/").pop() || "";
      if (blobId) {
        registry[upperPin] = blobId;
        await saveRegistry(registry);
        return blobId;
      }
    }
  } catch (err) {
    console.error("Error creating new event blob:", err);
  }
  return "";
}

// Load game state from its JSONBlob
async function loadState(pin: string, blobId: string): Promise<GameState> {
  const defaultState: GameState = {
    activeGame: "lobby",
    isStarted: false,
    eventName: "Shubh Milan Sangeet",
    maxPlayers: 100,
    activeGames: ["housie", "eliminate", "boat", "hunt", "memory", "arrow", "escape"],
    lobbyPlayers: [],
    boatPositions: {},
    housieClaimsQueue: [],
    arrowFinishOrder: [],
    escapeFinishOrder: [],
    reportWinners: [],
    huntSolves: [],
    realPlayers: [],
  };

  if (!blobId) {
    return localBackupStates[pin] || defaultState;
  }

  try {
    const res = await fetch(`https://jsonblob.com/api/jsonBlob/${blobId}`, { 
      method: "GET",
      headers: { "Content-Type": "application/json" },
      cache: "no-store" 
    });
    if (res.ok) {
      const data = await res.json();
      // Ensure realPlayers exists in the loaded object
      if (!data.realPlayers) data.realPlayers = [];
      localBackupStates[pin] = data;
      return data;
    }
  } catch (err) {
    console.error(`Error loading state for blob ${blobId}:`, err);
  }
  return localBackupStates[pin] || defaultState;
}

// Save game state back to its JSONBlob
async function saveState(pin: string, blobId: string, state: GameState) {
  localBackupStates[pin] = state;
  if (!blobId) return;
  try {
    await fetch(`https://jsonblob.com/api/jsonBlob/${blobId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(state),
    });
  } catch (err) {
    console.error(`Error saving state for blob ${blobId}:`, err);
  }
}

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
  realPlayers?: string[]; // Track real players persistently in the state!
}

export async function GET(request: Request, { params }: { params: Promise<{ pin: string }> }) {
  const { pin } = await params;
  const eventPin = pin.toUpperCase();
  const blobId = await getEventBlobId(eventPin);
  const state = await loadState(eventPin, blobId);
  return NextResponse.json(state);
}

export async function POST(request: Request, { params }: { params: Promise<{ pin: string }> }) {
  const { pin } = await params;
  const eventPin = pin.toUpperCase();
  const body = await request.json();

  const { role, playerName, action, stateUpdate } = body;
  
  const blobId = await getEventBlobId(eventPin);
  const state = await loadState(eventPin, blobId);

  // Initialize Real Players list if not present
  if (!state.realPlayers) {
    state.realPlayers = [];
  }
  const realPlayers = state.realPlayers;

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
    if (action === "housie_verify_claim") {
      const { claimId, claimPlayer, claimPattern, approved } = stateUpdate;
      if (state.housieClaimsQueue) {
        state.housieClaimsQueue = state.housieClaimsQueue.filter((c: any) => {
          if (claimId && c.id) return c.id !== claimId;
          return !(c.player === claimPlayer && c.pattern === claimPattern);
        });
      }
      if (approved) {
        if (!state.housiePatterns) state.housiePatterns = {};
        state.housiePatterns[claimPattern] = {
          active: state.housiePatterns[claimPattern]?.active ?? true,
          winner: claimPlayer,
        };
        if (!state.lobbyPlayers) state.lobbyPlayers = [];
        const idx = state.lobbyPlayers.findIndex((p: any) => p.name === claimPlayer);
        if (idx >= 0) {
          state.lobbyPlayers[idx].points = (state.lobbyPlayers[idx].points || 0) + 100;
        }
        if (!state.reportWinners) state.reportWinners = [];
        state.reportWinners.push({
          gameName: "Housie — " + claimPattern,
          winnerName: claimPlayer,
          prizeTag: "🥇 Pattern Winner",
        });
      }
      await saveState(eventPin, blobId, state);
      return NextResponse.json(state);
    }

    if (action === "housie_clear_queue") {
      state.housieClaimsQueue = [];
      await saveState(eventPin, blobId, state);
      return NextResponse.json(state);
    }

    // HOST SYNC
    // Keep player-driven properties from the server's state BEFORE overwrite
    let serverHousieClaimsQueue = state.housieClaimsQueue || [];
    const housieProcessedClaims = stateUpdate.housieProcessedClaims || [];
    serverHousieClaimsQueue = serverHousieClaimsQueue.filter((c: any) => {
      const cid = c.id || `${c.player}-${c.pattern}`;
      return !housieProcessedClaims.includes(cid);
    });
    const serverArrowFinishOrder = state.arrowFinishOrder || [];
    const serverEscapeFinishOrder = state.escapeFinishOrder || [];
    const serverReportWinners = state.reportWinners || [];
    const serverHuntSolves = state.huntSolves || [];
    const serverBoatPositions = state.boatPositions || {};

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
    state.realPlayers = realPlayers;
    state.housieClaimsQueue = serverHousieClaimsQueue;
    state.arrowFinishOrder = serverArrowFinishOrder;
    state.escapeFinishOrder = serverEscapeFinishOrder;
    state.reportWinners = serverReportWinners;
    state.huntSolves = serverHuntSolves;

    // Restore real players' boat positions
    const boatPositions = state.boatPositions || {};
    realPlayers.forEach((name) => {
      if (serverBoatPositions[name] !== undefined) {
        boatPositions[name] = serverBoatPositions[name];
      }
    });
    state.boatPositions = boatPositions;

    await saveState(eventPin, blobId, state);
    return NextResponse.json(state);
  } else if (role === "player" && playerName) {
    // PLAYER ACTION OR HEARTBEAT
    ensureRealPlayer(playerName);

    if (action === "join") {
      upsertLobbyPlayer(state, playerName, 0, "Ready", true);
      await saveState(eventPin, blobId, state);
      return NextResponse.json(state);
    }

    if (action === "boat_tap") {
      const nextPos = stateUpdate?.boatPositions?.[playerName] || 0;
      if (!state.boatPositions) state.boatPositions = {};
      state.boatPositions[playerName] = nextPos;
      await saveState(eventPin, blobId, state);
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
      await saveState(eventPin, blobId, state);
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
      await saveState(eventPin, blobId, state);
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

      await saveState(eventPin, blobId, state);
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

      await saveState(eventPin, blobId, state);
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

      await saveState(eventPin, blobId, state);
      return NextResponse.json(state);
    }

    // Default: player heartbeat, return current state
    return NextResponse.json(state);
  }

  return NextResponse.json({ error: "Invalid role or input" }, { status: 400 });
}
