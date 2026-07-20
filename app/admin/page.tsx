"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";

const ADMIN_EMAIL = "krishnamittal0409@gmail.com";

type Message = {
  id: number;
  name: string;
  email: string;
  message: string;
  created_at: string;
};

type LoginAttempt = {
  id: number;
  user_id: string | null;
  email: string;
  created_at: string;
};

type AdminRow = {
  user_id: string;
  email: string;
  is_default: boolean;
};

export default function AdminPage() {
  const router = useRouter();

  const [authorized, setAuthorized] = useState<boolean | null>(null);
  const [isDefaultAdmin, setIsDefaultAdmin] = useState(false);
  const [tab, setTab] = useState<"messages" | "attempts">("messages");

  const [messages, setMessages] = useState<Message[]>([]);
  const [attempts, setAttempts] = useState<LoginAttempt[]>([]);
  const [admins, setAdmins] = useState<AdminRow[]>([]);
  const [dataLoading, setDataLoading] = useState(false);
  const [busyUserId, setBusyUserId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const loadDashboard = useCallback(async (uid: string) => {
    setDataLoading(true);
    setError(null);

    const [msgRes, attemptRes, adminRes] = await Promise.all([
      supabase.from("messages").select("*").order("created_at", { ascending: false }),
      supabase.from("login_attempts").select("*").order("created_at", { ascending: false }),
      supabase.from("admins").select("*"),
    ]);

    if (msgRes.error || attemptRes.error || adminRes.error) {
      setError(
        msgRes.error?.message || attemptRes.error?.message || adminRes.error?.message || "Failed to load dashboard data."
      );
    }

    setMessages(msgRes.data ?? []);
    setAttempts(attemptRes.data ?? []);
    setAdmins(adminRes.data ?? []);
    setIsDefaultAdmin((adminRes.data ?? []).some((a) => a.user_id === uid && a.is_default));
    setDataLoading(false);
  }, []);

  useEffect(() => {
    const init = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.replace("/admin/login");
        return;
      }

      // Log this attempt
      await supabase.from("login_attempts").insert({ user_id: user.id, email: user.email });

      // Check admin status (RLS only returns a row here if this user IS an admin)
      const { data: myAdminRow } = await supabase
        .from("admins")
        .select("*")
        .eq("user_id", user.id)
        .maybeSingle();

      const isAuthorized = !!myAdminRow || user.email?.toLowerCase() === ADMIN_EMAIL.toLowerCase();
      setAuthorized(isAuthorized);

      if (isAuthorized) {
        await loadDashboard(user.id);
      }
    };

    init();
  }, [router, loadDashboard]);

  const signOut = async () => {
    await supabase.auth.signOut();
    router.replace("/");
  };

  const adminMap = new Map(admins.map((a) => [a.user_id, a]));

  const promote = async (userId: string, email: string) => {
    setBusyUserId(userId);
    const { error: err } = await supabase.from("admins").insert({ user_id: userId, email });
    if (err) setError(err.message);
    else setAdmins((prev) => [...prev, { user_id: userId, email, is_default: false }]);
    setBusyUserId(null);
  };

  const demote = async (userId: string) => {
    setBusyUserId(userId);
    const { error: err } = await supabase.from("admins").delete().eq("user_id", userId);
    if (err) setError(err.message);
    else setAdmins((prev) => prev.filter((a) => a.user_id !== userId));
    setBusyUserId(null);
  };

  if (authorized === null) {
    return (
      <div style={pageStyle}>
        <p style={{ color: "var(--text-faint)", fontSize: 14 }}>Loading...</p>
      </div>
    );
  }

  if (!authorized) {
    return (
      <div style={pageStyle}>
        <div className="card" style={{ padding: 40, textAlign: "center", maxWidth: 380 }}>
          <h1 className="section-title" style={{ fontSize: 22, marginBottom: 10 }}>
            Access denied
          </h1>
          <p style={{ color: "var(--text-dim)", fontSize: 14, marginBottom: 24 }}>
            You&apos;re signed in, but this account isn&apos;t authorized to view the admin panel.
          </p>
          <button onClick={signOut} className="btn" style={{ justifyContent: "center", width: "100%" }}>
            Sign out
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg)", color: "var(--text)" }}>
      <div className="container" style={{ paddingTop: 48, paddingBottom: 80 }}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: 16,
            marginBottom: 32,
          }}
        >
          <div>
            <div className="eyebrow">Admin panel</div>
            <h1 className="section-title" style={{ fontSize: 26, marginTop: 8 }}>
              Dashboard
            </h1>
          </div>
          <button onClick={signOut} className="btn">
            Sign out
          </button>
        </div>

        <div style={{ display: "flex", gap: 10, marginBottom: 28 }}>
          <TabButton active={tab === "messages"} onClick={() => setTab("messages")}>
            Messages{" "}
            <span className="tag" style={{ marginLeft: 6 }}>
              {messages.length}
            </span>
          </TabButton>
          <TabButton active={tab === "attempts"} onClick={() => setTab("attempts")}>
            Login attempts{" "}
            <span className="tag" style={{ marginLeft: 6 }}>
              {attempts.length}
            </span>
          </TabButton>
        </div>

        {error && (
          <p role="alert" style={{ color: "#e0715c", fontSize: 13.5, marginBottom: 20 }}>
            {error}
          </p>
        )}

        {dataLoading ? (
          <p style={{ color: "var(--text-faint)", fontSize: 14 }}>Loading data...</p>
        ) : tab === "messages" ? (
          <MessagesList messages={messages} />
        ) : (
          <AttemptsList
            attempts={attempts}
            adminMap={adminMap}
            isDefaultAdmin={isDefaultAdmin}
            busyUserId={busyUserId}
            onPromote={promote}
            onDemote={demote}
          />
        )}
      </div>
    </div>
  );
}

function TabButton({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className="btn"
      style={{
        background: active ? "var(--surface-2)" : "transparent",
        borderColor: active ? "var(--accent)" : "var(--border)",
        color: active ? "var(--text)" : "var(--text-dim)",
      }}
    >
      {children}
    </button>
  );
}

function MessagesList({ messages }: { messages: Message[] }) {
  if (messages.length === 0) {
    return <EmptyState text="No messages yet." />;
  }
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      {messages.map((m) => (
        <div key={m.id} className="card" style={{ padding: 20 }}>
          <div style={{ display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: 8 }}>
            <div style={{ display: "flex", alignItems: "baseline", gap: 10 }}>
              <span style={{ fontWeight: 600, fontSize: 14.5 }}>{m.name}</span>
              <a href={`mailto:${m.email}`} style={{ color: "var(--accent-soft)", fontSize: 13, textDecoration: "none" }}>
                {m.email}
              </a>
            </div>
            <span className="tag mono">{formatDate(m.created_at)}</span>
          </div>
          <p style={{ marginTop: 12, color: "var(--text-dim)", fontSize: 14, lineHeight: 1.6 }}>{m.message}</p>
        </div>
      ))}
    </div>
  );
}

function AttemptsList({
  attempts,
  adminMap,
  isDefaultAdmin,
  busyUserId,
  onPromote,
  onDemote,
}: {
  attempts: LoginAttempt[];
  adminMap: Map<string, AdminRow>;
  isDefaultAdmin: boolean;
  busyUserId: string | null;
  onPromote: (userId: string, email: string) => void;
  onDemote: (userId: string) => void;
}) {
  if (attempts.length === 0) {
    return <EmptyState text="No login attempts recorded yet." />;
  }
  return (
    <div className="card" style={{ padding: 0, overflow: "hidden" }}>
      {attempts.map((a, i) => {
        const adminRow = a.user_id ? adminMap.get(a.user_id) : undefined;
        const isAdmin = !!adminRow;
        const isDefault = !!adminRow?.is_default;
        const busy = busyUserId === a.user_id;

        return (
          <div
            key={a.id}
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              flexWrap: "wrap",
              gap: 12,
              padding: "16px 20px",
              borderTop: i === 0 ? "none" : "1px solid var(--border-soft)",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
              <span style={{ fontSize: 14 }}>{a.email}</span>
              <span className="tag mono">{formatDate(a.created_at)}</span>
              {isDefault && <span className="tag">Permanent admin</span>}
              {isAdmin && !isDefault && <span className="tag">Admin</span>}
            </div>

            {isDefaultAdmin && a.user_id && !isDefault && (
              <button
                className="btn"
                disabled={busy}
                onClick={() => (isAdmin ? onDemote(a.user_id as string) : onPromote(a.user_id as string, a.email))}
                style={{ fontSize: 13, padding: "8px 16px" }}
              >
                {busy ? "..." : isAdmin ? "Remove admin" : "Make admin"}
              </button>
            )}
          </div>
        );
      })}
    </div>
  );
}

function EmptyState({ text }: { text: string }) {
  return (
    <div className="card" style={{ padding: 40, textAlign: "center", color: "var(--text-faint)", fontSize: 14 }}>
      {text}
    </div>
  );
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

const pageStyle: React.CSSProperties = {
  minHeight: "100vh",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  background: "var(--bg)",
};