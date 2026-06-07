"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Logo from "@/components/Logo";
import { EventConfig } from "@/components/SuperAdminDashboard";

const DEFAULT_EVENTS: EventConfig[] = [
  {
    id: "DEMO01",
    name: "Shubh Milan Sangeet",
    pin: "SHUBH99",
    maxPlayers: 100,
    games: ["housie", "eliminate", "boat", "hunt", "memory", "arrow", "escape"],
    status: "draft",
    createdAt: "Demo Event",
  },
];

export default function PlayerLoginPage() {
  const router = useRouter();
  const [pinInput, setPinInput] = useState("");
  const [error, setError] = useState("");
  const [events, setEvents] = useState<EventConfig[]>([]);

  useEffect(() => {
    try {
      const stored = localStorage.getItem("sa_events");
      setEvents(stored ? JSON.parse(stored) : DEFAULT_EVENTS);
    } catch {
      setEvents(DEFAULT_EVENTS);
    }
  }, []);

  const handleJoin = () => {
    const cleanPin = pinInput.trim().toUpperCase();
    if (!cleanPin) {
      setError("Please enter an Event PIN.");
      return;
    }

    const matched = events.find((e) => e.pin.toUpperCase() === cleanPin);
    if (matched || cleanPin === "SHUBH99") {
      setError("");
      router.push(`/play/${cleanPin}`);
    } else {
      setError("Invalid Event PIN. Please contact your Event Host.");
    }
  };

  return (
    <div className="luxury-light" style={{ minHeight: "100vh", display: "flex", flexDirection: "column", paddingTop: 0 }}>
      <header style={{ position: "fixed", top: 0, left: 0, right: 0, zIndex: 1000, width: "100%", height: "70px", background: "rgba(250, 248, 245, 0.88)", backdropFilter: "blur(20px)", WebkitBackdropFilter: "blur(20px)", borderBottom: "1px solid rgba(216, 178, 39, 0.18)", boxShadow: "0 2px 20px rgba(166, 128, 11, 0.08)" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", width: "100%", maxWidth: "1200px", margin: "0 auto", height: "70px", padding: "0 1rem" }}>
          <Link href="/" style={{ display: "flex", alignItems: "center", gap: "10px", textDecoration: "none" }}>
            <Logo size={42} />
            <span className="logo-text" style={{ display: "flex", flexDirection: "column" }}>
              <span className="gradient-text-gold" style={{ fontSize: "1.15rem", fontWeight: 800, letterSpacing: "1px", lineHeight: 1 }}>
                SHUBH
              </span>
              <span style={{ fontSize: "0.68rem", fontWeight: 600, color: "#1a1a1a", opacity: 0.8, letterSpacing: "2.5px", marginTop: "2px" }}>
                SAMBHRAM
              </span>
            </span>
          </Link>
          <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
            <Link href="/host" className="btn btn-outline" style={{ padding: "8px 14px", fontSize: "0.8rem", textDecoration: "none", display: "flex", alignItems: "center", gap: "6px", borderColor: "rgba(216, 178, 39, 0.3)" }}>
              🔑 <span className="btn-text-mobile-hide">Host Portal</span>
            </Link>
            <Link href="/" className="btn btn-outline" style={{ padding: "8px 14px", fontSize: "0.8rem", textDecoration: "none", display: "flex", alignItems: "center", gap: "6px" }}>
              ← <span className="btn-text-mobile-hide">Back to Home</span>
            </Link>
          </div>
        </div>
      </header>

      <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", padding: "2rem 1rem", marginTop: "70px" }}>
        <div className="glass-panel" style={{ width: "100%", maxWidth: "420px", padding: "2.5rem 2rem", textAlign: "center", position: "relative", overflow: "hidden" }}>
          {/* Top Gold Border Accent */}
          <div style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "4px", background: "var(--gold-gradient)" }} />

          <div style={{ fontSize: "2.5rem", marginBottom: "12px", filter: "drop-shadow(0 4px 10px rgba(166,128,11,0.15))" }}>📱</div>
          <h2 className="gradient-text-gold" style={{ fontSize: "1.8rem", fontWeight: 800, marginBottom: "8px", fontFamily: "Playfair Display, Georgia, serif" }}>Join Live Event</h2>
          <p style={{ color: "#555", fontSize: "0.88rem", marginBottom: "24px", lineHeight: 1.4 }}>
            Enter the Event PIN provided by your host to join the game lobby.
          </p>

          <div className="input-group" style={{ textAlign: "left", marginBottom: "20px" }}>
            <label htmlFor="player-pin" style={{ fontSize: "0.78rem", fontWeight: 600, color: "#666", textTransform: "uppercase", letterSpacing: "1px" }}>Event Access PIN</label>
            <input
              type="text"
              id="player-pin"
              className="input-field"
              placeholder="Enter Event PIN (e.g. SHUBH99)..."
              value={pinInput}
              onChange={(e) => { setPinInput(e.target.value); setError(""); }}
              onKeyDown={(e) => e.key === "Enter" && handleJoin()}
              autoFocus
              style={{ textTransform: "uppercase", height: "48px", background: "#ffffff" }}
            />
            {error && (
              <p style={{ color: "var(--danger)", fontSize: "0.8rem", marginTop: "6px", display: "flex", alignItems: "center", gap: "4px" }}>⚠️ {error}</p>
            )}
          </div>

          <button
            className="btn btn-primary"
            style={{ width: "100%", padding: "14px", fontSize: "0.95rem", borderRadius: "12px", display: "flex", justifyContent: "center", alignItems: "center", gap: "8px" }}
            onClick={handleJoin}
          >
            🏁 Enter Game Lobby
          </button>

          <div style={{ marginTop: "24px", padding: "10px", background: "rgba(216, 178, 39, 0.05)", border: "1px dashed rgba(216, 178, 39, 0.25)", borderRadius: "12px" }}>
            <p style={{ color: "#666", fontSize: "0.8rem", margin: 0 }}>
              Demo PIN: <code style={{ color: "#a6800b", fontWeight: 700, fontSize: "0.85rem" }}>SHUBH99</code>
            </p>
          </div>
        </div>
      </div>

      <style jsx>{`
        @media (max-width: 480px) {
          .btn-text-mobile-hide {
            display: none;
          }
        }
      `}</style>
    </div>
  );
}
