"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useTheme } from "../../components/ThemeProvider";
import { useAuth } from "../../context/AuthContext";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import PageLayout from "../../components/PageLayout";
import Card from "../../components/Card";

type Team = {
  id: string;
  name: string;
  avatar_url: string | null;
  member_count: number;
  user_role?: string;
  user_rank?: number;
  is_member?: boolean;
};

type SearchTeam = {
  type: 'team';
  id: string;
  name: string;
  avatar_url: string | null;
  member_count: number;
  is_member: boolean;
  access_policy: string;
  has_requested?: boolean;
};

type SearchPerson = {
  type: 'person';
  id: string;
  username: string;
  avatar_url: string | null;
  description: string | null;
};

type SearchResult = SearchTeam | SearchPerson;

export default function CommunityPage() {
  const { theme } = useTheme();
  const { user } = useAuth();
  const supabase = createClientComponentClient();
  
  // State for teams data
  const [myTeams, setMyTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(true);
  
  // State for search functionality
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  
  // Fetch user's teams
  useEffect(() => {
    async function fetchMyTeams() {
      if (!user) {
        setLoading(false);
        return;
      }
      
      try {
        // Get teams where user is a member
        const { data: memberData, error: memberError } = await supabase
          .from('group_members')
          .select(`
            group_id,
            role,
            total_commits,
            groups (
              id,
              name,
              avatar_url
            )
          `)
          .eq('user_id', user.id);
        
        if (memberError) {
          console.error('Error fetching teams:', memberError);
          return;
        }
        
        if (!memberData) return;
        
        // For each team, get member count and user's rank
        const teamsWithDetails = await Promise.all(
          memberData.map(async (membership: any) => {
            const groupId = membership.group_id;
            
            // Get member count
            const { count } = await supabase
              .from('group_members')
              .select('*', { count: 'exact', head: true })
              .eq('group_id', groupId);
            
            // Get all members' commits to calculate rank
            const { data: members } = await supabase
              .from('group_members')
              .select('user_id, total_commits')
              .eq('group_id', groupId)
              .order('total_commits', { ascending: false });
            
            // Calculate user's rank
            const userRank = members?.findIndex(m => m.user_id === user.id) ?? -1;
            
            return {
              id: membership.groups.id,
              name: membership.groups.name,
              avatar_url: membership.groups.avatar_url,
              member_count: count || 0,
              user_role: membership.role,
              user_rank: userRank + 1, // Convert to 1-indexed
            };
          })
        );
        
        setMyTeams(teamsWithDetails);
      } catch (error) {
        console.error('Unexpected error fetching teams:', error);
      } finally {
        setLoading(false);
      }
    }
    
    fetchMyTeams();
  }, [user]);
  
  // Handle unified search for both people and teams
  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    
    setIsSearching(true);
    
    try {
      // Search for teams by name
      const { data: teamsData, error: teamsError } = await supabase
        .from('groups')
        .select('id, name, avatar_url, access_policy')
        .ilike('name', `%${searchQuery}%`)
        .limit(10);
      
      if (teamsError) {
        console.error('Error searching teams:', teamsError);
      }
      
      // Search for people by username
      const { data: peopleData, error: peopleError } = await supabase
        .from('profiles')
        .select('id, username, avatar_url, description')
        .ilike('username', `%${searchQuery}%`)
        .limit(10);
      
      if (peopleError) {
        console.error('Error searching people:', peopleError);
      }
      
      // Process teams: get member count and check if user is member or has requested
      const teamsWithDetails: SearchTeam[] = await Promise.all(
        (teamsData || []).map(async (team) => {
          const { count } = await supabase
            .from('group_members')
            .select('*', { count: 'exact', head: true })
            .eq('group_id', team.id);
          
          // Check if user is already a member
          const { data: memberCheck } = await supabase
            .from('group_members')
            .select('user_id')
            .eq('group_id', team.id)
            .eq('user_id', user?.id || '')
            .single();
          
          // Check if user has pending request
          const { data: requestCheck } = await supabase
            .from('group_join_requests')
            .select('id')
            .eq('group_id', team.id)
            .eq('requester_id', user?.id || '')
            .eq('status', 'pending')
            .single();
          
          return {
            type: 'team',
            id: team.id,
            name: team.name,
            avatar_url: team.avatar_url,
            member_count: count || 0,
            is_member: !!memberCheck,
            access_policy: team.access_policy,
            has_requested: !!requestCheck,
          };
        })
      );
      
      // Add type to people results
      const peopleWithType: SearchPerson[] = (peopleData || []).map(person => ({
        type: 'person',
        id: person.id,
        username: person.username,
        avatar_url: person.avatar_url,
        description: person.description,
      }));
      
      // Combine and sort alphabetically by name/username
      const combined = [...teamsWithDetails, ...peopleWithType].sort((a, b) => {
        const nameA = (a.type === 'team' ? a.name : a.username).toLowerCase();
        const nameB = (b.type === 'team' ? b.name : b.username).toLowerCase();
        return nameA.localeCompare(nameB);
      });
      
      setSearchResults(combined);
    } catch (error) {
      console.error('Unexpected error searching:', error);
    } finally {
      setIsSearching(false);
    }
  };
  
  // Clear search
  const clearSearch = () => {
    setSearchQuery("");
    setSearchResults([]);
  };
  
  // Common button styles - theme aware
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
  };
  
  const activeButtonStyle = {
    ...buttonStyle,
    background: "linear-gradient(to right, rgba(59, 130, 246, 0.7), rgba(147, 51, 234, 0.7))",
    color: "white",
    border: "1px solid rgba(79, 70, 229, 0.3)",
  };
  
  const primaryButtonStyle = {
    background: "linear-gradient(to right, #3b82f6, #8b5cf6)",
    color: "white",
    border: "none",
    borderRadius: "0.5rem",
    padding: "0.5rem 1rem",
    fontSize: "0.875rem",
    fontWeight: 600,
    cursor: "pointer",
    transition: "all 0.2s ease",
    display: "flex",
    alignItems: "center",
    gap: "0.5rem",
  };
  
  // Text color styles
  const headingColor = theme === 'dark' ? "#e2e8f0" : "#1e293b";
  const labelColor = theme === 'dark' ? "#94a3b8" : "#64748b";
  
  // Card styles
  const cardStyle = {
    background: theme === 'dark' ? "rgba(15, 23, 42, 0.95)" : "rgba(255, 255, 255, 0.95)",
    borderRadius: "1rem",
    border: theme === 'dark' ? "1px solid rgba(51, 65, 85, 0.5)" : "1px solid rgba(203, 213, 225, 0.5)",
    boxShadow: theme === 'dark' ? 
      "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -2px rgba(0, 0, 0, 0.1)" : 
      "0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -2px rgba(0, 0, 0, 0.05)"
  };
  
  // Team item style
  const teamItemStyle = {
    background: theme === 'dark' ? "rgba(30, 41, 59, 0.4)" : "rgba(241, 245, 249, 0.7)",
    border: theme === 'dark' ? "1px solid rgba(51, 65, 85, 0.3)" : "1px solid rgba(203, 213, 225, 0.5)",
    borderRadius: "0.375rem",
  };

  // Friends list state and functions
  const [friends, setFriends] = useState<any[]>([]);
  const [friendsLoading, setFriendsLoading] = useState(true);
  const [friendsSearchQuery, setFriendsSearchQuery] = useState("");
  const [friendsSearchResults, setFriendsSearchResults] = useState<any[]>([]);

  // Inbox state
  const [hasUnreadInbox, setHasUnreadInbox] = useState(false);

  // Handle join team (open teams only)
  const handleJoinTeam = async (teamId: string) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('group_members')
        .insert({
          group_id: teamId,
          user_id: user.id,
          role: 'member',
          total_commits: 0,
        });

      if (error) {
        console.error('Error joining team:', error);
        return;
      }

      // Update search results to show as member
      setSearchResults(searchResults.map(result => 
        result.type === 'team' && result.id === teamId 
          ? { ...result, is_member: true }
          : result
      ));

      // Refresh teams list
      const { data: memberData } = await supabase
        .from('group_members')
        .select(`
          group_id,
          role,
          total_commits,
          groups (
            id,
            name,
            avatar_url
          )
        `)
        .eq('user_id', user.id);

      if (memberData) {
        const teamsWithDetails = await Promise.all(
          memberData.map(async (membership: any) => {
            const groupId = membership.group_id;
            const { count } = await supabase
              .from('group_members')
              .select('*', { count: 'exact', head: true })
              .eq('group_id', groupId);
            const { data: members } = await supabase
              .from('group_members')
              .select('user_id, total_commits')
              .eq('group_id', groupId)
              .order('total_commits', { ascending: false });
            const userRank = members?.findIndex(m => m.user_id === user.id) ?? -1;
            return {
              id: membership.groups.id,
              name: membership.groups.name,
              avatar_url: membership.groups.avatar_url,
              member_count: count || 0,
              user_role: membership.role,
              user_rank: userRank + 1,
            };
          })
        );
        setMyTeams(teamsWithDetails);
      }
    } catch (error) {
      console.error('Unexpected error joining team:', error);
    }
  };

  // Handle request to join (closed teams)
  const handleRequestToJoin = async (teamId: string) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('group_join_requests')
        .insert({
          group_id: teamId,
          requester_id: user.id,
          status: 'pending',
        });

      if (error) {
        console.error('Error requesting to join:', error);
        return;
      }

      // Update search results to show request sent
      setSearchResults(searchResults.map(result => 
        result.type === 'team' && result.id === teamId 
          ? { ...result, has_requested: true }
          : result
      ));
    } catch (error) {
      console.error('Unexpected error requesting to join:', error);
    }
  };

  // Fetch friends from friendships table
  useEffect(() => {
    async function fetchFriends() {
      if (!user) {
        setFriendsLoading(false);
        return;
      }

      try {
        // Get all friendships where user is either user_id_a or user_id_b
        const { data, error } = await supabase
          .from('friendships')
          .select(`
            user_id_a,
            user_id_b,
            created_at
          `)
          .or(`user_id_a.eq.${user.id},user_id_b.eq.${user.id}`);

        if (error) {
          console.error('Error fetching friendships:', error);
          return;
        }

        if (!data) return;

        // Extract friend IDs
        const friendIds = data.map(friendship => 
          friendship.user_id_a === user.id ? friendship.user_id_b : friendship.user_id_a
        );

        if (friendIds.length === 0) {
          setFriends([]);
          setFriendsLoading(false);
          return;
        }

        // Fetch friend profiles
        const { data: profiles, error: profileError } = await supabase
          .from('profiles')
          .select('id, username, avatar_url, description')
          .in('id', friendIds);

        if (profileError) {
          console.error('Error fetching friend profiles:', profileError);
          return;
        }

        setFriends(profiles || []);
      } catch (error) {
        console.error('Unexpected error fetching friends:', error);
      } finally {
        setFriendsLoading(false);
      }
    }

    fetchFriends();
  }, [user]);

  // Handle friends search
  const handleFriendsSearch = () => {
    if (!friendsSearchQuery.trim()) {
      setFriendsSearchResults(friends);
      return;
    }

    const results = friends.filter(friend =>
      friend.username.toLowerCase().includes(friendsSearchQuery.toLowerCase())
    );

    setFriendsSearchResults(results);
  };

  // Update search results when query changes or friends list updates
  useEffect(() => {
    if (friendsSearchQuery.trim()) {
      handleFriendsSearch();
    } else {
      setFriendsSearchResults(friends);
    }
  }, [friends]);

  // Check for unread inbox items
  useEffect(() => {
    async function checkUnreadInbox() {
      if (!user) return;

      try {
        const { data, error } = await supabase
          .from('friend_requests')
          .select('id', { count: 'exact', head: true })
          .eq('recipient_id', user.id)
          .eq('status', 'pending');

        if (error) {
          console.error('Error checking unread inbox:', error);
          return;
        }

        setHasUnreadInbox(data && data.length > 0);
      } catch (error) {
        console.error('Unexpected error checking unread inbox:', error);
      }
    }

    checkUnreadInbox();
  }, [user]);

  // Friends list component for right sidebar
  const FriendsList = () => (
    <div style={{
      background: theme === 'dark' ? "rgba(15, 23, 42, 0.95)" : "rgba(255, 255, 255, 0.95)",
      borderRadius: "1rem",
      border: theme === 'dark' ? "1px solid rgba(51, 65, 85, 0.5)" : "1px solid rgba(203, 213, 225, 0.5)",
      boxShadow: theme === 'dark' ? 
        "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -2px rgba(0, 0, 0, 0.1)" : 
        "0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -2px rgba(0, 0, 0, 0.05)",
      padding: "1.5rem",
      display: "flex",
      flexDirection: "column",
      height: "100%",
    }}>
      <h3 style={{ 
        fontSize: "1.125rem", 
        fontWeight: 600, 
        color: theme === 'dark' ? "#e2e8f0" : "#1e293b",
        marginTop: 0,
        marginBottom: "1rem"
      }}>
        Friends
      </h3>

      {/* Friends Search */}
      <div style={{
        display: "flex",
        gap: "0.5rem",
        marginBottom: "1rem",
      }}>
        <input
          type="text"
          placeholder="Search friends..."
          value={friendsSearchQuery}
          onChange={(e) => setFriendsSearchQuery(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleFriendsSearch()}
          style={{
            flex: 1,
            padding: "0.5rem 0.75rem",
            borderRadius: "0.375rem",
            border: theme === 'dark' ? "1px solid rgba(51, 65, 85, 0.5)" : "1px solid rgba(203, 213, 225, 0.5)",
            background: theme === 'dark' ? "rgba(15, 23, 42, 0.4)" : "rgba(248, 250, 252, 0.8)",
            color: theme === 'dark' ? "white" : "hsl(220, 25%, 10%)",
            fontSize: "0.75rem",
          }}
        />
        <button
          onClick={handleFriendsSearch}
          style={{
            padding: "0.5rem 0.75rem",
            background: "linear-gradient(to right, #3b82f6, #8b5cf6)",
            color: "white",
            border: "none",
            borderRadius: "0.375rem",
            cursor: "pointer",
            fontSize: "0.75rem",
            fontWeight: 600,
            transition: "all 0.2s ease",
          }}
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8"></circle>
            <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
          </svg>
        </button>
      </div>

      {/* Friends List */}
      <div style={{
        display: "flex",
        flexDirection: "column",
        gap: "0.75rem",
        overflowY: "auto",
        flex: 1,
        minHeight: 0,
      }}>
        {friendsLoading ? (
          <div style={{ color: labelColor, fontSize: "0.875rem", textAlign: "center", padding: "1rem" }}>
            Loading friends...
          </div>
        ) : friendsSearchResults.length === 0 ? (
          <div style={{ color: labelColor, fontSize: "0.875rem", textAlign: "center", padding: "1rem" }}>
            {friendsSearchQuery ? "No friends match your search" : "No friends yet"}
          </div>
        ) : (
          friendsSearchResults.map((friend) => (
            <Link
              key={friend.id}
              href={`/profile/${friend.id}`}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "0.75rem",
                padding: "0.75rem",
                borderRadius: "0.5rem",
                background: theme === 'dark' ? "rgba(30, 41, 59, 0.4)" : "rgba(241, 245, 249, 0.7)",
                transition: "background 0.2s",
                cursor: "pointer",
                textDecoration: "none",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = theme === 'dark' ? "rgba(30, 41, 59, 0.6)" : "rgba(241, 245, 249, 0.9)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = theme === 'dark' ? "rgba(30, 41, 59, 0.4)" : "rgba(241, 245, 249, 0.7)";
              }}
            >
              {friend.avatar_url ? (
                <img
                  src={friend.avatar_url}
                  alt={friend.username}
                  style={{
                    width: "2.5rem",
                    height: "2.5rem",
                    borderRadius: "50%",
                    objectFit: "cover",
                    flexShrink: 0,
                  }}
                />
              ) : (
                <div style={{
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
                  flexShrink: 0,
                }}>
                  {friend.username.substring(0, 2).toUpperCase()}
                </div>
              )}
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ 
                  fontSize: "0.875rem", 
                  color: theme === 'dark' ? "#e2e8f0" : "#1e293b",
                  fontWeight: 500,
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                }}>
                  {friend.username}
                </div>
              </div>
            </Link>
          ))
        )}
      </div>
    </div>
  );

  return (
    <PageLayout>
      {/* Page Header */}
      <div style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: "var(--margin-bottom)",
      }}>
        <h1 className="gradient-text" style={{
          fontSize: "2.5rem",
          fontWeight: "bold",
        }}>
          Community
        </h1>
        <Link
          href="/inbox"
          style={{
            position: "relative",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            width: "2.5rem",
            height: "2.5rem",
            borderRadius: "0.5rem",
            background: theme === 'dark' ? "rgba(30, 41, 59, 0.4)" : "rgba(241, 245, 249, 0.7)",
            border: theme === 'dark' ? "1px solid rgba(51, 65, 85, 0.3)" : "1px solid rgba(203, 213, 225, 0.5)",
            cursor: "pointer",
            transition: "all 0.2s ease",
            textDecoration: "none",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = theme === 'dark' ? "rgba(30, 41, 59, 0.6)" : "rgba(241, 245, 249, 0.9)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = theme === 'dark' ? "rgba(30, 41, 59, 0.4)" : "rgba(241, 245, 249, 0.7)";
          }}
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: theme === 'dark' ? "#e2e8f0" : "#1e293b" }}>
            <rect x="2" y="4" width="20" height="16" rx="2"></rect>
            <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"></path>
          </svg>
          {hasUnreadInbox && (
            <div style={{
              position: "absolute",
              top: "-4px",
              right: "-4px",
              width: "8px",
              height: "8px",
              borderRadius: "50%",
              background: "#ef4444",
              border: "2px solid " + (theme === 'dark' ? "rgba(15, 23, 42, 0.95)" : "rgba(255, 255, 255, 0.95)"),
            }} />
          )}
        </Link>
      </div>
      
      {/* Main Layout with Content and Friends List */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "1fr 280px",
        gap: "2rem",
        width: "100%",
        alignItems: "start",
      }}>
        {/* Main Content */}
        <div style={{
          display: "flex",
          flexDirection: "column",
          gap: "var(--gap-large)",
        }}>
        {/* Search Section */}
        <Card title="Find Teams & People">
          <div style={{
            display: "flex",
            flexDirection: "column",
            gap: "1rem",
          }}>
            <div style={{
              display: "flex",
              gap: "0.5rem",
              width: "100%",
            }}>
              <input 
                type="text" 
                placeholder="Search teams or people..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                style={{
                  flex: 1,
                  padding: "0.75rem 1rem",
                  borderRadius: "0.5rem",
                  border: theme === 'dark' ? "1px solid rgba(51, 65, 85, 0.5)" : "1px solid rgba(203, 213, 225, 0.5)",
                  background: theme === 'dark' ? "rgba(15, 23, 42, 0.4)" : "rgba(248, 250, 252, 0.8)",
                  color: theme === 'dark' ? "white" : "hsl(220, 25%, 10%)",
                  fontSize: "0.875rem",
                }}
              />
              <button 
                onClick={handleSearch}
                style={primaryButtonStyle}
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="11" cy="11" r="8"></circle>
                  <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                </svg>
                Search
              </button>
            </div>
          </div>
          
          {/* Search Results */}
          {searchResults.length > 0 && (
            <div style={{
              marginTop: "1.5rem",
              borderTop: theme === 'dark' ? "1px solid rgba(51, 65, 85, 0.5)" : "1px solid rgba(203, 213, 225, 0.5)",
              paddingTop: "1.5rem",
              background: theme === 'dark' ? "rgba(15, 23, 42, 0.95)" : "rgba(255, 255, 255, 0.95)",
              borderRadius: "1rem",
              padding: "1.5rem",
            }}>
              <div style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "1rem",
              }}>
                <h3 style={{ fontSize: "1rem", fontWeight: 600, color: headingColor }}>
                  Results for "{searchQuery}"
                </h3>
                <button 
                  onClick={clearSearch}
                  style={{
                    color: labelColor,
                    fontSize: "0.875rem",
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                  }}
                >
                  Clear
                </button>
              </div>
              
              <div style={{
                display: "flex",
                flexDirection: "column",
                gap: "0.75rem",
              }}>
                {searchResults.map((result) => (
                  result.type === 'team' ? (
                    // Team result
                    <div key={result.id} style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      padding: "0.75rem",
                      ...teamItemStyle,
                    }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                        {result.avatar_url ? (
                          <img 
                            src={result.avatar_url} 
                            alt={result.name}
                            style={{
                              width: "2.5rem",
                              height: "2.5rem",
                              borderRadius: "0.375rem",
                              objectFit: "cover",
                            }}
                          />
                        ) : (
                          <div style={{
                            width: "2.5rem",
                            height: "2.5rem",
                            borderRadius: "0.375rem",
                            background: "linear-gradient(to bottom right, #3b82f6, #8b5cf6)",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            color: "white",
                            fontWeight: 600,
                            fontSize: "0.875rem",
                          }}>
                            {result.name.substring(0, 2).toUpperCase()}
                          </div>
                        )}
                        <div style={{ display: "flex", flexDirection: "column", gap: "0.375rem" }}>
                          <h4 style={{ fontWeight: 600, color: headingColor, fontSize: "0.9375rem" }}>{result.name}</h4>
                          <div style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "0.375rem",
                            backgroundColor: "rgba(51, 65, 85, 0.15)",
                            color: labelColor,
                            padding: "0.25rem 0.5rem",
                            borderRadius: "0.375rem",
                            fontSize: "0.75rem",
                            fontWeight: 500,
                          }}>
                            <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path>
                              <circle cx="9" cy="7" r="4"></circle>
                              <path d="M22 21v-2a4 4 0 0 0-3-3.87"></path>
                              <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
                            </svg>
                            <span>{result.member_count} members</span>
                          </div>
                        </div>
                      </div>
                      {result.is_member ? (
                        <Link 
                          href={`/teams/${result.id}`}
                          style={{
                            ...buttonStyle,
                            textDecoration: "none",
                          }}
                        >
                          View Team
                        </Link>
                      ) : result.has_requested ? (
                        <div style={{
                          ...buttonStyle,
                          background: theme === 'dark' ? "rgba(59, 130, 246, 0.2)" : "rgba(59, 130, 246, 0.1)",
                          color: "#3b82f6",
                          cursor: "default",
                        }}>
                          Request Sent
                        </div>
                      ) : (
                        <button 
                          onClick={() => result.access_policy === 'open' ? handleJoinTeam(result.id) : handleRequestToJoin(result.id)}
                          style={primaryButtonStyle}
                        >
                          {result.access_policy === 'open' ? 'Join' : 'Request to Join'}
                        </button>
                      )}
                    </div>
                  ) : (
                    // Person result
                    <div key={result.id} style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      padding: "0.75rem",
                      ...teamItemStyle,
                    }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", flex: 1 }}>
                        {result.avatar_url ? (
                          <img 
                            src={result.avatar_url} 
                            alt={result.username}
                            style={{
                              width: "2.5rem",
                              height: "2.5rem",
                              borderRadius: "50%",
                              objectFit: "cover",
                            }}
                          />
                        ) : (
                          <div style={{
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
                          }}>
                            {result.username.substring(0, 2).toUpperCase()}
                          </div>
                        )}
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <h4 style={{ fontWeight: 600, color: headingColor, fontSize: "0.9375rem" }}>{result.username}</h4>
                          {result.description && (
                            <p style={{ 
                              fontSize: "0.75rem", 
                              color: labelColor,
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                              whiteSpace: "nowrap"
                            }}>
                              {result.description}
                            </p>
                          )}
                        </div>
                      </div>
                      {result.id === user?.id ? (
                        <div style={{
                          color: labelColor,
                          fontSize: "0.875rem",
                          padding: "0.5rem 1rem",
                          fontStyle: "italic",
                        }}>
                          You
                        </div>
                      ) : (
                        <Link
                          href={`/profile/${result.id}`}
                          style={{
                            ...buttonStyle,
                            textDecoration: "none",
                          }}
                        >
                          View Profile
                        </Link>
                      )}
                    </div>
                  )
                ))}
              </div>
            </div>
          )}
          
          {isSearching && (
            <div style={{ textAlign: "center", padding: "1rem", color: labelColor }}>
              Searching...
            </div>
          )}
        </Card>
        
        {/* Teams Section */}
        <div style={{
          display: "flex",
          flexDirection: "column",
          gap: "var(--gap-medium)",
        }}>
          {/* My Teams */}
          <div>
            {/* Teams Header */}
            <div style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: "var(--gap-small)",
            }}>
              <h2 style={{ fontSize: "1.25rem", fontWeight: 600, color: headingColor }}>
                My Teams
              </h2>
              <Link 
                href="/teams/create"
                style={{
                  ...primaryButtonStyle,
                  padding: "0.5rem 1rem",
                  textDecoration: "none",
                }}
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="12" y1="5" x2="12" y2="19"></line>
                  <line x1="5" y1="12" x2="19" y2="12"></line>
                </svg>
                Create Team
              </Link>
            </div>
            
            {/* Teams List */}
            <Card padding="small">
              {loading ? (
                <div style={{ padding: "2rem", textAlign: "center", color: labelColor }}>
                  Loading teams...
                </div>
              ) : myTeams.length === 0 ? (
                <div style={{ padding: "2rem", textAlign: "center", color: labelColor }}>
                  You haven't joined any teams yet. Create one or search to join!
                </div>
              ) : (
                myTeams.map((team, index) => (
                <div key={team.id} style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  padding: "1rem 1.5rem",
                  borderBottom: index < myTeams.length - 1 ? 
                    (theme === 'dark' ? "1px solid rgba(51, 65, 85, 0.5)" : "1px solid rgba(203, 213, 225, 0.5)") : 
                    "none",
                }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "1rem", flex: 1 }}>
                    {team.avatar_url ? (
                      <img 
                        src={team.avatar_url} 
                        alt={team.name}
                        style={{
                          width: "3rem",
                          height: "3rem",
                          borderRadius: "0.75rem",
                          objectFit: "cover",
                          flexShrink: 0
                        }}
                      />
                    ) : (
                      <div style={{
                        width: "3rem",
                        height: "3rem",
                        borderRadius: "0.75rem",
                        background: "linear-gradient(to bottom right, #3b82f6, #8b5cf6)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        color: "white",
                        fontWeight: 600,
                        fontSize: "1rem",
                        flexShrink: 0
                      }}>
                        {team.name.substring(0, 2).toUpperCase()}
                      </div>
                    )}
                    <div style={{ display: "flex", flexDirection: "column", gap: "0.25rem", marginRight: "auto" }}>
                      <h3 style={{ fontWeight: 600, color: headingColor, fontSize: "1.125rem" }}>
                        {team.name}
                      </h3>
                      <span style={{ fontSize: "0.75rem", color: labelColor, textTransform: "capitalize" }}>
                        {team.user_role}
                      </span>
                    </div>
                    <div style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "0.375rem",
                      backgroundColor: team.user_rank === 1 ? "rgba(234, 179, 8, 0.15)" : 
                                      team.user_rank === 2 ? (theme === 'dark' ? "rgba(148, 163, 184, 0.15)" : "rgba(148, 163, 184, 0.3)") : 
                                      team.user_rank === 3 ? "rgba(194, 65, 12, 0.15)" : 
                                      "rgba(51, 65, 85, 0.15)",
                      color: team.user_rank === 1 ? "#fbbf24" : 
                             team.user_rank === 2 ? (theme === 'dark' ? "#e2e8f0" : "#64748b") : 
                             team.user_rank === 3 ? "#fb923c" : 
                             "#94a3b8",
                      padding: "0.25rem 0.5rem",
                      borderRadius: "0.375rem",
                      fontSize: "0.75rem",
                      fontWeight: 600,
                      flexShrink: 0
                    }}>
                      <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M12 2l2.4 7.4H22l-6 4.6 2.3 7-6.3-4.6L5.7 21l2.3-7-6-4.6h7.6z"></path>
                      </svg>
                      <span>#{team.user_rank}</span>
                    </div>
                    <div style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "0.375rem",
                      backgroundColor: theme === 'dark' ? "rgba(51, 65, 85, 0.15)" : "rgba(241, 245, 249, 0.8)",
                      color: labelColor,
                      padding: "0.25rem 0.5rem",
                      borderRadius: "0.375rem",
                      fontSize: "0.75rem",
                      fontWeight: 500,
                      marginRight: "1rem",
                      flexShrink: 0
                    }}>
                      <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path>
                        <circle cx="9" cy="7" r="4"></circle>
                        <path d="M22 21v-2a4 4 0 0 0-3-3.87"></path>
                        <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
                      </svg>
                      <span>{team.member_count}</span>
                    </div>
                  </div>
                  <Link 
                    href={`/teams/${team.id}`}
                    style={{
                      ...buttonStyle,
                      textDecoration: "none",
                      flexShrink: 0,
                      minWidth: "70px",
                      textAlign: "center"
                    }}
                  >
                    View
                  </Link>
                </div>
                ))
              )}
            </Card>
          </div>
        </div>
        </div>
        
        {/* Right Column - Online Friends */}
        <div style={{
          position: "sticky",
          top: "2rem",
        }}>
          <FriendsList />
        </div>
      </div>
    </PageLayout>
  );
}
