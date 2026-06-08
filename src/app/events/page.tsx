"use client";

import React, { useEffect, useRef } from "react";
import Image from "next/image";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Link from "next/link";

// Helper: map old jpg path → webp path
function toWebP(path: string): string {
  return path.replace(/\.(jpg|jpeg|png)$/i, ".webp");
}

export default function EventsPortfolioPage() {
  const categories = [
    {
      id: "weddings",
      title: "💍 Luxury Weddings & Pre-Weddings",
      desc: "We transform halls, open gardens, and temple venues into royal celebration spaces. Our services include flower-wrapped entrance arches, structural mandaps, traditional seating, and LED backdrop integration.",
      image: "/beautiful-wedding-flowers-low-angle.webp",
      subImages: [
        { url: "/golden-wedding-stage-photo.webp", label: "Grand Stage Layouts" },
        { url: "/wedding-arch-with-flowers-sunset-view.webp", label: "Sunrise/Sunset Arches" }
      ],
      features: [
        "Fresh and imported floral curation",
        "Ornate brass pillars and mandap setups",
        "Thematic carpet and fabrics styling",
        "Stage lighting and special fog effects"
      ]
    },
    {
      id: "proposals",
      title: "💖 Surprise Proposals & Romantic Dates",
      desc: "Make your magical proposal unforgettable with customized styling. From private rooftop candlelit dinners to garden photobooths, we coordinate the visual romance down to the last rose petal.",
      image: "/romantic-wedding-photocall-with-neon-love-sign.webp",
      subImages: [
        { url: "/Anais-Events-6.webp", label: "Proposal Flower Decor" },
        { url: "/Anais-Events-6.webp", label: "Private Romantic Dinners" }
      ],
      features: [
        "Custom neon signboards ('Marry Me', 'Forever & Always')",
        "Fairy lights and candle illumination path",
        "Champagne table and flower arches",
        "Catering arrangement and musician booking"
      ]
    },
    {
      id: "birthdays",
      title: "🎂 Birthday & Anniversary Parties",
      desc: "Bring energy and color to your family milestone celebrations! We design high-energy setups with premium balloon arches, themed character backdrops, cake presentation stages, and interactive game mockups.",
      image: "/shine-wedding-altar-newlyweds-stands-backyard-decorated-with-balloons.webp",
      subImages: [
        { url: "/navratri-highly-detailed-door-decoration.webp", label: "Home Balloon Styling" },
        { url: "/navratri-highly-detailed-door-decoration.webp", label: "Traditional Door Decors" }
      ],
      features: [
        "Chic balloon arches and backdrops",
        "Character theme designs for kids' parties",
        "Thematic photo booths with props",
        "Host and MC bookings with live music"
      ]
    },
    {
      id: "corporate",
      title: "🏢 Corporate Galas & Conferences",
      desc: "For premium corporate styling that stands out. We handle stage layouts, banner designs, corporate banquet dinners, lighting, and client engagement areas with professional excellence.",
      image: "/elegant-wedding-ceremony-table-with-floral-candle-decor.webp",
      subImages: [
        { url: "/Anais-Events-6.webp", label: "Banquet Settings" },
        { url: "/beautiful-wedding-flowers-low-angle.webp", label: "Corporate Entrance Curation" }
      ],
      features: [
        "Elegant banquet table layouts",
        "Branded staging and structural backdrops",
        "Corporate lighting and acoustics",
        "Live gaming portals for networking"
      ]
    }
  ];

  // Lazy-load videos using IntersectionObserver
  const videoRefs = useRef<(HTMLVideoElement | null)[]>([]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const video = entry.target as HTMLVideoElement;
          if (entry.isIntersecting) {
            // Only set src when video enters viewport
            const dataSrc = video.getAttribute("data-src");
            if (dataSrc && !video.src) {
              video.src = dataSrc;
              video.load();
            }
            observer.unobserve(video);
          }
        });
      },
      { rootMargin: "200px" } // start loading 200px before visible
    );

    videoRefs.current.forEach((v) => { if (v) observer.observe(v); });
    return () => observer.disconnect();
  }, []);

  const videos = [
    {
      src: "/From KlickPin CF Amazing Date Night Outfit Ideas for a Cozy Vibe - Pin-809944314258527187.webm",
      title: "💖 Romantic Proposal Highlights",
      desc: "Private outdoor proposal setup with custom neon signs and rose arches.",
    },
    {
      src: "/From KlickPin CF Charming world culture moments with charm and ideas for creative people with beautiful world vibes 🌏 - Pin-907545762406783443.webm",
      title: "🌏 Traditional Theme Walkthrough",
      desc: "Elegant cultural celebration decor and traditional entry backdrops.",
    },
    {
      src: "/From KlickPin CF Practical Digital Detox Ideas for a Cozy Vibe - Pin-836684437044236034.webm",
      title: "🍽️ Cozy Date & Dinner Setup",
      desc: "Chic banquet tables styled with warm candle lanterns and premium centerpieces.",
    },
    {
      src: "/From KlickPin CF Practical Resin Craft Ideas for Right Now - Pin-870531802963938104.webm",
      title: "✨ Creative Event Artistry",
      desc: "Close-up details of customized structural props and floral crafts.",
    },
  ];

  return (
    <div className="luxury-light">
      <Header />

      <main className="luxury-container" style={{ paddingBottom: "4rem" }}>

        {/* Intro */}
        <section style={{ textAlign: "center", marginBottom: "4rem" }}>
          <span className="hero-badge" style={{ marginBottom: "12px" }}>Our Portfolio</span>
          <h1 className="gradient-text-gold" style={{ fontSize: "2.5rem", marginBottom: "12px" }}>
            Curated Celebration Designs
          </h1>
          <p style={{ color: "#555", maxWidth: "700px", margin: "0 auto", fontSize: "1rem", lineHeight: 1.6 }}>
            Browse through our portfolio of custom event decorations and coordination services. Each setup is meticulously crafted by our structural decorators and florists to tell your unique story.
          </p>
        </section>

        {/* Categories Grid */}
        <section style={{ display: "flex", flexDirection: "column", gap: "60px" }}>
          {categories.map((cat, idx) => (
            <div
              key={cat.id}
              className="glass-panel"
              style={{
                display: "grid",
                gridTemplateColumns: idx % 2 === 0 ? "1fr 1.1fr" : "1.1fr 1fr",
                gap: "40px",
                padding: "2.5rem",
                borderRadius: "24px",
                alignItems: "center",
                contentVisibility: "auto",
                containIntrinsicSize: "0 600px",
              }}
            >
              {/* Image side */}
              <div style={{ order: idx % 2 === 0 ? 0 : 1 }}>
                <div style={{ position: "relative", height: "360px", borderRadius: "16px", overflow: "hidden", boxShadow: "0 10px 25px rgba(0,0,0,0.1)", marginBottom: "16px" }}>
                  <Image
                    src={cat.image}
                    alt={cat.title}
                    fill
                    style={{ objectFit: "cover" }}
                    loading={idx === 0 ? "eager" : "lazy"}
                    priority={idx === 0}
                    sizes="(max-width: 768px) 100vw, 50vw"
                  />
                </div>

                {/* Thumbnails */}
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                  {cat.subImages.map((sub, sIdx) => (
                    <div key={sIdx} style={{ position: "relative", height: "110px", borderRadius: "10px", overflow: "hidden" }}>
                      <Image
                        src={sub.url}
                        alt={sub.label}
                        fill
                        style={{ objectFit: "cover" }}
                        loading="lazy"
                        sizes="(max-width: 768px) 50vw, 25vw"
                      />
                      <span
                        style={{
                          position: "absolute",
                          bottom: "6px",
                          left: "6px",
                          fontSize: "0.68rem",
                          background: "rgba(0,0,0,0.6)",
                          color: "white",
                          padding: "2px 6px",
                          borderRadius: "4px",
                          zIndex: 1,
                        }}
                      >
                        {sub.label}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Text Side */}
              <div>
                <h2 className="gradient-text-gold" style={{ fontSize: "1.8rem", marginBottom: "12px" }}>
                  {cat.title}
                </h2>
                <p style={{ color: "#555", fontSize: "0.95rem", lineHeight: 1.6, marginBottom: "20px" }}>
                  {cat.desc}
                </p>

                <h4 style={{ fontSize: "0.9rem", textTransform: "uppercase", letterSpacing: "1px", marginBottom: "10px", color: "#333" }}>
                  What We Curate
                </h4>
                <ul style={{ paddingLeft: "20px", margin: "0 0 24px", display: "flex", flexDirection: "column", gap: "8px", fontSize: "0.9rem", color: "#555" }}>
                  {cat.features.map((feat, fIdx) => (
                    <li key={fIdx}>{feat}</li>
                  ))}
                </ul>

                <Link
                  href={`/contact?type=${cat.id}`}
                  className="btn btn-primary"
                  style={{ textDecoration: "none", display: "inline-flex" }}
                >
                  Enquire About Setup
                </Link>
              </div>
            </div>
          ))}
        </section>

        {/* VIDEO HIGHLIGHTS REEL — lazy loaded via IntersectionObserver */}
        <section style={{ marginTop: "4rem" }}>
          <div style={{ textAlign: "center", marginBottom: "2.5rem" }}>
            <span className="hero-badge" style={{ marginBottom: "12px" }}>Event Reels</span>
            <h2 className="gradient-text-gold" style={{ fontSize: "2.2rem", marginBottom: "8px" }}>
              Celebrations in Motion
            </h2>
            <p style={{ color: "#555", maxWidth: "600px", margin: "0 auto", fontSize: "0.95rem" }}>
              Watch our live event setups in action! Experience the magical atmosphere, premium designs, and vibrant layouts we execute.
            </p>
          </div>

          <div className="video-reels-grid">
            {videos.map((v, i) => (
              <div key={i} className="video-card-item glass-panel">
                {/* data-src used by IntersectionObserver — video not loaded until visible */}
                <video
                  ref={(el) => { videoRefs.current[i] = el; }}
                  data-src={v.src}
                  controls
                  preload="none"
                  className="portfolio-video"
                  playsInline
                />
                <div className="video-card-info">
                  <h3>{v.title}</h3>
                  <p>{v.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

      </main>

      <Footer />

      {/* Responsive columns override */}
      <style jsx>{`
        @media (max-width: 992px) {
          .glass-panel {
            grid-template-columns: 1fr !important;
          }
          .glass-panel > div {
            order: 0 !important;
          }
        }
      `}</style>
    </div>
  );
}
