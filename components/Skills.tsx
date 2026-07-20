import { skillGroups } from "@/lib/data";

export default function Skills() {
  return (
    <section id="skills" className="section">
      <div className="container">
        <div className="eyebrow">Skills</div>
        <h2 className="section-title">Toolbox</h2>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 30, marginTop: 40 }}>
          {skillGroups.map((group) => (
            <div key={group.label}>
              <h3 style={{ fontSize: 13, fontWeight: 600, color: "var(--text-faint)", marginBottom: 12, textTransform: "uppercase", letterSpacing: "0.04em" }}>
                {group.label}
              </h3>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                {group.items.map((item) => (
                  <span
                    key={item}
                    style={{
                      fontSize: 13,
                      padding: "7px 12px",
                      borderRadius: 8,
                      border: "1px solid var(--border)",
                      color: "var(--text-dim)",
                    }}
                  >
                    {item}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
