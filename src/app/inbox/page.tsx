"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useTheme } from "../../components/ThemeProvider";
import { useAuth } from "../../context/AuthContext";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import PageLayout from "../../components/PageLayout";

type FriendRequest = {
  id: string;
  requester_id: string;
  recipient_id: string;
  status: 'pending' | 'accepted' | 'declined';
  created_at: string;
  decided_at: string | null;
  requester: {
    id: string;
    username: string;
    avatar_url: string | null;
  };
  recipient: {
    id: string;
    username: string;
    avatar_url: string | null;
  };
};

export default function InboxPage() {
  const { theme } = useTheme();
  const { user } = useAuth();
  const supabase = createClientComponentClient();

  const [requests, setRequests] = useState<FriendRequest[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch friend requests for this user
  useEffect(() => {
    async function fetchRequests() {
      if (!user) {
        setLoading(false);
        return;
      }

      try {
        // Get all friend requests where user is either requester or recipient
        const { data, error } = await supabase
          .from('friend_requests')
          .select(`
            id,
            requester_id,
            recipient_id,
            status,
            created_at,
            decided_at,
            requester:requester_id(id, username, avatar_url),
            recipient:recipient_id(id, username, avatar_url)
          `)
          .or(`requester_id.eq.${user.id},recipient_id.eq.${user.id}`)
          .order('created_at', { ascending: false });

        if (error) {
          console.error('Error fetching requests:', error);
          return;
        }

        if (data) {
          setRequests(data as any);
        }
      } catch (error) {
        console.error('Unexpected error fetching requests:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchRequests();
  }, [user]);

  // Handle accept friend request
  const handleAccept = async (requestId: string, requesterId: string) => {
    if (!user) return;

    try {
      // Create friendship with canonical order
      const userIdA = requesterId < user.id ? requesterId : user.id;
      const userIdB = requesterId < user.id ? user.id : requesterId;

      const { error: friendshipError } = await supabase
        .from('friendships')
        .insert({
          user_id_a: userIdA,
          user_id_b: userIdB,
          created_at: new Date().toISOString(),
        });

      if (friendshipError) {
        console.error('Error creating friendship:', friendshipError);
        return;
      }

      // Delete the pending request
      const { error: deleteError } = await supabase
        .from('friend_requests')
        .delete()
        .eq('id', requestId);

      if (deleteError) {
        console.error('Error deleting request:', deleteError);
        return;
      }

      // Update local state
      setRequests(requests.filter(r => r.id !== requestId));
    } catch (error) {
      console.error('Unexpected error accepting request:', error);
    }
  };

  // Handle decline friend request
  const handleDecline = async (requestId: string, requesterId: string) => {
    if (!user) return;

    try {
      // Delete the pending request
      const { error: deleteError } = await supabase
        .from('friend_requests')
        .delete()
        .eq('id', requestId);

      if (deleteError) {
        console.error('Error deleting request:', deleteError);
        return;
      }

      // Update local state
      setRequests(requests.filter(r => r.id !== requestId));
    } catch (error) {
      console.error('Unexpected error declining request:', error);
    }
  };


  // Common styles
  const headingColor = theme === 'dark' ? "#e2e8f0" : "#1e293b";
  const labelColor = theme === 'dark' ? "#94a3b8" : "#64748b";
  const cardStyle = {
    background: theme === 'dark' ? "rgba(15, 23, 42, 0.95)" : "rgba(255, 255, 255, 0.95)",
    borderRadius: "0.75rem",
    border: theme === 'dark' ? "1px solid rgba(51, 65, 85, 0.5)" : "1px solid rgba(203, 213, 225, 0.5)",
    boxShadow: theme === 'dark' ? 
      "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -2px rgba(0, 0, 0, 0.1)" : 
      "0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -2px rgba(0, 0, 0, 0.05)"
  };

  const itemStyle = {
    background: theme === 'dark' ? "rgba(30, 41, 59, 0.4)" : "rgba(241, 245, 249, 0.7)",
    border: theme === 'dark' ? "1px solid rgba(51, 65, 85, 0.3)" : "1px solid rgba(203, 213, 225, 0.5)",
    borderRadius: "0.5rem",
  };

  const buttonStyle = {
    background: "linear-gradient(to right, #3b82f6, #8b5cf6)",
    color: "white",
    border: "none",
    borderRadius: "0.375rem",
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
    borderRadius: "0.375rem",
    padding: "0.5rem 1rem",
    fontSize: "0.875rem",
    fontWeight: 600,
    cursor: "pointer",
    transition: "all 0.2s ease",
  };

  if (loading) {
    return (
      <PageLayout>
        <div style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: "50vh",
          color: labelColor,
        }}>
          Loading inbox...
        </div>
      </PageLayout>
    );
  }

  return (
    <PageLayout>
      <div style={{
        padding: "2rem",
        maxWidth: "800px",
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
            Inbox
          </h1>
          <Link
            href="/teams"
            style={{
              ...secondaryButtonStyle,
              textDecoration: "none",
            }}
          >
            ← Back to Community
          </Link>
        </div>

        {/* Received Requests Section */}
        <div style={{ marginBottom: "2rem" }}>
          <h2 style={{
            fontSize: "1.25rem",
            fontWeight: 600,
            color: headingColor,
            marginBottom: "1rem",
          }}>
            Friend Requests
          </h2>
          <div style={cardStyle}>
            {requests.filter(r => r.recipient_id === user?.id && r.status === 'pending').length === 0 ? (
              <div style={{
                padding: "2rem",
                textAlign: "center",
                color: labelColor,
              }}>
                No friend requests
              </div>
            ) : (
              <div style={{
                display: "flex",
                flexDirection: "column",
                gap: "1rem",
              }}>
                {requests
                  .filter(r => r.recipient_id === user?.id && r.status === 'pending')
                  .map((request) => {
                    const otherUser = request.requester;

                    return (
                      <div
                        key={request.id}
                        style={{
                          ...itemStyle,
                          padding: "1rem",
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                        }}
                      >
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{
                            color: headingColor,
                            fontWeight: 600,
                            fontSize: "0.9375rem",
                            marginBottom: "0.25rem",
                          }}>
                            {otherUser.username}
                          </div>

                          <div style={{
                            fontSize: "0.75rem",
                            color: labelColor,
                          }}>
                            sent you a friend request · {new Date(request.created_at).toLocaleDateString('en-US', {
                              month: 'short',
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </div>
                        </div>

                        {/* Actions */}
                        <div style={{
                          display: "flex",
                          gap: "0.5rem",
                          flexShrink: 0,
                        }}>
                          <button
                            onClick={() => handleAccept(request.id, request.requester_id)}
                            style={buttonStyle}
                          >
                            Accept
                          </button>
                          <button
                            onClick={() => handleDecline(request.id, request.requester_id)}
                            style={secondaryButtonStyle}
                          >
                            Decline
                          </button>
                        </div>
                      </div>
                    );
                  })}
              </div>
            )}
          </div>
        </div>

        {/* Sent Requests Section */}
        <div>
          <h2 style={{
            fontSize: "1.25rem",
            fontWeight: 600,
            color: headingColor,
            marginBottom: "1rem",
          }}>
            Pending Requests
          </h2>
          <div style={cardStyle}>
            {requests.filter(r => r.requester_id === user?.id && r.status === 'pending').length === 0 ? (
              <div style={{
                padding: "2rem",
                textAlign: "center",
                color: labelColor,
              }}>
                No pending requests
              </div>
            ) : (
              <div style={{
                display: "flex",
                flexDirection: "column",
                gap: "1rem",
              }}>
                {requests
                  .filter(r => r.requester_id === user?.id && r.status === 'pending')
                  .map((request) => {
                    const otherUser = request.recipient;

                    return (
                      <div
                        key={request.id}
                        style={{
                          ...itemStyle,
                          padding: "1rem",
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                        }}
                      >
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{
                            color: headingColor,
                            fontWeight: 600,
                            fontSize: "0.9375rem",
                            marginBottom: "0.25rem",
                          }}>
                            {otherUser.username}
                          </div>

                          <div style={{
                            fontSize: "0.75rem",
                            color: labelColor,
                          }}>
                            pending · {new Date(request.created_at).toLocaleDateString('en-US', {
                              month: 'short',
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </div>
                        </div>
                      </div>
                    );
                  })}
              </div>
            )}
          </div>
        </div>
      </div>
    </PageLayout>
  );
}
