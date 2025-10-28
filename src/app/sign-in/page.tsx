"use client";

import Link from "next/link";
import { useState } from "react";
import { useTheme } from "../../components/ThemeProvider";
import { useAuth } from "../../context/AuthContext";
import { useRouter } from "next/navigation";

export default function SignInPage() {
  const { theme } = useTheme();
  const { user, signInWithGithub } = useAuth();
  const router = useRouter();
  
  // We're simplifying the auth flow, so we won't auto-redirect here
  
  // For the colored dots in the benefits list
  const dotColors = [
    "rgba(59, 130, 246, 0.8)",  // Blue
    "rgba(168, 85, 247, 0.8)",   // Purple
    "rgba(45, 212, 191, 0.8)"    // Teal
  ];

  return (
    <div style={{
      display: "flex",
      flexDirection: "column",
      minHeight: "calc(100vh - 64px)",
      alignItems: "center",
      justifyContent: "center",
      padding: "2rem 1rem",
      position: "relative"
    }}>
      {/* Back button removed */}

      {/* Main content */}
      <div style={{
        maxWidth: "480px",
        width: "100%",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        textAlign: "center"
      }}>
        {/* Title */}
        <h1 className="gradient-text" style={{
          fontSize: "clamp(2.5rem, 8vw, 3.5rem)",
          fontWeight: "bold",
          marginBottom: "1rem",
          lineHeight: 1.1
        }}>
          Join ByteRank
        </h1>

        {/* Subtitle */}
        <p style={{
          color: theme === 'dark' ? "#94a3b8" : "#64748b",
          fontSize: "1.125rem",
          marginBottom: "2.5rem"
        }}>
          Connect your GitHub account to get started
        </p>

        {/* Sign-in card */}
        <div style={{
          background: theme === 'dark' ? "rgba(15, 23, 42, 0.95)" : "rgba(255, 255, 255, 0.95)",
          borderRadius: "1rem",
          border: theme === 'dark' ? "1px solid rgba(51, 65, 85, 0.5)" : "1px solid rgba(203, 213, 225, 0.5)",
          padding: "2rem",
          width: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          boxShadow: theme === 'dark' ? 
            "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -2px rgba(0, 0, 0, 0.1)" : 
            "0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -2px rgba(0, 0, 0, 0.05)"
        }}>
          {/* GitHub button */}
          <button 
            onClick={signInWithGithub}
            style={{
              background: "linear-gradient(to right, #3b82f6, #8b5cf6)",
              color: "white",
              border: "none",
              borderRadius: "0.5rem",
              padding: "0.875rem 1.5rem",
              fontSize: "1.125rem",
              fontWeight: 600,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "0.625rem",
              width: "100%",
              cursor: "pointer",
              transition: "all 0.2s ease",
              boxShadow: "0 4px 6px -1px rgba(59, 130, 246, 0.2), 0 2px 4px -2px rgba(59, 130, 246, 0.2)"
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.transform = "translateY(-2px)";
              e.currentTarget.style.boxShadow = "0 10px 15px -3px rgba(59, 130, 246, 0.3), 0 4px 6px -4px rgba(59, 130, 246, 0.3)";
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.transform = "translateY(0)";
              e.currentTarget.style.boxShadow = "0 4px 6px -1px rgba(59, 130, 246, 0.2), 0 2px 4px -2px rgba(59, 130, 246, 0.2)";
            }}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"></path>
            </svg>
            Continue with GitHub
          </button>

          {/* Divider with text */}
          <div style={{
            display: "flex",
            alignItems: "center",
            width: "100%",
            margin: "2rem 0"
          }}>
            <div style={{ flex: 1, height: "1px", background: theme === 'dark' ? "rgba(51, 65, 85, 0.6)" : "rgba(203, 213, 225, 0.6)" }} />
            <span style={{ padding: "0 1rem", color: theme === 'dark' ? "#94a3b8" : "#64748b", fontSize: "0.875rem" }}>Why GitHub?</span>
            <div style={{ flex: 1, height: "1px", background: theme === 'dark' ? "rgba(51, 65, 85, 0.6)" : "rgba(203, 213, 225, 0.6)" }} />
          </div>

          {/* Benefits list */}
          <ul style={{
            listStyle: "none",
            padding: 0,
            margin: 0,
            width: "100%",
            textAlign: "left"
          }}>
            {[
              "Track your coding consistency and progress",
              "Connect with friends and compete on leaderboards",
              "Celebrate milestones and achievements together"
            ].map((benefit, index) => (
              <li key={index} style={{
                display: "flex",
                alignItems: "center",
                gap: "0.75rem",
                marginBottom: index < 2 ? "1rem" : 0,
                color: theme === 'dark' ? "#cbd5e1" : "#475569",
                fontSize: "0.9375rem"
              }}>
                <div style={{
                  width: "8px",
                  height: "8px",
                  borderRadius: "50%",
                  background: dotColors[index]
                }} />
                {benefit}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
