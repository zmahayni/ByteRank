"use client";

import { useTheme } from "./ThemeProvider";

export default function LoadingSpinner() {
  const { theme } = useTheme();
  
  return (
    <div style={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      height: '100vh',
      width: '100%'
    }}>
      <div style={{
        width: '40px',
        height: '40px',
        borderRadius: '50%',
        border: `3px solid ${theme === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'}`,
        borderTop: `3px solid ${theme === 'dark' ? 'rgba(147, 51, 234, 0.8)' : 'rgba(59, 130, 246, 0.8)'}`,
        animation: 'spin 1s linear infinite'
      }} />
      <style jsx global>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
