import { useState } from "react";

const API = "https://rabid-strode-disorder.ngrok-free.dev/api";

const DAYS = ["monday","tuesday","wednesday","thursday","friday","saturday","sunday"];

export default function AvailabilityCalendar({ worker, isOwner }) {
  const [slots, setSlots] = useState({});
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(false);

  const toggleDay = (day) => {
    if (slots[day]) {
      const s = {...slots};
      delete s[day];
      setSlots(s);
    } else {
      setSlots({...slots, [day]: {start: "09:00", end: "17:00"}});
    }
  };

  const updateTime = (day, field, value) => {
    setSlots({...slots, [day]: {...slots[day], [field]: value}});
  };

  const save = async () => {
    setLoading(true);
    const slotList = Object.entries(slots).map(([day, times]) => ({
      day,
      start_time: times.start,
      end_time: times.end
    }));
    await fetch(API + "/set-availability/", {
      method: "POST",
      headers: {"Content-Type": "application/json"},
      body: JSON.stringify({worker_id: worker.id, slots: slotList})
    });
    setSaved(true);
    setLoading(false);
  };

  return (
    <div style={{marginTop:15}}>
      <h3 style={{color:"#2c3e50",margin:"0 0 10px"}}>
        {isOwner ? "Set Your Availability" : "Worker Availability"}
      </h3>
      {DAYS.map(day => (
        <div key={day} style={{
          background: slots[day] ? "#eafaf1" : "#f8f9fa",
          borderRadius:10, padding:10, marginBottom:8,
          border: slots[day] ? "1px solid #27ae60" : "1px solid #ddd"
        }}>
          <div style={{display:"flex", alignItems:"center", gap:10}}>
            {isOwner && (
              <input type="checkbox" checked={!!slots[day]} onChange={()=>toggleDay(day)}/>
            )}
            <strong style={{textTransform:"capitalize", color: slots[day]?"#27ae60":"#7f8c8d"}}>
              {day}
            </strong>
            {slots[day] && (
              <span style={{marginLeft:"auto", fontSize:13, color:"#27ae60"}}>
                {isOwner ? (
                  <>
                    <input type="time" value={slots[day].start}
                      onChange={e=>updateTime(day,"start",e.target.value)}
                      style={{border:"1px solid #ddd",borderRadius:6,padding:"2px 6px"}}/>
                    {" to "}
                    <input type="time" value={slots[day].end}
                      onChange={e=>updateTime(day,"end",e.target.value)}
                      style={{border:"1px solid #ddd",borderRadius:6,padding:"2px 6px"}}/>
                  </>
                ) : (
                  slots[day].start + " - " + slots[day].end
                )}
              </span>
            )}
            {!slots[day] && !isOwner && (
              <span style={{marginLeft:"auto",fontSize:13,color:"#aaa"}}>Not available</span>
            )}
          </div>
        </div>
      ))}
      {isOwner && (
        <button onClick={save} disabled={loading} style={{
          width:"100%", marginTop:10,
          background:"linear-gradient(135deg,#27ae60,#2ecc71)",
          color:"white", border:"none", padding:12, borderRadius:12,
          cursor:"pointer", fontSize:15, fontWeight:"bold"
        }}>{loading ? "Saving..." : saved ? "Saved!" : "Save Availability"}</button>
      )}
    </div>
  );
}
