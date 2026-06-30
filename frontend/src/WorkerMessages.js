import { useState, useEffect, useRef } from "react";

const API = "https://workm.onrender.com/api";
const WS = "wss://workm.onrender.com/ws/chat/";

export default function WorkerMessages({ user }) {
  const [conversations, setConversations] = useState([]);
  const [selected, setSelected] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMsg, setNewMsg] = useState("");
  const [ws, setWs] = useState(null);
  const bottomRef = useRef(null);

  // Load all conversations (bookings with messages)
  const loadConversations = async () => {
    try {
      const res = await fetch(API + "/get-bookings/?user_id=" + user.user_id + "&role=worker");
      const data = await res.json();
      if (Array.isArray(data)) setConversations(data);
    } catch(e) { console.log(e); }
  };

  useEffect(() => { loadConversations(); }, [user]); // eslint-disable-line

  // Load messages for selected conversation
  const loadMessages = async (conv) => {
    setSelected(conv);
    try {
      const res = await fetch(API + "/get-messages/?worker_id=" + user.worker_id + "&customer_id=" + conv.customer);
      const data = await res.json();
      if (Array.isArray(data)) setMessages(data.map(m => ({
        from: m.sender === "worker" ? "You" : conv.customer_name,
        text: m.text
      })));
    } catch(e) { console.log(e); }

    // Connect WebSocket
    if (ws) ws.close();
    const roomId = "chat-" + user.worker_id + "-" + conv.customer;
    const socket = new WebSocket(WS + roomId + "/");
    socket.onmessage = (e) => {
      const data = JSON.parse(e.data);
      if (data.sender === "customer") {
        setMessages(prev => [...prev, {from: conv.customer_name, text: data.text}]);
      }
    };
    setWs(socket);
  };

  const sendMessage = () => {
    if (!newMsg || !ws || ws.readyState !== 1 || !selected) return;
    ws.send(JSON.stringify({
      sender: "worker",
      text: newMsg,
      worker_id: user.worker_id,
      customer_id: selected.customer
    }));
    setMessages(prev => [...prev, {from: "You", text: newMsg}]);
    setNewMsg("");
  };

  useEffect(() => {
    if (bottomRef.current) bottomRef.current.scrollIntoView({behavior:"smooth"});
  }, [messages]);

  return (
    <div style={{display:"flex",gap:15,height:500}}>
      
      <div style={{width:200,background:"white",borderRadius:15,overflow:"auto",boxShadow:"0 4px 15px rgba(0,0,0,0.08)"}}>
        <div style={{padding:"15px",borderBottom:"1px solid #eee"}}>
          <strong style={{color:"#2c3e50"}}>Conversations</strong>
        </div>
        {conversations.length === 0 && (
          <p style={{padding:15,color:"#aaa",fontSize:13}}>No conversations yet</p>
        )}
        {conversations.map(c => (
          <div key={c.id} onClick={() => loadMessages(c)} style={{
            padding:"12px 15px",cursor:"pointer",borderBottom:"1px solid #f0f0f0",
            background:selected?.id===c.id?"#eaf4fd":"white"
          }}>
            <strong style={{fontSize:13,color:"#2c3e50"}}>{c.customer_name}</strong>
            <p style={{margin:"2px 0 0",fontSize:11,color:"#7f8c8d"}}>{c.date}</p>
          </div>
        ))}
      </div>

      <div style={{flex:1,background:"white",borderRadius:15,display:"flex",flexDirection:"column",boxShadow:"0 4px 15px rgba(0,0,0,0.08)"}}>
        {!selected ? (
          <div style={{flex:1,display:"flex",alignItems:"center",justifyContent:"center",color:"#7f8c8d"}}>
            <div style={{textAlign:"center"}}>
              <p style={{fontSize:40}}>💬</p>
              <p>Select a conversation</p>
            </div>
          </div>
        ) : (
          <>
            <div style={{padding:"15px",borderBottom:"1px solid #eee"}}>
              <strong style={{color:"#2c3e50"}}>{selected.customer_name}</strong>
              <p style={{margin:0,fontSize:12,color:"#7f8c8d"}}>{selected.date} • ${selected.total}</p>
            </div>
            <div style={{flex:1,overflowY:"auto",padding:15}}>
              {messages.length === 0 && <p style={{color:"#aaa",textAlign:"center"}}>No messages yet</p>}
              {messages.map((m,i) => (
                <div key={i} style={{display:"flex",justifyContent:m.from==="You"?"flex-end":"flex-start",marginBottom:8}}>
                  <div style={{
                    background:m.from==="You"?"linear-gradient(135deg,#2c3e50,#3498db)":"#f0f0f0",
                    color:m.from==="You"?"white":"#2c3e50",
                    padding:"8px 14px",borderRadius:18,maxWidth:"70%",fontSize:14
                  }}>{m.text}</div>
                </div>
              ))}
              <div ref={bottomRef}/>
            </div>
            <div style={{padding:12,borderTop:"1px solid #eee",display:"flex",gap:8}}>
              <input value={newMsg} onChange={e=>setNewMsg(e.target.value)}
                placeholder="Type a message..."
                style={{flex:1,padding:10,borderRadius:10,border:"1px solid #ddd",fontSize:14}}
                onKeyDown={e=>e.key==="Enter"&&sendMessage()}/>
              <button onClick={sendMessage} style={{
                background:"linear-gradient(135deg,#2c3e50,#3498db)",color:"white",
                border:"none",padding:"10px 18px",borderRadius:10,cursor:"pointer",fontWeight:"bold"
              }}>Send</button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
