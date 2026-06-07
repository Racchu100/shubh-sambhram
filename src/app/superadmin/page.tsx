"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import SuperAdminDashboard, { EventConfig } from "@/components/SuperAdminDashboard";

const SUPER_ADMIN_PASSWORD = "SUPERADMIN";

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

export default function SuperAdminPage() {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [passwordInput, setPasswordInput] = useState("");
  const [error, setError] = useState("");

  const [events, setEvents] = useState<EventConfig[]>([]);

  // Load events on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem("sa_events");
      setEvents(stored ? JSON.parse(stored) : DEFAULT_EVENTS);
    } catch {
      setEvents(DEFAULT_EVENTS);
    }
    
    // Check if session storage has auth
    if (sessionStorage.getItem("sa_auth") === "true") {
      setIsAuthenticated(true);
    }
  }, []);

  const handleLogin = () => {
    if (passwordInput.trim().toUpperCase() === SUPER_ADMIN_PASSWORD) {
      setError("");
      setIsAuthenticated(true);
      sessionStorage.setItem("sa_auth", "true");
    } else {
      setError("Incorrect password. Please try again.");
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    sessionStorage.removeItem("sa_auth");
    router.push("/");
  };

  const saveEvents = (newEvents: EventConfig[]) => {
    setEvents(newEvents);
    try {
      localStorage.setItem("sa_events", JSON.stringify(newEvents));
    } catch (err) {
      console.error("Failed to save events to local storage:", err);
    }
  };

  const handleCreateEvent = (ev: EventConfig) => {
    saveEvents([ev, ...events]);
  };

  const handleUpdateEvent = (updated: EventConfig) => {
    saveEvents(events.map((e) => (e.id === updated.id ? updated : e)));
  };

  const handleDeleteEvent = (id: string) => {
    saveEvents(events.filter((e) => e.id !== id));
  };

  const handleEnterEvent = (ev: EventConfig) => {
    // Mark as live in list
    const updated = events.map((e) => (e.id === ev.id ? { ...e, status: "live" as const } : e));
    saveEvents(updated);
    
    // Redirect to host pin page
    router.push(`/host/${ev.pin}`);
  };

  if (!isAuthenticated) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", background: "var(--bg-deep)", color: "var(--text-primary)" }}>
        <header>
          <div className="logo-container" style={{ cursor: "pointer" }} onClick={() => router.push("/")}>
            <span className="logo-icon">👑</span>
            <h1 style={{ fontSize: "1.4rem", fontWeight: 700, margin: 0 }}>
              <span className="gradient-text-gold">Shubh</span>{" "}
              <span className="gradient-text-magenta">Sambhram</span>
            </h1>
          </div>
          <div className="nav-links">
            <button className="btn btn-outline" style={{ padding: "6px 14px", fontSize: "0.8rem" }} onClick={() => router.push("/")}>
              ← Back to Home
            </button>
          </div>
        </header>

        <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", padding: "20px" }}>
          <div className="glass-panel" style={{ width: "100%", maxWidth: "420px", padding: "2.5rem", textAlign: "center" }}>
            <div style={{ fontSize: "3rem", marginBottom: "12px" }}>🔐</div>
            <h2 className="gradient-text-gold" style={{ fontSize: "1.5rem", marginBottom: "6px" }}>Super Admin Access</h2>
            <p style={{ color: "var(--text-muted)", fontSize: "0.85rem", marginBottom: "24px" }}>
              Enter your super admin password to manage all events.
            </p>

            <div className="input-group" style={{ textAlign: "left" }}>
              <label htmlFor="sa-password">Admin Password</label>
              <input
                type="password"
                id="sa-password"
                className="input-field"
                placeholder="Enter password..."
                value={passwordInput}
                onChange={(e) => { setPasswordInput(e.target.value); setError(""); }}
                onKeyDown={(e) => e.key === "Enter" && handleLogin()}
                autoFocus
              />
              {error && (
                <p style={{ color: "#f87171", fontSize: "0.8rem", marginTop: "6px" }}>⚠️ {error}</p>
              )}
            </div>

            <button
              className="btn btn-primary"
              style={{ width: "100%", marginTop: "16px", padding: "12px" }}
              onClick={handleLogin}
            >
              🔓 Login to Dashboard
            </button>

            <p style={{ color: "var(--text-muted)", fontSize: "0.72rem", marginTop: "20px" }}>
              Default password: <code style={{ color: "var(--gold-primary)" }}>SUPERADMIN</code>
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <SuperAdminDashboard
      events={events}
      onCreateEvent={handleCreateEvent}
      onUpdateEvent={handleUpdateEvent}
      onDeleteEvent={handleDeleteEvent}
      onEnterEvent={handleEnterEvent}
      onLogout={handleLogout}
    />
  );
}
