// pages/browse.js  —  Browse Books (connected to Supabase)
// ─────────────────────────────────────────────────────────────────

import { useState, useEffect, useMemo } from "react";
import Head from "next/head";
import Navbar from "../components/Navbar";
import { supabase } from "../lib/supabase";

// ─── Midnight Theme ───────────────────────────────────────────────
const C = {
  bg:"#0D1117", navBg:"#161B22", cardBg:"#1C2535", border:"#30363D",
  primary:"#4CC9E8", primaryDark:"#0D1117", text:"#E6EDF3", muted:"#8B949E",
  subtext:"#C9D1D9", badgeBg:"#1F3A50", badgeText:"#7CC8F0",
  saveBg:"#14372A", saveText:"#4ADE80",
  condGood:"#4ADE80", condFair:"#FBBF24", condDamaged:"#F87171",
};

// ─── Filter Options ───────────────────────────────────────────────
const GRADE_FILTERS = [
  { label:"All Books",    value:"All"          },
  { label:"Grade 1–5",   value:"Grade 1-5"    },
  { label:"Grade 6–10",  value:"Grade 6-10"   },
  { label:"SEE Books",   value:"SEE"          },
  { label:"Grade 11–12", value:"Grade 11-12"  },
  { label:"Bachelor",    value:"Bachelor"     },
  { label:"Non-Academic",value:"Non-Academic" },
];

const DISTRICTS = [
  "All Nepal","Kathmandu","Lalitpur","Bhaktapur",
  "Pokhara","Chitwan","Butwal","Biratnagar","Dharan","Birgunj",
];

const CONDITIONS = ["Like New","Good","Fair","Damaged"];

// ─── Helpers ──────────────────────────────────────────────────────
function condColor(c){
  if(c==="Like New"||c==="Good") return C.condGood;
  if(c==="Fair") return C.condFair;
  return C.condDamaged;
}

function matchesGrade(book, filter){
  if(filter==="All") return true;
  const g = book.grade || "";
  if(filter==="Grade 1-5")   return ["Grade 1","Grade 2","Grade 3","Grade 4","Grade 5"].includes(g);
  if(filter==="Grade 6-10")  return ["Grade 6","Grade 7","Grade 8","Grade 9","Grade 10"].includes(g);
  if(filter==="SEE")         return g==="Grade 10 (SEE)";
  if(filter==="Grade 11-12") return ["Grade 11","Grade 12"].includes(g);
  if(filter==="Bachelor")    return g.startsWith("Bachelor");
  if(filter==="Non-Academic")return book.category==="Non-Academic";
  return true;
}

// How many days ago was the listing created
function daysAgo(dateStr){
  return Math.floor((Date.now() - new Date(dateStr)) / 86400000);
}

// Pick emoji from subject
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

// ─── Book Card ────────────────────────────────────────────────────
function BookCard({ book }){
  const saving = book.mrp > book.price && book.mrp > 0
    ? Math.round(((book.mrp - book.price) / book.mrp) * 100)
    : null;
  const emoji = getEmoji(book.category, book.subject);

  return(
    <div style={{ background:C.cardBg, border:`1px solid ${C.border}`, borderRadius:12, padding:14, cursor:"pointer" }}>
      <div style={{ fontSize:34, textAlign:"center", background:"#0D1117", borderRadius:8, padding:"10px 0", marginBottom:10 }}>
        {emoji}
      </div>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:5 }}>
        <span style={{ fontSize:11, fontWeight:600, background:C.badgeBg, color:C.badgeText, borderRadius:4, padding:"2px 6px" }}>
          {book.grade || "General"}
        </span>
        <span style={{ fontSize:11, fontWeight:600, color:condColor(book.condition) }}>
          {book.condition}
        </span>
      </div>
      <div style={{ fontWeight:700, fontSize:13, color:C.text, marginBottom:1, lineHeight:1.3 }}>{book.title}</div>
      <div style={{ fontSize:11, color:C.muted, marginBottom:2 }}>by {book.author || "Unknown"}</div>
      <div style={{ fontSize:11, color:C.muted, marginBottom:8 }}>📚 {book.subject || book.category}</div>
      <div style={{ display:"flex", alignItems:"center", gap:5, marginBottom:4 }}>
        <span style={{ fontSize:15, fontWeight:800, color:C.primary }}>Rs. {book.price}</span>
        {book.mrp > 0 && <span style={{ fontSize:11, color:C.muted, textDecoration:"line-through" }}>Rs. {book.mrp}</span>}
        {saving && <span style={{ fontSize:10, fontWeight:600, background:C.saveBg, color:C.saveText, borderRadius:3, padding:"1px 5px" }}>{saving}% off</span>}
      </div>
      {book.negotiable && <div style={{ fontSize:11, color:C.muted, marginBottom:5 }}>💬 Negotiable</div>}
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}>
        <span style={{ fontSize:11, color:C.muted }}>📍 {book.location}</span>
        <button
          onClick={() => window.open(`https://wa.me/977${book.seller_phone}?text=Hi! I found your book "${book.title}" on KitabBazar. Is it still available?`)}
          style={{ fontSize:11, fontWeight:600, background:"#25D366", color:"#fff", border:"none", borderRadius:6, padding:"4px 9px", cursor:"pointer" }}
        >
          WhatsApp
        </button>
      </div>
    </div>
  );
}

// ─── Active Filter Tag ────────────────────────────────────────────
function FilterTag({ label, onRemove }){
  return(
    <span style={{ background:"rgba(76,201,232,0.12)", color:C.primary, borderRadius:20, padding:"4px 10px", fontSize:12, fontWeight:600, display:"flex", alignItems:"center", gap:5 }}>
      {label}
      <button onClick={onRemove} style={{ background:"none", border:"none", color:C.primary, cursor:"pointer", fontSize:14, padding:0, lineHeight:1 }}>✕</button>
    </span>
  );
}

// ─── Main Page ────────────────────────────────────────────────────
export default function BrowsePage(){
  // ── Database state ──
  const [allBooks,   setAllBooks]   = useState([]);
  const [dbLoading,  setDbLoading]  = useState(true);
  const [dbError,    setDbError]    = useState(null);

  // ── Filter state ──
  const [searchQuery,      setSearchQuery]      = useState("");
  const [selectedGrade,    setSelectedGrade]    = useState("All");
  const [selectedLocation, setSelectedLocation] = useState("All Nepal");
  const [conditions,       setConditions]       = useState([]);
  const [minPrice,         setMinPrice]         = useState("");
  const [maxPrice,         setMaxPrice]         = useState("");
  const [sortBy,           setSortBy]           = useState("newest");
  const [negotiableOnly,   setNegotiableOnly]   = useState(false);

  // ── Fetch books from Supabase on load ──────────────────────────
  useEffect(()=>{
    async function fetchBooks(){
      const { data, error } = await supabase
        .from("books")
        .select("*")
        .eq("sold", false)
        .order("created_at", { ascending: false });

      if(error){
        setDbError(error.message);
      } else {
        setAllBooks(data || []);
      }
      setDbLoading(false);
    }
    fetchBooks();
  }, []);

  function toggleCondition(c){
    setConditions(prev => prev.includes(c) ? prev.filter(x=>x!==c) : [...prev,c]);
  }

  function resetFilters(){
    setSearchQuery(""); setSelectedGrade("All"); setSelectedLocation("All Nepal");
    setConditions([]); setMinPrice(""); setMaxPrice("");
    setSortBy("newest"); setNegotiableOnly(false);
  }

  // ── Client-side filtering ──────────────────────────────────────
  const filteredBooks = useMemo(()=>{
    let books = allBooks.filter(b=>{
      if(searchQuery.trim()){
        const q=searchQuery.toLowerCase();
        if(![b.title,b.author,b.subject,b.grade].some(f=>(f||"").toLowerCase().includes(q))) return false;
      }
      if(!matchesGrade(b, selectedGrade)) return false;
      if(selectedLocation!=="All Nepal" && b.location!==selectedLocation) return false;
      if(conditions.length>0 && !conditions.includes(b.condition)) return false;
      if(minPrice && b.price < parseInt(minPrice)) return false;
      if(maxPrice && b.price > parseInt(maxPrice)) return false;
      if(negotiableOnly && !b.negotiable) return false;
      return true;
    });

    const condOrder={"Like New":0,"Good":1,"Fair":2,"Damaged":3};
    if(sortBy==="newest")     books.sort((a,b)=>new Date(b.created_at)-new Date(a.created_at));
    if(sortBy==="price_asc")  books.sort((a,b)=>a.price-b.price);
    if(sortBy==="price_desc") books.sort((a,b)=>b.price-a.price);
    if(sortBy==="condition")  books.sort((a,b)=>(condOrder[a.condition]||9)-(condOrder[b.condition]||9));
    return books;
  },[allBooks,searchQuery,selectedGrade,selectedLocation,conditions,minPrice,maxPrice,sortBy,negotiableOnly]);

  const hasFilters = selectedGrade!=="All"||selectedLocation!=="All Nepal"||conditions.length>0||minPrice||maxPrice||negotiableOnly;

  const priceInput = { flex:1, background:C.bg, border:`1px solid ${C.border}`, color:C.text, borderRadius:7, padding:"8px", fontSize:13, outline:"none", width:0 };

  return(
    <>
      <Head>
        <title>Browse Books — KitabBazar Nepal</title>
        <meta name="description" content="Browse used academic and non-academic books for sale across Nepal." />
      </Head>

      <div style={{ minHeight:"100vh", background:C.bg, fontFamily:"system-ui, sans-serif" }}>
        <Navbar />

        {/* Search bar */}
        <div style={{ background:C.navBg, borderBottom:`1px solid ${C.border}`, padding:"14px 24px" }}>
          <div style={{ maxWidth:920, margin:"0 auto", display:"flex", gap:10 }}>
            <div style={{ flex:1, display:"flex", background:C.bg, border:`2px solid ${C.primary}`, borderRadius:10, padding:4 }}>
              <input type="text" placeholder="Search by title, author, subject, grade..."
                value={searchQuery} onChange={e=>setSearchQuery(e.target.value)}
                style={{ flex:1, border:"none", outline:"none", padding:"9px 12px", fontSize:14, background:"transparent", color:C.text, borderRadius:6 }} />
              {searchQuery && <button onClick={()=>setSearchQuery("")} style={{ background:"none", border:"none", color:C.muted, cursor:"pointer", fontSize:18, padding:"0 10px" }}>✕</button>}
            </div>
            <button style={{ background:C.primary, color:C.primaryDark, border:"none", borderRadius:10, padding:"0 22px", fontWeight:700, fontSize:14, cursor:"pointer" }}>Search</button>
          </div>
        </div>

        <div style={{ maxWidth:920, margin:"0 auto", padding:"20px 24px", display:"flex", gap:20, alignItems:"flex-start" }}>

          {/* Sidebar */}
          <aside style={{ width:210, flexShrink:0, position:"sticky", top:74 }}>
            <div style={{ background:C.navBg, border:`1px solid ${C.border}`, borderRadius:12, padding:16 }}>
              <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:14 }}>
                <div style={{ fontSize:14, fontWeight:700, color:C.text }}>Filters</div>
                {hasFilters && <button onClick={resetFilters} style={{ fontSize:11, color:C.primary, background:"none", border:"none", cursor:"pointer", fontWeight:700 }}>Reset all</button>}
              </div>

              <div style={{ marginBottom:16 }}>
                <div style={{ fontSize:11, fontWeight:700, color:C.muted, textTransform:"uppercase", letterSpacing:0.5, marginBottom:8 }}>Category</div>
                {GRADE_FILTERS.map(gf=>(
                  <div key={gf.value} onClick={()=>setSelectedGrade(gf.value)} style={{ padding:"7px 10px", borderRadius:7, cursor:"pointer", fontSize:13, marginBottom:2, color:selectedGrade===gf.value?C.primary:C.subtext, background:selectedGrade===gf.value?"rgba(76,201,232,0.1)":"transparent", fontWeight:selectedGrade===gf.value?700:400, borderLeft:selectedGrade===gf.value?`3px solid ${C.primary}`:"3px solid transparent" }}>
                    {gf.label}
                  </div>
                ))}
              </div>

              <div style={{ height:1, background:C.border, margin:"0 0 16px" }} />

              <div style={{ marginBottom:16 }}>
                <div style={{ fontSize:11, fontWeight:700, color:C.muted, textTransform:"uppercase", letterSpacing:0.5, marginBottom:8 }}>Location</div>
                <select value={selectedLocation} onChange={e=>setSelectedLocation(e.target.value)} style={{ width:"100%", background:C.bg, border:`1px solid ${C.border}`, color:C.text, borderRadius:7, padding:"8px 10px", fontSize:13, outline:"none", cursor:"pointer" }}>
                  {DISTRICTS.map(d=><option key={d}>{d}</option>)}
                </select>
              </div>

              <div style={{ height:1, background:C.border, margin:"0 0 16px" }} />

              <div style={{ marginBottom:16 }}>
                <div style={{ fontSize:11, fontWeight:700, color:C.muted, textTransform:"uppercase", letterSpacing:0.5, marginBottom:8 }}>Condition</div>
                {CONDITIONS.map(cond=>(
                  <label key={cond} style={{ display:"flex", alignItems:"center", gap:8, padding:"5px 0", cursor:"pointer" }}>
                    <input type="checkbox" checked={conditions.includes(cond)} onChange={()=>toggleCondition(cond)} style={{ width:15, height:15, accentColor:C.primary, cursor:"pointer" }} />
                    <span style={{ fontSize:13, color:C.subtext, flex:1 }}>{cond}</span>
                    <span style={{ width:8, height:8, borderRadius:"50%", background:condColor(cond), flexShrink:0 }} />
                  </label>
                ))}
              </div>

              <div style={{ height:1, background:C.border, margin:"0 0 16px" }} />

              <div style={{ marginBottom:16 }}>
                <div style={{ fontSize:11, fontWeight:700, color:C.muted, textTransform:"uppercase", letterSpacing:0.5, marginBottom:8 }}>Price Range (Rs.)</div>
                <div style={{ display:"flex", gap:8 }}>
                  <input type="number" placeholder="Min" value={minPrice} onChange={e=>setMinPrice(e.target.value)} style={priceInput} />
                  <input type="number" placeholder="Max" value={maxPrice} onChange={e=>setMaxPrice(e.target.value)} style={priceInput} />
                </div>
              </div>

              <div style={{ height:1, background:C.border, margin:"0 0 14px" }} />

              <label style={{ display:"flex", alignItems:"center", gap:8, cursor:"pointer" }}>
                <input type="checkbox" checked={negotiableOnly} onChange={e=>setNegotiableOnly(e.target.checked)} style={{ width:15, height:15, accentColor:C.primary, cursor:"pointer" }} />
                <span style={{ fontSize:13, color:C.subtext }}>Negotiable only</span>
              </label>
            </div>
          </aside>

          {/* Main content */}
          <main style={{ flex:1, minWidth:0 }}>
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:12 }}>
              <div style={{ fontSize:13, color:C.muted }}>
                {dbLoading ? "Loading listings..." : <><span style={{ color:C.text, fontWeight:700 }}>{filteredBooks.length}</span> books found</>}
              </div>
              <select value={sortBy} onChange={e=>setSortBy(e.target.value)} style={{ background:C.navBg, border:`1px solid ${C.border}`, color:C.text, borderRadius:8, padding:"7px 12px", fontSize:13, outline:"none", cursor:"pointer" }}>
                <option value="newest">Newest First</option>
                <option value="price_asc">Price: Low to High</option>
                <option value="price_desc">Price: High to Low</option>
                <option value="condition">Best Condition</option>
              </select>
            </div>

            {/* Active filter tags */}
            {hasFilters && (
              <div style={{ display:"flex", flexWrap:"wrap", gap:6, marginBottom:14 }}>
                {selectedGrade!=="All" && <FilterTag label={selectedGrade} onRemove={()=>setSelectedGrade("All")} />}
                {selectedLocation!=="All Nepal" && <FilterTag label={`📍 ${selectedLocation}`} onRemove={()=>setSelectedLocation("All Nepal")} />}
                {conditions.map(c=><FilterTag key={c} label={c} onRemove={()=>toggleCondition(c)} />)}
                {(minPrice||maxPrice) && <FilterTag label={`Rs. ${minPrice||"0"} – ${maxPrice||"∞"}`} onRemove={()=>{setMinPrice("");setMaxPrice("");}} />}
                {negotiableOnly && <FilterTag label="Negotiable" onRemove={()=>setNegotiableOnly(false)} />}
              </div>
            )}

            {/* Loading state */}
            {dbLoading && (
              <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:12 }}>
                {[1,2,3,4,5,6].map(i=>(
                  <div key={i} style={{ background:C.cardBg, border:`1px solid ${C.border}`, borderRadius:12, padding:14, height:220 }}>
                    <div style={{ background:C.border, borderRadius:8, height:80, marginBottom:10, opacity:0.5 }} />
                    <div style={{ background:C.border, borderRadius:4, height:12, width:"60%", marginBottom:8, opacity:0.4 }} />
                    <div style={{ background:C.border, borderRadius:4, height:10, width:"80%", opacity:0.3 }} />
                  </div>
                ))}
              </div>
            )}

            {/* Error state */}
            {dbError && (
              <div style={{ textAlign:"center", padding:"40px 20px", background:C.navBg, border:`1px solid ${C.border}`, borderRadius:12 }}>
                <div style={{ fontSize:36, marginBottom:12 }}>⚠️</div>
                <div style={{ fontSize:16, fontWeight:700, color:C.text, marginBottom:6 }}>Database connection error</div>
                <div style={{ fontSize:13, color:C.muted }}>{dbError}</div>
                <div style={{ fontSize:12, color:C.muted, marginTop:8 }}>Check your .env.local file and restart the dev server.</div>
              </div>
            )}

            {/* Book grid */}
            {!dbLoading && !dbError && filteredBooks.length > 0 && (
              <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:12 }}>
                {filteredBooks.map(book=><BookCard key={book.id} book={book} />)}
              </div>
            )}

            {/* Empty state — no listings yet */}
            {!dbLoading && !dbError && allBooks.length === 0 && (
              <div style={{ textAlign:"center", padding:"60px 20px", background:C.navBg, border:`1px solid ${C.border}`, borderRadius:12 }}>
                <div style={{ fontSize:48, marginBottom:16 }}>📚</div>
                <div style={{ fontSize:18, fontWeight:700, color:C.text, marginBottom:8 }}>No listings yet!</div>
                <div style={{ fontSize:14, color:C.muted, marginBottom:20 }}>Be the first to list a book on KitabBazar.</div>
                <a href="/sell" style={{ padding:"10px 24px", background:C.primary, color:C.primaryDark, border:"none", borderRadius:20, fontSize:14, fontWeight:700, cursor:"pointer", textDecoration:"none", display:"inline-block" }}>
                  List the First Book 🚀
                </a>
              </div>
            )}

            {/* Empty state — no results matching filters */}
            {!dbLoading && !dbError && allBooks.length > 0 && filteredBooks.length === 0 && (
              <div style={{ textAlign:"center", padding:"60px 20px", background:C.navBg, border:`1px solid ${C.border}`, borderRadius:12 }}>
                <div style={{ fontSize:48, marginBottom:16 }}>📭</div>
                <div style={{ fontSize:18, fontWeight:700, color:C.text, marginBottom:8 }}>No books found</div>
                <div style={{ fontSize:14, color:C.muted, marginBottom:20 }}>Try adjusting your filters or search term</div>
                <button onClick={resetFilters} style={{ padding:"10px 24px", background:C.primary, color:C.primaryDark, border:"none", borderRadius:20, fontSize:14, fontWeight:700, cursor:"pointer" }}>
                  Clear All Filters
                </button>
              </div>
            )}
          </main>
        </div>
      </div>
    </>
  );
}