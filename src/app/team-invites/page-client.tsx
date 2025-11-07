"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useTheme } from "../../components/ThemeProvider";
import { useAuth } from "../../context/AuthContext";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import PageLayout from "../../components/PageLayout";

type TeamInvite = {
  id: string;
  group_id: string;
  team_name: string;
  team_avatar: string | null;
  created_at: string;
};

export default function TeamInvitesPageClient() {
  const { theme } = useTheme();
  const { user } = useAuth();
  const supabase = createClientComponentClient();

  const [invites, setInvites] = useState<TeamInvite[]>([]);
  const [loading, setLoading] = useState(true);

  const headingColor = theme === 'dark' ? "#e2e8f0" : "#1e293b";
  const textColor = theme === 'dark' ? "#e2e8f0" : "#1e293b";
  const mutedColor = theme === 'dark' ? "#94a3b8" : "#64748b";
  const cardStyle = {
    background: theme === 'dark' ? "rgba(30, 41, 59, 0.4)" : "rgba(241, 245, 249, 0.7)",
    borderRadius: "0.5rem",
    border: theme === 'dark' ? "1px solid rgba(51, 65, 85, 0.3)" : "1px solid rgba(203, 213, 225, 0.5)",
    padding: "1rem",
  };
  const buttonStyle = {
    background: "linear-gradient(to right, #3b82f6, #8b5cf6)",
    color: "white",
    border: "none",
    borderRadius: "0.5rem",
    padding: "0.5rem 1rem",
    fontSize: "0.875rem",
    fontWeight: 600,
    cursor: "pointer",
    transition: "all 0.2s ease",
  };
  const secondaryButtonStyle = {
    background: theme === 'dark' ? "rgba(30, 41, 59, 0.4)" : "rgba(241, 245, 249, 0.8)",
    color: theme === 'dark' ? "white" : "hsl(220, 25%, 10%)",
    border: theme === 'dark' ? "1px solid rgba(51, 65, 85, 0.3)" : "1px solid rgba(203, 213, 225, 0.5)",
    borderRadius: "0.5rem",
    padding: "0.5rem 1rem",
    fontSize: "0.875rem",
    fontWeight: 600,
    cursor: "pointer",
    transition: "all 0.2s ease",
  };

  // Fetch pending invites
  useEffect(() => {
    async function fetchInvites() {
      if (!user) {
        setLoading(false);
        return;
      }

      try {
        const { data: invitesData } = await supabase
          .from('group_invitations')
          .select(`
            id,
            group_id,
            created_at,
            groups (
              name,
              avatar_url
            )
          `)
          .eq('invited_user', user.id)
          .eq('status', 'pending')
          .order('created_at', { ascending: false });

        if (invitesData) {
          setInvites(
            invitesData.map((inv: any) => ({
              id: inv.id,
              group_id: inv.group_id,
              team_name: inv.groups.name,
              team_avatar: inv.groups.avatar_url,
              created_at: inv.created_at,
            }))
          );
        }
      } catch (error) {
        console.error('Error fetching invites:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchInvites();
  }, [user]);

  // Handle accept invite
  const handleAccept = async (inviteId: string, groupId: string) => {
    if (!user) return;

    try {
      // Update invite status
      const { error: updateError } = await supabase
        .from('group_invitations')
        .update({ status: 'accepted', responded_at: new Date().toISOString() })
        .eq('id', inviteId);

      if (updateError) {
        console.error('Error accepting invite:', updateError);
        return;
      }

      // Add user to group as member
      const { error: memberError } = await supabase
        .from('group_members')
        .insert({
          group_id: groupId,
          user_id: user.id,
          role: 'member',
          total_commits: 0,
        });

      if (memberError) {
        console.error('Error adding to group:', memberError);
        return;
      }

      // Remove from list
      setInvites(invites.filter(i => i.id !== inviteId));
    } catch (error) {
      console.error('Unexpected error accepting invite:', error);
    }
  };

  // Handle decline invite
  const handleDecline = async (inviteId: string) => {
    try {
      const { error } = await supabase
        .from('group_invitations')
        .update({ status: 'declined', responded_at: new Date().toISOString() })
        .eq('id', inviteId);

      if (error) {
        console.error('Error declining invite:', error);
        return;
      }

      // Remove from list
      setInvites(invites.filter(i => i.id !== inviteId));
    } catch (error) {
      console.error('Unexpected error declining invite:', error);
    }
  };

  if (loading) {
    return (
      <PageLayout>
        <div style={{ color: mutedColor, textAlign: "center", padding: "2rem" }}>
          Loading...
        </div>
      </PageLayout>
    );
  }

  return (
    <PageLayout>
      <div style={{ maxWidth: "800px", margin: "0 auto" }}>
        {/* Header */}
        <div style={{ marginBottom: "2rem" }}>
          <Link
            href="/teams"
            style={{
              ...secondaryButtonStyle,
              textDecoration: "none",
              display: "inline-block",
              marginBottom: "1rem",
            }}
          >
            ← Back to Teams
          </Link>
          <h1 className="gradient-text" style={{ fontSize: "2.5rem", fontWeight: "bold" }}>
            Team Invites
          </h1>
        </div>

        {/* Invites List */}
        <div style={cardStyle}>
          {invites.length === 0 ? (
            <div style={{ color: mutedColor, textAlign: "center", padding: "2rem" }}>
              No pending team invites
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
              {invites.map((invite) => (
                <div
                  key={invite.id}
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    padding: "1rem",
                    background: theme === 'dark' ? "rgba(15, 23, 42, 0.5)" : "rgba(255, 255, 255, 0.5)",
                    borderRadius: "0.375rem",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: "1rem", flex: 1 }}>
                    {invite.team_avatar ? (
                      <img
                        src={invite.team_avatar}
                        alt={invite.team_name}
                        style={{
                          width: "3rem",
                          height: "3rem",
                          borderRadius: "0.375rem",
                          objectFit: "cover",
                        }}
                      />
                    ) : (
                      <div
                        style={{
                          width: "3rem",
                          height: "3rem",
                          borderRadius: "0.375rem",
                          background: "linear-gradient(to bottom right, #3b82f6, #8b5cf6)",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          color: "white",
                          fontWeight: 600,
                          fontSize: "1rem",
                        }}
                      >
                        {invite.team_name.substring(0, 2).toUpperCase()}
                      </div>
                    )}
                    <div style={{ flex: 1 }}>
                      <div style={{ color: textColor, fontWeight: 600, fontSize: "1rem" }}>
                        {invite.team_name}
                      </div>
                      <div style={{ color: mutedColor, fontSize: "0.875rem" }}>
                        Invited {new Date(invite.created_at).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                        })}
                      </div>
                    </div>
                  </div>

                  <div style={{ display: "flex", gap: "0.5rem", flexShrink: 0 }}>
                    <button
                      onClick={() => handleAccept(invite.id, invite.group_id)}
                      style={buttonStyle}
                    >
                      Accept
                    </button>
                    <button
                      onClick={() => handleDecline(invite.id)}
                      style={secondaryButtonStyle}
                    >
                      Decline
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </PageLayout>
  );
}
