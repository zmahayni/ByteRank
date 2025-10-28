"use client";

import { useState } from "react";
import { useTheme } from "../../components/ThemeProvider";

export default function ProfilePage() {
  const { theme } = useTheme();
  
  // Mock user data - in a real app, this would come from an API or auth service
  const [userData, setUserData] = useState({
    name: "Alex Johnson",
    description: "Senior Software Engineer passionate about web development and open source. Currently working on ByteRank to help developers track their coding consistency.",
    profilePicture: "",
    github: "https://github.com/alexjohnson",
    linkedin: "https://linkedin.com/in/alexjohnson",
    streak: 42,
    contributions: 1024,
    joined: "January 2023"
  });

  // State for profile picture upload
  const [profilePreview, setProfilePreview] = useState<string | null>(null);
  
  // Handle profile picture upload
  const handleProfileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        setProfilePreview(result);
        // In a real app, you'd upload this to a server
        setUserData({ ...userData, profilePicture: file.name });
      };
      reader.readAsDataURL(file);
    }
  };
  
  // Handle form input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setUserData({ ...userData, [name]: value });
  };
  
  // Common styles - theme aware
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
  
  const inputStyle = {
    width: "100%",
    padding: "0.75rem 1rem",
    borderRadius: "0.375rem",
    border: theme === 'dark' ? "1px solid rgba(51, 65, 85, 0.3)" : "1px solid rgba(203, 213, 225, 0.5)",
    background: theme === 'dark' ? "rgba(15, 23, 42, 0.2)" : "rgba(248, 250, 252, 0.8)",
    color: theme === 'dark' ? "white" : "hsl(220, 25%, 10%)",
    fontSize: "0.875rem",
    marginTop: "0.5rem",
    boxSizing: "border-box" as "border-box",
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
    display: "flex",
    alignItems: "center",
    gap: "0.5rem",
  };

  const statItemStyle = {
    display: "flex",
    flexDirection: "column" as "column",
    alignItems: "center",
    gap: "0.5rem",
    padding: "1rem",
    background: theme === 'dark' ? "rgba(30, 41, 59, 0.3)" : "rgba(241, 245, 249, 0.7)",
    borderRadius: "0.375rem",
    border: theme === 'dark' ? "1px solid rgba(51, 65, 85, 0.3)" : "1px solid rgba(203, 213, 225, 0.5)",
    flex: 1,
  };
  
  // Social icon container style
  const socialIconContainerStyle = {
    display: "flex", 
    alignItems: "center", 
    justifyContent: "center",
    width: "2.5rem",
    height: "2.5rem",
    background: theme === 'dark' ? "rgba(30, 41, 59, 0.3)" : "rgba(30, 58, 138, 0.1)",
    borderRadius: "0.375rem 0 0 0.375rem",
    borderWidth: "1px 0 1px 1px",
    borderStyle: "solid",
    borderColor: theme === 'dark' ? "rgba(51, 65, 85, 0.3)" : "rgba(203, 213, 225, 0.5)",
  };
  
  // Text color styles
  const headingColor = theme === 'dark' ? "#e2e8f0" : "#1e293b";
  const labelColor = theme === 'dark' ? "#94a3b8" : "#64748b";
  const iconColor = theme === 'dark' ? "currentColor" : "#1e40af"; // Darker blue for light mode

  return (
    <div style={{
      padding: "2rem",
      maxWidth: "1000px",
      margin: "0 auto",
      width: "100%",
    }}>
      {/* Page Header */}
      <h1 className="gradient-text" style={{
        fontSize: "2.5rem",
        fontWeight: "bold",
        marginBottom: "2rem",
        textAlign: "center"
      }}>
        Your Profile
      </h1>
      
      <div style={{ display: "flex", gap: "2rem", flexWrap: "wrap" }}>
        {/* Left Column - Profile Picture & Stats */}
        <div style={{ flex: "1 1 300px" }}>
          {/* Profile Picture Section */}
          <div style={sectionStyle}>
            <h2 style={{ fontSize: "1.25rem", fontWeight: 600, color: headingColor, marginBottom: "1rem" }}>
              Profile Picture
            </h2>
            
            <div style={{
              width: "100%",
              aspectRatio: "1",
              borderRadius: "1rem",
              border: "1px dashed rgba(51, 65, 85, 0.3)",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
              overflow: "hidden",
              background: profilePreview ? "transparent" : "rgba(30, 41, 59, 0.4)",
              position: "relative",
              marginBottom: "1rem",
            }}>
              {profilePreview ? (
                <img 
                  src={profilePreview} 
                  alt="Profile preview" 
                  style={{ width: "100%", height: "100%", objectFit: "cover" }} 
                />
              ) : (
                <>
                  <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ color: "#94a3b8", marginBottom: "0.75rem" }}>
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                    <circle cx="12" cy="7" r="4"></circle>
                  </svg>
                  <span style={{ color: "#94a3b8", fontSize: "0.875rem", textAlign: "center" }}>
                    Click to upload<br />profile picture
                  </span>
                </>
              )}
              <input 
                type="file" 
                accept="image/*" 
                onChange={handleProfileUpload} 
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
            
            <button style={{
              ...buttonStyle,
              width: "100%",
              justifyContent: "center",
              marginTop: "0.5rem"
            }}>
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                <polyline points="17 8 12 3 7 8"></polyline>
                <line x1="12" y1="3" x2="12" y2="15"></line>
              </svg>
              Upload New Picture
            </button>
          </div>
          
          {/* Stats Section */}
          <div style={sectionStyle}>
            <h2 style={{ fontSize: "1.25rem", fontWeight: 600, color: headingColor, marginBottom: "1rem" }}>
              Your Stats
            </h2>
            
            <div style={{ display: "flex", gap: "1rem", marginBottom: "1rem" }}>
              <div style={statItemStyle}>
                <div style={{ fontSize: "1.5rem", fontWeight: 700, color: "#fbbf24" }}>{userData.streak}</div>
                <div style={{ fontSize: "0.75rem", color: labelColor }}>Day Streak</div>
              </div>
              
              <div style={statItemStyle}>
                <div style={{ fontSize: "1.5rem", fontWeight: 700, color: "#60a5fa" }}>{userData.contributions}</div>
                <div style={{ fontSize: "0.75rem", color: labelColor }}>Contributions</div>
              </div>
            </div>
            
            <div style={{ fontSize: "0.875rem", color: labelColor, textAlign: "center" }}>
              Member since {userData.joined}
            </div>
          </div>
        </div>
        
        {/* Right Column - Profile Info */}
        <div style={{ flex: "1 1 400px" }}>
          {/* Profile Information Section */}
          <div style={sectionStyle}>
            <h2 style={{ fontSize: "1.25rem", fontWeight: 600, color: headingColor, marginBottom: "1.5rem" }}>
              Profile Information
            </h2>
            
            <div style={{ marginBottom: "1.5rem" }}>
              <label style={{ display: "block", color: labelColor, fontSize: "0.875rem" }}>
                Display Name
              </label>
              <input 
                type="text" 
                name="name"
                value={userData.name}
                onChange={handleInputChange}
                style={inputStyle}
              />
            </div>
            
            <div style={{ marginBottom: "1.5rem" }}>
              <label style={{ display: "block", color: labelColor, fontSize: "0.875rem" }}>
                Bio
              </label>
              <textarea 
                name="description"
                value={userData.description}
                onChange={handleInputChange}
                rows={5}
                style={{
                  ...inputStyle,
                  resize: "vertical",
                  minHeight: "120px",
                }}
              />
            </div>
          </div>
          
          {/* Social Links Section */}
          <div style={sectionStyle}>
            <h2 style={{ fontSize: "1.25rem", fontWeight: 600, color: headingColor, marginBottom: "1.5rem" }}>
              Social Links
            </h2>
            
            <div style={{ marginBottom: "1.5rem" }}>
              <label style={{ display: "block", color: labelColor, fontSize: "0.875rem" }}>
                GitHub Profile
              </label>
              <div style={{ display: "flex", alignItems: "center", marginTop: "0.5rem" }}>
                <div style={socialIconContainerStyle}>
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={iconColor} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"></path>
                  </svg>
                </div>
                <input 
                  type="text" 
                  name="github"
                  value={userData.github}
                  onChange={handleInputChange}
                  style={{
                    ...inputStyle,
                    marginTop: 0,
                    borderRadius: "0 0.375rem 0.375rem 0",
                    borderWidth: "1px 1px 1px 0",
                    borderStyle: "solid",
                    borderColor: "rgba(51, 65, 85, 0.3)",
                  }}
                />
              </div>
            </div>
            
            <div style={{ marginBottom: "1.5rem" }}>
              <label style={{ display: "block", color: labelColor, fontSize: "0.875rem" }}>
                LinkedIn Profile
              </label>
              <div style={{ display: "flex", alignItems: "center", marginTop: "0.5rem" }}>
                <div style={socialIconContainerStyle}>
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={iconColor} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"></path>
                    <rect x="2" y="9" width="4" height="12"></rect>
                    <circle cx="4" cy="4" r="2"></circle>
                  </svg>
                </div>
                <input 
                  type="text" 
                  name="linkedin"
                  value={userData.linkedin}
                  onChange={handleInputChange}
                  style={{
                    ...inputStyle,
                    marginTop: 0,
                    borderRadius: "0 0.375rem 0.375rem 0",
                    borderWidth: "1px 1px 1px 0",
                    borderStyle: "solid",
                    borderColor: "rgba(51, 65, 85, 0.3)",
                  }}
                />
              </div>
            </div>
          </div>
          
          {/* Save Button */}
          <div style={{ display: "flex", justifyContent: "flex-end", marginTop: "1rem" }}>
            <button style={{
              ...buttonStyle,
              padding: "0.75rem 2rem",
            }}>
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"></path>
                <polyline points="17 21 17 13 7 13 7 21"></polyline>
                <polyline points="7 3 7 8 15 8"></polyline>
              </svg>
              Save Changes
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
