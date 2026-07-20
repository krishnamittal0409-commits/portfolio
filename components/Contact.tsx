"use client";

import { useState, FormEvent } from "react";
import { supabase } from "@/lib/supabaseClient";
import { profile } from "@/lib/data";

type Status = "idle" | "sending" | "sent" | "error";

export default function Contact() {
  const [status, setStatus] = useState<Status>("idle");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !message.trim()) return;

    setStatus("sending");
    const { error } = await supabase
      .from("messages")
      .insert([{ name: name.trim(), email: email.trim(), message: message.trim() }]);

    if (error) {
      setStatus("error");
      return;
    }

    setStatus("sent");
    setName("");
    setEmail("");
    setMessage("");
  }

  return (
    <section id="contact" className="section" style={{ borderBottom: "none" }}>
      <div className="container split-grid split-grid--contact">
        <div>
          <div className="eyebrow">Contact</div>
          <h2 className="section-title" style={{ marginBottom: 16 }}>
            Send a message
          </h2>
          <p className="section-sub">Messages land straight in a Supabase table.</p>

          <div style={{ marginTop: 32, display: "flex", flexDirection: "column" }}>
            <ContactLine label="Email" value={profile.email} href={`mailto:${profile.email}`} />
            <ContactLine label="Phone" value={profile.phone} href={`tel:${profile.phone.replace(/\s/g, "")}`} />
            <ContactLine label="LinkedIn" value="in/krishna-mittal" href={profile.linkedin} />
            <ContactLine label="Base" value={profile.location} />
          </div>
        </div>

        <form onSubmit={handleSubmit} className="card" style={{ padding: 28, display: "flex", flexDirection: "column", gap: 16 }}>
          <Field label="Name" htmlFor="name">
            <input id="name" value={name} onChange={(e) => setName(e.target.value)} required placeholder="Your name" style={inputStyle} />
          </Field>
          <Field label="Email" htmlFor="email">
            <input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required placeholder="you@example.com" style={inputStyle} />
          </Field>
          <Field label="Message" htmlFor="message">
            <textarea
              id="message"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              required
              rows={5}
              placeholder="What are you building?"
              style={{ ...inputStyle, resize: "vertical" }}
            />
          </Field>

          <button type="submit" className="btn btn-primary" disabled={status === "sending"} style={{ justifyContent: "center", marginTop: 4 }}>
            {status === "sending" ? "Sending..." : "Send message"}
          </button>

          {status === "sent" && (
            <p role="status" style={{ color: "var(--success)", fontSize: 13.5 }}>
              Sent. Thanks — I&apos;ll get back to you soon.
            </p>
          )}
          {status === "error" && (
            <p role="alert" style={{ color: "#e0715c", fontSize: 13.5 }}>
              Couldn&apos;t send that. Try the email link instead.
            </p>
          )}
        </form>
      </div>
    </section>
  );
}

function ContactLine({ label, value, href }: { label: string; value: string; href?: string }) {
  const style: React.CSSProperties = {
    display: "grid",
    gridTemplateColumns: "84px 1fr",
    gap: 12,
    padding: "11px 0",
    borderBottom: "1px solid var(--border-soft)",
    textDecoration: "none",
  };
  const content = (
    <>
      <span style={{ color: "var(--text-faint)", fontSize: 13 }}>{label}</span>
      <span style={{ color: "var(--text)", fontSize: 14 }}>{value}</span>
    </>
  );
  return href ? (
    <a href={href} target={href.startsWith("http") ? "_blank" : undefined} rel="noreferrer" style={style}>
      {content}
    </a>
  ) : (
    <div style={style}>{content}</div>
  );
}

function Field({ label, htmlFor, children }: { label: string; htmlFor: string; children: React.ReactNode }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
      <label htmlFor={htmlFor} style={{ fontSize: 13, color: "var(--text-dim)" }}>
        {label}
      </label>
      {children}
    </div>
  );
}

const inputStyle: React.CSSProperties = {
  background: "var(--surface-2)",
  border: "1px solid var(--border)",
  borderRadius: 8,
  padding: "11px 13px",
  color: "var(--text)",
  fontSize: 14,
  outline: "none",
  fontFamily: "var(--font-body)",
};
