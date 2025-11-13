"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTheme } from "../../../components/ThemeProvider";
import { useAuth } from "../../../context/AuthContext";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";

export default function CreateTeamPage() {
  const { theme } = useTheme();
  const { user } = useAuth();
  const router = useRouter();
  const supabase = createClientComponentClient();
  
  // Form state
  const [teamName, setTeamName] = useState("");
  const [teamDescription, setTeamDescription] = useState("");
  const [teamLogo, setTeamLogo] = useState<string | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [accessPolicy, setAccessPolicy] = useState<'open' | 'closed'>('closed');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Handle logo upload
  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        setLogoPreview(result);
        setTeamLogo(file.name); // In a real app, you'd upload the file to a server
      };
      reader.readAsDataURL(file);
    }
  };
  
  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user || !teamName.trim()) return;
    
    setIsSubmitting(true);
    
    try {
      // Create the team
      const { data: teamData, error: teamError } = await supabase
        .from('groups')
        .insert({
          name: teamName.trim(),
          description: teamDescription.trim() || null,
          avatar_url: logoPreview || null,
          owner_id: user.id,
          access_policy: accessPolicy,
        })
        .select()
        .single();

      if (teamError) {
        console.error('Error creating team:', teamError);
        alert('Failed to create team. Please try again.');
        setIsSubmitting(false);
        return;
      }

      // Add creator as owner member
      const { error: memberError } = await supabase
        .from('group_members')
        .insert({
          group_id: teamData.id,
          user_id: user.id,
          role: 'owner',
          total_commits: 0,
        });

      if (memberError) {
        console.error('Error adding owner:', memberError);
        // Team created but failed to add owner - should still redirect
      }

      // Redirect to the new team page
      router.push(`/teams/${teamData.id}`);
    } catch (error) {
      console.error('Unexpected error creating team:', error);
      alert('Failed to create team. Please try again.');
      setIsSubmitting(false);
    }
  };
  
  // Common styles
  const inputStyle = {
    width: "100%",
    padding: "0.75rem 1rem",
    borderRadius: "0.375rem",
    border: theme === 'dark' ? "1px solid rgba(51, 65, 85, 0.3)" : "1px solid #cbd5e1",
    background: theme === 'dark' ? "rgba(15, 23, 42, 0.3)" : "#f9fafb",
    color: theme === 'dark' ? "white" : "#1e293b",
    fontSize: "0.875rem",
    boxSizing: "border-box" as "border-box",
  };
  
  const buttonStyle = {
    background: theme === 'dark' ? "rgba(30, 41, 59, 0.4)" : "#f9fafb",
    color: theme === 'dark' ? "white" : "#1e293b",
    border: theme === 'dark' ? "1px solid rgba(51, 65, 85, 0.3)" : "1px solid #cbd5e1",
    borderRadius: "0.375rem",
    padding: "0.5rem 1rem",
    fontSize: "0.875rem",
    fontWeight: 500,
    cursor: "pointer",
    transition: "all 0.2s ease",
    display: "flex",
    alignItems: "center",
    gap: "0.5rem",
  };
  
  const primaryButtonStyle = {
    background: "linear-gradient(to right, #3b82f6, #8b5cf6)",
    color: "white",
    border: "none",
    borderRadius: "0.375rem",
    padding: "0.75rem 1.5rem",
    fontSize: "0.875rem",
    fontWeight: 600,
    cursor: "pointer",
    transition: "all 0.2s ease",
    display: "flex",
    alignItems: "center",
    gap: "0.5rem",
  };
  
  const sectionStyle = {
    background: theme === 'dark' ? "rgba(15, 23, 42, 0.95)" : "#f9fafb",
    borderRadius: "0.75rem",
    border: theme === 'dark' ? "1px solid rgba(51, 65, 85, 0.5)" : "1px solid #cbd5e1",
    padding: "1.5rem",
    marginBottom: "2rem",
    boxShadow: theme === 'dark' ? 
      "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -2px rgba(0, 0, 0, 0.1)" : 
      "0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -2px rgba(0, 0, 0, 0.05)"
  };

  return (
    <div style={{
      padding: "2rem",
      maxWidth: "1200px",
      margin: "0 auto",
      width: "100%",
    }}>
      {/* Page Header */}
      <div style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: "2rem",
      }}>
        <h1 className="gradient-text" style={{
          fontSize: "2.5rem",
          fontWeight: "bold",
        }}>
          Create Team
        </h1>
        <Link 
          href="/teams" 
          style={{
            display: "flex",
            alignItems: "center",
            gap: "0.5rem",
            color: theme === 'dark' ? "#cbd5e1" : "#1e40af",
            background: theme === 'dark' ? "transparent" : "#f9fafb",
            padding: "0.5rem 0.75rem",
            borderRadius: "0.375rem",
            border: theme === 'dark' ? "none" : "1px solid #cbd5e1",
            textDecoration: "none",
            fontSize: "0.875rem",
            fontWeight: 500,
            transition: "all 0.2s ease"
          }}
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M19 12H5M12 19l-7-7 7-7" />
          </svg>
          Back to Teams
        </Link>
      </div>
      
      <form onSubmit={handleSubmit}>
        {/* Team Details Section */}
        <div style={sectionStyle}>
          <h2 style={{ fontSize: "1.25rem", fontWeight: 600, color: theme === 'dark' ? "#e2e8f0" : "#1e293b", marginBottom: "1.5rem" }}>
            Team Details
          </h2>
          
          <div style={{ display: "flex", gap: "2rem", flexDirection: "column", alignItems: "stretch" }}>
            {/* Team Name */}
            <div>
              <label style={{ display: "block", marginBottom: "0.5rem", color: theme === 'dark' ? "#94a3b8" : "#64748b", fontSize: "0.875rem" }}>
                Team Name*
              </label>
              <input 
                type="text" 
                value={teamName}
                onChange={(e) => setTeamName(e.target.value)}
                placeholder="Enter team name"
                required
                style={{
                  ...inputStyle,
                  height: "42px",
                  width: "100%",
                  marginRight: "1rem"
                }}
              />
            </div>

            <div style={{ display: "flex", gap: "2rem", marginTop: "1.5rem" }}>
            {/* Logo Upload */}
            <div style={{ width: "200px", flexShrink: 0 }}>
              <label style={{ display: "block", marginBottom: "0.5rem", color: theme === 'dark' ? "#94a3b8" : "#64748b", fontSize: "0.875rem" }}>
                Team Logo
              </label>
              <div style={{
                width: "200px",
                height: "200px",
                borderRadius: "1rem",
                border: "1px dashed rgba(51, 65, 85, 0.4)",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
                overflow: "hidden",
                background: logoPreview ? "transparent" : theme === 'dark' ? "rgba(30, 41, 59, 0.4)" : "rgba(241, 245, 249, 0.7)",
                position: "relative",
              }}>
                {logoPreview ? (
                  <img 
                    src={logoPreview} 
                    alt="Team logo preview" 
                    style={{ width: "100%", height: "100%", objectFit: "cover" }} 
                  />
                ) : (
                  <>
                    <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: theme === 'dark' ? "#94a3b8" : "#64748b", marginBottom: "0.5rem" }}>
                      <path d="M4 14.899A7 7 0 1 1 15.71 8h1.79a4.5 4.5 0 0 1 2.5 8.242"></path>
                      <path d="M12 12v9"></path>
                      <path d="m16 16-4-4-4 4"></path>
                    </svg>
                    <span style={{ color: theme === 'dark' ? "#94a3b8" : "#64748b", fontSize: "0.875rem", textAlign: "center" }}>
                      Click to upload<br />or drag and drop
                    </span>
                  </>
                )}
                <input 
                  type="file" 
                  accept="image/*" 
                  onChange={handleLogoUpload} 
                  style={{ 
                    opacity: 0, 
                    position: "absolute", 
                    top: 0, 
                    left: 0, 
                    width: "100%", 
                    height: "100%", 
                    cursor: "pointer" 
                  }} 
                />
              </div>
              <p style={{ color: theme === 'dark' ? "#94a3b8" : "#64748b", fontSize: "0.75rem", marginTop: "0.5rem" }}>
                Recommended: 512×512px, PNG or JPG
              </p>
            </div>
            
            {/* Description */}
            <div style={{ flex: 1 }}>
              <label style={{ display: "block", marginBottom: "0.5rem", color: theme === 'dark' ? "#94a3b8" : "#64748b", fontSize: "0.875rem" }}>
                Description
              </label>
              <textarea 
                value={teamDescription}
                onChange={(e) => setTeamDescription(e.target.value)}
                placeholder="Describe your team's purpose, goals, etc."
                rows={7}
                style={{
                  ...inputStyle,
                  resize: "vertical",
                  height: "120px",
                  width: "100%",
                  marginRight: "1rem"
                }}
              />
            </div>
            </div>

            {/* Access Policy */}
            <div style={{ marginTop: "1.5rem" }}>
              <label style={{ display: "block", marginBottom: "0.75rem", color: theme === 'dark' ? "#94a3b8" : "#64748b", fontSize: "0.875rem", fontWeight: 600 }}>
                Team Access
              </label>
              <div style={{ display: "flex", gap: "1rem" }}>
                <button
                  type="button"
                  onClick={() => setAccessPolicy('open')}
                  style={{
                    flex: 1,
                    padding: "1rem",
                    borderRadius: "0.5rem",
                    border: accessPolicy === 'open' 
                      ? "2px solid #3b82f6" 
                      : theme === 'dark' ? "1px solid rgba(51, 65, 85, 0.3)" : "1px solid #cbd5e1",
                    background: accessPolicy === 'open'
                      ? theme === 'dark' ? "rgba(59, 130, 246, 0.1)" : "rgba(59, 130, 246, 0.05)"
                      : theme === 'dark' ? "rgba(15, 23, 42, 0.3)" : "#f9fafb",
                    color: theme === 'dark' ? "white" : "#1e293b",
                    cursor: "pointer",
                    transition: "all 0.2s ease",
                  }}
                >
                  <div style={{ fontWeight: 600, marginBottom: "0.25rem" }}>Open</div>
                  <div style={{ fontSize: "0.75rem", color: theme === 'dark' ? "#94a3b8" : "#64748b" }}>
                    Anyone can join directly
                  </div>
                </button>
                <button
                  type="button"
                  onClick={() => setAccessPolicy('closed')}
                  style={{
                    flex: 1,
                    padding: "1rem",
                    borderRadius: "0.5rem",
                    border: accessPolicy === 'closed' 
                      ? "2px solid #3b82f6" 
                      : theme === 'dark' ? "1px solid rgba(51, 65, 85, 0.3)" : "1px solid #cbd5e1",
                    background: accessPolicy === 'closed'
                      ? theme === 'dark' ? "rgba(59, 130, 246, 0.1)" : "rgba(59, 130, 246, 0.05)"
                      : theme === 'dark' ? "rgba(15, 23, 42, 0.3)" : "#f9fafb",
                    color: theme === 'dark' ? "white" : "#1e293b",
                    cursor: "pointer",
                    transition: "all 0.2s ease",
                  }}
                >
                  <div style={{ fontWeight: 600, marginBottom: "0.25rem" }}>Closed</div>
                  <div style={{ fontSize: "0.75rem", color: theme === 'dark' ? "#94a3b8" : "#64748b" }}>
                    Requires approval or invite
                  </div>
                </button>
              </div>
            </div>
          </div>
        </div>
        
        {/* Form Actions */}
        <div style={{
          display: "flex",
          justifyContent: "flex-end",
          gap: "1rem",
          marginTop: "2rem",
        }}>
          <Link 
            href="/teams" 
            style={{
              ...buttonStyle,
              textDecoration: "none",
              display: "inline-flex",
              alignItems: "center",
              height: "42px",
              padding: "0 1.5rem",
            }}
          >
            Cancel
          </Link>
          <button 
            type="submit"
            disabled={isSubmitting || !teamName.trim()}
            style={{
              ...primaryButtonStyle,
              height: "42px",
              padding: "0 2rem",
              opacity: isSubmitting || !teamName.trim() ? 0.5 : 1,
              cursor: isSubmitting || !teamName.trim() ? 'not-allowed' : 'pointer',
            }}
          >
            {isSubmitting ? 'Creating...' : 'Create Team'}
          </button>
        </div>
      </form>
    </div>
  );
}
