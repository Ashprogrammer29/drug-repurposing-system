import { useState, useEffect, useRef } from 'react'
import axios from 'axios'
import { FlaskConical, Activity, GitCompare, ChevronRight, FileDown, Terminal, ShieldAlert, CheckCircle, XCircle } from 'lucide-react'
import jsPDF from 'jspdf'
import 'jspdf-autotable'

// API Configuration - Ensure this matches your Ngrok terminal
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
    
    // UI timers to show progress during your demo
    const timers = [
      setTimeout(() => addLog("🛡️ STAGE 1: Safety Agent performing contraindication check..."), 1500),
      setTimeout(() => addLog("⛓️ STAGE 2: Parallelizing Literature & Mechanistic Agents..."), 4000),
      setTimeout(() => addLog("🔬 STAGE 3: Launching Validation Agents (Clinical, Patent, Market)..."), 7000),
      setTimeout(() => addLog("⚖️ STAGE 4: Synthesizing Governance Weighted Evidence Profile..."), 10000)
    ];

    try {
      const res = await axios.post(API_ANALYZE_ENDPOINT, { query: finalQuery }, {
        headers: {
          'Content-Type': 'application/json',
          'ngrok-skip-browser-warning': 'true' // Bypasses the Ngrok warning page
        }
      });
      
      timers.forEach(clearTimeout);
      setResult(res.data);
      addLog("✅ Analysis Complete. Final Verdict Rendered.");
    } catch (err) {
      timers.forEach(clearTimeout);
      const errorMsg = err.response?.data?.detail || 'Analysis failed. Connection to local backend lost.';
      setError(errorMsg);
      addLog("❌ CRITICAL ERROR: Agent session terminated.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ backgroundColor: '#0f172a', minHeight: '100vh', color: 'white', padding: '40px', fontFamily: 'sans-serif' }}>
      <div style={{ maxWidth: '800px', margin: '0 auto', textAlign: 'center' }}>
        <h1 style={{ fontSize: '2.5rem', fontWeight: '800', marginBottom: '10px', letterSpacing: '-0.025em' }}>
          Agentic AI Repurposing Engine
        </h1>
        <p style={{ color: '#94a3b8', marginBottom: '40px', fontSize: '1.1rem' }}>
          Autonomous multi-domain discovery for drug-target hypotheses.
        </p>
        
        {/* SEARCH AREA */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px' }}>
          <div style={{ width: '100%', maxWidth: '600px' }}>
            <input 
              type="text" 
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
              placeholder="Search Drug & Disease (e.g., Aspirin for Cancer)..."
              style={{ width: '100%', padding: '18px', borderRadius: '12px', border: '2px solid #334155', background: '#1e293b', color: 'white', fontSize: '1.1rem', outline: 'none' }}
            />
          </div>

          <button 
            onClick={() => handleSubmit()}
            disabled={loading}
            style={{ padding: '15px 40px', borderRadius: '10px', background: '#3b82f6', color: 'white', fontWeight: 'bold', border: 'none', cursor: 'pointer', fontSize: '1rem', transition: 'all 0.2s' }}
          >
            {loading ? '🔬 AGENT ACTIVE...' : 'GENERATE HYPOTHESIS'}
          </button>

          {/* SAMPLES SECTION - Brightened for visibility */}
          <div style={{ display: 'flex', gap: '12px', marginTop: '10px' }}>
            {["Metformin - Alzheimer's", "Aspirin - Cancer"].map(pair => (
              <button 
                key={pair} 
                onClick={() => { setQuery(pair); handleSubmit(pair); }} 
                style={{ background: '#334155', color: '#ffffff', border: '1px solid #475569', padding: '8px 16px', borderRadius: '20px', cursor: 'pointer', fontSize: '0.85rem', fontWeight: '600' }}
              >
                {pair}
              </button>
            ))}
          </div>
        </div>

        {/* AUDIT LOG BOX */}
        <div style={{ background: '#0a0f1e', border: '1px solid #1e293b', borderRadius: 12, padding: '20px', textAlign: 'left', fontFamily: 'monospace', fontSize: '13px', color: '#38bdf8', marginTop: '40px', height: '220px', overflowY: 'auto', boxShadow: '0 10px 30px rgba(0,0,0,0.5)' }}>
          {auditLogs.length === 0 && <div style={{ color: '#475569' }}>&gt; System Idle. Awaiting instruction...</div>}
          {auditLogs.map((log, i) => <div key={i} style={{ marginBottom: '4px' }}>{log}</div>)}
          <div ref={auditEndRef} />
        </div>
      </div>

      {/* ERROR MESSAGE */}
      {error && (
        <div style={{ maxWidth: '600px', margin: '20px auto', padding: '15px', background: '#451a1a', border: '1px solid #ef4444', borderRadius: '8px', color: '#fca5a5', textAlign: 'center' }}>
          ⚠️ {error}
        </div>
      )}
    </div>
  )
}
