"use client";

import { useState } from "react";
import Link from "next/link";
import { useTheme } from "../../../components/ThemeProvider";

// Mock data for demonstration
const mockUsers = [
  { id: "user1", name: "Alex Johnson", avatar: "AJ", streak: 12, isFriend: true },
  { id: "user2", name: "Sam Taylor", avatar: "ST", streak: 25, isFriend: true },
  { id: "user3", name: "Jordan Lee", avatar: "JL", streak: 8, isFriend: true },
  { id: "user4", name: "Casey Morgan", avatar: "CM", streak: 31, isFriend: true },
];

export default function CreateTeamPage() {
  const { theme } = useTheme();
  
  // Form state
  const [teamName, setTeamName] = useState("");
  const [teamDescription, setTeamDescription] = useState("");
  const [teamLogo, setTeamLogo] = useState<string | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  
  // Team members management
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [teamMembers, setTeamMembers] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  
  // Handle logo upload
  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        setLogoPreview(result);
        setTeamLogo(file.name); // In a real app, you'd upload the file to a server
      };
      reader.readAsDataURL(file);
    }
  };
  
  // Handle member search
  const handleSearch = () => {
    if (!searchQuery.trim()) return;
    
    setIsSearching(true);
    
    // Simulate search with mock data
    setTimeout(() => {
      setSearchResults(
        mockUsers.filter(user => 
          user.name.toLowerCase().includes(searchQuery.toLowerCase()) &&
          !teamMembers.some(member => member.id === user.id)
        )
      );
      setIsSearching(false);
    }, 500);
  };
  
  // Add member to team
  const addMember = (user: any, role: 'member' | 'admin' = 'member') => {
    setTeamMembers([...teamMembers, { ...user, role }]);
    setSearchResults(searchResults.filter(result => result.id !== user.id));
  };
  
  // Remove member from team
  const removeMember = (userId: string) => {
    setTeamMembers(teamMembers.filter(member => member.id !== userId));
  };
  
  // Change member role
  const changeMemberRole = (userId: string, newRole: 'member' | 'admin') => {
    setTeamMembers(
      teamMembers.map(member => 
        member.id === userId ? { ...member, role: newRole } : member
      )
    );
  };
  
  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // In a real app, you'd send this data to your backend
    const teamData = {
      name: teamName,
      description: teamDescription,
      logo: teamLogo,
      members: teamMembers,
    };
    
    console.log('Team data to submit:', teamData);
    
    // Redirect to teams page after successful creation
    // In a real app, you'd wait for the API response before redirecting
    window.location.href = '/teams';
  };
  
  // Common styles
  const inputStyle = {
    width: "100%",
    padding: "0.75rem 1rem",
    borderRadius: "0.375rem",
    border: theme === 'dark' ? "1px solid rgba(51, 65, 85, 0.3)" : "1px solid #cbd5e1",
    background: theme === 'dark' ? "rgba(15, 23, 42, 0.3)" : "#f9fafb",
    color: theme === 'dark' ? "white" : "#1e293b",
    fontSize: "0.875rem",
    boxSizing: "border-box" as "border-box",
  };
  
  const buttonStyle = {
    background: theme === 'dark' ? "rgba(30, 41, 59, 0.4)" : "#f9fafb",
    color: theme === 'dark' ? "white" : "#1e293b",
    border: theme === 'dark' ? "1px solid rgba(51, 65, 85, 0.3)" : "1px solid #cbd5e1",
    borderRadius: "0.375rem",
    padding: "0.5rem 1rem",
    fontSize: "0.875rem",
    fontWeight: 500,
    cursor: "pointer",
    transition: "all 0.2s ease",
    display: "flex",
    alignItems: "center",
    gap: "0.5rem",
  };
  
  const primaryButtonStyle = {
    background: "linear-gradient(to right, #3b82f6, #8b5cf6)",
    color: "white",
    border: "none",
    borderRadius: "0.375rem",
    padding: "0.75rem 1.5rem",
    fontSize: "0.875rem",
    fontWeight: 600,
    cursor: "pointer",
    transition: "all 0.2s ease",
    display: "flex",
    alignItems: "center",
    gap: "0.5rem",
  };
  
  const sectionStyle = {
    background: theme === 'dark' ? "rgba(15, 23, 42, 0.95)" : "#f9fafb",
    borderRadius: "0.75rem",
    border: theme === 'dark' ? "1px solid rgba(51, 65, 85, 0.5)" : "1px solid #cbd5e1",
    padding: "1.5rem",
    marginBottom: "2rem",
    boxShadow: theme === 'dark' ? 
      "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -2px rgba(0, 0, 0, 0.1)" : 
      "0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -2px rgba(0, 0, 0, 0.05)"
  };

  return (
    <div style={{
      padding: "2rem",
      maxWidth: "1200px",
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
          Create Team
        </h1>
        <Link 
          href="/teams" 
          style={{
            display: "flex",
            alignItems: "center",
            gap: "0.5rem",
            color: theme === 'dark' ? "#cbd5e1" : "#1e40af",
            background: theme === 'dark' ? "transparent" : "#f9fafb",
            padding: "0.5rem 0.75rem",
            borderRadius: "0.375rem",
            border: theme === 'dark' ? "none" : "1px solid #cbd5e1",
            textDecoration: "none",
            fontSize: "0.875rem",
            fontWeight: 500,
            transition: "all 0.2s ease"
          }}
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M19 12H5M12 19l-7-7 7-7" />
          </svg>
          Back to Teams
        </Link>
      </div>
      
      <form onSubmit={handleSubmit}>
        {/* Team Details Section */}
        <div style={sectionStyle}>
          <h2 style={{ fontSize: "1.25rem", fontWeight: 600, color: theme === 'dark' ? "#e2e8f0" : "#1e293b", marginBottom: "1.5rem" }}>
            Team Details
          </h2>
          
          <div style={{ display: "flex", gap: "2rem", flexDirection: "column", alignItems: "stretch" }}>
            {/* Team Name */}
            <div>
              <label style={{ display: "block", marginBottom: "0.5rem", color: theme === 'dark' ? "#94a3b8" : "#64748b", fontSize: "0.875rem" }}>
                Team Name*
              </label>
              <input 
                type="text" 
                value={teamName}
                onChange={(e) => setTeamName(e.target.value)}
                placeholder="Enter team name"
                required
                style={{
                  ...inputStyle,
                  height: "42px",
                  width: "100%",
                  marginRight: "1rem"
                }}
              />
            </div>

            <div style={{ display: "flex", gap: "2rem", marginTop: "1.5rem" }}>
            {/* Logo Upload */}
            <div style={{ width: "200px", flexShrink: 0 }}>
              <label style={{ display: "block", marginBottom: "0.5rem", color: theme === 'dark' ? "#94a3b8" : "#64748b", fontSize: "0.875rem" }}>
                Team Logo
              </label>
              <div style={{
                width: "200px",
                height: "200px",
                borderRadius: "1rem",
                border: "1px dashed rgba(51, 65, 85, 0.4)",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
                overflow: "hidden",
                background: logoPreview ? "transparent" : theme === 'dark' ? "rgba(30, 41, 59, 0.4)" : "rgba(241, 245, 249, 0.7)",
                position: "relative",
              }}>
                {logoPreview ? (
                  <img 
                    src={logoPreview} 
                    alt="Team logo preview" 
                    style={{ width: "100%", height: "100%", objectFit: "cover" }} 
                  />
                ) : (
                  <>
                    <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: theme === 'dark' ? "#94a3b8" : "#64748b", marginBottom: "0.5rem" }}>
                      <path d="M4 14.899A7 7 0 1 1 15.71 8h1.79a4.5 4.5 0 0 1 2.5 8.242"></path>
                      <path d="M12 12v9"></path>
                      <path d="m16 16-4-4-4 4"></path>
                    </svg>
                    <span style={{ color: theme === 'dark' ? "#94a3b8" : "#64748b", fontSize: "0.875rem", textAlign: "center" }}>
                      Click to upload<br />or drag and drop
                    </span>
                  </>
                )}
                <input 
                  type="file" 
                  accept="image/*" 
                  onChange={handleLogoUpload} 
                  style={{ 
                    opacity: 0, 
                    position: "absolute", 
                    top: 0, 
                    left: 0, 
                    width: "100%", 
                    height: "100%", 
                    cursor: "pointer" 
                  }} 
                />
              </div>
              <p style={{ color: theme === 'dark' ? "#94a3b8" : "#64748b", fontSize: "0.75rem", marginTop: "0.5rem" }}>
                Recommended: 512×512px, PNG or JPG
              </p>
            </div>
            
            {/* Description */}
            <div style={{ flex: 1 }}>
              <label style={{ display: "block", marginBottom: "0.5rem", color: theme === 'dark' ? "#94a3b8" : "#64748b", fontSize: "0.875rem" }}>
                Description
              </label>
              <textarea 
                value={teamDescription}
                onChange={(e) => setTeamDescription(e.target.value)}
                placeholder="Describe your team's purpose, goals, etc."
                rows={7}
                style={{
                  ...inputStyle,
                  resize: "vertical",
                  height: "120px",
                  width: "100%",
                  marginRight: "1rem"
                }}
              />
            </div>
            </div>
          </div>
        </div>
        
        {/* Team Members Section */}
        <div style={sectionStyle}>
          <h2 style={{ fontSize: "1.25rem", fontWeight: 600, color: theme === 'dark' ? "#e2e8f0" : "#1e293b", marginBottom: "1.5rem" }}>
            Team Members
          </h2>
          
          {/* Search and Add Members */}
          <div style={{ marginBottom: "2rem" }}>
            <label style={{ display: "block", marginBottom: "0.5rem", color: theme === 'dark' ? "#94a3b8" : "#64748b", fontSize: "0.875rem" }}>
              Invite Members
            </label>
            <div style={{ display: "flex", gap: "0.5rem", width: "100%" }}>
              <input 
                type="text" 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                placeholder="Search by name or email"
                style={{ 
                  ...inputStyle, 
                  flex: 1,
                  height: "42px",
                  marginRight: "0.5rem"
                }}
              />
              <button 
                type="button"
                onClick={handleSearch}
                style={{
                  ...primaryButtonStyle,
                  height: "42px",
                  padding: "0 1rem"
                }}
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="11" cy="11" r="8"></circle>
                  <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                </svg>
                Search
              </button>
            </div>
            
            {/* Search Results */}
            {isSearching ? (
              <div style={{ textAlign: "center", padding: "1rem", color: theme === 'dark' ? "#94a3b8" : "#64748b" }}>
                Searching...
              </div>
            ) : searchResults.length > 0 ? (
              <div style={{ marginTop: "1rem" }}>
                <h3 style={{ fontSize: "0.875rem", fontWeight: 600, color: theme === 'dark' ? "#94a3b8" : "#64748b", marginBottom: "0.5rem" }}>
                  Search Results
                </h3>
                <div style={{ 
                  display: "flex", 
                  flexDirection: "column", 
                  gap: "0.5rem",
                  maxHeight: "200px",
                  overflowY: "auto",
                  padding: "0.5rem",
                  background: theme === 'dark' ? "rgba(15, 23, 42, 0.3)" : "rgba(248, 250, 252, 0.8)",
                  borderRadius: "0.375rem",
                  border: theme === 'dark' ? "1px solid rgba(51, 65, 85, 0.4)" : "1px solid rgba(203, 213, 225, 0.5)",
                }}>
                  {searchResults.map((user) => (
                    <div key={user.id} style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      padding: "0.5rem",
                      borderRadius: "0.375rem",
                      background: theme === 'dark' ? "rgba(30, 41, 59, 0.4)" : "rgba(241, 245, 249, 0.7)",
                      border: theme === 'dark' ? "1px solid rgba(51, 65, 85, 0.3)" : "1px solid rgba(203, 213, 225, 0.5)",
                    }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
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
                          fontSize: "0.75rem",
                        }}>
                          {user.avatar}
                        </div>
                        <div>
                          <h4 style={{ fontWeight: 600, color: theme === 'dark' ? "#e2e8f0" : "#1e293b", fontSize: "0.875rem" }}>{user.name}</h4>
                        </div>
                      </div>
                      <div style={{ display: "flex", gap: "0.5rem" }}>
                        <button 
                          type="button"
                          onClick={() => addMember(user, 'member')}
                          style={{
                            ...buttonStyle,
                            height: "36px",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center"
                          }}
                        >
                          Add as Member
                        </button>
                        <button 
                          type="button"
                          onClick={() => addMember(user, 'admin')}
                          style={{
                            ...buttonStyle,
                            background: "rgba(59, 130, 246, 0.3)",
                            height: "36px",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center"
                          }}
                        >
                          Add as Admin
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : null}
          </div>
          
          {/* Current Team Members */}
          <div>
            <h3 style={{ fontSize: "0.875rem", fontWeight: 600, color: theme === 'dark' ? "#94a3b8" : "#64748b", marginBottom: "0.5rem" }}>
              Current Team Members ({teamMembers.length})
            </h3>
            
            {teamMembers.length === 0 ? (
              <div style={{ 
                padding: "1.5rem", 
                textAlign: "center", 
                color: theme === 'dark' ? "#94a3b8" : "#64748b",
                background: theme === 'dark' ? "rgba(15, 23, 42, 0.3)" : "rgba(248, 250, 252, 0.8)",
                borderRadius: "0.375rem",
                border: theme === 'dark' ? "1px solid rgba(51, 65, 85, 0.4)" : "1px solid rgba(203, 213, 225, 0.5)",
              }}>
                No team members added yet. Use the search above to add members.
              </div>
            ) : (
              <div style={{ 
                display: "flex", 
                flexDirection: "column", 
                gap: "0.5rem",
                maxHeight: "300px",
                overflowY: "auto",
                padding: "0.5rem",
                background: "rgba(15, 23, 42, 0.3)",
                borderRadius: "0.375rem",
                border: "1px solid rgba(51, 65, 85, 0.4)",
              }}>
                {/* You (Owner) */}
                <div style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  padding: "0.75rem",
                  borderRadius: "0.375rem",
                  background: "rgba(30, 41, 59, 0.4)",
                  border: "1px solid rgba(51, 65, 85, 0.3)",
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
                      YU
                    </div>
                    <div>
                      <h4 style={{ fontWeight: 600, color: "#e2e8f0" }}>You</h4>
                      <div style={{ 
                        display: "inline-flex", 
                        alignItems: "center", 
                        gap: "0.25rem",
                        color: "#f59e0b",
                        fontSize: "0.75rem",
                        fontWeight: 600,
                        background: "rgba(245, 158, 11, 0.1)",
                        padding: "0.125rem 0.5rem",
                        borderRadius: "9999px",
                        marginTop: "0.25rem",
                      }}>
                        <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M12 2l2.4 7.4H22l-6 4.6 2.3 7-6.3-4.6L5.7 21l2.3-7-6-4.6h7.6z"></path>
                        </svg>
                        Owner
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Added Team Members */}
                {teamMembers.map((member) => (
                  <div key={member.id} style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    padding: "0.75rem",
                    borderRadius: "0.375rem",
                    background: "rgba(30, 41, 59, 0.4)",
                    border: "1px solid rgba(51, 65, 85, 0.3)",
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
                        {member.avatar}
                      </div>
                      <div>
                        <h4 style={{ fontWeight: 600, color: "#e2e8f0" }}>{member.name}</h4>
                        <div style={{ 
                          display: "inline-flex", 
                          alignItems: "center", 
                          gap: "0.25rem",
                          color: member.role === 'admin' ? "#3b82f6" : "#94a3b8",
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
                    <div style={{ display: "flex", gap: "0.5rem" }}>
                      {member.role === 'member' ? (
                        <button 
                          type="button"
                          onClick={() => changeMemberRole(member.id, 'admin')}
                          style={{
                            ...buttonStyle,
                            height: "36px",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center"
                          }}
                        >
                          Make Admin
                        </button>
                      ) : (
                        <button 
                          type="button"
                          onClick={() => changeMemberRole(member.id, 'member')}
                          style={{
                            ...buttonStyle,
                            height: "36px",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center"
                          }}
                        >
                          Remove Admin
                        </button>
                      )}
                      <button 
                        type="button"
                        onClick={() => removeMember(member.id)}
                        style={{
                          ...buttonStyle,
                          color: "#ef4444",
                          borderColor: "rgba(239, 68, 68, 0.2)",
                          height: "36px",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center"
                        }}
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
        
        {/* Form Actions */}
        <div style={{
          display: "flex",
          justifyContent: "flex-end",
          gap: "1rem",
          marginTop: "2rem",
        }}>
          <Link 
            href="/teams" 
            style={{
              ...buttonStyle,
              textDecoration: "none",
              display: "inline-flex",
              alignItems: "center",
              height: "42px",
              padding: "0 1.5rem",
            }}
          >
            Cancel
          </Link>
          <button 
            type="submit"
            style={{
              ...primaryButtonStyle,
              height: "42px",
              padding: "0 2rem",
            }}
          >
            Create Team
          </button>
        </div>
      </form>
    </div>
  );
}
