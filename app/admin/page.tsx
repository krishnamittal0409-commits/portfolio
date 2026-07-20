"use client";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useRouter } from "next/navigation";

type Message = {
  id: string;
  name: string;
  email: string;
  message: string;
  created_at: string;
};

export default function AdminPanel() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");
  const router = useRouter();

  useEffect(() => {
    const check = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();

        if (!session) {
          router.push("/admin/login");
          return;
        }

        const { data, error } = await supabase
          .from("messages")
          .select("*")
          .order("created_at", { ascending: false });

        if (error) {
          setErrorMsg(error.message);
        } else {
          setMessages(data || []);
        }
      } catch (err: any) {
        setErrorMsg(err?.message || "Something went wrong loading messages.");
      } finally {
        setLoading(false);
      }
    };
    check();
  }, [router]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/admin/login");
  };

  if (loading) {
    return (
      <div style={{ padding: 40, textAlign: "center", color: "#888" }}>
        Loading messages...
      </div>
    );
  }

  return (
    <div style={{ padding: 40, maxWidth: 800, margin: "0 auto" }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 24,
        }}
      >
        <h1 style={{ margin: 0 }}>Contact Messages</h1>
        <button onClick={handleLogout} style={logoutButtonStyle}>
          Log out
        </button>
      </div>

      {errorMsg && (
        <p style={{ color: "#e0715c", fontSize: 14, marginBottom: 16 }}>
          Error: {errorMsg}
        </p>
      )}

      {!errorMsg && messages.length === 0 && (
        <p style={{ color: "#888" }}>No messages yet.</p>
      )}

      {messages.map((m) => (
        <div
          key={m.id}
          style={{
            borderBottom: "1px solid #333",
            padding: "16px 0",
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <strong>{m.name}</strong>
            <span style={{ fontSize: 12, color: "#888" }}>
              {new Date(m.created_at).toLocaleString()}
            </span>
          </div>
          <p style={{ fontSize: 13, color: "#888", margin: "4px 0" }}>{m.email}</p>
          <p style={{ marginTop: 8 }}>{m.message}</p>
        </div>
      ))}
    </div>
  );
}

const logoutButtonStyle: React.CSSProperties = {
  padding: "8px 18px",
  borderRadius: 8,
  border: "1px solid #444",
  background: "#1a1a1a",
  color: "#eee",
  fontSize: 13.5,
  cursor: "pointer",
};