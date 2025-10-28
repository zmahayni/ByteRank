"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useTheme } from "../../../../components/ThemeProvider";
import PageLayout from "../../../../components/PageLayout";
import Card from "../../../../components/Card";

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
    { 
      id: "act1", 
      user: "Alex Johnson", 
      avatar: "AJ", 
      action: "merged a pull request", 
      target: "Fix navbar responsiveness", 
      time: "2 hours ago",
      repo: "frontend-app",
      branch: "feature/navbar-fix",
      details: "PR #123: Fixed responsive behavior on mobile devices"
    },
    { 
      id: "act2", 
      user: "Sam Taylor", 
      avatar: "ST", 
      action: "created an issue", 
      target: "Add dark mode support", 
      time: "5 hours ago",
      repo: "design-system",
      details: "Issue #45: Need to implement dark mode across all components"
    },
    { 
      id: "act3", 
      user: "Jordan Lee", 
      avatar: "JL", 
      action: "commented on", 
      target: "Implement user authentication", 
      time: "1 day ago",
      repo: "backend-api",
      details: "PR #78: Let's use JWT tokens instead of sessions for better scalability"
    },
    { 
      id: "act4", 
      user: "Alex Johnson", 
      avatar: "AJ", 
      action: "closed an issue", 
      target: "Fix login button", 
      time: "2 days ago",
      repo: "frontend-app",
      details: "Issue #89: Login button was not working on Safari browsers"
    },
    { 
      id: "act5", 
      user: "Morgan Riley", 
      avatar: "MR", 
      action: "pushed to", 
      target: "main branch", 
      time: "3 days ago",
      repo: "shared-utils",
      commits: 3,
      details: "Added new date formatting utilities and fixed timezone bugs"
    },
    { 
      id: "act6", 
      user: "Taylor Swift", 
      avatar: "TS", 
      action: "reviewed a pull request", 
      target: "Update dependencies", 
      time: "3 days ago",
      repo: "frontend-app",
      details: "PR #132: Approved with minor comments on package versioning"
    },
    { 
      id: "act7", 
      user: "Alex Johnson", 
      avatar: "AJ", 
      action: "deployed to", 
      target: "staging environment", 
      time: "4 days ago",
      repo: "frontend-app",
      details: "Deployment #45: Successfully deployed version 2.3.0"
    },
    { 
      id: "act8", 
      user: "Jordan Lee", 
      avatar: "JL", 
      action: "created a branch", 
      target: "feature/user-profiles", 
      time: "5 days ago",
      repo: "frontend-app",
      details: "New branch for implementing enhanced user profiles"
    },
    { 
      id: "act9", 
      user: "Sam Taylor", 
      avatar: "ST", 
      action: "merged a pull request", 
      target: "API performance optimization", 
      time: "1 week ago",
      repo: "backend-api",
      details: "PR #65: Improved database query performance by 40%"
    },
    { 
      id: "act10", 
      user: "Morgan Riley", 
      avatar: "MR", 
      action: "added documentation", 
      target: "API endpoints", 
      time: "1 week ago",
      repo: "docs",
      details: "Added comprehensive documentation for all new API endpoints"
    }
  ]
};

// This is a client component that receives the teamId as a prop
export default function TeamActivityClient({ teamId }: { teamId: string }) {
  const { theme } = useTheme();
  const [team, setTeam] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    // For demo purposes, always show the Alpha team data
    console.log("TeamActivityClient: teamId =", teamId);
    setTeam(mockAlphaTeam);
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
    marginBottom: "0.75rem"
  };
  
  const headingColor = theme === 'dark' ? "#e2e8f0" : "#1e293b";
  const textColor = theme === 'dark' ? "#e2e8f0" : "#1e293b";
  const mutedColor = theme === 'dark' ? "#94a3b8" : "#64748b";
  const accentColor = theme === 'dark' ? "#60a5fa" : "#2563eb";

  if (loading) {
    return (
      <div style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        minHeight: "50vh",
        color: mutedColor,
      }}>
        Loading team activity...
      </div>
    );
  }

  if (!team) {
    return (
      <div style={{
        padding: "2rem",
        textAlign: "center",
        color: mutedColor,
      }}>
        Team not found
      </div>
    );
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
            width: "3.5rem",
            height: "3.5rem",
            borderRadius: "0.75rem",
            background: theme === 'dark' ? "rgba(51, 65, 85, 0.5)" : "rgba(226, 232, 240, 0.8)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "2rem",
            boxShadow: theme === 'dark' ? 
              "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -2px rgba(0, 0, 0, 0.1)" : 
              "0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -2px rgba(0, 0, 0, 0.05)"
          }}>
            {team.logo}
          </div>
          <div>
            <h1 className="gradient-text" style={{
              fontSize: "1.75rem",
              fontWeight: "bold",
              marginBottom: "0.25rem",
            }}>
              {team.name} Activity
            </h1>
            <p style={{ color: mutedColor }}>
              {team.description}
            </p>
          </div>
        </div>
        
        <div style={{ display: "flex", gap: "1rem" }}>
          <Link href={`/teams/${teamId}`} style={{
            ...buttonStyle,
            display: "flex",
            alignItems: "center",
            gap: "0.5rem",
          }}>
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M19 12H5M12 19l-7-7 7-7" />
            </svg>
            Back to Team
          </Link>
        </div>
      </div>
      
      {/* Activity Section */}
      <div style={sectionStyle}>
        <h2 style={{ fontSize: "1.25rem", fontWeight: 600, color: headingColor, marginBottom: "1.5rem" }}>
          All Activity
        </h2>
        
        <Card title="Team Activity" padding="large">
          {team.activity.map((item: any) => (
            <div key={item.id} style={cardStyle}>
              <div style={{ display: "flex", alignItems: "flex-start", gap: "0.75rem" }}>
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
                  flexShrink: 0,
                }}>
                  {item.avatar}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
                    <span style={{ fontWeight: 600, color: textColor }}>{item.user}</span>
                    <span style={{ fontSize: "0.75rem", color: mutedColor }}>{item.time}</span>
                  </div>
                  <p style={{ fontSize: "0.875rem", color: textColor, marginTop: "0.25rem" }}>
                    <span>{item.action}</span>{" "}
                    <span style={{ fontWeight: 500, color: accentColor }}>{item.target}</span>
                  </p>
                  
                  {/* Additional details */}
                  <div style={{ 
                    marginTop: "0.5rem", 
                    padding: "0.5rem",
                    background: theme === 'dark' ? "rgba(15, 23, 42, 0.3)" : "rgba(248, 250, 252, 0.8)",
                    borderRadius: "0.375rem",
                    fontSize: "0.875rem",
                    color: mutedColor,
                  }}>
                    <div style={{ display: "flex", alignItems: "center", marginBottom: "0.25rem" }}>
                      <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: "0.5rem" }}>
                        <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4"></path>
                        <path d="M9 18c-4.51 2-5-2-7-2"></path>
                      </svg>
                      <span style={{ fontWeight: 500, color: textColor }}>{item.repo}</span>
                      {item.branch && (
                        <span style={{ marginLeft: "0.75rem" }}>
                          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: "0.25rem", display: "inline" }}>
                            <line x1="6" y1="3" x2="6" y2="15"></line>
                            <circle cx="18" cy="6" r="3"></circle>
                            <circle cx="6" cy="18" r="3"></circle>
                            <path d="M18 9a9 9 0 0 1-9 9"></path>
                          </svg>
                          {item.branch}
                        </span>
                      )}
                      {item.commits && (
                        <span style={{ marginLeft: "0.75rem" }}>
                          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: "0.25rem", display: "inline" }}>
                            <circle cx="12" cy="12" r="3"></circle>
                            <line x1="3" y1="12" x2="9" y2="12"></line>
                            <line x1="15" y1="12" x2="21" y2="12"></line>
                          </svg>
                          {item.commits} commits
                        </span>
                      )}
                    </div>
                    <p style={{ marginTop: "0.25rem", color: theme === 'dark' ? "#cbd5e1" : "#475569" }}>{item.details}</p>
                  </div>
                </div>
              </div>
            </div>
          ))}
      </Card>
      </div>
    </PageLayout>
  );
}
