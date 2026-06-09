// pages/my-listings.js
// ─────────────────────────────────────────────────────────────────
// Shows all books the logged-in user has listed.
// They can mark books as sold or delete listings.
// ─────────────────────────────────────────────────────────────────

import { useState, useEffect } from "react";
import Head from "next/head";
import { useRouter } from "next/router";
import Link from "next/link";
import Navbar from "../components/Navbar";
import { supabase } from "../lib/supabase";

// ─── Theme ────────────────────────────────────────────────────────
const C = {
  bg:"#0D1117", navBg:"#161B22", cardBg:"#1C2535",
  border:"#30363D", primary:"#4CC9E8", primaryDark:"#0D1117",
  text:"#E6EDF3", muted:"#8B949E", subtext:"#C9D1D9",
  error:"#F87171", success:"#4ADE80",
  saveBg:"#14372A", saveText:"#4ADE80",
  badgeBg:"#1F3A50", badgeText:"#7CC8F0",
  condGood:"#4ADE80", condFair:"#FBBF24", condDamaged:"#F87171",
};

function condColor(c){
  if(c==="Like New"||c==="Good") return C.condGood;
  if(c==="Fair") return C.condFair;
  return C.condDamaged;
}

function getEmoji(category, subject){
  if(category==="Non-Academic") return "📙";
  const s=(subject||"").toLowerCase();
  if(s.includes("science"))   return "📕";
  if(s.includes("math"))      return "📘";
  if(s.includes("nepali"))    return "📗";
  if(s.includes("physics"))   return "📕";
  if(s.includes("chemistry")) return "📗";
  if(s.includes("account"))   return "📊";
  return "📚";
}

function timeAgo(dateStr){
  const days = Math.floor((Date.now() - new Date(dateStr)) / 86400000);
  if(days === 0) return "Today";
  if(days === 1) return "Yesterday";
  if(days < 7)  return `${days} days ago`;
  if(days < 30) return `${Math.floor(days/7)} week${Math.floor(days/7)>1?"s":""} ago`;
  return `${Math.floor(days/30)} month${Math.floor(days/30)>1?"s":""} ago`;
}

// ─── Single Listing Card ──────────────────────────────────────────
function ListingCard({ book, onMarkSold, onDelete }) {
  const [confirming, setConfirming] = useState(false); // confirm delete
  const saving = book.mrp > book.price && book.mrp
    ? Math.round(((book.mrp - book.price) / book.mrp) * 100)
    : null;

  return (
    <div style={{
      background: C.cardBg, border: `1px solid ${book.sold ? C.border : C.border}`,
      borderRadius: 14, overflow: "hidden",
      opacity: book.sold ? 0.65 : 1,
    }}>
      {/* Sold banner */}
      {book.sold && (
        <div style={{ background:"#30363D", padding:"6px 14px", fontSize:12, fontWeight:700, color:C.muted, textAlign:"center", letterSpacing:1 }}>
          SOLD
        </div>
      )}

      <div style={{ padding:16 }}>
        <div style={{ display:"flex", gap:14 }}>
          {/* Emoji cover */}
          <div style={{ width:72, height:72, background:"#0D1117", borderRadius:10, display:"flex", alignItems:"center", justifyContent:"center", fontSize:32, flexShrink:0 }}>
            {getEmoji(book.category, book.subject)}
          </div>

          {/* Details */}
          <div style={{ flex:1, minWidth:0 }}>
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", gap:8, marginBottom:4 }}>
              <div style={{ fontWeight:700, fontSize:15, color:C.text, lineHeight:1.3 }}>
                {book.title}
              </div>
              <span style={{ fontSize:11, fontWeight:600, color:condColor(book.condition), flexShrink:0 }}>
                {book.condition}
              </span>
            </div>

            <div style={{ fontSize:12, color:C.muted, marginBottom:6 }}>
              {book.author && `by ${book.author} · `}
              <span style={{ background:C.badgeBg, color:C.badgeText, borderRadius:4, padding:"1px 6px", fontSize:11, fontWeight:600 }}>
                {book.grade || book.category}
              </span>
            </div>

            {/* Price row */}
            <div style={{ display:"flex", alignItems:"center", gap:6, marginBottom:6 }}>
              <span style={{ fontSize:16, fontWeight:800, color:C.primary }}>Rs. {book.price}</span>
              {book.mrp > 0 && <span style={{ fontSize:11, color:C.muted, textDecoration:"line-through" }}>Rs. {book.mrp}</span>}
              {saving && <span style={{ fontSize:10, fontWeight:600, background:C.saveBg, color:C.saveText, borderRadius:3, padding:"1px 5px" }}>{saving}% off</span>}
              {book.negotiable && <span style={{ fontSize:11, color:C.muted }}>· 💬 Negotiable</span>}
            </div>

            <div style={{ display:"flex", gap:12, fontSize:11, color:C.muted }}>
              <span>📍 {book.location}</span>
              <span>🕐 {timeAgo(book.created_at)}</span>
              {book.delivery && <span>🛵 Delivery</span>}
            </div>
          </div>
        </div>

        {/* Action buttons */}
        {!book.sold && (
          <div style={{ display:"flex", gap:8, marginTop:14, paddingTop:14, borderTop:`1px solid ${C.border}` }}>
            {/* Mark as Sold */}
            <button
              onClick={() => onMarkSold(book.id)}
              style={{ flex:1, padding:"9px", background:"rgba(74,222,128,0.1)", color:C.success, border:`1px solid ${C.success}40`, borderRadius:8, fontSize:12, fontWeight:700, cursor:"pointer" }}
            >
              ✅ Mark as Sold
            </button>

            {/* Edit — links to sell page with prefill (future feature) */}
            <Link href={`/sell?edit=${book.id}`} style={{
              flex:1, padding:"9px", background:C.navBg, color:C.subtext,
              border:`1px solid ${C.border}`, borderRadius:8, fontSize:12,
              fontWeight:600, cursor:"pointer", textDecoration:"none",
              display:"flex", alignItems:"center", justifyContent:"center",
            }}>
              ✏️ Edit
            </Link>

            {/* Delete */}
            {!confirming ? (
              <button
                onClick={() => setConfirming(true)}
                style={{ padding:"9px 14px", background:"rgba(248,113,113,0.08)", color:C.error, border:`1px solid ${C.error}30`, borderRadius:8, fontSize:12, fontWeight:600, cursor:"pointer" }}
              >
                🗑️
              </button>
            ) : (
              <div style={{ display:"flex", gap:6 }}>
                <button onClick={() => onDelete(book.id)} style={{ padding:"9px 12px", background:C.error, color:"#fff", border:"none", borderRadius:8, fontSize:12, fontWeight:700, cursor:"pointer" }}>
                  Confirm Delete
                </button>
                <button onClick={() => setConfirming(false)} style={{ padding:"9px 12px", background:C.navBg, color:C.muted, border:`1px solid ${C.border}`, borderRadius:8, fontSize:12, cursor:"pointer" }}>
                  Cancel
                </button>
              </div>
            )}
          </div>
        )}

        {/* Sold actions */}
        {book.sold && (
          <div style={{ display:"flex", gap:8, marginTop:14, paddingTop:14, borderTop:`1px solid ${C.border}` }}>
            <button
              onClick={() => onMarkSold(book.id, false)}
              style={{ flex:1, padding:"9px", background:C.navBg, color:C.subtext, border:`1px solid ${C.border}`, borderRadius:8, fontSize:12, fontWeight:600, cursor:"pointer" }}
            >
              ↩️ Mark as Available
            </button>
            <button
              onClick={() => onDelete(book.id)}
              style={{ padding:"9px 14px", background:"rgba(248,113,113,0.08)", color:C.error, border:`1px solid ${C.error}30`, borderRadius:8, fontSize:12, fontWeight:600, cursor:"pointer" }}
            >
              🗑️ Delete
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────
export default function MyListings() {
  const router = useRouter();
  const [user,     setUser]     = useState(null);
  const [books,    setBooks]    = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [filter,   setFilter]   = useState("active"); // "active" | "sold" | "all"
  const [actionMsg,setActionMsg]= useState("");

  // ── Auth check ────────────────────────────────────────────────
  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) { router.push("/login"); return; }
      setUser(user);
      fetchListings(user.id);
    });
  }, [router]);

  // ── Fetch this user's listings ────────────────────────────────
  async function fetchListings(userId) {
    setLoading(true);
    const { data, error } = await supabase
      .from("books")
      .select("*")
      .eq("seller_id", userId)
      .order("created_at", { ascending: false });

    if (!error && data) setBooks(data);
    setLoading(false);
  }

  // ── Mark as sold / available ──────────────────────────────────
  async function handleMarkSold(bookId, sold = true) {
    const { error } = await supabase
      .from("books")
      .update({ sold })
      .eq("id", bookId);

    if (!error) {
      setBooks(prev => prev.map(b => b.id === bookId ? { ...b, sold } : b));
      setActionMsg(sold ? "✅ Marked as sold!" : "↩️ Marked as available!");
      setTimeout(() => setActionMsg(""), 3000);
    }
  }

  // ── Delete listing ────────────────────────────────────────────
  async function handleDelete(bookId) {
    const { error } = await supabase
      .from("books")
      .delete()
      .eq("id", bookId);

    if (!error) {
      setBooks(prev => prev.filter(b => b.id !== bookId));
      setActionMsg("🗑️ Listing deleted.");
      setTimeout(() => setActionMsg(""), 3000);
    }
  }

  // ── Filter books ──────────────────────────────────────────────
  const filtered = books.filter(b => {
    if (filter === "active") return !b.sold;
    if (filter === "sold")   return  b.sold;
    return true;
  });

  const activeCount = books.filter(b => !b.sold).length;
  const soldCount   = books.filter(b =>  b.sold).length;

  return (
    <>
      <Head>
        <title>My Listings — KitabSathi</title>
      </Head>

      <div style={{ minHeight:"100vh", background:C.bg, fontFamily:"system-ui, sans-serif" }}>
        <Navbar />

        {/* Page header */}
        <div style={{ background:C.navBg, borderBottom:`1px solid ${C.border}`, padding:"20px 24px" }}>
          <div style={{ maxWidth:700, margin:"0 auto", display:"flex", alignItems:"center", justifyContent:"space-between" }}>
            <div>
              <h1 style={{ fontSize:22, fontWeight:800, color:C.text, margin:0 }}>My Listings</h1>
              <p style={{ fontSize:13, color:C.muted, marginTop:4 }}>
                {activeCount} active · {soldCount} sold
              </p>
            </div>
            <Link href="/sell" style={{ padding:"9px 18px", background:C.primary, color:C.primaryDark, borderRadius:20, fontSize:13, fontWeight:700, textDecoration:"none" }}>
              + List a Book
            </Link>
          </div>
        </div>

        <div style={{ maxWidth:700, margin:"0 auto", padding:"20px 24px" }}>

          {/* Action message toast */}
          {actionMsg && (
            <div style={{ background:"rgba(74,222,128,0.08)", border:`1px solid ${C.success}40`, borderRadius:8, padding:"10px 14px", fontSize:13, color:C.success, marginBottom:16 }}>
              {actionMsg}
            </div>
          )}

          {/* Filter tabs */}
          <div style={{ display:"flex", background:C.navBg, border:`1px solid ${C.border}`, borderRadius:10, padding:4, marginBottom:20 }}>
            {[["active",`Active (${activeCount})`],["sold",`Sold (${soldCount})`],["all",`All (${books.length})`]].map(([val, label]) => (
              <button key={val} onClick={() => setFilter(val)} style={{ flex:1, padding:"8px", border:"none", borderRadius:7, fontSize:13, fontWeight:600, cursor:"pointer", background:filter===val?C.cardBg:"transparent", color:filter===val?C.primary:C.muted, transition:"all 0.15s" }}>
                {label}
              </button>
            ))}
          </div>

          {/* Loading state */}
          {loading && (
            <div style={{ display:"flex", flexDirection:"column", gap:12 }}>
              {[1,2,3].map(i => (
                <div key={i} style={{ background:C.cardBg, border:`1px solid ${C.border}`, borderRadius:14, padding:16, height:120, opacity:0.5 }} />
              ))}
            </div>
          )}

          {/* Book list */}
          {!loading && filtered.length > 0 && (
            <div style={{ display:"flex", flexDirection:"column", gap:12 }}>
              {filtered.map(book => (
                <ListingCard
                  key={book.id}
                  book={book}
                  onMarkSold={handleMarkSold}
                  onDelete={handleDelete}
                />
              ))}
            </div>
          )}

          {/* Empty state — no listings at all */}
          {!loading && books.length === 0 && (
            <div style={{ textAlign:"center", padding:"60px 20px", background:C.navBg, border:`1px solid ${C.border}`, borderRadius:14 }}>
              <div style={{ fontSize:52, marginBottom:16 }}>📚</div>
              <div style={{ fontSize:18, fontWeight:700, color:C.text, marginBottom:8 }}>
                No listings yet
              </div>
              <div style={{ fontSize:14, color:C.muted, marginBottom:20 }}>
                List your first book — it's free and takes 2 minutes!
              </div>
              <Link href="/sell" style={{ display:"inline-block", padding:"11px 28px", background:C.primary, color:C.primaryDark, borderRadius:20, fontSize:14, fontWeight:700, textDecoration:"none" }}>
                List a Book 🚀
              </Link>
            </div>
          )}

          {/* Empty state — no books in this filter */}
          {!loading && books.length > 0 && filtered.length === 0 && (
            <div style={{ textAlign:"center", padding:"40px 20px", background:C.navBg, border:`1px solid ${C.border}`, borderRadius:14 }}>
              <div style={{ fontSize:36, marginBottom:12 }}>
                {filter === "sold" ? "🎉" : "📭"}
              </div>
              <div style={{ fontSize:15, fontWeight:700, color:C.text, marginBottom:6 }}>
                {filter === "sold" ? "No sold books yet" : "No active listings"}
              </div>
              <div style={{ fontSize:13, color:C.muted }}>
                {filter === "sold" ? "Books you sell will appear here." : "All your books have been sold!"}
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}