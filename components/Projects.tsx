import { projects } from "@/lib/data";
import ProjectCard from "./ProjectCard";

export default function Projects() {
  return (
    <section id="projects" className="section">
      <div className="container">
        <div className="eyebrow">Projects</div>
        <h2 className="section-title">Shipped, not just scoped</h2>
        <p className="section-sub">Live likes are stored in Supabase — tap the heart on a project you like.</p>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 20, marginTop: 40 }}>
          {projects.map((project) => (
            <ProjectCard key={project.slug} project={project} />
          ))}
        </div>
      </div>
    </section>
  );
}
