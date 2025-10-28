"use client";

import Link from "next/link";
import { useTheme } from "../../../components/ThemeProvider";

export default function TeamNotFound() {
  const { theme } = useTheme();
  
  // Text color styles
  const headingColor = theme === 'dark' ? "#e2e8f0" : "#1e293b";
  const mutedColor = theme === 'dark' ? "#94a3b8" : "#64748b";
  
  // Button style
  const buttonStyle = {
    background: theme === 'dark' ? "rgba(30, 41, 59, 0.4)" : "rgba(241, 245, 249, 0.8)",
    color: theme === 'dark' ? "white" : "hsl(220, 25%, 10%)",
    border: theme === 'dark' ? "1px solid rgba(51, 65, 85, 0.3)" : "1px solid rgba(203, 213, 225, 0.5)",
    borderRadius: "0.5rem",
    padding: "0.5rem 1rem",
    fontSize: "0.875rem",
    fontWeight: 500,
    cursor: "pointer",
    transition: "all 0.2s ease",
    textDecoration: "none",
  };

  return (
    <div style={{
      padding: "2rem",
      maxWidth: "1200px",
      margin: "0 auto",
      width: "100%",
    }}>
      <div style={{
        textAlign: "center",
        padding: "3rem",
        color: mutedColor,
      }}>
        <h2 style={{ fontSize: "1.5rem", fontWeight: 600, marginBottom: "1rem", color: headingColor }}>
          Team not found
        </h2>
        <p style={{ marginBottom: "2rem" }}>
          The team you're looking for doesn't exist or you don't have access to it.
        </p>
        <Link href="/teams" style={{
          ...buttonStyle,
          display: "flex",
          alignItems: "center",
          gap: "0.5rem",
          margin: "0 auto",
          width: "fit-content",
        }}>
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M19 12H5M12 19l-7-7 7-7" />
          </svg>
          Back to Teams
        </Link>
      </div>
    </div>
  );
}
