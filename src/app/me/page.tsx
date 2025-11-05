"use client";

import React, { useState, useEffect } from "react";
import { useTheme } from "../../components/ThemeProvider";
import { useAuth } from "../../context/AuthContext";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";

export default function ProfilePage() {
  const { theme } = useTheme();
  const { user } = useAuth();
  const supabase = createClientComponentClient();
  
  const [userData, setUserData] = useState({
    name: "",
    description: "",
    profilePicture: "",
    github: "",
    linkedin: "",
    streak: 0,
    contributions: 0,
    joined: ""
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const [profilePreview, setProfilePreview] = useState<string | null>(null);
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  
  // Fetch profile data from Supabase
  useEffect(() => {
    async function fetchProfile() {
      if (!user) {
        setLoading(false);
        return;
      }
      
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();
        
        console.log('Fetch profile data:', data);
        console.log('Fetch profile error:', error);
        
        if (error) {
          console.error('Error fetching profile:', error);
          return;
        }
        
        if (data) {
          setUserData({
            name: data.username || '',
            description: data.description || '',
            profilePicture: data.avatar_url || '',
            github: data.github_url || '',
            linkedin: data.linkedin_url || '',
            streak: 0,
            contributions: data.num_contributions || 0,
            joined: data.created_at ? new Date(data.created_at).toLocaleDateString('en-US', { month: 'long', year: 'numeric' }) : ''
          });
          
          if (data.avatar_url) {
            setProfilePreview(data.avatar_url);
          }
        }
      } catch (error) {
        console.error('Unexpected error fetching profile:', error);
      } finally {
        setLoading(false);
      }
    }
    
    fetchProfile();
  }, [user]);
  
  // Handle profile picture upload
  const handleProfileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;
    
    // Validate file type
    if (!file.type.startsWith('image/')) {
      setToast({ message: 'Please upload an image file', type: 'error' });
      setTimeout(() => setToast(null), 3000);
      return;
    }
    
    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setToast({ message: 'Image must be less than 5MB', type: 'error' });
      setTimeout(() => setToast(null), 3000);
      return;
    }
    
    setUploading(true);
    
    try {
      // Create unique filename with user folder
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}.${fileExt}`;
      const filePath = `${user.id}/${fileName}`;
      
      console.log('Uploading file:', filePath);
      
      // Upload to Supabase Storage
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('Avatars')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: true
        });
      
      if (uploadError) {
        console.error('Upload error:', uploadError);
        setToast({ message: 'Failed to upload image', type: 'error' });
        setTimeout(() => setToast(null), 3000);
        return;
      }
      
      console.log('Upload successful:', uploadData);
      
      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('Avatars')
        .getPublicUrl(filePath);
      
      console.log('Public URL:', publicUrl);
      
      // Update profile with new avatar URL
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ avatar_url: publicUrl })
        .eq('id', user.id);
      
      if (updateError) {
        console.error('Error updating avatar URL:', updateError);
        setToast({ message: 'Failed to update profile picture', type: 'error' });
        setTimeout(() => setToast(null), 3000);
        return;
      }
      
      // Update local state
      setUserData({ ...userData, profilePicture: publicUrl });
      setProfilePreview(publicUrl);
      
      setToast({ message: 'Profile picture updated!', type: 'success' });
      setTimeout(() => setToast(null), 3000);
      
    } catch (error) {
      console.error('Unexpected error uploading:', error);
      setToast({ message: 'An unexpected error occurred', type: 'error' });
      setTimeout(() => setToast(null), 3000);
    } finally {
      setUploading(false);
    }
  };
  
  // Handle form input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setUserData({ ...userData, [name]: value });
  };
  
  // Handle save changes
  const handleSaveChanges = async () => {
    if (!user) {
      console.error('No user found');
      return;
    }
    
    console.log('Saving profile for user:', user.id);
    console.log('Data to save:', {
      username: userData.name,
      description: userData.description,
      avatar_url: userData.profilePicture,
      github_url: userData.github,
      linkedin_url: userData.linkedin,
    });
    
    setSaving(true);
    try {
      const { data, error } = await supabase
        .from('profiles')
        .update({
          username: userData.name,
          description: userData.description,
          avatar_url: userData.profilePicture,
          github_url: userData.github,
          linkedin_url: userData.linkedin,
        })
        .eq('id', user.id)
        .select();
      
      console.log('Update response data:', data);
      console.log('Update response error:', error);
      
      if (error) {
        console.error('Error updating profile:', error);
        setToast({ message: `Failed to save: ${error.message}`, type: 'error' });
      } else {
        setToast({ message: 'Profile updated successfully!', type: 'success' });
      }
    } catch (error) {
      console.error('Unexpected error saving profile:', error);
      setToast({ message: 'An unexpected error occurred. Please try again.', type: 'error' });
    } finally {
      setSaving(false);
    }
    
    // Auto-hide toast after 3 seconds
    setTimeout(() => setToast(null), 3000);
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
  const iconColor = theme === 'dark' ? "currentColor" : "#1e40af";

  if (loading) {
    return (
      <div style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        minHeight: "50vh",
        color: labelColor,
      }}>
        Loading profile...
      </div>
    );
  }

  if (!user) {
    return (
      <div style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        minHeight: "50vh",
        color: labelColor,
      }}>
        Please sign in to view your profile.
      </div>
    );
  }

  return (
    <div style={{
      padding: "2rem",
      maxWidth: "1000px",
      margin: "0 auto",
      width: "100%",
      position: "relative",
    }}>
      {/* Toast Notification */}
      {toast && (
        <div style={{
          position: "fixed",
          top: "2rem",
          right: "2rem",
          zIndex: 1000,
          background: toast.type === 'success' 
            ? "linear-gradient(135deg, rgba(34, 197, 94, 0.95), rgba(22, 163, 74, 0.95))"
            : "linear-gradient(135deg, rgba(239, 68, 68, 0.95), rgba(220, 38, 38, 0.95))",
          color: "white",
          padding: "1rem 1.5rem",
          borderRadius: "0.75rem",
          boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.3), 0 8px 10px -6px rgba(0, 0, 0, 0.2)",
          display: "flex",
          alignItems: "center",
          gap: "0.75rem",
          minWidth: "300px",
          animation: "slideIn 0.3s ease-out",
          border: toast.type === 'success'
            ? "1px solid rgba(34, 197, 94, 0.3)"
            : "1px solid rgba(239, 68, 68, 0.3)",
        }}>
          {toast.type === 'success' ? (
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
              <polyline points="22 4 12 14.01 9 11.01"></polyline>
            </svg>
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10"></circle>
              <line x1="12" y1="8" x2="12" y2="12"></line>
              <line x1="12" y1="16" x2="12.01" y2="16"></line>
            </svg>
          )}
          <span style={{ fontSize: "0.875rem", fontWeight: 500 }}>{toast.message}</span>
        </div>
      )}
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
              overflow: "hidden",
              background: profilePreview ? "transparent" : "rgba(30, 41, 59, 0.4)",
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
                    Your profile picture
                  </span>
                </>
              )}
            </div>
            
            <input 
              ref={fileInputRef}
              type="file" 
              accept="image/*" 
              onChange={handleProfileUpload}
              style={{ display: "none" }}
            />
            
            <button 
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              style={{
                ...buttonStyle,
                width: "100%",
                justifyContent: "center",
                marginTop: "0.5rem",
                opacity: uploading ? 0.6 : 1,
                cursor: uploading ? "not-allowed" : "pointer",
              }}>
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                <polyline points="17 8 12 3 7 8"></polyline>
                <line x1="12" y1="3" x2="12" y2="15"></line>
              </svg>
              {uploading ? 'Uploading...' : 'Upload New Picture'}
            </button>
          </div>
          
          {/* Stats Section */}
          <div style={sectionStyle}>
            <h2 style={{ fontSize: "1.25rem", fontWeight: 600, color: headingColor, marginBottom: "1rem" }}>
              Your Stats
            </h2>
            
            <div style={statItemStyle}>
              <div style={{ fontSize: "1.5rem", fontWeight: 700, color: "#60a5fa" }}>{userData.contributions}</div>
              <div style={{ fontSize: "0.75rem", color: labelColor }}>Total Contributions</div>
            </div>
            
            <div style={{ 
              fontSize: "0.875rem", 
              color: labelColor, 
              textAlign: "center",
              marginTop: "1rem",
              paddingTop: "1rem",
              borderTop: theme === 'dark' ? "1px solid rgba(51, 65, 85, 0.3)" : "1px solid rgba(203, 213, 225, 0.5)"
            }}>
              <div style={{ marginBottom: "0.25rem", fontWeight: 500 }}>Member Since</div>
              <div style={{ color: headingColor }}>{userData.joined}</div>
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
            <button 
              onClick={handleSaveChanges}
              disabled={saving}
              style={{
                ...buttonStyle,
                padding: "0.75rem 2rem",
                opacity: saving ? 0.6 : 1,
                cursor: saving ? "not-allowed" : "pointer",
              }}>
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"></path>
                <polyline points="17 21 17 13 7 13 7 21"></polyline>
                <polyline points="7 3 7 8 15 8"></polyline>
              </svg>
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
