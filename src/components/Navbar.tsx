"use client";

import Link from "next/link";
import { useTheme } from "./ThemeProvider";
import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";

export default function Navbar() {
  const { theme, toggleTheme } = useTheme();
  const { user, signOut } = useAuth();
  const [mounted, setMounted] = useState(false);

  // Only show the theme toggle after mounting to prevent hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  // Common button styles
  const buttonBaseStyle = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '0.5rem 0.875rem',
    borderRadius: '9999px',
    fontSize: '0.875rem',
    fontWeight: 500,
    transition: 'all 0.2s ease',
    textDecoration: 'none',
  };

  // Style for regular nav buttons - theme aware
  const navButtonStyle = {
    ...buttonBaseStyle,
    background: theme === 'dark' ? 'rgba(30, 41, 59, 0.4)' : 'rgba(241, 245, 249, 0.8)',
    color: theme === 'dark' ? 'white' : 'hsl(220, 25%, 10%)',
    border: theme === 'dark' ? '1px solid rgba(51, 65, 85, 0.3)' : '1px solid rgba(203, 213, 225, 0.5)',
    boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
    minWidth: '80px',
  };

  // Style for GitHub sign up button - theme aware
  const githubButtonStyle = {
    ...buttonBaseStyle,
    background: 'linear-gradient(to right, rgba(59, 130, 246, 0.7), rgba(147, 51, 234, 0.7))',
    color: 'white',
    border: '1px solid rgba(79, 70, 229, 0.3)',
    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -2px rgba(0, 0, 0, 0.1)',
    gap: '0.375rem',
    padding: '0.5rem 1rem',
  };

  // Theme toggle button style
  const themeToggleStyle = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '0.5rem',
    borderRadius: '9999px',
    background: theme === 'dark' ? 'rgba(30, 41, 59, 0.4)' : 'rgba(241, 245, 249, 0.8)',
    border: theme === 'dark' ? '1px solid rgba(51, 65, 85, 0.3)' : '1px solid rgba(203, 213, 225, 0.5)',
    color: theme === 'dark' ? 'white' : 'hsl(220, 25%, 10%)',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
  };

  return (
    <nav style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '0.6rem calc(var(--section-padding) * 0.8)',
      background: theme === 'dark' ? 'rgba(15, 23, 42, 0.95)' : 'rgba(255, 255, 255, 0.95)',
      borderBottom: theme === 'dark' ? '1px solid rgba(30, 41, 59, 0.5)' : '1px solid rgba(203, 213, 225, 0.5)',
      position: 'sticky',
      top: 0,
      zIndex: 10,
      height: '48px', // Fixed height for navbar
      boxSizing: 'border-box'
    }}>
      <Link href="/" style={{ display: 'flex', alignItems: 'center', textDecoration: 'none' }}>
        <span className="gradient-text" style={{ fontSize: '1.25rem', fontWeight: 'bold' }}>ByteRank</span>
      </Link>
      <div style={{ display: 'flex', gap: 'var(--gap-small)', alignItems: 'center' }}>
        {mounted && (
          <button 
            onClick={toggleTheme} 
            style={themeToggleStyle}
            onMouseOver={(e) => {
              e.currentTarget.style.background = theme === 'dark' ? 'rgba(51, 65, 85, 0.5)' : 'rgba(226, 232, 240, 0.9)';
              e.currentTarget.style.transform = 'translateY(-2px)';
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.background = theme === 'dark' ? 'rgba(30, 41, 59, 0.4)' : 'rgba(241, 245, 249, 0.8)';
              e.currentTarget.style.transform = 'translateY(0)';
            }}
          >
            {theme === 'dark' ? (
              // Sun icon for dark mode
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="5"></circle>
                <line x1="12" y1="1" x2="12" y2="3"></line>
                <line x1="12" y1="21" x2="12" y2="23"></line>
                <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line>
                <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line>
                <line x1="1" y1="12" x2="3" y2="12"></line>
                <line x1="21" y1="12" x2="23" y2="12"></line>
                <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line>
                <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>
              </svg>
            ) : (
              // Moon icon for light mode
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>
              </svg>
            )}
          </button>
        )}
        <Link 
          href="/teams" 
          style={navButtonStyle}
          onMouseOver={(e) => {
            e.currentTarget.style.background = theme === 'dark' ? 'rgba(51, 65, 85, 0.5)' : 'rgba(226, 232, 240, 0.9)';
            e.currentTarget.style.transform = 'translateY(-2px)';
          }}
          onMouseOut={(e) => {
            e.currentTarget.style.background = theme === 'dark' ? 'rgba(30, 41, 59, 0.4)' : 'rgba(241, 245, 249, 0.8)';
            e.currentTarget.style.transform = 'translateY(0)';
          }}
        >
          Community
        </Link>
        <Link 
          href="/me" 
          style={navButtonStyle}
          onMouseOver={(e) => {
            e.currentTarget.style.background = theme === 'dark' ? 'rgba(51, 65, 85, 0.5)' : 'rgba(226, 232, 240, 0.9)';
            e.currentTarget.style.transform = 'translateY(-2px)';
          }}
          onMouseOut={(e) => {
            e.currentTarget.style.background = theme === 'dark' ? 'rgba(30, 41, 59, 0.4)' : 'rgba(241, 245, 249, 0.8)';
            e.currentTarget.style.transform = 'translateY(0)';
          }}
        >
          Profile
        </Link>
        <Link 
          href="/feedback" 
          style={navButtonStyle}
          onMouseOver={(e) => {
            e.currentTarget.style.background = theme === 'dark' ? 'rgba(51, 65, 85, 0.5)' : 'rgba(226, 232, 240, 0.9)';
            e.currentTarget.style.transform = 'translateY(-2px)';
          }}
          onMouseOut={(e) => {
            e.currentTarget.style.background = theme === 'dark' ? 'rgba(30, 41, 59, 0.4)' : 'rgba(241, 245, 249, 0.8)';
            e.currentTarget.style.transform = 'translateY(0)';
          }}
        >
          Give Feedback
        </Link>
        {user ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span style={{ 
              color: theme === 'dark' ? 'white' : 'hsl(220, 25%, 10%)',
              fontSize: '0.875rem',
              fontWeight: 500
            }}>
              {user.user_metadata?.user_name || user.email || 'User'}
            </span>
            <button 
              onClick={() => signOut()}
              style={{
                ...navButtonStyle,
                background: theme === 'dark' ? 'rgba(239, 68, 68, 0.2)' : 'rgba(239, 68, 68, 0.1)',
                color: theme === 'dark' ? 'rgba(239, 68, 68, 0.9)' : 'rgba(239, 68, 68, 0.8)',
                border: theme === 'dark' ? '1px solid rgba(239, 68, 68, 0.3)' : '1px solid rgba(239, 68, 68, 0.2)',
                padding: '0.4rem 0.75rem',
                cursor: 'pointer'
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.background = theme === 'dark' ? 'rgba(239, 68, 68, 0.3)' : 'rgba(239, 68, 68, 0.2)';
                e.currentTarget.style.transform = 'translateY(-2px)';
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.background = theme === 'dark' ? 'rgba(239, 68, 68, 0.2)' : 'rgba(239, 68, 68, 0.1)';
                e.currentTarget.style.transform = 'translateY(0)';
              }}
            >
              Sign out
            </button>
          </div>
        ) : (
          <Link 
            href="/sign-in" 
            style={githubButtonStyle}
            onMouseOver={(e) => {
              e.currentTarget.style.background = 'linear-gradient(to right, rgba(37, 99, 235, 0.8), rgba(126, 34, 206, 0.8))';
              e.currentTarget.style.transform = 'translateY(-2px)';
              e.currentTarget.style.boxShadow = '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -4px rgba(0, 0, 0, 0.1)';
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.background = 'linear-gradient(to right, rgba(59, 130, 246, 0.7), rgba(147, 51, 234, 0.7))';
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -2px rgba(0, 0, 0, 0.1)';
            }}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"></path>
            </svg>
            Sign up with GitHub
          </Link>
        )}
      </div>
    </nav>
  );
}
