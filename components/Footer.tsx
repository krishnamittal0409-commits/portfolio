import { profile } from "@/lib/data";

export default function Footer() {
  return (
    <footer style={{ borderTop: "1px solid var(--border-soft)", padding: "28px 0" }}>
      <div className="container" style={{ display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: 10, fontSize: 13, color: "var(--text-faint)" }}>
        <span>&copy; {new Date().getFullYear()} {profile.name}</span>
        <span>Built with Next.js &middot; Supabase &middot; Vercel</span>
      </div>
    </footer>
  );
}
