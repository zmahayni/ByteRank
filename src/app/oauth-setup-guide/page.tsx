"use client";

import { useTheme } from "../../components/ThemeProvider";
import Link from "next/link";

export default function OAuthSetupGuidePage() {
  const { theme } = useTheme();
  
  const textColor = theme === 'dark' ? "#e2e8f0" : "#1e293b";
  const mutedColor = theme === 'dark' ? "#94a3b8" : "#64748b";
  const cardBg = theme === 'dark' ? "rgba(15, 23, 42, 0.95)" : "rgba(255, 255, 255, 0.95)";
  const borderColor = theme === 'dark' ? "rgba(51, 65, 85, 0.5)" : "rgba(203, 213, 225, 0.5)";
  const codeBg = theme === 'dark' ? "rgba(30, 41, 59, 0.7)" : "rgba(241, 245, 249, 0.8)";
  
  return (
    <div style={{
      padding: "2rem",
      maxWidth: "800px",
      margin: "0 auto",
      color: textColor
    }}>
      <h1 className="gradient-text" style={{
        fontSize: "2.5rem",
        fontWeight: "bold",
        marginBottom: "1.5rem"
      }}>
        GitHub OAuth Setup Guide
      </h1>
      
      <div style={{
        background: cardBg,
        borderRadius: "1rem",
        border: `1px solid ${borderColor}`,
        padding: "2rem",
        marginBottom: "2rem"
      }}>
        <h2 style={{ fontSize: "1.5rem", fontWeight: "600", marginBottom: "1rem" }}>
          1. Configure GitHub OAuth App
        </h2>
        
        <p style={{ marginBottom: "1rem", lineHeight: "1.6", color: mutedColor }}>
          Make sure your GitHub OAuth App is configured with the correct callback URL:
        </p>
        
        <div style={{
          background: codeBg,
          padding: "1rem",
          borderRadius: "0.5rem",
          fontFamily: "monospace",
          overflowX: "auto",
          marginBottom: "1.5rem"
        }}>
          <code>https://dzddvaveoktwiblukiqq.supabase.co/auth/v1/callback</code>
        </div>
        
        <p style={{ marginBottom: "1rem", lineHeight: "1.6", color: mutedColor }}>
          Go to your GitHub OAuth App settings and update the "Authorization callback URL" to match the URL above.
        </p>
      </div>
      
      <div style={{
        background: cardBg,
        borderRadius: "1rem",
        border: `1px solid ${borderColor}`,
        padding: "2rem",
        marginBottom: "2rem"
      }}>
        <h2 style={{ fontSize: "1.5rem", fontWeight: "600", marginBottom: "1rem" }}>
          2. Configure Supabase Auth Settings
        </h2>
        
        <p style={{ marginBottom: "1rem", lineHeight: "1.6", color: mutedColor }}>
          In your Supabase dashboard:
        </p>
        
        <ol style={{ marginLeft: "1.5rem", marginBottom: "1.5rem", lineHeight: "1.6", color: mutedColor }}>
          <li style={{ marginBottom: "0.5rem" }}>Go to Authentication &gt; Providers</li>
          <li style={{ marginBottom: "0.5rem" }}>Find GitHub and make sure it's enabled</li>
          <li style={{ marginBottom: "0.5rem" }}>Verify that your Client ID and Client Secret match the values in your .env.local file</li>
          <li>Make sure "Redirect URL" is set to your app's domain or localhost during development</li>
        </ol>
      </div>
      
      <div style={{
        background: cardBg,
        borderRadius: "1rem",
        border: `1px solid ${borderColor}`,
        padding: "2rem"
      }}>
        <h2 style={{ fontSize: "1.5rem", fontWeight: "600", marginBottom: "1rem" }}>
          3. Update Your Application Code
        </h2>
        
        <p style={{ marginBottom: "1rem", lineHeight: "1.6", color: mutedColor }}>
          Your application should use the following redirect URL in the signInWithGithub function:
        </p>
        
        <div style={{
          background: codeBg,
          padding: "1rem",
          borderRadius: "0.5rem",
          fontFamily: "monospace",
          overflowX: "auto",
          marginBottom: "1.5rem"
        }}>
          <code>{`const { error } = await supabase.auth.signInWithOAuth({
  provider: 'github',
  options: {
    redirectTo: \`\${window.location.origin}/auth/v1/callback\`,
    scopes: 'read:user user:email',
  },
});`}</code>
        </div>
        
        <Link href="/sign-in" style={{
          display: "inline-block",
          background: "linear-gradient(to right, #3b82f6, #8b5cf6)",
          color: "white",
          padding: "0.75rem 1.5rem",
          borderRadius: "0.5rem",
          fontWeight: "600",
          textDecoration: "none",
          marginTop: "1rem"
        }}>
          Return to Sign In
        </Link>
      </div>
    </div>
  );
}
