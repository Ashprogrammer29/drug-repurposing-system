import { useState, useEffect, useRef } from 'react'
import axios from 'axios'
import { FlaskConical, Activity, GitCompare, ChevronRight, FileDown, Terminal, ShieldAlert, CheckCircle, XCircle } from 'lucide-react'
import jsPDF from 'jspdf'
import 'jspdf-autotable'

import QueryInput         from './components/QueryInput'
import AgentCard          from './components/AgentCard'
import EvidencePanel      from './components/EvidencePanel'
import DecisionBanner     from './components/DecisionBanner'
import ExecutionTracePanel from './components/ExecutionTracePanel'
import HistoryPanel       from './components/HistoryPanel'
import ComparePanel       from './components/ComparePanel'
import SessionsSidebar    from './components/SessionsSidebar'

// API Configuration
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'
const API_ANALYZE_ENDPOINT = `${API_BASE_URL}/api/analyze`

const s = {
  app:   { minHeight: '100vh', background: 'var(--bg)', display: 'flex', flexDirection: 'column', color: 'var(--text)' },
  shell: { display: 'flex', flex: 1 },
  nav:   { display: 'flex', alignItems: 'center', justifyContent: 'space-between',
           padding: '16px 32px', borderBottom: '1px solid var(--border)',
           background: 'var(--bg2)', position: 'sticky', top: 0, zIndex: 100 },
  logo:  { display: 'flex', alignItems: 'center', gap: 10, fontSize: 15, fontWeight: 700, color: 'var(--text)' },
  badge: { background: 'rgba(59,130,246,0.15)', color: 'var(--accent)', border: '1px solid rgba(59,130,246,0.3)', borderRadius: 20, padding: '2px 10px', fontSize: 11, fontWeight: 500 },
  main:  { flex: 1, overflowY: 'auto' },
  inner: { maxWidth: 1100, margin: '0 auto', padding: '0 24px 60px', width: '100%' },
  hero:  { textAlign: 'center', padding: '60px 24px 40px' },
  title: { fontSize: 36, fontWeight: 700, background: 'linear-gradient(135deg,#e2e8f0 0%,#3b82f6 60%,#6366f1 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', marginBottom: 12 },
  sub:   { color: 'var(--muted)', fontSize: 14, maxWidth: 560, margin: '0 auto 36px', lineHeight: 1.6 },
  inputStyle: { width: '100%', padding: '12px 16px', fontSize: 14, borderRadius: 8, border: '1px solid var(--border)', background: 'var(--bg2)', color: 'var(--text)', boxSizing: 'border-box' },
  buttonStyle: { marginTop: 12, padding: '12px 32px', fontSize: '16px', fontWeight: 'bold', borderRadius: '8px', background: 'var(--accent)', color: 'white', border: 'none', cursor: 'pointer' },
  sampleBadgeStyle: { padding: '8px 16px', fontSize: 12, borderRadius: 6, background: 'var(--bg2)', border: '1px solid var(--border)', color: 'var(--text)', cursor: 'pointer' },
  auditBox: { background: '#0a0f1e', border: '1px solid #1e293b', borderRadius: 12, padding: '16px', textAlign: 'left', fontFamily: 'monospace', fontSize: 12, color: '#38bdf8', marginTop: 24, maxHeight: '180px', overflowY: 'auto', width: '100%', maxWidth: '640px', margin: '24px auto', boxShadow: '0 0 20px rgba(56, 189, 248, 0.1)' },
  matrixTable: { width: '100%', borderCollapse: 'collapse', marginTop: 20, fontSize: 12, background: 'var(--bg2)', borderRadius: 12, overflow: 'hidden', border: '1px solid var(--border)' },
}

export default function App() {
  const [query, setQuery] = useState('') // FIX: Added state
  const [loading,   setLoading]   = useState(false)
  const [result,    setResult]    = useState(null)
  const [error,     setError]     = useState(null)
  const [auditLogs, setAuditLogs] = useState([])
  const [history,   setHistory]   = useState([])
  const [comparing, setComparing] = useState(false)
  const auditEndRef = useRef(null)

  const testMatrix = [
    { drug: "Sildenafil", disease: "Pulmonary Hypertension", type: "Gold", expected: "Approved" },
    { drug: "Aspirin", disease: "Colorectal Cancer", type: "Gold", expected: "Approved" },
    { drug: "Warfarin", disease: "Hemophilia", type: "Fail", expected: "Halted (Safety)" },
    { drug: "Penicillin", disease: "Viral Influenza", type: "Fail", expected: "Rejected" },
  ];

  useEffect(() => { auditEndRef.current?.scrollIntoView({ behavior: 'smooth' }) }, [auditLogs])

  const addLog = (msg) => setAuditLogs(prev => [...prev, `> ${new Date().toLocaleTimeString()}: ${msg}`])

  const handleSubmit = async (overrideQuery) => {
    const finalQuery = typeof overrideQuery === 'string' ? overrideQuery : query; // Handle button or samples
    if (!finalQuery) return;

    setLoading(true); setError(null); setResult(null); setAuditLogs([])
    
    addLog("🚀 Initializing Agentic AI Context...");
    addLog("🔍 Step 1: Performing Entity Disambiguation (NER)...");
    
    const timers = [
      setTimeout(() => addLog("🛡️ STAGE 1: Safety Agent performing contraindication check..."), 1500),
      setTimeout(() => addLog("⛓️ STAGE 2: Parallelizing Literature & Mechanistic Agents..."), 4500),
      setTimeout(() => addLog("🔬 STAGE 3: Launching Validation Agents (Clinical, Patent, Market)..."), 9000),
      setTimeout(() => addLog("⚖️ STAGE 4: Synthesizing Governance Weighted Evidence Profile..."), 15000)
    ];

    try {
      const res = await axios.post(API_ANALYZE_ENDPOINT, { query: finalQuery }, {
        headers: {
          'Content-Type': 'application/json',
          'ngrok-skip-browser-warning': 'true'
        }
      })
      timers.forEach(clearTimeout);
      setResult(res.data)
      addLog("✅ Analysis Complete. Final Score: " + (res.data.governance?.final_score || 'N/A'))
      setHistory(prev => [res.data, ...prev.filter(h => h.query !== finalQuery)].slice(0, 10))
    } catch (err) {
      timers.forEach(clearTimeout);
      setError(err.response?.data?.detail || 'Analysis failed. System connection error.')
      addLog("❌ CRITICAL ERROR: Agent session terminated.")
    } finally {
      setLoading(false)
    }
  }

  const downloadReport = () => {
    const doc = new jsPDF()
    doc.setFontSize(22); doc.text("Agentic AI Evidence Report", 14, 20)
    doc.setFontSize(10); doc.text(`Generated on: ${new Date().toLocaleString()}`, 14, 28)
    doc.text(`Query: ${result.query}`, 14, 35)
    doc.text(`Verdict: ${result.governance.verdict} | Score: ${result.governance.final_score}`, 14, 42)
    
    const tableData = result.agent_results.map(a => [a.agent_name, a.verdict, a.confidence, a.summary.substring(0, 100)])
    doc.autoTable({
      startY: 50,
      head: [['Agent', 'Verdict', 'Confidence', 'Reasoning']],
      body: tableData,
      theme: 'striped'
    })
    doc.save(`Agentic_AI_Report_${result.query.replace(/\s+/g, '_')}.pdf`)
  }

  return (
    <div style={{ backgroundColor: '#0f172a', minHeight: '100vh', color: 'white', padding: '40px' }}>
      <div style={{ maxWidth: '800px', margin: '0 auto', textAlign: 'center' }}>
        <h1 style={{ fontSize: '2.5rem', marginBottom: '20px' }}>Agentic AI Repurposing Engine</h1>
        
        {/* SEARCH AREA */}
        <div style={{ marginTop: '40px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px' }}>
            <div style={{ position: 'relative', width: '100%', maxWidth: '600px' }}>
                <input
                    type="text"
                    placeholder="Aspirin for Pyrexia..."
                    value={query} // FIX: Bound to state
                    onChange={(e) => setQuery(e.target.value)} // FIX: Update state
                    onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
                    style={{ width: '100%', padding: '18px', borderRadius: '12px', border: '2px solid #334155', background: '#1e293b', color: 'white', fontSize: '1.1rem' }}
                />
            </div>

            <button
                onClick={() => handleSubmit()} // FIX: No more document.getElementById
                disabled={loading}
                style={{ padding: '15px 40px', borderRadius: '10px', background: '#3b82f6', color: 'white', fontWeight: 'bold', border: 'none', cursor: 'pointer', transition: 'transform 0.2s' }}
            >
                {loading ? '🔬 AGENT ACTIVE...' : 'GENERATE HYPOTHESIS'}
            </button>

            <div style={{ display: 'flex', gap: '10px' }}>
                {["Metformin - Alzheimer's", "Aspirin - Cancer"].map(pair => (
                    <button key={pair} onClick={() => { setQuery(pair); handleSubmit(pair); }} style={{ background: '#334155', color: '#94a3b8', border: 'none', padding: '6px 15px', borderRadius: '20px', cursor: 'pointer', fontSize: '0.8rem' }}>
                        {pair}
                    </button>
                ))}
            </div>
        </div>
      </div>

      {/* ERROR DISPLAY */}
      {error && (
        <div style={{ marginTop: '20px', padding: '15px', background: '#451a1a', border: '1px solid #7f1d1d', borderRadius: '8px', color: '#f87171', textAlign: 'center' }}>
          ⚠️ {error}
        </div>
      )}

      {/* Audit Log Box */}
      <div style={s.auditBox}>
          {auditLogs.map((log, i) => <div key={i}>{log}</div>)}
          <div ref={auditEndRef} />
      </div>
    </div>
  )
}