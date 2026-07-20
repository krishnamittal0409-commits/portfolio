"use client";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useRouter } from "next/navigation";

export default function AdminLogin() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  // If already logged in, skip straight to the dashboard
  useEffect(() => {
    const check = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) router.push("/admin");
    };
    check();
  }, [router]);

  // Listen for auth state changes (fires after clicking the magic link)
  useEffect(() => {
    const { data: listener } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "SIGNED_IN" && session) {
        router.push("/admin");
      }
    });
    return () => listener.subscription.unsubscribe();
  }, [router]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo:
          typeof window !== "undefined"
            ? `${window.location.origin}/admin`
            : undefined,
      },
    });

    if (error) {
      setError(error.message);
      return;
    }
    setSent(true);
  };

  if (sent) {
    return (
      <div style={{ padding: 40, maxWidth: 400, margin: "0 auto" }}>
        <p>Check your email for the magic link. Clicking it will bring you straight to the admin panel.</p>
      </div>
    );
  }

  return (
    <div style={{ padding: 40, maxWidth: 400, margin: "0 auto" }}>
      <h1 style={{ marginBottom: 20 }}>Admin Login</h1>
      <form onSubmit={handleLogin} style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        <input
          type="email"
          placeholder="you@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          style={{ padding: "10px 12px", borderRadius: 8, border: "1px solid #333" }}
        />
        <button type="submit" style={{ padding: "10px 16px", cursor: "pointer" }}>
          Send magic link
        </button>
        {error && <p style={{ color: "#e0715c", fontSize: 13 }}>{error}</p>}
      </form>
    </div>
  );
}