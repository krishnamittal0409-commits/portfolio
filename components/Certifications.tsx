import { certifications, education } from "@/lib/data";

export default function Certifications() {
  return (
    <section id="certifications" className="section">
      <div className="container split-grid split-grid--certs">
        <div>
          <div className="eyebrow">Certifications</div>
          <h2 className="section-title" style={{ marginBottom: 24 }}>
            Verified modules
          </h2>
          <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column" }}>
            {certifications.map((cert, i) => (
              <li
                key={cert.name}
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  gap: 16,
                  padding: "16px 0",
                  borderTop: i === 0 ? "1px solid var(--border-soft)" : "none",
                  borderBottom: "1px solid var(--border-soft)",
                }}
              >
                <div>
                  <p style={{ fontSize: 14.5 }}>{cert.name}</p>
                  <p style={{ fontSize: 12.5, color: "var(--text-faint)", marginTop: 4 }}>{cert.issuer}</p>
                </div>
                <span className="mono" style={{ fontSize: 12, color: "var(--accent-soft)", whiteSpace: "nowrap" }}>
                  {cert.year}
                </span>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <div className="eyebrow">Education</div>
          <h2 className="section-title" style={{ marginBottom: 24 }}>
            Foundation
          </h2>
          <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
            {education.map((ed) => (
              <div key={ed.school + ed.program}>
                <p style={{ fontSize: 14.5 }}>{ed.program}</p>
                <p style={{ fontSize: 13, color: "var(--text-dim)", marginTop: 3 }}>{ed.school}</p>
                {ed.period && (
                  <p className="mono" style={{ fontSize: 11.5, color: "var(--text-faint)", marginTop: 3 }}>
                    {ed.period}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
