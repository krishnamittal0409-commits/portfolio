import { experience } from "@/lib/data";

export default function Experience() {
  return (
    <section id="work" className="section">
      <div className="container">
        <div className="eyebrow">Experience</div>
        <h2 className="section-title">Where the work happened</h2>
        <p className="section-sub">Two roles, most recent first.</p>

        <div style={{ display: "flex", flexDirection: "column", gap: 18, marginTop: 40 }}>
          {experience.map((job) => (
            <article key={job.company} className="card" style={{ padding: "28px 30px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", flexWrap: "wrap", gap: 8 }}>
                <h3 style={{ fontSize: 20, fontWeight: 600 }}>
                  {job.role} <span style={{ color: "var(--text-faint)", fontWeight: 400 }}>at</span> {job.company}
                </h3>
                <span className="mono" style={{ fontSize: 12.5, color: "var(--text-faint)" }}>
                  {job.period}
                </span>
              </div>
              <ul style={{ marginTop: 18, paddingLeft: 0, listStyle: "none", display: "flex", flexDirection: "column", gap: 10 }}>
                {job.points.map((point) => (
                  <li key={point} style={{ display: "flex", gap: 10, color: "var(--text-dim)", fontSize: 14.5, lineHeight: 1.6 }}>
                    <span style={{ color: "var(--accent-soft)", marginTop: 2 }}>&bull;</span>
                    {point}
                  </li>
                ))}
              </ul>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
