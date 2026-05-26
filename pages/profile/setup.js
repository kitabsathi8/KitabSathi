// pages/profile/setup.js
// ─────────────────────────────────────────────────────────────────
// Shown once after first Google login.
// User enters their name and WhatsApp number — saved to profiles table.
// ─────────────────────────────────────────────────────────────────

import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import Head from "next/head";
import { supabase } from "../../lib/supabase";

const C = {
  bg: "#0D1117", navBg: "#161B22", border: "#30363D",
  primary: "#4CC9E8", primaryDark: "#0D1117",
  text: "#E6EDF3", muted: "#8B949E", subtext: "#C9D1D9",
  error: "#F87171", success: "#4ADE80",
};

const mkInput = (err) => ({
  width: "100%", background: C.bg,
  border: `1.5px solid ${err ? C.error : C.border}`,
  color: C.text, borderRadius: 8, padding: "12px 14px",
  fontSize: 15, outline: "none", fontFamily: "system-ui, sans-serif",
});

export default function ProfileSetup() {
  const router = useRouter();
  const [user,     setUser]     = useState(null);
  const [name,     setName]     = useState("");
  const [phone,    setPhone]    = useState("");
  const [saving,   setSaving]   = useState(false);
  const [errors,   setErrors]   = useState({});
  const [saveError,setSaveError]= useState("");

  // Get logged-in user on mount
  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) { router.push("/login"); return; }
      setUser(user);
      // Pre-fill name from Google account if available
      setName(user.user_metadata?.full_name || "");
    });
  }, [router]);

  function validate() {
    const e = {};
    if (!name.trim())  e.name  = true;
    if (!phone.trim()) e.phone = true;
    if (phone && phone.length !== 10) e.phone = true;
    if (phone && !phone.startsWith("9")) e.phone = true;
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  async function handleSave() {
    if (!validate()) return;
    setSaving(true);
    setSaveError("");

    const { error } = await supabase.from("profiles").upsert({
      id:        user.id,
      full_name: name.trim(),
      whatsapp:  phone.trim(),
    });

    if (error) {
      setSaveError(error.message);
      setSaving(false);
    } else {
      router.push("/");
    }
  }

  return (
    <>
      <Head>
        <title>Complete Your Profile — KitabBazar</title>
      </Head>

      <div style={{ minHeight: "100vh", background: C.bg, fontFamily: "system-ui, sans-serif" }}>
        <div style={{ maxWidth: 420, margin: "0 auto", padding: "52px 20px" }}>
          <div style={{
            background: C.navBg, border: `1px solid ${C.border}`,
            borderRadius: 20, padding: "36px 32px",
          }}>
            {/* Header */}
            <div style={{ textAlign: "center", marginBottom: 28 }}>
              <div style={{ fontSize: 44, marginBottom: 10 }}>👋</div>
              <div style={{ fontSize: 20, fontWeight: 800, color: C.text, marginBottom: 6 }}>
                One last step!
              </div>
              <div style={{ fontSize: 13, color: C.muted, lineHeight: 1.6 }}>
                Tell us your name and WhatsApp number so buyers can reach you.
              </div>
            </div>

            {/* Google connected banner */}
            <div style={{
              background: "rgba(74,222,128,0.08)",
              border: `1px solid ${C.success}30`,
              borderRadius: 8, padding: "10px 14px",
              fontSize: 13, color: C.success,
              textAlign: "center", marginBottom: 22,
            }}>
              ✅ Google account connected
              {user && <div style={{ fontSize: 11, color: C.muted, marginTop: 2 }}>{user.email}</div>}
            </div>

            {/* Name */}
            <div style={{ marginBottom: 16 }}>
              <label style={{ fontSize: 13, fontWeight: 600, color: C.subtext, display: "block", marginBottom: 7 }}>
                Your Name <span style={{ color: C.error }}>*</span>
              </label>
              <input
                value={name}
                onChange={e => { setName(e.target.value); setErrors(p => ({...p, name: false})); }}
                placeholder="e.g. Aarav Sharma"
                style={mkInput(errors.name)}
              />
              {errors.name && <div style={{ fontSize: 12, color: C.error, marginTop: 5 }}>Name is required</div>}
            </div>

            {/* WhatsApp */}
            <div style={{ marginBottom: 20 }}>
              <label style={{ fontSize: 13, fontWeight: 600, color: C.subtext, display: "block", marginBottom: 7 }}>
                WhatsApp Number <span style={{ color: C.error }}>*</span>
              </label>
              <div style={{ display: "flex", gap: 8 }}>
                <div style={{
                  background: C.bg, border: `1.5px solid ${C.border}`,
                  borderRadius: 8, padding: "12px 13px",
                  fontSize: 14, color: C.muted,
                  display: "flex", alignItems: "center", gap: 5,
                  whiteSpace: "nowrap", flexShrink: 0,
                }}>
                  🇳🇵 +977
                </div>
                <input
                  type="tel"
                  value={phone}
                  onChange={e => { setPhone(e.target.value.replace(/\D/g, "").slice(0, 10)); setErrors(p => ({...p, phone: false})); }}
                  placeholder="98XXXXXXXX"
                  style={{ ...mkInput(errors.phone), flex: 1 }}
                  maxLength={10}
                />
              </div>
              {errors.phone && (
                <div style={{ fontSize: 12, color: C.error, marginTop: 5 }}>
                  Enter a valid 10-digit Nepal number starting with 9
                </div>
              )}
              <div style={{ fontSize: 11, color: C.muted, marginTop: 6 }}>
                Buyers will contact you on this WhatsApp number
              </div>
            </div>

            {saveError && (
              <div style={{
                background: "rgba(248,113,113,0.08)",
                border: `1px solid ${C.error}40`,
                borderRadius: 8, padding: "10px 14px",
                fontSize: 13, color: C.error, marginBottom: 14,
              }}>
                {saveError}
              </div>
            )}

            <button
              onClick={handleSave}
              disabled={saving}
              style={{
                width: "100%", padding: "13px",
                background: C.primary, color: C.primaryDark,
                border: "none", borderRadius: 10,
                fontSize: 14, fontWeight: 700,
                cursor: saving ? "not-allowed" : "pointer",
                opacity: saving ? 0.7 : 1,
              }}
            >
              {saving ? "Saving..." : "Complete Setup & Enter KitabBazar 🚀"}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}