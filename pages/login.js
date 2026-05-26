// pages/login.js  —  Real Google Sign In via Supabase Auth
// ─────────────────────────────────────────────────────────────────

import { useState, useEffect } from "react";
import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";
import { supabase } from "../lib/supabase";

const C = {
  bg: "#0D1117", navBg: "#161B22", cardBg: "#161B22",
  border: "#30363D", primary: "#4CC9E8", primaryDark: "#0D1117",
  text: "#E6EDF3", muted: "#8B949E", subtext: "#C9D1D9",
  error: "#F87171", success: "#4ADE80",
};

export default function LoginPage() {
  const router  = useRouter();
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState("");
  const [checking,setChecking]= useState(true);

  // If user is already logged in, redirect to home
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) router.push("/");
      else setChecking(false);
    });
  }, [router]);

  async function handleGoogleSignIn() {
    setLoading(true);
    setError("");

    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });

    if (error) {
      setError(error.message);
      setLoading(false);
    }
    // On success: browser auto-redirects to Google — nothing more needed here
  }

  // Show loading spinner while checking existing session
  if (checking) {
    return (
      <div style={{ minHeight: "100vh", background: C.bg, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "system-ui" }}>
        <div style={{ fontSize: 48 }}>📚</div>
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>Sign In — KitabBazar Nepal</title>
        <meta name="description" content="Sign in to KitabBazar to buy and sell used books across Nepal." />
      </Head>

      <div style={{ minHeight: "100vh", background: C.bg, fontFamily: "system-ui, sans-serif" }}>
        <div style={{ maxWidth: 420, margin: "0 auto", padding: "52px 20px 60px" }}>
          <div style={{
            background: C.cardBg, border: `1px solid ${C.border}`,
            borderRadius: 20, padding: "36px 32px",
          }}>
            {/* Logo */}
            <div style={{ textAlign: "center", marginBottom: 26 }}>
              <div style={{ fontSize: 44, marginBottom: 8 }}>📚</div>
              <div style={{ fontWeight: 800, fontSize: 22, color: C.primary, letterSpacing: "-0.5px" }}>
                KitabBazar
              </div>
              <div style={{ fontSize: 13, color: C.muted, marginTop: 4 }}>
                Nepal's Used Book Marketplace
              </div>
            </div>

            <div style={{ textAlign: "center", marginBottom: 24 }}>
              <div style={{ fontSize: 15, fontWeight: 700, color: C.text, marginBottom: 6 }}>
                Sign in to your account
              </div>
              <div style={{ fontSize: 13, color: C.muted, lineHeight: 1.6 }}>
                Sign in to buy or sell books.<br />Browsing is always free.
              </div>
            </div>

            {/* Error message */}
            {error && (
              <div style={{
                background: "rgba(248,113,113,0.08)",
                border: `1px solid ${C.error}40`,
                borderRadius: 8, padding: "10px 14px",
                fontSize: 13, color: C.error, marginBottom: 16,
              }}>
                {error}
              </div>
            )}

            {/* Google Sign In button */}
            <button
              onClick={handleGoogleSignIn}
              disabled={loading}
              style={{
                width: "100%",
                display: "flex", alignItems: "center", justifyContent: "center", gap: 12,
                background: "#fff", color: "#333",
                border: "none", borderRadius: 12, padding: "13px 20px",
                fontSize: 15, fontWeight: 600,
                cursor: loading ? "not-allowed" : "pointer",
                marginBottom: 16, opacity: loading ? 0.7 : 1,
              }}
            >
              <span style={{ fontSize: 20, fontWeight: 800, color: "#4285F4", fontFamily: "serif" }}>
                G
              </span>
              {loading ? "Redirecting to Google..." : "Continue with Google"}
            </button>

            <div style={{ borderTop: `1px solid ${C.border}`, margin: "0 0 20px" }} />

            {/* Browse without login */}
            <div style={{
              background: "rgba(76,201,232,0.05)",
              border: `1px solid ${C.primary}25`,
              borderRadius: 12, padding: "14px 16px", marginBottom: 22,
            }}>
              <div style={{ fontSize: 13, color: C.text, fontWeight: 600, marginBottom: 4 }}>
                👀 Just browsing?
              </div>
              <div style={{ fontSize: 12, color: C.muted, lineHeight: 1.6, marginBottom: 10 }}>
                You can explore all books without signing in.
              </div>
              <Link href="/browse" style={{
                display: "block", textAlign: "center", padding: "9px",
                background: C.bg, border: `1px solid ${C.border}`,
                borderRadius: 8, fontSize: 13, fontWeight: 600,
                color: C.primary, textDecoration: "none",
              }}>
                Browse Books Without Signing In →
              </Link>
            </div>

            {/* What needs sign in */}
            <div>
              <div style={{ fontSize: 11, fontWeight: 700, color: C.muted, textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 10, textAlign: "center" }}>
                What requires sign in?
              </div>
              {[
                ["✅", "Listing a book for sale"],
                ["✅", "Contacting sellers directly"],
                ["✅", "Saving books to wishlist"],
                ["🚫", "Browsing all listings — free!"],
              ].map(([icon, text]) => (
                <div key={text} style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, color: C.muted, padding: "4px 0" }}>
                  <span>{icon}</span>{text}
                </div>
              ))}
            </div>

            <div style={{ fontSize: 11, color: C.muted, textAlign: "center", marginTop: 20, lineHeight: 1.6 }}>
              By signing in, you agree to our Terms of Service and Privacy Policy.
            </div>
          </div>
        </div>
      </div>
    </>
  );
}