"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useTheme } from "../../../components/ThemeProvider";
import { useAuth } from "../../../context/AuthContext";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { notFound } from "next/navigation";
import PageLayout from "../../../components/PageLayout";
import Card from "../../../components/Card";

type TeamMember = {
  id: string;
  username: string;
  avatar_url: string | null;
  role: string;
  total_commits: number;
  rank: number;
};

type Team = {
  id: string;
  name: string;
  description: string | null;
  avatar_url: string | null;
  owner_id: string;
  member_count: number;
  members: TeamMember[];
};


// This is a client component that receives the teamId as a prop
export default function TeamPageClient({ teamId }: { teamId: string }) {
  const { theme } = useTheme();
  const { user } = useAuth();
  const [team, setTeam] = useState<Team | null>(null);
  const [loading, setLoading] = useState(true);
  const [userRole, setUserRole] = useState<'owner' | 'admin' | 'member' | null>(null);
  const [isMember, setIsMember] = useState(false);
  const supabase = createClientComponentClient();
  
  useEffect(() => {
    const fetchTeamData = async () => {
      if (!user) {
        setLoading(false);
        return;
      }

      try {
        console.log('Fetching team with ID:', teamId);
        
        // Fetch team basic info
        const { data: groupData, error: groupError } = await supabase
          .from('groups')
          .select('id, name, description, avatar_url, owner_id')
          .eq('id', teamId)
          .single();

        console.log('Group data:', groupData);
        console.log('Group error:', groupError);

        if (groupError || !groupData) {
          console.error('Error fetching team:', groupError);
          setTeam(null);
          setLoading(false);
          return;
        }

        // Check if user is a member and get their role
        const { data: membershipData } = await supabase
          .from('group_members')
          .select('role')
          .eq('group_id', teamId)
          .eq('user_id', user.id)
          .single();

        if (membershipData) {
          setIsMember(true);
          setUserRole(membershipData.role as 'owner' | 'admin' | 'member');
        } else {
          setIsMember(false);
          setUserRole(null);
        }

        // Fetch all members with their stats
        const { data: membersData, error: membersError } = await supabase
          .from('group_members')
          .select(`
            user_id,
            role,
            total_commits,
            profiles (
              id,
              username,
              avatar_url
            )
          `)
          .eq('group_id', teamId)
          .order('total_commits', { ascending: false });

        if (membersError) {
          console.error('Error fetching members:', membersError);
        }

        // Transform members data and add ranks
        const members: TeamMember[] = (membersData || []).map((member: any, index: number) => ({
          id: member.profiles.id,
          username: member.profiles.username,
          avatar_url: member.profiles.avatar_url,
          role: member.role,
          total_commits: member.total_commits || 0,
          rank: index + 1,
        }));

        setTeam({
          id: groupData.id,
          name: groupData.name,
          description: groupData.description,
          avatar_url: groupData.avatar_url,
          owner_id: groupData.owner_id,
          member_count: members.length,
          members,
        });
      } catch (error) {
        console.error('Unexpected error fetching team:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchTeamData();
  }, [teamId, user, supabase]);
  
  // Common styles
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
    textDecoration: "none",
  };
  
  const primaryButtonStyle = {
    background: "linear-gradient(to right, #3b82f6, #8b5cf6)",
    color: "white",
    border: "none",
    borderRadius: "0.5rem",
    padding: "0.75rem 1.5rem",
    fontSize: "0.875rem",
    fontWeight: 600,
    cursor: "pointer",
    transition: "all 0.2s ease",
    display: "flex",
    alignItems: "center",
    gap: "0.5rem",
    textDecoration: "none",
  };
  
  const sectionStyle = {
    background: theme === 'dark' ? "rgba(15, 23, 42, 0.95)" : "rgba(255, 255, 255, 0.95)",
    borderRadius: "1rem",
    border: theme === 'dark' ? "1px solid rgba(51, 65, 85, 0.5)" : "1px solid rgba(203, 213, 225, 0.5)",
    padding: "1.5rem",
    marginBottom: "2rem",
    boxShadow: theme === 'dark' ? 
      "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -2px rgba(0, 0, 0, 0.1)" : 
      "0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -2px rgba(0, 0, 0, 0.05)"
  };
  
  const cardStyle = {
    background: theme === 'dark' ? "rgba(30, 41, 59, 0.4)" : "rgba(241, 245, 249, 0.7)",
    borderRadius: "0.5rem",
    border: theme === 'dark' ? "1px solid rgba(51, 65, 85, 0.3)" : "1px solid rgba(203, 213, 225, 0.5)",
    padding: "0.75rem",
  };
  
  const headingColor = theme === 'dark' ? "#e2e8f0" : "#1e293b";
  const textColor = theme === 'dark' ? "#e2e8f0" : "#1e293b";
  const mutedColor = theme === 'dark' ? "#94a3b8" : "#64748b";

  // Handle leave team
  const handleLeaveTeam = async () => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('group_members')
        .delete()
        .eq('group_id', teamId)
        .eq('user_id', user.id);

      if (error) {
        console.error('Error leaving team:', error);
        return;
      }

      // Redirect back to teams
      window.location.href = '/teams';
    } catch (error) {
      console.error('Unexpected error leaving team:', error);
    }
  };

  // Handle remove member
  const handleRemoveMember = async (memberId: string) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('group_members')
        .delete()
        .eq('group_id', teamId)
        .eq('user_id', memberId);

      if (error) {
        console.error('Error removing member:', error);
        return;
      }

      // Refresh team data
      if (team) {
        setTeam({
          ...team,
          members: team.members.filter(m => m.id !== memberId),
        });
      }
    } catch (error) {
      console.error('Unexpected error removing member:', error);
    }
  };

  if (loading) {
    return (
      <div style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        minHeight: "50vh",
        color: mutedColor,
      }}>
        Loading team data...
      </div>
    );
  }

  if (!team) {
    // Use Next.js notFound function to show the not-found page
    notFound();
    return null;
  }

  // Sample friends list component for right sidebar
  const FriendsList = () => (
    <div>
      <h3 style={{ 
        fontSize: "1.125rem", 
        fontWeight: 600, 
        color: theme === 'dark' ? "#e2e8f0" : "#1e293b",
        marginTop: 0,
        marginBottom: "var(--gap-medium)"
      }}>
        Online Friends
      </h3>
      <div style={{ display: "flex", flexDirection: "column", gap: "var(--gap-small)" }}>
        {["Alex Johnson", "Sam Taylor", "Jordan Lee"].map((name, index) => (
          <div key={index} style={{
            display: "flex",
            alignItems: "center",
            gap: "var(--gap-small)",
            padding: "var(--gap-small)",
            borderRadius: "var(--radius)",
            background: theme === 'dark' ? "rgba(30, 41, 59, 0.4)" : "rgba(241, 245, 249, 0.7)",
          }}>
            <div style={{
              width: "2rem",
              height: "2rem",
              borderRadius: "50%",
              background: "linear-gradient(to bottom right, #3b82f6, #8b5cf6)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "white",
              fontWeight: 600,
              fontSize: "0.75rem"
            }}>
              {name.split(" ").map(part => part[0]).join("")}
            </div>
            <span style={{ fontSize: "0.875rem", color: theme === 'dark' ? "#e2e8f0" : "#1e293b" }}>{name}</span>
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
        marginBottom: "2rem",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
          {team.avatar_url ? (
            <img 
              src={team.avatar_url} 
              alt={team.name}
              style={{
                width: "4.5rem",
                height: "4.5rem",
                borderRadius: "0.75rem",
                objectFit: "cover",
                boxShadow: theme === 'dark' ? 
                  "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -2px rgba(0, 0, 0, 0.1)" : 
                  "0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -2px rgba(0, 0, 0, 0.05)"
              }}
            />
          ) : (
            <div style={{
              width: "4.5rem",
              height: "4.5rem",
              borderRadius: "0.75rem",
              background: "linear-gradient(to bottom right, #3b82f6, #8b5cf6)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "white",
              fontWeight: 700,
              fontSize: "1.5rem",
              boxShadow: theme === 'dark' ? 
                "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -2px rgba(0, 0, 0, 0.1)" : 
                "0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -2px rgba(0, 0, 0, 0.05)"
            }}>
              {team.name.substring(0, 2).toUpperCase()}
            </div>
          )}
          <div>
            <h1 className="gradient-text" style={{
              fontSize: "2.5rem",
              fontWeight: "bold",
              marginBottom: "0.25rem",
            }}>
              {team.name}
            </h1>
            <p style={{ color: mutedColor }}>
              {team.description}
            </p>
          </div>
        </div>
        
        <div style={{ display: "flex", gap: "1rem" }}>
          <Link href="/teams" style={{
            ...buttonStyle,
            display: "flex",
            alignItems: "center",
            gap: "0.5rem",
          }}>
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M19 12H5M12 19l-7-7 7-7" />
            </svg>
            Back to Teams
          </Link>
          
          {/* Show different buttons based on membership */}
          {isMember ? (
            <>
              {(userRole === 'owner' || userRole === 'admin') && (
                <Link 
                  href={`/teams/${teamId}/invites`} 
                  style={primaryButtonStyle}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path>
                    <circle cx="9" cy="7" r="4"></circle>
                    <path d="M22 21v-2a4 4 0 0 0-3-3.87"></path>
                    <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
                  </svg>
                  Invite Members
                </Link>
              )}
              {userRole === 'owner' && (
                <Link 
                  href={`/teams/${teamId}/edit`} 
                  style={primaryButtonStyle}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                  </svg>
                  Edit Team
                </Link>
              )}
              <button 
                onClick={handleLeaveTeam}
                style={buttonStyle}
              >
                Leave Team
              </button>
            </>
          ) : (
            <button style={primaryButtonStyle}>
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path>
                <circle cx="9" cy="7" r="4"></circle>
                <path d="M22 21v-2a4 4 0 0 0-3-3.87"></path>
                <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
              </svg>
              Request to Join
            </button>
          )}
        </div>
      </div>
      
      {/* Main Content - Two Column Layout */}
      <div style={{ display: "flex", gap: "2rem", flexWrap: "wrap" }}>
        {/* Left Column - Leaderboard */}
        <div style={{ flex: "1 1 600px" }}>
          <div style={sectionStyle}>
            <h2 style={{ fontSize: "1.25rem", fontWeight: 600, color: headingColor, marginBottom: "1.5rem" }}>
              Team Leaderboard
            </h2>
            
            <div style={{ 
              display: "flex",
              flexDirection: "column",
              gap: "0.75rem"
            }}>
              {/* Table Header */}
              <div style={{
                display: "grid",
                gridTemplateColumns: (userRole === 'owner' || userRole === 'admin') ? "50px 1fr 100px 80px" : "50px 1fr 100px",
                gap: "1rem",
                padding: "0.5rem 1rem",
                borderBottom: theme === 'dark' ? "1px solid rgba(51, 65, 85, 0.3)" : "1px solid rgba(203, 213, 225, 0.5)",
              }}>
                <div style={{ fontWeight: 600, fontSize: "0.875rem", color: mutedColor }}>Rank</div>
                <div style={{ fontWeight: 600, fontSize: "0.875rem", color: mutedColor }}>Member</div>
                <div style={{ fontWeight: 600, fontSize: "0.875rem", color: mutedColor, textAlign: "right" }}>Commits</div>
                {(userRole === 'owner' || userRole === 'admin') && (
                  <div style={{ fontWeight: 600, fontSize: "0.875rem", color: mutedColor, textAlign: "right" }}>Action</div>
                )}
              </div>
              
              {/* Table Rows */}
              {team.members.map((member) => (
                <div key={member.id} style={{
                  display: "grid",
                  gridTemplateColumns: (userRole === 'owner' || userRole === 'admin') ? "50px 1fr 100px 80px" : "50px 1fr 100px",
                  gap: "1rem",
                  alignItems: "center",
                  ...cardStyle,
                }}>
                  <div style={{ 
                    fontWeight: 700, 
                    fontSize: "1rem", 
                    color: 
                      member.rank === 1 ? "#fbbf24" : 
                      member.rank === 2 ? (theme === 'dark' ? "#e2e8f0" : "#64748b") : 
                      member.rank === 3 ? "#fb923c" : 
                      mutedColor,
                    textAlign: "center",
                  }}>
                    #{member.rank}
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                    {member.avatar_url ? (
                      <img 
                        src={member.avatar_url} 
                        alt={member.username}
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
                        {member.username.substring(0, 2).toUpperCase()}
                      </div>
                    )}
                    <div>
                      <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                        <h4 style={{ fontWeight: 600, color: textColor }}>{member.username}</h4>
                        {member.id === user?.id && (
                          <span style={{ 
                            fontSize: "0.75rem", 
                            color: "#3b82f6",
                            fontWeight: 600,
                            fontStyle: "italic"
                          }}>
                            (You)
                          </span>
                        )}
                      </div>
                      <div style={{ 
                        display: "inline-flex", 
                        alignItems: "center", 
                        gap: "0.25rem",
                        color: member.role === 'owner' ? "#fbbf24" : member.role === 'admin' ? "#3b82f6" : mutedColor,
                        fontSize: "0.75rem",
                        fontWeight: 600,
                        background: member.role === 'owner' ? "rgba(251, 191, 36, 0.1)" : member.role === 'admin' ? "rgba(59, 130, 246, 0.1)" : "rgba(148, 163, 184, 0.1)",
                        padding: "0.125rem 0.5rem",
                        borderRadius: "9999px",
                      }}>
                        {member.role === 'owner' ? (
                          <>
                            <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <path d="M12 2l2.4 7.4H22l-6 4.6 2.3 7-6.3-4.6L5.7 21l2.3-7-6-4.6h7.6z"></path>
                            </svg>
                            Owner
                          </>
                        ) : member.role === 'admin' ? (
                          <>
                            <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path>
                              <circle cx="9" cy="7" r="4"></circle>
                              <path d="M22 12h-4"></path>
                              <path d="M18 8v8"></path>
                            </svg>
                            Admin
                          </>
                        ) : (
                          <>
                            <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path>
                              <circle cx="9" cy="7" r="4"></circle>
                            </svg>
                            Member
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                  <div style={{ fontWeight: 700, fontSize: "1.125rem", color: textColor, textAlign: "right" }}>
                    {member.total_commits.toLocaleString()}
                  </div>
                  {(userRole === 'owner' || userRole === 'admin') && member.id !== user?.id && (
                    <button
                      onClick={() => handleRemoveMember(member.id)}
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
                      Remove
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
        
        {/* Right Column - Team Stats */}
        <div style={{ flex: "1 1 400px", display: "flex", flexDirection: "column", gap: "2rem" }}>
          {/* Team Stats */}
          <div style={sectionStyle}>
            <h2 style={{ fontSize: "1.25rem", fontWeight: 600, color: headingColor, marginBottom: "1.5rem" }}>
              Team Stats
            </h2>
            
            <div style={{ 
              display: "flex",
              flexDirection: "column",
              gap: "1rem"
            }}>
              <div style={cardStyle}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{ color: mutedColor, fontSize: "0.875rem" }}>Total Members</span>
                  <span style={{ fontWeight: 700, fontSize: "1.5rem", color: textColor }}>{team.member_count}</span>
                </div>
              </div>
              
              <div style={cardStyle}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{ color: mutedColor, fontSize: "0.875rem" }}>Total Commits</span>
                  <span style={{ fontWeight: 700, fontSize: "1.5rem", color: textColor }}>
                    {team.members.reduce((sum, m) => sum + m.total_commits, 0).toLocaleString()}
                  </span>
                </div>
              </div>
              
              {isMember && (
                <div style={cardStyle}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span style={{ color: mutedColor, fontSize: "0.875rem" }}>Your Rank</span>
                    <span style={{ fontWeight: 700, fontSize: "1.5rem", color: textColor }}>
                      #{team.members.find(m => m.id === user?.id)?.rank || '-'}
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>
          
          {/* Team Members */}
          <div style={sectionStyle}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
              <h2 style={{ fontSize: "1.25rem", fontWeight: 600, color: headingColor }}>
                Team Members ({team.members.length})
              </h2>
            </div>
            
            <div style={{ 
              display: "flex", 
              flexDirection: "column", 
              gap: "0.75rem",
              maxHeight: "400px",
              overflowY: "auto",
            }}>
              {/* Team Members - Show top 5 */}
              {team.members.slice(0, 5).map((member) => (
                <div key={member.id} style={cardStyle}>
                  <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                    {member.avatar_url ? (
                      <img 
                        src={member.avatar_url} 
                        alt={member.username}
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
                        {member.username.substring(0, 2).toUpperCase()}
                      </div>
                    )}
                    <div>
                      <h4 style={{ fontWeight: 600, color: textColor }}>{member.username}</h4>
                      <div style={{ 
                        display: "inline-flex", 
                        alignItems: "center", 
                        gap: "0.25rem",
                        color: member.role === 'owner' ? "#fbbf24" : member.role === 'admin' ? "#3b82f6" : mutedColor,
                        fontSize: "0.75rem",
                        fontWeight: 600,
                        background: member.role === 'owner' ? "rgba(251, 191, 36, 0.1)" : member.role === 'admin' ? "rgba(59, 130, 246, 0.1)" : "rgba(148, 163, 184, 0.1)",
                        padding: "0.125rem 0.5rem",
                        borderRadius: "9999px",
                        marginTop: "0.25rem",
                      }}>
                        {member.role === 'owner' ? (
                          <>
                            <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <path d="M12 2l2.4 7.4H22l-6 4.6 2.3 7-6.3-4.6L5.7 21l2.3-7-6-4.6h7.6z"></path>
                            </svg>
                            Owner
                          </>
                        ) : member.role === 'admin' ? (
                          <>
                            <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path>
                              <circle cx="9" cy="7" r="4"></circle>
                              <path d="M22 12h-4"></path>
                              <path d="M18 8v8"></path>
                            </svg>
                            Admin
                          </>
                        ) : (
                          <>
                            <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path>
                              <circle cx="9" cy="7" r="4"></circle>
                            </svg>
                            Member
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
              
              {/* View All Members button if there are more than 4 */}
              {team.members.length > 4 && (
                <button 
                  style={{
                    ...buttonStyle,
                    width: "100%",
                    justifyContent: "center",
                    marginTop: "0.5rem"
                  }}
                >
                  View All Members ({team.members.length})
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </PageLayout>
  );
}
