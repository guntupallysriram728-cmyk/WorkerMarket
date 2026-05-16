import { useState, useEffect } from "react";

const API = "https://workm.onrender.com/api";

export default function WorkerDashboard({ user, onClose }) {
  const [bookings, setBookings] = useState([]);
  const [stats, setStats] = useState({total:0, pending:0, confirmed:0, completed:0, earnings:0});
  const [tab, setTab] = useState("requests");

  const fetchBookings = async () => {
    try {
      const res = await fetch(API + "/get-bookings/?user_id=" + user.user_id + "&role=worker");
      const data = await res.json();
      if (Array.isArray(data)) {
        setBookings(data);
        setStats({
          total: data.length,
          pending: data.filter(b=>b.status==="pending").length,
          confirmed: data.filter(b=>b.status==="confirmed").length,
          completed: data.filter(b=>b.status==="completed").length,
          earnings: data.filter(b=>b.status==="completed").reduce((sum,b)=>sum+parseFloat(b.total),0)
        });
      }
    } catch(e) { console.log(e); }
  };

  useEffect(() => { fetchBookings(); }, [user]); // eslint-disable-line

  const updateStatus = async (bookingId, status) => {
    await fetch(API + "/update-booking-status/", {
      method:"POST", headers:{"Content-Type":"application/json"},
      body:JSON.stringify({booking_id:bookingId, status})
    });
    fetchBookings();
  };

  const STATUS_COLORS = {pending:"#f39c12", confirmed:"#27ae60", completed:"#3498db", cancelled:"#e74c3c"};

  return (
    <div style={{position:"fixed",top:0,left:0,right:0,bottom:0,background:"rgba(0,0,0,0.7)",
      display:"flex",alignItems:"center",justifyContent:"center",zIndex:2000}}>
      <div style={{background:"white",borderRadius:20,width:"90%",maxWidth:650,maxHeight:"90vh",overflowY:"auto"}}>
        
        <div style={{background:"linear-gradient(135deg,#2c3e50,#3498db)",padding:"20px 25px",borderRadius:"20px 20px 0 0",color:"white"}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
            <div>
              <h2 style={{margin:0}}>Worker Dashboard</h2>
              <p style={{margin:"4px 0 0",opacity:0.8,fontSize:14}}>Welcome back, {user.name}!</p>
            </div>
            <button onClick={onClose} style={{background:"rgba(255,255,255,0.2)",color:"white",
              border:"none",padding:"8px 15px",borderRadius:10,cursor:"pointer",fontWeight:"bold"}}>✕ Close</button>
          </div>
          
          <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:10,marginTop:15}}>
            {[
              {label:"Total Jobs", value:stats.total, color:"#3498db"},
              {label:"Pending", value:stats.pending, color:"#f39c12"},
              {label:"Active", value:stats.confirmed, color:"#27ae60"},
              {label:"Earnings", value:"$"+stats.earnings.toFixed(0), color:"#9b59b6"},
            ].map(s => (
              <div key={s.label} style={{background:"rgba(255,255,255,0.15)",borderRadius:10,padding:"10px",textAlign:"center"}}>
                <p style={{margin:0,fontSize:20,fontWeight:"bold"}}>{s.value}</p>
                <p style={{margin:"2px 0 0",fontSize:11,opacity:0.8}}>{s.label}</p>
              </div>
            ))}
          </div>
        </div>

        <div style={{display:"flex",gap:0,borderBottom:"1px solid #ddd"}}>
          {["requests","active","completed"].map(t => (
            <button key={t} onClick={()=>setTab(t)} style={{
              flex:1,padding:"12px",border:"none",borderBottom:tab===t?"3px solid #3498db":"3px solid transparent",
              background:"white",color:tab===t?"#3498db":"#7f8c8d",cursor:"pointer",fontWeight:"bold",
              textTransform:"capitalize",fontSize:13
            }}>{t==="requests"?"📋 Requests":t==="active"?"🔨 Active":"✅ Completed"}</button>
          ))}
        </div>

        <div style={{padding:20}}>
          {bookings.filter(b => 
            tab==="requests" ? b.status==="pending" :
            tab==="active" ? b.status==="confirmed" :
            b.status==="completed" || b.status==="cancelled"
          ).length === 0 && (
            <div style={{textAlign:"center",padding:30,color:"#7f8c8d"}}>
              <p style={{fontSize:40}}>📭</p>
              <p>No {tab} jobs yet!</p>
            </div>
          )}

          {bookings.filter(b =>
            tab==="requests" ? b.status==="pending" :
            tab==="active" ? b.status==="confirmed" :
            b.status==="completed" || b.status==="cancelled"
          ).map(b => (
            <div key={b.id} style={{
              background:"#f8f9fa",borderRadius:12,padding:15,marginBottom:12,
              borderLeft:"4px solid "+(STATUS_COLORS[b.status]||"#ddd")
            }}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:8}}>
                <strong style={{color:"#2c3e50",fontSize:15}}>👤 {b.customer_name}</strong>
                <span style={{background:STATUS_COLORS[b.status],color:"white",
                  padding:"3px 10px",borderRadius:20,fontSize:12,fontWeight:"bold",textTransform:"capitalize"}}>
                  {b.status}
                </span>
              </div>
              <p style={{margin:"4px 0",color:"#7f8c8d",fontSize:13}}>📅 {b.date} • ⏱ {b.hours} hrs • 💰 ${b.total}</p>
              {b.recurring !== "once" && <p style={{margin:"4px 0",color:"#3498db",fontSize:13}}>🔁 {b.recurring}</p>}
              {b.description && <p style={{margin:"4px 0",color:"#2c3e50",fontSize:13}}>📝 {b.description}</p>}
              
              {b.status==="pending" && (
                <div style={{display:"flex",gap:8,marginTop:10}}>
                  <button onClick={()=>updateStatus(b.id,"confirmed")} style={{
                    flex:1,background:"linear-gradient(135deg,#27ae60,#2ecc71)",color:"white",
                    border:"none",padding:"10px",borderRadius:8,cursor:"pointer",fontWeight:"bold"}}>
                    ✓ Accept Job
                  </button>
                  <button onClick={()=>updateStatus(b.id,"cancelled")} style={{
                    flex:1,background:"#e74c3c",color:"white",
                    border:"none",padding:"10px",borderRadius:8,cursor:"pointer",fontWeight:"bold"}}>
                    ✕ Decline
                  </button>
                </div>
              )}
              {b.status==="confirmed" && (
                <button onClick={()=>updateStatus(b.id,"completed")} style={{
                  width:"100%",marginTop:8,background:"#3498db",color:"white",
                  border:"none",padding:"10px",borderRadius:8,cursor:"pointer",fontWeight:"bold"}}>
                  ✓ Mark as Completed
                </button>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
