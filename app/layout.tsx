import type { Metadata } from "next";
import "./globals.css";
import { LoadingScreenRemover } from "@/components/LoadingScreenRemover";

export const metadata: Metadata = {
  title: "Alina & Gabriel – Nuntă 26 Iulie 2026",
  description: "Vă invităm să celebrați împreună cu noi ziua nunții noastre.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ro">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        {/* eslint-disable-next-line @next/next/no-page-custom-font */}
        <link
          href="https://fonts.googleapis.com/css2?family=Great+Vibes&family=Playfair+Display:ital,wght@0,400..900;1,400..900&family=Lato:wght@300;400;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="antialiased" suppressHydrationWarning>
        {/* Loading Splash Screen */}
        <div
          id="loading-screen"
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 9999,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            background: "#F5F0EA",
            transition: "opacity 0.8s ease, visibility 0.8s ease",
          }}
        >
          {/* Bride & Groom SVG */}
          <svg
            width="180"
            height="220"
            viewBox="0 0 180 220"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            style={{ marginBottom: 24, opacity: 0.92 }}
          >
            {/* Groom - left */}
            {/* Head */}
            <circle cx="62" cy="52" r="16" fill="#E5DFD6" />
            {/* Hair */}
            <path d="M46 48c0-12 8-20 16-20s16 8 16 20" fill="#4A4540" />
            {/* Body / Suit */}
            <path d="M44 80 c0-8 8-16 18-16 s18 8 18 16 l4 60 c0 4-2 6-6 6 H46 c-4 0-6-2-6-6Z" fill="#4A4540" />
            {/* Shirt / Tie */}
            <path d="M56 64 l6 0 l-3 24Z" fill="#9B8557" />
            <rect x="55" y="64" width="14" height="6" rx="1" fill="#E5DFD6" opacity="0.7" />
            {/* Suit lapels */}
            <path d="M48 72 L62 66 L62 80Z" fill="#3D3530" opacity="0.5" />
            <path d="M76 72 L62 66 L62 80Z" fill="#3D3530" opacity="0.5" />
            {/* Boutonniere */}
            <circle cx="52" cy="78" r="2.5" fill="#9B8557" opacity="0.8" />
            {/* Arms */}
            <path d="M44 82 l-6 30 c-1 3 1 5 3 4 l8-20" fill="#4A4540" />
            <path d="M80 82 l4 18" stroke="#4A4540" strokeWidth="8" strokeLinecap="round" />
            {/* Legs */}
            <rect x="50" y="140" width="10" height="40" rx="4" fill="#4A4540" />
            <rect x="64" y="140" width="10" height="40" rx="4" fill="#4A4540" />
            {/* Shoes */}
            <ellipse cx="55" cy="182" rx="8" ry="4" fill="#3D3530" />
            <ellipse cx="69" cy="182" rx="8" ry="4" fill="#3D3530" />

            {/* Bride - right */}
            {/* Head */}
            <circle cx="118" cy="48" r="16" fill="#E5DFD6" />
            {/* Hair */}
            <path d="M102 44 c0-14 8-22 16-22 s16 8 16 22 c0 2-1 4-2 6 l-28 0 c-1-2-2-4-2-6Z" fill="#4A4540" />
            {/* Veil */}
            <path d="M102 38 c-4 4 -8 20 -6 50 c1 12 4 28 6 40" stroke="#E5DFD6" strokeWidth="0.8" fill="none" opacity="0.3" />
            <path d="M134 38 c4 4 8 20 6 50 c-1 12-4 28-6 40" stroke="#E5DFD6" strokeWidth="0.8" fill="none" opacity="0.3" />
            <path d="M100 38 Q118 28 136 38 Q140 60 136 90 Q118 100 100 90 Q96 60 100 38Z" fill="#E5DFD6" opacity="0.08" />
            {/* Tiara */}
            <path d="M108 32 l2-5 l2 3 l2-6 l2 4 l2-6 l2 4 l2-4 l2 5 l2-3 l2 5" stroke="#9B8557" strokeWidth="1.5" fill="none" />
            <circle cx="118" cy="27" r="1.5" fill="#B8A67A" />
            {/* Dress body - elegant A-line */}
            <path d="M104 68 c0-6 6-10 14-10 s14 4 14 10 l8 80 c1 6-2 8-8 8 l-28 0 c-6 0-9-2-8-8Z" fill="#E5DFD6" opacity="0.95" />
            {/* Dress details - sweetheart neckline */}
            <path d="M108 60 Q118 70 128 60" stroke="#9B8557" strokeWidth="0.8" fill="none" opacity="0.5" />
            {/* Waist sash */}
            <path d="M106 86 Q118 90 130 86" stroke="#9B8557" strokeWidth="2.5" fill="none" opacity="0.7" />
            {/* Sash bow */}
            <ellipse cx="118" cy="88" rx="5" ry="3" fill="#9B8557" opacity="0.5" />
            {/* Dress lace pattern */}
            <path d="M102 120 Q110 116 118 120 Q126 116 134 120" stroke="#9B8557" strokeWidth="0.5" fill="none" opacity="0.25" />
            <path d="M100 135 Q110 131 118 135 Q126 131 136 135" stroke="#9B8557" strokeWidth="0.5" fill="none" opacity="0.2" />
            {/* Arms */}
            <path d="M104 72 l-6 22 c-1 2 1 3 2 2 l6-14" fill="#E5DFD6" opacity="0.9" />
            <path d="M132 72 l-2 16" stroke="#E5DFD6" strokeWidth="6" strokeLinecap="round" opacity="0.9" />
            {/* Bouquet */}
            <g transform="translate(84, 90)">
              <ellipse cx="0" cy="0" rx="7" ry="6" fill="#9B8557" opacity="0.6" />
              <circle cx="-3" cy="-2" r="3" fill="#B8A67A" opacity="0.7" />
              <circle cx="3" cy="-2" r="3" fill="#B8A67A" opacity="0.5" />
              <circle cx="0" cy="2" r="2.5" fill="#9B8557" opacity="0.7" />
              <circle cx="-1" cy="-1" r="2" fill="#B8A67A" opacity="0.5" />
              <line x1="0" y1="6" x2="-1" y2="14" stroke="#4A7A3D" strokeWidth="1.5" opacity="0.5" />
              <line x1="0" y1="6" x2="2" y2="13" stroke="#4A7A3D" strokeWidth="1" opacity="0.4" />
            </g>
            {/* Shoes (peek under dress) */}
            <ellipse cx="114" cy="158" rx="5" ry="3" fill="#9B8557" opacity="0.4" />
            <ellipse cx="124" cy="158" rx="5" ry="3" fill="#9B8557" opacity="0.4" />

            {/* Holding hands connection */}
            <path d="M84 100 Q90 96 96 100" stroke="#E5DFD6" strokeWidth="2" fill="none" opacity="0.6" />

            {/* Hearts floating */}
            <g opacity="0.5">
              <path d="M88 20 c-2-4-8-4-8 1 c0 4 8 8 8 8 s8-4 8-8 c0-5-6-5-8-1Z" fill="#9B8557" opacity="0.3">
                <animateTransform attributeName="transform" type="translate" values="0,0;0,-6;0,0" dur="3s" repeatCount="indefinite" />
              </path>
              <path d="M140 12 c-1.5-3-6-3-6 0.8 c0 3 6 6 6 6 s6-3 6-6 c0-3.8-4.5-3.8-6-0.8Z" fill="#9B8557" opacity="0.25">
                <animateTransform attributeName="transform" type="translate" values="0,0;0,-5;0,0" dur="3.5s" repeatCount="indefinite" />
              </path>
            </g>
          </svg>

          {/* Text */}
          <p
            style={{
              fontFamily: "'Playfair Display', serif",
              fontSize: "1.8rem",
              color: "#9B8557",
              letterSpacing: "0.15em",
              marginBottom: 8,
            }}
          >
            Alina &amp; Gabriel
          </p>
          <p
            style={{
              fontFamily: "'Lato', sans-serif",
              color: "#9B8557",
              fontSize: "0.7rem",
              letterSpacing: "0.3em",
              textTransform: "uppercase",
              opacity: 0.6,
              marginBottom: 24,
            }}
          >
            26 Iulie 2026
          </p>

          {/* Loading dots */}
          <div style={{ display: "flex", gap: 8 }}>
            {[0, 1, 2].map((i) => (
              <span
                key={i}
                style={{
                  width: 6,
                  height: 6,
                  borderRadius: "50%",
                  backgroundColor: "#9B8557",
                  opacity: 0.5,
                  animation: `loadingDot 1.2s ease-in-out ${i * 0.2}s infinite`,
                }}
              />
            ))}
          </div>

          <style>{`
            @keyframes loadingDot {
              0%, 80%, 100% { transform: scale(0.6); opacity: 0.3; }
              40% { transform: scale(1.2); opacity: 0.9; }
            }
          `}</style>
        </div>

        <LoadingScreenRemover />

        {children}
      </body>
    </html>
  );
}
