import { useState, useEffect, useRef } from "react";

// ─── DOCTORS CONFIG ───────────────────────────────────────────────────────────
const DOCTORS = {
  ent: {
    id: "ent",
    name: "Dr. Arvind Mehta",
    qualification: "MS (ENT), FACS",
    specialty: "ENT Surgery & Head-Neck Specialist",
    regNo: "MCI/UP/2004/18432",
    clinic: "Mehta ENT & Surgical Centre",
    address: "12, Civil Lines, Lucknow – 226001",
    phone: "+91 98100 00001",
    color: "#1a5fa8",
    colorLight: "#e8f0fb",
    pin: "1234",
    specialFields: [
      { key: "hearingLoss", label: "Hearing Loss", type: "select", options: ["None","Mild","Moderate","Severe"] },
      { key: "affectedSide", label: "Affected Side", type: "select", options: ["None","Left","Right","Bilateral"] },
      { key: "nasal", label: "Nasal Symptoms", type: "text", placeholder: "e.g. DNS, polyp, congestion" },
      { key: "throat", label: "Throat / Voice", type: "text", placeholder: "e.g. sore throat, hoarseness" },
    ],
  },
  gyn: {
    id: "gyn",
    name: "Dr. Sunita Rao",
    qualification: "MD (OBG), DGO",
    specialty: "Gynaecologist & Obstetrician",
    regNo: "MCI/UP/2008/29871",
    clinic: "Rao Women's Wellness Clinic",
    address: "45, Hazratganj, Lucknow – 226001",
    phone: "+91 98100 00002",
    color: "#a8185f",
    colorLight: "#fce8f2",
    pin: "5678",
    specialFields: [
      { key: "lmp", label: "LMP (Last Menstrual Period)", type: "text", placeholder: "e.g. 15 March 2026" },
      { key: "gravida", label: "Gravida / Para", type: "text", placeholder: "e.g. G2P1L1A0" },
      { key: "gestAge", label: "Gestational Age", type: "text", placeholder: "e.g. 12 weeks" },
      { key: "bp", label: "Blood Pressure", type: "text", placeholder: "e.g. 120/80 mmHg" },
    ],
  },
};

// ─── LOCAL STORAGE DB ─────────────────────────────────────────────────────────
function loadDB() {
  try {
    return {
      patients: JSON.parse(localStorage.getItem("cs2_patients") || "[]"),
      visits: JSON.parse(localStorage.getItem("cs2_visits") || "[]"),
      bills: JSON.parse(localStorage.getItem("cs2_bills") || "[]"),
      syncQueue: JSON.parse(localStorage.getItem("cs2_sync") || "[]"),
    };
  } catch { return { patients: [], visits: [], bills: [], syncQueue: [] }; }
}
function saveDB(db) {
  localStorage.setItem("cs2_patients", JSON.stringify(db.patients));
  localStorage.setItem("cs2_visits", JSON.stringify(db.visits));
  localStorage.setItem("cs2_bills", JSON.stringify(db.bills || []));
  localStorage.setItem("cs2_sync", JSON.stringify(db.syncQueue));
}
function uid() { return Date.now().toString(36) + Math.random().toString(36).slice(2,6).toUpperCase(); }

// ─── PRINT CSS ────────────────────────────────────────────────────────────────
const PRINT_CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Nunito:wght@400;600;700;800;900&family=Libre+Baskerville:ital,wght@0,700;1,400&display=swap');
  @media print {
    body > * { display: none !important; }
    #rx-print { display: block !important; position: fixed; top:0; left:0; width:100%; background:#fff; z-index:99999; }
    @page { margin: 10mm; size: A5 portrait; }
  }
  #rx-print { display: none; }
`;

// ═══════════════════════════════════════════════════════════════════════════════
export default function App() {
  const [db, setDb] = useState(loadDB());
  const [doctor, setDoctor] = useState(null);
  const [screen, setScreen] = useState("home");
  const [online, setOnline] = useState(navigator.onLine);

  useEffect(() => {
    const on = () => setOnline(true), off = () => setOnline(false);
    window.addEventListener("online", on); window.addEventListener("offline", off);
    return () => { window.removeEventListener("online", on); window.removeEventListener("offline", off); };
  }, []);

  function upDB(patch) { const next = { ...db, ...patch }; setDb(next); saveDB(next); }

  function doSync() {
    const next = { ...db, patients: db.patients.map(p=>({...p,synced:true})), visits: db.visits.map(v=>({...v,synced:true})), bills: (db.bills||[]).map(b=>({...b,synced:true})), syncQueue: [] };
    setDb(next); saveDB(next); alert("✓ All records synced to server!");
  }

  if (!doctor) return <LoginScreen onLogin={d => { setDoctor(d); setScreen("home"); }} />;

  return (
    <div style={{ maxWidth: 430, margin: "0 auto", minHeight: "100vh", background: "#f0f4f8", fontFamily: "'Nunito', sans-serif" }}>
      <style>{PRINT_CSS}</style>
      <TopBar doctor={doctor} online={online} pending={db.syncQueue.length} onSync={doSync} onLogout={() => setDoctor(null)} />
      <div style={{ paddingBottom: 76 }}>
        {screen==="home"      && <HomeScreen     doctor={doctor} db={db} setScreen={setScreen} />}
        {screen==="patients"  && <PatientsScreen doctor={doctor} db={db} upDB={upDB} setScreen={setScreen} />}
        {screen==="newvisit"  && <NewVisitScreen doctor={doctor} db={db} upDB={upDB} setScreen={setScreen} />}
        {screen==="scan"      && <ScanScreen     doctor={doctor} db={db} upDB={upDB} />}
        {screen==="history"   && <HistoryScreen  doctor={doctor} db={db} />}
        {screen==="billing"   && <BillingScreen  doctor={doctor} db={db} upDB={upDB} />}
      </div>
      <BottomNav active={screen} setScreen={setScreen} color={doctor.color} />
    </div>
  );
}

// ─── LOGIN ────────────────────────────────────────────────────────────────────
function LoginScreen({ onLogin }) {
  const [sel, setSel] = useState(null);
  const [pin, setPin] = useState("");
  const [err, setErr] = useState(false);

  function tryPin(digit) {
    const next = pin + digit;
    setPin(next);
    if (next.length === 4) {
      if (sel && next === sel.pin) { onLogin(sel); setPin(""); }
      else { setErr(true); setTimeout(() => { setErr(false); setPin(""); }, 900); }
    }
  }

  return (
    <div style={{ minHeight:"100vh", background:"linear-gradient(155deg,#0d2137 0%,#1a4a7a 50%,#12673a 100%)", display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", padding:24, fontFamily:"'Nunito',sans-serif" }}>
      <div style={{ marginBottom:32, textAlign:"center" }}>
        <div style={{ fontSize:52, marginBottom:10 }}>🏥</div>
        <div style={{ fontFamily:"'Libre Baskerville',serif", fontSize:26, color:"#fff", fontWeight:700 }}>Clinic Smart</div>
        <div style={{ color:"rgba(255,255,255,0.55)", fontSize:13, marginTop:4 }}>Health Records System · Lucknow</div>
      </div>

      <div style={{ width:"100%", maxWidth:370 }}>
        <Label light>Who is logging in?</Label>
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10, marginBottom:24 }}>
          {Object.values(DOCTORS).map(d => (
            <button key={d.id} onClick={() => { setSel(d); setPin(""); setErr(false); }} style={{
              padding:"18px 12px", borderRadius:18,
              background: sel?.id===d.id ? "rgba(255,255,255,0.2)" : "rgba(255,255,255,0.07)",
              border:`2px solid ${sel?.id===d.id ? "rgba(255,255,255,0.7)" : "rgba(255,255,255,0.15)"}`,
              color:"#fff", cursor:"pointer", textAlign:"center", transition:"all 0.18s",
            }}>
              <div style={{ fontSize:36, marginBottom:8 }}>{d.id==="ent" ? "👂" : "🌸"}</div>
              <div style={{ fontWeight:800, fontSize:13, lineHeight:1.3 }}>{d.name}</div>
              <div style={{ fontSize:10, opacity:0.6, marginTop:4 }}>{d.id==="ent" ? "ENT Surgery" : "Gynaecology"}</div>
            </button>
          ))}
        </div>

        {sel && (
          <div>
            <Label light>Enter 4-digit PIN for {sel.name.split(" ")[1]}</Label>
            <div style={{ display:"flex", gap:10, marginBottom:16 }}>
              {[0,1,2,3].map(i => (
                <div key={i} style={{ flex:1, height:56, borderRadius:14, background: err ? "rgba(220,60,60,0.35)" : "rgba(255,255,255,0.12)", border:`2px solid ${err ? "rgba(255,100,100,0.8)" : "rgba(255,255,255,0.25)"}`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:24, color:"#fff", transition:"all 0.2s" }}>
                  {pin[i] ? "●" : ""}
                </div>
              ))}
            </div>
            <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:8 }}>
              {[1,2,3,4,5,6,7,8,9,"",0,"⌫"].map((k,i) => (
                <button key={i} onClick={() => { if (k==="⌫") setPin(p=>p.slice(0,-1)); else if (k!=="" && pin.length<4) tryPin(String(k)); }} style={{ padding:"16px 0", borderRadius:12, background: k==="" ? "transparent" : "rgba(255,255,255,0.11)", border: k==="" ? "none" : "1.5px solid rgba(255,255,255,0.18)", color:"#fff", fontSize:22, fontWeight:700, cursor: k==="" ? "default" : "pointer", fontFamily:"'Nunito',sans-serif", transition:"background 0.15s" }}>{k}</button>
              ))}
            </div>
            {err && <div style={{ textAlign:"center", color:"#ff9999", fontWeight:700, fontSize:13, marginTop:10 }}>Incorrect PIN — try again</div>}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── TOP BAR ──────────────────────────────────────────────────────────────────
function TopBar({ doctor: d, online, pending, onSync, onLogout }) {
  return (
    <div style={{ background:d.color, padding:"11px 16px", display:"flex", alignItems:"center", justifyContent:"space-between", position:"sticky", top:0, zIndex:300 }}>
      <div style={{ display:"flex", alignItems:"center", gap:10 }}>
        <span style={{ fontSize:22 }}>{d.id==="ent" ? "👂" : "🌸"}</span>
        <div>
          <div style={{ color:"#fff", fontFamily:"'Libre Baskerville',serif", fontSize:14, fontWeight:700, lineHeight:1.1 }}>{d.name}</div>
          <div style={{ color:"rgba(255,255,255,0.65)", fontSize:10 }}>{d.specialty}</div>
        </div>
      </div>
      <div style={{ display:"flex", alignItems:"center", gap:6 }}>
        <div style={{ fontSize:10, color: online ? "#a0ffcc" : "#ffd080", fontWeight:700, background:"rgba(0,0,0,0.18)", borderRadius:20, padding:"3px 9px" }}>
          {online ? "🟢 Online" : "🔴 Offline"}
        </div>
        {pending>0 && online && <button onClick={onSync} style={{ background:"#f4a335", border:"none", borderRadius:20, padding:"3px 10px", color:"#fff", fontSize:11, fontWeight:800, cursor:"pointer" }}>Sync {pending}</button>}
        <button onClick={onLogout} style={{ background:"rgba(255,255,255,0.16)", border:"none", borderRadius:20, padding:"4px 10px", color:"#fff", fontSize:11, fontWeight:700, cursor:"pointer" }}>Logout</button>
      </div>
    </div>
  );
}

// ─── BOTTOM NAV ───────────────────────────────────────────────────────────────
function BottomNav({ active, setScreen, color }) {
  const tabs = [
    { id:"home",     label:"Home",     emoji:"🏠" },
    { id:"patients", label:"Patients", emoji:"👥" },
    { id:"newvisit", label:"New Visit",emoji:"✍️" },
    { id:"scan",     label:"Scan Rx",  emoji:"📷" },
    { id:"history",  label:"History",  emoji:"📋" },
    { id:"billing",  label:"Billing",  emoji:"💰" },
  ];
  return (
    <div style={{ position:"fixed", bottom:0, left:"50%", transform:"translateX(-50%)", width:"100%", maxWidth:430, background:"#fff", borderTop:"1.5px solid #dde3ee", display:"flex", zIndex:300 }}>
      {tabs.map(t => (
        <button key={t.id} onClick={() => setScreen(t.id)} style={{ flex:1, padding:"8px 0 6px", border:"none", background:"none", borderTop:`3px solid ${active===t.id ? color : "transparent"}`, color: active===t.id ? color : "#94a3b8", cursor:"pointer", display:"flex", flexDirection:"column", alignItems:"center", gap:2, fontSize:9, fontWeight: active===t.id ? 800 : 600, fontFamily:"'Nunito',sans-serif" }}>
          <span style={{ fontSize:17 }}>{t.emoji}</span>{t.label}
        </button>
      ))}
    </div>
  );
}

// ─── HOME ─────────────────────────────────────────────────────────────────────
function HomeScreen({ doctor: d, db, setScreen }) {
  const myVisits   = db.visits.filter(v => v.doctorId===d.id);
  const myPatients = db.patients.filter(p => p.doctorId===d.id);
  const todayStr   = new Date().toDateString();
  const todayVisits = myVisits.filter(v => new Date(v.date).toDateString()===todayStr);
  const overdue = myVisits.filter(v => v.followUpDate && !v.followUpDone && new Date(v.followUpDate) < new Date());

  const hour = new Date().getHours();
  const greeting = hour<12 ? "Good Morning" : hour<17 ? "Good Afternoon" : "Good Evening";

  return (
    <div style={{ padding:"20px 16px" }}>
      <div style={{ marginBottom:20 }}>
        <div style={{ color:"#64748b", fontSize:13 }}>{new Date().toLocaleDateString("en-IN",{weekday:"long",day:"numeric",month:"long",year:"numeric"})}</div>
        <div style={{ fontFamily:"'Libre Baskerville',serif", fontSize:22, color:"#1e293b", marginTop:3 }}>{greeting} 👋</div>
      </div>

      {/* Stats row */}
      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12, marginBottom:22 }}>
        {[
          { emoji:"👥", label:"My Patients",      val:myPatients.length,   color:d.color },
          { emoji:"📅", label:"Visits Today",     val:todayVisits.length,  color:"#0891b2" },
          { emoji:"📋", label:"Total Visits",     val:myVisits.length,     color:"#7c3aed" },
          { emoji:"⏰", label:"Overdue Follow-ups",val:overdue.length,     color:"#dc2626" },
        ].map((s,i) => (
          <div key={i} style={{ background:"#fff", borderRadius:16, padding:"16px 14px", border:"1px solid #e8edf5", display:"flex", alignItems:"center", gap:12 }}>
            <div style={{ width:46, height:46, borderRadius:13, background:s.color+"18", display:"flex", alignItems:"center", justifyContent:"center", fontSize:22, flexShrink:0 }}>{s.emoji}</div>
            <div><div style={{ fontSize:27, fontWeight:900, color:s.color, lineHeight:1 }}>{s.val}</div><div style={{ fontSize:11, color:"#64748b", marginTop:2 }}>{s.label}</div></div>
          </div>
        ))}
      </div>

      {overdue.length > 0 && (
        <div style={{ background:"#fef2f2", border:"1.5px solid #fecaca", borderRadius:16, padding:"14px 16px", marginBottom:20 }}>
          <div style={{ fontWeight:800, color:"#dc2626", fontSize:14, marginBottom:8 }}>⚠️ Overdue Follow-ups</div>
          {overdue.slice(0,3).map(v => {
            const p = db.patients.find(x=>x.id===v.patientId);
            return <div key={v.id} style={{ fontSize:13, color:"#991b1b", marginBottom:3 }}>• {p?.name} — due {new Date(v.followUpDate).toLocaleDateString("en-IN")}</div>;
          })}
        </div>
      )}

      <div style={{ fontWeight:800, color:"#475569", fontSize:12, textTransform:"uppercase", letterSpacing:1, marginBottom:12 }}>Quick Actions</div>
      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10 }}>
        {[
          { emoji:"✍️", label:"Start New Visit",     screen:"newvisit", big:true, primary:true },
          { emoji:"👤", label:"Register Patient",    screen:"patients" },
          { emoji:"📷", label:"Scan Prescription",   screen:"scan" },
          { emoji:"📋", label:"Visit History",       screen:"history" },
        ].map((a,i) => (
          <button key={i} onClick={() => setScreen(a.screen)} style={{ padding:"18px 14px", background: a.primary ? d.color : "#fff", border: a.primary ? "none" : "1.5px solid #e2e8f0", borderRadius:16, cursor:"pointer", display:"flex", flexDirection:"column", alignItems:"flex-start", gap:10, gridColumn: a.big ? "span 2" : undefined, boxShadow: a.primary ? `0 4px 16px ${d.color}44` : "0 1px 4px rgba(0,0,0,0.04)" }}>
            <span style={{ fontSize:30 }}>{a.emoji}</span>
            <span style={{ fontWeight:800, fontSize:15, color: a.primary ? "#fff" : "#1e293b" }}>{a.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

// ─── PATIENTS ─────────────────────────────────────────────────────────────────
function PatientsScreen({ doctor: d, db, upDB, setScreen }) {
  const [view, setView] = useState("list");
  const [search, setSearch] = useState("");
  const [sel, setSel] = useState(null);
  const [form, setForm] = useState({ name:"", phone:"", age:"", gender: d.id==="gyn" ? "Female" : "Male", blood:"", allergies:"", address:"" });
  const [msg, setMsg] = useState("");

  const mine = db.patients.filter(p=>p.doctorId===d.id);
  const filtered = mine.filter(p => p.name.toLowerCase().includes(search.toLowerCase()) || p.phone.includes(search));

  function lookupPhone(phone) {
    // Check if patient with this phone already exists for this doctor
    return db.patients.find(p => p.phone===phone && p.doctorId===d.id);
  }

  function savePatient() {
    if (!form.name.trim()||!form.phone.trim()) { setMsg("⚠️ Name and Phone are required."); return; }
    if (lookupPhone(form.phone)) { setMsg("⚠️ A patient with this phone already exists."); return; }
    const p = { ...form, id:uid(), doctorId:d.id, createdAt:new Date().toISOString(), synced:false };
    upDB({ patients:[...db.patients, p], syncQueue:[...db.syncQueue,{type:"patient",id:p.id}] });
    setMsg("✓ Patient registered!"); setTimeout(()=>{ setMsg(""); setView("list"); setForm({name:"",phone:"",age:"",gender:d.id==="gyn"?"Female":"Male",blood:"",allergies:"",address:""}); }, 1100);
  }

  // Patient detail
  if (view==="detail" && sel) {
    const visits = db.visits.filter(v=>v.patientId===sel.id).sort((a,b)=>new Date(b.date)-new Date(a.date));
    const bills  = (db.bills||[]).filter(b=>b.patientId===sel.id);
    const totalBilled = bills.reduce((s,b)=>s+b.amount,0);
    const isNew  = visits.length===0;
    return (
      <div style={{ padding:"16px 16px 20px" }}>
        <Btn back onClick={()=>setView("list")} />
        <div style={{ background:d.color, borderRadius:20, padding:"20px 18px", color:"#fff", marginBottom:16 }}>
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start" }}>
            <div>
              <div style={{ fontFamily:"'Libre Baskerville',serif", fontSize:21, fontWeight:700 }}>{sel.name}</div>
              <div style={{ opacity:.8, fontSize:13, marginTop:4 }}>{sel.age}y · {sel.gender} · {sel.blood||"Blood N/A"}</div>
              <div style={{ opacity:.7, fontSize:12, marginTop:2 }}>📞 {sel.phone}</div>
              {sel.address && <div style={{ opacity:.6, fontSize:11, marginTop:2 }}>📍 {sel.address}</div>}
            </div>
            <div style={{ textAlign:"right" }}>
              <div style={{ background: isNew?"#22c55e":"#f4a335", borderRadius:20, padding:"4px 12px", fontSize:11, fontWeight:800 }}>{isNew?"🆕 NEW":"↩️ RETURNING"}</div>
              <div style={{ fontSize:11, opacity:.7, marginTop:8 }}>{visits.length} visit{visits.length!==1?"s":""}</div>
              {totalBilled>0 && <div style={{ fontSize:11, opacity:.7 }}>₹{totalBilled} billed</div>}
            </div>
          </div>
          {sel.allergies && <div style={{ marginTop:12, background:"rgba(255,255,255,0.15)", borderRadius:10, padding:"8px 12px", fontSize:12 }}>⚠️ Allergies: {sel.allergies}</div>}
        </div>

        {/* Visit timeline */}
        <SecTitle>Visit Timeline ({visits.length})</SecTitle>
        {visits.length===0 && <Empty text="No visits yet." />}
        {visits.map((v,i)=>(
          <div key={v.id} style={{ background:"#fff", border:"1px solid #e2e8f0", borderRadius:14, padding:"14px 16px", marginBottom:10 }}>
            <div style={{ display:"flex", justifyContent:"space-between", marginBottom:6 }}>
              <span style={{ fontWeight:800, fontSize:13, color:"#1e293b" }}>Visit #{visits.length-i}</span>
              <span style={{ fontSize:11, color:"#94a3b8" }}>{new Date(v.date).toLocaleDateString("en-IN",{day:"numeric",month:"short",year:"numeric"})}</span>
            </div>
            {v.diagnosis   && <div style={{ fontSize:13, color:"#374151" }}>🩺 {v.diagnosis}</div>}
            {v.medicines   && <div style={{ fontSize:12, color:"#6b7280", marginTop:4 }}>💊 {v.medicines.split("\n")[0]}{v.medicines.includes("\n")?"…":""}</div>}
            {v.followUpDate&& <div style={{ fontSize:11, color:"#7c3aed", marginTop:4, fontWeight:700 }}>📅 Follow-up: {v.followUpDate}</div>}
            {v.type==="scan"&&<div style={{ fontSize:11, color:"#2563eb", marginTop:4, fontWeight:700 }}>📷 Scanned copy</div>}
            {v.scanned     && <img src={v.scanned} alt="scan" style={{ width:"100%", borderRadius:8, maxHeight:100, objectFit:"cover", marginTop:8 }} />}
          </div>
        ))}
      </div>
    );
  }

  // Add form
  if (view==="add") return (
    <div style={{ padding:"16px 16px 20px" }}>
      <Btn back onClick={()=>setView("list")} />
      <SecTitle>Register New Patient</SecTitle>
      <Inp label="Full Name *"       value={form.name}      onChange={v=>setForm({...form,name:v})}      placeholder="e.g. Priya Sharma" />
      <Inp label="Phone Number *"    value={form.phone}     onChange={v=>setForm({...form,phone:v})}     placeholder="e.g. 98765 43210" type="tel"
        extra={form.phone.length>=10 && lookupPhone(form.phone) ? <div style={{ fontSize:11,color:"#dc2626",marginTop:4,fontWeight:700 }}>⚠️ Already registered</div> : null}
      />
      <Inp label="Age"               value={form.age}       onChange={v=>setForm({...form,age:v})}       placeholder="e.g. 34" type="number" />
      <div style={{ marginBottom:14 }}>
        <label style={lbl}>Gender</label>
        <div style={{ display:"flex", gap:8 }}>
          {(d.id==="gyn"?["Female","Male","Other"]:["Male","Female","Other"]).map(g=>(
            <button key={g} onClick={()=>setForm({...form,gender:g})} style={{ flex:1, padding:"13px 0", borderRadius:12, border:`2px solid ${form.gender===g?d.color:"#e2e8f0"}`, background:form.gender===g?d.color+"18":"#fff", color:form.gender===g?d.color:"#64748b", fontWeight:700, fontSize:14, cursor:"pointer", fontFamily:"'Nunito',sans-serif" }}>{g}</button>
          ))}
        </div>
      </div>
      <Inp label="Blood Group"       value={form.blood}     onChange={v=>setForm({...form,blood:v})}     placeholder="e.g. B+" />
      <Inp label="Known Allergies"   value={form.allergies} onChange={v=>setForm({...form,allergies:v})} placeholder="e.g. Penicillin, Aspirin" />
      <Inp label="Address"           value={form.address}   onChange={v=>setForm({...form,address:v})}   placeholder="e.g. Gomtinagar, Lucknow" />
      {msg && <Msg text={msg} ok={msg.startsWith("✓")} />}
      <BigBtn color={d.color} onClick={savePatient}>Save Patient</BigBtn>
    </div>
  );

  // List
  return (
    <div style={{ padding:"16px 16px 20px" }}>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:16 }}>
        <SecTitle style={{ margin:0 }}>Patients ({mine.length})</SecTitle>
        <button onClick={()=>setView("add")} style={{ background:d.color, color:"#fff", border:"none", borderRadius:24, padding:"10px 18px", fontWeight:800, fontSize:14, cursor:"pointer", fontFamily:"'Nunito',sans-serif" }}>+ Add New</button>
      </div>
      <Search value={search} onChange={setSearch} placeholder="Search by name or phone…" />
      {filtered.length===0 && <Empty text="No patients found." />}
      {filtered.map(p => {
        const visits = db.visits.filter(v=>v.patientId===p.id);
        const last   = visits.sort((a,b)=>new Date(b.date)-new Date(a.date))[0];
        return (
          <div key={p.id} onClick={()=>{setSel(p);setView("detail");}} style={{ background:"#fff", border:"1px solid #e2e8f0", borderRadius:16, padding:"14px 16px", marginBottom:10, cursor:"pointer", display:"flex", gap:12, alignItems:"center" }}>
            <div style={{ width:46, height:46, borderRadius:13, background:d.color+"18", display:"flex", alignItems:"center", justifyContent:"center", fontWeight:900, fontSize:19, color:d.color, flexShrink:0 }}>{p.name[0]}</div>
            <div style={{ flex:1 }}>
              <div style={{ fontWeight:800, fontSize:15, color:"#1e293b" }}>{p.name}</div>
              <div style={{ fontSize:12, color:"#94a3b8" }}>{p.age}y · {p.phone}</div>
              <div style={{ fontSize:11, color:"#64748b", marginTop:2 }}>
                {visits.length===0 ? "🆕 New — no visits yet" : `↩️ ${visits.length} visit${visits.length>1?"s":""} · Last: ${new Date(last.date).toLocaleDateString("en-IN")}`}
              </div>
            </div>
            <span style={{ color:"#cbd5e1", fontSize:22 }}>›</span>
          </div>
        );
      })}
    </div>
  );
}

// ─── NEW VISIT ────────────────────────────────────────────────────────────────
function NewVisitScreen({ doctor: d, db, upDB, setScreen }) {
  const [step, setStep]         = useState("select");
  const [patient, setPatient]   = useState(null);
  const [search, setSearch]     = useState("");
  const [form, setForm]         = useState({ diagnosis:"", medicines:"", investigations:"", advice:"", followUpDate:"" });
  const [spec, setSpec]         = useState({});
  const [saved, setSaved]       = useState(false);
  const [visitId, setVisitId]   = useState(null);

  const mine     = db.patients.filter(p=>p.doctorId===d.id);
  const filtered = mine.filter(p=>p.name.toLowerCase().includes(search.toLowerCase())||p.phone.includes(search));
  const prevVisits = patient ? db.visits.filter(v=>v.patientId===patient.id).sort((a,b)=>new Date(b.date)-new Date(a.date)) : [];
  const isNew    = prevVisits.length===0;

  function saveVisit() {
    const v = { id:uid(), patientId:patient.id, patientName:patient.name, doctorId:d.id, date:new Date().toISOString(), type:"digital", visitNumber:prevVisits.length+1, synced:false, specialData:spec, ...form };
    upDB({ visits:[...db.visits,v], syncQueue:[...db.syncQueue,{type:"visit",id:v.id}] });
    setVisitId(v.id); setSaved(true);
  }

  function resetAll() { setStep("select"); setPatient(null); setSearch(""); setForm({diagnosis:"",medicines:"",investigations:"",advice:"",followUpDate:""}); setSpec({}); setSaved(false); setVisitId(null); }

  // ── Step: printable preview ──
  if (step==="preview") return (
    <div style={{ padding:"16px 16px 20px" }}>
      <Btn back onClick={()=>setStep("form")} />
      <div style={{ background:"#fefce8", border:"1.5px solid #fde047", borderRadius:14, padding:"12px 16px", marginBottom:16, fontSize:13, color:"#713f12", fontWeight:700 }}>
        📋 Review prescription below. Save first, then print.
      </div>

      {/* ── Printable area ── */}
      <div id="rx-print">
        <RxPrintout doctor={d} patient={patient} form={form} spec={spec} visitNum={prevVisits.length+1} isNew={isNew} />
      </div>
      <RxPrintout doctor={d} patient={patient} form={form} spec={spec} visitNum={prevVisits.length+1} isNew={isNew} />

      {!saved ? (
        <div style={{ display:"flex", gap:10, marginTop:16 }}>
          <button onClick={()=>window.print()} style={{ flex:1, padding:"15px", background:"#fff", border:`2px solid ${d.color}`, borderRadius:14, fontWeight:800, fontSize:15, color:d.color, cursor:"pointer", fontFamily:"'Nunito',sans-serif" }}>🖨️ Print</button>
          <button onClick={saveVisit}           style={{ flex:2, padding:"15px", background:d.color, border:"none", borderRadius:14, fontWeight:800, fontSize:15, color:"#fff", cursor:"pointer", fontFamily:"'Nunito',sans-serif", boxShadow:`0 4px 14px ${d.color}44` }}>✓ Save to Records</button>
        </div>
      ) : (
        <div style={{ marginTop:16 }}>
          <div style={{ background:"#dcfce7", border:"1.5px solid #86efac", borderRadius:14, padding:"14px 16px", textAlign:"center", fontWeight:800, color:"#166534", fontSize:15, marginBottom:12 }}>✅ Saved to {patient.name}'s record!</div>
          <div style={{ display:"flex", gap:10 }}>
            <button onClick={()=>window.print()} style={{ flex:1, padding:"13px", background:"#fff", border:"1.5px solid #e2e8f0", borderRadius:14, fontWeight:700, fontSize:14, color:"#475569", cursor:"pointer", fontFamily:"'Nunito',sans-serif" }}>🖨️ Print</button>
            <button onClick={resetAll}           style={{ flex:1, padding:"13px", background:d.color, border:"none", borderRadius:14, fontWeight:700, fontSize:14, color:"#fff", cursor:"pointer", fontFamily:"'Nunito',sans-serif" }}>New Visit</button>
          </div>
        </div>
      )}
    </div>
  );

  // ── Step: form ──
  if (step==="form") return (
    <div style={{ padding:"16px 16px 20px" }}>
      <Btn back onClick={()=>setStep("select")} />
      <div style={{ background:d.color, borderRadius:16, padding:"14px 18px", color:"#fff", marginBottom:20, display:"flex", justifyContent:"space-between", alignItems:"center" }}>
        <div>
          <div style={{ fontWeight:800, fontSize:17 }}>{patient.name}</div>
          <div style={{ opacity:.75, fontSize:12 }}>{patient.age}y · {patient.phone}</div>
        </div>
        <div style={{ background: isNew?"#22c55e":"#f4a335", borderRadius:20, padding:"5px 13px", fontSize:12, fontWeight:800 }}>
          {isNew ? "🆕 NEW" : `↩️ Visit #${prevVisits.length+1}`}
        </div>
      </div>

      {/* Last visit summary */}
      {!isNew && (()=>{ const lv=prevVisits[0]; return (
        <div style={{ background:"#f1f5f9", borderRadius:14, padding:"12px 14px", marginBottom:16, fontSize:12, color:"#475569" }}>
          <div style={{ fontWeight:800, marginBottom:4, color:"#334155" }}>📋 Last Visit — {new Date(lv.date).toLocaleDateString("en-IN")}</div>
          {lv.diagnosis && <div>🩺 {lv.diagnosis}</div>}
          {lv.medicines && <div>💊 {lv.medicines.split("\n")[0]}</div>}
          {lv.followUpDate && <div style={{ color:"#7c3aed" }}>📅 Follow-up was: {lv.followUpDate}</div>}
        </div>
      );})()}

      {patient.allergies && (
        <div style={{ background:"#fef2f2", border:"1.5px solid #fecaca", borderRadius:12, padding:"10px 14px", marginBottom:14, fontSize:13, color:"#dc2626", fontWeight:700 }}>
          ⚠️ ALLERGY ALERT: {patient.allergies}
        </div>
      )}

      {/* Specialty fields */}
      <SecTitle>🔬 {d.id==="ent"?"ENT":"Obstetric"} Details</SecTitle>
      {d.specialFields.map(f=>(
        <div key={f.key} style={{ marginBottom:13 }}>
          <label style={lbl}>{f.label}</label>
          {f.type==="select"
            ? <select value={spec[f.key]||""} onChange={e=>setSpec({...spec,[f.key]:e.target.value})} style={inp}><option value="">-- Select --</option>{f.options.map(o=><option key={o}>{o}</option>)}</select>
            : <input  value={spec[f.key]||""} onChange={e=>setSpec({...spec,[f.key]:e.target.value})} placeholder={f.placeholder} style={inp} />
          }
        </div>
      ))}

      <SecTitle>📝 Prescription</SecTitle>
      <Textarea label="Chief Complaint / Diagnosis *" value={form.diagnosis}      onChange={v=>setForm({...form,diagnosis:v})}      placeholder="e.g. Acute Otitis Media, Right ear" rows={2} />
      <Textarea label="Medicines Prescribed"          value={form.medicines}      onChange={v=>setForm({...form,medicines:v})}      placeholder={"Tab. Amoxicillin 500mg — 1-0-1 × 5 days\nSyr. Cetrizine — 5ml at night"} rows={4} />
      <Textarea label="Investigations Advised"        value={form.investigations} onChange={v=>setForm({...form,investigations:v})} placeholder="e.g. Audiometry, CBC, USG Pelvis" rows={2} />
      <Textarea label="Advice & Instructions"         value={form.advice}         onChange={v=>setForm({...form,advice:v})}         placeholder="e.g. Rest, avoid cold, warm saline gargle" rows={2} />
      <Inp      label="Follow-up Date"                value={form.followUpDate}   onChange={v=>setForm({...form,followUpDate:v})}   placeholder="e.g. After 5 days / 25 April 2026" />
      <BigBtn color={d.color} onClick={()=>{ if(!form.diagnosis.trim()){alert("Please enter at least a diagnosis.");return;} setStep("preview"); }}>Preview & Print Prescription →</BigBtn>
    </div>
  );

  // ── Step: select patient ──
  return (
    <div style={{ padding:"16px 16px 20px" }}>
      <SecTitle>✍️ New Visit</SecTitle>
      <div style={{ background:"#eff6ff", border:"1.5px solid #bfdbfe", borderRadius:14, padding:"12px 16px", marginBottom:18, fontSize:13, color:"#1d4ed8", fontWeight:600 }}>
        First, find the patient. New patient? Register them in the Patients tab first.
      </div>
      <Search value={search} onChange={setSearch} placeholder="Type name or phone number…" />
      {filtered.length===0 && (
        <div style={{ textAlign:"center", padding:"24px 0" }}>
          <Empty text="No matching patients." />
          <button onClick={()=>setScreen("patients")} style={{ marginTop:8, background:d.color, color:"#fff", border:"none", borderRadius:12, padding:"11px 20px", fontWeight:700, cursor:"pointer", fontFamily:"'Nunito',sans-serif" }}>+ Register Patient</button>
        </div>
      )}
      {filtered.map(p=>{
        const vis = db.visits.filter(v=>v.patientId===p.id);
        const lv  = vis.sort((a,b)=>new Date(b.date)-new Date(a.date))[0];
        return (
          <div key={p.id} onClick={()=>{setPatient(p);setStep("form");}} style={{ background:"#fff", border:"1.5px solid #e2e8f0", borderRadius:16, padding:"16px", marginBottom:10, cursor:"pointer" }}>
            <div style={{ display:"flex", alignItems:"center", gap:12 }}>
              <div style={{ width:48, height:48, borderRadius:14, background:d.color+"18", display:"flex", alignItems:"center", justifyContent:"center", fontWeight:900, fontSize:20, color:d.color, flexShrink:0 }}>{p.name[0]}</div>
              <div style={{ flex:1 }}>
                <div style={{ fontWeight:800, fontSize:16, color:"#1e293b" }}>{p.name}</div>
                <div style={{ fontSize:12, color:"#94a3b8" }}>{p.age}y · {p.phone}</div>
              </div>
              <div style={{ background: vis.length===0?"#dcfce7":"#fef9c3", borderRadius:20, padding:"4px 12px", fontSize:11, fontWeight:800, color: vis.length===0?"#166534":"#854d0e", flexShrink:0 }}>
                {vis.length===0 ? "🆕 New" : `↩️ ${vis.length} visit${vis.length>1?"s":""}`}
              </div>
            </div>
            {lv && <div style={{ marginTop:8, fontSize:11, color:"#94a3b8", paddingLeft:60 }}>Last: {new Date(lv.date).toLocaleDateString("en-IN")} — {lv.diagnosis}</div>}
          </div>
        );
      })}
    </div>
  );
}

// ─── RX PRINTOUT ─────────────────────────────────────────────────────────────
function RxPrintout({ doctor: d, patient, form, spec, visitNum, isNew }) {
  const hasSpec = d.specialFields.some(f=>spec[f.key]);
  return (
    <div style={{ background:"#fff", border:"2px solid #999", borderRadius:12, overflow:"hidden", fontFamily:"'Times New Roman',Times,serif" }}>
      {/* Letterhead */}
      <div style={{ borderBottom:"3px double #888", padding:"14px 20px" }}>
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start" }}>
          <div>
            <div style={{ fontSize:17, fontWeight:700, color:d.color, letterSpacing:.3 }}>{d.clinic}</div>
            <div style={{ fontSize:11, color:"#555", marginTop:2 }}>{d.address}</div>
            <div style={{ fontSize:11, color:"#555" }}>📞 {d.phone}</div>
          </div>
          <div style={{ textAlign:"right" }}>
            <div style={{ fontSize:15, fontWeight:700 }}>{d.name}</div>
            <div style={{ fontSize:11, color:"#555", fontStyle:"italic" }}>{d.qualification}</div>
            <div style={{ fontSize:10, color:"#777" }}>{d.specialty}</div>
            <div style={{ fontSize:9,  color:"#aaa", marginTop:2 }}>Reg. No: {d.regNo}</div>
          </div>
        </div>
      </div>

      {/* Patient strip */}
      <div style={{ background:"#f8f9fa", borderBottom:"1px solid #ddd", padding:"9px 20px", display:"flex", justifyContent:"space-between", flexWrap:"wrap", gap:6 }}>
        <div>
          <span style={{ fontSize:10, color:"#888", textTransform:"uppercase" }}>Patient: </span>
          <strong style={{ fontSize:14 }}>{patient?.name}</strong>
          {patient?.age && <span style={{ fontSize:12, color:"#555" }}> · {patient.age}y</span>}
          {patient?.gender && <span style={{ fontSize:12, color:"#555" }}> · {patient.gender}</span>}
          {patient?.blood && <span style={{ fontSize:11, color:"#555" }}> · {patient.blood}</span>}
        </div>
        <div style={{ textAlign:"right" }}>
          <div style={{ fontSize:10, color:"#888" }}>Date: {new Date().toLocaleDateString("en-IN",{day:"2-digit",month:"long",year:"numeric"})}</div>
          <div style={{ fontSize:10, color:"#888" }}>Visit #{visitNum} · {isNew?"New Patient":"Returning Patient"}</div>
        </div>
      </div>

      <div style={{ padding:"14px 20px" }}>
        {/* Specialty data */}
        {hasSpec && (
          <div style={{ marginBottom:12, padding:"8px 12px", background:d.colorLight, borderLeft:`3px solid ${d.color}`, borderRadius:4 }}>
            {d.specialFields.filter(f=>spec[f.key]).map(f=>(
              <div key={f.key} style={{ fontSize:12, color:"#374151", marginBottom:2 }}><strong>{f.label}:</strong> {spec[f.key]}</div>
            ))}
          </div>
        )}

        {patient?.allergies && (
          <div style={{ background:"#fff5f5", border:"1px solid #feb2b2", borderRadius:4, padding:"5px 10px", marginBottom:10, fontSize:12, color:"#c53030" }}>⚠️ <strong>Allergies:</strong> {patient.allergies}</div>
        )}

        {form.diagnosis && (
          <div style={{ marginBottom:10 }}>
            <div style={{ fontSize:12, fontWeight:700, borderBottom:"1px solid #e2e8f0", paddingBottom:3, marginBottom:5 }}>Diagnosis</div>
            <div style={{ fontSize:13 }}>{form.diagnosis}</div>
          </div>
        )}
        {form.medicines && (
          <div style={{ marginBottom:10 }}>
            <div style={{ fontSize:13, fontWeight:700, borderBottom:"1px solid #e2e8f0", paddingBottom:3, marginBottom:5 }}>℞ &nbsp;Medicines</div>
            <div style={{ whiteSpace:"pre-line", fontSize:13, lineHeight:1.9 }}>{form.medicines}</div>
          </div>
        )}
        {form.investigations && (
          <div style={{ marginBottom:10 }}>
            <div style={{ fontSize:12, fontWeight:700, borderBottom:"1px solid #e2e8f0", paddingBottom:3, marginBottom:5 }}>Investigations</div>
            <div style={{ fontSize:13, whiteSpace:"pre-line" }}>{form.investigations}</div>
          </div>
        )}
        {form.advice && (
          <div style={{ marginBottom:10 }}>
            <div style={{ fontSize:12, fontWeight:700, borderBottom:"1px solid #e2e8f0", paddingBottom:3, marginBottom:5 }}>Advice / Instructions</div>
            <div style={{ fontSize:13, whiteSpace:"pre-line" }}>{form.advice}</div>
          </div>
        )}
        {form.followUpDate && (
          <div style={{ marginTop:8, fontSize:12, fontWeight:700, color:"#5b21b6" }}>📅 Follow-up: {form.followUpDate}</div>
        )}
      </div>

      {/* Footer */}
      <div style={{ borderTop:"1px dashed #ccc", padding:"10px 20px", display:"flex", justifyContent:"space-between", alignItems:"flex-end" }}>
        <div style={{ fontSize:9, color:"#bbb" }}>Clinic Smart · {d.clinic} · {new Date().toLocaleDateString("en-IN")}</div>
        <div style={{ textAlign:"right" }}>
          <div style={{ height:38, borderBottom:"1px solid #444", width:110, marginBottom:4 }}></div>
          <div style={{ fontSize:10, color:"#555" }}>Doctor's Signature & Stamp</div>
          <div style={{ fontSize:11, fontWeight:700 }}>{d.name}</div>
        </div>
      </div>
    </div>
  );
}

// ─── SCAN ─────────────────────────────────────────────────────────────────────
function ScanScreen({ doctor: d, db, upDB }) {
  const [patient, setPatient] = useState(null);
  const [search, setSearch]   = useState("");
  const [image, setImage]     = useState(null);
  const [notes, setNotes]     = useState("");
  const [done, setDone]       = useState(false);
  const fileRef = useRef();

  const mine     = db.patients.filter(p=>p.doctorId===d.id);
  const filtered = mine.filter(p=>p.name.toLowerCase().includes(search.toLowerCase())||p.phone.includes(search));

  function handleFile(e) {
    const f=e.target.files[0]; if(!f) return;
    const r=new FileReader(); r.onload=ev=>setImage(ev.target.result); r.readAsDataURL(f);
  }
  function saveScan() {
    if(!patient||!image) return;
    const v={ id:uid(), patientId:patient.id, patientName:patient.name, doctorId:d.id, date:new Date().toISOString(), type:"scan", scanned:image, notes, synced:false, visitNumber:db.visits.filter(v=>v.patientId===patient.id).length+1 };
    upDB({ visits:[...db.visits,v], syncQueue:[...db.syncQueue,{type:"visit",id:v.id}] });
    setDone(true);
  }

  if (done) return (
    <div style={{ display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", minHeight:"60vh", padding:32, textAlign:"center" }}>
      <div style={{ fontSize:68, marginBottom:16 }}>✅</div>
      <div style={{ fontFamily:"'Libre Baskerville',serif", fontSize:22, color:"#1e293b", marginBottom:8 }}>Scan Saved!</div>
      <div style={{ color:"#64748b", fontSize:14, marginBottom:24 }}>Linked to <strong>{patient.name}</strong>'s record.</div>
      <BigBtn color={d.color} onClick={()=>{ setDone(false);setPatient(null);setImage(null);setNotes(""); }}>Scan Another</BigBtn>
    </div>
  );

  return (
    <div style={{ padding:"16px 16px 20px" }}>
      <SecTitle>📷 Scan Prescription Paper</SecTitle>
      <div style={{ background:"#eff6ff", border:"1.5px solid #bfdbfe", borderRadius:14, padding:"12px 16px", marginBottom:18, fontSize:13, color:"#1d4ed8", fontWeight:600 }}>
        Step 1 → Select patient &nbsp;|&nbsp; Step 2 → Photograph the paper prescription
      </div>

      <div style={{ fontWeight:800, color:"#475569", fontSize:12, textTransform:"uppercase", letterSpacing:1, marginBottom:8 }}>1. Select Patient</div>
      <Search value={search} onChange={setSearch} placeholder="Search patient…" />
      <div style={{ maxHeight:190, overflowY:"auto", marginBottom:20 }}>
        {filtered.map(p=>(
          <div key={p.id} onClick={()=>setPatient(p)} style={{ padding:"11px 14px", borderRadius:12, marginBottom:6, cursor:"pointer", background:patient?.id===p.id?d.color+"15":"#fff", border:`2px solid ${patient?.id===p.id?d.color:"#e2e8f0"}`, display:"flex", alignItems:"center", gap:10 }}>
            <div style={{ width:36, height:36, borderRadius:10, background:d.color+"20", display:"flex", alignItems:"center", justifyContent:"center", fontWeight:800, color:d.color, fontSize:15 }}>{p.name[0]}</div>
            <div style={{ flex:1 }}><div style={{ fontWeight:700, fontSize:14 }}>{p.name}</div><div style={{ fontSize:11, color:"#94a3b8" }}>{p.phone}</div></div>
            {patient?.id===p.id && <span style={{ color:d.color, fontSize:20 }}>✓</span>}
          </div>
        ))}
        {mine.length===0 && <Empty text="No patients registered yet." />}
      </div>

      <div style={{ fontWeight:800, color:"#475569", fontSize:12, textTransform:"uppercase", letterSpacing:1, marginBottom:12 }}>2. Capture Photo</div>
      <input ref={fileRef} type="file" accept="image/*" capture="environment" onChange={handleFile} style={{ display:"none" }} />

      {!image ? (
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12, marginBottom:16 }}>
          <button onClick={()=>patient?fileRef.current.click():alert("Please select a patient first.")} style={{ padding:"30px 12px", background:patient?"#eff6ff":"#f8fafc", border:`2.5px dashed ${patient?"#3b82f6":"#cbd5e1"}`, borderRadius:16, color:patient?"#1d4ed8":"#94a3b8", cursor:"pointer", display:"flex", flexDirection:"column", alignItems:"center", gap:10, fontFamily:"'Nunito',sans-serif", fontWeight:800, fontSize:14 }}>
            <span style={{ fontSize:38 }}>📸</span>Take Photo
          </button>
          <button onClick={()=>{ if(!patient){alert("Please select a patient first.");return;} const i=document.createElement("input");i.type="file";i.accept="image/*";i.onchange=handleFile;i.click(); }} style={{ padding:"30px 12px", background:patient?"#fefce8":"#f8fafc", border:`2.5px dashed ${patient?"#ca8a04":"#cbd5e1"}`, borderRadius:16, color:patient?"#854d0e":"#94a3b8", cursor:"pointer", display:"flex", flexDirection:"column", alignItems:"center", gap:10, fontFamily:"'Nunito',sans-serif", fontWeight:800, fontSize:14 }}>
            <span style={{ fontSize:38 }}>📁</span>Upload File
          </button>
        </div>
      ) : (
        <div style={{ marginBottom:16 }}>
          <img src={image} alt="scan" style={{ width:"100%", borderRadius:16, maxHeight:260, objectFit:"contain", background:"#f1f5f9" }} />
          <button onClick={()=>setImage(null)} style={{ marginTop:8, background:"none", border:"1.5px solid #e2e8f0", borderRadius:10, padding:"7px 14px", fontSize:12, color:"#64748b", cursor:"pointer", fontFamily:"'Nunito',sans-serif", fontWeight:700 }}>🔄 Retake</button>
        </div>
      )}

      <Textarea label="Notes (optional)" value={notes} onChange={setNotes} placeholder="Any notes to add…" rows={2} />
      <BigBtn color={d.color} onClick={saveScan} disabled={!patient||!image}>Save Scan to Record</BigBtn>
    </div>
  );
}

// ─── HISTORY ─────────────────────────────────────────────────────────────────
function HistoryScreen({ doctor: d, db }) {
  const [search, setSearch]   = useState("");
  const [filter, setFilter]   = useState("all");
  const mine = db.visits.filter(v=>v.doctorId===d.id).sort((a,b)=>new Date(b.date)-new Date(a.date));
  const filtered = mine.filter(v=>{
    const m = v.patientName?.toLowerCase().includes(search.toLowerCase())||v.diagnosis?.toLowerCase().includes(search.toLowerCase());
    if(filter==="scan")     return m && v.type==="scan";
    if(filter==="digital")  return m && v.type==="digital";
    if(filter==="followup") return m && v.followUpDate;
    return m;
  });

  return (
    <div style={{ padding:"16px 16px 20px" }}>
      <SecTitle>Visit History ({mine.length})</SecTitle>
      <Search value={search} onChange={setSearch} placeholder="Search by patient or diagnosis…" />
      <div style={{ display:"flex", gap:6, marginBottom:16, overflowX:"auto", paddingBottom:4 }}>
        {[["all","All"],["digital","Written Rx"],["scan","Scanned"],["followup","Follow-ups"]].map(([val,lbl])=>(
          <button key={val} onClick={()=>setFilter(val)} style={{ padding:"8px 14px", borderRadius:20, border:`1.5px solid ${filter===val?d.color:"#e2e8f0"}`, background:filter===val?d.color:"#fff", color:filter===val?"#fff":"#64748b", fontWeight:700, fontSize:12, cursor:"pointer", whiteSpace:"nowrap", fontFamily:"'Nunito',sans-serif" }}>{lbl}</button>
        ))}
      </div>
      {filtered.length===0 && <Empty text="No visits found." />}
      {filtered.map(v=>(
        <div key={v.id} style={{ background:"#fff", border:"1px solid #e2e8f0", borderRadius:14, padding:"14px 16px", marginBottom:10 }}>
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:6 }}>
            <div style={{ fontWeight:800, fontSize:15, color:"#1e293b" }}>{v.patientName}</div>
            <div style={{ fontSize:11, color:"#94a3b8", flexShrink:0 }}>{new Date(v.date).toLocaleDateString("en-IN",{day:"numeric",month:"short",year:"2-digit"})}</div>
          </div>
          {v.diagnosis   && <div style={{ fontSize:13, color:"#374151" }}>🩺 {v.diagnosis}</div>}
          {v.medicines   && <div style={{ fontSize:12, color:"#6b7280", marginTop:3 }}>💊 {v.medicines.split("\n")[0]}</div>}
          {v.type==="scan"&&<div style={{ fontSize:11, color:"#2563eb", marginTop:4, fontWeight:700 }}>📷 Scanned Rx</div>}
          {v.followUpDate&&<div style={{ fontSize:11, color:"#7c3aed", marginTop:4, fontWeight:700 }}>📅 Follow-up: {v.followUpDate}</div>}
          <div style={{ marginTop:6 }}><span style={{ fontSize:10, background:"#f1f5f9", borderRadius:20, padding:"2px 8px", color:"#64748b" }}>Visit #{v.visitNumber||"—"}</span></div>
        </div>
      ))}
    </div>
  );
}

// ─── BILLING ──────────────────────────────────────────────────────────────────
function BillingScreen({ doctor: d, db, upDB }) {
  const [patient, setPatient] = useState(null);
  const [search, setSearch]   = useState("");
  const [amount, setAmount]   = useState("");
  const [type, setType]       = useState("Consultation");
  const [msg, setMsg]         = useState("");

  const mine     = db.patients.filter(p=>p.doctorId===d.id);
  const filtered = mine.filter(p=>p.name.toLowerCase().includes(search.toLowerCase())||p.phone.includes(search));

  function saveBill() {
    if(!patient||!amount){ alert("Please select a patient and enter an amount."); return; }
    const b={ id:uid(), patientId:patient.id, patientName:patient.name, doctorId:d.id, date:new Date().toISOString(), amount:parseFloat(amount), type, synced:false };
    upDB({ bills:[...(db.bills||[]),b], syncQueue:[...db.syncQueue,{type:"bill",id:b.id}] });
    setMsg(`✓ ₹${amount} billed for ${patient.name}`);
    setAmount(""); setPatient(null);
    setTimeout(()=>setMsg(""),3000);
  }

  const allBills  = db.bills||[];
  const todayStr  = new Date().toDateString();
  const todayBills= allBills.filter(b=>b.doctorId===d.id&&new Date(b.date).toDateString()===todayStr);
  const todayTotal= todayBills.reduce((s,b)=>s+b.amount,0);

  return (
    <div style={{ padding:"16px 16px 20px" }}>
      <SecTitle>💰 Billing</SecTitle>
      <div style={{ background:d.color, borderRadius:18, padding:"18px 20px", color:"#fff", marginBottom:22, display:"flex", justifyContent:"space-between" }}>
        <div><div style={{ opacity:.75, fontSize:12, marginBottom:4 }}>Today's Collection</div><div style={{ fontSize:30, fontWeight:900 }}>₹{todayTotal.toLocaleString("en-IN")}</div></div>
        <div style={{ textAlign:"right" }}><div style={{ opacity:.75, fontSize:12, marginBottom:4 }}>Patients Today</div><div style={{ fontSize:30, fontWeight:900 }}>{todayBills.length}</div></div>
      </div>

      <div style={{ fontWeight:800, color:"#475569", fontSize:12, textTransform:"uppercase", letterSpacing:1, marginBottom:8 }}>Select Patient</div>
      <Search value={search} onChange={setSearch} placeholder="Search patient…" />
      <div style={{ maxHeight:180, overflowY:"auto", marginBottom:18 }}>
        {filtered.map(p=>(
          <div key={p.id} onClick={()=>setPatient(p)} style={{ padding:"11px 14px", borderRadius:12, marginBottom:6, cursor:"pointer", background:patient?.id===p.id?d.color+"15":"#fff", border:`2px solid ${patient?.id===p.id?d.color:"#e2e8f0"}`, display:"flex", alignItems:"center", gap:10 }}>
            <div style={{ flex:1 }}><div style={{ fontWeight:700, fontSize:14 }}>{p.name}</div><div style={{ fontSize:11, color:"#94a3b8" }}>{p.phone}</div></div>
            {patient?.id===p.id && <span style={{ color:d.color, fontSize:20 }}>✓</span>}
          </div>
        ))}
      </div>

      <div style={{ marginBottom:14 }}>
        <label style={lbl}>Service Type</label>
        <div style={{ display:"flex", gap:8, flexWrap:"wrap" }}>
          {["Consultation","Procedure","Follow-up","Lab Test","Other"].map(t=>(
            <button key={t} onClick={()=>setType(t)} style={{ padding:"9px 14px", borderRadius:20, border:`1.5px solid ${type===t?d.color:"#e2e8f0"}`, background:type===t?d.color+"18":"#fff", color:type===t?d.color:"#64748b", fontWeight:700, fontSize:13, cursor:"pointer", fontFamily:"'Nunito',sans-serif" }}>{t}</button>
          ))}
        </div>
      </div>

      <div style={{ marginBottom:16 }}>
        <label style={lbl}>Amount (₹)</label>
        <input value={amount} onChange={e=>setAmount(e.target.value)} type="number" placeholder="0" style={{ ...inp, fontSize:28, fontWeight:900, color:d.color, textAlign:"center" }} />
      </div>

      {msg && <Msg text={msg} ok />}
      <BigBtn color={d.color} onClick={saveBill}>Generate Bill</BigBtn>

      {todayBills.length>0 && (
        <>
          <div style={{ fontWeight:800, color:"#475569", fontSize:12, textTransform:"uppercase", letterSpacing:1, marginTop:24, marginBottom:10 }}>Today's Bills</div>
          {[...todayBills].reverse().map(b=>(
            <div key={b.id} style={{ background:"#fff", border:"1px solid #e2e8f0", borderRadius:12, padding:"12px 14px", marginBottom:8, display:"flex", justifyContent:"space-between", alignItems:"center" }}>
              <div><div style={{ fontWeight:700, fontSize:14 }}>{b.patientName}</div><div style={{ fontSize:11, color:"#94a3b8" }}>{b.type} · {new Date(b.date).toLocaleTimeString("en-IN",{hour:"2-digit",minute:"2-digit"})}</div></div>
              <div style={{ fontWeight:900, fontSize:18, color:d.color }}>₹{b.amount}</div>
            </div>
          ))}
        </>
      )}
    </div>
  );
}

// ─── SHARED ATOMS ─────────────────────────────────────────────────────────────
const lbl = { fontSize:13, fontWeight:700, color:"#475569", display:"block", marginBottom:6 };
const inp = { width:"100%", padding:"13px 14px", border:"2px solid #e2e8f0", borderRadius:12, fontSize:15, fontFamily:"'Nunito',sans-serif", color:"#1e293b", background:"#fff", boxSizing:"border-box", outline:"none" };

function SecTitle({ children, style }) {
  return <div style={{ fontFamily:"'Libre Baskerville',serif", fontSize:18, color:"#1e293b", marginBottom:14, ...style }}>{children}</div>;
}
function Label({ children, light }) {
  return <div style={{ fontSize:12, fontWeight:700, color: light ? "rgba(255,255,255,0.7)" : "#475569", marginBottom:8, textTransform:"uppercase", letterSpacing:.8 }}>{children}</div>;
}
function Inp({ label, value, onChange, placeholder, type="text", extra }) {
  return (
    <div style={{ marginBottom:14 }}>
      <label style={lbl}>{label}</label>
      <input value={value} onChange={e=>onChange(e.target.value)} type={type} placeholder={placeholder} style={inp} />
      {extra}
    </div>
  );
}
function Textarea({ label, value, onChange, placeholder, rows=3 }) {
  return (
    <div style={{ marginBottom:14 }}>
      <label style={lbl}>{label}</label>
      <textarea value={value} onChange={e=>onChange(e.target.value)} placeholder={placeholder} rows={rows} style={{ ...inp, resize:"none", lineHeight:1.65 }} />
    </div>
  );
}
function BigBtn({ color, onClick, children, disabled }) {
  return (
    <button onClick={onClick} disabled={disabled} style={{ width:"100%", padding:"16px", background:disabled?"#e2e8f0":color, color:disabled?"#94a3b8":"#fff", border:"none", borderRadius:14, fontSize:16, fontWeight:800, cursor:disabled?"not-allowed":"pointer", fontFamily:"'Nunito',sans-serif", boxShadow:disabled?"none":`0 4px 14px ${color}44`, marginTop:4 }}>
      {children}
    </button>
  );
}
function Search({ value, onChange, placeholder }) {
  return (
    <div style={{ position:"relative", marginBottom:12 }}>
      <span style={{ position:"absolute", left:13, top:"50%", transform:"translateY(-50%)", fontSize:16 }}>🔍</span>
      <input value={value} onChange={e=>onChange(e.target.value)} placeholder={placeholder} style={{ ...inp, paddingLeft:40, background:"#f8fafc" }} />
    </div>
  );
}
function Btn({ back, onClick, children }) {
  return (
    <button onClick={onClick} style={{ background:"none", border:"none", color:"#475569", fontWeight:700, cursor:"pointer", display:"flex", alignItems:"center", gap:6, marginBottom:16, fontFamily:"'Nunito',sans-serif", fontSize:14, padding:0 }}>
      {back ? "‹ Back" : children}
    </button>
  );
}
function Empty({ text }) {
  return <div style={{ textAlign:"center", color:"#94a3b8", fontSize:14, padding:"28px 0" }}>{text}</div>;
}
function Msg({ text, ok }) {
  return <div style={{ background:ok?"#dcfce7":"#fef2f2", border:`1.5px solid ${ok?"#86efac":"#fecaca"}`, borderRadius:12, padding:"12px 16px", marginBottom:14, fontWeight:700, fontSize:13, color:ok?"#166534":"#dc2626" }}>{text}</div>;
}
