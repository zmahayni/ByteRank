"use client";

import Link from "next/link";
import { useTheme } from "../../components/ThemeProvider";
import PageLayout from "../../components/PageLayout";

export default function WhatsNewPage() {
  const { theme } = useTheme();

  const headingColor = theme === 'dark' ? "#e2e8f0" : "#1e293b";
  const textColor = theme === 'dark' ? "#e2e8f0" : "#1e293b";
  const mutedColor = theme === 'dark' ? "#94a3b8" : "#64748b";
  const cardStyle = {
    background: theme === 'dark' ? "rgba(30, 41, 59, 0.4)" : "rgba(241, 245, 249, 0.7)",
    borderRadius: "0.75rem",
    border: theme === 'dark' ? "1px solid rgba(51, 65, 85, 0.3)" : "1px solid rgba(203, 213, 225, 0.5)",
    padding: "2rem",
  };
  const buttonStyle = {
    background: theme === 'dark' ? "rgba(30, 41, 59, 0.4)" : "rgba(241, 245, 249, 0.8)",
    color: theme === 'dark' ? "white" : "hsl(220, 25%, 10%)",
    border: theme === 'dark' ? "1px solid rgba(51, 65, 85, 0.3)" : "1px solid rgba(203, 213, 225, 0.5)",
    borderRadius: "0.5rem",
    padding: "0.5rem 1rem",
    fontSize: "0.875rem",
    fontWeight: 600,
    cursor: "pointer",
    transition: "all 0.2s ease",
    textDecoration: "none",
    display: "inline-block",
  };

  return (
    <PageLayout>
      <div style={{ maxWidth: "800px", margin: "0 auto" }}>
        {/* Header */}
        <div style={{ marginBottom: "2rem" }}>
          <Link
            href="/teams"
            style={{
              ...buttonStyle,
              marginBottom: "1rem",
            }}
          >
            ← Back
          </Link>
          <h1 className="gradient-text" style={{ fontSize: "2.5rem", fontWeight: "bold", marginBottom: "0.5rem" }}>
            What's New
          </h1>
          <p style={{ color: mutedColor, fontSize: "0.875rem" }}>
            November 7, 2025
          </p>
        </div>

        {/* Content */}
        <div style={cardStyle}>
          <div style={{ lineHeight: "1.8", color: textColor }}>
            <p style={{ marginBottom: "1.5rem" }}>
              This is v1/beta version of ByteRank. I'm aware there are probably a lot of bugs since this is my first time building an actual production project, so bear with me. Please go to the feedback section and honestly say whatever you want, whether its slight UI/UX stuff you wanna see, big features, bugs, etc.
            </p>
            <p>
              I'll be consistently working on this as time allows me, really excited to iterate on this project and improve it!!
            </p>
          </div>

          {/* Feedback Link */}
          <div style={{ marginTop: "2rem", paddingTop: "2rem", borderTop: theme === 'dark' ? "1px solid rgba(51, 65, 85, 0.3)" : "1px solid rgba(203, 213, 225, 0.5)" }}>
            <p style={{ color: mutedColor, marginBottom: "1rem" }}>
              Have feedback? We'd love to hear it!
            </p>
            <Link
              href="/feedback"
              style={{
                background: "linear-gradient(to right, #3b82f6, #8b5cf6)",
                color: "white",
                border: "none",
                borderRadius: "0.5rem",
                padding: "0.75rem 1.5rem",
                fontSize: "0.875rem",
                fontWeight: 600,
                cursor: "pointer",
                transition: "all 0.2s ease",
                textDecoration: "none",
                display: "inline-block",
              }}
            >
              Go to Feedback
            </Link>
          </div>
        </div>
      </div>
    </PageLayout>
  );
}
