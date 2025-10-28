"use client";

import React from 'react';
import { useTheme } from './ThemeProvider';

interface PageLayoutProps {
  children: React.ReactNode;
  rightSidebar?: React.ReactNode;
  fullWidth?: boolean;
}

export default function PageLayout({ 
  children, 
  rightSidebar,
  fullWidth = false
}: PageLayoutProps) {
  const { theme } = useTheme();
  
  return (
    <div style={{
      width: fullWidth ? '100%' : 'var(--content-width)',
      maxWidth: 'var(--max-content-width)',
      margin: '0 auto',
      display: 'flex',
      gap: 'var(--gap-large)',
      position: 'relative',
    }}>
      {/* Main content area */}
      <div style={{
        flex: rightSidebar ? `0 1 calc(100% - var(--sidebar-width) - var(--gap-large))` : '1 1 100%',
        padding: 'var(--section-padding)',
      }}>
        {children}
      </div>
      
      {/* Right sidebar (optional) */}
      {rightSidebar && (
        <div style={{
          width: 'var(--sidebar-width)',
          background: theme === 'dark' ? 'rgba(15, 23, 42, 0.95)' : 'rgba(255, 255, 255, 0.95)',
          borderLeft: theme === 'dark' ? '1px solid rgba(51, 65, 85, 0.5)' : '1px solid rgba(203, 213, 225, 0.5)',
          padding: 'var(--card-padding)',
          height: 'calc(100vh - 48px)', // Adjust based on navbar height
          position: 'sticky',
          top: '48px', // Adjust based on navbar height
          overflowY: 'auto',
        }}>
          {rightSidebar}
        </div>
      )}
    </div>
  );
}
