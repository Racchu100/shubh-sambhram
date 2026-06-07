"use client";

import React, { useState } from "react";

export interface EventConfig {
  id: string;
  name: string;
  pin: string;
  maxPlayers: number;
  games: string[];
  status: "draft" | "live";
  createdAt: string;
  hostPassword?: string;
}

const ALL_GAMES = [
  { id: "housie",    label: "Housie / Tambola Bingo",     icon: "🎰" },
  { id: "eliminate", label: "Eliminate the Image",         icon: "🚫" },
  { id: "boat",      label: "Boat Race (Tap Battle)",      icon: "🚤" },
  { id: "hunt",      label: "Treasure Hunt Scavenger",     icon: "🗝️" },
  { id: "memory",    label: "Picture Memory Flip",         icon: "🧠" },
  { id: "arrow",     label: "Arrow Finisher Puzzle",       icon: "🏹" },
  { id: "escape",    label: "Arrow Escape Puzzle",         icon: "🧩" },
];

interface SuperAdminDashboardProps {
  events: EventConfig[];
  onCreateEvent: (ev: EventConfig) => void;
  onUpdateEvent: (ev: EventConfig) => void;
  onDeleteEvent: (id: string) => void;
  onEnterEvent: (ev: EventConfig) => void;
  onLogout: () => void;
}

function generateId() {
  return Math.random().toString(36).slice(2, 10).toUpperCase();
}

const EMPTY_FORM = {
  name: "",
  pin: "",
  maxPlayers: 100,
  games: ["housie", "eliminate", "boat", "hunt", "memory"] as string[],
  hostPassword: "",
};

export default function SuperAdminDashboard({
  events,
  onCreateEvent,
  onUpdateEvent,
  onDeleteEvent,
  onEnterEvent,
  onLogout,
}: SuperAdminDashboardProps) {
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  const openCreate = () => {
    setForm(EMPTY_FORM);
    setEditingId(null);
    setShowForm(true);
  };

  const openEdit = (ev: EventConfig) => {
    setForm({ name: ev.name, pin: ev.pin, maxPlayers: ev.maxPlayers, games: [...ev.games], hostPassword: ev.hostPassword || "" });
    setEditingId(ev.id);
    setShowForm(true);
  };

  const toggleGame = (gId: string) => {
    setForm((prev) => ({
      ...prev,
      games: prev.games.includes(gId) ? prev.games.filter((g) => g !== gId) : [...prev.games, gId],
    }));
  };

  const handleSubmit = () => {
    if (!form.name.trim() || !form.pin.trim()) {
      alert("Event name and PIN are required!");
      return;
    }
    if (form.games.length === 0) {
      alert("Select at least one game!");
      return;
    }
    if (editingId) {
      const existing = events.find((e) => e.id === editingId)!;
      onUpdateEvent({ ...existing, name: form.name.trim(), pin: form.pin.trim().toUpperCase(), maxPlayers: form.maxPlayers, games: form.games, hostPassword: form.hostPassword.trim() });
    } else {
      onCreateEvent({
        id: generateId(),
        name: form.name.trim(),
        pin: form.pin.trim().toUpperCase(),
        maxPlayers: form.maxPlayers,
        games: form.games,
        status: "draft",
        createdAt: new Date().toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }),
        hostPassword: form.hostPassword.trim(),
      });
    }
    setShowForm(false);
    setEditingId(null);
  };

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg-deep)", color: "var(--text-primary)" }}>

      {/* ── HEADER ── */}
      <header>
        <div className="logo-container">
          <span className="logo-icon">👑</span>
          <h1 style={{ fontSize: "1.4rem", fontWeight: 700, margin: 0 }}>
            <span className="gradient-text-gold">Super</span>{" "}
            <span className="gradient-text-magenta">Admin</span>
          </h1>
        </div>
        <div className="nav-links" style={{ gap: "12px" }}>
          <span style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>
            🔐 Logged in as Super Admin
          </span>
          <button className="btn btn-outline" style={{ padding: "6px 14px", fontSize: "0.8rem" }} onClick={onLogout}>
            Logout
          </button>
        </div>
      </header>

      {/* ── MAIN ── */}
      <main style={{ maxWidth: "1100px", margin: "0 auto", padding: "30px 20px" }}>

        {/* Top bar */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "28px" }}>
          <div>
            <h2 style={{ margin: 0, fontSize: "1.6rem" }}>🗓️ All Events</h2>
            <p style={{ margin: "4px 0 0", color: "var(--text-muted)", fontSize: "0.85rem" }}>
              Create and manage your live event game sessions.
            </p>
          </div>
          <button className="btn btn-primary" style={{ display: "flex", alignItems: "center", gap: "6px", padding: "10px 20px" }} onClick={openCreate}>
            ＋ New Event
          </button>
        </div>

        {/* Events grid */}
        {events.length === 0 ? (
          <div className="glass-panel" style={{ padding: "50px 20px", textAlign: "center" }}>
            <div style={{ fontSize: "3rem", marginBottom: "12px" }}>📭</div>
            <h3 style={{ color: "var(--text-muted)" }}>No events yet</h3>
            <p style={{ color: "var(--text-muted)", fontSize: "0.85rem" }}>Click "+ New Event" to create your first event.</p>
          </div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: "20px" }}>
            {events.map((ev) => (
              <div key={ev.id} className="glass-panel" style={{ padding: "1.5rem", display: "flex", flexDirection: "column", gap: "14px", border: "1px solid rgba(255,215,0,0.12)", borderRadius: "16px" }}>

                {/* Card header */}
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                  <div>
                    <h3 style={{ margin: 0, fontSize: "1.05rem", fontWeight: 700, color: "var(--gold-primary)" }}>{ev.name}</h3>
                    <span style={{ fontSize: "0.72rem", color: "var(--text-muted)", marginTop: "2px", display: "block" }}>
                      Created {ev.createdAt} &nbsp;·&nbsp; ID: {ev.id}
                    </span>
                  </div>
                  <span style={{
                    fontSize: "0.7rem",
                    padding: "3px 10px",
                    borderRadius: "20px",
                    background: ev.status === "live" ? "rgba(34,197,94,0.15)" : "rgba(255,255,255,0.07)",
                    color: ev.status === "live" ? "var(--success)" : "var(--text-muted)",
                    border: `1px solid ${ev.status === "live" ? "rgba(34,197,94,0.3)" : "rgba(255,255,255,0.1)"}`,
                    fontWeight: 600,
                  }}>
                    {ev.status === "live" ? "🟢 Live" : "⚪ Draft"}
                  </span>
                </div>

                {/* PIN + Password + Players */}
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "10px" }}>
                  <div style={{ background: "rgba(255,215,0,0.06)", border: "1px solid rgba(255,215,0,0.15)", borderRadius: "8px", padding: "8px 12px" }}>
                    <div style={{ fontSize: "0.68rem", color: "var(--text-muted)" }}>ACCESS PIN</div>
                    <div style={{ fontSize: "1.05rem", fontWeight: 700, letterSpacing: "2px", color: "var(--gold-primary)" }}>{ev.pin}</div>
                  </div>
                  <div style={{ background: "rgba(209,29,113,0.06)", border: "1px solid rgba(209,29,113,0.15)", borderRadius: "8px", padding: "8px 12px" }}>
                    <div style={{ fontSize: "0.68rem", color: "var(--text-muted)" }}>HOST PASSWORD</div>
                    <div style={{ fontSize: "1.05rem", fontWeight: 700, color: "white" }}>{ev.hostPassword || "—"}</div>
                  </div>
                  <div style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "8px", padding: "8px 12px" }}>
                    <div style={{ fontSize: "0.68rem", color: "var(--text-muted)" }}>MAX PLAYERS</div>
                    <div style={{ fontSize: "1.05rem", fontWeight: 700 }}>{ev.maxPlayers}</div>
                  </div>
                </div>

                {/* Games chips */}
                <div>
                  <div style={{ fontSize: "0.72rem", color: "var(--text-muted)", marginBottom: "6px" }}>GAME SUITE</div>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
                    {ALL_GAMES.map((g) => {
                      const active = ev.games.includes(g.id);
                      return (
                        <span key={g.id} style={{
                          fontSize: "0.72rem",
                          padding: "3px 9px",
                          borderRadius: "20px",
                          background: active ? "rgba(255,215,0,0.1)" : "rgba(255,255,255,0.04)",
                          color: active ? "var(--gold-primary)" : "rgba(255,255,255,0.25)",
                          border: `1px solid ${active ? "rgba(255,215,0,0.25)" : "rgba(255,255,255,0.07)"}`,
                        }}>
                          {g.icon} {g.label.split(" ")[0]}
                        </span>
                      );
                    })}
                  </div>
                </div>

                {/* Action buttons */}
                <div style={{ display: "grid", gridTemplateColumns: "1fr auto auto", gap: "8px", marginTop: "4px" }}>
                  <button
                    className="btn btn-primary"
                    style={{ fontSize: "0.85rem", padding: "8px 0", display: "flex", alignItems: "center", justifyContent: "center", gap: "6px" }}
                    onClick={() => onEnterEvent(ev)}
                  >
                    ▶ Enter Event
                  </button>
                  <button
                    className="btn btn-outline"
                    style={{ fontSize: "0.8rem", padding: "8px 12px" }}
                    onClick={() => openEdit(ev)}
                    title="Edit event"
                  >
                    ✏️
                  </button>
                  {deleteConfirmId === ev.id ? (
                    <button
                      className="btn btn-outline"
                      style={{ fontSize: "0.75rem", padding: "8px 10px", borderColor: "#f87171", color: "#f87171" }}
                      onClick={() => { onDeleteEvent(ev.id); setDeleteConfirmId(null); }}
                    >
                      Confirm
                    </button>
                  ) : (
                    <button
                      className="btn btn-outline"
                      style={{ fontSize: "0.8rem", padding: "8px 12px", borderColor: "rgba(248,113,113,0.3)", color: "#f87171" }}
                      onClick={() => setDeleteConfirmId(ev.id)}
                      title="Delete event"
                    >
                      🗑️
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* ── CREATE / EDIT MODAL ── */}
      {showForm && (
        <div className="modal-overlay" style={{ display: "flex" }}>
          <div className="modal-content glass-panel" style={{ maxWidth: "520px", width: "100%" }}>
            <div className="modal-header">
              <h2 className="gradient-text-gold" style={{ fontSize: "1.4rem" }}>
                {editingId ? "Edit Event" : "Create New Event"}
              </h2>
              <button className="modal-close" onClick={() => { setShowForm(false); setEditingId(null); }}>×</button>
            </div>

            <div className="input-group">
              <label htmlFor="sa-ev-name">Event Nickname</label>
              <input
                type="text"
                className="input-field"
                id="sa-ev-name"
                placeholder="E.g., Sangeet Night Bonanza"
                value={form.name}
                onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
              />
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "15px" }}>
              <div className="input-group">
                <label htmlFor="sa-ev-pin">Access PIN</label>
                <input
                  type="text"
                  className="input-field"
                  id="sa-ev-pin"
                  placeholder="E.g., SHUBH99"
                  value={form.pin}
                  onChange={(e) => setForm((p) => ({ ...p, pin: e.target.value.toUpperCase() }))}
                  maxLength={10}
                />
              </div>
              <div className="input-group">
                <label htmlFor="sa-ev-host-pass">Host Password</label>
                <input
                  type="text"
                  className="input-field"
                  id="sa-ev-host-pass"
                  placeholder="Set Password..."
                  value={form.hostPassword}
                  onChange={(e) => setForm((p) => ({ ...p, hostPassword: e.target.value }))}
                />
              </div>
              <div className="input-group">
                <label htmlFor="sa-ev-limit">Max Players</label>
                <input
                  type="number"
                  className="input-field"
                  id="sa-ev-limit"
                  value={form.maxPlayers}
                  onChange={(e) => setForm((p) => ({ ...p, maxPlayers: parseInt(e.target.value) || 100 }))}
                  min={10}
                  max={500}
                />
              </div>
            </div>

            <div className="input-group">
              <label style={{ marginBottom: "8px", display: "block" }}>Game Suite — Select Games</label>
              <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                {ALL_GAMES.map((g) => (
                  <label key={g.id} style={{ display: "flex", alignItems: "center", gap: "10px", cursor: "pointer", padding: "8px 12px", borderRadius: "8px", background: form.games.includes(g.id) ? "rgba(255,215,0,0.07)" : "rgba(255,255,255,0.03)", border: `1px solid ${form.games.includes(g.id) ? "rgba(255,215,0,0.2)" : "rgba(255,255,255,0.07)"}`, transition: "all 0.2s" }}>
                    <input
                      type="checkbox"
                      checked={form.games.includes(g.id)}
                      onChange={() => toggleGame(g.id)}
                      style={{ accentColor: "var(--gold-primary)", width: "16px", height: "16px" }}
                    />
                    <span style={{ fontSize: "1rem" }}>{g.icon}</span>
                    <span style={{ fontSize: "0.88rem", color: form.games.includes(g.id) ? "white" : "var(--text-muted)" }}>{g.label}</span>
                  </label>
                ))}
              </div>
            </div>

            <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", marginTop: "10px" }}>
              <button className="btn btn-outline" onClick={() => { setShowForm(false); setEditingId(null); }}>
                Cancel
              </button>
              <button className="btn btn-primary" onClick={handleSubmit}>
                {editingId ? "💾 Save Changes" : "✨ Create Event"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
