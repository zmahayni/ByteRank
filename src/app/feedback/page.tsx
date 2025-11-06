"use client";

import React, { useState } from "react";
import { useTheme } from "../../components/ThemeProvider";
import { useAuth } from "../../context/AuthContext";

export default function FeedbackPage() {
  const { theme } = useTheme();
  const { user } = useAuth();
  
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: ""
  });
  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  // Pre-fill disabled - users will enter their own information
  // React.useEffect(() => {
  //   if (user) {
  //     setFormData(prev => ({
  //       ...prev,
  //       name: user.user_metadata?.user_name || user.user_metadata?.full_name || "",
  //       email: user.email || ""
  //     }));
  //   }
  // }, [user]);

  // Handle form input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate form
    if (!formData.name || !formData.email || !formData.subject || !formData.message) {
      setToast({ message: 'Please fill in all fields', type: 'error' });
      setTimeout(() => setToast(null), 3000);
      return;
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setToast({ message: 'Please enter a valid email address', type: 'error' });
      setTimeout(() => setToast(null), 3000);
      return;
    }

    setSubmitting(true);
    
    try {
      // Call the edge function to send email
      const response = await fetch('/api/send-feedback', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error('Failed to send feedback');
      }

      setToast({ message: 'Feedback sent successfully! Thank you for your input.', type: 'success' });
      
      // Reset form
      setFormData({
        name: "",
        email: "",
        subject: "",
        message: ""
      });
      
    } catch (error) {
      console.error('Error sending feedback:', error);
      setToast({ message: 'Failed to send feedback. Please try again later.', type: 'error' });
    } finally {
      setSubmitting(false);
      setTimeout(() => setToast(null), 5000);
    }
  };

  // Common styles - theme aware
  const sectionStyle = {
    background: theme === 'dark' ? "rgba(15, 23, 42, 0.95)" : "rgba(255, 255, 255, 0.95)",
    borderRadius: "0.75rem",
    border: theme === 'dark' ? "1px solid rgba(51, 65, 85, 0.3)" : "1px solid rgba(203, 213, 225, 0.5)",
    padding: "2rem",
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
    padding: "0.75rem 2rem",
    fontSize: "0.875rem",
    fontWeight: 600,
    cursor: "pointer",
    transition: "all 0.2s ease",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "0.5rem",
    width: "100%",
  };

  const headingColor = theme === 'dark' ? "#e2e8f0" : "#1e293b";
  const labelColor = theme === 'dark' ? "#94a3b8" : "#64748b";

  return (
    <div style={{
      padding: "2rem",
      maxWidth: "800px",
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
        marginBottom: "1rem",
        textAlign: "center"
      }}>
        Give Feedback
      </h1>
      
      <p style={{
        textAlign: "center",
        color: labelColor,
        fontSize: "1rem",
        marginBottom: "2rem",
        lineHeight: "1.6"
      }}>
        We'd love to hear your thoughts, suggestions, or any issues you've encountered. Your feedback helps us improve ByteRank!
      </p>

      {/* Feedback Form */}
      <div style={sectionStyle}>
        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: "1.5rem" }}>
            <label style={{ display: "block", color: labelColor, fontSize: "0.875rem", fontWeight: 500 }}>
              Your Name
            </label>
            <input 
              type="text" 
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              placeholder="John Doe"
              style={inputStyle}
              required
            />
          </div>

          <div style={{ marginBottom: "1.5rem" }}>
            <label style={{ display: "block", color: labelColor, fontSize: "0.875rem", fontWeight: 500 }}>
              Email Address
            </label>
            <input 
              type="email" 
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              placeholder="john@example.com"
              style={inputStyle}
              required
            />
          </div>

          <div style={{ marginBottom: "1.5rem" }}>
            <label style={{ display: "block", color: labelColor, fontSize: "0.875rem", fontWeight: 500 }}>
              Subject
            </label>
            <input 
              type="text" 
              name="subject"
              value={formData.subject}
              onChange={handleInputChange}
              placeholder="What's this about?"
              style={inputStyle}
              required
            />
          </div>

          <div style={{ marginBottom: "2rem" }}>
            <label style={{ display: "block", color: labelColor, fontSize: "0.875rem", fontWeight: 500 }}>
              Message
            </label>
            <textarea 
              name="message"
              value={formData.message}
              onChange={handleInputChange}
              rows={8}
              placeholder="Tell us what's on your mind..."
              style={{
                ...inputStyle,
                resize: "vertical",
                minHeight: "180px",
              }}
              required
            />
          </div>

          <button 
            type="submit"
            disabled={submitting}
            style={{
              ...buttonStyle,
              opacity: submitting ? 0.6 : 1,
              cursor: submitting ? "not-allowed" : "pointer",
            }}
            onMouseOver={(e) => {
              if (!submitting) {
                e.currentTarget.style.background = 'linear-gradient(to right, rgba(37, 99, 235, 0.8), rgba(126, 34, 206, 0.8))';
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -4px rgba(0, 0, 0, 0.1)';
              }
            }}
            onMouseOut={(e) => {
              if (!submitting) {
                e.currentTarget.style.background = 'linear-gradient(to right, #3b82f6, #8b5cf6)';
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = 'none';
              }
            }}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="22" y1="2" x2="11" y2="13"></line>
              <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
            </svg>
            {submitting ? 'Sending...' : 'Send Feedback'}
          </button>
        </form>
      </div>

      {/* Additional Info */}
      <div style={{
        marginTop: "2rem",
        padding: "1.5rem",
        background: theme === 'dark' ? "rgba(30, 41, 59, 0.3)" : "rgba(241, 245, 249, 0.7)",
        borderRadius: "0.75rem",
        border: theme === 'dark' ? "1px solid rgba(51, 65, 85, 0.3)" : "1px solid rgba(203, 213, 225, 0.5)",
      }}>
        <div style={{ display: "flex", alignItems: "flex-start", gap: "1rem" }}>
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={theme === 'dark' ? "#60a5fa" : "#3b82f6"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0, marginTop: "0.125rem" }}>
            <circle cx="12" cy="12" r="10"></circle>
            <line x1="12" y1="16" x2="12" y2="12"></line>
            <line x1="12" y1="8" x2="12.01" y2="8"></line>
          </svg>
          <div>
            <h3 style={{ fontSize: "1rem", fontWeight: 600, color: headingColor, marginBottom: "0.5rem" }}>
              What happens next?
            </h3>
            <p style={{ fontSize: "0.875rem", color: labelColor, lineHeight: "1.6", margin: 0 }}>
              Your feedback will be sent directly to our team at <strong>zmahayni056@gmail.com</strong>. We review all submissions and will get back to you if we need more information or have updates to share.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
