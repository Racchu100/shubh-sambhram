"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import Logo from "./Logo";

export default function Header() {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileMenuOpen]);


  const navItems = [
    { label: "Home", href: "/" },
    { label: "Our Events", href: "/events" },
    { label: "Get In Touch", href: "/contact" },
  ];

  return (
    <header style={{ position: "fixed", top: 0, left: 0, right: 0, zIndex: 1000, width: "100%", height: "var(--header-height)", backdropFilter: "blur(20px)", WebkitBackdropFilter: "blur(20px)" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", width: "100%", maxWidth: "1200px", margin: "0 auto", height: "100%", padding: "0 1rem" }}>
        
        {/* BRAND LOGO */}
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

        {/* DESKTOP NAVIGATION */}
        <nav className="nav-links" style={{ display: "flex", gap: "30px", alignItems: "center" }}>
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`nav-link ${pathname === item.href ? "active" : ""}`}
            >
              {item.label}
            </Link>
          ))}
          <Link href="/play" className="btn btn-primary" style={{ padding: "8px 16px", fontSize: "0.82rem", borderRadius: "8px", textDecoration: "none" }}>
            🎮 Live Game Portal
          </Link>
        </nav>

        {/* MOBILE MENU TOGGLE BUTTON */}
        <button
          className="mobile-toggle-btn"
          style={{ display: "none", background: "none", border: "none", fontSize: "1.5rem", cursor: "pointer", color: "#a6800b" }}
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          {mobileMenuOpen ? "✕" : "☰"}
        </button>
      </div>

      {/* MOBILE NAV OVERLAY (FULL SCREEN) */}
      {mobileMenuOpen && (
        <div className="mobile-menu-overlay">
          {/* OVERLAY HEADER */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", width: "100%", height: "70px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "10px", cursor: "pointer" }} onClick={() => { setMobileMenuOpen(false); }}>
              <Logo size={42} />
              <span className="logo-text" style={{ display: "flex", flexDirection: "column" }}>
                <span className="gradient-text-gold" style={{ fontSize: "1.15rem", fontWeight: 800, letterSpacing: "1px", lineHeight: 1 }}>
                  SHUBH
                </span>
                <span style={{ fontSize: "0.68rem", fontWeight: 600, color: "#1a1a1a", opacity: 0.8, letterSpacing: "2.5px", marginTop: "2px" }}>
                  SAMBHRAM
                </span>
              </span>
            </div>
            <button
              className="mobile-toggle-btn"
              style={{ background: "none", border: "none", fontSize: "1.8rem", cursor: "pointer", color: "#a6800b" }}
              onClick={() => setMobileMenuOpen(false)}
            >
              ✕
            </button>
          </div>

          {/* OVERLAY LINKS (CENTERED) */}
          <nav className="mobile-menu-items">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`mobile-menu-item ${pathname === item.href ? "active" : ""}`}
                onClick={() => setMobileMenuOpen(false)}
              >
                {item.label}
              </Link>
            ))}
            <Link
              href="/play"
              className="mobile-menu-item btn btn-primary"
              onClick={() => setMobileMenuOpen(false)}
              style={{
                marginTop: "12px",
                padding: "12px 30px",
                fontSize: "1rem",
                borderRadius: "12px",
                textDecoration: "none",
                display: "inline-flex",
                color: "#120924"
              }}
            >
              🎮 Live Game Portal
            </Link>
          </nav>

          {/* OVERLAY FOOTER */}
          <div style={{ textAlign: "center", padding: "1rem 0", color: "#888", fontSize: "0.8rem", borderTop: "1px solid rgba(216, 178, 39, 0.1)" }}>
            <p style={{ fontFamily: "Playfair Display, Georgia, serif", fontStyle: "italic", color: "#a6800b", marginBottom: "4px" }}>
              ✨ Making Every Moment Auspicious ✨
            </p>
            <p>© {new Date().getFullYear()} Shubh Sambhram Events. All rights reserved.</p>
          </div>
        </div>
      )}

      {/* Mobile styles support inside component using style tag */}
      <style jsx>{`
        @media (max-width: 768px) {
          .nav-links {
            display: none !important;
          }
          .mobile-toggle-btn {
            display: block !important;
          }
        }
      `}</style>
    </header>
  );
}
