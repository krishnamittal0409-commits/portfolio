"use client";

import { profile } from "@/lib/data";

export default function Hero() {
  return (
    <section id="top" style={{ padding: "72px 0 88px" }}>
      <div className="container split-grid split-grid--hero">
        <div>
          <div className="eyebrow">Full-Stack Developer</div>
          <h1
            style={{
              fontSize: "clamp(38px, 5vw, 56px)",
              fontWeight: 700,
              marginTop: 18,
              lineHeight: 1.08,
              letterSpacing: "-0.02em",
            }}
          >
            {profile.name}
          </h1>
          <p style={{ marginTop: 14, color: "var(--accent-soft)", fontSize: 16, fontWeight: 500 }}>
            {profile.role}
          </p>
          <p style={{ marginTop: 22, color: "var(--text-dim)", lineHeight: 1.7, maxWidth: 480, fontSize: 15.5 }}>
            {profile.summary}
          </p>

          <div style={{ display: "flex", gap: 12, marginTop: 32, flexWrap: "wrap" }}>
            <a href="#projects" className="btn btn-primary">
              View work
            </a>
            <a href="#contact" className="btn">
              Get in touch
            </a>
            <a href={profile.linkedin} target="_blank" rel="noreferrer" className="btn">
              LinkedIn
            </a>
          </div>
        </div>

        <ProfileCard />
      </div>
    </section>
  );
}

function ProfileCard() {
  return (
    <div className="card" style={{ padding: "28px 28px 24px", boxShadow: "0 30px 60px -30px rgba(0,0,0,0.55)" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
        <span className="mono" style={{ fontSize: 12, color: "var(--text-faint)" }}>
          Stack overview
        </span>
        <span style={{ display: "flex", alignItems: "center", gap: 7, fontSize: 12, color: "var(--success)" }}>
          <span style={{ width: 7, height: 7, borderRadius: "50%", background: "var(--success)", display: "inline-block" }} />
          {profile.status}
        </span>
      </div>

      <div style={{ display: "flex", flexDirection: "column" }}>
        {profile.buildSheet.map((row, i) => (
          <div
            key={row.label}
            style={{
              display: "grid",
              gridTemplateColumns: "100px 1fr",
              gap: 14,
              padding: "13px 0",
              borderTop: i === 0 ? "none" : "1px solid var(--border-soft)",
            }}
          >
            <span className="mono" style={{ fontSize: 11.5, color: "var(--text-faint)", letterSpacing: "0.04em", paddingTop: 2 }}>
              {row.label}
            </span>
            <span style={{ fontSize: 14, color: "var(--text)" }}>{row.value}</span>
          </div>
        ))}
      </div>

      <div style={{ marginTop: 18, paddingTop: 16, borderTop: "1px solid var(--border-soft)", display: "flex", justifyContent: "space-between", color: "var(--text-faint)", fontSize: 12.5 }}>
        <span>{profile.location}</span>
        <span>Open to work</span>
      </div>
    </div>
  );
}
