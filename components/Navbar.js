// components/Navbar.js
import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/router";
import { supabase } from "../lib/supabase";

const C = {
  navBg: "#161B22",
  border: "#30363D",
  primary: "#4CC9E8",
  primaryDark: "#0D1117",
  muted: "#8B949E",
  text: "#E6EDF3",
};

export default function Navbar() {
  const router = useRouter();

  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const dropdownRef = useRef(null);

  const isActive = (path) => router.pathname === path;

  const navLinkStyle = (path) => ({
    padding: "6px 14px",
    borderRadius: 8,
    fontSize: 14,
    textDecoration: "none",
    color: isActive(path) ? C.primary : C.muted,
    fontWeight: isActive(path) ? 700 : 400,
    background: isActive(path)
      ? "rgba(76,201,232,0.08)"
      : "transparent",
  });

  useEffect(() => {
    async function loadUser() {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (session?.user) {
        setUser(session.user);
        loadProfile(session.user.id);
      }
    }

    loadUser();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_, session) => {
      if (session?.user) {
        setUser(session.user);
        loadProfile(session.user.id);
      } else {
        setUser(null);
        setProfile(null);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  async function loadProfile(userId) {
    const { data } = await supabase
      .from("profiles")
      .select("full_name, whatsapp")
      .eq("id", userId)
      .single();

    if (data) setProfile(data);
  }

  useEffect(() => {
    function handleClick(e) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target)
      ) {
        setDropdownOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClick);

    return () =>
      document.removeEventListener("mousedown", handleClick);
  }, []);

  async function handleSignOut() {
    await supabase.auth.signOut();
    setDropdownOpen(false);
    router.push("/");
  }

  const avatarLetter =
    profile?.full_name?.[0]?.toUpperCase() ||
    user?.email?.[0]?.toUpperCase() ||
    "?";

  return (
    <nav
      style={{
        background: C.navBg,
        borderBottom: `1px solid ${C.border}`,
        padding: "0 24px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        height: 70,
        position: "sticky",
        top: 0,
        zIndex: 100,
      }}
    >
      {/* Logo */}
      <Link
        href="/"
        style={{
          display: "flex",
          alignItems: "center",
          textDecoration: "none",
        }}
      >
        <Image
          src="/booksathi-logo.webp"
          alt="BookSathi"
          width={170}
          height={55}
          priority
          style={{
            width: "auto",
            height: "50px",
          }}
        />
      </Link>

      {/* Navigation Links */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 4,
        }}
      >
        <Link href="/browse" style={navLinkStyle("/browse")}>
          Browse
        </Link>

        <Link href="/sell" style={navLinkStyle("/sell")}>
          Sell a Book
        </Link>

        {user ? (
          <div
            ref={dropdownRef}
            style={{
              position: "relative",
              marginLeft: 8,
            }}
          >
            <button
              onClick={() => setDropdownOpen((o) => !o)}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                background: "rgba(76,201,232,0.08)",
                border: `1px solid ${C.border}`,
                borderRadius: 20,
                padding: "5px 12px 5px 6px",
                cursor: "pointer",
              }}
            >
              <div
                style={{
                  width: 28,
                  height: 28,
                  borderRadius: "50%",
                  background: C.primary,
                  color: C.primaryDark,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 13,
                  fontWeight: 800,
                }}
              >
                {avatarLetter}
              </div>

              <span
                style={{
                  fontSize: 13,
                  fontWeight: 600,
                  color: C.text,
                }}
              >
                {profile?.full_name?.split(" ")[0] || "Me"}
              </span>

              <span
                style={{
                  fontSize: 10,
                  color: C.muted,
                }}
              >
                {dropdownOpen ? "▲" : "▼"}
              </span>
            </button>

            {dropdownOpen && (
              <div
                style={{
                  position: "absolute",
                  top: "calc(100% + 8px)",
                  right: 0,
                  background: C.navBg,
                  border: `1px solid ${C.border}`,
                  borderRadius: 12,
                  padding: "8px",
                  minWidth: 200,
                  boxShadow:
                    "0 8px 24px rgba(0,0,0,0.4)",
                  zIndex: 200,
                }}
              >
                <div
                  style={{
                    padding: "8px 10px 10px",
                    borderBottom: `1px solid ${C.border}`,
                    marginBottom: 6,
                  }}
                >
                  <div
                    style={{
                      fontSize: 13,
                      fontWeight: 700,
                      color: C.text,
                    }}
                  >
                    {profile?.full_name ||
                      "BookSathi User"}
                  </div>

                  <div
                    style={{
                      fontSize: 11,
                      color: C.muted,
                      marginTop: 2,
                    }}
                  >
                    {user.email}
                  </div>

                  {profile?.whatsapp && (
                    <div
                      style={{
                        fontSize: 11,
                        color: C.muted,
                        marginTop: 1,
                      }}
                    >
                      📱 +977 {profile.whatsapp}
                    </div>
                  )}
                </div>

                <Link
                  href="/my-listings"
                  onClick={() =>
                    setDropdownOpen(false)
                  }
                  style={{
                    display: "block",
                    padding: "8px 10px",
                    borderRadius: 7,
                    fontSize: 13,
                    color: C.text,
                    textDecoration: "none",
                  }}
                >
                  📋 My Listings
                </Link>

                <Link
                  href="/profile/setup"
                  onClick={() =>
                    setDropdownOpen(false)
                  }
                  style={{
                    display: "block",
                    padding: "8px 10px",
                    borderRadius: 7,
                    fontSize: 13,
                    color: C.text,
                    textDecoration: "none",
                  }}
                >
                  👤 Edit Profile
                </Link>

                <div
                  style={{
                    borderTop: `1px solid ${C.border}`,
                    margin: "6px 0",
                  }}
                />

                <button
                  onClick={handleSignOut}
                  style={{
                    width: "100%",
                    textAlign: "left",
                    padding: "8px 10px",
                    borderRadius: 7,
                    fontSize: 13,
                    color: "#F87171",
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                  }}
                >
                  🚪 Sign Out
                </button>
              </div>
            )}
          </div>
        ) : (
          <Link
            href="/login"
            style={{
              padding: "8px 18px",
              background: C.primary,
              color: C.primaryDark,
              borderRadius: 20,
              fontSize: 14,
              fontWeight: 700,
              textDecoration: "none",
              marginLeft: 8,
              display: "inline-block",
            }}
          >
            Sign In
          </Link>
        )}
      </div>
    </nav>
  );
}