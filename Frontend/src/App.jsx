import { useState, useEffect, useRef } from 'react'
import axios from 'axios'
import { FlaskConical, Activity, GitCompare, ChevronRight, FileDown, Terminal, ShieldAlert, CheckCircle, XCircle } from 'lucide-react'
import jsPDF from 'jspdf'
import 'jspdf-autotable'

// ==========================================
// CONFIGURATION: Ensure this matches your Ngrok terminal
// ==========================================
const TUNNEL_URL = 'https://drizzly-antitrust-surreal.ngrok-free.dev'; 
const API_ANALYZE_ENDPOINT = `${TUNNEL_URL}/api/analyze`;

export default function App() {
  const [query, setQuery] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState(null)
  const [error, setError] = useState(null)
  const [auditLogs, setAuditLogs] = useState([])
  const auditEndRef = useRef(null)

  useEffect(() => { 
    auditEndRef.current?.scrollIntoView({ behavior: 'smooth' }) 
  }, [auditLogs])

  const addLog = (msg) => setAuditLogs(prev => [...prev, `> ${new Date().toLocaleTimeString()}: ${msg}`])

  const handleSubmit = async (overrideQuery) => {
    const finalQuery = typeof overrideQuery === 'string' ? overrideQuery : query;
    if (!finalQuery) return;

    setLoading(true); 
    setError(null); 
    setResult(null); 
    setAuditLogs([]);

    addLog("🚀 INITIALIZING AGENTIC CONTEXT...");
    addLog(`📡 PINGING ENDPOINT: ${TUNNEL_URL}`);
    
    // UI Visual Timers for Demo Impact
    const timers = [
      setTimeout(() => addLog("🔍 NER: Disambiguating drug/target entities..."), 1200),
      setTimeout(() => addLog("🛡️ SAFETY: Cross-referencing contraindications..."), 3500),
      setTimeout(() => addLog("⛓️ RAG: Querying Qdrant Vector Stores..."), 7000),
      setTimeout(() => addLog("⚖️ GOVERNANCE: Synthesizing final verdict..."), 12000)
    ];

    try {
      const res = await axios.post(API_ANALYZE_ENDPOINT, { query: finalQuery }, {
        headers: {
          'Content-Type': 'application/json',
          'ngrok-skip-browser-warning': 'true' 
        },
        timeout: 90000 
      });
      
      timers.forEach(clearTimeout);
      setResult(res.data);
      addLog("✅ ANALYSIS COMPLETE: Multi-agent consensus reached.");
    } catch (err) {
      timers.forEach(clearTimeout);
      console.error("Connection Debug:", err);
      
      let msg = 'Backend Refused Connection. Is Uvicorn running?';
      if (err.code === 'ECONNABORTED') msg = 'Request Timed Out (LLM overload).';
      if (err.response?.status === 500) msg = 'Logic Error: Check Backend logs.';
      
      setError(msg);
      addLog("❌ SESSION TERMINATED: Bridge failure.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ backgroundColor: '#020617', minHeight: '100vh', color: 'white', padding: '60px 20px', fontFamily: 'Inter, system-ui, sans-serif' }}>
      <div style={{ maxWidth: '900px', margin: '0 auto', textAlign: 'center' }}>
        
        {/* HERO SECTION */}
        <div style={{ marginBottom: '60px' }}>
          <h1 style={{ fontSize: '4rem', fontWeight: '900', marginBottom: '10px', background: 'linear-gradient(to right, #3b82f6, #8b5cf6)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', letterSpacing: '-0.05em' }}>
            Agentic AI
          </h1>
          <p style={{ color: '#64748b', fontSize: '1.4rem', fontWeight: '400', letterSpacing: '0.05em' }}>
            REPURPOSING DISCOVERY ENGINE
          </p>
        </div>
        
        {/* INTERACTIVE INPUT */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '28px' }}>
          <div style={{ width: '100%', maxWidth: '680px' }}>
            <input 
              type="text" 
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
              placeholder="Query drug-target pair..."
              style={{ width: '100%', padding: '24px', borderRadius: '20px', border: '2px solid #1e293b', background: '#0f172a', color: 'white', fontSize: '1.25rem', outline: 'none', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.5)' }}
            />
          </div>

          <button 
            onClick={() => handleSubmit()}
            disabled={loading}
            style={{ padding: '20px 70px', borderRadius: '16px', background: '#2563eb', color: 'white', fontWeight: '800', border: 'none', cursor: 'pointer', fontSize: '1.2rem', transition: 'all 0.3s', boxShadow: '0 0 30px rgba(37, 99, 235, 0.4)' }}
          >
            {loading ? '🔬 AGENTS ACTIVE...' : 'EXECUTE PIPELINE'}
          </button>

          {/* SAMPLES - High Visibility White Text */}
          <div style={{ display: 'flex', gap: '15px' }}>
            {["Metformin - Alzheimer's", "Aspirin - Cancer"].map(pair => (
              <button 
                key={pair} 
                onClick={() => { setQuery(pair); handleSubmit(pair); }} 
                style={{ background: '#1e293b', color: '#ffffff', border: '1px solid #334155', padding: '14px 28px', borderRadius: '50px', cursor: 'pointer', fontSize: '1rem', fontWeight: '700', transition: 'background 0.2s' }}
                onMouseOver={(e) => e.currentTarget.style.background = '#334155'}
                onMouseOut={(e) => e.currentTarget.style.background = '#1e293b'}
              >
                {pair}
              </button>
            ))}
          </div>
        </div>

        {/* LOG TERMINAL */}
        <div style={{ background: '#000000', border: '1px solid #1e293b', borderRadius: '24px', padding: '32px', textAlign: 'left', fontFamily: 'JetBrains Mono, monospace', fontSize: '15px', color: '#2dd4bf', marginTop: '64px', height: '300px', overflowY: 'auto', boxShadow: 'inset 0 4px 20px rgba(0,0,0,0.9)' }}>
          {auditLogs.length === 0 && <div style={{ color: '#334155' }}>&gt; Awaiting neural uplink...</div>}
          {auditLogs.map((log, i) => <div key={i} style={{ marginBottom: '10px' }}>{log}</div>)}
          <div ref={auditEndRef} />
        </div>
      </div>

      {/* ERROR OVERLAY */}
      {error && (
        <div style={{ maxWidth: '680px', margin: '40px auto 0', padding: '24px', background: '#450a0a', border: '1px solid #ef4444', borderRadius: '16px', color: '#fecaca', textAlign: 'center', fontWeight: '700', boxShadow: '0 0 20px rgba(239, 68, 68, 0.2)' }}>
          ⚠️ CRITICAL: {error}
        </div>
      )}
    </div>
  )
}
