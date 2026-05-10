import { useState, useEffect } from "react";

const API = "https://workm.onrender.com/api";

const STATUS_COLORS = {
  pending: "#f39c12",
  confirmed: "#27ae60",
  completed: "#3498db",
  cancelled: "#e74c3c"
};

export default function BookingsDashboard({ user, onClose }) {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchBookings = async () => {
    setLoading(true);
    try {
      const res = await fetch(API + "/get-bookings/?user_id=" + user.id + "&role=" + user.role);
      const data = await res.json();
      setBookings(data);
    } catch(e) { console.log(e); }
    setLoading(false);
  };

  useEffect(() => { fetchBookings(); }, [user]); // eslint-disable-line

  const updateStatus = async (bookingId, status) => {
    await fetch(API + "/update-booking-status/", {
      method: "POST",
      headers: {"Content-Type": "application/json"},
      body: JSON.stringify({booking_id: bookingId, status})
    });
    fetchBookings();
  };

  return (
    <div style={{position:"fixed",top:0,left:0,right:0,bottom:0,background:"rgba(0,0,0,0.6)",
      display:"flex",alignItems:"center",justifyContent:"center",zIndex:2000}}>
      <div style={{background:"white",borderRadius:20,padding:30,width:"90%",maxWidth:600,maxHeight:"90vh",overflowY:"auto"}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:20}}>
          <h2 style={{margin:0,color:"#2c3e50"}}>
            {user.role === "worker" ? "My Job Requests" : "My Bookings"}
          </h2>
          <button onClick={onClose} style={{background:"#e74c3c",color:"white",border:"none",
            padding:"8px 15px",borderRadius:10,cursor:"pointer",fontWeight:"bold"}}>✕</button>
        </div>

        {loading && <p style={{textAlign:"center",color:"#7f8c8d"}}>Loading...</p>}

        {!loading && bookings.length === 0 && (
          <div style={{textAlign:"center",padding:40,color:"#7f8c8d"}}>
            <p style={{fontSize:40}}>📋</p>
            <p>No bookings yet!</p>
          </div>
        )}

        {bookings.map(b => (
          <div key={b.id} style={{
            background:"#f8f9fa",borderRadius:12,padding:15,marginBottom:12,
            borderLeft:"4px solid " + (STATUS_COLORS[b.status] || "#ddd")
          }}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:8}}>
              <strong style={{color:"#2c3e50",fontSize:16}}>
                {user.role === "worker" ? "Customer: " + b.customer_name : "Worker: " + b.worker_name}
              </strong>
              <span style={{
                background:STATUS_COLORS[b.status],color:"white",
                padding:"3px 10px",borderRadius:20,fontSize:12,fontWeight:"bold",
                textTransform:"capitalize"
              }}>{b.status}</span>
            </div>
            <p style={{margin:"4px 0",color:"#7f8c8d",fontSize:13}}>
              📅 {b.date} • ⏱ {b.hours} hrs • 💰 ${b.total}
            </p>
            {b.recurring !== "once" && (
              <p style={{margin:"4px 0",color:"#3498db",fontSize:13}}>🔁 {b.recurring}</p>
            )}
            {b.description && (
              <p style={{margin:"4px 0",color:"#2c3e50",fontSize:13}}>📝 {b.description}</p>
            )}
            {user.role === "worker" && b.status === "pending" && (
              <div style={{display:"flex",gap:8,marginTop:10}}>
                <button onClick={() => updateStatus(b.id, "confirmed")} style={{
                  flex:1,background:"#27ae60",color:"white",border:"none",
                  padding:"8px",borderRadius:8,cursor:"pointer",fontWeight:"bold"
                }}>✓ Accept</button>
                <button onClick={() => updateStatus(b.id, "cancelled")} style={{
                  flex:1,background:"#e74c3c",color:"white",border:"none",
                  padding:"8px",borderRadius:8,cursor:"pointer",fontWeight:"bold"
                }}>✕ Decline</button>
              </div>
            )}
            {user.role === "worker" && b.status === "confirmed" && (
              <button onClick={() => updateStatus(b.id, "completed")} style={{
                width:"100%",marginTop:8,background:"#3498db",color:"white",border:"none",
                padding:"8px",borderRadius:8,cursor:"pointer",fontWeight:"bold"
              }}>Mark as Completed ✓</button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
