// pages/sell.js  —  Sell a Book (saves to Supabase)
// ─────────────────────────────────────────────────────────────────

import { useState } from "react";
import Head from "next/head";
import { useRouter } from "next/router";
import Navbar from "../components/Navbar";
import { supabase } from "../lib/supabase";

const C = {
  bg:"#0D1117", navBg:"#161B22", cardBg:"#1C2535", border:"#30363D",
  primary:"#4CC9E8", primaryDark:"#0D1117", text:"#E6EDF3", muted:"#8B949E",
  subtext:"#C9D1D9", badgeBg:"#1F3A50", badgeText:"#7CC8F0",
  saveBg:"#14372A", saveText:"#4ADE80", error:"#F87171",
  condGood:"#4ADE80", condFair:"#FBBF24", condDamaged:"#F87171",
};

const ACADEMIC_GRADES = [
  "Grade 1","Grade 2","Grade 3","Grade 4","Grade 5",
  "Grade 6","Grade 7","Grade 8","Grade 9","Grade 10",
  "Grade 10 (SEE)","Grade 11","Grade 12",
  "Bachelor Year 1","Bachelor Year 2","Bachelor Year 3","Bachelor Year 4",
];
const NON_ACADEMIC_GENRES = [
  "Fiction","Non-Fiction","Self-Help","Biography","History",
  "Science & Technology","Children's Books","Comics & Manga",
  "Religion & Spirituality","Travel","Cooking","Other",
];
const DISTRICTS = [
  "Kathmandu","Lalitpur","Bhaktapur","Pokhara","Chitwan",
  "Butwal","Biratnagar","Dharan","Hetauda","Birgunj","Other",
];
const CONDITIONS = [
  { value:"Like New", desc:"Barely used, no marks",        color:C.condGood    },
  { value:"Good",     desc:"Minor wear, fully readable",   color:C.condGood    },
  { value:"Fair",     desc:"Some highlights or marks",     color:C.condFair    },
  { value:"Damaged",  desc:"Visible wear, still readable", color:C.condDamaged },
];

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

function condColor(c){
  if(c==="Like New"||c==="Good") return C.condGood;
  if(c==="Fair") return C.condFair;
  if(c==="Damaged") return C.condDamaged;
  return C.muted;
}

const mkInput = (err) => ({ width:"100%", background:C.bg, border:`1.5px solid ${err?C.error:C.border}`, color:C.text, borderRadius:8, padding:"11px 14px", fontSize:14, outline:"none", fontFamily:"system-ui, sans-serif" });
const LABEL = { fontSize:13, fontWeight:600, color:C.subtext, display:"block", marginBottom:6 };
const REQ   = { color:C.error };
const BTN_P = { flex:2, padding:"13px", background:C.primary, color:C.primaryDark, border:"none", borderRadius:10, fontSize:14, fontWeight:700, cursor:"pointer" };
const BTN_S = { flex:1, padding:"13px", background:C.navBg, color:C.subtext, border:`1px solid ${C.border}`, borderRadius:10, fontSize:14, fontWeight:600, cursor:"pointer" };

function Toggle({ checked, onChange, label, sublabel }){
  return(
    <div onClick={onChange} style={{ display:"flex", justifyContent:"space-between", alignItems:"center", background:checked?"rgba(76,201,232,0.08)":C.navBg, border:`1px solid ${checked?C.primary:C.border}`, borderRadius:10, padding:"12px 16px", cursor:"pointer" }}>
      <div>
        <div style={{ fontSize:13, fontWeight:600, color:checked?C.primary:C.text }}>{label}</div>
        <div style={{ fontSize:11, color:C.muted, marginTop:2 }}>{sublabel}</div>
      </div>
      <div style={{ width:40, height:22, borderRadius:11, background:checked?C.primary:C.border, position:"relative" }}>
        <div style={{ position:"absolute", top:3, left:checked?21:3, width:16, height:16, borderRadius:"50%", background:"#fff", transition:"left 0.2s" }} />
      </div>
    </div>
  );
}

function StepIndicator({ current }){
  const steps=["Book Info","Condition & Price","Location & Photos"];
  return(
    <div style={{ display:"flex", alignItems:"center", marginBottom:28 }}>
      {steps.map((label,i)=>{
        const done=i<current, active=i===current;
        return(
          <div key={label} style={{ display:"flex", alignItems:"center", flex:i<steps.length-1?1:0 }}>
            <div style={{ display:"flex", flexDirection:"column", alignItems:"center", gap:6 }}>
              <div style={{ width:34, height:34, borderRadius:"50%", display:"flex", alignItems:"center", justifyContent:"center", fontSize:13, fontWeight:700, background:done||active?C.primary:C.navBg, color:done||active?C.primaryDark:C.muted, border:`2px solid ${done||active?C.primary:C.border}` }}>
                {done?"✓":i+1}
              </div>
              <div style={{ fontSize:11, whiteSpace:"nowrap", fontWeight:active?700:400, color:active?C.primary:done?C.subtext:C.muted }}>{label}</div>
            </div>
            {i<steps.length-1 && <div style={{ flex:1, height:2, margin:"0 8px", marginBottom:18, background:done?C.primary:C.border }} />}
          </div>
        );
      })}
    </div>
  );
}

function PreviewCard({ form }){
  const emoji=getEmoji(form.category,form.subject||form.genre);
  const price=parseInt(form.price)||0, mrp=parseInt(form.mrp)||0;
  const saving=mrp>price&&mrp>0?Math.round(((mrp-price)/mrp)*100):null;
  return(
    <div style={{ background:C.cardBg, border:`1px solid ${C.border}`, borderRadius:14, padding:18, position:"sticky", top:80 }}>
      <div style={{ fontSize:11, fontWeight:700, color:C.muted, textTransform:"uppercase", letterSpacing:1, marginBottom:12 }}>Live Preview</div>
      <div style={{ fontSize:44, textAlign:"center", background:"#0D1117", borderRadius:10, padding:"14px 0", marginBottom:12 }}>{emoji}</div>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:6 }}>
        <span style={{ fontSize:11, fontWeight:600, background:C.badgeBg, color:C.badgeText, borderRadius:4, padding:"2px 7px" }}>{form.grade||"Grade / Level"}</span>
        {form.condition && <span style={{ fontSize:11, fontWeight:600, color:condColor(form.condition) }}>{form.condition}</span>}
      </div>
      <div style={{ fontWeight:700, fontSize:14, color:form.title?C.text:C.muted, marginBottom:2, lineHeight:1.3 }}>{form.title||"Your book title"}</div>
      <div style={{ fontSize:12, color:C.muted, marginBottom:8 }}>{form.author?`by ${form.author}`:"Author name"}</div>
      {price>0?(
        <div style={{ display:"flex", alignItems:"center", gap:6, marginBottom:5 }}>
          <span style={{ fontSize:17, fontWeight:800, color:C.primary }}>Rs. {price}</span>
          {mrp>0&&<span style={{ fontSize:11, color:C.muted, textDecoration:"line-through" }}>Rs. {mrp}</span>}
          {saving&&<span style={{ fontSize:10, fontWeight:600, background:C.saveBg, color:C.saveText, borderRadius:3, padding:"1px 5px" }}>{saving}% off</span>}
        </div>
      ):(<div style={{ fontSize:13, color:C.muted, marginBottom:5 }}>Price appears here</div>)}
      {form.negotiable&&<div style={{ fontSize:11, color:C.muted, marginBottom:3 }}>💬 Negotiable</div>}
      {form.exchange&&<div style={{ fontSize:11, color:C.muted, marginBottom:3 }}>🔄 Open to exchange</div>}
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginTop:10, paddingTop:10, borderTop:`1px solid ${C.border}` }}>
        <span style={{ fontSize:11, color:C.muted }}>📍 {form.location||"Location"}</span>
        <button style={{ fontSize:11, fontWeight:600, background:"#25D366", color:"#fff", border:"none", borderRadius:6, padding:"4px 9px", cursor:"pointer" }}>WhatsApp</button>
      </div>
    </div>
  );
}

export default function SellPage(){
  const router = useRouter();
  const [step,       setStep]       = useState(0);
  const [errors,     setErrors]     = useState({});
  const [publishing, setPublishing] = useState(false);
  const [pubError,   setPubError]   = useState("");
  const [form, setForm] = useState({
    title:"", author:"", category:"Academic", grade:"", subject:"", genre:"",
    condition:"", age:"", price:"", mrp:"", negotiable:false, exchange:false, description:"",
    location:"Kathmandu", delivery:false, sellerName:"", sellerPhone:"",
  });

  function update(field, value){ setForm(p=>({...p,[field]:value})); if(errors[field]) setErrors(p=>({...p,[field]:false})); }

  function validate(s){
    const e={};
    if(s===0){ if(!form.title.trim()) e.title=true; if(!form.grade) e.grade=true; }
    if(s===1){ if(!form.condition) e.condition=true; if(!form.price) e.price=true; }
    if(s===2){ if(!form.sellerPhone.trim()) e.sellerPhone=true; }
    setErrors(e); return Object.keys(e).length===0;
  }

  function next(){ if(validate(step)) setStep(s=>s+1); }
  function back(){ setStep(s=>s-1); setErrors({}); }

  // ── Save listing to Supabase ───────────────────────────────────
  async function handlePublish(){
    if(!validate(2)) return;
    setPublishing(true);
    setPubError("");

    const { error } = await supabase.from("books").insert({
      title:        form.title.trim(),
      author:       form.author.trim() || null,
      category:     form.category,
      grade:        form.grade || null,
      subject:      form.subject.trim() || form.genre || null,
      condition:    form.condition,
      age:          form.age || null,
      price:        parseInt(form.price),
      mrp:          form.mrp ? parseInt(form.mrp) : null,
      negotiable:   form.negotiable,
      exchange:     form.exchange,
      description:  form.description.trim() || null,
      location:     form.location,
      delivery:     form.delivery,
      seller_name:  form.sellerName.trim() || null,
      seller_phone: form.sellerPhone.trim(),
    });

    if(error){
      setPubError(error.message);
      setPublishing(false);
    } else {
      // Success — redirect to browse page
      router.push("/browse");
    }
  }

  const savings = parseInt(form.mrp)>parseInt(form.price)&&form.price&&form.mrp ? parseInt(form.mrp)-parseInt(form.price) : null;

  return(
    <>
      <Head>
        <title>Sell a Book — KitabSathi Nepal</title>
        <meta name="description" content="List your used books for sale on KitabSathi. Reach buyers across Nepal for free." />
      </Head>
      <div style={{ minHeight:"100vh", background:C.bg, fontFamily:"system-ui, sans-serif" }}>
        <Navbar />
        <div style={{ background:C.navBg, borderBottom:`1px solid ${C.border}`, padding:"20px 24px" }}>
          <div style={{ maxWidth:900, margin:"0 auto" }}>
            <h1 style={{ fontSize:22, fontWeight:800, color:C.text, margin:0 }}>List a Book for Sale</h1>
            <p style={{ fontSize:14, color:C.muted, marginTop:4 }}>Free to list · Reach buyers across Nepal</p>
          </div>
        </div>

        <div style={{ maxWidth:900, margin:"0 auto", padding:"28px 24px", display:"flex", gap:24, alignItems:"flex-start" }}>
          <div style={{ flex:"1 1 0", minWidth:0 }}>
            <StepIndicator current={step} />

            {/* STEP 1 */}
            {step===0&&(
              <div style={{ display:"flex", flexDirection:"column", gap:16 }}>
                <div><label style={LABEL}>Book Title <span style={REQ}>*</span></label><input value={form.title} onChange={e=>update("title",e.target.value)} placeholder="e.g. Class 10 Science" style={mkInput(errors.title)} />{errors.title&&<div style={{ fontSize:12, color:C.error, marginTop:4 }}>Title is required</div>}</div>
                <div><label style={LABEL}>Author</label><input value={form.author} onChange={e=>update("author",e.target.value)} placeholder="e.g. CDC Nepal, H.C. Verma" style={mkInput(false)} /></div>
                <div>
                  <label style={LABEL}>Category <span style={REQ}>*</span></label>
                  <div style={{ display:"flex", gap:10 }}>
                    {["Academic","Non-Academic"].map(cat=>(
                      <div key={cat} onClick={()=>{update("category",cat);update("grade","");update("subject","");update("genre","");}} style={{ flex:1, padding:"13px", textAlign:"center", border:`2px solid ${form.category===cat?C.primary:C.border}`, borderRadius:10, cursor:"pointer", background:form.category===cat?"rgba(76,201,232,0.08)":C.navBg, color:form.category===cat?C.primary:C.muted, fontWeight:form.category===cat?700:400, fontSize:14 }}>
                        {cat==="Academic"?"📚 Academic":"📖 Non-Academic"}
                      </div>
                    ))}
                  </div>
                </div>
                {form.category==="Academic"?(
                  <div><label style={LABEL}>Grade / Level <span style={REQ}>*</span></label><select value={form.grade} onChange={e=>update("grade",e.target.value)} style={{ ...mkInput(errors.grade), cursor:"pointer" }}><option value="">— Select Grade —</option>{ACADEMIC_GRADES.map(g=><option key={g}>{g}</option>)}</select>{errors.grade&&<div style={{ fontSize:12, color:C.error, marginTop:4 }}>Please select a grade</div>}</div>
                ):(
                  <div><label style={LABEL}>Genre <span style={REQ}>*</span></label><select value={form.genre} onChange={e=>{update("genre",e.target.value);update("grade",e.target.value);}} style={{ ...mkInput(errors.grade), cursor:"pointer" }}><option value="">— Select Genre —</option>{NON_ACADEMIC_GENRES.map(g=><option key={g}>{g}</option>)}</select>{errors.grade&&<div style={{ fontSize:12, color:C.error, marginTop:4 }}>Please select a genre</div>}</div>
                )}
                {form.category==="Academic"&&<div><label style={LABEL}>Subject</label><input value={form.subject} onChange={e=>update("subject",e.target.value)} placeholder="e.g. Science, Mathematics, Physics" style={mkInput(false)} /></div>}
                <button onClick={next} style={{ ...BTN_P, flex:"none", width:"100%", marginTop:4 }}>Continue to Step 2 →</button>
              </div>
            )}

            {/* STEP 2 */}
            {step===1&&(
              <div style={{ display:"flex", flexDirection:"column", gap:16 }}>
                <div>
                  <label style={LABEL}>Book Condition <span style={REQ}>*</span></label>
                  <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10 }}>
                    {CONDITIONS.map(c=>(
                      <div key={c.value} onClick={()=>update("condition",c.value)} style={{ border:`2px solid ${form.condition===c.value?c.color:C.border}`, borderRadius:10, padding:"12px 14px", cursor:"pointer", background:form.condition===c.value?`${c.color}15`:C.navBg }}>
                        <div style={{ fontWeight:700, fontSize:13, color:form.condition===c.value?c.color:C.text }}>{c.value}</div>
                        <div style={{ fontSize:11, color:C.muted, marginTop:3, lineHeight:1.4 }}>{c.desc}</div>
                      </div>
                    ))}
                  </div>
                  {errors.condition&&<div style={{ fontSize:12, color:C.error, marginTop:4 }}>Please select the condition</div>}
                </div>
                <div><label style={LABEL}>How old is the book?</label><select value={form.age} onChange={e=>update("age",e.target.value)} style={{ ...mkInput(false), cursor:"pointer" }}><option value="">— Select —</option><option>Less than 1 year</option><option>1–2 years</option><option>2–3 years</option><option>3+ years</option></select></div>
                <div style={{ display:"flex", gap:12 }}>
                  <div style={{ flex:1 }}><label style={LABEL}>Your Price (Rs.) <span style={REQ}>*</span></label><input type="number" value={form.price} onChange={e=>update("price",e.target.value)} placeholder="150" style={mkInput(errors.price)} />{errors.price&&<div style={{ fontSize:12, color:C.error, marginTop:4 }}>Price is required</div>}</div>
                  <div style={{ flex:1 }}><label style={LABEL}>Original MRP (Rs.)</label><input type="number" value={form.mrp} onChange={e=>update("mrp",e.target.value)} placeholder="320" style={mkInput(false)} /></div>
                </div>
                {savings&&savings>0&&<div style={{ background:C.saveBg, border:`1px solid ${C.saveText}40`, borderRadius:8, padding:"10px 14px", fontSize:13, color:C.saveText, fontWeight:600 }}>Buyers save Rs. {savings} ({Math.round((savings/parseInt(form.mrp))*100)}% off) — great deal!</div>}
                <Toggle checked={form.negotiable} onChange={()=>update("negotiable",!form.negotiable)} label="💬 Price Negotiable?" sublabel="Buyers can make you an offer" />
                <Toggle checked={form.exchange} onChange={()=>update("exchange",!form.exchange)} label="🔄 Open to Book Exchange?" sublabel="Swap your book instead of cash" />
                <div><label style={LABEL}>Description</label><textarea value={form.description} rows={4} onChange={e=>update("description",e.target.value)} placeholder="Describe the condition — highlights, missing pages, how long you used it..." style={{ ...mkInput(false), resize:"vertical", lineHeight:1.6 }} /></div>
                <div style={{ display:"flex", gap:10, marginTop:4 }}><button onClick={back} style={BTN_S}>← Back</button><button onClick={next} style={BTN_P}>Continue to Step 3 →</button></div>
              </div>
            )}

            {/* STEP 3 */}
            {step===2&&(
              <div style={{ display:"flex", flexDirection:"column", gap:16 }}>
                <div><label style={LABEL}>Your District <span style={REQ}>*</span></label><select value={form.location} onChange={e=>update("location",e.target.value)} style={{ ...mkInput(false), cursor:"pointer" }}>{DISTRICTS.map(d=><option key={d}>{d}</option>)}</select></div>
                <Toggle checked={form.delivery} onChange={()=>update("delivery",!form.delivery)} label="🛵 Delivery Available?" sublabel="I can deliver within my city" />
                <div>
                  <label style={LABEL}>Your Name</label>
                  <input value={form.sellerName} onChange={e=>update("sellerName",e.target.value)} placeholder="Your name (shown to buyers)" style={mkInput(false)} />
                </div>
                <div>
                  <label style={LABEL}>Your WhatsApp Number <span style={REQ}>*</span></label>
                  <div style={{ display:"flex", gap:8 }}>
                    <div style={{ background:C.bg, border:`1.5px solid ${C.border}`, borderRadius:8, padding:"11px 12px", fontSize:14, color:C.muted, whiteSpace:"nowrap", flexShrink:0 }}>🇳🇵 +977</div>
                    <input type="tel" value={form.sellerPhone} onChange={e=>update("sellerPhone",e.target.value.replace(/\D/g,"").slice(0,10))} placeholder="98XXXXXXXX" style={{ ...mkInput(errors.sellerPhone), flex:1 }} maxLength={10} />
                  </div>
                  {errors.sellerPhone&&<div style={{ fontSize:12, color:C.error, marginTop:4 }}>WhatsApp number is required — buyers will contact you here</div>}
                </div>
                <div style={{ border:`2px dashed ${C.border}`, borderRadius:12, padding:"28px 20px", textAlign:"center", background:C.navBg, cursor:"pointer" }}>
                  <div style={{ fontSize:32, marginBottom:8 }}>📷</div>
                  <div style={{ fontSize:14, color:C.subtext, fontWeight:600, marginBottom:4 }}>Photo upload — coming soon</div>
                  <div style={{ fontSize:12, color:C.muted }}>We are adding photo support in the next update</div>
                </div>
                {pubError&&<div style={{ background:"rgba(248,113,113,0.1)", border:`1px solid ${C.error}40`, borderRadius:8, padding:"10px 14px", fontSize:13, color:C.error }}>{pubError}</div>}
                <div style={{ display:"flex", gap:10 }}>
                  <button onClick={back} style={BTN_S}>← Back</button>
                  <button onClick={handlePublish} disabled={publishing} style={{ ...BTN_P, opacity:publishing?0.7:1, cursor:publishing?"not-allowed":"pointer" }}>
                    {publishing?"Publishing...":"🚀 Publish Listing"}
                  </button>
                </div>
                <div style={{ fontSize:11, color:C.muted, textAlign:"center" }}>Your listing will be live on the Browse page instantly</div>
              </div>
            )}
          </div>

          {/* Live Preview */}
          <div style={{ width:260, flexShrink:0 }}><PreviewCard form={form} /></div>
        </div>
      </div>
    </>
  );
}