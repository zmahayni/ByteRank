import "./globals.css"; // Import global styles
import type { Metadata } from "next";

import Navbar from "../components/Navbar";
import ThemeProvider from "../components/ThemeProvider";
import { AuthProvider } from "../context/AuthContext";

export const metadata = {
  title: "ByteRank",
  description: "Team-based developer leaderboard",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body style={{
        minHeight: '100vh',
        fontFamily: '"Inter", sans-serif',
        WebkitFontSmoothing: 'antialiased',
        MozOsxFontSmoothing: 'grayscale',
        margin: 0,
        padding: 0,
        position: 'relative',
        fontSize: '0.95rem', // Slightly reduce base font size for zoomed out feel
      }}>
        <ThemeProvider>
          <AuthProvider>
            {/* Background div is now styled with CSS variables in globals.css */}
            <Navbar />
            <main style={{ 
              position: 'relative',
              width: '100%',
              minHeight: 'calc(100vh - 48px)', // Adjust for navbar height
              display: 'flex',
              flexDirection: 'column'
            }}>{children}</main>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
