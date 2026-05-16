import { useState, useEffect } from "react";
import AIJobMatcher from "./AIJobMatcher";
import BookingsDashboard from "./BookingsDashboard";
import WorkerDashboard from "./WorkerDashboard";
import CustomerDashboard from "./CustomerDashboard";
import VideoCall from "./VideoCall";
import AvailabilityCalendar from "./AvailabilityCalendar";

const API = "https://workm.onrender.com/api";

function StarRating({ rating, onRate }) {
  return (
    <div>
      {[1,2,3,4,5].map(star => (
        <span key={star} onClick={() => onRate && onRate(star)}
          style={{fontSize:24, cursor:onRate?"pointer":"default", color:star<=rating?"#f39c12":"#ddd"}}>★</span>
      ))}
    </div>
  );
}

function Modal({ onClose, children }) {
  return (
    <div style={{position:"fixed",top:0,left:0,right:0,bottom:0,background:"rgba(0,0,0,0.6)",
      display:"flex",alignItems:"center",justifyContent:"center",zIndex:2000}}>
      <div style={{background:"white",borderRadius:20,padding:30,width:"90%",maxWidth:480,maxHeight:"90vh",overflowY:"auto",boxShadow:"0 20px 60px rgba(0,0,0,0.3)"}}>
        {children}
      </div>
    </div>
  );
}

function Input({ label, name, type="text", value, onChange, placeholder }) {
  return (
    <div style={{marginBottom:12}}>
      <label style={{fontWeight:"bold",color:"#2c3e50",display:"block",marginBottom:4}}>{label}</label>
      <input name={name} type={type} value={value} onChange={onChange} placeholder={placeholder}
        style={{width:"100%",padding:10,borderRadius:8,border:"1px solid #ddd",boxSizing:"border-box",fontSize:14}}/>
    </div>
  );
}

function AuthButtons({ onLogin, onWorkerSignup, onCustomerSignup }) {
  return (
    <div style={{display:"flex",gap:10}}>
      <button onClick={onLogin} style={{background:"rgba(255,255,255,0.2)",color:"white",
        border:"1px solid rgba(255,255,255,0.4)",padding:"8px 16px",borderRadius:10,cursor:"pointer",fontWeight:"bold"}}>
        Login
      </button>
      <button onClick={onCustomerSignup} style={{background:"#f39c12",color:"white",
        border:"none",padding:"8px 16px",borderRadius:10,cursor:"pointer",fontWeight:"bold"}}>
        Sign Up
      </button>
      <button onClick={onWorkerSignup} style={{background:"#27ae60",color:"white",
        border:"none",padding:"8px 16px",borderRadius:10,cursor:"pointer",fontWeight:"bold"}}>
        Join as Worker
      </button>
    </div>
  );
}

function LoginModal({ onClose, onSuccess }) {
  const [form, setForm] = useState({username:"", password:""});
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const handle = e => setForm({...form, [e.target.name]: e.target.value});
  const submit = async () => {
    setLoading(true); setError("");
    try {
      const r = await fetch(API+"/login/", {method:"POST", headers:{"Content-Type":"application/json"}, body:JSON.stringify(form)});
      const data = await r.json();
      if (r.ok) { onSuccess(data); onClose(); }
      else setError(data.error || "Login failed");
    } catch(e) { setError("Network error — make sure server is running"); }
    setLoading(false);
  };
  return (
    <Modal onClose={onClose}>
      <h2 style={{color:"#2c3e50",margin:"0 0 5px"}}>👋 Welcome Back</h2>
      <p style={{color:"#7f8c8d",margin:"0 0 20px"}}>Login to your account</p>
      {error && <div style={{color:"#e74c3c",background:"#fdf0f0",padding:10,borderRadius:8,marginBottom:12}}>{error}</div>}
      <Input label="Username" name="username" value={form.username} onChange={handle}/>
      <Input label="Password" name="password" type="password" value={form.password} onChange={handle}/>
      <div style={{display:"flex",gap:10,marginTop:15}}>
        <button onClick={submit} disabled={loading} style={{flex:1,background:"linear-gradient(135deg,#3498db,#2980b9)",
          color:"white",border:"none",padding:12,borderRadius:12,cursor:"pointer",fontSize:15,fontWeight:"bold"}}>
          {loading?"Logging in...":"Login"}
        </button>
        <button onClick={onClose} style={{flex:1,background:"#ecf0f1",color:"#666",border:"none",
          padding:12,borderRadius:12,cursor:"pointer",fontSize:15}}>Cancel</button>
      </div>
    </Modal>
  );
}

function CustomerSignupModal({ onClose, onSuccess }) {
  const [form, setForm] = useState({username:"", password:"", first_name:"", last_name:"", email:""});
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const handle = e => setForm({...form, [e.target.name]: e.target.value});
  const submit = async () => {
    setLoading(true); setError("");
    try {
      const r = await fetch(API+"/register-customer/", {method:"POST", headers:{"Content-Type":"application/json"}, body:JSON.stringify(form)});
      const data = await r.json();
      if (r.ok) { onSuccess(data); onClose(); }
      else setError(data.error || "Signup failed");
    } catch(e) { setError("Network error — make sure server is running"); }
    setLoading(false);
  };
  return (
    <Modal onClose={onClose}>
      <h2 style={{color:"#2c3e50",margin:"0 0 5px"}}>🙋 Create Account</h2>
      <p style={{color:"#7f8c8d",margin:"0 0 20px"}}>Sign up to book workers</p>
      {error && <div style={{color:"#e74c3c",background:"#fdf0f0",padding:10,borderRadius:8,marginBottom:12}}>{error}</div>}
      <Input label="First Name" name="first_name" value={form.first_name} onChange={handle}/>
      <Input label="Last Name" name="last_name" value={form.last_name} onChange={handle}/>
      <Input label="Email" name="email" type="email" value={form.email} onChange={handle}/>
      <Input label="Username" name="username" value={form.username} onChange={handle}/>
      <Input label="Password" name="password" type="password" value={form.password} onChange={handle}/>
      <div style={{display:"flex",gap:10,marginTop:15}}>
        <button onClick={submit} disabled={loading} style={{flex:1,background:"linear-gradient(135deg,#f39c12,#e67e22)",
          color:"white",border:"none",padding:12,borderRadius:12,cursor:"pointer",fontSize:15,fontWeight:"bold"}}>
          {loading?"Creating...":"Create Account"}
        </button>
        <button onClick={onClose} style={{flex:1,background:"#ecf0f1",color:"#666",border:"none",
          padding:12,borderRadius:12,cursor:"pointer",fontSize:15}}>Cancel</button>
      </div>
    </Modal>
  );
}

function WorkerSignupModal({ onClose, onSuccess }) {
  const [form, setForm] = useState({username:"", password:"", name:"", service_type:"", location:"", hourly_rate:"", phone:"", bio:""});
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const services = ["Plumbing","Electrical","Lawn Mowing","TV Repair","Carpentry","Painting","Cleaning","AC Repair","Mobile Repair","Other"];
  const handle = e => setForm({...form, [e.target.name]: e.target.value});
  const submit = async () => {
    setLoading(true); setError("");
    try {
      const r = await fetch(API+"/register-worker/", {method:"POST", headers:{"Content-Type":"application/json"}, body:JSON.stringify(form)});
      const data = await r.json();
      if (r.ok) { onSuccess(data); onClose(); }
      else setError(data.error || "Registration failed");
    } catch(e) { setError("Network error — make sure server is running"); }
    setLoading(false);
  };
  return (
    <Modal onClose={onClose}>
      <h2 style={{color:"#2c3e50",margin:"0 0 5px"}}>🔧 Join as a Worker</h2>
      <p style={{color:"#7f8c8d",margin:"0 0 20px"}}>Create your worker profile</p>
      {error && <div style={{color:"#e74c3c",background:"#fdf0f0",padding:10,borderRadius:8,marginBottom:12}}>{error}</div>}
      <Input label="Full Name" name="name" value={form.name} onChange={handle}/>
      <Input label="Username" name="username" value={form.username} onChange={handle}/>
      <Input label="Password" name="password" type="password" value={form.password} onChange={handle}/>
      <Input label="Location" name="location" value={form.location} onChange={handle} placeholder="City, State"/>
      <Input label="Hourly Rate ($)" name="hourly_rate" type="number" value={form.hourly_rate} onChange={handle}/>
      <Input label="Phone" name="phone" value={form.phone} onChange={handle}/>
      <div style={{marginBottom:12}}>
        <label style={{fontWeight:"bold",color:"#2c3e50",display:"block",marginBottom:4}}>Service Type</label>
        <select name="service_type" value={form.service_type} onChange={handle}
          style={{width:"100%",padding:10,borderRadius:8,border:"1px solid #ddd",boxSizing:"border-box",fontSize:14}}>
          <option value="">Select a service...</option>
          {services.map(s => <option key={s} value={s}>{s}</option>)}
        </select>
      </div>
      <div style={{marginBottom:15}}>
        <label style={{fontWeight:"bold",color:"#2c3e50",display:"block",marginBottom:4}}>Bio</label>
        <textarea name="bio" value={form.bio} onChange={handle} rows={3} placeholder="Tell customers about yourself..."
          style={{width:"100%",padding:10,borderRadius:8,border:"1px solid #ddd",boxSizing:"border-box",fontSize:14}}/>
      </div>
      <div style={{display:"flex",gap:10}}>
        <button onClick={submit} disabled={loading} style={{flex:1,background:"linear-gradient(135deg,#27ae60,#2ecc71)",
          color:"white",border:"none",padding:12,borderRadius:12,cursor:"pointer",fontSize:15,fontWeight:"bold"}}>
          {loading?"Registering...":"Register ✓"}
        </button>
        <button onClick={onClose} style={{flex:1,background:"#ecf0f1",color:"#666",border:"none",
          padding:12,borderRadius:12,cursor:"pointer",fontSize:15}}>Cancel</button>
      </div>
    </Modal>
  );
}

function WorkerCard({ worker, onClick }) {
  return (
    <div onClick={() => onClick(worker)} style={{
      background:"white", padding:24, marginBottom:16, borderRadius:16,
      cursor:"pointer", boxShadow:"0 4px 15px rgba(0,0,0,0.08)",
      display:"flex", justifyContent:"space-between", alignItems:"center",
      transition:"transform 0.2s, box-shadow 0.2s"
    }}
    onMouseOver={e=>{e.currentTarget.style.transform="translateY(-3px)";e.currentTarget.style.boxShadow="0 8px 25px rgba(0,0,0,0.15)"}}
    onMouseOut={e=>{e.currentTarget.style.transform="translateY(0)";e.currentTarget.style.boxShadow="0 4px 15px rgba(0,0,0,0.08)"}}>
      <div>
        <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:8}}>
          <div style={{width:45,height:45,borderRadius:"50%",background:"linear-gradient(135deg,#3498db,#2ecc71)",
            display:"flex",alignItems:"center",justifyContent:"center",color:"white",fontSize:18,fontWeight:"bold"}}>
            {worker.name[0]}
          </div>
          <div>
            <strong style={{fontSize:18,color:"#2c3e50"}}>{worker.name}</strong>
            <p style={{margin:0,color:"#7f8c8d",fontSize:13}}>{worker.service_type}</p>
          </div>
        </div>
        <div style={{marginLeft:57}}>
          <span style={{background:"#eaf4fd",color:"#3498db",padding:"3px 10px",borderRadius:20,fontSize:13,marginRight:8}}>📍 {worker.location}</span>
          <span style={{background:"#eafaf1",color:"#27ae60",padding:"3px 10px",borderRadius:20,fontSize:13}}>💰 ${worker.hourly_rate}/hr</span>
          {worker.offers_guarantee && (
            <span style={{background:"#fdf3cd",color:"#856404",padding:"3px 10px",borderRadius:20,fontSize:13,marginLeft:8}}>🛡️ {worker.guarantee_percentage}% Guarantee</span>
          )}
        </div>
      </div>
      <div style={{textAlign:"right"}}>
        <StarRating rating={Math.round(worker.average_rating || 0)}/>
        <p style={{color:"#7f8c8d",fontSize:13,margin:"4px 0 8px"}}>{worker.reviews.length} review{worker.reviews.length!==1?"s":""}</p>
        <button style={{background:"linear-gradient(135deg,#3498db,#2980b9)",color:"white",
          border:"none",padding:"10px 20px",borderRadius:25,cursor:"pointer",fontWeight:"bold",fontSize:13}}>
          View & Book
        </button>
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
  const [recurring, setRecurring] = useState("once");
  const discount = recurring==="weekly"?0.10:recurring==="biweekly"?0.07:recurring==="monthly"?0.05:0;
  const total = ((price * hours) * (1 - discount)).toFixed(2);
  const sendMessage = () => {
    if (!chatMsg) return;
    setChat([...chat, {from:"You", text:chatMsg}]);
    setChatMsg("");
    setTimeout(() => setChat(prev => [...prev, {from:worker.name, text:"Thanks! I can do it for $"+price+"/hr. When works for you?"}]), 1000);
  };
  const submitReview = async () => {
    await fetch(API+"/reviews/", {method:"POST", headers:{"Content-Type":"application/json"},
      body:JSON.stringify({worker:worker.id, reviewer:1, rating:reviewRating, comment:reviewComment})});
    setReviewSubmitted(true); onReviewSubmit();
  };
  return (
    <div style={{position:"fixed",top:0,left:0,right:0,bottom:0,background:"rgba(0,0,0,0.6)",
      display:"flex",alignItems:"center",justifyContent:"center",zIndex:1000}}>
      <div style={{background:"white",borderRadius:20,padding:30,width:"90%",maxWidth:520,maxHeight:"90vh",overflowY:"auto",boxShadow:"0 20px 60px rgba(0,0,0,0.3)"}}>
        <div style={{display:"flex",gap:8,marginBottom:20}}>
          {["book","chat","reviews","availability","video"].map(t => (
            <button key={t} onClick={()=>setTab(t)} style={{flex:1,padding:10,borderRadius:10,border:"none",
              background:tab===t?"linear-gradient(135deg,#3498db,#2980b9)":"#f0f0f0",
              color:tab===t?"white":"#666",cursor:"pointer",fontWeight:"bold",fontSize:13}}>
              {t==="book"?"📅 Book":t==="chat"?"💬 Chat":t==="availability" ? "📅 Schedule" : t==="video" ? "📹 Video" : "⭐ Reviews"}
            </button>
          ))}
          <button onClick={onClose} style={{padding:"10px 15px",borderRadius:10,border:"none",
            background:"#e74c3c",color:"white",cursor:"pointer",fontWeight:"bold"}}>✕</button>
        </div>
        <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:20}}>
          <div style={{width:50,height:50,borderRadius:"50%",background:"linear-gradient(135deg,#3498db,#2ecc71)",
            display:"flex",alignItems:"center",justifyContent:"center",color:"white",fontSize:20,fontWeight:"bold"}}>
            {worker.name[0]}
          </div>
          <div>
            <h2 style={{margin:0,color:"#2c3e50"}}>{worker.name}</h2>
            <p style={{margin:0,color:"#7f8c8d",fontSize:13}}>{worker.service_type} • {worker.location}</p>
          {worker.offers_guarantee && (
            <div style={{background:"#fdf3cd",borderRadius:8,padding:"6px 12px",marginTop:8,fontSize:13,color:"#856404"}}>
              🛡️ This worker offers a <strong>{worker.guarantee_percentage}% satisfaction guarantee</strong>. Not happy? Get a partial refund!
            </div>
          )}
          </div>
        </div>
        {tab==="book" && (!booked ? (
          <>
            <Input label="💰 Your Price ($/hr)" name="price" type="number" value={price} onChange={e=>setPrice(e.target.value)}/>
            <p style={{color:"#7f8c8d",fontSize:12,marginTop:-8,marginBottom:12}}>Standard rate: ${worker.hourly_rate}/hr</p>
            <Input label="📅 Date" name="date" type="date" value={date} onChange={e=>setDate(e.target.value)}/>
            <Input label="⏱ Hours Needed" name="hours" type="number" value={hours} onChange={e=>setHours(e.target.value)}/>
            <div style={{marginBottom:12}}>
              <label style={{fontWeight:"bold",color:"#2c3e50",display:"block",marginBottom:4}}>🔁 Recurring Booking</label>
            <select value={recurring} onChange={e=>setRecurring(e.target.value)} style={{width:"100%",padding:10,borderRadius:8,border:"1px solid #ddd",marginBottom:15,boxSizing:"border-box"}}>
              <option value="once">One time only</option>
              <option value="weekly">Weekly (save 10%)</option>
              <option value="biweekly">Every 2 weeks (save 7%)</option>
              <option value="monthly">Monthly (save 5%)</option>
            </select>
            <label style={{fontWeight:"bold",color:"#2c3e50",display:"block",marginBottom:4}}>📝 Job Description</label>
              <textarea value={message} onChange={e=>setMessage(e.target.value)} rows={3} placeholder="Describe what you need..."
                style={{width:"100%",padding:10,borderRadius:8,border:"1px solid #ddd",boxSizing:"border-box",fontSize:14}}/>
            </div>
            <div style={{background:"linear-gradient(135deg,#eafaf1,#d5f5e3)",borderRadius:12,padding:15,marginBottom:15,textAlign:"center"}}>
              <strong style={{fontSize:22,color:"#27ae60"}}>Total: ${total}</strong>
              <p style={{margin:"4px 0 0",fontSize:12,color:"#7f8c8d"}}>{hours} hrs × ${price}/hr</p>
            </div>
            <button onClick={async()=>{
              setBooked(true);
              try {
                await fetch("https://workm.onrender.com/api/create-booking/", {
                  method:"POST",
                  headers:{"Content-Type":"application/json"},
                  body:JSON.stringify({
                    worker_id:worker.id,
                    customer_id:1,
                    date:date,
                    hours:hours,
                    price_per_hour:price,
                    total:total,
                    description:message,
                    recurring:recurring
                  })
                });
              } catch(e) { console.log(e); }
            }} style={{width:"100%",background:"linear-gradient(135deg,#27ae60,#2ecc71)",
              color:"white",border:"none",padding:15,borderRadius:12,cursor:"pointer",fontSize:16,fontWeight:"bold"}}>
              Confirm Booking ✓
            </button>
          </>
        ) : (
          <div style={{textAlign:"center",padding:20}}>
            <div style={{fontSize:60}}>✅</div>
            <h2 style={{color:"#27ae60"}}>Booking Confirmed!</h2>
            <p>You booked <strong>{worker.name}</strong></p>
            <p>📅 {date} • ⏱ {hours} hrs</p>
            <p style={{fontSize:22,fontWeight:"bold",color:"#27ae60"}}>Total: ${total}</p>
            <p style={{color:"#7f8c8d",fontSize:13}}>Worker will contact you soon!</p>
            <button onClick={()=>setTab("reviews")} style={{background:"#f39c12",color:"white",border:"none",
              padding:"12px 25px",borderRadius:12,cursor:"pointer",marginRight:10,fontWeight:"bold"}}>
              Leave a Review ⭐
            </button>
            <button onClick={onClose} style={{background:"#3498db",color:"white",border:"none",
              padding:"12px 25px",borderRadius:12,cursor:"pointer",fontWeight:"bold"}}>Done</button>
          </div>
        ))}
        {tab==="chat" && (
          <>
            <div style={{background:"#f8f9fa",borderRadius:12,padding:15,height:220,overflowY:"auto",marginBottom:12}}>
              {chat.length===0 && <p style={{color:"#aaa",textAlign:"center",marginTop:80}}>Start chatting with {worker.name}...</p>}
              {chat.map((m,i) => (
                <div key={i} style={{display:"flex",justifyContent:m.from==="You"?"flex-end":"flex-start",marginBottom:8}}>
                  <div style={{background:m.from==="You"?"linear-gradient(135deg,#3498db,#2980b9)":"#ecf0f1",
                    color:m.from==="You"?"white":"#2c3e50",padding:"8px 14px",borderRadius:18,maxWidth:"70%",fontSize:14}}>
                    <strong>{m.from}:</strong> {m.text}
                  </div>
                </div>
              ))}
            </div>
            <div style={{display:"flex",gap:8}}>
              <input value={chatMsg} onChange={e=>setChatMsg(e.target.value)}
                placeholder={"Message "+worker.name+"..."}
                style={{flex:1,padding:10,borderRadius:10,border:"1px solid #ddd",fontSize:14}}
                onKeyDown={e=>e.key==="Enter"&&sendMessage()}/>
              <button onClick={sendMessage} style={{background:"linear-gradient(135deg,#3498db,#2980b9)",
                color:"white",border:"none",padding:"10px 18px",borderRadius:10,cursor:"pointer",fontWeight:"bold"}}>Send</button>
            </div>
          </>
        )}
        {tab==="video" && (
        <VideoCall worker={worker} onClose={onClose}/>
      )}
      {tab==="availability" && (
        <AvailabilityCalendar worker={worker} isOwner={false}/>
      )}
      {tab==="reviews" && (
          <>
            <h3 style={{color:"#2c3e50"}}>{worker.reviews.length} Review{worker.reviews.length!==1?"s":""}</h3>
            {worker.reviews.length===0 && <p style={{color:"#aaa"}}>No reviews yet. Be the first!</p>}
            {worker.reviews.map((r,i) => (
              <div key={i} style={{background:"#f8f9fa",borderRadius:12,padding:15,marginBottom:10}}>
                <StarRating rating={r.rating}/>
                <p style={{margin:"8px 0 0",color:"#2c3e50"}}>{r.comment}</p>
                <p style={{margin:"5px 0 0",color:"#aaa",fontSize:12}}>{r.created_at?.slice(0,10)}</p>
              </div>
            ))}
            <hr style={{margin:"20px 0"}}/>
            {!reviewSubmitted ? (
              <>
                <h3 style={{color:"#2c3e50"}}>Leave a Review</h3>
                <StarRating rating={reviewRating} onRate={setReviewRating}/>
                <textarea value={reviewComment} onChange={e=>setReviewComment(e.target.value)}
                  rows={3} placeholder="Share your experience..."
                  style={{width:"100%",padding:10,borderRadius:10,border:"1px solid #ddd",marginTop:10,boxSizing:"border-box",fontSize:14}}/>
                <button onClick={submitReview} disabled={!reviewRating} style={{
                  width:"100%",marginTop:10,
                  background:reviewRating?"linear-gradient(135deg,#f39c12,#e67e22)":"#ddd",
                  color:"white",border:"none",padding:12,borderRadius:12,
                  cursor:reviewRating?"pointer":"not-allowed",fontSize:15,fontWeight:"bold"}}>
                  Submit Review ⭐
                </button>
              </>
            ) : (
              <div style={{textAlign:"center",padding:20}}>
                <div style={{fontSize:50}}>🎉</div>
                <h3 style={{color:"#27ae60"}}>Review Submitted! Thank you!</h3>
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
  const [showLogin, setShowLogin] = useState(false);
  const [showWorkerSignup, setShowWorkerSignup] = useState(false);
  const [showBookings, setShowBookings] = useState(false);
  const [showCustomerSignup, setShowCustomerSignup] = useState(false);
  const [user, setUser] = useState(null);

  const fetchWorkers = () => {
    fetch(API+"/workers/").then(res=>res.json()).then(data=>setWorkers(data)).catch(err=>console.log(err));
  };

  useEffect(()=>{fetchWorkers();},[]);

  const filtered = workers.filter(w=>
    w.name.toLowerCase().includes(search.toLowerCase())||
    w.service_type.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div style={{minHeight:"100vh",background:"linear-gradient(135deg,#f5f7fa,#c3cfe2)",fontFamily:"Segoe UI,Arial,sans-serif"}}>
      <div style={{background:"linear-gradient(135deg,#2c3e50,#3498db)",padding:"20px",color:"white",boxShadow:"0 4px 15px rgba(0,0,0,0.2)"}}>
        <div style={{maxWidth:800,margin:"0 auto",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
          <div>
            <h1 style={{margin:0,fontSize:28}}>🔧 WorkerMarket</h1>
            <p style={{margin:"4px 0 0",opacity:0.85,fontSize:13}}>Find and book trusted local service workers</p>
          </div>
          {user ? (
            <div style={{textAlign:"right"}}>
              <p style={{margin:0,fontSize:14}}>👋 Hi, {user.name}!</p>
              <p style={{margin:"2px 0 0",fontSize:12,opacity:0.8}}>{user.role==="worker"?"Worker Account":"Customer Account"}</p>
              <div style={{display:"flex",gap:6,marginTop:4}}>
                <button onClick={()=>setShowBookings(true)} style={{background:"#f39c12",color:"white",border:"none",padding:"4px 12px",borderRadius:8,cursor:"pointer",fontSize:12,fontWeight:"bold"}}>📋 Bookings</button>
                <button onClick={()=>setUser(null)} style={{background:"rgba(255,255,255,0.2)",color:"white",border:"none",padding:"4px 12px",borderRadius:8,cursor:"pointer",fontSize:12}}>Logout</button>
              </div>
            </div>
          ) : (
            <AuthButtons
              onLogin={()=>setShowLogin(true)}
              onWorkerSignup={()=>setShowWorkerSignup(true)}
              onCustomerSignup={()=>setShowCustomerSignup(true)}
            />
          )}
        </div>
      </div>

      <div style={{maxWidth:800,margin:"30px auto",padding:"0 20px"}}>
        <input type="text" placeholder="🔍 Search by name or service type..."
          value={search} onChange={e=>setSearch(e.target.value)}
          style={{width:"100%",padding:15,borderRadius:15,border:"none",fontSize:15,
            marginBottom:25,boxShadow:"0 4px 15px rgba(0,0,0,0.1)",boxSizing:"border-box"}}/>
        <AIJobMatcher workers={workers} onSelectWorker={setSelected}/>
        <h2 style={{color:"#2c3e50",marginBottom:15}}>Available Workers ({filtered.length})</h2>
        {filtered.length===0 && search && (
          <div style={{textAlign:"center",padding:40,color:"#7f8c8d"}}>
            <p style={{fontSize:40}}>🔍</p>
            <p>No workers found for "{search}"</p>
          </div>
        )}
        {filtered.map(worker=>(
          <WorkerCard key={worker.id} worker={worker} onClick={setSelected}/>
        ))}
      </div>

      {selected && <BookingModal worker={selected} onClose={()=>{setSelected(null);fetchWorkers();}} onReviewSubmit={fetchWorkers}/>}
      {showBookings && user && user.role==="worker" && <WorkerDashboard user={user} onClose={()=>setShowBookings(false)}/> }
      {showBookings && user && user.role==="customer" && <CustomerDashboard user={user} onClose={()=>setShowBookings(false)}/> }
      {showLogin && <LoginModal onClose={()=>setShowLogin(false)} onSuccess={data=>{setUser(data);}}/>}
      {showCustomerSignup && <CustomerSignupModal onClose={()=>setShowCustomerSignup(false)} onSuccess={data=>{setUser({...data,role:"customer",user_id:data.user_id});}}/>}
      {showWorkerSignup && <WorkerSignupModal onClose={()=>setShowWorkerSignup(false)} onSuccess={data=>{setUser({name:data.name,role:"worker",user_id:data.user_id,worker_id:data.id});fetchWorkers();}}/>}
    </div>
  );
}

export default App;
