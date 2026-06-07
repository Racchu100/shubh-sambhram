"use client";

import React from "react";

interface LandingPageProps {
  onEnterDemo: () => void;
  onCreateEvent: () => void;
  onHostLoginClick: () => void;
  onPlayLoginClick: () => void;
}

export default function LandingPage({ onEnterDemo, onCreateEvent, onHostLoginClick, onPlayLoginClick }: LandingPageProps) {
  return (
    <>
      {/* --- APP HEADER --- */}
      <header>
        <div className="logo-container" id="nav-logo" onClick={() => window.location.reload()}>
          <span className="logo-icon">👑</span>
          <h1 style={{ fontSize: "1.5rem", fontWeight: 700, margin: 0 }}>
            <span className="gradient-text-gold">Shubh</span>{" "}
            <span className="gradient-text-magenta">Sambhram</span>
          </h1>
        </div>
        <div className="nav-links">
          <span className="nav-link active" onClick={() => window.location.reload()}>Home</span>
          <span className="nav-link" onClick={onEnterDemo}>Try Sandbox Demo</span>
          <span className="nav-link" onClick={onPlayLoginClick} style={{ color: "var(--purple-light)" }}>Join as Player</span>
          <span className="nav-link" onClick={onHostLoginClick} style={{ color: "var(--gold-primary)" }}>Host Login</span>
          <button
            className="btn btn-outline"
            style={{ padding: "8px 16px", fontSize: "0.85rem" }}
            onClick={onCreateEvent}
          >
            Super Admin
          </button>
        </div>
      </header>

      {/* --- LANDING PAGE --- */}
      <main id="landing-page">
        {/* Hero Section */}
        <section className="hero-section">
          <div className="hero-badge">🎉 Indian Party Games Redefined</div>
          <h2 className="hero-title">
            Live Interactive Gaming<br />
            For Your <span className="gradient-text-gold">Shubh Occasions</span>
          </h2>
          <p className="hero-subtitle">
            Transform weddings, family reunions, and corporate celebrations into high-energy hubs.
            Host customized games, engage up to 500 players simultaneously, and track real-time leaderboards on desktop and mobile.
          </p>
          <div className="hero-cta" style={{ display: "flex", gap: "12px", justifyContent: "center", flexWrap: "wrap" }}>
            <button className="btn btn-primary" onClick={onPlayLoginClick}>
              📱 Join Event as Player
            </button>
            <button className="btn btn-secondary" style={{ borderColor: "var(--gold-primary)", color: "var(--gold-primary)" }} onClick={onHostLoginClick}>
              🏹 Enter Event as Host
            </button>
            <button className="btn btn-outline" onClick={onEnterDemo}>
              🔥 Try Sandbox Demo
            </button>
            <button className="btn btn-outline" onClick={onCreateEvent}>
              👑 Super Admin Portal
            </button>
          </div>
        </section>

        {/* Features Section (Game Showcases) */}
        <section className="features-section">
          <h2 className="section-title">The Game Suite</h2>
          <div className="games-grid">
            {/* Tambola Card */}
            <div className="game-card glass-panel">
              <span className="game-badge" style={{ background: "rgba(255, 215, 0, 0.15)", color: "var(--gold-primary)" }}>
                Classic Draw
              </span>
              <div className="game-icon-wrapper">🎰</div>
              <h3>Housie Housie (Tambola)</h3>
              <p>
                Standard Indian Bingo. Auto-draw numbers with customizable speeds, verify ticket patterns instantly via code validation, and trigger automated celebration banners.
              </p>
            </div>
            {/* Boat Race Card */}
            <div className="game-card glass-panel">
              <span className="game-badge" style={{ background: "rgba(248, 44, 148, 0.15)", color: "#f43f5e" }}>
                Action Tapper
              </span>
              <div className="game-icon-wrapper">🚤</div>
              <h3>Boat Race (Tap to Move)</h3>
              <p>
                High-octane clicker race. Players tap intensely to advance their boats on a synchronized canvas track. Integrated server-side tap limiters block cheaters.
              </p>
            </div>
            {/* Eliminate Image Card */}
            <div className="game-card glass-panel">
              <span className="game-badge" style={{ background: "rgba(59, 130, 246, 0.15)", color: "#60a5fa" }}>
                Elimination
              </span>
              <div className="game-icon-wrapper">🚫</div>
              <h3>Eliminate the Image</h3>
              <p>
                4 images, multiple rounds, 1 survivor. Admin crosses out one image per round based on choice. Players who stand by the winning option share the crown.
              </p>
            </div>
            {/* Treasure Hunt Card */}
            <div className="game-card glass-panel">
              <span className="game-badge" style={{ background: "rgba(245, 158, 11, 0.15)", color: "#fbbf24" }}>
                Clue Solving
              </span>
              <div className="game-icon-wrapper">🗝️</div>
              <h3>Treasure Hunt (Scavenger)</h3>
              <p>
                Solve riddle sequences to unlock successive clues. Admin can release custom hints, track active players' progress, and award time-bonus points.
              </p>
            </div>
            {/* Memory Game Card */}
            <div className="game-card glass-panel">
              <span className="game-badge" style={{ background: "rgba(16, 185, 129, 0.15)", color: "#34d399" }}>
                Puzzle
              </span>
              <div className="game-icon-wrapper">🧠</div>
              <h3>Picture Memory Game</h3>
              <p>
                Flip and match pairs. Supports competitive solo mode (who clears their board fastest) or live shared boards (first to grab matches claims them).
              </p>
            </div>
          </div>
        </section>
      </main>
    </>
  );
}
