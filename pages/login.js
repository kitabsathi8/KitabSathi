// pages/login.js  —  Sign In Page (Google + WhatsApp OTP)
// ─────────────────────────────────────────────────────────────────
// 4 steps: Main → WhatsApp Number → OTP → Success
// Real Google OAuth + WhatsApp OTP will be wired in when we
// connect Firebase Auth / Supabase in the next phase.
// ─────────────────────────────────────────────────────────────────

import { useState, useRef, useEffect } from "react";
import Head from "next/head";
import Link from "next/link";
import Navbar from "../components/Navbar";

// ─── Midnight Theme ───────────────────────────────────────────────
const C = {
  bg:          "#0D1117",
  navBg:       "#161B22",
  cardBg:      "#161B22",
  border:      "#30363D",
  primary:     "#4CC9E8",
  primaryDark: "#0D1117",
  text:        "#E6EDF3",
  muted:       "#8B949E",
  subtext:     "#C9D1D9",
  error:       "#F87171",
  success:     "#4ADE80",
};

// ─── Reusable Styles ─────────────────────────────────────────────
const mkInput = (err) => ({
  width:"100%", background:C.bg,
  border:`1.5px solid ${err ? C.error : C.border}`,
  color:C.text, borderRadius:8, padding:"12px 14px",
  fontSize:15, outline:"none", fontFamily:"system-ui, sans-serif",
});

// ─── Main Page ────────────────────────────────────────────────────
export default function LoginPage() {
  // step: 0=main  1=whatsapp  2=otp  3=success
  const [step,         setStep]         = useState(0);
  const [phone,        setPhone]        = useState("");
  const [otp,          setOtp]          = useState(["","","","","",""]);
  const [staySignedIn, setStaySignedIn] = useState(true);
  const [phoneError,   setPhoneError]   = useState("");
  const [otpError,     setOtpError]     = useState("");
  const [loading,      setLoading]      = useState(false);
  const otpRefs = useRef([]);

  // Auto-focus first OTP box when entering step 2
  useEffect(() => {
    if (step === 2) {
      setTimeout(() => otpRefs.current[0]?.focus(), 100);
    }
  }, [step]);

  // ── Handlers ─────────────────────────────────────────────────
  function handleGoogleSignIn() {
    // Simulated — will be replaced with real Google OAuth
    setLoading(true);
    setTimeout(() => { setLoading(false); setStep(1); }, 1200);
  }

  function handleSendOTP() {
    const cleaned = phone.replace(/\s/g, "");
    if (!cleaned)          { setPhoneError("Please enter your WhatsApp number"); return; }
    if (cleaned.length !== 10) { setPhoneError("Enter a valid 10-digit Nepal number"); return; }
    if (!cleaned.startsWith("9")) { setPhoneError("Nepal numbers start with 9 (e.g. 98XXXXXXXX)"); return; }
    setLoading(true);
    // Simulated OTP send — will call Firebase / Twilio here
    setTimeout(() => { setLoading(false); setStep(2); }, 1500);
  }

  function handleOtpInput(index, value) {
    if (!/^\d*$/.test(value)) return;       // digits only
    const next = [...otp];
    next[index] = value.slice(-1);          // keep last digit
    setOtp(next);
    setOtpError("");
    if (value && index < 5) otpRefs.current[index + 1]?.focus();
  }

  function handleOtpKeyDown(index, e) {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      otpRefs.current[index - 1]?.focus();
    }
  }

  function handleOtpPaste(e) {
    const digits = e.clipboardData.getData("text").replace(/\D/g,"").slice(0,6);
    if (!digits) return;
    const next = [...otp];
    digits.split("").forEach((d,i) => { next[i] = d; });
    setOtp(next);
    otpRefs.current[Math.min(digits.length, 5)]?.focus();
    e.preventDefault();
  }

  function handleVerifyOTP() {
    const code = otp.join("");
    if (code.length < 6) { setOtpError("Please enter all 6 digits"); return; }
    setLoading(true);
    // Simulated verification — will call Firebase here
    setTimeout(() => { setLoading(false); setStep(3); }, 1500);
  }

  function resendOTP() {
    setOtp(["","","","","",""]);
    setOtpError("");
    otpRefs.current[0]?.focus();
    // Would re-trigger OTP send in real implementation
  }

  // ── Render ────────────────────────────────────────────────────
  return (
    <>
      <Head>
        <title>Sign In — KitabBazar Nepal</title>
        <meta name="description" content="Sign in to KitabBazar to buy and sell used books across Nepal." />
      </Head>

      <div style={{ minHeight:"100vh", background:C.bg, fontFamily:"system-ui, sans-serif" }}>
        <Navbar />

        <div style={{ maxWidth:420, margin:"0 auto", padding:"44px 20px 60px" }}>
          <div style={{
            background:C.cardBg, border:`1px solid ${C.border}`,
            borderRadius:20, padding:"36px 32px",
          }}>

            {/* Logo (always visible) */}
            <div style={{ textAlign:"center", marginBottom:24 }}>
              <div style={{ fontSize:44, marginBottom:8 }}>📚</div>
              <div style={{ fontWeight:800, fontSize:22, color:C.primary, letterSpacing:"-0.5px" }}>KitabBazar</div>
              <div style={{ fontSize:13, color:C.muted, marginTop:4 }}>Nepal's Used Book Marketplace</div>
            </div>

            {/* ── STEP 0: Main ──────────────────────────────────── */}
            {step === 0 && (
              <div>
                <div style={{ textAlign:"center", marginBottom:24 }}>
                  <div style={{ fontSize:16, fontWeight:700, color:C.text, marginBottom:6 }}>
                    Sign in to your account
                  </div>
                  <div style={{ fontSize:13, color:C.muted, lineHeight:1.6 }}>
                    You only need to sign in to buy or sell books.<br/>Browsing is always free.
                  </div>
                </div>

                {/* Google button */}
                <button onClick={handleGoogleSignIn} disabled={loading} style={{
                  width:"100%", display:"flex", alignItems:"center", justifyContent:"center", gap:12,
                  background:"#fff", color:"#333",
                  border:"none", borderRadius:12, padding:"13px 20px",
                  fontSize:15, fontWeight:600, cursor: loading ? "not-allowed" : "pointer",
                  marginBottom:14, opacity: loading ? 0.7 : 1,
                }}>
                  <span style={{ fontSize:20, fontWeight:800, color:"#4285F4", fontFamily:"serif" }}>G</span>
                  {loading ? "Connecting..." : "Continue with Google"}
                </button>

                {/* Stay signed in */}
                <label style={{ display:"flex", alignItems:"center", justifyContent:"center", gap:8, cursor:"pointer", marginBottom:22 }}>
                  <input type="checkbox" checked={staySignedIn} onChange={e => setStaySignedIn(e.target.checked)}
                    style={{ width:15, height:15, accentColor:C.primary, cursor:"pointer" }} />
                  <span style={{ fontSize:13, color:C.muted }}>Stay signed in on this device</span>
                </label>

                <div style={{ borderTop:`1px solid ${C.border}`, margin:"0 0 20px" }} />

                {/* Browse without login */}
                <div style={{ background:"rgba(76,201,232,0.05)", border:`1px solid ${C.primary}25`, borderRadius:12, padding:"14px 16px", marginBottom:22 }}>
                  <div style={{ fontSize:13, color:C.text, fontWeight:600, marginBottom:4 }}>👀 Just browsing?</div>
                  <div style={{ fontSize:12, color:C.muted, lineHeight:1.6, marginBottom:10 }}>
                    You can explore all books without signing in. Sign in only when you're ready to buy or sell.
                  </div>
                  <Link href="/browse" style={{
                    display:"block", textAlign:"center", padding:"9px",
                    background:C.bg, border:`1px solid ${C.border}`, borderRadius:8,
                    fontSize:13, fontWeight:600, color:C.primary, textDecoration:"none",
                  }}>
                    Browse Books Without Signing In →
                  </Link>
                </div>

                {/* What needs sign in */}
                <div>
                  <div style={{ fontSize:11, fontWeight:700, color:C.muted, textTransform:"uppercase", letterSpacing:0.5, marginBottom:10, textAlign:"center" }}>
                    What requires sign in?
                  </div>
                  {[
                    ["✅","Listing a book for sale"],
                    ["✅","Contacting a seller directly"],
                    ["✅","Saving books to wishlist"],
                    ["🚫","Browsing all listings — free!"],
                  ].map(([icon,text]) => (
                    <div key={text} style={{ display:"flex", alignItems:"center", gap:8, fontSize:13, color:C.muted, padding:"4px 0" }}>
                      <span>{icon}</span>{text}
                    </div>
                  ))}
                </div>

                <div style={{ fontSize:11, color:C.muted, textAlign:"center", marginTop:20, lineHeight:1.6 }}>
                  By signing in, you agree to our Terms of Service and Privacy Policy.
                </div>
              </div>
            )}

            {/* ── STEP 1: WhatsApp Number ───────────────────────── */}
            {step === 1 && (
              <div>
                <div style={{ textAlign:"center", marginBottom:22 }}>
                  <div style={{ width:54, height:54, background:"#25D366", borderRadius:"50%", margin:"0 auto 12px", display:"flex", alignItems:"center", justifyContent:"center", fontSize:26 }}>
                    💬
                  </div>
                  <div style={{ fontSize:16, fontWeight:700, color:C.text, marginBottom:6 }}>Verify your WhatsApp</div>
                  <div style={{ fontSize:13, color:C.muted, lineHeight:1.6 }}>
                    Google connected! Now verify your WhatsApp so buyers can reach you.
                  </div>
                </div>

                {/* Google success banner */}
                <div style={{ background:"rgba(74,222,128,0.08)", border:`1px solid ${C.success}30`, borderRadius:8, padding:"10px 14px", fontSize:13, color:C.success, textAlign:"center", marginBottom:20 }}>
                  ✅ Google account connected
                </div>

                {/* Phone input */}
                <div style={{ marginBottom:16 }}>
                  <label style={{ fontSize:13, fontWeight:600, color:C.subtext, display:"block", marginBottom:8 }}>
                    WhatsApp Number
                  </label>
                  <div style={{ display:"flex", gap:8 }}>
                    <div style={{
                      background:C.bg, border:`1.5px solid ${C.border}`,
                      borderRadius:8, padding:"12px 14px",
                      fontSize:14, color:C.subtext,
                      display:"flex", alignItems:"center", gap:5,
                      whiteSpace:"nowrap", flexShrink:0,
                    }}>
                      🇳🇵 +977
                    </div>
                    <input
                      type="tel"
                      value={phone}
                      onChange={e => { setPhone(e.target.value.replace(/\D/g,"").slice(0,10)); setPhoneError(""); }}
                      placeholder="98XXXXXXXX"
                      style={{ ...mkInput(phoneError), flex:1 }}
                      maxLength={10}
                      onKeyDown={e => e.key === "Enter" && handleSendOTP()}
                    />
                  </div>
                  {phoneError && <div style={{ fontSize:12, color:C.error, marginTop:6 }}>{phoneError}</div>}
                  <div style={{ fontSize:11, color:C.muted, marginTop:6 }}>
                    A 6-digit OTP will be sent to this number on WhatsApp
                  </div>
                </div>

                {/* Send OTP button */}
                <button onClick={handleSendOTP} disabled={loading} style={{
                  width:"100%", padding:"13px", marginBottom:10,
                  background:"#25D366", color:"#fff",
                  border:"none", borderRadius:10,
                  fontSize:14, fontWeight:700, cursor: loading ? "not-allowed" : "pointer",
                  opacity: loading ? 0.7 : 1,
                  display:"flex", alignItems:"center", justifyContent:"center", gap:8,
                }}>
                  {loading ? "Sending OTP..." : "📲 Send OTP via WhatsApp"}
                </button>

                <button onClick={() => { setStep(0); setLoading(false); }} style={{
                  width:"100%", padding:"11px",
                  background:"none", color:C.muted,
                  border:`1px solid ${C.border}`, borderRadius:10,
                  fontSize:13, cursor:"pointer",
                }}>
                  ← Use a different Google account
                </button>
              </div>
            )}

            {/* ── STEP 2: OTP Input ─────────────────────────────── */}
            {step === 2 && (
              <div>
                <div style={{ textAlign:"center", marginBottom:22 }}>
                  <div style={{ fontSize:40, marginBottom:10 }}>📲</div>
                  <div style={{ fontSize:16, fontWeight:700, color:C.text, marginBottom:6 }}>Enter your OTP</div>
                  <div style={{ fontSize:13, color:C.muted, lineHeight:1.6 }}>
                    We sent a 6-digit code to WhatsApp<br />
                    <span style={{ color:C.primary, fontWeight:700 }}>+977 {phone}</span>
                  </div>
                </div>

                {/* 6 individual OTP boxes */}
                <div style={{ display:"flex", gap:8, justifyContent:"center", marginBottom:8 }} onPaste={handleOtpPaste}>
                  {otp.map((digit, i) => (
                    <input
                      key={i}
                      ref={el => otpRefs.current[i] = el}
                      type="text"
                      inputMode="numeric"
                      maxLength={1}
                      value={digit}
                      onChange={e => handleOtpInput(i, e.target.value)}
                      onKeyDown={e => handleOtpKeyDown(i, e)}
                      style={{
                        width:46, height:56,
                        textAlign:"center",
                        fontSize:24, fontWeight:700,
                        background:C.bg,
                        border:`2px solid ${digit ? C.primary : otpError ? C.error : C.border}`,
                        borderRadius:10,
                        color:C.text, outline:"none",
                        transition:"border-color 0.15s",
                      }}
                    />
                  ))}
                </div>

                {otpError && (
                  <div style={{ fontSize:12, color:C.error, textAlign:"center", marginBottom:6 }}>{otpError}</div>
                )}

                <div style={{ textAlign:"center", marginBottom:20, marginTop:8 }}>
                  <span style={{ fontSize:12, color:C.muted }}>Didn't receive it? </span>
                  <button onClick={resendOTP} style={{ fontSize:12, color:C.primary, background:"none", border:"none", cursor:"pointer", fontWeight:700 }}>
                    Resend OTP
                  </button>
                </div>

                {/* Verify button — disabled until all 6 digits filled */}
                <button
                  onClick={handleVerifyOTP}
                  disabled={loading || otp.join("").length < 6}
                  style={{
                    width:"100%", padding:"13px", marginBottom:10,
                    background:C.primary, color:C.primaryDark,
                    border:"none", borderRadius:10,
                    fontSize:14, fontWeight:700,
                    cursor: loading || otp.join("").length < 6 ? "not-allowed" : "pointer",
                    opacity: otp.join("").length < 6 ? 0.4 : 1,
                    transition:"opacity 0.15s",
                  }}
                >
                  {loading ? "Verifying..." : "✅ Verify & Enter KitabBazar"}
                </button>

                <button onClick={() => { setStep(1); setOtp(["","","","","",""]); setOtpError(""); }} style={{
                  width:"100%", padding:"11px",
                  background:"none", color:C.muted,
                  border:`1px solid ${C.border}`, borderRadius:10,
                  fontSize:13, cursor:"pointer",
                }}>
                  ← Change phone number
                </button>
              </div>
            )}

            {/* ── STEP 3: Success ───────────────────────────────── */}
            {step === 3 && (
              <div style={{ textAlign:"center" }}>
                <div style={{ fontSize:60, marginBottom:16 }}>🎉</div>
                <div style={{ fontSize:21, fontWeight:800, color:C.text, marginBottom:8 }}>You're in!</div>
                <div style={{ fontSize:14, color:C.muted, lineHeight:1.7, marginBottom:28 }}>
                  Welcome to KitabBazar. Your account is verified and ready to use across Nepal.
                </div>

                {/* Account summary */}
                <div style={{ background:"rgba(74,222,128,0.06)", border:`1px solid ${C.success}30`, borderRadius:10, padding:"12px 16px", marginBottom:24 }}>
                  <div style={{ fontSize:12, color:C.success, fontWeight:700, marginBottom:6 }}>✅ Account Verified</div>
                  <div style={{ fontSize:11, color:C.muted, lineHeight:1.7 }}>
                    📱 +977 {phone}<br />
                    🔒 Google account linked<br />
                    💾 {staySignedIn ? "Staying signed in" : "This session only"}
                  </div>
                </div>

                {/* CTA buttons */}
                <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
                  <Link href="/sell" style={{
                    display:"block", padding:"13px",
                    background:C.primary, color:C.primaryDark,
                    borderRadius:10, fontSize:14, fontWeight:700,
                    textDecoration:"none", textAlign:"center",
                  }}>
                    🚀 List Your First Book — Free
                  </Link>
                  <Link href="/browse" style={{
                    display:"block", padding:"13px",
                    background:C.navBg, color:C.primary,
                    border:`1px solid ${C.primary}`, borderRadius:10,
                    fontSize:14, fontWeight:700,
                    textDecoration:"none", textAlign:"center",
                  }}>
                    Browse Books
                  </Link>
                </div>
              </div>
            )}

          </div>

          {/* Progress dots below card */}
          {step < 3 && (
            <div style={{ display:"flex", justifyContent:"center", gap:8, marginTop:20 }}>
              {[0,1,2].map(i => (
                <div key={i} style={{
                  width: i === step ? 20 : 8, height:8,
                  borderRadius:4,
                  background: i === step ? C.primary : C.border,
                  transition:"all 0.3s",
                }} />
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
}