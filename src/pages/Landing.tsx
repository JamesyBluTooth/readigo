import React from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";

const COLORS = {
  bg: "#f7f9ff",
  card: "#ffffff",
  border: "#e5e7eb",
  text: "#3c3c3c",
  muted: "#6b6b6b",
};

export default function Landing(): JSX.Element {
  const navigate = useNavigate();
  const openLogin = () => navigate("/?isLoggingIn=true");
  const openSignup = () => navigate("/?isSigningUp=true");

  return (
    <main
      className="fade-in"
      style={{
        maxWidth: "min(92vw, 560px)",
        margin: "0 auto",
        padding: "clamp(1.25rem, 4vw, 2rem) 1rem 5rem",
        background: COLORS.bg,
        color: COLORS.text,
        fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
      }}
    >
      {/* HEADER */}
      <header
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          gap: "1rem",
          marginBottom: "clamp(1.5rem, 5vw, 2rem)",
          flexWrap: "wrap",
        }}
      >
        <strong style={{ fontSize: "clamp(1.05rem, 3vw, 1.2rem)" }}>📘 Readigo</strong>

        <nav style={{ display: "flex", gap: "0.6rem", flexWrap: "wrap" }}>
          <Button variant="secondary" onClick={openLogin}>
            Log in
          </Button>
          <Button size="lg" onClick={openSignup}>
            Create account
          </Button>
        </nav>
      </header>

      {/* HERO */}
      <section
        style={{
          background: COLORS.card,
          borderRadius: 22,
          padding: "clamp(1.1rem, 4vw, 1.4rem)",
          display: "flex",
          flexDirection: "column",
          gap: "1.2rem",
          boxShadow: `0 6px 0 ${COLORS.border}`,
        }}
      >
        <div>
          <h1 style={{ fontSize: "clamp(1.4rem, 4vw, 1.8rem)", marginBottom: "0.8rem" }}>
            Reading, made delightfully social.
          </h1>
          <p style={{ color: COLORS.muted, fontSize: "clamp(0.95rem, 3vw, 1rem)", lineHeight: 1.5 }}>
            Track your reading, build the habit, and see what your friends are enjoying — without the noise of social media.
          </p>
        </div>

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "0.6rem",
            alignItems: "center",
          }}
        >
          <div style={{ width: "100%", maxWidth: 420 }}>
            <Button className="w-full" onClick={openSignup}>
              Create an account
            </Button>
          </div>
          <div style={{ width: "100%", maxWidth: 420 }}>
            <Button variant="secondary" className="w-full" onClick={openLogin}>
              Log in
            </Button>
          </div>
        </div>

        <small style={{ color: COLORS.muted, fontSize: "0.75rem", textAlign: "center" }}>
          Free. No ads. No shouting.
        </small>
      </section>

      {/* HOW IT WORKS */}
      <section style={{ marginTop: "clamp(1.8rem, 6vw, 2.2rem)" }}>
        <h1 style={{ fontSize: "clamp(1.35rem, 4vw, 1.6rem)", marginBottom: "1.2rem" }}>
          How it works
        </h1>

        <div style={{ display: "flex", flexDirection: "column", gap: "1.2rem" }}>
          {[
            { icon: "📚", title: "Add your books", desc: "Search by ISBN or add them manually in seconds." },
            { icon: "📈", title: "Track your reading", desc: "Log pages, time, and thoughts as you go." },
            { icon: "👥", title: "Read together", desc: "Follow friends, join challenges, earn achievements." },
          ].map((item) => (
            <div
              key={item.title}
              style={{
                background: COLORS.card,
                borderRadius: 22,
                padding: "1.2rem",
                display: "flex",
                gap: "1rem",
                flexWrap: "wrap",
                boxShadow: `0 6px 0 ${COLORS.border}`,
              }}
            >
              <div
                style={{
                  width: "clamp(64px, 18vw, 72px)",
                  height: "clamp(96px, 27vw, 108px)",
                  borderRadius: 14,
                  background: "#e9ecff",
                  display: "grid",
                  placeItems: "center",
                  fontWeight: 700,
                  color: COLORS.muted,
                  flexShrink: 0,
                }}
              >
                {item.icon}
              </div>

              <div style={{ flex: "1 1 180px" }}>
                <h2 style={{ margin: 0, fontSize: "1.05rem" }}>{item.title}</h2>
                <p style={{ margin: 0, fontSize: "0.9rem", color: COLORS.muted }}>
                  {item.desc}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* FINAL CTA */}
      <section
        style={{
          background: COLORS.card,
          borderRadius: 22,
          padding: "1.2rem",
          marginTop: "1.6rem",
          display: "flex",
          flexDirection: "column",
          gap: "0.8rem",
          boxShadow: `0 6px 0 ${COLORS.border}`,
        }}
      >
        <strong style={{ fontSize: "1.1rem", textAlign: "center" }}>
          Ready to turn reading into a habit?
        </strong>

        <Button onClick={openSignup}>Create an account</Button>
        <Button variant="secondary" onClick={openLogin}>
          Log in
        </Button>
      </section>

      {/* FOOTER */}
      <footer style={{ textAlign: "center", paddingTop: "2.5rem", color: COLORS.muted }}>
        <strong style={{ display: "block", color: COLORS.text }}>Readigo</strong>
        <span>About · Privacy · Terms · Contact</span>
      </footer>
    </main>
  );
}
