import { GitCompare, X } from 'lucide-react'

const SHORT = {
  'Literature Agent':'Literature','Clinical Agent':'Clinical','Patent Agent':'Patents',
  'Market Agent':'Market','Mechanistic Agent':'Mechanistic','Safety Agent':'Safety'
}

function MiniBar({ value, color }) {
  return (
    <div style={{ height: 4, background: 'var(--border)', borderRadius: 2, overflow: 'hidden', marginTop: 4 }}>
      <div style={{ width: `${Math.round(value*100)}%`, height: '100%', background: color, borderRadius: 2 }} />
    </div>
  )
}

export default function ComparePanel({ resultA, resultB, onClose }) {
  if (!resultA || !resultB) return null
  const allAgents = resultA.agent_results.map(r => r.agent_name)
  return (
    <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 14,
                  padding: 24, marginTop: 36 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <GitCompare size={14} color="var(--accent)" />
          <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--muted)',
                          textTransform: 'uppercase', letterSpacing: '0.08em' }}>Comparison Mode</span>
        </div>
        <button onClick={onClose} style={{ background: 'none', border: 'none',
                                            cursor: 'pointer', color: 'var(--muted)' }}>
          <X size={16} />
        </button>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 20 }}>
        {[resultA, resultB].map((r, i) => {
          const v = r.governance?.verdict || (!r.safety_cleared ? 'REJECTED' : r.support_count >= 3 ? 'APPROVED' : 'CONDITIONAL')
          const c = v === 'APPROVED' ? '#10b981' : v === 'CONDITIONAL' ? '#f59e0b' : '#ef4444'
          return (
            <div key={i} style={{ background: 'var(--bg3)', borderRadius: 10, padding: 16, border: `1px solid ${c}40` }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)', marginBottom: 6 }}>{r.query}</div>
              <div style={{ fontSize: 20, fontWeight: 700, color: c }}>{v}</div>
              <div style={{ fontSize: 12, color: 'var(--muted)', marginTop: 4 }}>
                Score: {Math.round((r.governance?.final_score || r.total_confidence) * 100)} · {r.support_count} domains
              </div>
            </div>
          )
        })}
      </div>
      <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--muted)', textTransform: 'uppercase',
                    letterSpacing: '0.08em', marginBottom: 12 }}>Domain Breakdown</div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {allAgents.map(name => {
          const a = resultA.agent_results.find(r => r.agent_name === name)
          const b = resultB.agent_results.find(r => r.agent_name === name)
          if (!a || !b) return null
          const ca = a.supports ? '#10b981' : '#ef4444'
          const cb = b.supports ? '#10b981' : '#ef4444'
          return (
            <div key={name} style={{ display: 'grid', gridTemplateColumns: '1fr 120px 1fr',
                                      alignItems: 'center', gap: 12, background: 'var(--bg3)',
                                      borderRadius: 10, padding: '12px 16px' }}>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12 }}>
                  <span style={{ color: ca, fontWeight: 500 }}>{a.supports ? 'Supports' : 'Against'}</span>
                  <span style={{ color: 'var(--muted)' }}>{Math.round(a.overall_confidence*100)}%</span>
                </div>
                <MiniBar value={a.overall_confidence} color={ca} />
              </div>
              <div style={{ textAlign: 'center', fontSize: 12, color: 'var(--muted)', fontWeight: 500 }}>
                {SHORT[name] || name}
              </div>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12 }}>
                  <span style={{ color: 'var(--muted)' }}>{Math.round(b.overall_confidence*100)}%</span>
                  <span style={{ color: cb, fontWeight: 500 }}>{b.supports ? 'Supports' : 'Against'}</span>
                </div>
                <MiniBar value={b.overall_confidence} color={cb} />
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}