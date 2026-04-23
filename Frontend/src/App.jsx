import { useState, useEffect, useRef } from 'react'
import axios from 'axios'
import { FlaskConical, Activity, GitCompare, ChevronRight, FileDown, Terminal, ShieldAlert, CheckCircle, XCircle } from 'lucide-react'
import jsPDF from 'jspdf'
import 'jspdf-autotable'

// API Configuration - MUST match your Ngrok terminal
const API_BASE_URL = 'https://drizzly-antitrust-surreal.ngrok-free.dev'
const API_ANALYZE_ENDPOINT = `${API_BASE_URL}/api/analyze`

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

    addLog("🚀 Initializing Agentic AI Context...");
    addLog("🔍 Step 1: Performing Entity Disambiguation (NER)...");
    
    // Simulated staged logs for visual feedback during the demo
    const timers = [
      setTimeout(() => addLog("🛡️ STAGE 1: Safety Agent performing contraindication check..."), 1500),
      setTimeout(() => addLog("⛓️ STAGE 2: Parallelizing Literature & Mechanistic Agents..."), 4500),
      setTimeout(() => addLog("🔬 STAGE 3: Launching Validation Agents (Clinical, Patent, Market)..."), 8000),
      setTimeout(() => addLog("⚖️ STAGE 4: Synthesizing Governance Weighted Evidence Profile..."), 12000)
    ];

    try {
      const res = await axios.post(API_ANALYZE_ENDPOINT, { query: finalQuery }, {
        headers: {
          'Content-Type': 'application/json',
          'ngrok-skip-browser-warning': 'true' // CRITICAL: Bypasses the Ngrok blue warning page
        }
      });
      
      timers.forEach(clearTimeout);
      setResult(res.data);
      addLog("✅ Analysis Complete. System synchronized.");
    } catch (err) {
      timers.forEach(clearTimeout);
      const errorMsg = err.response?.data?.detail || 'Analysis failed. System connection error.';
      setError(errorMsg);
      addLog("❌ CRITICAL ERROR: Agent session terminated.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ backgroundColor: '#0f172a', minHeight: '100vh', color: 'white', padding: '40px', fontFamily: 'sans-serif' }}>
      <div style={{ maxWidth: '800px', margin: '0 auto', textAlign: 'center' }}>
        <h1 style={{ fontSize: '2.5rem', fontWeight: '800', marginBottom: '20px', letterSpacing: '-0.025em' }}>
          Agentic AI Repurposing Engine
        </h1>
        <p style={{ color: '#94a3b8', marginBottom: '40px' }}>
          Autonomous multi-domain intelligence for drug repurposing discovery.
        </p>
        
        {/* SEARCH AREA */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px' }}>
          <div style={{ width: '100%', maxWidth: '600px' }}>
            <input 
              type="text" 
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
              placeholder="Enter Drug & Target (e.g., Aspirin for Pyrexia)..."
              style={{ width: '100%', padding: '18px', borderRadius: '12px', border: '2px solid #334155', background: '#1e293b', color: 'white', fontSize: '1.1rem', outline: 'none' }}
            />
          </div>

          <button 
            onClick={() => handleSubmit()}
            disabled={loading}
            style={{ padding: '15px 40px', borderRadius: '10px', background: '#3b82f6', color: 'white', fontWeight: 'bold', border: 'none', cursor: 'pointer', fontSize: '1rem' }}
          >
            {loading ? '🔬 AGENT ACTIVE...' : 'GENERATE HYPOTHESIS'}
          </button>

          {/* SAMPLES SECTION - Brightened for visibility */}
          <div style={{ display: 'flex', gap: '12px', marginTop: '10px' }}>
            {["Metformin - Alzheimer's", "Aspirin - Cancer"].map(pair => (
              <button 
                key={pair} 
                onClick={() => { setQuery(pair); handleSubmit(pair); }} 
                style={{ background: '#334155', color: '#ffffff', border: '1px solid #475569', padding: '8px 16px', borderRadius: '20px', cursor: 'pointer', fontSize: '0.85rem', fontWeight: '500' }}
              >
                {pair}
              </button>
            ))}
          </div>
        </div>

        {/* AUDIT LOG BOX */}
        <div style={{ background: '#0a0f1e', border: '1px solid #1e293b', borderRadius: 12, padding: '20px', textAlign: 'left', fontFamily: 'monospace', fontSize: '13px', color: '#38bdf8', marginTop: '40px', height: '220px', overflowY: 'auto', boxShadow: '0 4px 24px rgba(0,0,0,0.5)' }}>
          {auditLogs.length === 0 && <div style={{ color: '#475569' }}>&gt; Awaiting command...</div>}
          {auditLogs.map((log, i) => <div key={i} style={{ marginBottom: '4px' }}>{log}</div>)}
          <div ref={auditEndRef} />
        </div>
      </div>

      {/* ERROR MODAL */}
      {error && (
        <div style={{ maxWidth: '600px', margin: '20px auto', padding: '15px', background: '#451a1a', border: '1px solid #ef4444', borderRadius: '8px', color: '#fca5a5', textAlign: 'center', fontWeight: '500' }}>
          ⚠️ {error}
        </div>
      )}
    </div>
  )
}
