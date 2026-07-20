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
  const router = useRouter();

  useEffect(() => {
    const check = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        router.push("/admin/login");
        return;
      }

      const { data, error } = await supabase
        .from("messages")
        .select("*")
        .order("created_at", { ascending: false });

      if (!error) setMessages(data || []);
      setLoading(false);
    };
    check();
  }, [router]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/admin/login");
  };

  if (loading) return <p style={{ padding: 40 }}>Loading...</p>;

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
        <h1>Contact Messages</h1>
        <button onClick={handleLogout} style={{ padding: "8px 16px", cursor: "pointer" }}>
          Log out
        </button>
      </div>

      {messages.length === 0 && <p>No messages yet.</p>}

      {messages.map((m) => (
        <div key={m.id} style={{ borderBottom: "1px solid #333", padding: "16px 0" }}>
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