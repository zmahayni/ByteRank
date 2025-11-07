"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useTheme } from "../../../components/ThemeProvider";
import { useAuth } from "../../../context/AuthContext";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import PageLayout from "../../../components/PageLayout";

type ProfileData = {
  id: string;
  username: string;
  description: string | null;
  avatar_url: string | null;
  github_url: string | null;
  linkedin_url: string | null;
  num_contributions: number | null;
  created_at: string;
};

export default function PublicProfilePage({ params }: { params: Promise<{ userId: string }> }) {
  const { theme } = useTheme();
  const { user } = useAuth();
  const supabase = createClientComponentClient();
  
  const [userId, setUserId] = useState<string>("");
  const [profileData, setProfileData] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [isFriend, setIsFriend] = useState(false);
  const [friendRequestSent, setFriendRequestSent] = useState(false);
  const [friendRequestStatus, setFriendRequestStatus] = useState<'pending' | 'accepted' | 'declined' | null>(null);

  // Unwrap params
  useEffect(() => {
    params.then(({ userId }) => setUserId(userId));
  }, [params]);

  // Fetch profile data
  useEffect(() => {
    async function fetchProfile() {
      if (!userId) return;

      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', userId)
          .single();

        if (error) {
          console.error('Error fetching profile:', error);
          return;
        }

        if (data) {
          setProfileData(data);
        }
      } catch (error) {
        console.error('Unexpected error fetching profile:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchProfile();
  }, [userId]);

  // Check friendship status
  useEffect(() => {
    async function checkFriendship() {
      if (!user || !userId || user.id === userId) return;

      try {
        // Check if they're already friends
        const { data: friendship } = await supabase
          .from('friendships')
          .select('*')
          .or(`and(user_id_a.eq.${user.id},user_id_b.eq.${userId}),and(user_id_a.eq.${userId},user_id_b.eq.${user.id})`)
          .single();

        if (friendship) {
          setIsFriend(true);
          return;
        }

        // Check if there's a pending friend request
        const { data: request } = await supabase
          .from('friend_requests')
          .select('*')
          .or(`and(requester_id.eq.${user.id},recipient_id.eq.${userId}),and(requester_id.eq.${userId},recipient_id.eq.${user.id})`)
          .single();

        if (request) {
          setFriendRequestStatus(request.status);
          if (request.status === 'pending' && request.requester_id === user.id) {
            setFriendRequestSent(true);
          }
        }
      } catch (error) {
        console.error('Error checking friendship:', error);
      }
    }

    checkFriendship();
  }, [user, userId]);

  // Handle remove friend
  const handleRemoveFriend = async () => {
    if (!user || !userId) return;

    try {
      // Delete friendship (works with canonical order)
      const userIdA = user.id < userId ? user.id : userId;
      const userIdB = user.id < userId ? userId : user.id;

      const { error } = await supabase
        .from('friendships')
        .delete()
        .eq('user_id_a', userIdA)
        .eq('user_id_b', userIdB);

      if (error) {
        console.error('Error removing friend:', error);
        return;
      }

      setIsFriend(false);
    } catch (error) {
      console.error('Unexpected error removing friend:', error);
    }
  };

  // Handle send friend request
  const handleSendFriendRequest = async () => {
    if (!user || !userId) return;

    try {
      // Check if they already sent us a request
      if (friendRequestStatus === 'pending') {
        // Auto-accept: create friendship
        const userIdA = user.id < userId ? user.id : userId;
        const userIdB = user.id < userId ? userId : user.id;

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

        // Delete both pending requests
        const { error: deleteError } = await supabase
          .from('friend_requests')
          .delete()
          .or(`and(requester_id.eq.${user.id},recipient_id.eq.${userId}),and(requester_id.eq.${userId},recipient_id.eq.${user.id})`)
          .eq('status', 'pending');

        if (deleteError) {
          console.error('Error deleting requests:', deleteError);
          return;
        }

        setIsFriend(true);
        setFriendRequestStatus(null);
        setFriendRequestSent(false);
      } else {
        // Normal request
        const { error } = await supabase
          .from('friend_requests')
          .insert({
            requester_id: user.id,
            recipient_id: userId,
            status: 'pending',
          });

        if (error) {
          console.error('Error sending friend request:', error);
          return;
        }

        setFriendRequestSent(true);
        setFriendRequestStatus('pending');
      }
    } catch (error) {
      console.error('Unexpected error sending friend request:', error);
    }
  };

  // Common styles
  const sectionStyle = {
    background: theme === 'dark' ? "rgba(15, 23, 42, 0.95)" : "rgba(255, 255, 255, 0.95)",
    borderRadius: "0.75rem",
    border: theme === 'dark' ? "1px solid rgba(51, 65, 85, 0.3)" : "1px solid rgba(203, 213, 225, 0.5)",
    padding: "1.5rem",
    marginBottom: "1.5rem",
    boxShadow: theme === 'dark' ? 
      "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -2px rgba(0, 0, 0, 0.1)" : 
      "0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -2px rgba(0, 0, 0, 0.05)"
  };

  const buttonStyle = {
    background: "linear-gradient(to right, #3b82f6, #8b5cf6)",
    color: "white",
    border: "none",
    borderRadius: "0.375rem",
    padding: "0.75rem 1.5rem",
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
    padding: "0.75rem 1.5rem",
    fontSize: "0.875rem",
    fontWeight: 600,
    cursor: "pointer",
    transition: "all 0.2s ease",
  };

  const headingColor = theme === 'dark' ? "#e2e8f0" : "#1e293b";
  const labelColor = theme === 'dark' ? "#94a3b8" : "#64748b";

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
          Loading profile...
        </div>
      </PageLayout>
    );
  }

  if (!profileData) {
    return (
      <PageLayout>
        <div style={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          minHeight: "50vh",
          color: labelColor,
          gap: "1rem",
        }}>
          <div>User not found.</div>
          <Link href="/teams" style={{ ...buttonStyle, textDecoration: "none" }}>
            Back to Community
          </Link>
        </div>
      </PageLayout>
    );
  }

  const isOwnProfile = user?.id === userId;

  return (
    <PageLayout>
      <div style={{
        padding: "2rem",
        maxWidth: "1000px",
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
            {profileData.username}
          </h1>
          {!isOwnProfile && (
            <div style={{ display: "flex", gap: "1rem" }}>
              <button 
                onClick={() => window.history.back()}
                style={secondaryButtonStyle}
              >
                ← Go Back
              </button>
              {isFriend && (
                <button 
                  onClick={handleRemoveFriend}
                  style={secondaryButtonStyle}
                >
                  Remove Friend
                </button>
              )}
              {!isFriend && !friendRequestSent && friendRequestStatus !== 'pending' && (
                <button 
                  onClick={handleSendFriendRequest}
                  style={buttonStyle}
                >
                  Add Friend
                </button>
              )}
              {friendRequestSent && (
                <div style={{
                  ...secondaryButtonStyle,
                  cursor: "default",
                  opacity: 0.6,
                  pointerEvents: "none",
                }}>
                  Request Sent
                </div>
              )}
            </div>
          )}
        </div>

        <div style={{ display: "flex", gap: "2rem", flexWrap: "wrap" }}>
          {/* Left Column - Profile Picture & Stats */}
          <div style={{ flex: "1 1 300px" }}>
            {/* Profile Picture Section */}
            <div style={sectionStyle}>
              <div style={{
                width: "100%",
                aspectRatio: "1",
                borderRadius: "1rem",
                border: "1px solid rgba(51, 65, 85, 0.3)",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                overflow: "hidden",
                background: profileData.avatar_url ? "transparent" : "rgba(30, 41, 59, 0.4)",
              }}>
                {profileData.avatar_url ? (
                  <img 
                    src={profileData.avatar_url} 
                    alt={profileData.username} 
                    style={{ width: "100%", height: "100%", objectFit: "cover" }} 
                  />
                ) : (
                  <>
                    <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ color: "#94a3b8", marginBottom: "0.75rem" }}>
                      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                      <circle cx="12" cy="7" r="4"></circle>
                    </svg>
                    <span style={{ color: "#94a3b8", fontSize: "0.875rem", textAlign: "center" }}>
                      No profile picture
                    </span>
                  </>
                )}
              </div>
            </div>

            {/* Stats Section */}
            <div style={sectionStyle}>
              <h2 style={{ fontSize: "1.25rem", fontWeight: 600, color: headingColor, marginBottom: "1rem" }}>
                Stats
              </h2>

              <div style={{
                display: "flex",
                flexDirection: "column",
                gap: "0.5rem",
              }}>
                <div style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  padding: "1rem",
                  background: theme === 'dark' ? "rgba(30, 41, 59, 0.3)" : "rgba(241, 245, 249, 0.7)",
                  borderRadius: "0.375rem",
                  border: theme === 'dark' ? "1px solid rgba(51, 65, 85, 0.3)" : "1px solid rgba(203, 213, 225, 0.5)",
                }}>
                  <span style={{ color: labelColor, fontSize: "0.875rem" }}>Total Contributions</span>
                  <span style={{ fontSize: "1.5rem", fontWeight: 700, color: "#60a5fa" }}>
                    {profileData.num_contributions || 0}
                  </span>
                </div>

                <div style={{
                  padding: "1rem",
                  background: theme === 'dark' ? "rgba(30, 41, 59, 0.3)" : "rgba(241, 245, 249, 0.7)",
                  borderRadius: "0.375rem",
                  border: theme === 'dark' ? "1px solid rgba(51, 65, 85, 0.3)" : "1px solid rgba(203, 213, 225, 0.5)",
                }}>
                  <div style={{ color: labelColor, fontSize: "0.875rem", marginBottom: "0.25rem" }}>Member Since</div>
                  <div style={{ color: headingColor, fontWeight: 500 }}>
                    {new Date(profileData.created_at).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Profile Info */}
          <div style={{ flex: "1 1 400px" }}>
            {/* Profile Information Section */}
            <div style={sectionStyle}>
              <h2 style={{ fontSize: "1.25rem", fontWeight: 600, color: headingColor, marginBottom: "1.5rem" }}>
                About
              </h2>

              {profileData.description ? (
                <p style={{ color: labelColor, lineHeight: "1.6", marginBottom: "1.5rem" }}>
                  {profileData.description}
                </p>
              ) : (
                <p style={{ color: labelColor, fontStyle: "italic" }}>
                  No bio provided
                </p>
              )}
            </div>

            {/* Social Links Section */}
            <div style={sectionStyle}>
              <h2 style={{ fontSize: "1.25rem", fontWeight: 600, color: headingColor, marginBottom: "1.5rem" }}>
                Social Links
              </h2>

              <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                <div>
                  <div style={{ color: labelColor, fontSize: "0.875rem", marginBottom: "0.5rem" }}>GitHub</div>
                  {profileData.github_url ? (
                    <a 
                      href={profileData.github_url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "0.75rem",
                        padding: "0.75rem 1rem",
                        background: theme === 'dark' ? "rgba(30, 41, 59, 0.3)" : "rgba(241, 245, 249, 0.7)",
                        borderRadius: "0.375rem",
                        border: theme === 'dark' ? "1px solid rgba(51, 65, 85, 0.3)" : "1px solid rgba(203, 213, 225, 0.5)",
                        textDecoration: "none",
                        color: "#3b82f6",
                        transition: "all 0.2s ease",
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = theme === 'dark' ? "rgba(30, 41, 59, 0.5)" : "rgba(241, 245, 249, 0.9)";
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = theme === 'dark' ? "rgba(30, 41, 59, 0.3)" : "rgba(241, 245, 249, 0.7)";
                      }}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"></path>
                      </svg>
                      <span>View Profile</span>
                    </a>
                  ) : (
                    <div style={{
                      padding: "0.75rem 1rem",
                      background: theme === 'dark' ? "rgba(30, 41, 59, 0.2)" : "rgba(241, 245, 249, 0.5)",
                      borderRadius: "0.375rem",
                      border: theme === 'dark' ? "1px solid rgba(51, 65, 85, 0.2)" : "1px solid rgba(203, 213, 225, 0.3)",
                      color: labelColor,
                      fontSize: "0.875rem",
                    }}>
                      Not provided
                    </div>
                  )}
                </div>

                <div>
                  <div style={{ color: labelColor, fontSize: "0.875rem", marginBottom: "0.5rem" }}>LinkedIn</div>
                  {profileData.linkedin_url ? (
                    <a 
                      href={profileData.linkedin_url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "0.75rem",
                        padding: "0.75rem 1rem",
                        background: theme === 'dark' ? "rgba(30, 41, 59, 0.3)" : "rgba(241, 245, 249, 0.7)",
                        borderRadius: "0.375rem",
                        border: theme === 'dark' ? "1px solid rgba(51, 65, 85, 0.3)" : "1px solid rgba(203, 213, 225, 0.5)",
                        textDecoration: "none",
                        color: "#3b82f6",
                        transition: "all 0.2s ease",
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = theme === 'dark' ? "rgba(30, 41, 59, 0.5)" : "rgba(241, 245, 249, 0.9)";
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = theme === 'dark' ? "rgba(30, 41, 59, 0.3)" : "rgba(241, 245, 249, 0.7)";
                      }}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"></path>
                        <rect x="2" y="9" width="4" height="12"></rect>
                        <circle cx="4" cy="4" r="2"></circle>
                      </svg>
                      <span>View Profile</span>
                    </a>
                  ) : (
                    <div style={{
                      padding: "0.75rem 1rem",
                      background: theme === 'dark' ? "rgba(30, 41, 59, 0.2)" : "rgba(241, 245, 249, 0.5)",
                      borderRadius: "0.375rem",
                      border: theme === 'dark' ? "1px solid rgba(51, 65, 85, 0.2)" : "1px solid rgba(203, 213, 225, 0.3)",
                      color: labelColor,
                      fontSize: "0.875rem",
                    }}>
                      Not provided
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </PageLayout>
  );
}
