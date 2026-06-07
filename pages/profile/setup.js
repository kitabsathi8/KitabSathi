// pages/profile/setup.js — Simplified: Name + optional WhatsApp
// ─────────────────────────────────────────────────────────────────

import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import Head from "next/head";
import { supabase } from "../../lib/supabase";

const C = {
  bg:"#0D1117", navBg:"#161B22", border:"#30363D",
  primary:"#4CC9E8", primaryDark:"#0D1117",
  text:"#E6EDF3", muted:"#8B949E", subtext:"#C9D1D9",
  error:"#F87171", success:"#4ADE80",
};

const mkInput = (err) => ({
  width:"100%", background:C.bg,
  border:`1.5px solid ${err ? C.error : C.border}`,
  color:C.text, borderRadius:8, padding:"12px 14px",
  fontSize:14, outline:"none", fontFamily:"system-ui, sans-serif",
});

export default function ProfileSetup() {
  const router = useRouter();
  const [user,    setUser]    = useState(null);
  const [name,    setName]    = useState("");
  const [phone,   setPhone]   = useState("");
  const [saving,  setSaving]  = useState(false);
  const [nameErr, setNameErr] = useState(false);
  const [saveErr, setSaveErr] = useState("");

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) { router.push("/login"); return; }
      setUser(user);
      // Pre-fill name from Google profile if available
      setName(user.user_metadata?.full_name || "");
    });
  }, [router]);

  async function handleSave() {
    if (!name.trim()) { setNameErr(true); return; }
    setSaving(true); setSaveErr("");

    const { error } = await supabase.from("profiles").upsert({
      id:        user.id,
      full_name: name.trim(),
      whatsapp:  phone.trim() || null,
    });

    if (error) { setSaveErr(error.message); setSaving(false); }
    else router.push("/");
  }

  return (
    <>
      <Head><title>Complete Your Profile — KitabSathi</title></Head>

      <div style={{ minHeight:"100vh", background:C.bg, fontFamily:"system-ui, sans-serif" }}>
        <div style={{ maxWidth:400, margin:"0 auto", padding:"52px 20px" }}>
          <div style={{ background:C.navBg, border:`1px solid ${C.border}`, borderRadius:20, padding:"34px 30px" }}>

            {/* Header */}
            <div style={{ textAlign:"center", marginBottom:24 }}>
              <div style={{ fontSize:42, marginBottom:8 }}>👋</div>
              <div style={{ fontSize:20, fontWeight:800, color:C.text, marginBottom:5 }}>
                Welcome to KitabSathi!
              </div>
              <div style={{ fontSize:13, color:C.muted, lineHeight:1.6 }}>
                Just tell us your name to get started.<br/>
                WhatsApp is optional but helps buyers reach you.
              </div>
            </div>

            {/* Account badge */}
            <div style={{ background:"rgba(74,222,128,0.07)", border:`1px solid ${C.success}30`, borderRadius:8, padding:"9px 13px", fontSize:13, color:C.success, textAlign:"center", marginBottom:20 }}>
              ✅ Account connected
              {user && <div style={{ fontSize:11, color:C.muted, marginTop:2 }}>{user.email}</div>}
            </div>

            {/* Name */}
            <div style={{ marginBottom:14 }}>
              <label style={{ fontSize:13, fontWeight:600, color:C.subtext, display:"block", marginBottom:6 }}>
                Your Name <span style={{ color:C.error }}>*</span>
              </label>
              <input
                value={name}
                onChange={e => { setName(e.target.value); setNameErr(false); }}
                placeholder="e.g. Aarav Sharma"
                style={mkInput(nameErr)}
                onKeyDown={e => e.key === "Enter" && handleSave()}
              />
              {nameErr && <div style={{ fontSize:12, color:C.error, marginTop:4 }}>Name is required</div>}
            </div>

            {/* WhatsApp — optional */}
            <div style={{ marginBottom:22 }}>
              <label style={{ fontSize:13, fontWeight:600, color:C.subtext, display:"block", marginBottom:6 }}>
                WhatsApp Number
                <span style={{ fontSize:11, fontWeight:400, color:C.muted, marginLeft:6 }}>(optional)</span>
              </label>
              <div style={{ display:"flex", gap:8 }}>
                <div style={{ background:C.bg, border:`1.5px solid ${C.border}`, borderRadius:8, padding:"12px 12px", fontSize:13, color:C.muted, display:"flex", alignItems:"center", whiteSpace:"nowrap", flexShrink:0 }}>
                  🇳🇵 +977
                </div>
                <input
                  type="tel"
                  value={phone}
                  onChange={e => setPhone(e.target.value.replace(/\D/g,"").slice(0,10))}
                  placeholder="98XXXXXXXX"
                  style={{ ...mkInput(false), flex:1 }}
                  maxLength={10}
                  onKeyDown={e => e.key === "Enter" && handleSave()}
                />
              </div>
              <div style={{ fontSize:11, color:C.muted, marginTop:5 }}>
                Buyers will contact you here when they want your book
              </div>
            </div>

            {saveErr && (
              <div style={{ background:"rgba(248,113,113,0.08)", border:`1px solid ${C.error}40`, borderRadius:8, padding:"9px 13px", fontSize:13, color:C.error, marginBottom:14 }}>
                {saveErr}
              </div>
            )}

            <button
              onClick={handleSave}
              disabled={saving}
              style={{ width:"100%", padding:"13px", background:C.primary, color:C.primaryDark, border:"none", borderRadius:10, fontSize:14, fontWeight:700, cursor:saving?"not-allowed":"pointer", opacity:saving?0.7:1 }}
            >
              {saving ? "Saving..." : "Enter KitabSathi 🚀"}
            </button>

            {/* Skip option */}
            <button
              onClick={() => router.push("/")}
              style={{ width:"100%", marginTop:10, padding:"11px", background:"none", color:C.muted, border:`1px solid ${C.border}`, borderRadius:10, fontSize:13, cursor:"pointer" }}
            >
              Skip for now
            </button>
          </div>
        </div>
      </div>
    </>
  );
}