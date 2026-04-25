
import { useState, useEffect } from "react";

const API = "https://rabid-strode-disorder.ngrok-free.dev/api";

function WorkerCard({ worker, onClick }) {
  return (
    <div onClick={() => onClick(worker)} style={{
      border: "1px solid #ddd", padding: 20, marginBottom: 15,
      borderRadius: 12, cursor: "pointer",
      boxShadow: "0 2px 8px rgba(0,0,0,0.08)"
    }}>
      <h3 style={{margin:0, color:"#2c3e50"}}>{worker.name}</h3>
      <p>🛠 {worker.service_type}</p>
      <p>📍 {worker.location}</p>
      <p>💰 ${worker.hourly_rate}/hr</p>
      <p>⭐ {worker.average_rating || "No reviews yet"}</p>
      <button style={{
        background:"#3498db", color:"white", border:"none",
        padding:"10px 20px", borderRadius:8, cursor:"pointer"
      }}>View & Book</button>
    </div>
  );
}

function BookingModal({ worker, onClose }) {
  const [date, setDate] = useState("");
  const [hours, setHours] = useState(1);
  const [message, setMessage] = useState("");
  const [price, setPrice] = useState(worker.hourly_rate);
  const [booked, setBooked] = useState(false);
  const [chat, setChat] = useState([]);
  const [chatMsg, setChatMsg] = useState("");

  const total = (price * hours).toFixed(2);

  const sendMessage = () => {
    if (!chatMsg) return;
    setChat([...chat, {from:"You", text:chatMsg}]);
    setChatMsg("");
    setTimeout(() => {
      setChat(prev => [...prev, {from:worker.name, text:"Thanks for reaching out! I can do the job for $" + price + "/hr."}]);
    }, 1000);
  };

  return (
    <div style={{
      position:"fixed", top:0, left:0, right:0, bottom:0,
      background:"rgba(0,0,0,0.5)", display:"flex",
      alignItems:"center", justifyContent:"center", zIndex:1000
    }}>
      <div style={{
        background:"white", borderRadius:16, padding:30,
        width:"90%", maxWidth:500, maxHeight:"90vh", overflowY:"auto"
      }}>
        {!booked ? (
          <>
            <h2 style={{color:"#2c3e50"}}>{worker.name}</h2>
            <p>🛠 {worker.service_type} • 📍 {worker.location}</p>
            <hr/>
            <h3>💬 Chat & Negotiate</h3>
            <div style={{
              background:"#f8f9fa", borderRadius:8, padding:10,
              height:150, overflowY:"auto", marginBottom:10
            }}>
              {chat.length === 0 && <p style={{color:"#aaa"}}>Start a conversation...</p>}
              {chat.map((m,i) => (
                <p key={i} style={{margin:"5px 0"}}>
                  <strong>{m.from}:</strong> {m.text}
                </p>
              ))}
            </div>
            <div style={{display:"flex", gap:8, marginBottom:15}}>
              <input
                value={chatMsg}
                onChange={e => setChatMsg(e.target.value)}
                placeholder="Type a message..."
                style={{flex:1, padding:8, borderRadius:8, border:"1px solid #ddd"}}
                onKeyDown={e => e.key === "Enter" && sendMessage()}
              />
              <button onClick={sendMessage} style={{
                background:"#3498db", color:"white", border:"none",
                padding:"8px 15px", borderRadius:8, cursor:"pointer"
              }}>Send</button>
            </div>
            <h3>💰 Your Price Offer (per hr)</h3>
            <input
              type="number"
              value={price}
              onChange={e => setPrice(e.target.value)}
              style={{width:"100%", padding:10, borderRadius:8, border:"1px solid #ddd", marginBottom:10, boxSizing:"border-box"}}
            />
            <h3>📅 Date</h3>
            <input
              type="date"
              value={date}
              onChange={e => setDate(e.target.value)}
              style={{width:"100%", padding:10, borderRadius:8, border:"1px solid #ddd", marginBottom:10, boxSizing:"border-box"}}
            />
            <h3>⏱ Hours Needed</h3>
            <input
              type="number"
              value={hours}
              min={1}
              onChange={e => setHours(e.target.value)}
              style={{width:"100%", padding:10, borderRadius:8, border:"1px solid #ddd", marginBottom:10, boxSizing:"border-box"}}
            />
            <h3>📝 Job Description</h3>
            <textarea
              value={message}
              onChange={e => setMessage(e.target.value)}
              rows={3}
              style={{width:"100%", padding:10, borderRadius:8, border:"1px solid #ddd", marginBottom:10, boxSizing:"border-box"}}
              placeholder="Describe your job..."
            />
            <div style={{background:"#f8f9fa", padding:15, borderRadius:8, marginBottom:15}}>
              <strong>Total: ${total}</strong>
              <p style={{margin:0, fontSize:12, color:"#666"}}>({hours} hrs x ${price}/hr)</p>
            </div>
            <div style={{display:"flex", gap:10}}>
              <button onClick={() => setBooked(true)} style={{
                flex:1, background:"#27ae60", color:"white",
                border:"none", padding:12, borderRadius:8, cursor:"pointer", fontSize:15
              }}>Confirm Booking</button>
              <button onClick={onClose} style={{
                flex:1, background:"#e74c3c", color:"white",
                border:"none", padding:12, borderRadius:8, cursor:"pointer", fontSize:15
              }}>Cancel</button>
            </div>
          </>
        ) : (
          <div style={{textAlign:"center", padding:20}}>
            <h2>Booking Confirmed!</h2>
            <p>You booked <strong>{worker.name}</strong></p>
            <p>📅 {date}</p>
            <p>Total: ${total}</p>
            <button onClick={onClose} style={{
              background:"#3498db", color:"white", border:"none",
              padding:"12px 30px", borderRadius:8, cursor:"pointer"
            }}>Done</button>
          </div>
        )}
      </div>
    </div>
  );
}

function App() {
  const [workers, setWorkers] = useState([]);
  const [selected, setSelected] = useState(null);
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetch(`${API}/workers/`)
      .then(res => res.json())
      .then(data => setWorkers(data))
      .catch(err => console.log(err));
  }, []);

  const filtered = workers.filter(w =>
    w.name.toLowerCase().includes(search.toLowerCase()) ||
    w.service_type.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div style={{fontFamily:"Arial", maxWidth:800, margin:"0 auto", padding:20}}>
      <h1 style={{color:"#2c3e50"}}>🔧 WorkerMarket</h1>
      <p>Find and book trusted local service workers</p>
      <input
        type="text"
        placeholder="Search by name or service..."
        value={search}
        onChange={e => setSearch(e.target.value)}
        style={{
          width:"100%", padding:12, borderRadius:10,
          border:"1px solid #ddd", fontSize:15, marginBottom:20,
          boxSizing:"border-box"
        }}
      />
      <h2>Available Workers ({filtered.length})</h2>
      {filtered.map(worker => (
        <WorkerCard key={worker.id} worker={worker} onClick={setSelected} />
      ))}
      {selected && <BookingModal worker={selected} onClose={() => setSelected(null)} />}
    </div>
  );
}

export default App;
