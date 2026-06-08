import { ImageResponse } from "next/og";

export const alt = "MindReply MRagent - warm mind read, clear next move";
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = "image/png";

export default function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background: "#f4efe4",
          color: "#162033",
          padding: 64,
          fontFamily: "Inter, Arial, sans-serif",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
            <div
              style={{
                width: 72,
                height: 72,
                borderRadius: 16,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                background: "#162033",
                color: "#e2b757",
                fontSize: 36,
                fontWeight: 800,
              }}
            >
              M
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
              <div style={{ fontSize: 34, fontWeight: 800 }}>MindReply</div>
              <div style={{ fontSize: 18, color: "#755d24", letterSpacing: 2, textTransform: "uppercase" }}>MRagent</div>
            </div>
          </div>
          <div
            style={{
              border: "1px solid rgba(22,32,51,.18)",
              borderRadius: 999,
              padding: "14px 22px",
              fontSize: 22,
              fontWeight: 700,
            }}
          >
            One clear move
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 24, maxWidth: 880 }}>
          <div style={{ fontSize: 86, lineHeight: 0.94, fontWeight: 900, letterSpacing: -2 }}>
            Warm mind read. Clear next move.
          </div>
          <div style={{ fontSize: 30, lineHeight: 1.35, color: "#34435f" }}>
            Bring the pressure. MRagent reflects what is underneath it and keeps one action in view.
          </div>
        </div>

        <div style={{ display: "flex", gap: 16, fontSize: 22, color: "#f8f5f0" }}>
          {[
            "One synthesis",
            "Risk gate",
            "Quiet receipt",
          ].map((item) => (
            <div key={item} style={{ borderRadius: 14, background: "#162033", padding: "14px 18px" }}>
              {item}
            </div>
          ))}
        </div>
      </div>
    ),
    size,
  );
}
