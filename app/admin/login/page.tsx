"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";

export default function AdminLogin() {
  const router = useRouter();
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    const checkSession = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (user) {
        router.replace("/admin");
        return;
      }
      setChecking(false);
    };
    checkSession();
  }, [router]);

  const signInWithGoogle = async () => {
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/admin`,
      },
    });
  };

  if (checking) {
    return (
      <div style={pageStyle}>
        <p style={{ color: "var(--text-faint)", fontSize: 14 }}>Loading...</p>
      </div>
    );
  }

  return (
    <div style={pageStyle}>
      <div className="card" style={{ padding: 40, width: 340, textAlign: "center" }}>
        <div className="eyebrow" style={{ justifyContent: "center" }}>
          Admin
        </div>
        <h1 className="section-title" style={{ fontSize: 22, marginTop: 12, marginBottom: 8 }}>
          Sign in
        </h1>
        <p style={{ color: "var(--text-dim)", fontSize: 13.5, marginBottom: 28 }}>
          Access is restricted to authorized accounts only.
        </p>
        <button
          onClick={signInWithGoogle}
          className="btn btn-primary"
          style={{ justifyContent: "center", width: "100%" }}
        >
          Continue with Google
        </button>
      </div>
    </div>
  );
}

const pageStyle: React.CSSProperties = {
  minHeight: "100vh",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  background: "var(--bg)",
};