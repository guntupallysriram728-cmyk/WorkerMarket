import { useState, useEffect } from "react";

function App() {
  const [workers, setWorkers] = useState([]);
  const API = "https://rabid-strode-disorder.ngrok-free.dev/api";

  useEffect(() => {
    fetch(`${API}/workers/`)
      .then(res => res.json())
      .then(data => setWorkers(data))
      .catch(err => console.log(err));
  }, []);

  return (
    <div style={{ fontFamily: "Arial", maxWidth: 800, margin: "0 auto", padding: 20 }}>
      <h1 style={{ color: "#2c3e50" }}>🔧 WorkerMarket</h1>
      <p>Find trusted local service workers near you</p>
      <h2>Available Workers</h2>
      {workers.length === 0 ? (
        <p>No workers yet. Add some via the API!</p>
      ) : (
        workers.map(worker => (
          <div key={worker.id} style={{ border: "1px solid #ddd", padding: 15, marginBottom: 10, borderRadius: 8 }}>
            <h3>{worker.name}</h3>
            <p>🛠 {worker.service_type}</p>
            <p>📍 {worker.location}</p>
            <p>💰 ${worker.hourly_rate}/hr</p>
            <p>⭐ Rating: {worker.average_rating || "No reviews yet"}</p>
          </div>
        ))
      )}
    </div>
  );
}

export default App;
