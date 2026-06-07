"use client";

import React from "react";
import Link from "next/link";
import Logo from "./Logo";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer
      style={{
        background: "#120924",
        color: "rgba(255, 255, 255, 0.7)",
        borderTop: "3px solid #D8B227",
        padding: "4rem 2rem 2rem",
        width: "100%",
        fontFamily: "'Outfit', sans-serif",
      }}
    >
      <div
        style={{
          maxWidth: "1200px",
          margin: "0 auto",
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
          gap: "40px",
          marginBottom: "3rem",
        }}
      >
        {/* Brand Bio */}
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <Logo size={48} />
            <span style={{ display: "flex", flexDirection: "column" }}>
              <span className="gradient-text-gold" style={{ fontSize: "1.25rem", fontWeight: 800, letterSpacing: "1px", lineHeight: 1 }}>
                SHUBH
              </span>
              <span style={{ fontSize: "0.72rem", fontWeight: 600, color: "white", opacity: 0.9, letterSpacing: "2.5px", marginTop: "2px" }}>
                SAMBHRAM
              </span>
            </span>
          </div>
          <p style={{ fontSize: "0.88rem", lineHeight: 1.6, color: "rgba(255,255,255,0.5)" }}>
            Premium event organizers specialzing in weddings, surprise parties, corporate decors, and high-energy live entertainment concepts.
          </p>
          <div style={{ display: "flex", gap: "12px", marginTop: "8px" }}>
            <span style={{ cursor: "pointer", fontSize: "1.2rem", filter: "grayscale(100%) brightness(200%)" }}>🔵 Facebook</span>
            <span style={{ cursor: "pointer", fontSize: "1.2rem", filter: "grayscale(100%) brightness(200%)" }}>📸 Instagram</span>
          </div>
        </div>

        {/* Quick Links */}
        <div>
          <h4 style={{ color: "white", fontSize: "1.1rem", marginBottom: "1.5rem", position: "relative" }}>
            Quick Navigation
            <span style={{ display: "block", width: "40px", height: "2px", background: "#D8B227", marginTop: "8px" }}></span>
          </h4>
          <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: "10px" }}>
            <li>
              <Link href="/" style={{ color: "inherit", textDecoration: "none", fontSize: "0.9rem" }}>Home</Link>
            </li>
            <li>
              <Link href="/events" style={{ color: "inherit", textDecoration: "none", fontSize: "0.9rem" }}>Event Portfolio</Link>
            </li>
            <li>
              <Link href="/contact" style={{ color: "inherit", textDecoration: "none", fontSize: "0.9rem" }}>Book Consultation</Link>
            </li>
            <li>
              <Link href="/play" style={{ color: "var(--gold-primary)", textDecoration: "none", fontSize: "0.9rem", fontWeight: 600 }}>
                🎮 Live Game Portal
              </Link>
            </li>
          </ul>
        </div>

        {/* Services */}
        <div>
          <h4 style={{ color: "white", fontSize: "1.1rem", marginBottom: "1.5rem", position: "relative" }}>
            Event Services
            <span style={{ display: "block", width: "40px", height: "2px", background: "#D8B227", marginTop: "8px" }}></span>
          </h4>
          <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: "10px", fontSize: "0.9rem", color: "rgba(255,255,255,0.5)" }}>
            <li>✨ Premium Wedding Decor</li>
            <li>🎈 Birthday & Milestone Bashes</li>
            <li>🌹 Surprise Proposales & Dates</li>
            <li>🏢 Corporate Gala & Dinners</li>
            <li>🍽️ Complete Catering & Design</li>
          </ul>
        </div>

        {/* Contact info */}
        <div>
          <h4 style={{ color: "white", fontSize: "1.1rem", marginBottom: "1.5rem", position: "relative" }}>
            Office Address
            <span style={{ display: "block", width: "40px", height: "2px", background: "#D8B227", marginTop: "8px" }}></span>
          </h4>
          <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: "12px", fontSize: "0.9rem" }}>
            <li style={{ display: "flex", gap: "8px", alignItems: "flex-start" }}>
              <span>📍</span>
              <span>
                12, Grand Festive Plaza, Residency Road,
                <br />
                Bengaluru, Karnataka - 560025
              </span>
            </li>
            <li style={{ display: "flex", gap: "8px", alignItems: "center" }}>
              <span>📞</span>
              <a href="tel:+919876543210" style={{ color: "inherit", textDecoration: "none" }}>+91 98765 43210</a>
            </li>
            <li style={{ display: "flex", gap: "8px", alignItems: "center" }}>
              <span>✉️</span>
              <a href="mailto:info@shubh-sambhram.com" style={{ color: "inherit", textDecoration: "none" }}>info@shubh-sambhram.com</a>
            </li>
          </ul>
        </div>
      </div>

      {/* Copyright */}
      <div
        style={{
          maxWidth: "1200px",
          margin: "0 auto",
          borderTop: "1px solid rgba(255, 255, 255, 0.1)",
          paddingTop: "1.5rem",
          textAlign: "center",
          fontSize: "0.82rem",
          color: "rgba(255,255,255,0.4)",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: "10px",
        }}
      >
        <span>&copy; {currentYear} Shubh Sambhram Events. All Rights Reserved.</span>
        <span>
          Designed with 👑 for Indian Celebrations.
        </span>
      </div>
    </footer>
  );
}
