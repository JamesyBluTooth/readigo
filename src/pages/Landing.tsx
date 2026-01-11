import React from "react";
import { useNavigate } from "react-router-dom";

const COLORS = {
  bg: "#f7f9ff",
  card: "#ffffff",
  border: "#e5e7eb",
  primary: "#517efe",
  primaryDark: "#4971e5",
  text: "#3c3c3c",
  muted: "#6b6b6b",
};

const RADIUS = {
  lg: 22,
  md: 16,
  sm: 14,
};

const shadow = (color: string) => `0 6px 0 ${color}`;

export default function Landing(): JSX.Element {
  const navigate = useNavigate();

  const openLogin = () => navigate('/?isLoggingIn=true');
  const openSignup = () => navigate('/?isSigningUp=true');
  return (
    <main className="fade-in"
      style={{
        maxWidth: 560,
        margin: "0 auto",
        padding: "2rem 1rem 5rem",
        background: COLORS.bg,
        color: COLORS.text,
        fontFamily:
          'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
      }}
    >
      {/* ================= HEADER ================= */}
      <header
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "2rem",
        }}
      >
        <strong style={{ fontSize: "1.2rem" }}>📘 Readigo</strong>

        <nav style={{ display: "flex", gap: "0.6rem" }}>
          <button onClick={openLogin} style={secondaryButton}>Log in</button>
          <button onClick={openSignup} style={{ ...primaryButton, padding: "0.7rem" }}>
            Create account
          </button>
        </nav>
      </header>

      {/* ================= HERO ================= */}
      <section style={{ ...cardRow, cursor: "default", gap: "1.2rem" }}>
        <div>
          <h1 style={{ fontSize: "1.6rem", marginBottom: "1.2rem" }}>
            Reading, made delightfully social.
          </h1>
          <p
            style={{
              color: COLORS.muted,
              fontSize: "1rem",
              lineHeight: 1.5,
            }}
          >
            Track your reading, build the habit, and see what your friends are
            enjoying — without the noise of social media.
          </p>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "0.6rem" }}>
          <button onClick={openSignup} style={primaryButton}>Create an account</button>
          <button onClick={openLogin} style={secondaryButton}>Log in</button>
        </div>

        <small style={{ color: COLORS.muted, fontSize: "0.75rem" }}>
          Free. No ads. No shouting.
        </small>
      </section>

      {/* ================= HOW IT WORKS ================= */}
      <section style={{ marginTop: "2rem" }}>
        <h1 style={{ fontSize: "1.6rem", marginBottom: "1.2rem" }}>
          How it works
        </h1>

        <div style={{ display: "flex", flexDirection: "column", gap: "1.2rem" }}>
          {[
            { icon: "📚", title: "Add your books", desc: "Search by ISBN or add them manually in seconds." },
            { icon: "📈", title: "Track your reading", desc: "Log pages, time, and thoughts as you go." },
            { icon: "👥", title: "Read together", desc: "Follow friends, join challenges, earn achievements." },
          ].map((item) => (
            <div key={item.title} style={cardRow}>
              <div style={cover}>{item.icon}</div>
              <div style={{ flex: 1 }}>
                <h2 style={{ margin: 0, fontSize: "1.05rem" }}>
                  {item.title}
                </h2>
                <p
                  style={{
                    margin: 0,
                    fontSize: "0.9rem",
                    color: COLORS.muted,
                  }}
                >
                  {item.desc}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ================= OVERVIEW ================= */}
      <section style={{ marginTop: "2rem" }}>
        <div
          style={{
            background: "linear-gradient(180deg, #f2f5ff, #ffffff)",
            borderRadius: RADIUS.lg,
            border: `2px solid ${COLORS.border}`,
            padding: "1.1rem 1.3rem",
            boxShadow: shadow(COLORS.border),
          }}
        >
          <div
            style={{
              fontSize: "0.75rem",
              fontWeight: 700,
              color: COLORS.muted,
              textTransform: "uppercase",
              letterSpacing: "0.04em",
              marginBottom: "0.6rem",
            }}
          >
            Why Readigo?
          </div>

          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              gap: "0.8rem",
            }}
          >
            {[
              { icon: "📊", label: "Smart analytics" },
              { icon: "🏆", label: "Motivating goals" },
              { icon: "🤝", label: "Friendly pressure" },
            ].map((stat) => (
              <div key={stat.label} style={{ flex: 1 }}>
                <strong
                  style={{ display: "block", fontSize: "1.25rem" }}
                >
                  {stat.icon}
                </strong>
                <span style={{ fontSize: "0.8rem", color: COLORS.muted }}>
                  {stat.label}
                </span>
              </div>
            ))}
          </div>

          <div
            style={{
              marginTop: "0.6rem",
              fontSize: "0.8rem",
              color: COLORS.muted,
            }}
          >
            Built for readers, not algorithms.
          </div>
        </div>
      </section>

      {/* ================= FINAL CTA ================= */}
      <section
        style={{
          ...cardRow,
          cursor: "default",
          flexDirection: "column",
          gap: "1rem",
          marginTop: "1.5rem",
        }}
      >
        <strong style={{ fontSize: "1.1rem" }}>
          Ready to turn reading into a habit?
        </strong>
        <button onClick={openSignup} style={primaryButton}>Create an account</button>
        <button onClick={openLogin} style={secondaryButton}>Log in</button>
      </section>

      {/* ================= FOOTER ================= */}
      <footer
        style={{
          textAlign: "center",
          paddingTop: "2rem",
          color: COLORS.muted,
        }}
      >
        <strong style={{ display: "block", color: COLORS.text }}>
          Readigo
        </strong>
        <span>About · Privacy · Terms · Contact</span>
      </footer>
    </main>
  );
}

/* ================= SHARED STYLES ================= */

const cardRow: React.CSSProperties = {
  background: COLORS.card,
  borderRadius: RADIUS.lg,
  padding: "1.2rem",
  display: "flex",
  gap: "1rem",
  boxShadow: shadow(COLORS.border),
};

const cover: React.CSSProperties = {
  width: 72,
  height: 108,
  borderRadius: RADIUS.sm,
  background: "#e9ecff",
  display: "grid",
  placeItems: "center",
  fontWeight: 700,
  color: COLORS.muted,
  fontSize: "0.85rem",
};

const primaryButton: React.CSSProperties = {
  width: "100%",
  padding: "1.1rem",
  fontSize: "1.05rem",
  fontWeight: 700,
  borderRadius: RADIUS.md,
  border: "none",
  background: COLORS.primary,
  color: "#fff",
  cursor: "pointer",
  boxShadow: shadow(COLORS.primaryDark),
};

const secondaryButton: React.CSSProperties = {
  padding: "1rem",
  fontSize: "1rem",
  fontWeight: 700,
  borderRadius: RADIUS.md,
  border: `1px solid ${COLORS.border}`,
  background: "#fff",
  cursor: "pointer",
};
