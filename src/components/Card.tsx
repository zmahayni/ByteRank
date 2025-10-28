"use client";

import React from 'react';
import { useTheme } from './ThemeProvider';

interface CardProps {
  children: React.ReactNode;
  title?: string;
  padding?: 'small' | 'medium' | 'large';
  className?: string;
  style?: React.CSSProperties;
}

export default function Card({ 
  children, 
  title, 
  padding = 'medium',
  className = '',
  style = {}
}: CardProps) {
  const { theme } = useTheme();
  
  const getPadding = () => {
    switch (padding) {
      case 'small': return 'calc(var(--card-padding) * 0.75)';
      case 'large': return 'calc(var(--card-padding) * 1.25)';
      default: return 'var(--card-padding)';
    }
  };
  
  return (
    <div 
      className={className}
      style={{
        background: theme === 'dark' ? "rgba(15, 23, 42, 0.95)" : "rgba(255, 255, 255, 0.95)",
        borderRadius: "var(--radius)",
        border: theme === 'dark' ? "1px solid rgba(51, 65, 85, 0.5)" : "1px solid rgba(203, 213, 225, 0.5)",
        boxShadow: theme === 'dark' ? 
          "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -2px rgba(0, 0, 0, 0.1)" : 
          "0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -2px rgba(0, 0, 0, 0.05)",
        padding: getPadding(),
        marginBottom: 'var(--margin-bottom)',
        ...style
      }}
    >
      {title && (
        <h2 style={{ 
          fontSize: "1.25rem", 
          fontWeight: 600, 
          color: theme === 'dark' ? "#e2e8f0" : "#1e293b",
          marginTop: 0,
          marginBottom: 'var(--gap-medium)'
        }}>
          {title}
        </h2>
      )}
      {children}
    </div>
  );
}
