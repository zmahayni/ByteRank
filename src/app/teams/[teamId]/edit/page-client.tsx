"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTheme } from "../../../../components/ThemeProvider";
import { useAuth } from "../../../../context/AuthContext";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import PageLayout from "../../../../components/PageLayout";

type TeamData = {
  id: string;
  name: string;
  description: string | null;
  avatar_url: string | null;
  owner_id: string;
};

export default function EditTeamPageClient({ teamId }: { teamId: string }) {
  const { theme } = useTheme();
  const { user } = useAuth();
  const router = useRouter();
  const supabase = createClientComponentClient();
  
  // Form state
  const [teamName, setTeamName] = useState("");
  const [teamDescription, setTeamDescription] = useState("");
  const [currentAvatarUrl, setCurrentAvatarUrl] = useState<string | null>(null);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isOwner, setIsOwner] = useState(false);
  const [teamData, setTeamData] = useState<TeamData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  
  // Load team data and verify ownership
  useEffect(() => {
    const fetchTeamData = async () => {
      if (!user || !teamId) {
        setLoading(false);
        return;
      }

      try {
        // Fetch team data
        const { data: team, error: teamError } = await supabase
          .from('groups')
          .select('id, name, description, avatar_url, owner_id')
          .eq('id', teamId)
          .single();

        if (teamError || !team) {
          console.error('Error fetching team:', teamError);
          setError('Team not found');
          setLoading(false);
          return;
        }

        // Check if user is the owner
        if (team.owner_id !== user.id) {
          setError('Only the team owner can edit this team');
          setIsOwner(false);
          setLoading(false);
          return;
        }

        setIsOwner(true);
        setTeamData(team);
        setTeamName(team.name);
        setTeamDescription(team.description || "");
        setCurrentAvatarUrl(team.avatar_url);
        setLoading(false);
      } catch (err) {
        console.error('Error:', err);
        setError('Failed to load team data');
        setLoading(false);
      }
    };

    fetchTeamData();
  }, [user, teamId, supabase]);
  
  // Handle avatar file selection
  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file size (5MB max)
      if (file.size > 5 * 1024 * 1024) {
        setError('File size must be less than 5MB');
        return;
      }

      // Validate file type
      const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
      if (!validTypes.includes(file.type)) {
        setError('File must be an image (JPEG, PNG, GIF, or WebP)');
        return;
      }

      setAvatarFile(file);
      
      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
      setError(null);
    }
  };

  // Upload avatar to storage
  const uploadAvatar = async (): Promise<string | null> => {
    if (!avatarFile || !user) return null;

    setUploading(true);
    try {
      const fileExt = avatarFile.name.split('.').pop();
      const fileName = `${teamId}/${Date.now()}.${fileExt}`;

      const { error: uploadError, data } = await supabase.storage
        .from('group-avatars')
        .upload(fileName, avatarFile, {
          cacheControl: '3600',
          upsert: false
        });

      if (uploadError) {
        console.error('Upload error:', uploadError);
        setError('Failed to upload avatar');
        setUploading(false);
        return null;
      }

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('group-avatars')
        .getPublicUrl(fileName);

      setUploading(false);
      return publicUrl;
    } catch (err) {
      console.error('Upload error:', err);
      setError('Failed to upload avatar');
      setUploading(false);
      return null;
    }
  };
  
  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isOwner || !teamData) {
      setError('You do not have permission to edit this team');
      return;
    }

    if (!teamName.trim()) {
      setError('Team name is required');
      return;
    }

    setSaving(true);
    setError(null);
    setSuccessMessage(null);

    try {
      // Upload avatar if a new file was selected
      let finalAvatarUrl = currentAvatarUrl;
      if (avatarFile) {
        const uploadedUrl = await uploadAvatar();
        if (uploadedUrl) {
          finalAvatarUrl = uploadedUrl;
        } else {
          setSaving(false);
          return; // Error message already set by uploadAvatar
        }
      }

      const { error: updateError } = await supabase
        .from('groups')
        .update({
          name: teamName.trim(),
          description: teamDescription.trim() || null,
          avatar_url: finalAvatarUrl,
        })
        .eq('id', teamId)
        .eq('owner_id', user!.id); // Double-check ownership in the query

      if (updateError) {
        console.error('Error updating team:', updateError);
        setError('Failed to update team. Please try again.');
        setSaving(false);
        return;
      }

      setSuccessMessage('Team updated successfully!');
      setSaving(false);
      
      // Update the current avatar URL to reflect the new one
      if (finalAvatarUrl) {
        setCurrentAvatarUrl(finalAvatarUrl);
      }
      
      // Clear the file selection
      setAvatarFile(null);
      setAvatarPreview(null);
    } catch (err) {
      console.error('Error:', err);
      setError('An unexpected error occurred');
      setSaving(false);
    }
  };
  
  // Theme-based colors
  const textColor = theme === 'dark' ? "#e2e8f0" : "#1e293b";
  const mutedColor = theme === 'dark' ? "#94a3b8" : "#64748b";
  const bgColor = theme === 'dark' ? "rgba(15, 23, 42, 0.95)" : "rgba(255, 255, 255, 0.95)";
  const borderColor = theme === 'dark' ? "rgba(51, 65, 85, 0.5)" : "rgba(203, 213, 225, 0.5)";
  
  const inputStyle = {
    width: "100%",
    padding: "0.75rem 1rem",
    borderRadius: "0.5rem",
    border: `1px solid ${borderColor}`,
    background: theme === 'dark' ? "rgba(30, 41, 59, 0.5)" : "rgba(248, 250, 252, 0.8)",
    color: textColor,
    fontSize: "1rem",
    outline: "none",
    transition: "all 0.2s",
  };

  const buttonStyle = {
    padding: "0.75rem 1.5rem",
    borderRadius: "0.5rem",
    border: `1px solid ${borderColor}`,
    background: theme === 'dark' ? "rgba(30, 41, 59, 0.5)" : "rgba(248, 250, 252, 0.8)",
    color: textColor,
    fontSize: "1rem",
    fontWeight: 500,
    cursor: "pointer",
    transition: "all 0.2s",
    textDecoration: "none",
    display: "inline-flex",
    alignItems: "center",
    gap: "0.5rem",
  };

  const primaryButtonStyle = {
    ...buttonStyle,
    background: "linear-gradient(to right, #3b82f6, #8b5cf6)",
    border: "none",
    color: "white",
  };

  if (loading) {
    return (
      <PageLayout>
        <div style={{ padding: "3rem", textAlign: "center", color: mutedColor }}>
          Loading team data...
        </div>
      </PageLayout>
    );
  }

  if (error && !isOwner) {
    return (
      <PageLayout>
        <div style={{
          padding: "3rem",
          textAlign: "center",
          maxWidth: "600px",
          margin: "0 auto",
        }}>
          <div style={{
            background: theme === 'dark' ? "rgba(239, 68, 68, 0.1)" : "rgba(239, 68, 68, 0.05)",
            border: `1px solid ${theme === 'dark' ? "rgba(239, 68, 68, 0.3)" : "rgba(239, 68, 68, 0.2)"}`,
            borderRadius: "0.75rem",
            padding: "2rem",
            marginBottom: "2rem",
          }}>
            <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ margin: "0 auto 1rem" }}>
              <circle cx="12" cy="12" r="10"></circle>
              <line x1="12" y1="8" x2="12" y2="12"></line>
              <line x1="12" y1="16" x2="12.01" y2="16"></line>
            </svg>
            <h2 style={{ fontSize: "1.5rem", fontWeight: 600, color: "#ef4444", marginBottom: "0.5rem" }}>
              Access Denied
            </h2>
            <p style={{ color: mutedColor, marginBottom: "1.5rem" }}>
              {error}
            </p>
            <Link href={`/teams/${teamId}`} style={buttonStyle}>
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M19 12H5M12 19l-7-7 7-7" />
              </svg>
              Back to Team
            </Link>
          </div>
        </div>
      </PageLayout>
    );
  }

  return (
    <PageLayout>
      <div style={{ maxWidth: "800px", margin: "0 auto" }}>
        {/* Header */}
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
            Edit Team
          </h1>
          <Link href={`/teams/${teamId}`} style={buttonStyle}>
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M19 12H5M12 19l-7-7 7-7" />
            </svg>
            Back to Team
          </Link>
        </div>

        {/* Messages */}
        {error && (
          <div style={{
            background: theme === 'dark' ? "rgba(239, 68, 68, 0.1)" : "rgba(239, 68, 68, 0.05)",
            border: `1px solid ${theme === 'dark' ? "rgba(239, 68, 68, 0.3)" : "rgba(239, 68, 68, 0.2)"}`,
            borderRadius: "0.75rem",
            padding: "1rem 1.5rem",
            marginBottom: "1.5rem",
            color: "#ef4444",
          }}>
            {error}
          </div>
        )}

        {successMessage && (
          <div style={{
            background: theme === 'dark' ? "rgba(34, 197, 94, 0.1)" : "rgba(34, 197, 94, 0.05)",
            border: `1px solid ${theme === 'dark' ? "rgba(34, 197, 94, 0.3)" : "rgba(34, 197, 94, 0.2)"}`,
            borderRadius: "0.75rem",
            padding: "1rem 1.5rem",
            marginBottom: "1.5rem",
            color: "#22c55e",
          }}>
            {successMessage}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} style={{
          background: bgColor,
          borderRadius: "1rem",
          border: `1px solid ${borderColor}`,
          boxShadow: theme === 'dark' ? 
            "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -2px rgba(0, 0, 0, 0.1)" : 
            "0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -2px rgba(0, 0, 0, 0.05)",
          padding: "2rem",
        }}>
          {/* Team Name */}
          <div style={{ marginBottom: "1.5rem" }}>
            <label style={{
              display: "block",
              marginBottom: "0.5rem",
              fontWeight: 600,
              color: textColor,
            }}>
              Team Name *
            </label>
            <input
              type="text"
              value={teamName}
              onChange={(e) => setTeamName(e.target.value)}
              placeholder="Enter team name"
              style={inputStyle}
              required
            />
          </div>

          {/* Team Description */}
          <div style={{ marginBottom: "1.5rem" }}>
            <label style={{
              display: "block",
              marginBottom: "0.5rem",
              fontWeight: 600,
              color: textColor,
            }}>
              Description
            </label>
            <textarea
              value={teamDescription}
              onChange={(e) => setTeamDescription(e.target.value)}
              placeholder="Enter team description"
              rows={4}
              style={{
                ...inputStyle,
                resize: "vertical",
                fontFamily: "inherit",
              }}
            />
          </div>

          {/* Avatar Upload */}
          <div style={{ marginBottom: "2rem" }}>
            <label style={{
              display: "block",
              marginBottom: "0.5rem",
              fontWeight: 600,
              color: textColor,
            }}>
              Team Avatar
            </label>
            
            {/* Avatar Preview */}
            <div style={{
              display: "flex",
              alignItems: "center",
              gap: "1.5rem",
            }}>
              {/* Current or Preview Avatar */}
              <div style={{
                width: "100px",
                height: "100px",
                borderRadius: "0.75rem",
                overflow: "hidden",
                border: `2px solid ${borderColor}`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}>
                {(avatarPreview || currentAvatarUrl) ? (
                  <img
                    src={avatarPreview || currentAvatarUrl || ""}
                    alt="Team avatar"
                    style={{
                      width: "100%",
                      height: "100%",
                      objectFit: "cover",
                    }}
                  />
                ) : (
                  <div style={{
                    width: "100%",
                    height: "100%",
                    background: "linear-gradient(to bottom right, #3b82f6, #8b5cf6)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "white",
                    fontWeight: 700,
                    fontSize: "2rem",
                  }}>
                    {teamName ? teamName.substring(0, 2).toUpperCase() : "??"}
                  </div>
                )}
              </div>
              
              <div style={{ flex: 1 }}>
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/gif,image/webp"
                  onChange={handleAvatarChange}
                  style={{ display: "none" }}
                  id="avatar-upload"
                />
                <label
                  htmlFor="avatar-upload"
                  style={{
                    ...buttonStyle,
                    cursor: "pointer",
                    display: "inline-flex",
                  }}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                    <polyline points="17 8 12 3 7 8"></polyline>
                    <line x1="12" y1="3" x2="12" y2="15"></line>
                  </svg>
                  {avatarFile ? 'Change Image' : (currentAvatarUrl ? 'Change Avatar' : 'Upload Avatar')}
                </label>
                <p style={{ fontSize: "0.875rem", color: mutedColor, marginTop: "0.5rem", marginBottom: 0 }}>
                  Recommended: 512×512px, max 5MB (JPEG, PNG, GIF, or WebP)
                </p>
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <div style={{ display: "flex", gap: "1rem", justifyContent: "flex-end" }}>
            <Link href={`/teams/${teamId}`} style={buttonStyle}>
              Cancel
            </Link>
            <button
              type="submit"
              disabled={saving || uploading}
              style={{
                ...primaryButtonStyle,
                opacity: (saving || uploading) ? 0.6 : 1,
                cursor: (saving || uploading) ? "not-allowed" : "pointer",
              }}
            >
              {uploading ? "Uploading..." : saving ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </form>
      </div>
    </PageLayout>
  );
}
