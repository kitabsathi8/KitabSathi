// pages/auth/callback.js
// ─────────────────────────────────────────────────────────────────
// Google redirects here after login.
// We check if the user has a profile — if not, send them to setup.
// ─────────────────────────────────────────────────────────────────

import { useEffect } from "react";
import { useRouter } from "next/router";
import { supabase } from "../../lib/supabase";

export default function AuthCallback() {
  const router = useRouter();

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === "SIGNED_IN" && session) {
          // Check if user already has a profile with WhatsApp
          const { data: profile } = await supabase
            .from("profiles")
            .select("whatsapp")
            .eq("id", session.user.id)
            .single();

          if (!profile?.whatsapp) {
            // First time — collect their WhatsApp number
            router.push("/profile/setup");
          } else {
            // Returning user — go home
            router.push("/");
          }
        }
      }
    );

    return () => subscription.unsubscribe();
  }, [router]);

  return (
    <div style={{
      minHeight: "100vh", background: "#0D1117",
      display: "flex", alignItems: "center", justifyContent: "center",
      fontFamily: "system-ui, sans-serif",
    }}>
      <div style={{ textAlign: "center" }}>
        <div style={{ fontSize: 52, marginBottom: 16 }}>📚</div>
        <div style={{ fontSize: 18, fontWeight: 700, color: "#E6EDF3", marginBottom: 8 }}>
          Signing you in...
        </div>
        <div style={{ fontSize: 14, color: "#8B949E" }}>Please wait a moment</div>
      </div>
    </div>
  );
}