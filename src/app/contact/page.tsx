"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

function ContactFormContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  // Load URL query parameters (if any)
  const initialType = searchParams?.get("type") || "wedding";
  const initialGuests = parseInt(searchParams?.get("guests") || "100");
  const initialTier = searchParams?.get("tier") || "elegant";

  // Form State
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [eventType, setEventType] = useState(initialType);
  const [eventDate, setEventDate] = useState("");
  const [guests, setGuests] = useState(initialGuests);
  const [decorTier, setDecorTier] = useState(initialTier);
  const [message, setMessage] = useState("");

  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    // If search params update after mount
    if (searchParams) {
      const type = searchParams.get("type");
      if (type) setEventType(type);
      const guestsParam = searchParams.get("guests");
      if (guestsParam) setGuests(parseInt(guestsParam));
      const tier = searchParams.get("tier");
      if (tier) setDecorTier(tier);
    }
  }, [searchParams]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !phone.trim() || !eventDate) {
      setError("Please fill in all required fields (Name, Email, Phone, and Event Date).");
      return;
    }
    setError("");
    setSubmitted(true);
  };

  return (
    <div className="contact-grid">
      {/* LEFT: FORM PANEL */}
      <div className="glass-panel contact-form-panel" style={{ borderRadius: "24px" }}>
        {submitted ? (
          <div style={{ textAlign: "center", padding: "2rem 0" }}>
            <div style={{ fontSize: "4rem", marginBottom: "16px" }}>🕊️</div>
            <h2 className="gradient-text-gold" style={{ fontSize: "1.8rem", marginBottom: "8px" }}>Enquiry Received!</h2>
            <p style={{ color: "#555", fontSize: "0.95rem", lineHeight: 1.6, maxWidth: "450px", margin: "0 auto 20px" }}>
              Thank you, <strong>{name}</strong>! Your event consultation request has been logged. Our design decorators will review the details and reach out within 24 hours.
            </p>
            <div className="glass-panel" style={{ padding: "12px", background: "rgba(216,178,39,0.06)", display: "inline-block", textAlign: "left", fontSize: "0.85rem", border: "1px dashed rgba(216,178,39,0.2)" }}>
              <strong>📋 Summary of Request:</strong>
              <div style={{ marginTop: "4px" }}>• Category: {eventType.toUpperCase()}</div>
              <div>• Date: {eventDate}</div>
              <div>• Est. Guests: {guests}</div>
              <div>• Decor Preference: {decorTier.toUpperCase()}</div>
            </div>
            <div style={{ marginTop: "24px" }}>
              <button className="btn btn-outline" onClick={() => { setSubmitted(false); setName(""); setEmail(""); setPhone(""); setMessage(""); setEventDate(""); }}>
                Send Another Request
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            <h3 style={{ fontSize: "1.4rem", color: "#1a1a1a", borderBottom: "1px solid rgba(216,178,39,0.15)", paddingBottom: "10px", margin: 0 }}>
              Free Design Consultation Request
            </h3>
            
            {error && (
              <p style={{ color: "var(--danger)", fontSize: "0.85rem", background: "rgba(239,68,68,0.08)", padding: "10px", borderRadius: "8px", border: "1px solid rgba(239,68,68,0.2)", margin: 0 }}>
                ⚠️ {error}
              </p>
            )}

            <div className="contact-form-row-2col">
              <div className="input-group" style={{ marginBottom: 0 }}>
                <label htmlFor="c-name">Full Name *</label>
                <input
                  type="text"
                  id="c-name"
                  className="input-field"
                  placeholder="Your name..."
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>
              <div className="input-group" style={{ marginBottom: 0 }}>
                <label htmlFor="c-email">Email Address *</label>
                <input
                  type="email"
                  id="c-email"
                  className="input-field"
                  placeholder="Your email..."
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="contact-form-row-2col">
              <div className="input-group" style={{ marginBottom: 0 }}>
                <label htmlFor="c-phone">Contact Number *</label>
                <input
                  type="tel"
                  id="c-phone"
                  className="input-field"
                  placeholder="Your phone number..."
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  required
                />
              </div>
              <div className="input-group" style={{ marginBottom: 0 }}>
                <label htmlFor="c-date">Planned Event Date *</label>
                <input
                  type="date"
                  id="c-date"
                  className="input-field"
                  value={eventDate}
                  onChange={(e) => setEventDate(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="contact-form-row-3col">
              <div className="input-group" style={{ marginBottom: 0 }}>
                <label htmlFor="c-type">Category</label>
                <select id="c-type" className="input-field" value={eventType} onChange={(e) => setEventType(e.target.value)}>
                  <option value="wedding">💍 Wedding</option>
                  <option value="surprise">💖 Proposal</option>
                  <option value="birthday">🎂 Birthday</option>
                  <option value="corporate">🏢 Corporate</option>
                </select>
              </div>
              <div className="input-group" style={{ marginBottom: 0 }}>
                <label htmlFor="c-guests">Guests: {guests}</label>
                <input
                  type="range"
                  id="c-guests"
                  min="10"
                  max="500"
                  step="10"
                  value={guests}
                  onChange={(e) => setGuests(parseInt(e.target.value))}
                  style={{ accentColor: "#a6800b", height: "42px" }}
                />
              </div>
              <div className="input-group" style={{ marginBottom: 0 }}>
                <label htmlFor="c-tier">Decor Tier</label>
                <select id="c-tier" className="input-field" value={decorTier} onChange={(e) => setDecorTier(e.target.value)}>
                  <option value="luxury">👑 Luxury</option>
                  <option value="elegant">✨ Elegant</option>
                  <option value="simple">🌸 Simple</option>
                </select>
              </div>
            </div>

            <div className="input-group" style={{ marginBottom: 0 }}>
              <label htmlFor="c-msg">Specific decor requests or details</label>
              <textarea
                id="c-msg"
                className="input-field"
                placeholder="Share any styling ideas, color themes, or special setup requests..."
                rows={4}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                style={{ resize: "none" }}
              />
            </div>

            <button type="submit" className="btn btn-primary" style={{ padding: "14px", marginTop: "8px" }}>
              ✨ Submit Enquiry & Book Consultation
            </button>
          </form>
        )}
      </div>

      {/* RIGHT: BUSINESS DIRECTORY INFO */}
      <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
        
        {/* Contact Coordinates */}
        <div className="glass-panel" style={{ padding: "2rem", borderRadius: "20px" }}>
          <h3 style={{ fontSize: "1.2rem", color: "#a6800b", marginBottom: "16px", borderBottom: "1.5px solid rgba(216,178,39,0.15)", paddingBottom: "8px" }}>
            Reach Us Directly
          </h3>
          <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: "20px", fontSize: "0.92rem" }}>
            <li style={{ display: "flex", gap: "12px" }}>
              <span style={{ fontSize: "1.4rem" }}>📍</span>
              <div>
                <strong>Headquarters Office:</strong>
                <br />
                <span style={{ color: "#555" }}>
                  12, Grand Festive Plaza, Residency Road,
                  <br />
                  Bengaluru, Karnataka - 560025
                </span>
              </div>
            </li>
            <li style={{ display: "flex", gap: "12px", alignItems: "center" }}>
              <span style={{ fontSize: "1.4rem" }}>📞</span>
              <div>
                <strong>Phone Lines:</strong>
                <br />
                <a href="tel:+919876543210" style={{ color: "#a6800b", textDecoration: "none", fontWeight: 600 }}>+91 98765 43210</a>
              </div>
            </li>
            <li style={{ display: "flex", gap: "12px", alignItems: "center" }}>
              <span style={{ fontSize: "1.4rem" }}>✉️</span>
              <div>
                <strong>Email Support:</strong>
                <br />
                <a href="mailto:info@shubh-sambhram.com" style={{ color: "#a6800b", textDecoration: "none", fontWeight: 600 }}>info@shubh-sambhram.com</a>
              </div>
            </li>
          </ul>
        </div>

        {/* Operating hours */}
        <div className="glass-panel" style={{ padding: "1.5rem 2rem", borderRadius: "20px" }}>
          <h3 style={{ fontSize: "1.2rem", color: "#a6800b", marginBottom: "12px", borderBottom: "1.5px solid rgba(216,178,39,0.15)", paddingBottom: "8px" }}>
            Working Hours
          </h3>
          <div style={{ display: "flex", flexDirection: "column", gap: "6px", fontSize: "0.88rem", color: "#555" }}>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span>Monday - Friday:</span>
              <strong>10:00 AM - 7:00 PM</strong>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span>Saturday:</span>
              <strong>10:00 AM - 4:00 PM</strong>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", color: "#a6800b" }}>
              <span>Sunday Events:</span>
              <strong>Open for Consults by Appt.</strong>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ContactPage() {
  return (
    <div className="luxury-light">
      <Header />

      <main className="luxury-container" style={{ paddingBottom: "4rem" }}>
        
        {/* Intro Banner */}
        <section style={{ textAlign: "center", marginBottom: "3rem" }}>
          <span className="hero-badge" style={{ marginBottom: "12px" }}>Get in Touch</span>
          <h1 className="gradient-text-gold" style={{ fontSize: "2.5rem", marginBottom: "12px" }}>
            Let's Style Your Next Event
          </h1>
          <p style={{ color: "#555", maxWidth: "600px", margin: "0 auto", fontSize: "0.95rem", lineHeight: 1.6 }}>
            Have a date in mind or need assistance crafting an elegant setup? Drop us a line. Our designers offer free consultations to map your styling and design layouts.
          </p>
        </section>

        {/* Dynamic Contact Form Content with Suspense Boundary */}
        <Suspense fallback={
          <div style={{ display: "flex", justifyContent: "center", padding: "4rem" }}>
            <div className="lobby-loader"></div>
          </div>
        }>
          <ContactFormContent />
        </Suspense>

      </main>

      <Footer />
    </div>
  );
}
