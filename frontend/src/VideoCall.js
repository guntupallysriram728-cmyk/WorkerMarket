import { useState, useEffect, useRef } from "react";

const WS_BASE = "wss://rabid-strode-disorder.ngrok-free.dev/ws/video/";

export default function VideoCall({ worker, onClose }) {
  const [status, setStatus] = useState("idle");
  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const pcRef = useRef(null);
  const wsRef = useRef(null);
  const roomId = "worker-" + worker.id;

  const startCall = async () => {
    setStatus("connecting");
    const ws = new WebSocket(WS_BASE + roomId + "/");
    wsRef.current = ws;

    const pc = new RTCPeerConnection({
      iceServers: [{ urls: "stun:stun.l.google.com:19302" }]
    });
    pcRef.current = pc;

    const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
    localVideoRef.current.srcObject = stream;
    stream.getTracks().forEach(track => pc.addTrack(track, stream));

    pc.onicecandidate = e => {
      if (e.candidate && ws.readyState === 1) {
        ws.send(JSON.stringify({ type: "candidate", candidate: e.candidate }));
      }
    };

    pc.ontrack = e => {
      remoteVideoRef.current.srcObject = e.streams[0];
      setStatus("connected");
    };

    ws.onmessage = async (e) => {
      const data = JSON.parse(e.data);
      if (data.type === "offer") {
        await pc.setRemoteDescription(new RTCSessionDescription(data.sdp));
        const answer = await pc.createAnswer();
        await pc.setLocalDescription(answer);
        ws.send(JSON.stringify({ type: "answer", sdp: answer }));
      } else if (data.type === "answer") {
        await pc.setRemoteDescription(new RTCSessionDescription(data.sdp));
      } else if (data.type === "candidate") {
        await pc.addIceCandidate(new RTCIceCandidate(data.candidate));
      }
    };

    ws.onopen = async () => {
      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);
      ws.send(JSON.stringify({ type: "offer", sdp: offer }));
    };
  };

  const endCall = () => {
    if (pcRef.current) pcRef.current.close();
    if (wsRef.current) wsRef.current.close();
    if (localVideoRef.current && localVideoRef.current.srcObject) {
      localVideoRef.current.srcObject.getTracks().forEach(t => t.stop());
    }
    setStatus("idle");
  };

  useEffect(() => { return () => endCall(); }, []);

  return (
    <div style={{textAlign:"center"}}>
      <h3 style={{color:"#2c3e50",margin:"0 0 15px"}}>Video Call with {worker.name}</h3>
      <div style={{display:"flex", gap:10, justifyContent:"center", marginBottom:15}}>
        <div style={{position:"relative"}}>
          <video ref={remoteVideoRef} autoPlay playsInline
            style={{width:200, height:150, borderRadius:12, background:"#2c3e50", objectFit:"cover"}}/>
          <p style={{fontSize:12,color:"#7f8c8d",margin:"4px 0 0"}}>{worker.name}</p>
        </div>
        <div style={{position:"relative"}}>
          <video ref={localVideoRef} autoPlay playsInline muted
            style={{width:200, height:150, borderRadius:12, background:"#34495e", objectFit:"cover"}}/>
          <p style={{fontSize:12,color:"#7f8c8d",margin:"4px 0 0"}}>You</p>
        </div>
      </div>
      <div style={{background:"#f8f9fa",borderRadius:12,padding:12,marginBottom:15,fontSize:13,color:"#7f8c8d"}}>
        {status==="idle" && "Start a video call to show the worker your problem and get an accurate quote!"}
        {status==="connecting" && "Connecting... waiting for worker to join."}
        {status==="connected" && "Connected! Show the worker your problem."}
      </div>
      <div style={{display:"flex",gap:10,justifyContent:"center"}}>
        {status==="idle" && (
          <button onClick={startCall} style={{
            background:"linear-gradient(135deg,#27ae60,#2ecc71)",
            color:"white",border:"none",padding:"12px 25px",
            borderRadius:12,cursor:"pointer",fontWeight:"bold",fontSize:15
          }}>Start Video Call 📹</button>
        )}
        {status!=="idle" && (
          <button onClick={endCall} style={{
            background:"#e74c3c",color:"white",border:"none",
            padding:"12px 25px",borderRadius:12,cursor:"pointer",fontWeight:"bold",fontSize:15
          }}>End Call ✕</button>
        )}
      </div>
    </div>
  );
}
