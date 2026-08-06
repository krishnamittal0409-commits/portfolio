"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";

const ADMIN_EMAIL = "krishnamittal0409@gmail.com";

type Tab =
  | "messages"
  | "attempts"
  | "profile"
  | "experience"
  | "projects"
  | "skills"
  | "certifications"
  | "education";

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

type Profile = {
  id: number;
  name: string;
  role: string;
  location: string;
  email: string;
  phone: string;
  linkedin: string;
  status: string;
  summary: string;
  build_sheet: { label: string; value: string }[];
};

type ExperienceItem = {
  id: string;
  company: string;
  role: string;
  period: string;
  points: string[];
  sort_order: number;
};

type Project = {
  id: string;
  slug: string;
  code: string;
  name: string;
  tagline: string;
  stack: string[];
  points: string[];
  link: string | null;
  sort_order: number;
};

type SkillGroup = {
  id: string;
  label: string;
  items: string[];
  sort_order: number;
};

type Certification = {
  id: string;
  name: string;
  issuer: string;
  year: string;
  url: string | null;
  category: string;
  sort_order: number;
};

type EducationItem = {
  id: string;
  school: string;
  program: string;
  period: string;
  sort_order: number;
};

export default function AdminPage() {
  const router = useRouter();

  const [authorized, setAuthorized] = useState<boolean | null>(null);
  const [isDefaultAdmin, setIsDefaultAdmin] = useState(false);
  const [tab, setTab] = useState<Tab>("messages");

  const [messages, setMessages] = useState<Message[]>([]);
  const [attempts, setAttempts] = useState<LoginAttempt[]>([]);
  const [admins, setAdmins] = useState<AdminRow[]>([]);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [experience, setExperience] = useState<ExperienceItem[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [skillGroups, setSkillGroups] = useState<SkillGroup[]>([]);
  const [certifications, setCertifications] = useState<Certification[]>([]);
  const [education, setEducation] = useState<EducationItem[]>([]);

  const [dataLoading, setDataLoading] = useState(false);
  const [busyUserId, setBusyUserId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Tells the public homepage's server-rendered cache to refresh.
  // Fire-and-forget: we don't want a slow/failed revalidate call to block
  // the admin UI from showing its own success state.
const revalidateHome = () => {
  fetch("/api/revalidate", {
    method: "POST",
    headers: { "x-revalidate-secret": process.env.NEXT_PUBLIC_REVALIDATE_SECRET ?? "" },
  }).catch(() => {});
};

  const loadDashboard = useCallback(async (uid: string) => {
    setDataLoading(true);
    setError(null);

    const [
      msgRes,
      attemptRes,
      adminRes,
      profileRes,
      expRes,
      projRes,
      skillRes,
      certRes,
      eduRes,
    ] = await Promise.all([
      supabase.from("messages").select("*").order("created_at", { ascending: false }),
      supabase.from("login_attempts").select("*").order("created_at", { ascending: false }),
      supabase.from("admins").select("*"),
      supabase.from("profile").select("*").eq("id", 1).maybeSingle(),
      supabase.from("experience").select("*").order("sort_order", { ascending: true }),
      supabase.from("projects").select("*").order("sort_order", { ascending: true }),
      supabase.from("skill_groups").select("*").order("sort_order", { ascending: true }),
      supabase.from("certifications").select("*").order("sort_order", { ascending: true }),
      supabase.from("education").select("*").order("sort_order", { ascending: true }),
    ]);

    const firstError =
      msgRes.error?.message ||
      attemptRes.error?.message ||
      adminRes.error?.message ||
      profileRes.error?.message ||
      expRes.error?.message ||
      projRes.error?.message ||
      skillRes.error?.message ||
      certRes.error?.message ||
      eduRes.error?.message;

    if (firstError) setError(firstError);

    setMessages(msgRes.data ?? []);
    setAttempts(attemptRes.data ?? []);
    setAdmins(adminRes.data ?? []);
    setIsDefaultAdmin((adminRes.data ?? []).some((a) => a.user_id === uid && a.is_default));
    setProfile(profileRes.data ?? null);
    setExperience(expRes.data ?? []);
    setProjects(projRes.data ?? []);
    setSkillGroups(skillRes.data ?? []);
    setCertifications(certRes.data ?? []);
    setEducation(eduRes.data ?? []);
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

      await supabase.from("login_attempts").insert({ user_id: user.id, email: user.email });

      const { data: myAdminRow } = await supabase
        .from("admins")
        .select("*")
        .eq("user_id", user.id)
        .maybeSingle();

      const isAuthorized =
        !!myAdminRow || user.email?.toLowerCase() === ADMIN_EMAIL.toLowerCase();
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

  const showSuccess = (msg: string) => {
    setSuccess(msg);
    setTimeout(() => setSuccess(null), 2500);
  };

  // ---------- Profile ----------
  const saveProfile = async (data: Partial<Profile>) => {
    setSaving(true);
    setError(null);
    const { error: err } = await supabase.from("profile").upsert({ id: 1, ...data });
    if (err) setError(err.message);
    else {
      setProfile((prev) => (prev ? { ...prev, ...data } : (data as Profile)));
      showSuccess("Profile saved");
      revalidateHome();
    }
    setSaving(false);
  };

  // ---------- Experience ----------
  const saveExperience = async (item: ExperienceItem) => {
    setSaving(true);
    setError(null);
    const { error: err } = await supabase.from("experience").upsert(item);
    if (err) setError(err.message);
    else {
      setExperience((prev) => {
        const exists = prev.some((x) => x.id === item.id);
        return exists
          ? prev.map((x) => (x.id === item.id ? item : x)).sort((a, b) => a.sort_order - b.sort_order)
          : [...prev, item].sort((a, b) => a.sort_order - b.sort_order);
      });
      showSuccess("Experience saved");
      revalidateHome();
    }
    setSaving(false);
  };

  const deleteExperience = async (id: string) => {
    if (!confirm("Delete this experience?")) return;
    const { error: err } = await supabase.from("experience").delete().eq("id", id);
    if (err) setError(err.message);
    else {
      setExperience((prev) => prev.filter((x) => x.id !== id));
      revalidateHome();
    }
  };

  // ---------- Projects ----------
  const saveProject = async (item: Project) => {
    setSaving(true);
    setError(null);
    const { error: err } = await supabase.from("projects").upsert(item);
    if (err) setError(err.message);
    else {
      setProjects((prev) => {
        const exists = prev.some((x) => x.id === item.id);
        return exists
          ? prev.map((x) => (x.id === item.id ? item : x)).sort((a, b) => a.sort_order - b.sort_order)
          : [...prev, item].sort((a, b) => a.sort_order - b.sort_order);
      });
      showSuccess("Project saved");
      revalidateHome();
    }
    setSaving(false);
  };

  const deleteProject = async (id: string) => {
    if (!confirm("Delete this project?")) return;
    const { error: err } = await supabase.from("projects").delete().eq("id", id);
    if (err) setError(err.message);
    else {
      setProjects((prev) => prev.filter((x) => x.id !== id));
      revalidateHome();
    }
  };

  // ---------- Skills ----------
  const saveSkillGroup = async (item: SkillGroup) => {
    setSaving(true);
    setError(null);
    const { error: err } = await supabase.from("skill_groups").upsert(item);
    if (err) setError(err.message);
    else {
      setSkillGroups((prev) => {
        const exists = prev.some((x) => x.id === item.id);
        return exists
          ? prev.map((x) => (x.id === item.id ? item : x)).sort((a, b) => a.sort_order - b.sort_order)
          : [...prev, item].sort((a, b) => a.sort_order - b.sort_order);
      });
      showSuccess("Skill group saved");
      revalidateHome();
    }
    setSaving(false);
  };

  const deleteSkillGroup = async (id: string) => {
    if (!confirm("Delete this skill group?")) return;
    const { error: err } = await supabase.from("skill_groups").delete().eq("id", id);
    if (err) setError(err.message);
    else {
      setSkillGroups((prev) => prev.filter((x) => x.id !== id));
      revalidateHome();
    }
  };

  // ---------- Certifications ----------
  const saveCertification = async (item: Certification) => {
    setSaving(true);
    setError(null);
    const { error: err } = await supabase.from("certifications").upsert(item);
    if (err) setError(err.message);
    else {
      setCertifications((prev) => {
        const exists = prev.some((x) => x.id === item.id);
        return exists
          ? prev.map((x) => (x.id === item.id ? item : x)).sort((a, b) => a.sort_order - b.sort_order)
          : [...prev, item].sort((a, b) => a.sort_order - b.sort_order);
      });
      showSuccess("Certification saved");
      revalidateHome();
    }
    setSaving(false);
  };

  const deleteCertification = async (id: string) => {
    if (!confirm("Delete this certification?")) return;
    const { error: err } = await supabase.from("certifications").delete().eq("id", id);
    if (err) setError(err.message);
    else {
      setCertifications((prev) => prev.filter((x) => x.id !== id));
      revalidateHome();
    }
  };

  // ---------- Education ----------
  const saveEducation = async (item: EducationItem) => {
    setSaving(true);
    setError(null);
    const { error: err } = await supabase.from("education").upsert(item);
    if (err) setError(err.message);
    else {
      setEducation((prev) => {
        const exists = prev.some((x) => x.id === item.id);
        return exists
          ? prev.map((x) => (x.id === item.id ? item : x)).sort((a, b) => a.sort_order - b.sort_order)
          : [...prev, item].sort((a, b) => a.sort_order - b.sort_order);
      });
      showSuccess("Education saved");
      revalidateHome();
    }
    setSaving(false);
  };

  const deleteEducation = async (id: string) => {
    if (!confirm("Delete this education entry?")) return;
    const { error: err } = await supabase.from("education").delete().eq("id", id);
    if (err) setError(err.message);
    else {
      setEducation((prev) => prev.filter((x) => x.id !== id));
      revalidateHome();
    }
  };

  // ---------- Render ----------
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

  const tabs: { id: Tab; label: string; count?: number }[] = [
    { id: "messages", label: "Messages", count: messages.length },
    { id: "attempts", label: "Login attempts", count: attempts.length },
    { id: "profile", label: "Profile" },
    { id: "experience", label: "Experience", count: experience.length },
    { id: "projects", label: "Projects", count: projects.length },
    { id: "skills", label: "Skills", count: skillGroups.length },
    { id: "certifications", label: "Certifications", count: certifications.length },
    { id: "education", label: "Education", count: education.length },
  ];

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

        <div style={{ display: "flex", gap: 8, marginBottom: 28, flexWrap: "wrap" }}>
          {tabs.map((t) => (
            <TabButton key={t.id} active={tab === t.id} onClick={() => setTab(t.id)}>
              {t.label}
              {t.count !== undefined && (
                <span className="tag" style={{ marginLeft: 6 }}>
                  {t.count}
                </span>
              )}
            </TabButton>
          ))}
        </div>

        {error && (
          <p role="alert" style={{ color: "#e0715c", fontSize: 13.5, marginBottom: 16 }}>
            {error}
          </p>
        )}
        {success && (
          <p role="status" style={{ color: "var(--success)", fontSize: 13.5, marginBottom: 16 }}>
            {success}
          </p>
        )}

        {dataLoading ? (
          <p style={{ color: "var(--text-faint)", fontSize: 14 }}>Loading data...</p>
        ) : (
          <>
            {tab === "messages" && <MessagesList messages={messages} />}
            {tab === "attempts" && (
              <AttemptsList
                attempts={attempts}
                adminMap={adminMap}
                isDefaultAdmin={isDefaultAdmin}
                busyUserId={busyUserId}
                onPromote={promote}
                onDemote={demote}
              />
            )}
            {tab === "profile" && (
              <ProfileEditor profile={profile} saving={saving} onSave={saveProfile} />
            )}
            {tab === "experience" && (
              <ExperienceEditor
                items={experience}
                saving={saving}
                onSave={saveExperience}
                onDelete={deleteExperience}
              />
            )}
            {tab === "projects" && (
              <ProjectsEditor
                items={projects}
                saving={saving}
                onSave={saveProject}
                onDelete={deleteProject}
              />
            )}
            {tab === "skills" && (
              <SkillsEditor
                items={skillGroups}
                saving={saving}
                onSave={saveSkillGroup}
                onDelete={deleteSkillGroup}
              />
            )}
            {tab === "certifications" && (
              <CertificationsEditor
                items={certifications}
                saving={saving}
                onSave={saveCertification}
                onDelete={deleteCertification}
              />
            )}
            {tab === "education" && (
              <EducationEditor
                items={education}
                saving={saving}
                onSave={saveEducation}
                onDelete={deleteEducation}
              />
            )}
          </>
        )}
      </div>
    </div>
  );
}

/* ==================== Shared UI ==================== */

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
        fontSize: 13,
        padding: "8px 14px",
      }}
    >
      {children}
    </button>
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

const inputStyle: React.CSSProperties = {
  background: "var(--surface-2)",
  border: "1px solid var(--border)",
  borderRadius: 8,
  padding: "10px 12px",
  color: "var(--text)",
  fontSize: 14,
  outline: "none",
  fontFamily: "var(--font-body)",
  width: "100%",
};

const labelStyle: React.CSSProperties = {
  fontSize: 13,
  color: "var(--text-dim)",
  marginBottom: 6,
  display: "block",
};

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: 14 }}>
      <label style={labelStyle}>{label}</label>
      {children}
    </div>
  );
}

/* ==================== Messages ==================== */

function MessagesList({ messages }: { messages: Message[] }) {
  if (messages.length === 0) return <EmptyState text="No messages yet." />;
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      {messages.map((m) => (
        <div key={m.id} className="card" style={{ padding: 20 }}>
          <div style={{ display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: 8 }}>
            <div style={{ display: "flex", alignItems: "baseline", gap: 10 }}>
              <span style={{ fontWeight: 600, fontSize: 14.5 }}>{m.name}</span>
              <a
                href={`mailto:${m.email}`}
                style={{ color: "var(--accent-soft)", fontSize: 13, textDecoration: "none" }}
              >
                {m.email}
              </a>
            </div>
            <span className="tag mono">{formatDate(m.created_at)}</span>
          </div>
          <p style={{ marginTop: 12, color: "var(--text-dim)", fontSize: 14, lineHeight: 1.6 }}>
            {m.message}
          </p>
        </div>
      ))}
    </div>
  );
}

/* ==================== Login attempts ==================== */

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
  if (attempts.length === 0) return <EmptyState text="No login attempts recorded yet." />;
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
                onClick={() =>
                  isAdmin
                    ? onDemote(a.user_id as string)
                    : onPromote(a.user_id as string, a.email)
                }
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

/* ==================== Profile ==================== */

function ProfileEditor({
  profile,
  saving,
  onSave,
}: {
  profile: Profile | null;
  saving: boolean;
  onSave: (data: Partial<Profile>) => void;
}) {
  const [form, setForm] = useState({
    name: profile?.name ?? "",
    role: profile?.role ?? "",
    location: profile?.location ?? "",
    email: profile?.email ?? "",
    phone: profile?.phone ?? "",
    linkedin: profile?.linkedin ?? "",
    status: profile?.status ?? "",
    summary: profile?.summary ?? "",
    build_sheet: profile?.build_sheet ?? [],
  });

  useEffect(() => {
    if (profile) {
      setForm({
        name: profile.name ?? "",
        role: profile.role ?? "",
        location: profile.location ?? "",
        email: profile.email ?? "",
        phone: profile.phone ?? "",
        linkedin: profile.linkedin ?? "",
        status: profile.status ?? "",
        summary: profile.summary ?? "",
        build_sheet: profile.build_sheet ?? [],
      });
    }
  }, [profile]);

  const update = (key: string, value: string) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  return (
    <div className="card" style={{ padding: 24 }}>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
        <Field label="Name">
          <input style={inputStyle} value={form.name} onChange={(e) => update("name", e.target.value)} />
        </Field>
        <Field label="Role">
          <input style={inputStyle} value={form.role} onChange={(e) => update("role", e.target.value)} />
        </Field>
        <Field label="Location">
          <input style={inputStyle} value={form.location} onChange={(e) => update("location", e.target.value)} />
        </Field>
        <Field label="Status">
          <input style={inputStyle} value={form.status} onChange={(e) => update("status", e.target.value)} />
        </Field>
        <Field label="Email">
          <input style={inputStyle} value={form.email} onChange={(e) => update("email", e.target.value)} />
        </Field>
        <Field label="Phone">
          <input style={inputStyle} value={form.phone} onChange={(e) => update("phone", e.target.value)} />
        </Field>
        <Field label="LinkedIn URL">
          <input style={inputStyle} value={form.linkedin} onChange={(e) => update("linkedin", e.target.value)} />
        </Field>
      </div>
      <Field label="Summary">
        <textarea
          style={{ ...inputStyle, minHeight: 120, resize: "vertical" }}
          value={form.summary}
          onChange={(e) => update("summary", e.target.value)}
        />
      </Field>
      <button
        className="btn btn-primary"
        disabled={saving}
        onClick={() => onSave(form)}
        style={{ marginTop: 8 }}
      >
        {saving ? "Saving..." : "Save profile"}
      </button>
    </div>
  );
}

/* ==================== Experience ==================== */

function ExperienceEditor({
  items,
  saving,
  onSave,
  onDelete,
}: {
  items: ExperienceItem[];
  saving: boolean;
  onSave: (item: ExperienceItem) => void;
  onDelete: (id: string) => void;
}) {
  const blank = (): ExperienceItem => ({
    id: crypto.randomUUID(),
    company: "",
    role: "",
    period: "",
    points: [""],
    sort_order: items.length,
  });

  const [editing, setEditing] = useState<ExperienceItem | null>(null);
  const [sortDrafts, setSortDrafts] = useState<Record<string, number>>({});

  useEffect(() => {
    const next: Record<string, number> = {};
    items.forEach((item) => {
      next[item.id] = item.sort_order;
    });
    setSortDrafts(next);
  }, [items]);

  const handleSortChange = (id: string, value: string) => {
    const num = Number(value);
    if (Number.isNaN(num)) return;
    setSortDrafts((prev) => ({ ...prev, [id]: num }));
  };

  const saveSortOrder = (item: ExperienceItem) => {
    const newOrder = sortDrafts[item.id];
    if (newOrder === undefined || newOrder === item.sort_order) return;
    onSave({ ...item, sort_order: newOrder });
  };

  return (
    <div>
      <button className="btn btn-primary" style={{ marginBottom: 16 }} onClick={() => setEditing(blank())}>
        + Add experience
      </button>

      {editing && (
        <div className="card" style={{ padding: 20, marginBottom: 20 }}>
          <Field label="Company">
            <input
              style={inputStyle}
              value={editing.company}
              onChange={(e) => setEditing({ ...editing, company: e.target.value })}
            />
          </Field>
          <Field label="Role">
            <input
              style={inputStyle}
              value={editing.role}
              onChange={(e) => setEditing({ ...editing, role: e.target.value })}
            />
          </Field>
          <Field label="Period">
            <input
              style={inputStyle}
              value={editing.period}
              onChange={(e) => setEditing({ ...editing, period: e.target.value })}
            />
          </Field>
          <Field label="Points (one per line)">
            <textarea
              style={{ ...inputStyle, minHeight: 100, resize: "vertical" }}
              value={editing.points.join("\n")}
              onChange={(e) => setEditing({ ...editing, points: e.target.value.split("\n") })}
            />
          </Field>
          <Field label="Sort order">
            <input
              type="number"
              style={inputStyle}
              value={editing.sort_order}
              onChange={(e) => setEditing({ ...editing, sort_order: Number(e.target.value) })}
            />
          </Field>
          <div style={{ display: "flex", gap: 10 }}>
            <button
              className="btn btn-primary"
              disabled={saving}
              onClick={() => {
                onSave({
                  ...editing,
                  points: editing.points.map((p) => p.trim()).filter(Boolean),
                });
                setEditing(null);
              }}
            >
              {saving ? "Saving..." : "Save"}
            </button>
            <button className="btn" onClick={() => setEditing(null)}>
              Cancel
            </button>
          </div>
        </div>
      )}

      {items.length === 0 && !editing ? (
        <EmptyState text="No experience entries yet." />
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {items.map((item) => {
            const draft = sortDrafts[item.id] ?? item.sort_order;
            const changed = draft !== item.sort_order;

            return (
              <div key={item.id} className="card" style={{ padding: 16 }}>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    gap: 12,
                    flexWrap: "wrap",
                    alignItems: "center",
                  }}
                >
                  <div style={{ flex: 1, minWidth: 180 }}>
                    <strong>{item.role}</strong> at {item.company}
                    <div style={{ color: "var(--text-faint)", fontSize: 13, marginTop: 4 }}>{item.period}</div>
                  </div>

                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <span style={{ fontSize: 12, color: "var(--text-faint)" }}>Sort</span>
                    <input
                      type="number"
                      value={draft}
                      onChange={(e) => handleSortChange(item.id, e.target.value)}
                      style={{ ...inputStyle, width: 72, padding: "6px 8px", textAlign: "center" }}
                    />
                    {changed && (
                      <button
                        className="btn btn-primary"
                        style={{ fontSize: 12, padding: "6px 10px" }}
                        disabled={saving}
                        onClick={() => saveSortOrder(item)}
                      >
                        {saving ? "..." : "Save"}
                      </button>
                    )}
                  </div>

                  <div style={{ display: "flex", gap: 8 }}>
                    <button className="btn" style={{ fontSize: 13, padding: "6px 12px" }} onClick={() => setEditing(item)}>
                      Edit
                    </button>
                    <button
                      className="btn"
                      style={{ fontSize: 13, padding: "6px 12px", color: "#e0715c" }}
                      onClick={() => onDelete(item.id)}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

/* ==================== Projects ==================== */

function ProjectsEditor({
  items,
  saving,
  onSave,
  onDelete,
}: {
  items: Project[];
  saving: boolean;
  onSave: (item: Project) => void;
  onDelete: (id: string) => void;
}) {
  const blank = (): Project => ({
    id: crypto.randomUUID(),
    slug: "",
    code: "",
    name: "",
    tagline: "",
    stack: [],
    points: [""],
    link: null,
    sort_order: items.length,
  });

  const [editing, setEditing] = useState<Project | null>(null);
  const [sortDrafts, setSortDrafts] = useState<Record<string, number>>({});

  useEffect(() => {
    const next: Record<string, number> = {};
    items.forEach((item) => {
      next[item.id] = item.sort_order;
    });
    setSortDrafts(next);
  }, [items]);

  const handleSortChange = (id: string, value: string) => {
    const num = Number(value);
    if (Number.isNaN(num)) return;
    setSortDrafts((prev) => ({ ...prev, [id]: num }));
  };

  const saveSortOrder = (item: Project) => {
    const newOrder = sortDrafts[item.id];
    if (newOrder === undefined || newOrder === item.sort_order) return;
    onSave({ ...item, sort_order: newOrder });
  };

  return (
    <div>
      <button className="btn btn-primary" style={{ marginBottom: 16 }} onClick={() => setEditing(blank())}>
        + Add project
      </button>

      {editing && (
        <div className="card" style={{ padding: 20, marginBottom: 20 }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <Field label="Name">
              <input
                style={inputStyle}
                value={editing.name}
                onChange={(e) => setEditing({ ...editing, name: e.target.value })}
              />
            </Field>
            <Field label="Slug (unique)">
              <input
                style={inputStyle}
                value={editing.slug}
                onChange={(e) => setEditing({ ...editing, slug: e.target.value })}
              />
            </Field>
            <Field label="Code (e.g. PRJ-01)">
              <input
                style={inputStyle}
                value={editing.code}
                onChange={(e) => setEditing({ ...editing, code: e.target.value })}
              />
            </Field>
            <Field label="Tagline">
              <input
                style={inputStyle}
                value={editing.tagline}
                onChange={(e) => setEditing({ ...editing, tagline: e.target.value })}
              />
            </Field>
            <Field label="Live link (optional)">
              <input
                style={inputStyle}
                value={editing.link ?? ""}
                onChange={(e) => setEditing({ ...editing, link: e.target.value || null })}
              />
            </Field>
            <Field label="Sort order">
              <input
                type="number"
                style={inputStyle}
                value={editing.sort_order}
                onChange={(e) => setEditing({ ...editing, sort_order: Number(e.target.value) })}
              />
            </Field>
          </div>
          <Field label="Stack (comma separated)">
            <input
              style={inputStyle}
              value={editing.stack.join(", ")}
              onChange={(e) =>
                setEditing({
                  ...editing,
                  stack: e.target.value.split(",").map((s) => s.trim()).filter(Boolean),
                })
              }
            />
          </Field>
          <Field label="Points (one per line)">
            <textarea
              style={{ ...inputStyle, minHeight: 100, resize: "vertical" }}
              value={editing.points.join("\n")}
              onChange={(e) => setEditing({ ...editing, points: e.target.value.split("\n") })}
            />
          </Field>
          <div style={{ display: "flex", gap: 10 }}>
            <button
              className="btn btn-primary"
              disabled={saving}
              onClick={() => {
                onSave({
                  ...editing,
                  points: editing.points.map((p) => p.trim()).filter(Boolean),
                });
                setEditing(null);
              }}
            >
              {saving ? "Saving..." : "Save"}
            </button>
            <button className="btn" onClick={() => setEditing(null)}>
              Cancel
            </button>
          </div>
        </div>
      )}

      {items.length === 0 && !editing ? (
        <EmptyState text="No projects yet." />
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {items.map((item) => {
            const draft = sortDrafts[item.id] ?? item.sort_order;
            const changed = draft !== item.sort_order;

            return (
              <div key={item.id} className="card" style={{ padding: 16 }}>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    gap: 12,
                    flexWrap: "wrap",
                    alignItems: "center",
                  }}
                >
                  <div style={{ flex: 1, minWidth: 180 }}>
                    <strong>{item.name}</strong>
                    <div style={{ color: "var(--text-faint)", fontSize: 13, marginTop: 4 }}>
                      {item.code} · {item.tagline}
                    </div>
                  </div>

                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <span style={{ fontSize: 12, color: "var(--text-faint)" }}>Sort</span>
                    <input
                      type="number"
                      value={draft}
                      onChange={(e) => handleSortChange(item.id, e.target.value)}
                      style={{ ...inputStyle, width: 72, padding: "6px 8px", textAlign: "center" }}
                    />
                    {changed && (
                      <button
                        className="btn btn-primary"
                        style={{ fontSize: 12, padding: "6px 10px" }}
                        disabled={saving}
                        onClick={() => saveSortOrder(item)}
                      >
                        {saving ? "..." : "Save"}
                      </button>
                    )}
                  </div>

                  <div style={{ display: "flex", gap: 8 }}>
                    <button className="btn" style={{ fontSize: 13, padding: "6px 12px" }} onClick={() => setEditing(item)}>
                      Edit
                    </button>
                    <button
                      className="btn"
                      style={{ fontSize: 13, padding: "6px 12px", color: "#e0715c" }}
                      onClick={() => onDelete(item.id)}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

/* ==================== Skills ==================== */

function SkillsEditor({
  items,
  saving,
  onSave,
  onDelete,
}: {
  items: SkillGroup[];
  saving: boolean;
  onSave: (item: SkillGroup) => void;
  onDelete: (id: string) => void;
}) {
  const blank = (): SkillGroup => ({
    id: crypto.randomUUID(),
    label: "",
    items: [],
    sort_order: items.length,
  });

  const [editing, setEditing] = useState<SkillGroup | null>(null);
  const [sortDrafts, setSortDrafts] = useState<Record<string, number>>({});

  useEffect(() => {
    const next: Record<string, number> = {};
    items.forEach((item) => {
      next[item.id] = item.sort_order;
    });
    setSortDrafts(next);
  }, [items]);

  const handleSortChange = (id: string, value: string) => {
    const num = Number(value);
    if (Number.isNaN(num)) return;
    setSortDrafts((prev) => ({ ...prev, [id]: num }));
  };

  const saveSortOrder = (item: SkillGroup) => {
    const newOrder = sortDrafts[item.id];
    if (newOrder === undefined || newOrder === item.sort_order) return;
    onSave({ ...item, sort_order: newOrder });
  };

  return (
    <div>
      <button className="btn btn-primary" style={{ marginBottom: 16 }} onClick={() => setEditing(blank())}>
        + Add skill group
      </button>

      {editing && (
        <div className="card" style={{ padding: 20, marginBottom: 20 }}>
          <Field label="Label">
            <input
              style={inputStyle}
              value={editing.label}
              onChange={(e) => setEditing({ ...editing, label: e.target.value })}
            />
          </Field>
          <Field label="Items (comma separated)">
            <input
              style={inputStyle}
              value={editing.items.join(", ")}
              onChange={(e) =>
                setEditing({
                  ...editing,
                  items: e.target.value.split(",").map((s) => s.trim()).filter(Boolean),
                })
              }
            />
          </Field>
          <Field label="Sort order">
            <input
              type="number"
              style={inputStyle}
              value={editing.sort_order}
              onChange={(e) => setEditing({ ...editing, sort_order: Number(e.target.value) })}
            />
          </Field>
          <div style={{ display: "flex", gap: 10 }}>
            <button
              className="btn btn-primary"
              disabled={saving}
              onClick={() => {
                onSave(editing);
                setEditing(null);
              }}
            >
              {saving ? "Saving..." : "Save"}
            </button>
            <button className="btn" onClick={() => setEditing(null)}>
              Cancel
            </button>
          </div>
        </div>
      )}

      {items.length === 0 && !editing ? (
        <EmptyState text="No skill groups yet." />
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {items.map((item) => {
            const draft = sortDrafts[item.id] ?? item.sort_order;
            const changed = draft !== item.sort_order;

            return (
              <div key={item.id} className="card" style={{ padding: 16 }}>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    gap: 12,
                    flexWrap: "wrap",
                    alignItems: "center",
                  }}
                >
                  <div style={{ flex: 1, minWidth: 180 }}>
                    <strong>{item.label}</strong>
                    <div style={{ color: "var(--text-faint)", fontSize: 13, marginTop: 4 }}>
                      {item.items.join(" · ")}
                    </div>
                  </div>

                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <span style={{ fontSize: 12, color: "var(--text-faint)" }}>Sort</span>
                    <input
                      type="number"
                      value={draft}
                      onChange={(e) => handleSortChange(item.id, e.target.value)}
                      style={{ ...inputStyle, width: 72, padding: "6px 8px", textAlign: "center" }}
                    />
                    {changed && (
                      <button
                        className="btn btn-primary"
                        style={{ fontSize: 12, padding: "6px 10px" }}
                        disabled={saving}
                        onClick={() => saveSortOrder(item)}
                      >
                        {saving ? "..." : "Save"}
                      </button>
                    )}
                  </div>

                  <div style={{ display: "flex", gap: 8 }}>
                    <button className="btn" style={{ fontSize: 13, padding: "6px 12px" }} onClick={() => setEditing(item)}>
                      Edit
                    </button>
                    <button
                      className="btn"
                      style={{ fontSize: 13, padding: "6px 12px", color: "#e0715c" }}
                      onClick={() => onDelete(item.id)}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

/* ==================== Certifications ==================== */

function CertificationsEditor({
  items,
  saving,
  onSave,
  onDelete,
}: {
  items: Certification[];
  saving: boolean;
  onSave: (item: Certification) => void;
  onDelete: (id: string) => void;
}) {
  const blank = (): Certification => ({
    id: crypto.randomUUID(),
    name: "",
    issuer: "",
    year: "",
    url: null,
    category: "",
    sort_order: items.length,
  });

  const [editing, setEditing] = useState<Certification | null>(null);
  const [sortDrafts, setSortDrafts] = useState<Record<string, number>>({});

  useEffect(() => {
    const next: Record<string, number> = {};
    items.forEach((item) => {
      next[item.id] = item.sort_order;
    });
    setSortDrafts(next);
  }, [items]);

  const handleSortChange = (id: string, value: string) => {
    const num = Number(value);
    if (Number.isNaN(num)) return;
    setSortDrafts((prev) => ({ ...prev, [id]: num }));
  };

  const saveSortOrder = (item: Certification) => {
    const newOrder = sortDrafts[item.id];
    if (newOrder === undefined || newOrder === item.sort_order) return;
    onSave({ ...item, sort_order: newOrder });
  };

  // Existing categories, derived from current items — used to power the
  // datalist so you can either pick one that already exists or just type
  // a brand new category name and it'll be created on save.
  const existingCategories = Array.from(
    new Set(items.map((i) => i.category).filter(Boolean))
  ).sort();

  return (
    <div>
      <button className="btn btn-primary" style={{ marginBottom: 16 }} onClick={() => setEditing(blank())}>
        + Add certification
      </button>

      {editing && (
        <div className="card" style={{ padding: 20, marginBottom: 20 }}>
          <Field label="Name">
            <input
              style={inputStyle}
              value={editing.name}
              onChange={(e) => setEditing({ ...editing, name: e.target.value })}
            />
          </Field>
          <Field label="Issuer">
            <input
              style={inputStyle}
              value={editing.issuer}
              onChange={(e) => setEditing({ ...editing, issuer: e.target.value })}
            />
          </Field>
          <Field label="Year">
            <input
              style={inputStyle}
              value={editing.year}
              onChange={(e) => setEditing({ ...editing, year: e.target.value })}
            />
          </Field>
          <Field label="Category (pick an existing one or type a new one)">
            <input
              style={inputStyle}
              list="cert-category-options"
              value={editing.category}
              onChange={(e) => setEditing({ ...editing, category: e.target.value })}
              placeholder="e.g. Development, Marketing & SEO, AI & Productivity..."
            />
            <datalist id="cert-category-options">
              {existingCategories.map((c) => (
                <option key={c} value={c} />
              ))}
            </datalist>
          </Field>
          <Field label="URL (optional)">
            <input
              style={inputStyle}
              value={editing.url ?? ""}
              onChange={(e) => setEditing({ ...editing, url: e.target.value || null })}
            />
          </Field>
          <Field label="Sort order">
            <input
              type="number"
              style={inputStyle}
              value={editing.sort_order}
              onChange={(e) => setEditing({ ...editing, sort_order: Number(e.target.value) })}
            />
          </Field>
          <div style={{ display: "flex", gap: 10 }}>
            <button
              className="btn btn-primary"
              disabled={saving || !editing.category.trim()}
              onClick={() => {
                onSave({ ...editing, category: editing.category.trim() });
                setEditing(null);
              }}
            >
              {saving ? "Saving..." : "Save"}
            </button>
            <button className="btn" onClick={() => setEditing(null)}>
              Cancel
            </button>
          </div>
        </div>
      )}

      {items.length === 0 && !editing ? (
        <EmptyState text="No certifications yet." />
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {items.map((item) => {
            const draft = sortDrafts[item.id] ?? item.sort_order;
            const changed = draft !== item.sort_order;

            return (
              <div key={item.id} className="card" style={{ padding: 16 }}>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    gap: 12,
                    flexWrap: "wrap",
                    alignItems: "center",
                  }}
                >
                  <div style={{ flex: 1, minWidth: 180 }}>
                    <strong>{item.name}</strong>
                    <div style={{ color: "var(--text-faint)", fontSize: 13, marginTop: 4 }}>
                      {item.issuer} · {item.year}
                      {item.category && (
                        <span className="tag" style={{ marginLeft: 8 }}>
                          {item.category}
                        </span>
                      )}
                    </div>
                  </div>

                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <span style={{ fontSize: 12, color: "var(--text-faint)" }}>Sort</span>
                    <input
                      type="number"
                      value={draft}
                      onChange={(e) => handleSortChange(item.id, e.target.value)}
                      style={{ ...inputStyle, width: 72, padding: "6px 8px", textAlign: "center" }}
                    />
                    {changed && (
                      <button
                        className="btn btn-primary"
                        style={{ fontSize: 12, padding: "6px 10px" }}
                        disabled={saving}
                        onClick={() => saveSortOrder(item)}
                      >
                        {saving ? "..." : "Save"}
                      </button>
                    )}
                  </div>

                  <div style={{ display: "flex", gap: 8 }}>
                    <button className="btn" style={{ fontSize: 13, padding: "6px 12px" }} onClick={() => setEditing(item)}>
                      Edit
                    </button>
                    <button
                      className="btn"
                      style={{ fontSize: 13, padding: "6px 12px", color: "#e0715c" }}
                      onClick={() => onDelete(item.id)}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

/* ==================== Education ==================== */

function EducationEditor({
  items,
  saving,
  onSave,
  onDelete,
}: {
  items: EducationItem[];
  saving: boolean;
  onSave: (item: EducationItem) => void;
  onDelete: (id: string) => void;
}) {
  const blank = (): EducationItem => ({
    id: crypto.randomUUID(),
    school: "",
    program: "",
    period: "",
    sort_order: items.length,
  });

  const [editing, setEditing] = useState<EducationItem | null>(null);
  const [sortDrafts, setSortDrafts] = useState<Record<string, number>>({});

  useEffect(() => {
    const next: Record<string, number> = {};
    items.forEach((item) => {
      next[item.id] = item.sort_order;
    });
    setSortDrafts(next);
  }, [items]);

  const handleSortChange = (id: string, value: string) => {
    const num = Number(value);
    if (Number.isNaN(num)) return;
    setSortDrafts((prev) => ({ ...prev, [id]: num }));
  };

  const saveSortOrder = (item: EducationItem) => {
    const newOrder = sortDrafts[item.id];
    if (newOrder === undefined || newOrder === item.sort_order) return;
    onSave({ ...item, sort_order: newOrder });
  };

  return (
    <div>
      <button className="btn btn-primary" style={{ marginBottom: 16 }} onClick={() => setEditing(blank())}>
        + Add education
      </button>

      {editing && (
        <div className="card" style={{ padding: 20, marginBottom: 20 }}>
          <Field label="School">
            <input
              style={inputStyle}
              value={editing.school}
              onChange={(e) => setEditing({ ...editing, school: e.target.value })}
            />
          </Field>
          <Field label="Program">
            <input
              style={inputStyle}
              value={editing.program}
              onChange={(e) => setEditing({ ...editing, program: e.target.value })}
            />
          </Field>
          <Field label="Period">
            <input
              style={inputStyle}
              value={editing.period}
              onChange={(e) => setEditing({ ...editing, period: e.target.value })}
            />
          </Field>
          <Field label="Sort order">
            <input
              type="number"
              style={inputStyle}
              value={editing.sort_order}
              onChange={(e) => setEditing({ ...editing, sort_order: Number(e.target.value) })}
            />
          </Field>
          <div style={{ display: "flex", gap: 10 }}>
            <button
              className="btn btn-primary"
              disabled={saving}
              onClick={() => {
                onSave(editing);
                setEditing(null);
              }}
            >
              {saving ? "Saving..." : "Save"}
            </button>
            <button className="btn" onClick={() => setEditing(null)}>
              Cancel
            </button>
          </div>
        </div>
      )}

      {items.length === 0 && !editing ? (
        <EmptyState text="No education entries yet." />
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {items.map((item) => {
            const draft = sortDrafts[item.id] ?? item.sort_order;
            const changed = draft !== item.sort_order;

            return (
              <div key={item.id} className="card" style={{ padding: 16 }}>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    gap: 12,
                    flexWrap: "wrap",
                    alignItems: "center",
                  }}
                >
                  <div style={{ flex: 1, minWidth: 180 }}>
                    <strong>{item.program}</strong>
                    <div style={{ color: "var(--text-faint)", fontSize: 13, marginTop: 4 }}>
                      {item.school} · {item.period}
                    </div>
                  </div>

                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <span style={{ fontSize: 12, color: "var(--text-faint)" }}>Sort</span>
                    <input
                      type="number"
                      value={draft}
                      onChange={(e) => handleSortChange(item.id, e.target.value)}
                      style={{ ...inputStyle, width: 72, padding: "6px 8px", textAlign: "center" }}
                    />
                    {changed && (
                      <button
                        className="btn btn-primary"
                        style={{ fontSize: 12, padding: "6px 10px" }}
                        disabled={saving}
                        onClick={() => saveSortOrder(item)}
                      >
                        {saving ? "..." : "Save"}
                      </button>
                    )}
                  </div>

                  <div style={{ display: "flex", gap: 8 }}>
                    <button className="btn" style={{ fontSize: 13, padding: "6px 12px" }} onClick={() => setEditing(item)}>
                      Edit
                    </button>
                    <button
                      className="btn"
                      style={{ fontSize: 13, padding: "6px 12px", color: "#e0715c" }}
                      onClick={() => onDelete(item.id)}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}