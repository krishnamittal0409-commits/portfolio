import { Certification, EducationItem } from "@/lib/content";

function groupByCategory(certs: Certification[]) {
  const groups = new Map<string, Certification[]>();
  for (const cert of certs) {
    const list = groups.get(cert.category) ?? [];
    list.push(cert);
    groups.set(cert.category, list);
  }
  return Array.from(groups.entries());
}

export default function Certifications({
  certifications,
  education,
}: {
  certifications: Certification[];
  education: EducationItem[];
}) {
  const grouped = groupByCategory(certifications);

  return (
    <section id="certifications" className="section">
      <div className="container split-grid split-grid--certs">
        <div>
          <div className="eyebrow">Certifications</div>
          <h2 className="section-title" style={{ marginBottom: 24 }}>
            Verified modules
          </h2>

          <div style={{ display: "flex", flexDirection: "column", gap: 28 }}>
            {grouped.map(([category, certs]) => (
              <div key={category}>
                <p
                  className="mono"
                  style={{
                    fontSize: 11.5,
                    color: "var(--text-faint)",
                    textTransform: "uppercase",
                    letterSpacing: 0.6,
                    marginBottom: 10,
                  }}
                >
                  {category}
                </p>
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))",
                    gap: 12,
                  }}
                >
                  {certs.map((cert) => (
                    <div
                      key={cert.id}
                      style={{
                        border: "1px solid var(--border-soft)",
                        borderRadius: 10,
                        padding: "14px 16px",
                        display: "flex",
                        flexDirection: "column",
                        gap: 4,
                      }}
                    >
                      {cert.url ? (
                        <a
                          href={cert.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          style={{ fontSize: 14, textDecoration: "none", color: "inherit", lineHeight: 1.35 }}
                          className="cert-link"
                        >
                          {cert.name}
                        </a>
                      ) : (
                        <p style={{ fontSize: 14, lineHeight: 1.35 }}>{cert.name}</p>
                      )}
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 2 }}>
                        <p style={{ fontSize: 12, color: "var(--text-faint)" }}>{cert.issuer}</p>
                        <span className="mono" style={{ fontSize: 11.5, color: "var(--accent-soft)", whiteSpace: "nowrap" }}>
                          {cert.year}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div>
          <div className="eyebrow">Education</div>
          <h2 className="section-title" style={{ marginBottom: 24 }}>
            Foundation
          </h2>
          <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
            {education.map((ed) => (
              <div key={ed.id}>
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