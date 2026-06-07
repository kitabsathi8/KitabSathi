// pages/login.js — Simplified: Email/Password + Google
// ─────────────────────────────────────────────────────

import { useState, useEffect } from "react";
import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";
import { supabase } from "../lib/supabase";

const C = {
  bg:"#0D1117", navBg:"#161B22", cardBg:"#161B22",
  border:"#30363D", primary:"#4CC9E8", primaryDark:"#0D1117",
  text:"#E6EDF3", muted:"#8B949E", subtext:"#C9D1D9",
  error:"#F87171", success:"#4ADE80",
};

const mkInput = (err) => ({
  width:"100%", background:C.bg,
  border:`1.5px solid ${err ? C.error : C.border}`,
  color:C.text, borderRadius:8, padding:"12px 14px",
  fontSize:14, outline:"none", fontFamily:"system-ui, sans-serif",
});

export default function LoginPage() {
  const router = useRouter();
  const [mode,     setMode]     = useState("signin"); // "signin" | "signup"
  const [email,    setEmail]    = useState("");
  const [password, setPassword] = useState("");
  const [confirm,  setConfirm]  = useState("");
  const [loading,  setLoading]  = useState(false);
  const [error,    setError]    = useState("");
  const [checking, setChecking] = useState(true);

  // If already logged in → go home
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) router.push("/");
      else setChecking(false);
    });
  }, [router]);

  function clearForm() {
    setError("");
    setEmail(""); setPassword(""); setConfirm("");
  }

  function switchMode(m) { setMode(m); clearForm(); }

  // ── Email / Password auth ──────────────────────────
  async function handleEmailAuth() {
    setError(""); setSuccess("");

    if (!email.trim() || !password.trim()) {
      setError("Please enter your email and password."); return;
    }

    if (mode === "signup") {
      if (password.length < 6) { setError("Password must be at least 6 characters."); return; }
      if (password !== confirm) { setError("Passwords do not match."); return; }
    }

    setLoading(true);

    if (mode === "signin") {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) {
        setError(error.message === "Invalid login credentials"
          ? "Wrong email or password. Please try again."
          : error.message);
        setLoading(false);
      } else {
        router.push("/auth/callback");
      }
    } else {
      // Sign up
      const { error: signUpError } = await supabase.auth.signUp({ email, password });
      if (signUpError) {
        setError(signUpError.message);
        setLoading(false);
        return;
      }
      // Immediately sign in after signup — no confirmation needed
      const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });
      if (signInError) {
        setError(signInError.message);
        setLoading(false);
      } else {
        router.push("/auth/callback");
      }
    }
  }

  // ── Google OAuth ───────────────────────────────────
  async function handleGoogle() {
    setError("");
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${window.location.origin}/auth/callback` },
    });
    if (error) setError(error.message);
  }

  if (checking) {
    return (
      <div style={{ minHeight:"100vh", background:C.bg, display:"flex", alignItems:"center", justifyContent:"center" }}>
        <div style={{ fontSize:48 }}>📚</div>
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>{mode === "signin" ? "Sign In" : "Create Account"} — KitabSathi Nepal</title>
      </Head>

      <div style={{ minHeight:"100vh", background:C.bg, fontFamily:"system-ui, sans-serif" }}>
        <div style={{ maxWidth:400, margin:"0 auto", padding:"48px 20px 60px" }}>
          <div style={{ background:C.cardBg, border:`1px solid ${C.border}`, borderRadius:20, padding:"34px 30px" }}>

            {/* Logo */}
            <div style={{ textAlign:"center", marginBottom:24 }}>
              <div style={{ fontSize:42, marginBottom:8 }}>📚</div>
              <div style={{ fontWeight:800, fontSize:22, color:C.primary, letterSpacing:"-0.5px" }}>
                KitabSathi
              </div>
              <div style={{ fontSize:13, color:C.muted, marginTop:3 }}>
                Nepal's Used Book Marketplace
              </div>
            </div>

            {/* Mode toggle tabs */}
            <div style={{ display:"flex", background:C.bg, borderRadius:10, padding:4, marginBottom:22 }}>
              {[["signin","Sign In"],["signup","Create Account"]].map(([m, label]) => (
                <button
                  key={m}
                  onClick={() => switchMode(m)}
                  style={{
                    flex:1, padding:"8px", border:"none", borderRadius:7,
                    fontSize:13, fontWeight:600, cursor:"pointer",
                    background: mode === m ? C.navBg : "transparent",
                    color:      mode === m ? C.primary : C.muted,
                    transition: "all 0.15s",
                  }}
                >
                  {label}
                </button>
              ))}
            </div>

            {/* Error / Success banners */}
            {error && (
              <div style={{ background:"rgba(248,113,113,0.08)", border:`1px solid ${C.error}40`, borderRadius:8, padding:"10px 13px", fontSize:13, color:C.error, marginBottom:14 }}>
                {error}
              </div>
            )}


            {/* Email */}
            <div style={{ marginBottom:12 }}>
              <label style={{ fontSize:13, fontWeight:600, color:C.subtext, display:"block", marginBottom:6 }}>
                Email Address
              </label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="you@example.com"
                style={mkInput(false)}
                onKeyDown={e => e.key === "Enter" && handleEmailAuth()}
              />
            </div>

            {/* Password */}
            <div style={{ marginBottom: mode === "signup" ? 12 : 18 }}>
              <label style={{ fontSize:13, fontWeight:600, color:C.subtext, display:"block", marginBottom:6 }}>
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder={mode === "signup" ? "At least 6 characters" : "Your password"}
                style={mkInput(false)}
                onKeyDown={e => e.key === "Enter" && handleEmailAuth()}
              />
            </div>

            {/* Confirm password — signup only */}
            {mode === "signup" && (
              <div style={{ marginBottom:18 }}>
                <label style={{ fontSize:13, fontWeight:600, color:C.subtext, display:"block", marginBottom:6 }}>
                  Confirm Password
                </label>
                <input
                  type="password"
                  value={confirm}
                  onChange={e => setConfirm(e.target.value)}
                  placeholder="Re-enter your password"
                  style={mkInput(false)}
                  onKeyDown={e => e.key === "Enter" && handleEmailAuth()}
                />
              </div>
            )}

            {/* Submit button */}
            <button
              onClick={handleEmailAuth}
              disabled={loading}
              style={{ width:"100%", padding:"12px", background:C.primary, color:C.primaryDark, border:"none", borderRadius:10, fontSize:14, fontWeight:700, cursor:loading?"not-allowed":"pointer", opacity:loading?0.7:1, marginBottom:16 }}
            >
              {loading
                ? (mode === "signin" ? "Signing in..." : "Creating account...")
                : (mode === "signin" ? "Sign In" : "Create Account")
              }
            </button>

            {/* Divider */}
            <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:14 }}>
              <div style={{ flex:1, height:1, background:C.border }} />
              <div style={{ fontSize:12, color:C.muted }}>or</div>
              <div style={{ flex:1, height:1, background:C.border }} />
            </div>

            {/* Google */}
            <button
              onClick={handleGoogle}
              style={{ width:"100%", display:"flex", alignItems:"center", justifyContent:"center", gap:10, background:"#fff", color:"#333", border:"none", borderRadius:10, padding:"12px 20px", fontSize:14, fontWeight:600, cursor:"pointer", marginBottom:18 }}
            >
              <span style={{ fontSize:18, fontWeight:800, color:"#4285F4", fontFamily:"serif" }}>G</span>
              Continue with Google
            </button>

            {/* Browse without login */}
            <div style={{ textAlign:"center", paddingTop:14, borderTop:`1px solid ${C.border}` }}>
              <div style={{ fontSize:12, color:C.muted, marginBottom:8 }}>
                Just browsing? No account needed.
              </div>
              <Link href="/browse" style={{ fontSize:13, fontWeight:600, color:C.primary, textDecoration:"none" }}>
                Browse Books Without Signing In →
              </Link>
            </div>

            <div style={{ fontSize:11, color:C.muted, textAlign:"center", marginTop:14, lineHeight:1.6 }}>
              By signing in, you agree to our Terms of Service.
            </div>
          </div>
        </div>
      </div>
    </>
  );
}