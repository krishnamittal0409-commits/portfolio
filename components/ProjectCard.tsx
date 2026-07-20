"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import type { projects } from "@/lib/data";

type Project = (typeof projects)[number];

export default function ProjectCard({ project }: { project: Project }) {
  const [likes, setLikes] = useState<number | null>(null);
  const [liked, setLiked] = useState(false);
  const [pending, setPending] = useState(false);

  useEffect(() => {
    let active = true;

    async function loadLikes() {
      const { data, error } = await supabase
        .from("project_likes")
        .select("likes")
        .eq("project_slug", project.slug)
        .single();

      if (!active) return;
      if (error) {
        console.warn(`No likes row for ${project.slug}`);
        setLikes(0);
        return;
      }
      setLikes(data?.likes ?? 0);
    }

    loadLikes();
    return () => { active = false; };
  }, [project.slug]);

  async function handleLike() {
    if (liked || pending) return;

    setPending(true);
    const previous = likes ?? 0;
    setLikes(previous + 1);
    setLiked(true);

    console.log(`Calling increment_like with slug: ${project.slug}`);

    const { data, error } = await supabase.rpc("increment_like", { 
      slug: project.slug 
    });

    console.log("RPC Result:", { data, error });

    if (error) {
      console.error("Like Error:", error);
      setLikes(previous);
      setLiked(false);
    } else if (typeof data === "number") {
      setLikes(data);
    }

    setPending(false);
  }

  return (
    <article className="card" style={{ padding: "26px 26px 22px", display: "flex", flexDirection: "column", height: "100%" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <span className="mono" style={{ fontSize: 11, color: "var(--text-faint)", letterSpacing: "0.06em" }}>
          {project.code}
        </span>
        <button
          onClick={handleLike}
          disabled={pending}
          aria-pressed={liked}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 6,
            fontSize: 12.5,
            background: "transparent",
            border: "1px solid var(--border)",
            borderRadius: 20,
            padding: "5px 11px",
            color: liked ? "var(--accent-soft)" : "var(--text-faint)",
            transition: "border-color 0.15s ease, color 0.15s ease",
          }}
        >
          <span aria-hidden="true">{liked ? "\u2665" : "\u2661"}</span>
          {likes === null ? "\u2014" : likes}
        </button>
      </div>

      <h3 style={{ fontSize: 19, fontWeight: 600, marginTop: 16 }}>{project.name}</h3>
      <p style={{ color: "var(--accent-soft)", fontSize: 13.5, marginTop: 5 }}>{project.tagline}</p>

      <ul style={{ marginTop: 16, paddingLeft: 0, listStyle: "none", display: "flex", flexDirection: "column", gap: 8, flex: 1 }}>
        {project.points.map((point) => (
          <li key={point} style={{ display: "flex", gap: 8, color: "var(--text-dim)", fontSize: 13.5, lineHeight: 1.55 }}>
            <span style={{ color: "var(--accent-soft)" }}>&bull;</span>
            {point}
          </li>
        ))}
      </ul>

      <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginTop: 18 }}>
        {project.stack.map((s) => (
          <span key={s} className="tag">
            {s}
          </span>
        ))}
      </div>

      {project.link && (
        <a
          href={project.link}
          target="_blank"
          rel="noreferrer"
          style={{ marginTop: 18, fontSize: 13.5, color: "var(--accent-soft)", textDecoration: "none", fontWeight: 500 }}
        >
          View live &rarr;
        </a>
      )}
    </article>
  );
}