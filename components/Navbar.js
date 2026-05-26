// components/Navbar.js
// ─────────────────────────────────────────────────────────────────
// Shared navbar used on every page.
// Automatically highlights the current page link.
// ─────────────────────────────────────────────────────────────────

import Link from "next/link";
import { useRouter } from "next/router";

const C = {
  navBg:       "#161B22",
  border:      "#30363D",
  primary:     "#4CC9E8",
  primaryDark: "#0D1117",
  muted:       "#8B949E",
  text:        "#E6EDF3",
};

export default function Navbar() {
  const router = useRouter();

  const isActive = (path) => router.pathname === path;

  const navLinkStyle = (path) => ({
    padding:        "6px 14px",
    borderRadius:   8,
    fontSize:       14,
    textDecoration: "none",
    color:          isActive(path) ? C.primary : C.muted,
    fontWeight:     isActive(path) ? 700 : 400,
    background:     isActive(path) ? "rgba(76,201,232,0.08)" : "transparent",
    transition:     "color 0.15s",
  });

  return (
    <nav style={{
      background:    C.navBg,
      borderBottom:  `1px solid ${C.border}`,
      padding:       "0 24px",
      display:       "flex",
      alignItems:    "center",
      justifyContent:"space-between",
      height:        60,
      position:      "sticky",
      top:           0,
      zIndex:        100,
    }}>
      <Link href="/" style={{ display: "flex", alignItems: "center", gap: 8, textDecoration: "none" }}>
        <span style={{ fontSize: 22 }}>📚</span>
        <span style={{ fontWeight: 800, fontSize: 20, color: C.primary, letterSpacing: "-0.5px" }}>
          KitabBazar
        </span>
      </Link>

      <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
        <Link href="/browse" style={navLinkStyle("/browse")}>Browse</Link>
        <Link href="/sell"   style={navLinkStyle("/sell")}>Sell a Book</Link>
        <Link href="/login"  style={{
          padding:        "8px 18px",
          background:     C.primary,
          color:          C.primaryDark,
          borderRadius:   20,
          fontSize:       14,
          fontWeight:     700,
          textDecoration: "none",
          marginLeft:     8,
          display:        "inline-block",
        }}>
          Sign In
        </Link>
      </div>
    </nav>
  );
}