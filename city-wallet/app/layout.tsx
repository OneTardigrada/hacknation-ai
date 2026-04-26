import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Mylo — Context-Aware City Intelligence",
  description: "Generative AI-powered contextual offers for the city · DSV-Gruppe",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="de">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="antialiased min-h-screen" style={{ background: "#F8F9FA", color: "#111827" }}>
        {children}
      </body>
    </html>
  );
}
