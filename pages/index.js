// pages/index.js — Homepage with live realtime stats
import { useState, useEffect } from "react";
import Head from "next/head";
import Navbar from "../components/Navbar";
import { supabase } from "../lib/supabase";

const C = {
  bg:"#0D1117", navBg:"#161B22", heroBg:"#1C2A35",
  cardBg:"#1C2535", border:"#30363D",
  primary:"#4CC9E8", primaryDark:"#0D1117",
  text:"#E6EDF3", muted:"#8B949E",
  badgeBg:"#1F3A50", badgeText:"#7CC8F0",
  saveBg:"#14372A", saveText:"#4ADE80",
  condGood:"#4ADE80", condFair:"#FBBF24", condDamaged:"#F87171",
};

function AnimatedCount({ value, suffix="" }){
  const [display, setDisplay] = useState(0);
  useEffect(()=>{
    if(!value||value===0) return;
    let current=0;
    const increment=value/50, interval=1200/50;
    const timer=setInterval(()=>{
      current=Math.min(current+increment,value);
      setDisplay(Math.floor(current));
      if(current>=value) clearInterval(timer);
    },interval);
    return ()=>clearInterval(timer);
  },[value]);
  if(value===0) return <>—</>;
  return <>{display.toLocaleString()}{suffix}</>;
}

function condColor(c){
  if(c==="Like New"||c==="Good") return C.condGood;
  if(c==="Fair") return C.condFair;
  return C.condDamaged;
}

function getEmoji(category,subject){
  if(category==="Non-Academic") return "📙";
  const s=(subject||"").toLowerCase();
  if(s.includes("science"))   return "📕";
  if(s.includes("math"))      return "📘";
  if(s.includes("nepali"))    return "📗";
  if(s.includes("physics"))   return "📕";
  if(s.includes("chemistry")) return "📗";
  return "📚";
}

function BookCard({ book }){
  const saving=book.mrp>book.price?Math.round(((book.mrp-book.price)/book.mrp)*100):null;
  const emoji=getEmoji(book.category,book.subject);
  return(
    <a href={`/books/${book.id}`} style={{ textDecoration:"none", display:"block" }}>
      <div
        style={{ background:C.cardBg, border:`1px solid ${C.border}`, borderRadius:12, padding:16, cursor:"pointer", transition:"border-color 0.15s" }}
        onMouseEnter={e=>e.currentTarget.style.borderColor=C.primary}
        onMouseLeave={e=>e.currentTarget.style.borderColor=C.border}
      >
        <div style={{ fontSize:38, textAlign:"center", background:"#0D1117", borderRadius:8, padding:"12px 0", marginBottom:10 }}>{emoji}</div>
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:6 }}>
          <span style={{ fontSize:11, fontWeight:600, background:C.badgeBg, color:C.badgeText, borderRadius:4, padding:"2px 7px" }}>{book.grade||"General"}</span>
          <span style={{ fontSize:11, fontWeight:600, color:condColor(book.condition) }}>{book.condition}</span>
        </div>
        <div style={{ fontWeight:700, fontSize:14, color:C.text, marginBottom:2, lineHeight:1.3 }}>{book.title}</div>
        <div style={{ fontSize:12, color:C.muted, marginBottom:8 }}>by {book.author||"Unknown"}</div>
        <div style={{ display:"flex", alignItems:"center", gap:6, marginBottom:6 }}>
          <span style={{ fontSize:16, fontWeight:800, color:C.primary }}>Rs. {book.price}</span>
          {book.mrp>0&&<span style={{ fontSize:11, color:C.muted, textDecoration:"line-through" }}>Rs. {book.mrp}</span>}
          {saving&&<span style={{ fontSize:10, fontWeight:600, background:C.saveBg, color:C.saveText, borderRadius:3, padding:"1px 5px" }}>{saving}% off</span>}
        </div>
        {book.negotiable&&<div style={{ fontSize:11, color:C.muted, marginBottom:7 }}>💬 Negotiable</div>}
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}>
          <span style={{ fontSize:11, color:C.muted }}>📍 {book.location}</span>
          <button
            onClick={e=>{e.preventDefault();e.stopPropagation();book.seller_phone&&window.open(`https://wa.me/977${book.seller_phone}?text=Hi! I saw your book "${book.title}" on KitabSathi. Is it available?`);}}
            style={{ fontSize:11, fontWeight:600, background:"#25D366", color:"#fff", border:"none", borderRadius:6, padding:"4px 9px", cursor:"pointer" }}
          >WhatsApp</button>
        </div>
      </div>
    </a>
  );
}

const CATEGORIES=[
  {icon:"🏫",label:"Grade 1–5"},{icon:"📐",label:"Grade 6–10"},
  {icon:"⭐",label:"SEE Books"},{icon:"🔬",label:"Grade 11–12"},
  {icon:"🎓",label:"Bachelor"},{icon:"📖",label:"Non-Academic"},
];

export default function Home(){
  const [searchQuery, setSearchQuery] = useState("");
  const [recentBooks, setRecentBooks] = useState([]);
  const [stats,       setStats]       = useState({ books:0, users:0, districts:0 });

  useEffect(()=>{
    async function fetchData(){
      const [
        { count:bookCount },
        { count:userCount },
        { data:locData },
        { data:recent },
      ] = await Promise.all([
        supabase.from("books").select("*",{count:"exact",head:true}).eq("sold",false),
        supabase.from("profiles").select("*",{count:"exact",head:true}),
        supabase.from("books").select("location").eq("sold",false),
        supabase.from("books").select("*").eq("sold",false).order("created_at",{ascending:false}).limit(6),
      ]);
      const districts=new Set((locData||[]).map(l=>l.location)).size;
      setStats({ books:bookCount||0, users:userCount||0, districts:districts||0 });
      if(recent&&recent.length>0) setRecentBooks(recent);
    }

    fetchData();

    // Live update when books OR profiles change
    const channel = supabase.channel("homepage-realtime")
      .on("postgres_changes",{event:"*",schema:"public",table:"books"},    fetchData)
      .on("postgres_changes",{event:"*",schema:"public",table:"profiles"}, fetchData)
      .subscribe();

    return ()=>supabase.removeChannel(channel);
  },[]);

  return(
    <>
      <Head>
        <title>KitabSathi — Buy & Sell Used Books in Nepal</title>
        <meta name="description" content="KitabSathi — Nepal's marketplace for used academic and non-academic books. Buy and sell books from Grade 1 to Bachelor level." />
        <meta name="keywords" content="used books Nepal, buy books Nepal, sell books Nepal, second hand books Kathmandu, SEE books" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <div style={{ minHeight:"100vh", background:C.bg, fontFamily:"system-ui, sans-serif" }}>
        <Navbar />

        {/* Hero */}
        <section style={{ background:C.heroBg, padding:"60px 24px 48px", textAlign:"center" }}>
          <div style={{ maxWidth:640, margin:"0 auto" }}>
            <div style={{ fontSize:12, fontWeight:700, color:C.primary, letterSpacing:2, textTransform:"uppercase", marginBottom:14 }}>🇳🇵 Nepal's Used Book Marketplace</div>
            <h1 style={{ fontSize:40, fontWeight:800, color:C.text, margin:"0 0 16px", lineHeight:1.2, letterSpacing:"-1px" }}>
              Buy & Sell Used Books<br/><span style={{ color:C.primary }}>Save More, Learn More</span>
            </h1>
            <p style={{ color:C.muted, fontSize:16, marginBottom:28 }}>From Grade 1 to Bachelor — find affordable books near you across Nepal</p>
            <div style={{ display:"flex", gap:6, maxWidth:520, margin:"0 auto 20px", background:C.navBg, borderRadius:12, border:`2px solid ${C.primary}`, padding:4 }}>
              <input type="text" placeholder="Search by title, author, grade, subject..." value={searchQuery} onChange={e=>setSearchQuery(e.target.value)} style={{ flex:1, border:"none", outline:"none", padding:"10px 12px", fontSize:15, borderRadius:8, background:"transparent", color:C.text }} />
              <a href={`/browse?q=${searchQuery}`} style={{ background:C.primary, color:C.primaryDark, border:"none", borderRadius:8, padding:"10px 20px", fontWeight:700, cursor:"pointer", fontSize:14, textDecoration:"none", display:"flex", alignItems:"center" }}>Search</a>
            </div>
            <div style={{ display:"flex", justifyContent:"center", gap:8, flexWrap:"wrap" }}>
              {["Grade 10 SEE","+2 Science","BBS TU","Fiction"].map(tag=>(
                <button key={tag} onClick={()=>setSearchQuery(tag)} style={{ padding:"5px 13px", border:`1.5px solid ${C.primary}`, borderRadius:20, fontSize:12, color:C.primary, background:"none", cursor:"pointer" }}>{tag}</button>
              ))}
            </div>
          </div>
        </section>

        {/* Live Stats */}
        <div style={{ background:C.heroBg, borderTop:`1px solid ${C.border}`, borderBottom:`1px solid ${C.border}`, padding:"14px 24px" }}>
          <div style={{ maxWidth:700, margin:"0 auto", display:"flex", justifyContent:"space-around", textAlign:"center" }}>
            {[
              [stats.books,    "+","Books Listed"    ],
              [stats.districts,"", "Districts"       ],
              [stats.users,    "+","Users Registered"],
              [null,           "", "Free to List"    ],
            ].map(([val,suffix,label])=>(
              <div key={label}>
                <div style={{ fontSize:20, fontWeight:800, color:C.primary }}>
                  {val!==null?<AnimatedCount value={val} suffix={suffix}/>:"Free"}
                </div>
                <div style={{ fontSize:12, color:C.muted }}>{label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Categories */}
        <section style={{ padding:"40px 24px", maxWidth:760, margin:"0 auto" }}>
          <h2 style={{ fontSize:22, fontWeight:700, marginBottom:20, color:C.text }}>Browse by Category</h2>
          <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:12 }}>
            {CATEGORIES.map(cat=>(
              <a key={cat.label} href="/browse" style={{ textDecoration:"none" }}>
                <div style={{ background:C.navBg, border:`1px solid ${C.border}`, borderRadius:12, padding:"16px 12px", textAlign:"center", cursor:"pointer" }}>
                  <div style={{ fontSize:28, marginBottom:6 }}>{cat.icon}</div>
                  <div style={{ fontWeight:700, fontSize:14, color:C.text }}>{cat.label}</div>
                </div>
              </a>
            ))}
          </div>
        </section>

        {/* Recent Books */}
        <section style={{ padding:"0 24px 40px", maxWidth:760, margin:"0 auto" }}>
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:20 }}>
            <h2 style={{ fontSize:22, fontWeight:700, color:C.text, margin:0 }}>Recently Listed</h2>
            <a href="/browse" style={{ color:C.primary, textDecoration:"none", fontSize:14, fontWeight:600 }}>View All →</a>
          </div>
          {recentBooks.length>0?(
            <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:14 }}>
              {recentBooks.map(book=><BookCard key={book.id} book={book}/>)}
            </div>
          ):(
            <div style={{ textAlign:"center", padding:"48px 20px", background:C.navBg, border:`1px solid ${C.border}`, borderRadius:12 }}>
              <div style={{ fontSize:40, marginBottom:12 }}>📚</div>
              <div style={{ fontSize:16, fontWeight:700, color:C.text, marginBottom:8 }}>No listings yet!</div>
              <div style={{ fontSize:13, color:C.muted, marginBottom:18 }}>Be the first to list a book on KitabSathi.</div>
              <a href="/sell" style={{ padding:"10px 24px", background:C.primary, color:C.primaryDark, borderRadius:20, fontSize:14, fontWeight:700, textDecoration:"none", display:"inline-block" }}>List the First Book 🚀</a>
            </div>
          )}
        </section>

        {/* How it works */}
        <section style={{ background:C.navBg, borderTop:`1px solid ${C.border}`, padding:"40px 24px" }}>
          <div style={{ maxWidth:700, margin:"0 auto", textAlign:"center" }}>
            <h2 style={{ fontSize:22, fontWeight:700, color:C.text, marginBottom:30 }}>How KitabSathi Works</h2>
            <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:24 }}>
              {[["1","📝","List Your Book","Upload photos, set your price — takes 2 minutes"],["2","💬","Connect via WhatsApp","Buyers contact you directly — no middleman"],["3","🤝","Meet & Exchange","Meet locally, hand over the book and collect payment"]].map(([step,icon,title,desc])=>(
                <div key={step}>
                  <div style={{ width:46, height:46, background:C.primary, borderRadius:"50%", margin:"0 auto 12px", display:"flex", alignItems:"center", justifyContent:"center", color:C.primaryDark, fontWeight:800, fontSize:18 }}>{step}</div>
                  <div style={{ fontSize:24, marginBottom:8 }}>{icon}</div>
                  <div style={{ fontWeight:700, fontSize:14, marginBottom:6, color:C.text }}>{title}</div>
                  <div style={{ fontSize:13, color:C.muted, lineHeight:1.6 }}>{desc}</div>
                </div>
              ))}
            </div>
            <a href="/sell" style={{ display:"inline-block", marginTop:28, padding:"12px 32px", background:C.primary, color:C.primaryDark, borderRadius:24, fontSize:14, fontWeight:700, textDecoration:"none" }}>Start Selling — It's Free 🚀</a>
          </div>
        </section>

        <footer style={{ background:C.bg, borderTop:`1px solid ${C.border}`, padding:"20px 24px", textAlign:"center" }}>
          <div style={{ fontSize:12, color:C.muted }}>© 2025 KitabSathi · Made with ❤️ for Nepal · <span style={{ color:C.primary }}>kitabsathi.com.np</span></div>
        </footer>
      </div>
    </>
  );
}