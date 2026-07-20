"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useRouter } from "next/navigation";

const ALLOWED_EMAIL = "krishnamittal0409@gmail.com";

export default function AdminLogin() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");
  const [sending, setSending] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const check = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (session) {
        router.push("/admin");
      }
    };

    check();
  }, [router]);

  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "SIGNED_IN" && session) {
        router.push("/admin");
      }
    });

    return () => subscription.unsubscribe();
  }, [router]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (email.trim().toLowerCase() !== ALLOWED_EMAIL.toLowerCase()) {
      setError("This email is not authorized for admin access.");
      return;
    }

    setSending(true);

    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo:
          typeof window !== "undefined"
            ? `${window.location.origin}/admin`
            : undefined,
      },
    });

    setSending(false);

    if (error) {
      setError(error.message);
      return;
    }

    setSent(true);
  };

  if (sent) {
    return (
      <div style={pageWrapper}>
        <div style={cardStyle}>
          <h1 style={titleStyle}>Check your email</h1>
          <p style={{ color: "#aaa", fontSize: 14 }}>
            A magic link has been sent to <strong>{email}</strong>. Click it to
            open the admin panel.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div style={pageWrapper}>
      <div style={cardStyle}>
        <h1 style={titleStyle}>Admin Login</h1>

        <form
          onSubmit={handleLogin}
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 14,
          }}
        >
          <input
            type="email"
            placeholder="Admin email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            style={inputStyle}
          />

          <button
            type="submit"
            disabled={sending}
            style={buttonStyle}
          >
            {sending ? "Sending..." : "Send magic link"}
          </button>

          {error && (
            <p style={{ color: "#e0715c", fontSize: 13.5 }}>
              {error}
            </p>
          )}
        </form>
      </div>
    </div>
  );
}

const pageWrapper: React.CSSProperties = {
  minHeight: "100vh",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  background: "#0a0a0a",
  padding: 20,
};

const cardStyle: React.CSSProperties = {
  width: "100%",
  maxWidth: 380,
  padding: 32,
  borderRadius: 12,
  border: "1px solid #262626",
  background: "#111",
};

const titleStyle: React.CSSProperties = {
  marginBottom: 20,
  fontSize: 22,
  color: "#eee",
};

const inputStyle: React.CSSProperties = {
  padding: "11px 13px",
  borderRadius: 8,
  border: "1px solid #333",
  background: "#1a1a1a",
  color: "#eee",
  fontSize: 14,
  outline: "none",
};

const buttonStyle: React.CSSProperties = {
  padding: "11px 16px",
  borderRadius: 8,
  border: "none",
  background: "#eee",
  color: "#111",
  fontSize: 14,
  fontWeight: 600,
  cursor: "pointer",
};