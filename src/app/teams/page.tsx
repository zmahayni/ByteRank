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

export default function CommunityPage() {
  const { theme } = useTheme();
  const { user } = useAuth();
  const supabase = createClientComponentClient();
  
  // State for teams data
  const [myTeams, setMyTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(true);
  
  // State for search functionality
  const [searchType, setSearchType] = useState<"teams" | "people">("teams");
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
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
  
  // Handle search
  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    
    setIsSearching(true);
    
    try {
      if (searchType === "teams") {
        // Search for teams by name
        const { data: teamsData, error } = await supabase
          .from('groups')
          .select('id, name, avatar_url')
          .ilike('name', `%${searchQuery}%`)
          .limit(10);
        
        if (error) {
          console.error('Error searching teams:', error);
          return;
        }
        
        // For each team, get member count and check if user is member
        const teamsWithDetails = await Promise.all(
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
            
            return {
              id: team.id,
              name: team.name,
              avatar_url: team.avatar_url,
              member_count: count || 0,
              is_member: !!memberCheck,
            };
          })
        );
        
        setSearchResults(teamsWithDetails);
      } else {
        // People search - search profiles by username
        const { data: peopleData, error } = await supabase
          .from('profiles')
          .select('id, username, avatar_url, description')
          .ilike('username', `%${searchQuery}%`)
          .limit(10);
        
        if (error) {
          console.error('Error searching people:', error);
          return;
        }
        
        setSearchResults(peopleData || []);
      }
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

  // Sample friends list component for right sidebar
  const FriendsList = () => (
    <div style={{
      background: theme === 'dark' ? "rgba(15, 23, 42, 0.95)" : "rgba(255, 255, 255, 0.95)",
      borderRadius: "1rem",
      border: theme === 'dark' ? "1px solid rgba(51, 65, 85, 0.5)" : "1px solid rgba(203, 213, 225, 0.5)",
      boxShadow: theme === 'dark' ? 
        "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -2px rgba(0, 0, 0, 0.1)" : 
        "0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -2px rgba(0, 0, 0, 0.05)",
      padding: "1.5rem",
    }}>
      <h3 style={{ 
        fontSize: "1.125rem", 
        fontWeight: 600, 
        color: theme === 'dark' ? "#e2e8f0" : "#1e293b",
        marginTop: 0,
        marginBottom: "1rem"
      }}>
        Online Friends
      </h3>
      <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
        {["Alex Johnson", "Sam Taylor", "Jordan Lee", "Morgan Riley"].map((name, index) => (
          <div key={index} style={{
            display: "flex",
            alignItems: "center",
            gap: "0.75rem",
            padding: "0.75rem",
            borderRadius: "0.5rem",
            background: theme === 'dark' ? "rgba(30, 41, 59, 0.4)" : "rgba(241, 245, 249, 0.7)",
            transition: "background 0.2s",
            cursor: "pointer",
          }}>
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
              {name.split(" ").map(part => part[0]).join("")}
            </div>
            <span style={{ 
              fontSize: "0.875rem", 
              color: theme === 'dark' ? "#e2e8f0" : "#1e293b",
              fontWeight: 500,
            }}>{name}</span>
          </div>
        ))}
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
        <Card title="Find Teams">
          <div style={{
            display: "flex",
            flexDirection: "column",
            gap: "1rem",
          }}>
            <div style={{
              display: "flex",
              gap: "0.5rem",
            }}>
              <button 
                onClick={() => setSearchType("teams")} 
                style={searchType === "teams" ? activeButtonStyle : buttonStyle}
              >
                Teams
              </button>
              <button 
                onClick={() => setSearchType("people")} 
                style={searchType === "people" ? activeButtonStyle : buttonStyle}
              >
                People
              </button>
            </div>
            
            <div style={{
              display: "flex",
              gap: "0.5rem",
              width: "100%",
            }}>
              <input 
                type="text" 
                placeholder={`Search for ${searchType}...`}
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
                {searchType === "teams" ? (
                  // Team search results
                  searchResults.map((team) => (
                    <div key={team.id} style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      padding: "0.75rem",
                      ...teamItemStyle,
                    }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                        {team.avatar_url ? (
                          <img 
                            src={team.avatar_url} 
                            alt={team.name}
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
                            {team.name.substring(0, 2).toUpperCase()}
                          </div>
                        )}
                        <div style={{ display: "flex", flexDirection: "column", gap: "0.375rem" }}>
                          <h4 style={{ fontWeight: 600, color: headingColor, fontSize: "0.9375rem" }}>{team.name}</h4>
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
                            <span>{team.member_count} members</span>
                          </div>
                        </div>
                      </div>
                      {team.is_member ? (
                        <Link 
                          href={`/teams/${team.id}`}
                          style={{
                            ...buttonStyle,
                            textDecoration: "none",
                          }}
                        >
                          View Team
                        </Link>
                      ) : (
                        <button style={primaryButtonStyle}>
                          Request to Join
                        </button>
                      )}
                    </div>
                  ))
                ) : (
                  // People search results
                  searchResults.map((person) => (
                    <div key={person.id} style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      padding: "0.75rem",
                      ...teamItemStyle,
                    }}>
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
                            {person.username.substring(0, 2).toUpperCase()}
                          </div>
                        )}
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <h4 style={{ fontWeight: 600, color: headingColor, fontSize: "0.9375rem" }}>{person.username}</h4>
                          {person.description && (
                            <p style={{ 
                              fontSize: "0.75rem", 
                              color: labelColor,
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                              whiteSpace: "nowrap"
                            }}>
                              {person.description}
                            </p>
                          )}
                        </div>
                      </div>
                      {person.id === user?.id ? (
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
                          href={`/profile/${person.id}`}
                          style={{
                            ...buttonStyle,
                            textDecoration: "none",
                          }}
                        >
                          View Profile
                        </Link>
                      )}
                    </div>
                  ))
                )}
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
