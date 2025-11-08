"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useTheme } from "../../../../components/ThemeProvider";
import { useAuth } from "../../../../context/AuthContext";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import PageLayout from "../../../../components/PageLayout";

type JoinRequest = {
  id: string;
  requester_id: string;
  username: string;
  avatar_url: string | null;
  created_at: string;
};

export default function TeamInboxPageClient({ teamId }: { teamId: string }) {
  const { theme } = useTheme();
  const { user } = useAuth();
  const supabase = createClientComponentClient();

  const [joinRequests, setJoinRequests] = useState<JoinRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [userRole, setUserRole] = useState<'owner' | 'admin' | null>(null);
  const [teamName, setTeamName] = useState("");

  const headingColor = theme === 'dark' ? "#e2e8f0" : "#1e293b";
  const textColor = theme === 'dark' ? "#e2e8f0" : "#1e293b";
  const mutedColor = theme === 'dark' ? "#94a3b8" : "#64748b";
  const cardStyle = {
    background: theme === 'dark' ? "rgba(30, 41, 59, 0.4)" : "rgba(241, 245, 249, 0.7)",
    borderRadius: "0.75rem",
    border: theme === 'dark' ? "1px solid rgba(51, 65, 85, 0.3)" : "1px solid rgba(203, 213, 225, 0.5)",
    padding: "1.5rem",
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

  // Check if user is owner/admin and fetch data
  useEffect(() => {
    async function checkAccess() {
      if (!user) {
        setLoading(false);
        return;
      }

      try {
        // Check user role
        const { data: memberData } = await supabase
          .from('group_members')
          .select('role')
          .eq('group_id', teamId)
          .eq('user_id', user.id)
          .single();

        if (!memberData || (memberData.role !== 'owner' && memberData.role !== 'admin')) {
          // Not authorized, redirect
          window.location.href = `/teams/${teamId}`;
          return;
        }

        setUserRole(memberData.role as 'owner' | 'admin');

        // Fetch team name
        const { data: teamData } = await supabase
          .from('groups')
          .select('name')
          .eq('id', teamId)
          .single();

        if (teamData) {
          setTeamName(teamData.name);
        }

        // Fetch pending join requests
        const { data: requestsData, error: requestsError } = await supabase
          .from('group_join_requests')
          .select(`
            id,
            requester_id,
            created_at,
            requester:profiles!group_join_requests_requester_id_fkey (
              username,
              avatar_url
            )
          `)
          .eq('group_id', teamId)
          .eq('status', 'pending')
          .order('created_at', { ascending: false });

        console.log('Join requests data:', requestsData);
        console.log('Join requests error:', requestsError);

        if (requestsData) {
          setJoinRequests(
            requestsData
              .filter((req: any) => req.requester) // Filter out any without requester data
              .map((req: any) => ({
                id: req.id,
                requester_id: req.requester_id,
                username: req.requester.username,
                avatar_url: req.requester.avatar_url,
                created_at: req.created_at,
              }))
          );
        }

        setLoading(false);
      } catch (error) {
        console.error('Error checking access:', error);
        setLoading(false);
      }
    }

    checkAccess();
  }, [user, teamId]);

  // Handle approve join request
  const handleApproveRequest = async (requestId: string, requesterId: string) => {
    try {
      // Update request status
      const { error: updateError } = await supabase
        .from('group_join_requests')
        .update({ status: 'approved' })
        .eq('id', requestId);

      if (updateError) {
        console.error('Error approving request:', updateError);
        return;
      }

      // Add user to group
      const { error: memberError } = await supabase
        .from('group_members')
        .insert({
          group_id: teamId,
          user_id: requesterId,
          role: 'member',
          total_commits: 0,
        });

      if (memberError) {
        // Check if it's a duplicate key error (user already a member)
        if (memberError.code === '23505') {
          console.log('User is already a member, continuing...');
        } else {
          console.error('Error adding member:', memberError);
          return;
        }
      }

      // Update requests list
      setJoinRequests(joinRequests.filter(r => r.id !== requestId));
    } catch (error) {
      console.error('Unexpected error approving request:', error);
    }
  };

  // Handle reject join request
  const handleRejectRequest = async (requestId: string) => {
    try {
      const { error } = await supabase
        .from('group_join_requests')
        .update({ status: 'rejected' })
        .eq('id', requestId);

      if (error) {
        console.error('Error rejecting request:', error);
        return;
      }

      // Update requests list
      setJoinRequests(joinRequests.filter(r => r.id !== requestId));
    } catch (error) {
      console.error('Unexpected error rejecting request:', error);
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

  if (!userRole) {
    return (
      <PageLayout>
        <div style={{ color: mutedColor, textAlign: "center", padding: "2rem" }}>
          You don't have permission to view this page
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
            href={`/teams/${teamId}`}
            style={{
              ...secondaryButtonStyle,
              textDecoration: "none",
              display: "inline-block",
              marginBottom: "1rem",
            }}
          >
            ← Back to {teamName}
          </Link>
          <h1 className="gradient-text" style={{ fontSize: "2.5rem", fontWeight: "bold" }}>
            Team Inbox
          </h1>
        </div>

        {/* Join Requests */}
        <div style={cardStyle}>
          <h2 style={{ fontSize: "1.25rem", fontWeight: 600, color: headingColor, marginBottom: "1rem" }}>
            Join Requests ({joinRequests.length})
          </h2>

          {joinRequests.length === 0 ? (
            <div style={{ color: mutedColor, textAlign: "center", padding: "2rem" }}>
              No pending join requests
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
              {joinRequests.map((request) => (
                <div
                  key={request.id}
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    padding: "1rem",
                    background: theme === 'dark' ? "rgba(15, 23, 42, 0.5)" : "rgba(255, 255, 255, 0.5)",
                    borderRadius: "0.5rem",
                    border: theme === 'dark' ? "1px solid rgba(51, 65, 85, 0.3)" : "1px solid rgba(203, 213, 225, 0.5)",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: "1rem", flex: 1 }}>
                    {request.avatar_url ? (
                      <img
                        src={request.avatar_url}
                        alt={request.username}
                        style={{
                          width: "3rem",
                          height: "3rem",
                          borderRadius: "50%",
                          objectFit: "cover",
                        }}
                      />
                    ) : (
                      <div
                        style={{
                          width: "3rem",
                          height: "3rem",
                          borderRadius: "50%",
                          background: "linear-gradient(to bottom right, #3b82f6, #8b5cf6)",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          color: "white",
                          fontWeight: 600,
                          fontSize: "1rem",
                        }}
                      >
                        {request.username.substring(0, 2).toUpperCase()}
                      </div>
                    )}
                    <div style={{ flex: 1 }}>
                      <div style={{ color: textColor, fontWeight: 600, fontSize: "1rem" }}>
                        {request.username}
                      </div>
                      <div style={{ color: mutedColor, fontSize: "0.875rem" }}>
                        Requested {new Date(request.created_at).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </div>
                    </div>
                  </div>

                  <div style={{ display: "flex", gap: "0.5rem", flexShrink: 0 }}>
                    <button
                      onClick={() => handleApproveRequest(request.id, request.requester_id)}
                      style={buttonStyle}
                    >
                      Approve
                    </button>
                    <button
                      onClick={() => handleRejectRequest(request.id)}
                      style={{
                        ...secondaryButtonStyle,
                        color: "#ef4444",
                        borderColor: theme === 'dark' ? "rgba(239, 68, 68, 0.3)" : "rgba(239, 68, 68, 0.2)",
                      }}
                    >
                      Reject
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
