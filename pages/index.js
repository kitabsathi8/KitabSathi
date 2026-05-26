// pages/index.js  —  KitabBazar Homepage (Midnight Theme)
// ─────────────────────────────────────────────────────────────────
// Fixed: Navbar is now imported from components/Navbar.js
// The old inline function Navbar() has been removed.
// ─────────────────────────────────────────────────────────────────

import { useState } from "react";
import Head from "next/head";
import Navbar from "../components/Navbar";   // ← shared navbar

// ─── Sample Data ─────────────────────────────────────────────────
const sampleBooks = [
  { id: 1, emoji: "📚", title: "Class 10 Science",      author: "CDC Nepal",       grade: "Grade 10",     price: 150, mrp: 320,  condition: "Like New", location: "Kathmandu", negotiable: true  },
  { id: 2, emoji: "📗", title: "BBS Accounts Year 1",   author: "Bishambhar",      grade: "Bachelor",     price: 400, mrp: 800,  condition: "Good",     location: "Pokhara",   negotiable: false },
  { id: 3, emoji: "📕", title: "+2 Physics H.C. Verma", author: "H.C. Verma",      grade: "Grade 12",     price: 350, mrp: 650,  condition: "Fair",     location: "Lalitpur",  negotiable: true  },
  { id: 4, emoji: "📘", title: "Mathematics Grade 8",   author: "K.P. Chaudhary",  grade: "Grade 8",      price: 80,  mrp: 200,  condition: "Good",     location: "Bhaktapur", negotiable: true  },
  { id: 5, emoji: "📙", title: "Harry Potter Full Set", author: "J.K. Rowling",    grade: "Non-Academic", price: 900, mrp: 2200, condition: "Good",     location: "Kathmandu", negotiable: false },
  { id: 6, emoji: "📓", title: "Chemistry Grade 11",    author: "Prajapati",       grade: "Grade 11",     price: 280, mrp: 550,  condition: "Like New", location: "Kathmandu", negotiable: true  },
];

const categories = [
  { icon: "🏫", label: "Grade 1–5",    count: 234 },
  { icon: "📐", label: "Grade 6–10",   count: 567 },
  { icon: "⭐", label: "SEE Books",    count: 389 },
  { icon: "🔬", label: "Grade 11–12",  count: 412 },
  { icon: "🎓", label: "Bachelor",     count: 298 },
  { icon: "📖", label: "Non-Academic", count: 156 },
];

// ─── Midnight Theme ───────────────────────────────────────────────
const C = {
  bg:          "#0D1117",
  navBg:       "#161B22",
  heroBg:      "#1C2A35",
  cardBg:      "#1C2535",
  border:      "#30363D",
  primary:     "#4CC9E8",
  primaryDark: "#0D1117",
  text:        "#E6EDF3",
  muted:       "#8B949E",
  badgeBg:     "#1F3A50",
  badgeText:   "#7CC8F0",
  saveBg:      "#14372A",
  saveText:    "#4ADE80",
  condGood:    "#4ADE80",
  condFair:    "#FBBF24",
  condDamaged: "#F87171",
};

function condColor(condition) {
  if (condition === "Like New" || condition === "Good") return C.condGood;
  if (condition === "Fair") return C.condFair;
  return C.condDamaged;
}

// ─── Book Card ────────────────────────────────────────────────────
function BookCard({ book }) {
  const saving = Math.round(((book.mrp - book.price) / book.mrp) * 100);
  return (
    <div style={{ background: C.cardBg, border: `1px solid ${C.border}`, borderRadius: 12, padding: 16, cursor: "pointer" }}>
      <div style={{ fontSize: 38, textAlign: "center", background: "#0D1117", borderRadius: 8, padding: "12px 0", marginBottom: 10 }}>
        {book.emoji}
      </div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
        <span style={{ fontSize: 11, fontWeight: 600, background: C.badgeBg, color: C.badgeText, borderRadius: 4, padding: "2px 7px" }}>
          {book.grade}
        </span>
        <span style={{ fontSize: 11, fontWeight: 600, color: condColor(book.condition) }}>
          {book.condition}
        </span>
      </div>
      <div style={{ fontWeight: 700, fontSize: 14, color: C.text, marginBottom: 2, lineHeight: 1.3 }}>{book.title}</div>
      <div style={{ fontSize: 12, color: C.muted, marginBottom: 8 }}>by {book.author}</div>
      <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 6 }}>
        <span style={{ fontSize: 16, fontWeight: 800, color: C.primary }}>Rs. {book.price}</span>
        <span style={{ fontSize: 11, color: C.muted, textDecoration: "line-through" }}>Rs. {book.mrp}</span>
        <span style={{ fontSize: 10, fontWeight: 600, background: C.saveBg, color: C.saveText, borderRadius: 3, padding: "1px 5px" }}>
          {saving}% off
        </span>
      </div>
      {book.negotiable && <div style={{ fontSize: 11, color: C.muted, marginBottom: 7 }}>💬 Negotiable</div>}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <span style={{ fontSize: 11, color: C.muted }}>📍 {book.location}</span>
        <button style={{ fontSize: 11, fontWeight: 600, background: "#25D366", color: "#fff", border: "none", borderRadius: 6, padding: "4px 9px", cursor: "pointer" }}>
          WhatsApp
        </button>
      </div>
    </div>
  );
}

// ─── Homepage ─────────────────────────────────────────────────────
export default function Home() {
  const [searchQuery, setSearchQuery] = useState("");

  return (
    <>
      <Head>
        <title>KitabBazar — Buy & Sell Used Books in Nepal</title>
        <meta name="description" content="Nepal's marketplace for used academic and non-academic books. Buy and sell books from Grade 1 to Bachelor level at the best prices." />
        <meta name="keywords" content="used books Nepal, buy books Nepal, sell books Nepal, second hand books Kathmandu, SEE books, bachelor books Nepal" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <div style={{ minHeight: "100vh", background: C.bg, fontFamily: "system-ui, sans-serif" }}>

        {/* ── Navbar (shared component) ─────────────────────────── */}
        <Navbar />

        {/* ── Hero ──────────────────────────────────────────────── */}
        <section style={{ background: C.heroBg, padding: "60px 24px 48px", textAlign: "center" }}>
          <div style={{ maxWidth: 640, margin: "0 auto" }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: C.primary, letterSpacing: 2, textTransform: "uppercase", marginBottom: 14 }}>
              🇳🇵 Nepal's Used Book Marketplace
            </div>
            <h1 style={{ fontSize: 40, fontWeight: 800, color: C.text, margin: "0 0 16px", lineHeight: 1.2, letterSpacing: "-1px" }}>
              Buy & Sell Used Books<br />
              <span style={{ color: C.primary }}>Save More, Learn More</span>
            </h1>
            <p style={{ color: C.muted, fontSize: 16, marginBottom: 28 }}>
              From Grade 1 to Bachelor — find affordable books near you across Nepal
            </p>

            {/* Search bar */}
            <div style={{ display: "flex", gap: 6, maxWidth: 520, margin: "0 auto 20px", background: C.navBg, borderRadius: 12, border: `2px solid ${C.primary}`, padding: 4 }}>
              <input
                type="text"
                placeholder="Search by title, author, grade, subject..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{ flex: 1, border: "none", outline: "none", padding: "10px 12px", fontSize: 15, borderRadius: 8, background: "transparent", color: C.text }}
              />
              <button style={{ background: C.primary, color: C.primaryDark, border: "none", borderRadius: 8, padding: "10px 20px", fontWeight: 700, cursor: "pointer", fontSize: 14 }}>
                Search
              </button>
            </div>

            {/* Quick pills */}
            <div style={{ display: "flex", justifyContent: "center", gap: 8, flexWrap: "wrap" }}>
              {["Grade 10 SEE", "+2 Science", "BBS TU", "Fiction", "Nepali Literature"].map((tag) => (
                <button key={tag} onClick={() => setSearchQuery(tag)} style={{ padding: "5px 13px", border: `1.5px solid ${C.primary}`, borderRadius: 20, fontSize: 12, color: C.primary, background: "none", cursor: "pointer" }}>
                  {tag}
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* ── Stats Bar ─────────────────────────────────────────── */}
        <div style={{ background: C.heroBg, borderTop: `1px solid ${C.border}`, borderBottom: `1px solid ${C.border}`, padding: "14px 24px" }}>
          <div style={{ maxWidth: 700, margin: "0 auto", display: "flex", justifyContent: "space-around", textAlign: "center" }}>
            {[["2,400+","Books Listed"],["77","Districts Covered"],["1,800+","Happy Users"],["Free","To List"]].map(([n, l]) => (
              <div key={l}>
                <div style={{ fontSize: 20, fontWeight: 800, color: C.primary }}>{n}</div>
                <div style={{ fontSize: 12, color: C.muted }}>{l}</div>
              </div>
            ))}
          </div>
        </div>

        {/* ── Categories ────────────────────────────────────────── */}
        <section style={{ padding: "40px 24px", maxWidth: 760, margin: "0 auto" }}>
          <h2 style={{ fontSize: 22, fontWeight: 700, marginBottom: 20, color: C.text }}>Browse by Category</h2>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12 }}>
            {categories.map((cat) => (
              <div key={cat.label} style={{ background: C.navBg, border: `1px solid ${C.border}`, borderRadius: 12, padding: "16px 12px", textAlign: "center", cursor: "pointer" }}>
                <div style={{ fontSize: 28, marginBottom: 6 }}>{cat.icon}</div>
                <div style={{ fontWeight: 700, fontSize: 14, color: C.text }}>{cat.label}</div>
                <div style={{ fontSize: 12, color: C.muted, marginTop: 2 }}>{cat.count} books</div>
              </div>
            ))}
          </div>
        </section>

        {/* ── Recent Books ──────────────────────────────────────── */}
        <section style={{ padding: "0 24px 40px", maxWidth: 760, margin: "0 auto" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
            <h2 style={{ fontSize: 22, fontWeight: 700, color: C.text, margin: 0 }}>Recently Listed</h2>
            <button style={{ color: C.primary, border: "none", background: "none", fontSize: 14, fontWeight: 600, cursor: "pointer" }}>
              View All →
            </button>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 14 }}>
            {sampleBooks.map((book) => <BookCard key={book.id} book={book} />)}
          </div>
        </section>

        {/* ── How It Works ──────────────────────────────────────── */}
        <section style={{ background: C.navBg, borderTop: `1px solid ${C.border}`, padding: "40px 24px" }}>
          <div style={{ maxWidth: 700, margin: "0 auto", textAlign: "center" }}>
            <h2 style={{ fontSize: 22, fontWeight: 700, color: C.text, marginBottom: 30 }}>How KitabBazar Works</h2>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 24 }}>
              {[
                ["1","📝","List Your Book",        "Upload photos, set your price — takes 2 minutes"],
                ["2","💬","Connect via WhatsApp",  "Buyers contact you directly — no middleman"],
                ["3","🤝","Meet & Exchange",       "Meet locally, hand over the book and collect payment"],
              ].map(([step, icon, title, desc]) => (
                <div key={step}>
                  <div style={{ width: 46, height: 46, background: C.primary, borderRadius: "50%", margin: "0 auto 12px", display: "flex", alignItems: "center", justifyContent: "center", color: C.primaryDark, fontWeight: 800, fontSize: 18 }}>
                    {step}
                  </div>
                  <div style={{ fontSize: 24, marginBottom: 8 }}>{icon}</div>
                  <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 6, color: C.text }}>{title}</div>
                  <div style={{ fontSize: 13, color: C.muted, lineHeight: 1.6 }}>{desc}</div>
                </div>
              ))}
            </div>
            <button style={{ marginTop: 28, padding: "12px 32px", background: C.primary, color: C.primaryDark, border: "none", borderRadius: 24, fontSize: 14, fontWeight: 700, cursor: "pointer" }}>
              Start Selling — It's Free 🚀
            </button>
          </div>
        </section>

        {/* ── Footer ────────────────────────────────────────────── */}
        <footer style={{ background: C.bg, borderTop: `1px solid ${C.border}`, padding: "20px 24px", textAlign: "center" }}>
          <div style={{ fontSize: 12, color: C.muted }}>
            © 2025 KitabBazar · Made with ❤️ for Nepal ·{" "}
            <span style={{ color: C.primary }}>kitabbazar.com.np</span>
          </div>
        </footer>

      </div>
    </>
  );
}