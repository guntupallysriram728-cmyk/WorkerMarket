import { useState, useEffect } from "react";

const API = "https://workm.onrender.com/api";

export default function CustomerDashboard({ user, onClose }) {
  const [bookings, setBookings] = useState([]);
  const [tab, setTab] = useState("upcoming");

  const fetchBookings = async () => {
    try {
      const res = await fetch(API + "/get-bookings/?user_id=" + user.user_id + "&role=customer");
      const data = await res.json();
      if (Array.isArray(data)) setBookings(data);
    } catch(e) { console.log(e); }
  };

  useEffect(() => { fetchBookings(); }, [user]); // eslint-disable-line

  const STATUS_COLORS = {pending:"#f39c12", confirmed:"#27ae60", completed:"#3498db", cancelled:"#e74c3c"};

  const filtered = bookings.filter(b =>
    tab==="upcoming" ? b.status==="pending" || b.status==="confirmed" :
    b.status==="completed" || b.status==="cancelled"
  );

  return (
    <div style={{position:"fixed",top:0,left:0,right:0,bottom:0,background:"rgba(0,0,0,0.7)",
      display:"flex",alignItems:"center",justifyContent:"center",zIndex:2000}}>
      <div style={{background:"white",borderRadius:20,width:"90%",maxWidth:600,maxHeight:"90vh",overflowY:"auto"}}>

        <div style={{background:"linear-gradient(135deg,#f39c12,#e67e22)",padding:"20px 25px",borderRadius:"20px 20px 0 0",color:"white"}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
            <div>
              <h2 style={{margin:0}}>My Bookings</h2>
              <p style={{margin:"4px 0 0",opacity:0.8,fontSize:14}}>Hi {user.name}! Here are your bookings.</p>
            </div>
            <button onClick={onClose} style={{background:"rgba(255,255,255,0.2)",color:"white",
              border:"none",padding:"8px 15px",borderRadius:10,cursor:"pointer",fontWeight:"bold"}}>✕ Close</button>
          </div>

          <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:10,marginTop:15}}>
            {[
              {label:"Total Bookings", value:bookings.length},
              {label:"Upcoming", value:bookings.filter(b=>b.status==="pending"||b.status==="confirmed").length},
              {label:"Completed", value:bookings.filter(b=>b.status==="completed").length},
            ].map(s => (
              <div key={s.label} style={{background:"rgba(255,255,255,0.15)",borderRadius:10,padding:"10px",textAlign:"center"}}>
                <p style={{margin:0,fontSize:20,fontWeight:"bold"}}>{s.value}</p>
                <p style={{margin:"2px 0 0",fontSize:11,opacity:0.8}}>{s.label}</p>
              </div>
            ))}
          </div>
        </div>

        <div style={{display:"flex",borderBottom:"1px solid #ddd"}}>
          {["upcoming","history"].map(t => (
            <button key={t} onClick={()=>setTab(t)} style={{
              flex:1,padding:"12px",border:"none",
              borderBottom:tab===t?"3px solid #f39c12":"3px solid transparent",
              background:"white",color:tab===t?"#f39c12":"#7f8c8d",
              cursor:"pointer",fontWeight:"bold",textTransform:"capitalize",fontSize:13
            }}>{t==="upcoming"?"📅 Upcoming":"📋 History"}</button>
          ))}
        </div>

        <div style={{padding:20}}>
          {filtered.length === 0 && (
            <div style={{textAlign:"center",padding:30,color:"#7f8c8d"}}>
              <p style={{fontSize:40}}>📭</p>
              <p>No {tab} bookings yet!</p>
            </div>
          )}

          {filtered.map(b => (
            <div key={b.id} style={{
              background:"#f8f9fa",borderRadius:12,padding:15,marginBottom:12,
              borderLeft:"4px solid "+(STATUS_COLORS[b.status]||"#ddd")
            }}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:8}}>
                <strong style={{color:"#2c3e50",fontSize:15}}>🔧 {b.worker_name}</strong>
                <span style={{background:STATUS_COLORS[b.status],color:"white",
                  padding:"3px 10px",borderRadius:20,fontSize:12,fontWeight:"bold",textTransform:"capitalize"}}>
                  {b.status}
                </span>
              </div>
              <p style={{margin:"4px 0",color:"#7f8c8d",fontSize:13}}>📅 {b.date} • ⏱ {b.hours} hrs • 💰 ${b.total}</p>
              {b.recurring !== "once" && <p style={{margin:"4px 0",color:"#3498db",fontSize:13}}>🔁 {b.recurring}</p>}
              {b.description && <p style={{margin:"4px 0",color:"#2c3e50",fontSize:13}}>📝 {b.description}</p>}
              {b.status==="pending" && (
                <div style={{background:"#fff3cd",borderRadius:8,padding:"8px 12px",marginTop:8,fontSize:13,color:"#856404"}}>
                  ⏳ Waiting for worker to accept your booking...
                </div>
              )}
              {b.status==="confirmed" && (
                <div style={{background:"#d4edda",borderRadius:8,padding:"8px 12px",marginTop:8,fontSize:13,color:"#155724"}}>
                  ✅ Worker accepted! They will contact you soon.
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
