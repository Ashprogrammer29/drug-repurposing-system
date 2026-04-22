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
  auditBox: { background: '#0a0f1e', border: '1px solid #1e293b', borderRadius: 12, padding: '16px', textAlign: 'left', fontFamily: 'monospace', fontSize: 12, color: '#38bdf8', marginTop: 24, maxHeight: '180px', overflowY: 'auto', width: '100%', maxWidth: '640px', margin: '24px auto', boxShadow: '0 0 20px rgba(56, 189, 248, 0.1)' },
  matrixTable: { width: '100%', borderCollapse: 'collapse', marginTop: 20, fontSize: 12, background: 'var(--bg2)', borderRadius: 12, overflow: 'hidden', border: '1px solid var(--border)' },
}

export default function App() {
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

  const handleSubmit = async (query) => {
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
      const res = await axios.post(API_ANALYZE_ENDPOINT, { query })
      timers.forEach(clearTimeout);
      setResult(res.data)
      addLog("✅ Analysis Complete. Final Score: " + res.data.governance.final_score)
      setHistory(prev => [res.data, ...prev.filter(h => h.query !== query)].slice(0, 10))
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
    <div style={s.app}>
      <nav style={s.nav}>
        <div style={s.logo}><FlaskConical size={20} color="var(--accent)" /> Agentic AI Assistant</div>
        <div style={{ display: 'flex', gap: 15, alignItems: 'center' }}>
          <span style={s.badge}>Benchmarking v2.0</span>
          <Activity size={16} color="var(--muted)" />
        </div>
      </nav>

      <div style={s.shell}>
        <SessionsSidebar onLoadSession={d => {setResult(d); setAuditLogs([])}} />
        
        <div style={s.main}>
          <div style={s.hero}>
            <h1 style={s.title}>Agentic AI<br />Repurposing Engine</h1>
            <p style={s.sub}>Autonomous multi-domain intelligence with staged orchestration and weighted governance decisions.</p>
            
            <QueryInput onSubmit={handleSubmit} loading={loading} />

            {loading && (
              <div style={s.auditBox}>
                <div style={{display:'flex', alignItems:'center', gap:8, marginBottom:10, color:'#38bdf8', fontWeight:'bold'}}><Terminal size={14}/> LIVE AGENT LOGS</div>
                {auditLogs.map((log, i) => <div key={i} style={{marginBottom:4, opacity: 0.9}}>{log}</div>)}
                <div ref={auditEndRef} />
              </div>
            )}
          </div>

          <div style={s.inner}>
            {!result && !loading && (
              <div style={{marginTop: 40}}>
                <div style={{fontSize: 12, fontWeight: 700, color: 'var(--muted)', textTransform: 'uppercase', marginBottom: 15}}>System Calibration Matrix (Benchmark Gold Standards)</div>
                <table style={s.matrixTable}>
                  <thead>
                    <tr style={{background: 'var(--bg3)', textAlign: 'left'}}>
                      <th style={{padding: '12px'}}>Drug Candidate</th>
                      <th style={{padding: '12px'}}>Indication</th>
                      <th style={{padding: '12px'}}>Class</th>
                      <th style={{padding: '12px'}}>Expected Agent Verdict</th>
                    </tr>
                  </thead>
                  <tbody>
                    {testMatrix.map((item, i) => (
                      <tr key={i} style={{borderBottom: '1px solid var(--border)'}}>
                        <td style={{padding: '12px', color: 'var(--text)'}}>{item.drug}</td>
                        <td style={{padding: '12px', color: 'var(--muted)'}}>{item.disease}</td>
                        <td style={{padding: '12px'}}><span style={{color: item.type === 'Gold' ? '#10b981' : '#f43f5e'}}>{item.type}</span></td>
                        <td style={{padding: '12px', display: 'flex', alignItems: 'center', gap: 6}}>
                          {item.type === 'Gold' ? <CheckCircle size={14} color="#10b981"/> : <XCircle size={14} color="#f43f5e"/>}
                          {item.expected}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {error && <div style={s.err}><ShieldAlert size={16}/> {error}</div>}

            {result && (
              <>
                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 40 }}>
                  <button onClick={downloadReport} style={{ background: 'var(--accent)', color: '#fff', border: 'none', padding: '10px 20px', borderRadius: 10, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8, fontWeight: 600 }}>
                    <FileDown size={16}/> Download Evidence PDF
                  </button>
                  <button onClick={() => setComparing(true)} style={{ background: 'var(--bg2)', border: '1px solid var(--border)', color: 'var(--muted)', padding: '10px 20px', borderRadius: 10, cursor: 'pointer' }}>
                    <GitCompare size={16}/> Compare
                  </button>
                </div>

                <div style={{ marginTop: 24 }}><DecisionBanner data={result} /></div>
                
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: 20, marginTop: 36, alignItems: 'start' }}>
                  <div>
                    <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--muted)', textTransform: 'uppercase', marginBottom: 16 }}>Agent Audits</div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(280px,1fr))', gap: 14 }}>
                      {result.agent_results?.map(agent => <AgentCard key={agent.agent_name} agent={agent} />)}
                    </div>
                  </div>
                  <EvidencePanel data={result} />
                </div>
                <ExecutionTracePanel trace={result.execution_trace} />
              </>
            )}
            <HistoryPanel history={history} onRerun={handleSubmit} />
          </div>
        </div>
      </div>
    </div>
  )
}