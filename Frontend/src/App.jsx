import { useState, useEffect, useRef } from 'react'
import axios from 'axios'
import { Search, BookOpen, Scale, Activity, Bot, CheckCircle } from 'lucide-react'

const TUNNEL_URL = 'https://drizzly-antitrust-surreal.ngrok-free.dev'; 
const API_ANALYZE_ENDPOINT = `${TUNNEL_URL}/api/analyze`;

export default function App() {
  const [query, setQuery] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState(null)
  const [error, setError] = useState(null)
  const [auditLogs, setAuditLogs] = useState([])
  const auditEndRef = useRef(null)

  useEffect(() => { auditEndRef.current?.scrollIntoView({ behavior: 'smooth' }) }, [auditLogs])

  const addLog = (msg) => setAuditLogs(prev => [...prev, `> ${new Date().toLocaleTimeString()}: ${msg}`])

  const handleSubmit = async (overrideQuery) => {
    const finalQuery = typeof overrideQuery === 'string' ? overrideQuery : query;
    if (!finalQuery) return;
    setQuery(finalQuery);
    setLoading(true); setError(null); setResult(null); setAuditLogs([]);
    addLog("🚀 INITIATING MULTI-DOMAIN INTELLIGENCE...");

    try {
      const res = await axios.post(API_ANALYZE_ENDPOINT, { query: finalQuery }, {
        headers: { 'Content-Type': 'application/json', 'ngrok-skip-browser-warning': 'true' }
      });
      setResult(res.data);
      addLog("✅ CONSENSUS REACHED: Analysis complete.");
    } catch (err) {
      setError('Analysis failed. System connection error.');
      addLog("❌ PIPELINE TERMINATED.");
    } finally { setLoading(false); }
  };

  const samples = ["Metformin - Alzheimer's", "Aspirin - Cancer", "Sildenafil - Hypertension", "Rapamycin - Aging"];

  return (
    <div style={{ backgroundColor: '#020617', minHeight: '100vh', color: 'white', padding: '60px 20px', fontFamily: 'Inter, sans-serif' }}>
      <div style={{ maxWidth: '1000px', margin: '0 auto', textAlign: 'center' }}>
        
        {/* HEADER SECTION - Matching target image exactly */}
        <h1 style={{ fontSize: '3rem', fontWeight: '800', color: '#60a5fa', marginBottom: '5px' }}>Agentic AI</h1>
        <h2 style={{ fontSize: '2.5rem', fontWeight: '800', color: '#60a5fa', marginBottom: '15px' }}>Repurposing Engine</h2>
        <p style={{ color: '#64748b', fontSize: '1rem', maxWidth: '650px', margin: '0 auto 40px auto', lineHeight: '1.5' }}>
          Autonomous multi-domain intelligence with staged orchestration and weighted governance decisions.
        </p>
        
        {/* SEARCH BAR & SAMPLES */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px' }}>
          <div style={{ position: 'relative', width: '100%', maxWidth: '700px' }}>
            <span style={{ position: 'absolute', left: '20px', top: '18px', color: '#60a5fa' }}><Bot size={22} /></span>
            <input 
              type="text" value={query} onChange={(e) => setQuery(e.target.value)} 
              onKeyDown={(e) => e.key === 'Enter' && handleSubmit()} 
              placeholder="Search Drug-Target Pair..." 
              style={{ width: '100%', padding: '18px 140px 18px 55px', borderRadius: '12px', background: '#0f172a', color: 'white', border: '1px solid #1e293b', outline: 'none', fontSize: '1rem' }} 
            />
            <button 
              onClick={() => handleSubmit()} disabled={loading}
              style={{ position: 'absolute', right: '10px', top: '10px', padding: '12px 28px', borderRadius: '8px', background: '#2563eb', color: 'white', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', fontWeight: '600' }}
            >
              <Search size={18} /> {loading ? '...' : 'Analyze'}
            </button>
          </div>

          <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '10px' }}>
            <span style={{ color: '#475569', fontSize: '0.9rem', alignSelf: 'center' }}>Try:</span>
            {samples.map(s => (
              <button key={s} onClick={() => handleSubmit(s)} style={{ background: '#1e293b', color: '#94a3b8', border: '1px solid #334155', padding: '6px 14px', borderRadius: '30px', cursor: 'pointer', fontSize: '0.85rem' }}>{s}</button>
            ))}
          </div>
        </div>

        {/* LOG TERMINAL */}
        <div style={{ background: '#000', border: '1px solid #1e293b', borderRadius: '24px', padding: '32px', textAlign: 'left', color: '#2dd4bf', marginTop: '50px', height: '140px', overflowY: 'auto', fontFamily: 'monospace', fontSize: '0.85rem' }}>
          {auditLogs.map((log, i) => <div key={i} style={{ marginBottom: '6px' }}>{log}</div>)}
          <div ref={auditEndRef} />
        </div>

        {/* RESULTS AREA */}
        {result && (
          <div style={{ marginTop: '60px', textAlign: 'left' }}>
            <h3 style={{ fontSize: '1.8rem', fontWeight: '800', marginBottom: '25px', display: 'flex', alignItems: 'center', gap: '12px' }}>
              <Scale color="#3b82f6" /> Hypothesis Analysis Result
            </h3>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '30px' }}>
              <div style={{ background: '#0f172a', padding: '25px', borderRadius: '15px', border: '1px solid #1e293b' }}>
                <p style={{ color: '#64748b', fontSize: '0.8rem', marginBottom: '5px' }}>GOVERNANCE VERDICT</p>
                <h4 style={{ fontSize: '1.4rem', color: result.governance?.verdict.includes('Approved') ? '#2dd4bf' : '#fb7185' }}>{result.governance?.verdict}</h4>
              </div>
              <div style={{ background: '#0f172a', padding: '25px', borderRadius: '15px', border: '1px solid #1e293b' }}>
                <p style={{ color: '#64748b', fontSize: '0.9rem', marginBottom: '5px' }}>CONFIDENCE SCORE</p>
                <h4 style={{ fontSize: '1.4rem', color: '#3b82f6' }}>{(result.governance?.final_score * 100).toFixed(1)}%</h4>
              </div>
            </div>

            {/* MOA Report */}
            {result.governance?.moa && (
              <div style={{ background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)', padding: '25px', borderRadius: '15px', border: '1px solid #3b82f6', marginBottom: '30px' }}>
                <h4 style={{ fontSize: '1.1rem', fontWeight: '800', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <BookOpen size={20} color="#3b82f6" /> Mechanism of Action
                </h4>
                <p style={{ color: '#cbd5e1', lineHeight: '1.6', fontSize: '0.95rem' }}>{result.governance.moa}</p>
              </div>
            )}

            {/* AGENT LOGS - Explicit Naming Fix */}
            <h3 style={{ color: '#64748b', marginBottom: '20px' }}>Agent Decision Log</h3>
            {result.agent_results?.map((agent, i) => (
              <div key={i} style={{ background: '#0f172a', padding: '20px', borderRadius: '12px', marginBottom: '15px', border: '1px solid #1e293b' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                  <span style={{ fontWeight: '800', fontSize: '0.95rem' }}>{agent.name} Agent</span>
                  <span style={{ color: agent.verdict.includes("Safe") || agent.verdict.includes("Strong") || agent.verdict.includes("Clear") ? "#2dd4bf" : "#fb7185", fontWeight: '700', fontSize: '0.9rem' }}>{agent.verdict}</span>
                </div>
                <p style={{ color: '#94a3b8', fontSize: '0.85rem' }}>{agent.summary}</p>
              </div>
            ))}
          </div>
        )}

        {/* SYSTEM CALIBRATION MATRIX */}
        <div style={{ marginTop: '70px', textAlign: 'left' }}>
          <h4 style={{ fontSize: '0.85rem', color: '#475569', marginBottom: '20px', letterSpacing: '0.05em' }}>SYSTEM CALIBRATION MATRIX (BENCHMARK GOLD STANDARDS)</h4>
          <table style={{ width: '100%', background: '#0f172a', borderRadius: '12px', overflow: 'hidden', borderCollapse: 'collapse', fontSize: '0.9rem' }}>
            <thead>
              <tr style={{ background: '#1e293b', color: '#94a3b8', textAlign: 'left' }}>
                <th style={{ padding: '15px' }}>Drug Candidate</th>
                <th style={{ padding: '15px' }}>Indication</th>
                <th style={{ padding: '15px' }}>Class</th>
                <th style={{ padding: '15px' }}>Expected Agent Verdict</th>
              </tr>
            </thead>
            <tbody>
              {[
                { d: "Sildenafil", i: "Pulmonary Hypertension", c: "Gold", v: "Approved" },
                { d: "Finasteride", i: "Androgenetic Alopecia", c: "Gold", v: "Approved" },
                { d: "Raloxifene", i: "Breast Cancer Prevention", c: "Gold", v: "Approved" },
                { d: "Warfarin", i: "Hemophilia", c: "Fail", v: "Halted (Safety)" },
                { d: "Statins", i: "Viral Pneumonia", c: "Fail", v: "Rejected (Efficacy)" }
              ].map((b, i) => (
                <tr key={i} style={{ borderBottom: '1px solid #020617' }}>
                  <td style={{ padding: '15px', fontWeight: '600' }}>{b.d}</td>
                  <td style={{ padding: '15px', color: '#64748b' }}>{b.i}</td>
                  <td style={{ padding: '15px', color: b.c === 'Gold' ? '#2dd4bf' : '#fb7185' }}>{b.c}</td>
                  <td style={{ padding: '15px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    {b.v.includes('Approved') ? <CheckCircle size={16} color="#2dd4bf"/> : <Activity size={16} color="#fb7185"/>} {b.v}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
        
