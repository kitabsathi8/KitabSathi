// pages/books/[id].js — Mobile-first responsive book detail page

import { useState, useEffect } from "react";
import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";
import Navbar from "../../components/Navbar";
import { supabase } from "../../lib/supabase";

const C = {
  bg:"#0D1117", navBg:"#161B22", cardBg:"#1C2535",
  border:"#30363D", primary:"#4CC9E8", primaryDark:"#0D1117",
  text:"#E6EDF3", muted:"#8B949E", subtext:"#C9D1D9",
  badgeBg:"#1F3A50", badgeText:"#7CC8F0",
  saveBg:"#14372A", saveText:"#4ADE80",
  condGood:"#4ADE80", condFair:"#FBBF24", condDamaged:"#F87171",
  error:"#F87171",
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
  if(s.includes("computer"))  return "💻";
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

const COND_DESC = {
  "Like New": "Barely used. No marks, highlights or damage.",
  "Good":     "Minor wear but fully readable. May have light marks.",
  "Fair":     "Some highlights or marks inside. Cover may show wear.",
  "Damaged":  "Visible wear or damage. Still readable and usable.",
};

function InfoRow({ icon, label, value }){
  if(!value) return null;
  return(
    <div style={{ display:"flex", gap:12, padding:"11px 0", borderBottom:`1px solid ${C.border}` }}>
      <span style={{ fontSize:16, flexShrink:0 }}>{icon}</span>
      <div>
        <div style={{ fontSize:11, color:C.muted, fontWeight:600, textTransform:"uppercase", letterSpacing:0.4, marginBottom:2 }}>{label}</div>
        <div style={{ fontSize:14, color:C.text }}>{value}</div>
      </div>
    </div>
  );
}

export default function BookDetail(){
  const router   = useRouter();
  const { id }   = router.query;

  const [book,        setBook]        = useState(null);
  const [seller,      setSeller]      = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const [loading,     setLoading]     = useState(true);
  const [notFound,    setNotFound]    = useState(false);
  const [marking,     setMarking]     = useState(false);
  const [marked,      setMarked]      = useState("");

  useEffect(()=>{
    if(!id) return;
    async function fetchBook(){
      const [{ data: bookData, error }, { data: { user } }] = await Promise.all([
        supabase.from("books").select("*").eq("id", id).single(),
        supabase.auth.getUser(),
      ]);
      if(error || !bookData){ setNotFound(true); setLoading(false); return; }
      setBook(bookData);
      setCurrentUser(user);
      if(bookData.seller_id){
        const { data: profileData } = await supabase
          .from("profiles").select("full_name, whatsapp")
          .eq("id", bookData.seller_id).single();
        if(profileData) setSeller(profileData);
      }
      setLoading(false);
    }
    fetchBook();
  }, [id]);

  // ── Loading ───────────────────────────────────────────────────
  if(loading) return(
    <div style={{ minHeight:"100vh", background:C.bg, fontFamily:"system-ui" }}>
      <Navbar />
      <div style={{ maxWidth:680, margin:"0 auto", padding:"20px 16px" }}>
        <div style={{ background:C.cardBg, border:`1px solid ${C.border}`, borderRadius:14, height:400, opacity:0.5 }} />
      </div>
    </div>
  );

  // ── Not found ─────────────────────────────────────────────────
  if(notFound) return(
    <div style={{ minHeight:"100vh", background:C.bg, fontFamily:"system-ui" }}>
      <Navbar />
      <div style={{ maxWidth:400, margin:"60px auto", padding:"0 16px", textAlign:"center" }}>
        <div style={{ fontSize:52, marginBottom:16 }}>📭</div>
        <div style={{ fontSize:20, fontWeight:700, color:C.text, marginBottom:8 }}>Book not found</div>
        <div style={{ fontSize:14, color:C.muted, marginBottom:24 }}>This listing may have been removed or sold.</div>
        <Link href="/browse" style={{ display:"inline-block", padding:"11px 28px", background:C.primary, color:C.primaryDark, borderRadius:20, fontSize:14, fontWeight:700, textDecoration:"none" }}>
          Browse Other Books
        </Link>
      </div>
    </div>
  );

  const emoji      = getEmoji(book.category, book.subject);
  const saving     = book.mrp > book.price && book.mrp ? Math.round(((book.mrp-book.price)/book.mrp)*100) : null;
  const isSeller   = currentUser && book.seller_id === currentUser.id;
  const waPhone    = seller?.whatsapp || book.seller_phone;
  const waMsg      = `Hi! I saw your book "${book.title}" on KitabSathi. Is it still available? 📚`;
  const waUrl      = waPhone ? `https://wa.me/977${waPhone}?text=${encodeURIComponent(waMsg)}` : null;

  async function handleMarkSold(sold){
    setMarking(true);
    await supabase.from("books").update({ sold }).eq("id", book.id);
    setBook(prev=>({...prev, sold}));
    setMarked(sold ? "✅ Marked as sold!" : "↩️ Marked as available!");
    setTimeout(()=>setMarked(""), 3000);
    setMarking(false);
  }

  return(
    <>
      <Head>
        <title>{book.title} — KitabSathi</title>
        <meta name="description" content={`Buy "${book.title}" in ${book.location}. Rs. ${book.price} — ${book.condition} condition. On KitabSathi Nepal.`} />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>

      <div style={{ minHeight:"100vh", background:C.bg, fontFamily:"system-ui, sans-serif" }}>
        <Navbar />

        <div style={{ maxWidth:680, margin:"0 auto", padding:"16px 14px 48px" }}>

          {/* Back */}
          <button onClick={()=>router.back()} style={{ display:"flex", alignItems:"center", gap:6, background:"none", border:"none", color:C.muted, cursor:"pointer", fontSize:13, marginBottom:16, padding:0 }}>
            ← Back to Browse
          </button>

          {/* Toast */}
          {marked && (
            <div style={{ background:"rgba(74,222,128,0.1)", border:"1px solid rgba(74,222,128,0.3)", borderRadius:8, padding:"10px 14px", fontSize:13, color:C.saveText, marginBottom:12 }}>
              {marked}
            </div>
          )}

          {/* ── SOLD warning for buyers ─────────────────────── */}
          {book.sold && !isSeller && (
            <div style={{ background:"rgba(248,113,113,0.08)", border:`1px solid ${C.error}40`, borderRadius:10, padding:"14px 16px", marginBottom:14 }}>
              <div style={{ fontSize:14, fontWeight:700, color:C.error, marginBottom:4 }}>⚠️ This book has been sold</div>
              <div style={{ fontSize:13, color:C.muted, lineHeight:1.6, marginBottom:8 }}>
                The seller has marked this as sold. You can still contact them if the deal fell through.
              </div>
              <Link href="/browse" style={{ fontSize:13, fontWeight:700, color:C.primary, textDecoration:"none" }}>
                Browse similar books →
              </Link>
            </div>
          )}

          {/* ── Seller: mark as sold banner ─────────────────── */}
          {isSeller && (
            <div style={{ background:C.cardBg, border:`1px solid ${C.border}`, borderRadius:10, padding:"12px 14px", marginBottom:14, display:"flex", alignItems:"center", justifyContent:"space-between", gap:10, flexWrap:"wrap" }}>
              <div>
                <div style={{ fontSize:13, fontWeight:700, color:C.text }}>
                  {book.sold ? "Marked as Sold" : "Is this book still available?"}
                </div>
                <div style={{ fontSize:12, color:C.muted, marginTop:2 }}>
                  {book.sold ? "Mark as available again if deal fell through." : "Mark as sold once you hand it over."}
                </div>
              </div>
              <button
                onClick={()=>handleMarkSold(!book.sold)}
                disabled={marking}
                style={{ padding:"9px 14px", background:book.sold?"rgba(76,201,232,0.1)":"rgba(74,222,128,0.12)", color:book.sold?C.primary:C.saveText, border:`1px solid ${book.sold?C.primary+"40":C.saveText+"50"}`, borderRadius:8, fontSize:12, fontWeight:700, cursor:"pointer", whiteSpace:"nowrap", flexShrink:0 }}
              >
                {marking?"Saving...":book.sold?"↩️ Mark Available":"✅ Mark as Sold"}
              </button>
            </div>
          )}

          {/* ── Book header card ─────────────────────────────── */}
          <div style={{ background:C.cardBg, border:`1px solid ${C.border}`, borderRadius:14, padding:18, marginBottom:14 }}>

            {/* Emoji + Title row */}
            <div style={{ display:"flex", gap:14, alignItems:"flex-start", marginBottom:16 }}>
              <div style={{ width:72, height:72, background:"#0D1117", borderRadius:12, display:"flex", alignItems:"center", justifyContent:"center", fontSize:40, flexShrink:0 }}>
                {emoji}
              </div>
              <div style={{ flex:1, minWidth:0 }}>
                <div style={{ fontWeight:800, fontSize:18, color:C.text, lineHeight:1.3, marginBottom:6 }}>
                  {book.title}
                </div>
                {book.author && <div style={{ fontSize:13, color:C.muted, marginBottom:8 }}>by {book.author}</div>}
                {/* Badges */}
                <div style={{ display:"flex", gap:6, flexWrap:"wrap" }}>
                  {book.grade && <span style={{ fontSize:11, fontWeight:600, background:C.badgeBg, color:C.badgeText, borderRadius:5, padding:"3px 8px" }}>{book.grade}</span>}
                  {book.subject && <span style={{ fontSize:11, fontWeight:600, background:"rgba(76,201,232,0.1)", color:C.primary, borderRadius:5, padding:"3px 8px" }}>{book.subject}</span>}
                </div>
              </div>
            </div>

            {/* Price block */}
            <div style={{ background:"#0D1117", borderRadius:10, padding:"14px 16px", marginBottom:16 }}>
              <div style={{ display:"flex", alignItems:"center", gap:10, flexWrap:"wrap" }}>
                <span style={{ fontSize:26, fontWeight:800, color:C.primary }}>Rs. {book.price}</span>
                {book.mrp > 0 && <span style={{ fontSize:14, color:C.muted, textDecoration:"line-through" }}>Rs. {book.mrp}</span>}
                {saving && <span style={{ fontSize:12, fontWeight:700, background:C.saveBg, color:C.saveText, borderRadius:6, padding:"3px 8px" }}>{saving}% off · Save Rs. {book.mrp-book.price}</span>}
              </div>
              <div style={{ display:"flex", gap:14, marginTop:6, flexWrap:"wrap" }}>
                {book.negotiable && <span style={{ fontSize:12, color:C.muted }}>💬 Negotiable</span>}
                {book.exchange   && <span style={{ fontSize:12, color:C.muted }}>🔄 Open to exchange</span>}
              </div>
            </div>

            {/* Info rows */}
            <InfoRow icon="📍" label="Location" value={book.location} />
            <InfoRow icon="📅" label="Listed"   value={timeAgo(book.created_at)} />
            <InfoRow icon="⏳" label="Book Age" value={book.age} />
            {book.delivery && <InfoRow icon="🛵" label="Delivery" value="Available within city" />}

            {/* Condition */}
            <div style={{ marginTop:14, background:`${condColor(book.condition)}10`, border:`1px solid ${condColor(book.condition)}30`, borderRadius:10, padding:"12px 14px" }}>
              <div style={{ fontSize:13, fontWeight:700, color:condColor(book.condition), marginBottom:4 }}>
                Condition: {book.condition}
              </div>
              <div style={{ fontSize:13, color:C.muted, lineHeight:1.6 }}>
                {COND_DESC[book.condition]}
              </div>
            </div>

            {/* Description */}
            {book.description && (
              <div style={{ marginTop:16 }}>
                <div style={{ fontSize:12, fontWeight:700, color:C.muted, textTransform:"uppercase", letterSpacing:0.4, marginBottom:8 }}>
                  Seller's Description
                </div>
                <div style={{ fontSize:14, color:C.subtext, lineHeight:1.8, background:"#0D1117", borderRadius:10, padding:"12px 14px", whiteSpace:"pre-wrap" }}>
                  {book.description}
                </div>
              </div>
            )}
          </div>

          {/* ── Contact / Seller card ─────────────────────────── */}
          <div style={{ background:C.cardBg, border:`1px solid ${C.border}`, borderRadius:14, padding:18, marginBottom:14 }}>
            <div style={{ fontSize:14, fontWeight:700, color:C.text, marginBottom:14 }}>
              {isSeller ? "Your Listing" : "Contact Seller"}
            </div>

            {/* Sold badge */}
            {book.sold && (
              <div style={{ background:"#30363D", borderRadius:8, padding:"8px 12px", fontSize:13, fontWeight:700, color:C.muted, textAlign:"center", marginBottom:12, letterSpacing:0.5 }}>
                SOLD
              </div>
            )}

            {isSeller ? (
              <Link href="/my-listings" style={{ display:"flex", alignItems:"center", justifyContent:"center", gap:8, padding:"13px", background:"rgba(76,201,232,0.1)", color:C.primary, border:`1px solid ${C.primary}40`, borderRadius:10, fontSize:14, fontWeight:700, textDecoration:"none" }}>
                📋 Manage My Listings
              </Link>
            ) : waUrl ? (
              <a
                href={book.sold ? undefined : waUrl}
                target="_blank"
                rel="noopener noreferrer"
                style={{ display:"flex", alignItems:"center", justifyContent:"center", gap:8, padding:"14px", background:book.sold?"#30363D":"#25D366", color:book.sold?C.muted:"#fff", borderRadius:10, fontSize:15, fontWeight:700, textDecoration:"none", cursor:book.sold?"not-allowed":"pointer", opacity:book.sold?0.6:1 }}
              >
                <span style={{ fontSize:20 }}>💬</span>
                {book.sold ? "Book already sold" : "Chat on WhatsApp"}
              </a>
            ) : (
              <div style={{ background:C.navBg, border:`1px solid ${C.border}`, borderRadius:10, padding:"14px", fontSize:13, color:C.muted, textAlign:"center" }}>
                Contact info not available
              </div>
            )}

            {/* Seller info */}
            {seller && (
              <div style={{ display:"flex", alignItems:"center", gap:10, marginTop:14, paddingTop:14, borderTop:`1px solid ${C.border}` }}>
                <div style={{ width:36, height:36, borderRadius:"50%", background:C.primary, color:C.primaryDark, display:"flex", alignItems:"center", justifyContent:"center", fontSize:15, fontWeight:800, flexShrink:0 }}>
                  {seller.full_name?.[0]?.toUpperCase()||"?"}
                </div>
                <div>
                  <div style={{ fontSize:13, fontWeight:700, color:C.text }}>{seller.full_name}</div>
                  <div style={{ fontSize:12, color:C.muted }}>📍 {book.location}</div>
                </div>
              </div>
            )}
          </div>

          {/* ── Safety tips ──────────────────────────────────── */}
          <div style={{ background:"rgba(251,191,36,0.05)", border:"1px solid rgba(251,191,36,0.2)", borderRadius:12, padding:"12px 14px", marginBottom:20 }}>
            <div style={{ fontSize:12, fontWeight:700, color:"#FBBF24", marginBottom:8 }}>🛡️ Safety Tips</div>
            <div style={{ fontSize:12, color:C.muted, lineHeight:2 }}>
              • Meet in a public place &nbsp;• Check the book before paying<br/>
              • Never send money in advance &nbsp;• Trust your instincts
            </div>
          </div>

          {/* ── Browse more ──────────────────────────────────── */}
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", padding:"16px 0", borderTop:`1px solid ${C.border}` }}>
            <div style={{ fontSize:14, color:C.muted }}>Find more books across Nepal</div>
            <Link href="/browse" style={{ fontSize:13, fontWeight:700, color:C.primary, textDecoration:"none" }}>Browse All →</Link>
          </div>

        </div>
      </div>
    </>
  );
}