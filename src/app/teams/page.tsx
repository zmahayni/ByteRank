"use client";

import { useState } from "react";
import Link from "next/link";
import { useTheme } from "../../components/ThemeProvider";
import PageLayout from "../../components/PageLayout";
import Card from "../../components/Card";

// Mock data for demonstration
const mockTeams = [
  { id: "alpha", name: "ByteBuilders", logo: "🚀", rank: 3, members: 12 },
  { id: "bravo", name: "CodeCrafters", logo: "⚙️", rank: 1, members: 8 },
  { id: "charlie", name: "DevDynamos", logo: "💻", rank: 2, members: 15 },
  { id: "delta", name: "TechTitans", logo: "⚡", rank: 4, members: 10 },
];

const mockUsers = [
  { id: "user1", name: "Alex Johnson", avatar: "AJ", streak: 12, isFriend: false },
  { id: "user2", name: "Sam Taylor", avatar: "ST", streak: 25, isFriend: true },
  { id: "user3", name: "Jordan Lee", avatar: "JL", streak: 8, isFriend: false },
  { id: "user4", name: "Casey Morgan", avatar: "CM", streak: 31, isFriend: true },
];

export default function CommunityPage() {
  const { theme } = useTheme();
  
  // State for search functionality
  const [searchType, setSearchType] = useState<"teams" | "people">("teams");
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  
  // Handle search
  const handleSearch = () => {
    if (!searchQuery.trim()) return;
    
    setIsSearching(true);
    
    // Simulate search with mock data
    setTimeout(() => {
      if (searchType === "teams") {
        setSearchResults(
          mockTeams.filter(team => 
            team.name.toLowerCase().includes(searchQuery.toLowerCase())
          )
        );
      } else {
        setSearchResults(
          mockUsers.filter(user => 
            user.name.toLowerCase().includes(searchQuery.toLowerCase())
          )
        );
      }
      setIsSearching(false);
    }, 500);
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
        {["Alex Johnson", "Sam Taylor", "Jordan Lee", "Morgan Riley"].map((name, index) => (
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
        marginBottom: "var(--margin-bottom)",
      }}>
        <h1 className="gradient-text" style={{
          fontSize: "2.5rem",
          fontWeight: "bold",
        }}>
          Community
        </h1>
      </div>
      
      {/* Main Content */}
      <div style={{
        display: "flex",
        flexDirection: "column",
        gap: "var(--gap-large)",
        width: "100%",
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
                  border: "1px solid rgba(51, 65, 85, 0.5)",
                  background: "rgba(15, 23, 42, 0.4)",
                  color: "white",
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
                        <div style={{
                          width: "2.5rem",
                          height: "2.5rem",
                          borderRadius: "0.375rem",
                          background: theme === 'dark' ? "rgba(51, 65, 85, 0.5)" : "rgba(226, 232, 240, 0.8)",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontSize: "1.25rem",
                        }}>
                          {team.logo}
                        </div>
                        <div style={{ display: "flex", flexDirection: "column", gap: "0.375rem" }}>
                          <h4 style={{ fontWeight: 600, color: headingColor, fontSize: "0.9375rem" }}>{team.name}</h4>
                          <div style={{ 
                            display: "flex", 
                            alignItems: "center", 
                            gap: "0.75rem",
                          }}>
                            {team.rank && (
                              <div style={{
                                display: "flex",
                                alignItems: "center",
                                gap: "0.375rem",
                                backgroundColor: team.rank === 1 ? "rgba(234, 179, 8, 0.15)" : 
                                                team.rank === 2 ? (theme === 'dark' ? "rgba(148, 163, 184, 0.15)" : "rgba(148, 163, 184, 0.3)") : 
                                                team.rank === 3 ? "rgba(194, 65, 12, 0.15)" : 
                                                "rgba(51, 65, 85, 0.15)",
                                color: team.rank === 1 ? "#fbbf24" : 
                                       team.rank === 2 ? (theme === 'dark' ? "#e2e8f0" : "#64748b") : 
                                       team.rank === 3 ? "#fb923c" : 
                                       "#94a3b8",
                                padding: "0.25rem 0.5rem",
                                borderRadius: "0.375rem",
                                fontSize: "0.75rem",
                                fontWeight: 600,
                              }}>
                                <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                  <path d="M12 2l2.4 7.4H22l-6 4.6 2.3 7-6.3-4.6L5.7 21l2.3-7-6-4.6h7.6z"></path>
                                </svg>
                                <span>Rank #{team.rank}</span>
                              </div>
                            )}
                            <div style={{
                              display: "flex",
                              alignItems: "center",
                              gap: "0.375rem",
                              backgroundColor: "rgba(51, 65, 85, 0.15)",
                              color: "#94a3b8",
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
                              <span>{team.members} members</span>
                            </div>
                          </div>
                        </div>
                      </div>
                      <button style={primaryButtonStyle}>
                        Request to Join
                      </button>
                    </div>
                  ))
                ) : (
                  // People search results
                  searchResults.map((user) => (
                    <div key={user.id} style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      padding: "0.75rem",
                      ...teamItemStyle,
                    }}>
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
                          {user.avatar}
                        </div>
                        <div>
                          <h4 style={{ fontWeight: 600, color: headingColor }}>{user.name}</h4>
                          <p style={{ fontSize: "0.75rem", color: labelColor }}>{user.streak} day streak</p>
                        </div>
                      </div>
                      {user.isFriend ? (
                        <div style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "0.25rem",
                          color: labelColor,
                          fontSize: "0.875rem",
                        }}>
                          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path>
                            <circle cx="9" cy="7" r="4"></circle>
                            <polyline points="16 11 18 13 22 9"></polyline>
                          </svg>
                          Friends
                        </div>
                      ) : (
                        <button style={primaryButtonStyle}>
                          Send Friend Request
                        </button>
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
              {mockTeams.map((team, index) => (
                <div key={team.id} style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  padding: "1rem 1.5rem",
                  borderBottom: index < mockTeams.length - 1 ? 
                    (theme === 'dark' ? "1px solid rgba(51, 65, 85, 0.5)" : "1px solid rgba(203, 213, 225, 0.5)") : 
                    "none",
                }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "1rem", flex: 1 }}>
                    <div style={{
                      width: "3rem",
                      height: "3rem",
                      borderRadius: "0.75rem",
                      background: theme === 'dark' ? "rgba(51, 65, 85, 0.5)" : "rgba(226, 232, 240, 0.8)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: "1.5rem",
                      flexShrink: 0
                    }}>
                      {team.logo}
                    </div>
                    <h3 style={{ fontWeight: 600, color: headingColor, fontSize: "1.125rem", marginRight: "auto" }}>
                      {team.name}
                    </h3>
                    <div style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "0.375rem",
                      backgroundColor: team.rank === 1 ? "rgba(234, 179, 8, 0.15)" : 
                                      team.rank === 2 ? (theme === 'dark' ? "rgba(148, 163, 184, 0.15)" : "rgba(148, 163, 184, 0.3)") : 
                                      team.rank === 3 ? "rgba(194, 65, 12, 0.15)" : 
                                      "rgba(51, 65, 85, 0.15)",
                      color: team.rank === 1 ? "#fbbf24" : 
                             team.rank === 2 ? (theme === 'dark' ? "#e2e8f0" : "#64748b") : 
                             team.rank === 3 ? "#fb923c" : 
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
                      <span>#{team.rank}</span>
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
                      <span>{team.members}</span>
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
              ))}
            </Card>
          </div>
        </div>
      </div>
    </PageLayout>
  );
}
