"use client";

import React, { use, useState, useEffect } from "react";
import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import { EventConfig } from "@/components/SuperAdminDashboard";

// Dynamically load the heavy Sandbox — only after PIN is validated
const Sandbox = dynamic(() => import("@/components/Sandbox"), {
  loading: () => (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "var(--bg-dark)" }}>
      <div className="lobby-loader" />
    </div>
  ),
  ssr: false,
});

const DEFAULT_DEMO_EVENT: EventConfig = {
  id: "DEMO01",
  name: "Shubh Milan Sangeet",
  pin: "SHUBH99",
  maxPlayers: 100,
  games: ["housie", "eliminate", "boat", "hunt", "memory", "arrow", "escape"],
  status: "live",
  createdAt: "Demo Event",
};

export default function PlayerEventPage({ params }: { params: Promise<{ pin: string }> }) {
  const router = useRouter();
  const { pin } = use(params);
  const eventPin = pin.toUpperCase();

  const [eventConfig, setEventConfig] = useState<EventConfig | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!eventPin) return;

    if (eventPin === "SHUBH99") {
      setEventConfig(DEFAULT_DEMO_EVENT);
      setLoading(false);
      return;
    }

    try {
      const stored = localStorage.getItem("sa_events");
      if (stored) {
        const events: EventConfig[] = JSON.parse(stored);
        const matched = events.find((e) => e.pin.toUpperCase() === eventPin);
        if (matched) {
          setEventConfig(matched);
        }
      }
    } catch (err) {
      console.error("Failed to load event config for player:", err);
    }
    setLoading(false);
  }, [eventPin]);

  if (loading) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "var(--bg-dark)", color: "var(--text-primary)" }}>
        <div className="lobby-loader"></div>
      </div>
    );
  }

  if (!eventConfig) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", background: "var(--bg-dark)", color: "var(--text-primary)" }}>
        <header>
          <div className="logo-container" style={{ cursor: "pointer" }} onClick={() => router.push("/")}>
            <span className="logo-icon">👑</span>
            <h1 style={{ fontSize: "1.4rem", fontWeight: 700, margin: 0 }}>
              <span className="gradient-text-gold">Shubh</span>{" "}
              <span className="gradient-text-magenta">Sambhram</span>
            </h1>
          </div>
        </header>
        <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", padding: "20px" }}>
          <div className="glass-panel" style={{ width: "100%", maxWidth: "450px", padding: "2.5rem", textAlign: "center" }}>
            <div style={{ fontSize: "3rem", marginBottom: "12px" }}>⚠️</div>
            <h2 className="gradient-text-magenta" style={{ fontSize: "1.5rem", marginBottom: "6px" }}>Event Not Found</h2>
            <p style={{ color: "var(--text-muted)", fontSize: "0.9rem", marginBottom: "24px" }}>
              The event with PIN <strong style={{ color: "var(--gold-primary)" }}>{eventPin}</strong> is not active or could not be found. Please check with your Event Host.
            </p>
            <button className="btn btn-primary" style={{ width: "100%" }} onClick={() => router.push("/play")}>
              ← Go back to Portal
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <Sandbox
      initialEventName={eventConfig.name}
      initialEventPin={eventConfig.pin}
      initialMaxPlayers={eventConfig.maxPlayers}
      initialActiveGames={eventConfig.games}
      role="player"
    />
  );
}
