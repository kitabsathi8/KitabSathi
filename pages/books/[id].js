// pages/books/[id].js
// ─────────────────────────────────────────────────────────────────
// Individual book detail page.
// URL: /books/[id]  e.g. /books/abc-123-def
// Fetches full book info + seller profile from Supabase.
// ─────────────────────────────────────────────────────────────────

import { useState, useEffect } from "react";
import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";
import Navbar from "../../components/Navbar";
import { supabase } from "../../lib/supabase";

// ─── Theme ────────────────────────────────────────────────────────
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

// ─── Condition badge with description ─────────────────────────────
const COND_DESC = {
  "Like New": "Book is barely used. No marks, highlights or damage.",
  "Good":     "Minor signs of wear but fully readable. May have light marks.",
  "Fair":     "Some highlights or marks inside. Cover may show wear.",
  "Damaged":  "Visible wear or damage. Still readable and usable.",
};

// ─── Info row component ───────────────────────────────────────────
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

  const [book,    setBook]    = useState(null);
  const [seller,  setSeller]  = useState(null);
  const [loading, setLoading] = useState(true);
  const [notFound,setNotFound]= useState(false);

  useEffect(()=>{
    if(!id) return;
    async function fetchBook(){
      // Fetch book
      const { data: bookData, error } = await supabase
        .from("books")
        .select("*")
        .eq("id", id)
        .single();

      if(error || !bookData){ setNotFound(true); setLoading(false); return; }
      setBook(bookData);

      // Fetch seller profile if seller_id exists
      if(bookData.seller_id){
        const { data: profileData } = await supabase
          .from("profiles")
          .select("full_name, whatsapp")
          .eq("id", bookData.seller_id)
          .single();
        if(profileData) setSeller(profileData);
      }

      setLoading(false);
    }
    fetchBook();
  }, [id]);

  // ── Loading state ─────────────────────────────────────────────
  if(loading){
    return(
      <div style={{ minHeight:"100vh", background:C.bg, fontFamily:"system-ui" }}>
        <Navbar />
        <div style={{ maxWidth:700, margin:"0 auto", padding:"32px 24px" }}>
          <div style={{ background:C.cardBg, border:`1px solid ${C.border}`, borderRadius:14, padding:28, height:400, opacity:0.5 }} />
        </div>
      </div>
    );
  }

  // ── Not found ─────────────────────────────────────────────────
  if(notFound){
    return(
      <div style={{ minHeight:"100vh", background:C.bg, fontFamily:"system-ui" }}>
        <Navbar />
        <div style={{ maxWidth:500, margin:"60px auto", padding:"0 24px", textAlign:"center" }}>
          <div style={{ fontSize:56, marginBottom:16 }}>📭</div>
          <div style={{ fontSize:20, fontWeight:700, color:C.text, marginBottom:8 }}>Book not found</div>
          <div style={{ fontSize:14, color:C.muted, marginBottom:24 }}>
            This listing may have been removed or sold.
          </div>
          <Link href="/browse" style={{ display:"inline-block", padding:"11px 28px", background:C.primary, color:C.primaryDark, borderRadius:20, fontSize:14, fontWeight:700, textDecoration:"none" }}>
            Browse Other Books
          </Link>
        </div>
      </div>
    );
  }

  const emoji   = getEmoji(book.category, book.subject);
  const saving  = book.mrp > book.price && book.mrp
    ? Math.round(((book.mrp - book.price) / book.mrp) * 100)
    : null;

  // WhatsApp message — pre-filled
  const whatsappPhone   = seller?.whatsapp || book.seller_phone;
  const whatsappMessage = `Hi! I saw your book "${book.title}" listed on KitabSathi. Is it still available? 📚`;
  const whatsappUrl     = whatsappPhone
    ? `https://wa.me/977${whatsappPhone}?text=${encodeURIComponent(whatsappMessage)}`
    : null;

  return(
    <>
      <Head>
        <title>{book.title} — KitabSathi</title>
        <meta name="description" content={`Buy "${book.title}" by ${book.author||"Unknown"} in ${book.location}. Rs. ${book.price} — ${book.condition} condition. Listed on KitabSathi Nepal.`} />
        {/* Open Graph for WhatsApp/Facebook sharing */}
        <meta property="og:title" content={`${book.title} — Rs. ${book.price} | KitabSathi`} />
        <meta property="og:description" content={`${book.condition} condition · ${book.location} · Rs. ${book.price}`} />
      </Head>

      <div style={{ minHeight:"100vh", background:C.bg, fontFamily:"system-ui, sans-serif" }}>
        <Navbar />

        <div style={{ maxWidth:760, margin:"0 auto", padding:"24px 24px 48px" }}>

          {/* Back button */}
          <button
            onClick={() => router.back()}
            style={{ display:"flex", alignItems:"center", gap:6, background:"none", border:"none", color:C.muted, cursor:"pointer", fontSize:13, marginBottom:20, padding:0 }}
          >
            ← Back to Browse
          </button>

          {/* Sold banner */}
          {book.sold && (
            <div style={{ background:"#30363D", border:`1px solid ${C.border}`, borderRadius:10, padding:"12px 18px", fontSize:14, fontWeight:700, color:C.muted, textAlign:"center", marginBottom:16, letterSpacing:1 }}>
              THIS BOOK HAS BEEN SOLD
            </div>
          )}

          <div style={{ display:"flex", gap:24, alignItems:"flex-start" }}>

            {/* ── Left column — Book info ───────────────────── */}
            <div style={{ flex:1, minWidth:0 }}>

              {/* Book card */}
              <div style={{ background:C.cardBg, border:`1px solid ${C.border}`, borderRadius:14, padding:24, marginBottom:16 }}>

                {/* Emoji + Title */}
                <div style={{ display:"flex", gap:18, alignItems:"flex-start", marginBottom:18 }}>
                  <div style={{ width:90, height:90, background:"#0D1117", borderRadius:12, display:"flex", alignItems:"center", justifyContent:"center", fontSize:48, flexShrink:0 }}>
                    {emoji}
                  </div>
                  <div style={{ flex:1, minWidth:0 }}>
                    <div style={{ fontWeight:800, fontSize:20, color:C.text, lineHeight:1.3, marginBottom:6 }}>
                      {book.title}
                    </div>
                    {book.author && (
                      <div style={{ fontSize:14, color:C.muted, marginBottom:8 }}>by {book.author}</div>
                    )}
                    <div style={{ display:"flex", gap:6, flexWrap:"wrap" }}>
                      {book.grade && (
                        <span style={{ fontSize:12, fontWeight:600, background:C.badgeBg, color:C.badgeText, borderRadius:5, padding:"3px 8px" }}>
                          {book.grade}
                        </span>
                      )}
                      {book.subject && (
                        <span style={{ fontSize:12, fontWeight:600, background:"rgba(76,201,232,0.1)", color:C.primary, borderRadius:5, padding:"3px 8px" }}>
                          {book.subject}
                        </span>
                      )}
                      {book.category && (
                        <span style={{ fontSize:12, color:C.muted, borderRadius:5, padding:"3px 8px", border:`1px solid ${C.border}` }}>
                          {book.category}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Price */}
                <div style={{ background:"#0D1117", borderRadius:10, padding:"14px 18px", marginBottom:18 }}>
                  <div style={{ display:"flex", alignItems:"center", gap:10, flexWrap:"wrap" }}>
                    <span style={{ fontSize:28, fontWeight:800, color:C.primary }}>Rs. {book.price}</span>
                    {book.mrp > 0 && (
                      <>
                        <span style={{ fontSize:15, color:C.muted, textDecoration:"line-through" }}>Rs. {book.mrp}</span>
                        {saving && (
                          <span style={{ fontSize:13, fontWeight:700, background:C.saveBg, color:C.saveText, borderRadius:6, padding:"3px 10px" }}>
                            {saving}% off · Save Rs. {book.mrp - book.price}
                          </span>
                        )}
                      </>
                    )}
                  </div>
                  <div style={{ display:"flex", gap:16, marginTop:8 }}>
                    {book.negotiable && <span style={{ fontSize:12, color:C.muted }}>💬 Price is negotiable</span>}
                    {book.exchange   && <span style={{ fontSize:12, color:C.muted }}>🔄 Open to book exchange</span>}
                  </div>
                </div>

                {/* Book details */}
                <div>
                  <InfoRow icon="📍" label="Location"  value={book.location} />
                  <InfoRow icon="📅" label="Listed"    value={timeAgo(book.created_at)} />
                  <InfoRow icon="⏳" label="Book Age"  value={book.age} />
                  {book.delivery && <InfoRow icon="🛵" label="Delivery" value="Available within the city" />}
                </div>

                {/* Condition */}
                <div style={{ marginTop:14, background:`${condColor(book.condition)}10`, border:`1px solid ${condColor(book.condition)}30`, borderRadius:10, padding:"12px 16px" }}>
                  <div style={{ display:"flex", align:"center", gap:8, marginBottom:4 }}>
                    <span style={{ fontSize:13, fontWeight:700, color:condColor(book.condition) }}>
                      Condition: {book.condition}
                    </span>
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
                    <div style={{ fontSize:14, color:C.subtext, lineHeight:1.8, background:"#0D1117", borderRadius:10, padding:"12px 16px", whiteSpace:"pre-wrap" }}>
                      {book.description}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* ── Right column — Contact & Seller ──────────── */}
            <div style={{ width:240, flexShrink:0 }}>

              {/* Contact card */}
              <div style={{ background:C.cardBg, border:`1px solid ${C.border}`, borderRadius:14, padding:20, marginBottom:14 }}>
                <div style={{ fontSize:13, fontWeight:700, color:C.text, marginBottom:14 }}>
                  Contact Seller
                </div>

                {/* WhatsApp button */}
                {whatsappUrl ? (
                  <a
                    href={whatsappUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ display:"flex", alignItems:"center", justifyContent:"center", gap:8, width:"100%", padding:"13px", background:"#25D366", color:"#fff", border:"none", borderRadius:10, fontSize:14, fontWeight:700, cursor:"pointer", textDecoration:"none", marginBottom:10 }}
                  >
                    <span style={{ fontSize:18 }}>💬</span> Chat on WhatsApp
                  </a>
                ) : (
                  <div style={{ background:C.navBg, border:`1px solid ${C.border}`, borderRadius:10, padding:"12px", fontSize:13, color:C.muted, textAlign:"center", marginBottom:10 }}>
                    Contact info not available
                  </div>
                )}

                {/* Negotiable note */}
                {book.negotiable && (
                  <div style={{ fontSize:12, color:C.muted, textAlign:"center", lineHeight:1.5 }}>
                    💬 Price is negotiable — feel free to make an offer!
                  </div>
                )}
              </div>

              {/* Seller info */}
              {seller && (
                <div style={{ background:C.cardBg, border:`1px solid ${C.border}`, borderRadius:14, padding:20, marginBottom:14 }}>
                  <div style={{ fontSize:12, fontWeight:700, color:C.muted, textTransform:"uppercase", letterSpacing:0.4, marginBottom:12 }}>
                    About the Seller
                  </div>
                  <div style={{ display:"flex", alignItems:"center", gap:10 }}>
                    <div style={{ width:38, height:38, borderRadius:"50%", background:C.primary, color:C.primaryDark, display:"flex", alignItems:"center", justifyContent:"center", fontSize:16, fontWeight:800, flexShrink:0 }}>
                      {seller.full_name?.[0]?.toUpperCase() || "?"}
                    </div>
                    <div>
                      <div style={{ fontSize:14, fontWeight:700, color:C.text }}>{seller.full_name}</div>
                      <div style={{ fontSize:12, color:C.muted, marginTop:1 }}>📍 {book.location}</div>
                    </div>
                  </div>
                </div>
              )}

              {/* Safety tip */}
              <div style={{ background:"rgba(251,191,36,0.06)", border:"1px solid rgba(251,191,36,0.2)", borderRadius:12, padding:"12px 14px" }}>
                <div style={{ fontSize:12, fontWeight:700, color:"#FBBF24", marginBottom:6 }}>
                  🛡️ Safety Tips
                </div>
                <div style={{ fontSize:11, color:C.muted, lineHeight:1.8 }}>
                  • Meet in a public place<br/>
                  • Check the book before paying<br/>
                  • Never send money in advance<br/>
                  • Trust your instincts
                </div>
              </div>
            </div>
          </div>

          {/* Similar books — browse more */}
          <div style={{ marginTop:32, paddingTop:24, borderTop:`1px solid ${C.border}` }}>
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:6 }}>
              <div style={{ fontSize:16, fontWeight:700, color:C.text }}>Browse more books</div>
              <Link href="/browse" style={{ fontSize:13, color:C.primary, textDecoration:"none", fontWeight:600 }}>
                View All →
              </Link>
            </div>
            <div style={{ fontSize:13, color:C.muted }}>
              Find more {book.grade || book.category} books from sellers across Nepal.
            </div>
          </div>
        </div>
      </div>
    </>
  );
}