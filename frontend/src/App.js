import { useState, useEffect } from "react";

const API = "https://rabid-strode-disorder.ngrok-free.dev/api";

function StarRating({ rating, onRate }) {
  return (
    <div>
      {[1,2,3,4,5].map(star => (
        <span key={star} onClick={() => onRate && onRate(star)}
          style={{fontSize:24, cursor:onRate?"pointer":"default", color:star<=rating?"#f39c12":"#ddd"}}>
          ★
        </span>
      ))}
    </div>
  );
}

function WorkerCard({ worker, onClick }) {
  return (
    <div onClick={() => onClick(worker)} style={{
      background:"white", padding:24, marginBottom:16, borderRadius:16,
      cursor:"pointer", boxShadow:"0 4px 15px rgba(0,0,0,0.08)",
      display:"flex", justifyContent:"space-between", alignItems:"center"
    }}>
      <div>
        <strong style={{fontSize:18, color:"#2c3e50"}}>{worker.name}</strong>
        <p style={{margin:"5px 0", color:"#7f8c8d"}}>{worker.service_type}</p>
        <span style={{background:"#eaf4fd", color:"#3498db", padding:"3px 10px", borderRadius:20, fontSize:13, marginRight:8}}>
          📍 {worker.location}
        </span>
        <span style={{background:"#eafaf1", color:"#27ae60", padding:"3px 10px", borderRadius:20, fontSize:13}}>
          💰 ${worker.hourly_rate}/hr
        </span>
      </div>
      <div style={{textAlign:"right"}}>
        <StarRating rating={Math.round(worker.average_rating || 0)} />
        <p style={{color:"#7f8c8d", fontSize:13}}>{worker.reviews.length} reviews</p>
        <button style={{
          background:"linear-gradient(135deg,#3498db,#2980b9)", color:"white",
          border:"none", padding:"10px 20px", borderRadius:25, cursor:"pointer", fontWeight:"bold"
        }}>View & Book</button>
      </div>
    </div>
  );
}

function BookingModal({ worker, onClose, onReviewSubmit }) {
  const [tab, setTab] = useState("book");
  const [date, setDate] = useState("");
  const [hours, setHours] = useState(1);
  const [message, setMessage] = useState("");
  const [price, setPrice] = useState(worker.hourly_rate);
  const [booked, setBooked] = useState(false);
  const [chat, setChat] = useState([]);
  const [chatMsg, setChatMsg] = useState("");
  const [reviewRating, setReviewRating] = useState(0);
  const [reviewComment, setReviewComment] = useState("");
  const [reviewSubmitted, setReviewSubmitted] = useState(false);
  const total = (price * hours).toFixed(2);

  const sendMessage = () => {
    if (!chatMsg) return;
    setChat([...chat, {from:"You", text:chatMsg}]);
    setChatMsg("");
    setTimeout(() => {
      setChat(prev => [...prev, {from:worker.name, text:"Thanks! I can do it for $"+price+"/hr."}]);
    }, 1000);
  };

  const submitReview = async () => {
    await fetch(API+"/reviews/", {
      method:"POST", headers:{"Content-Type":"application/json"},
      body:JSON.stringify({worker:worker.id, reviewer:1, rating:reviewRating, comment:reviewComment})
    });
    setReviewSubmitted(true);
    onReviewSubmit();
  };

  return (
    <div style={{position:"fixed",top:0,left:0,right:0,bottom:0,background:"rgba(0,0,0,0.6)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:1000}}>
      <div style={{background:"white",borderRadius:20,padding:30,width:"90%",maxWidth:520,maxHeight:"90vh",overflowY:"auto"}}>
        <div style={{display:"flex",gap:10,marginBottom:20}}>
          {["book","chat","reviews"].map(t => (
            <button key={t} onClick={() => setTab(t)} style={{
              flex:1, padding:10, borderRadius:10, border:"none",
              background:tab===t?"linear-gradient(135deg,#3498db,#2980b9)":"#f0f0f0",
              color:tab===t?"white":"#666", cursor:"pointer", fontWeight:"bold"
            }}>{t==="book"?"📅 Book":t==="chat"?"💬 Chat":"⭐ Reviews"}</button>
          ))}
          <button onClick={onClose} style={{padding:"10px 15px",borderRadius:10,border:"none",background:"#e74c3c",color:"white",cursor:"pointer"}}>✕</button>
        </div>

        <h2 style={{margin:"0 0 5px",color:"#2c3e50"}}>{worker.name}</h2>
        <p style={{margin:"0 0 20px",color:"#7f8c8d"}}>{worker.service_type} • {worker.location}</p>

        {tab==="book" && (!booked ? (
          <>
            <label style={{fontWeight:"bold"}}>💰 Your Price ($/hr)</label>
            <input type="number" value={price} onChange={e=>setPrice(e.target.value)}
              style={{width:"100%",padding:10,borderRadius:8,border:"1px solid #ddd",marginBottom:15,boxSizing:"border-box"}}/>
            <label style={{fontWeight:"bold"}}>📅 Date</label>
            <input type="date" value={date} onChange={e=>setDate(e.target.value)}
              style={{width:"100%",padding:10,borderRadius:8,border:"1px solid #ddd",marginBottom:15,boxSizing:"border-box"}}/>
            <label style={{fontWeight:"bold"}}>⏱ Hours</label>
            <input type="number" value={hours} min={1} onChange={e=>setHours(e.target.value)}
              style={{width:"100%",padding:10,borderRadius:8,border:"1px solid #ddd",marginBottom:15,boxSizing:"border-box"}}/>
            <label style={{fontWeight:"bold"}}>📝 Job Description</label>
            <textarea value={message} onChange={e=>setMessage(e.target.value)} rows={3}
              style={{width:"100%",padding:10,borderRadius:8,border:"1px solid #ddd",marginBottom:15,boxSizing:"border-box"}}
              placeholder="Describe your job..."/>
            <div style={{background:"#eafaf1",borderRadius:12,padding:15,marginBottom:15,textAlign:"center"}}>
              <strong style={{fontSize:20,color:"#27ae60"}}>Total: ${total}</strong>
              <p style={{margin:0,fontSize:12,color:"#7f8c8d"}}>{hours} hrs x ${price}/hr</p>
            </div>
            <button onClick={()=>setBooked(true)} style={{
              width:"100%",background:"linear-gradient(135deg,#27ae60,#2ecc71)",
              color:"white",border:"none",padding:15,borderRadius:12,cursor:"pointer",fontSize:16,fontWeight:"bold"
            }}>Confirm Booking ✓</button>
          </>
        ) : (
          <div style={{textAlign:"center",padding:20}}>
            <div style={{fontSize:60}}>✅</div>
            <h2 style={{color:"#27ae60"}}>Booking Confirmed!</h2>
            <p>You booked <strong>{worker.name}</strong></p>
            <p>📅 {date} • ⏱ {hours} hrs</p>
            <p style={{fontSize:20,fontWeight:"bold",color:"#27ae60"}}>Total: ${total}</p>
            <button onClick={()=>setTab("reviews")} style={{
              background:"#f39c12",color:"white",border:"none",padding:"12px 25px",borderRadius:12,cursor:"pointer",marginRight:10
            }}>Leave a Review ⭐</button>
            <button onClick={onClose} style={{
              background:"#3498db",color:"white",border:"none",padding:"12px 25px",borderRadius:12,cursor:"pointer"
            }}>Done</button>
          </div>
        ))}

        {tab==="chat" && (
          <>
            <div style={{background:"#f8f9fa",borderRadius:12,padding:15,height:200,overflowY:"auto",marginBottom:10}}>
              {chat.length===0 && <p style={{color:"#aaa",textAlign:"center"}}>Start chatting with {worker.name}...</p>}
              {chat.map((m,i) => (
                <div key={i} style={{display:"flex",justifyContent:m.from==="You"?"flex-end":"flex-start",marginBottom:8}}>
                  <div style={{
                    background:m.from==="You"?"#3498db":"#ecf0f1",
                    color:m.from==="You"?"white":"#2c3e50",
                    padding:"8px 14px",borderRadius:18,maxWidth:"70%",fontSize:14
                  }}><strong>{m.from}:</strong> {m.text}</div>
                </div>
              ))}
            </div>
            <div style={{display:"flex",gap:8}}>
              <input value={chatMsg} onChange={e=>setChatMsg(e.target.value)}
                placeholder={"Message "+worker.name+"..."}
                style={{flex:1,padding:10,borderRadius:10,border:"1px solid #ddd"}}
                onKeyDown={e=>e.key==="Enter"&&sendMessage()}/>
              <button onClick={sendMessage} style={{
                background:"linear-gradient(135deg,#3498db,#2980b9)",color:"white",
                border:"none",padding:"10px 18px",borderRadius:10,cursor:"pointer",fontWeight:"bold"
              }}>Send</button>
            </div>
          </>
        )}

        {tab==="reviews" && (
          <>
            <h3>{worker.reviews.length} Reviews</h3>
            {worker.reviews.length===0 && <p style={{color:"#aaa"}}>No reviews yet. Be the first!</p>}
            {worker.reviews.map((r,i) => (
              <div key={i} style={{background:"#f8f9fa",borderRadius:12,padding:15,marginBottom:10}}>
                <StarRating rating={r.rating}/>
                <p style={{margin:"8px 0 0"}}>{r.comment}</p>
                <p style={{margin:"5px 0 0",color:"#aaa",fontSize:12}}>{r.created_at?.slice(0,10)}</p>
              </div>
            ))}
            <hr/>
            {!reviewSubmitted ? (
              <>
                <h3>Leave a Review</h3>
                <StarRating rating={reviewRating} onRate={setReviewRating}/>
                <textarea value={reviewComment} onChange={e=>setReviewComment(e.target.value)}
                  rows={3} placeholder="Share your experience..."
                  style={{width:"100%",padding:10,borderRadius:10,border:"1px solid #ddd",marginTop:10,boxSizing:"border-box"}}/>
                <button onClick={submitReview} disabled={!reviewRating} style={{
                  width:"100%",marginTop:10,
                  background:reviewRating?"linear-gradient(135deg,#f39c12,#e67e22)":"#ddd",
                  color:"white",border:"none",padding:12,borderRadius:12,
                  cursor:reviewRating?"pointer":"not-allowed",fontSize:15,fontWeight:"bold"
                }}>Submit Review ⭐</button>
              </>
            ) : (
              <div style={{textAlign:"center",padding:20}}>
                <div style={{fontSize:50}}>🎉</div>
                <h3 style={{color:"#27ae60"}}>Review Submitted!</h3>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

function App() {
  const [workers, setWorkers] = useState([]);
  const [selected, setSelected] = useState(null);
  const [search, setSearch] = useState("");

  const fetchWorkers = () => {
    fetch(API+"/workers/")
      .then(res=>res.json())
      .then(data=>setWorkers(data))
      .catch(err=>console.log(err));
  };

  useEffect(()=>{fetchWorkers();},[]);

  const filtered = workers.filter(w=>
    w.name.toLowerCase().includes(search.toLowerCase())||
    w.service_type.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div style={{minHeight:"100vh",background:"linear-gradient(135deg,#f5f7fa,#c3cfe2)",fontFamily:"Segoe UI,Arial,sans-serif"}}>
      <div style={{background:"linear-gradient(135deg,#2c3e50,#3498db)",padding:"30px 20px",textAlign:"center",color:"white"}}>
        <h1 style={{margin:0,fontSize:32}}>🔧 WorkerMarket</h1>
        <p style={{margin:"8px 0 0",opacity:0.85}}>Find and book trusted local service workers</p>
      </div>
      <div style={{maxWidth:800,margin:"30px auto",padding:"0 20px"}}>
        <input type="text" placeholder="🔍 Search by name or service..."
          value={search} onChange={e=>setSearch(e.target.value)}
          style={{width:"100%",padding:15,borderRadius:15,border:"none",fontSize:15,
            marginBottom:25,boxShadow:"0 4px 15px rgba(0,0,0,0.1)",boxSizing:"border-box"}}/>
        <h2 style={{color:"#2c3e50"}}>Available Workers ({filtered.length})</h2>
        {filtered.map(worker=>(
          <WorkerCard key={worker.id} worker={worker} onClick={setSelected}/>
        ))}
      </div>
      {selected && (
        <BookingModal worker={selected}
          onClose={()=>{setSelected(null);fetchWorkers();}}
          onReviewSubmit={fetchWorkers}/>
      )}
    </div>
  );
}

export default App;
