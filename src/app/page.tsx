"use client";

import React, { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import Image from "next/image";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Link from "next/link";

// Dynamically import heavy Sandbox — only loads JS when demo is triggered
const Sandbox = dynamic(() => import("@/components/Sandbox"), {
  loading: () => (
    <div style={{ minHeight: "400px", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div className="lobby-loader" />
    </div>
  ),
  ssr: false,
});

export default function Home() {
  const [showDemo, setShowDemo] = useState(false);
  
  // Hero Carousel Slide State
  const [currentSlide, setCurrentSlide] = useState(0);
  const slides = [
    {
      image: "/beautiful-wedding-flowers-low-angle.webp",
      title: "Luxury Wedding Decors",
      desc: "Bespoke design, premium stage arches, and romantic backdrops customized for your Shubh Occasions."
    },
    {
      image: "/wedding-arch-with-flowers-sunset-view.webp",
      title: "Surprise Proposal Setups",
      desc: "Intimate beachside dinners, neon 'Marry Me' signs, and floral arrangements to capture the perfect 'Yes'."
    },
    {
      image: "/elegant-wedding-ceremony-table-with-floral-candle-decor.webp",
      title: "High-End Corporate Events",
      desc: "Impeccable table designs, custom lighting, and interactive game features to elevate your business galas."
    }
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 6000);
    return () => clearInterval(timer);
  }, [slides.length]);

  // Package Estimator Widget State
  const [eventType, setEventType] = useState("wedding");
  const [guests, setGuests] = useState(150);
  const [decorTier, setDecorTier] = useState("elegant");

  const calculateEstimate = () => {
    let basePrice = 60000; // base price in INR
    let typeMultiplier = 1.0;
    if (eventType === "wedding") typeMultiplier = 1.6;
    else if (eventType === "corporate") typeMultiplier = 1.3;
    else if (eventType === "birthday") typeMultiplier = 0.85;
    else if (eventType === "surprise") typeMultiplier = 1.0;

    let tierMultiplier = 1.0;
    if (decorTier === "luxury") tierMultiplier = 2.2;
    else if (decorTier === "simple") tierMultiplier = 0.75;

    const estimate = (basePrice + (guests * 450)) * typeMultiplier * tierMultiplier;
    return Math.round(estimate).toLocaleString("en-IN");
  };



  if (showDemo) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", background: "var(--bg-deep)", color: "var(--text-primary)" }}>
        <header>
          <div className="logo-container" style={{ cursor: "pointer" }} onClick={() => setShowDemo(false)}>
            <span className="logo-icon">👑</span>
            <h1 style={{ fontSize: "1.4rem", fontWeight: 700, margin: 0 }}>
              <span className="gradient-text-gold">Shubh</span>{" "}
              <span className="gradient-text-magenta">Sambhram</span>
              <span style={{ fontSize: "0.8rem", color: "var(--text-muted)", marginLeft: "10px" }}>Sandbox Demo</span>
            </h1>
          </div>
          <div className="nav-links">
            <button className="btn btn-outline" style={{ padding: "6px 14px", fontSize: "0.8rem" }} onClick={() => setShowDemo(false)}>
              ← Exit Demo
            </button>
          </div>
        </header>

        <Sandbox
          initialEventName="Shubh Milan Sangeet"
          initialEventPin="SHUBH99"
          initialMaxPlayers={100}
          initialActiveGames={["housie", "eliminate", "boat", "hunt", "memory", "arrow", "escape"]}
          role="both"
          onBackToDashboard={() => setShowDemo(false)}
        />
      </div>
    );
  }

  return (
    <div className="luxury-light">
      <Header />

      <main className="luxury-container">
        
        {/* HERO CAROUSEL */}
        <section className="hero-slider">
          {slides.map((slide, idx) => (
            <div
              key={idx}
              className="hero-slide"
              style={{
                opacity: currentSlide === idx ? 1 : 0,
                pointerEvents: currentSlide === idx ? "auto" : "none",
                zIndex: currentSlide === idx ? 2 : 1,
                position: "absolute",
                inset: 0,
              }}
            >
              <Image
                src={slide.image}
                alt={slide.title}
                fill
                style={{ objectFit: "cover" }}
                priority={idx === 0}
                loading={idx === 0 ? "eager" : "lazy"}
                sizes="100vw"
              />
              <div className="hero-slide-overlay"></div>
              <div className="hero-slide-content">
                <h2>{slide.title}</h2>
                <p>{slide.desc}</p>
                <div style={{ display: "flex", gap: "12px" }}>
                  <Link href="/contact" className="btn btn-primary" style={{ textDecoration: "none" }}>
                    Book Consultation
                  </Link>
                  <Link href="/play" className="btn btn-primary" style={{ textDecoration: "none" }}>
                    🎮 Live Portal
                  </Link>
                </div>
              </div>
            </div>
          ))}

          {/* Indicators */}
          <div className="slide-indicators">
            {slides.map((_, idx) => (
              <button
                key={idx}
                className={`indicator-dot ${currentSlide === idx ? "active" : ""}`}
                onClick={() => setCurrentSlide(idx)}
                title={`Go to slide ${idx + 1}`}
              />
            ))}
          </div>
        </section>


        {/* FEATURED SERVICES PREVIEW */}
        <section className="services-section">
          <h2 style={{ textAlign: "center", fontSize: "2.2rem", marginBottom: "8px" }} className="gradient-text-gold">
            Bespoke Celebration Offerings
          </h2>
          <p style={{ textAlign: "center", color: "#666", fontSize: "0.95rem", maxWidth: "650px", margin: "0 auto 2.5rem" }}>
            We provide comprehensive styling, flower decorations, stage setups, sound & illumination, and exclusive live game entertainment hosting.
          </p>

          <div className="services-card-grid">
            {/* Wedding Card */}
            <div className="service-item-card glass-panel">
              <div className="service-card-image" style={{ backgroundImage: "url('/golden-wedding-stage-photo.jpg')" }}>
                <div className="service-card-image-overlay"></div>
              </div>
              <div className="service-card-content">
                <h3>Wedding Styling & Decor</h3>
                <p>High-end wedding setups, floral stages, mandap styles, and reception entries designed with traditional grandeur.</p>
              </div>
            </div>

            {/* Surprise Card */}
            <div className="service-item-card glass-panel">
              <div className="service-card-image" style={{ backgroundImage: "url('/romantic-wedding-photocall-with-neon-love-sign.jpg')" }}>
                <div className="service-card-image-overlay"></div>
              </div>
              <div className="service-card-content">
                <h3>Surprise Proposals & Dates</h3>
                <p>Exquisite candlelit tables, rose archways, neon light backdrops, and balloon architectures for magical proposal moments.</p>
              </div>
            </div>

            {/* Birthday Card */}
            <div className="service-item-card glass-panel">
              <div className="service-card-image" style={{ backgroundImage: "url('/shine-wedding-altar-newlyweds-stands-backyard-decorated-with-balloons.jpg')" }}>
                <div className="service-card-image-overlay"></div>
              </div>
              <div className="service-card-content">
                <h3>Milestone Birthdays</h3>
                <p>Chic thematic backdrops, playful balloon clouds, photography booths, and interactive live party games hosting.</p>
              </div>
            </div>

            {/* Corporate Card */}
            <div className="service-item-card glass-panel">
              <div className="service-card-image" style={{ backgroundImage: "url('/elegant-wedding-ceremony-table-with-floral-candle-decor.jpg')" }}>
                <div className="service-card-image-overlay"></div>
              </div>
              <div className="service-card-content">
                <h3>Corporate Awards & Galas</h3>
                <p>Sleek banquet table centerpieces, structural stage designs, premium layouts, and digital interactive activities.</p>
              </div>
            </div>
          </div>

          {/* FREE GAMES INCLUDED BANNER */}
          <div className="glass-panel games-included-banner" style={{
            padding: "2.5rem 2rem",
            borderRadius: "24px",
            border: "1px solid rgba(216, 178, 39, 0.2)",
            background: "linear-gradient(135deg, rgba(255, 255, 255, 0.98) 0%, rgba(216, 178, 39, 0.03) 100%)",
            marginTop: "2.5rem",
            textAlign: "center",
            boxShadow: "0 15px 35px rgba(166, 128, 11, 0.05)"
          }}>
            <span style={{ fontSize: "2rem" }}>🎉</span>
            <h3 className="gradient-text-gold" style={{ fontSize: "1.6rem", fontWeight: 700, margin: "10px 0" }}>
              Free Fun Shubh Sambhram Online Games Included!
            </h3>
            <p style={{ color: "#555", fontSize: "0.95rem", maxWidth: "650px", margin: "0 auto 1.5rem", lineHeight: 1.5 }}>
              Every event booking includes access to our exclusive, real-time multiplayer digital gaming portal. Keep your guests thoroughly entertained with Housie Housie, Memory Game, Puzzle, and more full of entertainment!
            </p>
            
            <div style={{
              display: "flex",
              justifyContent: "center",
              gap: "10px",
              flexWrap: "wrap",
              marginBottom: "1.5rem"
            }}>
              <span className="game-badge-item">🎰 Housie Housie</span>
              <span className="game-badge-item">🧠 Memory Game</span>
              <span className="game-badge-item">🧩 Puzzle</span>
              <span className="game-badge-item">🚤 Boat Race</span>
              <span className="game-badge-item">🗝️ Scavenger Hunt</span>
            </div>

            <Link href="/play" className="btn btn-primary" style={{ textDecoration: "none", fontSize: "0.85rem", padding: "10px 20px", display: "inline-flex" }}>
              🎮 Launch Live Play Portal
            </Link>
          </div>
        </section>

        {/* PACKAGE BUDGET ESTIMATOR */}
        <section className="estimator-panel glass-panel">
          <div className="estimator-title">
            <h2 className="gradient-text-gold" style={{ fontSize: "2rem", marginBottom: "6px" }}>Estimate Your Event Package</h2>
            <p style={{ color: "#666", fontSize: "0.88rem" }}>Select your details below to get an instant decor & setup budget estimate.</p>
          </div>

          <div className="estimator-inputs">
            <div className="input-group">
              <label htmlFor="est-type">Event Category</label>
              <select
                id="est-type"
                className="input-field"
                value={eventType}
                onChange={(e) => setEventType(e.target.value)}
                style={{ height: "48px" }}
              >
                <option value="wedding">💍 Grand Wedding Ceremony</option>
                <option value="surprise">💖 Surprise Proposal / Date</option>
                <option value="birthday">🎂 Birthday & Family milestone</option>
                <option value="corporate">🏢 Corporate Award Ceremony</option>
              </select>
            </div>

            <div className="input-group">
              <label htmlFor="est-guests">Estimated Guest Count: {guests}</label>
              <input
                type="range"
                id="est-guests"
                min="10"
                max="500"
                step="10"
                value={guests}
                onChange={(e) => setGuests(parseInt(e.target.value))}
                style={{ height: "48px", accentColor: "#a6800b" }}
              />
            </div>

            <div className="input-group">
              <label htmlFor="est-tier">Decor Tier</label>
              <select
                id="est-tier"
                className="input-field"
                value={decorTier}
                onChange={(e) => setDecorTier(e.target.value)}
                style={{ height: "48px" }}
              >
                <option value="luxury">👑 Royal Luxury Premium</option>
                <option value="elegant">✨ Classic Elegant Grace</option>
                <option value="simple">🌸 Minimalist Chic Simple</option>
              </select>
            </div>
          </div>

          <div className="estimator-result">
            <h4 style={{ fontSize: "0.95rem", textTransform: "uppercase", letterSpacing: "1px", color: "#555" }}>Estimated Budget Range</h4>
            <div className="estimator-price">₹ {calculateEstimate()}</div>
            <p style={{ fontSize: "0.78rem", color: "#888", marginTop: "4px" }}>*Includes setup design, stage execution, floral decors, and lighting setups. Taxes extra.</p>
            <Link href={`/contact?type=${eventType}&guests=${guests}&tier=${decorTier}`} className="btn btn-primary" style={{ marginTop: "16px", textDecoration: "none" }}>
              Book Free Design Consultation
            </Link>
          </div>
        </section>



      </main>

      <Footer />
    </div>
  );
}
