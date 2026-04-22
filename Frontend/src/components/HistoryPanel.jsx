import { Clock, RotateCcw, Trash2 } from 'lucide-react'

export default function HistoryPanel({ history, onRerun, onClear }) {
  if (!history?.length) return null
  return (
    <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 14,
                  padding: '20px 24px', marginTop: 36 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <Clock size={14} color="var(--muted)" />
          <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--muted)',
                          textTransform: 'uppercase', letterSpacing: '0.08em' }}>Session History</span>
        </div>
        <button onClick={onClear} style={{ background: 'none', border: 'none', cursor: 'pointer',
                                           color: 'var(--muted)', display: 'flex', alignItems: 'center',
                                           gap: 4, fontSize: 11, fontFamily: 'inherit' }}>
          <Trash2 size={12} /> Clear
        </button>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {history.map((item, i) => {
          const verdict = item.governance?.verdict || (
            !item.safety_cleared ? 'REJECTED'
            : item.support_count >= 3 ? 'APPROVED'
            : item.support_count >= 1 ? 'CONDITIONAL' : 'REJECTED'
          )
          const color = verdict === 'APPROVED' ? '#10b981' : verdict === 'CONDITIONAL' ? '#f59e0b' : '#ef4444'
          return (
            <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                                   background: 'var(--bg3)', borderRadius: 10, padding: '10px 14px',
                                   border: '1px solid var(--border)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, flex: 1, minWidth: 0 }}>
                <span style={{ width: 8, height: 8, borderRadius: '50%', background: color, flexShrink: 0 }} />
                <span style={{ fontSize: 13, color: 'var(--text)', overflow: 'hidden',
                                textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.query}</span>
                <span style={{ fontSize: 11, color, flexShrink: 0 }}>{verdict}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginLeft: 12 }}>
                <span style={{ fontSize: 11, color: 'var(--muted)' }}>
                  {Math.round((item.governance?.final_score || item.total_confidence) * 100)}% · {item.support_count}/5
                </span>
                <button onClick={() => onRerun(item.query)}
                        style={{ background: 'none', border: '1px solid var(--border)', borderRadius: 6,
                                  cursor: 'pointer', color: 'var(--muted)', padding: '3px 8px',
                                  display: 'flex', alignItems: 'center', gap: 4, fontSize: 11,
                                  fontFamily: 'inherit', transition: 'all 0.15s' }}
                        onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--accent)'; e.currentTarget.style.color = 'var(--accent)' }}
                        onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.color = 'var(--muted)' }}>
                  <RotateCcw size={10} /> Rerun
                </button>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
