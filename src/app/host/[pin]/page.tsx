"use client";

import React, { use, useState, useEffect } from "react";
import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import { EventConfig } from "@/components/SuperAdminDashboard";

// Dynamically load the heavy Sandbox component
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

export default function HostEventPage({ params }: { params: Promise<{ pin: string }> }) {
  const router = useRouter();
  const { pin } = use(params);
  const eventPin = pin.toUpperCase();

  const [eventConfig, setEventConfig] = useState<EventConfig | null>(null);
  const [loading, setLoading] = useState(true);
  
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [passwordInput, setPasswordInput] = useState("");
  const [authError, setAuthError] = useState("");

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
      console.error("Failed to load event config:", err);
    }
    setLoading(false);
  }, [eventPin]);

  useEffect(() => {
    if (!eventConfig) return;

    const requiredPass = eventConfig.hostPassword || "";
    const sessionAuth = sessionStorage.getItem(`host_auth_${eventPin}`) === "true";
    const superAdminAuth = sessionStorage.getItem("sa_auth") === "true";

    if (!requiredPass || sessionAuth || superAdminAuth) {
      setIsAuthenticated(true);
    }
  }, [eventConfig, eventPin]);

  if (loading) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "var(--bg-deep)", color: "var(--text-primary)" }}>
        <div className="lobby-loader"></div>
      </div>
    );
  }

  if (!eventConfig) {
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
        </header>
        <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", padding: "20px" }}>
          <div className="glass-panel" style={{ width: "100%", maxWidth: "450px", padding: "2.5rem", textAlign: "center" }}>
            <div style={{ fontSize: "3rem", marginBottom: "12px" }}>⚠️</div>
            <h2 className="gradient-text-magenta" style={{ fontSize: "1.5rem", marginBottom: "6px" }}>Event Not Found</h2>
            <p style={{ color: "var(--text-muted)", fontSize: "0.9rem", marginBottom: "24px" }}>
              The event with PIN <strong style={{ color: "var(--gold-primary)" }}>{eventPin}</strong> could not be found. Please double check the PIN code.
            </p>
            <button className="btn btn-primary" style={{ width: "100%" }} onClick={() => router.push("/host")}>
              ← Go back to Portal
            </button>
          </div>
        </div>
      </div>
    );
  }

  const handleBack = () => {
    if (sessionStorage.getItem("sa_auth") === "true") {
      router.push("/superadmin");
    } else {
      router.push("/host");
    }
  };

  if (!isAuthenticated) {
    const handlePasswordSubmit = () => {
      const requiredPass = eventConfig.hostPassword || "";
      if (passwordInput.trim() === requiredPass) {
        setIsAuthenticated(true);
        sessionStorage.setItem(`host_auth_${eventPin}`, "true");
        setAuthError("");
      } else {
        setAuthError("Incorrect password. Please try again.");
      }
    };

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
            <button className="btn btn-outline" style={{ padding: "6px 14px", fontSize: "0.8rem" }} onClick={() => router.push("/host")}>
              ← Back to Portal
            </button>
          </div>
        </header>

        <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", padding: "20px" }}>
          <div className="glass-panel" style={{ width: "100%", maxWidth: "420px", padding: "2.5rem", textAlign: "center" }}>
            <div style={{ fontSize: "3rem", marginBottom: "12px" }}>🔐</div>
            <h2 className="gradient-text-gold" style={{ fontSize: "1.5rem", marginBottom: "6px" }}>Host Password Required</h2>
            <p style={{ color: "var(--text-muted)", fontSize: "0.85rem", marginBottom: "24px" }}>
              Please enter the Host Password for <strong style={{ color: "var(--gold-primary)" }}>{eventConfig.name}</strong>.
            </p>

            <div className="input-group" style={{ textAlign: "left" }}>
              <label htmlFor="host-password-gate">Host Password</label>
              <input
                type="password"
                id="host-password-gate"
                className="input-field"
                placeholder="Enter password..."
                value={passwordInput}
                onChange={(e) => { setPasswordInput(e.target.value); setAuthError(""); }}
                onKeyDown={(e) => e.key === "Enter" && handlePasswordSubmit()}
                autoFocus
              />
              {authError && (
                <p style={{ color: "#f87171", fontSize: "0.8rem", marginTop: "6px" }}>⚠️ {authError}</p>
              )}
            </div>

            <button
              className="btn btn-primary"
              style={{ width: "100%", marginTop: "16px", padding: "12px" }}
              onClick={handlePasswordSubmit}
            >
              🔓 Access Host Dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg-deep)", color: "var(--text-primary)" }}>
      {/* HEADER */}
      <header>
        <div className="logo-container" style={{ cursor: "pointer" }} onClick={handleBack}>
          <span className="logo-icon">👑</span>
          <h1 style={{ fontSize: "1.4rem", fontWeight: 700, margin: 0 }}>
            <span className="gradient-text-gold">{eventConfig.name}</span>{" "}
            <span style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>Host Dashboard</span>
          </h1>
        </div>
        <div className="nav-links" style={{ gap: "16px" }}>
          <span className="hero-badge" style={{ fontSize: "0.75rem", padding: "4px 12px" }}>
            🔑 PIN: {eventConfig.pin}
          </span>
          <button className="btn btn-outline" style={{ padding: "6px 14px", fontSize: "0.8rem" }} onClick={handleBack}>
            ← Exit Event
          </button>
        </div>
      </header>

      {/* RENDER THE HOST SANDBOX */}
      <Sandbox
        initialEventName={eventConfig.name}
        initialEventPin={eventConfig.pin}
        initialMaxPlayers={eventConfig.maxPlayers}
        initialActiveGames={eventConfig.games}
        role="admin"
        onBackToDashboard={handleBack}
      />
    </div>
  );
}
