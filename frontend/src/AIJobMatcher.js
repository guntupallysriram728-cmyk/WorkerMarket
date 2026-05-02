import { useState } from "react";

const API = "https://rabid-strode-disorder.ngrok-free.dev/api";

export default function AIJobMatcher({ workers, onSelectWorker }) {
  const [problem, setProblem] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");

  const findMatch = async () => {
    if (!problem.trim()) return;
    setLoading(true); setError(""); setResult(null);
    try {
      const res = await fetch(API + "/ai-match/", {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify({ problem, workers })
      });
      const parsed = await res.json();
      if (parsed.error) { setError("AI failed: " + parsed.error); }
      else { setResult({...parsed, worker: workers.find(w => w.id === parsed.worker_id)}); }
    } catch(e) { setError("AI matching failed. Try again!"); }
    setLoading(false);
  };

  return (
    <div style={{background:"linear-gradient(135deg,#667eea,#764ba2)",borderRadius:20,padding:25,marginBottom:25,color:"white"}}>
      <h2 style={{margin:"0 0 5px"}}>AI Job Matcher</h2>
      <p style={{margin:"0 0 15px",opacity:0.85,fontSize:14}}>Describe your problem and AI finds the best worker</p>
      <div style={{display:"flex",gap:10}}>
        <input value={problem} onChange={e=>setProblem(e.target.value)}
          placeholder="e.g. My kitchen sink is leaking..."
          style={{flex:1,padding:12,borderRadius:12,border:"none",fontSize:14}}
          onKeyDown={e=>e.key==="Enter"&&findMatch()}/>
        <button onClick={findMatch} disabled={loading} style={{
          background:loading?"rgba(255,255,255,0.3)":"white",color:"#764ba2",
          border:"none",padding:"12px 20px",borderRadius:12,cursor:"pointer",fontWeight:"bold"
        }}>{loading?"Finding...":"Find Match"}</button>
      </div>
      {error && <p style={{color:"#ffcccc",marginTop:10}}>{error}</p>}
      {result && (
        <div style={{background:"rgba(255,255,255,0.15)",borderRadius:15,padding:20,marginTop:15}}>
          <h3 style={{margin:"0 0 8px"}}>Best Match: {result.worker_name}</h3>
          <p style={{margin:"0 0 8px",opacity:0.9}}>{result.reason}</p>
          <p style={{margin:"0 0 12px",opacity:0.8,fontSize:13}}>Estimated: {result.estimated_hours} hrs | Tip: {result.tip}</p>
          {result.worker && (
            <button onClick={()=>onSelectWorker(result.worker)} style={{
              background:"white",color:"#764ba2",border:"none",
              padding:"10px 20px",borderRadius:10,cursor:"pointer",fontWeight:"bold"
            }}>Book {result.worker_name} Now</button>
          )}
        </div>
      )}
    </div>
  );
}
