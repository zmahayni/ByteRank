"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useTheme } from "../../../components/ThemeProvider";
import { notFound } from "next/navigation";
import PageLayout from "../../../components/PageLayout";
import Card from "../../../components/Card";

// Mock data for Alpha team
const mockAlphaTeam = { 
  id: "alpha", 
  name: "ByteBuilders", 
  logo: "🚀", 
  description: "A team of innovative developers building the future.",
  members: [
    { id: "user1", name: "Alex Johnson", avatar: "AJ", role: "admin", points: 1240, rank: 1 },
    { id: "user2", name: "Sam Taylor", avatar: "ST", role: "member", points: 980, rank: 2 },
    { id: "user3", name: "Jordan Lee", avatar: "JL", role: "member", points: 875, rank: 3 },
    { id: "user6", name: "Morgan Riley", avatar: "MR", role: "member", points: 720, rank: 4 },
    { id: "user7", name: "Taylor Swift", avatar: "TS", role: "member", points: 650, rank: 5 },
  ],
  activity: [
    { id: "act1", user: "Alex Johnson", avatar: "AJ", action: "merged a pull request", target: "Fix navbar responsiveness", time: "2 hours ago" },
    { id: "act2", user: "Sam Taylor", avatar: "ST", action: "created an issue", target: "Add dark mode support", time: "5 hours ago" },
    { id: "act3", user: "Jordan Lee", avatar: "JL", action: "commented on", target: "Implement user authentication", time: "1 day ago" },
    { id: "act4", user: "Alex Johnson", avatar: "AJ", action: "closed an issue", target: "Fix login button", time: "2 days ago" },
    { id: "act5", user: "Morgan Riley", avatar: "MR", action: "pushed to", target: "main branch", time: "3 days ago" },
  ]
};

// Mock data for demonstration
const mockTeams = {
  "alpha": { 
    id: "alpha", 
    name: "ByteBuilders", 
    logo: "🚀", 
    description: "A team of innovative developers building the future.",
    members: [
      { id: "user1", name: "Alex Johnson", avatar: "AJ", role: "admin", points: 1240, rank: 1 },
      { id: "user2", name: "Sam Taylor", avatar: "ST", role: "member", points: 980, rank: 2 },
      { id: "user3", name: "Jordan Lee", avatar: "JL", role: "member", points: 875, rank: 3 },
      { id: "user6", name: "Morgan Riley", avatar: "MR", role: "member", points: 720, rank: 4 },
      { id: "user7", name: "Taylor Swift", avatar: "TS", role: "member", points: 650, rank: 5 },
    ],
    activity: [
      { id: "act1", user: "Alex Johnson", avatar: "AJ", action: "merged a pull request", target: "Fix navbar responsiveness", time: "2 hours ago" },
      { id: "act2", user: "Sam Taylor", avatar: "ST", action: "created an issue", target: "Add dark mode support", time: "5 hours ago" },
      { id: "act3", user: "Jordan Lee", avatar: "JL", action: "commented on", target: "Implement user authentication", time: "1 day ago" },
      { id: "act4", user: "Alex Johnson", avatar: "AJ", action: "closed an issue", target: "Fix login button", time: "2 days ago" },
      { id: "act5", user: "Morgan Riley", avatar: "MR", action: "pushed to", target: "main branch", time: "3 days ago" },
    ]
  },
  "bravo": { 
    id: "bravo", 
    name: "CodeCrafters", 
    logo: "⚙️", 
    description: "Crafting elegant code solutions for complex problems.",
    members: [
      { id: "user2", name: "Sam Taylor", avatar: "ST", role: "admin", points: 1540, rank: 1 },
      { id: "user4", name: "Casey Morgan", avatar: "CM", role: "member", points: 1320, rank: 2 },
      { id: "user8", name: "Jamie Smith", avatar: "JS", role: "member", points: 950, rank: 3 },
    ],
    activity: [
      { id: "act1", user: "Sam Taylor", avatar: "ST", action: "deployed to", target: "production", time: "1 hour ago" },
      { id: "act2", user: "Casey Morgan", avatar: "CM", action: "reviewed a pull request", target: "Optimize database queries", time: "3 hours ago" },
      { id: "act3", user: "Jamie Smith", avatar: "JS", action: "created a branch", target: "feature/user-profiles", time: "1 day ago" },
    ]
  },
  "charlie": { 
    id: "charlie", 
    name: "DevDynamos", 
    logo: "💻", 
    description: "Dynamic developers pushing the boundaries of technology.",
    members: [
      { id: "user3", name: "Jordan Lee", avatar: "JL", role: "admin", points: 1890, rank: 1 },
      { id: "user1", name: "Alex Johnson", avatar: "AJ", role: "member", points: 1650, rank: 2 },
      { id: "user5", name: "Riley Smith", avatar: "RS", role: "member", points: 1420, rank: 3 },
      { id: "user9", name: "Quinn Chen", avatar: "QC", role: "member", points: 1280, rank: 4 },
    ],
    activity: [
      { id: "act1", user: "Jordan Lee", avatar: "JL", action: "merged a pull request", target: "Implement WebSocket", time: "30 minutes ago" },
      { id: "act2", user: "Alex Johnson", avatar: "AJ", action: "opened a pull request", target: "Add real-time notifications", time: "4 hours ago" },
      { id: "act3", user: "Riley Smith", avatar: "RS", action: "commented on", target: "API performance issue", time: "1 day ago" },
      { id: "act4", user: "Quinn Chen", avatar: "QC", action: "created an issue", target: "Mobile view bugs", time: "2 days ago" },
    ]
  },
  "delta": { 
    id: "delta", 
    name: "TechTitans", 
    logo: "⚡", 
    description: "Titans of technology creating powerful solutions.",
    members: [
      { id: "user4", name: "Casey Morgan", avatar: "CM", role: "admin", points: 2150, rank: 1 },
      { id: "user5", name: "Riley Smith", avatar: "RS", role: "member", points: 1950, rank: 2 },
      { id: "user10", name: "Avery Zhang", avatar: "AZ", role: "member", points: 1780, rank: 3 },
    ],
    activity: [
      { id: "act1", user: "Casey Morgan", avatar: "CM", action: "deployed to", target: "staging", time: "45 minutes ago" },
      { id: "act2", user: "Riley Smith", avatar: "RS", action: "merged a pull request", target: "Refactor authentication", time: "3 hours ago" },
      { id: "act3", user: "Avery Zhang", avatar: "AZ", action: "pushed to", target: "develop branch", time: "6 hours ago" },
    ]
  },
};

// This is a client component that receives the teamId as a prop
export default function TeamPageClient({ teamId }: { teamId: string }) {
  const { theme } = useTheme();
  const [team, setTeam] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [userRole, setUserRole] = useState<'owner' | 'admin' | 'member'>('member'); // In a real app, this would be determined by auth
  
  useEffect(() => {
    // For demo purposes, always show the Alpha team data
    console.log("TeamPageClient: teamId =", teamId);
    setTeam(mockAlphaTeam);
    setUserRole('owner');
    setLoading(false);
  }, [teamId]);
  
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
    <PageLayout rightSidebar={<FriendsList />}>
      {/* Page Header */}
      <div style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: "2rem",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
          <div style={{
            width: "4.5rem",
            height: "4.5rem",
            borderRadius: "0.75rem",
            background: theme === 'dark' ? "rgba(51, 65, 85, 0.5)" : "rgba(226, 232, 240, 0.8)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "2.5rem",
            boxShadow: theme === 'dark' ? 
              "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -2px rgba(0, 0, 0, 0.1)" : 
              "0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -2px rgba(0, 0, 0, 0.05)"
          }}>
            {team.logo}
          </div>
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
          
          {/* Only show Edit button for admins and owners */}
          {(userRole === 'admin' || userRole === 'owner') && (
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
                gridTemplateColumns: "50px 1fr 100px",
                gap: "1rem",
                padding: "0.5rem 1rem",
                borderBottom: theme === 'dark' ? "1px solid rgba(51, 65, 85, 0.3)" : "1px solid rgba(203, 213, 225, 0.5)",
              }}>
                <div style={{ fontWeight: 600, fontSize: "0.875rem", color: mutedColor }}>Rank</div>
                <div style={{ fontWeight: 600, fontSize: "0.875rem", color: mutedColor }}>Member</div>
                <div style={{ fontWeight: 600, fontSize: "0.875rem", color: mutedColor, textAlign: "right" }}>Points</div>
              </div>
              
              {/* Table Rows */}
              {team.members.sort((a: any, b: any) => a.rank - b.rank).map((member: any) => (
                <div key={member.id} style={{
                  display: "grid",
                  gridTemplateColumns: "50px 1fr 100px",
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
                    }}>
                      {member.avatar}
                    </div>
                    <div>
                      <h4 style={{ fontWeight: 600, color: textColor }}>{member.name}</h4>
                      <div style={{ 
                        display: "inline-flex", 
                        alignItems: "center", 
                        gap: "0.25rem",
                        color: member.role === 'admin' ? "#3b82f6" : mutedColor,
                        fontSize: "0.75rem",
                        fontWeight: 600,
                        background: member.role === 'admin' ? "rgba(59, 130, 246, 0.1)" : "rgba(148, 163, 184, 0.1)",
                        padding: "0.125rem 0.5rem",
                        borderRadius: "9999px",
                      }}>
                        {member.role === 'admin' ? (
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
                    {member.points.toLocaleString()}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
        
        {/* Right Column - Activity and Members */}
        <div style={{ flex: "1 1 400px", display: "flex", flexDirection: "column", gap: "2rem" }}>
          {/* Activity Feed */}
          <div style={sectionStyle}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
              <h2 style={{ fontSize: "1.25rem", fontWeight: 600, color: headingColor }}>
                Recent Activity
              </h2>
              <Link 
                href={`/teams/${teamId}/activity`}
                style={{
                  ...buttonStyle,
                  fontSize: "0.875rem",
                  padding: "0.375rem 0.75rem",
                  display: "flex",
                  alignItems: "center",
                  gap: "0.25rem"
                }}
              >
                <span>See All</span>
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="9 18 15 12 9 6"></polyline>
                </svg>
              </Link>
            </div>
            
            <div style={{ 
              display: "flex",
              flexDirection: "column",
              gap: "0.75rem"
            }}>
              {team.activity.slice(0, 3).map((item: any) => (
                <div key={item.id} style={cardStyle}>
                  <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
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
                    }}>
                      {item.avatar}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
                        <span style={{ fontWeight: 600, color: textColor }}>{item.user}</span>
                        <span style={{ fontSize: "0.75rem", color: mutedColor }}>{item.time}</span>
                      </div>
                      <p style={{ fontSize: "0.875rem", color: mutedColor, marginTop: "0.25rem" }}>
                        <span>{item.action}</span>{" "}
                        <span style={{ fontWeight: 500, color: textColor }}>{item.target}</span>
                      </p>
                    </div>
                  </div>
                </div>
              ))}
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
            }}>
              {/* You (with appropriate role) */}
              <div style={cardStyle}>
                <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
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
                  }}>
                    YU
                  </div>
                  <div>
                    <h4 style={{ fontWeight: 600, color: textColor }}>You</h4>
                    <div style={{ 
                      display: "inline-flex", 
                      alignItems: "center", 
                      gap: "0.25rem",
                      color: userRole === 'owner' ? "#f59e0b" : userRole === 'admin' ? "#3b82f6" : mutedColor,
                      fontSize: "0.75rem",
                      fontWeight: 600,
                      background: userRole === 'owner' ? "rgba(245, 158, 11, 0.1)" : userRole === 'admin' ? "rgba(59, 130, 246, 0.1)" : "rgba(148, 163, 184, 0.1)",
                      padding: "0.125rem 0.5rem",
                      borderRadius: "9999px",
                      marginTop: "0.25rem",
                    }}>
                      {userRole === 'owner' ? (
                        <>
                          <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M12 2l2.4 7.4H22l-6 4.6 2.3 7-6.3-4.6L5.7 21l2.3-7-6-4.6h7.6z"></path>
                          </svg>
                          Owner
                        </>
                      ) : userRole === 'admin' ? (
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
              
              {/* Other Team Members - Limited to 4 with View All option */}
              {team.members.slice(0, 4).map((member: any) => (
                <div key={member.id} style={cardStyle}>
                  <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
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
                    }}>
                      {member.avatar}
                    </div>
                    <div>
                      <h4 style={{ fontWeight: 600, color: textColor }}>{member.name}</h4>
                      <div style={{ 
                        display: "inline-flex", 
                        alignItems: "center", 
                        gap: "0.25rem",
                        color: member.role === 'admin' ? "#3b82f6" : mutedColor,
                        fontSize: "0.75rem",
                        fontWeight: 600,
                        background: member.role === 'admin' ? "rgba(59, 130, 246, 0.1)" : "rgba(148, 163, 184, 0.1)",
                        padding: "0.125rem 0.5rem",
                        borderRadius: "9999px",
                        marginTop: "0.25rem",
                      }}>
                        {member.role === 'admin' ? (
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
