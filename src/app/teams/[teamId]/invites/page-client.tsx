"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useTheme } from "../../../../components/ThemeProvider";
import { useAuth } from "../../../../context/AuthContext";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import PageLayout from "../../../../components/PageLayout";

type Invite = {
  id: string;
  invited_user: string;
  username: string;
  avatar_url: string | null;
  created_at: string;
};

type JoinRequest = {
  id: string;
  requester_id: string;
  username: string;
  avatar_url: string | null;
  created_at: string;
};

type Friend = {
  id: string;
  username: string;
  avatar_url: string | null;
};

type SearchResult = Friend & {
  is_member?: boolean;
  is_invited?: boolean;
};

export default function InvitesPageClient({ teamId }: { teamId: string }) {
  const { theme } = useTheme();
  const { user } = useAuth();
  const supabase = createClientComponentClient();

  const [invites, setInvites] = useState<Invite[]>([]);
  const [joinRequests, setJoinRequests] = useState<JoinRequest[]>([]);
  const [friends, setFriends] = useState<Friend[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [loading, setLoading] = useState(true);
  const [userRole, setUserRole] = useState<'owner' | 'admin' | null>(null);
  const [teamName, setTeamName] = useState("");

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

        // Fetch pending invites
        const { data: invitesData } = await supabase
          .from('group_invitations')
          .select(`
            id,
            invited_user,
            created_at,
            profiles (
              username,
              avatar_url
            )
          `)
          .eq('group_id', teamId)
          .eq('status', 'pending')
          .order('created_at', { ascending: false });

        if (invitesData) {
          setInvites(
            invitesData.map((inv: any) => ({
              id: inv.id,
              invited_user: inv.invited_user,
              username: inv.profiles.username,
              avatar_url: inv.profiles.avatar_url,
              created_at: inv.created_at,
            }))
          );
        }

        // Fetch pending join requests
        const { data: requestsData } = await supabase
          .from('group_join_requests')
          .select(`
            id,
            requester_id,
            created_at,
            profiles (
              username,
              avatar_url
            )
          `)
          .eq('group_id', teamId)
          .eq('status', 'pending')
          .order('created_at', { ascending: false });

        if (requestsData) {
          setJoinRequests(
            requestsData.map((req: any) => ({
              id: req.id,
              requester_id: req.requester_id,
              username: req.profiles.username,
              avatar_url: req.profiles.avatar_url,
              created_at: req.created_at,
            }))
          );
        }

        // Fetch user's friends
        const { data: friendsData } = await supabase
          .from('friendships')
          .select(`
            user_id_a,
            user_id_b,
            profiles:user_id_a (id, username, avatar_url),
            profiles2:user_id_b (id, username, avatar_url)
          `)
          .or(`user_id_a.eq.${user.id},user_id_b.eq.${user.id}`);

        if (friendsData) {
          const friendsList = friendsData.map((friendship: any) => {
            const friend = friendship.user_id_a === user.id 
              ? friendship.profiles2 
              : friendship.profiles;
            return {
              id: friend.id,
              username: friend.username,
              avatar_url: friend.avatar_url,
            };
          });
          setFriends(friendsList);
          setSearchResults(friendsList);
        }

        setLoading(false);
      } catch (error) {
        console.error('Error checking access:', error);
        setLoading(false);
      }
    }

    checkAccess();
  }, [user, teamId]);

  // Handle search
  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      setSearchResults(friends);
      return;
    }

    setIsSearching(true);

    try {
      const { data: results } = await supabase
        .from('profiles')
        .select('id, username, avatar_url')
        .ilike('username', `%${searchQuery}%`)
        .limit(20);

      if (results) {
        // Check which are members and which are already invited
        const { data: memberIds } = await supabase
          .from('group_members')
          .select('user_id')
          .eq('group_id', teamId);

        const { data: invitedIds } = await supabase
          .from('group_invitations')
          .select('invited_user')
          .eq('group_id', teamId)
          .eq('status', 'pending');

        const memberSet = new Set(memberIds?.map(m => m.user_id) || []);
        const invitedSet = new Set(invitedIds?.map(i => i.invited_user) || []);

        const resultsWithStatus = results.map(r => ({
          ...r,
          is_member: memberSet.has(r.id),
          is_invited: invitedSet.has(r.id),
        }));

        setSearchResults(resultsWithStatus);
      }
    } catch (error) {
      console.error('Error searching:', error);
    } finally {
      setIsSearching(false);
    }
  };

  // Handle invite
  const handleInvite = async (userId: string) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('group_invitations')
        .insert({
          group_id: teamId,
          created_by: user.id,
          invited_user: userId,
          status: 'pending',
        });

      if (error) {
        console.error('Error sending invite:', error);
        return;
      }

      // Update search results
      setSearchResults(
        searchResults.map(r =>
          r.id === userId ? { ...r, is_invited: true } : r
        )
      );

      // Refresh invites list
      const { data: invitesData } = await supabase
        .from('group_invitations')
        .select(`
          id,
          invited_user,
          created_at,
          profiles (
            username,
            avatar_url
          )
        `)
        .eq('group_id', teamId)
        .eq('status', 'pending')
        .order('created_at', { ascending: false });

      if (invitesData) {
        setInvites(
          invitesData.map((inv: any) => ({
            id: inv.id,
            invited_user: inv.invited_user,
            username: inv.profiles.username,
            avatar_url: inv.profiles.avatar_url,
            created_at: inv.created_at,
          }))
        );
      }
    } catch (error) {
      console.error('Unexpected error inviting:', error);
    }
  };

  // Handle delete invite
  const handleDeleteInvite = async (inviteId: string) => {
    try {
      const { error } = await supabase
        .from('group_invitations')
        .delete()
        .eq('id', inviteId);

      if (error) {
        console.error('Error deleting invite:', error);
        return;
      }

      // Update invites list
      setInvites(invites.filter(i => i.id !== inviteId));

      // Update search results
      const deletedInvite = invites.find(i => i.id === inviteId);
      if (deletedInvite) {
        setSearchResults(
          searchResults.map(r =>
            r.id === deletedInvite.invited_user ? { ...r, is_invited: false } : r
          )
        );
      }
    } catch (error) {
      console.error('Unexpected error deleting invite:', error);
    }
  };

  // Handle approve join request
  const handleApproveRequest = async (requestId: string, requesterId: string) => {
    try {
      // Update request status
      const { error: updateError } = await supabase
        .from('group_join_requests')
        .update({ status: 'approved', decided_at: new Date().toISOString(), decided_by: user?.id })
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
        console.error('Error adding member:', memberError);
        return;
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
        .update({ status: 'rejected', decided_at: new Date().toISOString(), decided_by: user?.id })
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
          You don't have permission to invite members
        </div>
      </PageLayout>
    );
  }

  return (
    <PageLayout>
      <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
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
            Invites & Requests
          </h1>
        </div>

        <div style={{ display: "flex", gap: "2rem", flexWrap: "wrap" }}>
          {/* Left Column - Search and Invite */}
          <div style={{ flex: "1 1 500px" }}>
            <div style={{ ...cardStyle, marginBottom: "2rem" }}>
              <h2 style={{ fontSize: "1.25rem", fontWeight: 600, color: headingColor, marginBottom: "1rem" }}>
                Find People to Invite
              </h2>

              {/* Search */}
              <div style={{ display: "flex", gap: "0.5rem", marginBottom: "1rem" }}>
                <input
                  type="text"
                  placeholder="Search by username..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                  style={{
                    flex: 1,
                    padding: "0.75rem",
                    borderRadius: "0.5rem",
                    border: theme === 'dark' ? "1px solid rgba(51, 65, 85, 0.3)" : "1px solid rgba(203, 213, 225, 0.5)",
                    background: theme === 'dark' ? "rgba(15, 23, 42, 0.5)" : "rgba(255, 255, 255, 0.5)",
                    color: textColor,
                  }}
                />
                <button onClick={handleSearch} style={buttonStyle}>
                  Search
                </button>
              </div>

              {/* Results */}
              <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem", maxHeight: "500px", overflowY: "auto" }}>
                {searchResults.length === 0 ? (
                  <div style={{ color: mutedColor, textAlign: "center", padding: "1rem" }}>
                    {searchQuery ? "No results found" : "Search to find people"}
                  </div>
                ) : (
                  searchResults.map((person) => (
                    <div
                      key={person.id}
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        padding: "0.75rem",
                        background: theme === 'dark' ? "rgba(15, 23, 42, 0.5)" : "rgba(255, 255, 255, 0.5)",
                        borderRadius: "0.375rem",
                      }}
                    >
                      <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", flex: 1 }}>
                        {person.avatar_url ? (
                          <img
                            src={person.avatar_url}
                            alt={person.username}
                            style={{
                              width: "2.5rem",
                              height: "2.5rem",
                              borderRadius: "50%",
                              objectFit: "cover",
                            }}
                          />
                        ) : (
                          <div
                            style={{
                              width: "2.5rem",
                              height: "2.5rem",
                              borderRadius: "50%",
                              background: "linear-gradient(to bottom right, #3b82f6, #8b5cf6)",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              color: "white",
                              fontWeight: 600,
                              fontSize: "0.875rem",
                            }}
                          >
                            {person.username.substring(0, 2).toUpperCase()}
                          </div>
                        )}
                        <span style={{ color: textColor, fontWeight: 500 }}>{person.username}</span>
                      </div>

                      {person.is_member ? (
                        <span style={{ color: mutedColor, fontSize: "0.875rem" }}>Member</span>
                      ) : person.is_invited ? (
                        <span style={{ color: "#3b82f6", fontSize: "0.875rem", fontWeight: 600 }}>Invited</span>
                      ) : (
                        <button
                          onClick={() => handleInvite(person.id)}
                          style={buttonStyle}
                        >
                          Invite
                        </button>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Right Column - Pending Invites & Join Requests */}
          <div style={{ flex: "1 1 400px", display: "flex", flexDirection: "column", gap: "1.5rem" }}>
            {/* Join Requests Section */}
            <div style={cardStyle}>
              <h2 style={{ fontSize: "1.25rem", fontWeight: 600, color: headingColor, marginBottom: "1rem" }}>
                Join Requests ({joinRequests.length})
              </h2>

              {joinRequests.length === 0 ? (
                <div style={{ color: mutedColor, textAlign: "center", padding: "1rem" }}>
                  No pending requests
                </div>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                  {joinRequests.map((request) => (
                    <div
                      key={request.id}
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        padding: "0.75rem",
                        background: theme === 'dark' ? "rgba(15, 23, 42, 0.5)" : "rgba(255, 255, 255, 0.5)",
                        borderRadius: "0.375rem",
                      }}
                    >
                      <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", flex: 1 }}>
                        {request.avatar_url ? (
                          <img
                            src={request.avatar_url}
                            alt={request.username}
                            style={{
                              width: "2.5rem",
                              height: "2.5rem",
                              borderRadius: "50%",
                              objectFit: "cover",
                            }}
                          />
                        ) : (
                          <div
                            style={{
                              width: "2.5rem",
                              height: "2.5rem",
                              borderRadius: "50%",
                              background: "linear-gradient(to bottom right, #3b82f6, #8b5cf6)",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              color: "white",
                              fontWeight: 600,
                              fontSize: "0.875rem",
                            }}
                          >
                            {request.username.substring(0, 2).toUpperCase()}
                          </div>
                        )}
                        <div style={{ flex: 1 }}>
                          <div style={{ color: textColor, fontWeight: 500 }}>{request.username}</div>
                          <div style={{ color: mutedColor, fontSize: "0.75rem" }}>
                            {new Date(request.created_at).toLocaleDateString('en-US', {
                              month: 'short',
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </div>
                        </div>
                      </div>

                      <div style={{ display: "flex", gap: "0.5rem" }}>
                        <button
                          onClick={() => handleApproveRequest(request.id, request.requester_id)}
                          style={{
                            background: "linear-gradient(to right, #3b82f6, #8b5cf6)",
                            color: "white",
                            border: "none",
                            borderRadius: "0.375rem",
                            padding: "0.375rem 0.75rem",
                            fontSize: "0.75rem",
                            fontWeight: 600,
                            cursor: "pointer",
                            transition: "all 0.2s ease",
                          }}
                        >
                          Approve
                        </button>
                        <button
                          onClick={() => handleRejectRequest(request.id)}
                          style={{
                            background: "#ef4444",
                            color: "white",
                            border: "none",
                            borderRadius: "0.375rem",
                            padding: "0.375rem 0.75rem",
                            fontSize: "0.75rem",
                            fontWeight: 600,
                            cursor: "pointer",
                            transition: "all 0.2s ease",
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.background = "#dc2626";
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.background = "#ef4444";
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

            {/* Pending Invites Section */}
            <div style={cardStyle}>
              <h2 style={{ fontSize: "1.25rem", fontWeight: 600, color: headingColor, marginBottom: "1rem" }}>
                Pending Invites ({invites.length})
              </h2>

              {invites.length === 0 ? (
                <div style={{ color: mutedColor, textAlign: "center", padding: "1rem" }}>
                  No pending invites
                </div>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                  {invites.map((invite) => (
                    <div
                      key={invite.id}
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        padding: "0.75rem",
                        background: theme === 'dark' ? "rgba(15, 23, 42, 0.5)" : "rgba(255, 255, 255, 0.5)",
                        borderRadius: "0.375rem",
                      }}
                    >
                      <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", flex: 1 }}>
                        {invite.avatar_url ? (
                          <img
                            src={invite.avatar_url}
                            alt={invite.username}
                            style={{
                              width: "2.5rem",
                              height: "2.5rem",
                              borderRadius: "50%",
                              objectFit: "cover",
                            }}
                          />
                        ) : (
                          <div
                            style={{
                              width: "2.5rem",
                              height: "2.5rem",
                              borderRadius: "50%",
                              background: "linear-gradient(to bottom right, #3b82f6, #8b5cf6)",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              color: "white",
                              fontWeight: 600,
                              fontSize: "0.875rem",
                            }}
                          >
                            {invite.username.substring(0, 2).toUpperCase()}
                          </div>
                        )}
                        <div style={{ flex: 1 }}>
                          <div style={{ color: textColor, fontWeight: 500 }}>{invite.username}</div>
                          <div style={{ color: mutedColor, fontSize: "0.75rem" }}>
                            {new Date(invite.created_at).toLocaleDateString('en-US', {
                              month: 'short',
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </div>
                        </div>
                      </div>

                      <button
                        onClick={() => handleDeleteInvite(invite.id)}
                        style={{
                          background: "#ef4444",
                          color: "white",
                          border: "none",
                          borderRadius: "0.375rem",
                          padding: "0.375rem 0.75rem",
                          fontSize: "0.75rem",
                          fontWeight: 600,
                          cursor: "pointer",
                          transition: "all 0.2s ease",
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.background = "#dc2626";
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.background = "#ef4444";
                        }}
                      >
                        Delete
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </PageLayout>
  );
}
