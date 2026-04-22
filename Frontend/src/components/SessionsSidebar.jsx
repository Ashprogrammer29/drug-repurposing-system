import { useState, useEffect } from 'react'
import axios from 'axios'
import { History, ChevronRight, RefreshCw } from 'lucide-react'

const VERDICT_COLORS = { APPROVED: '#10b981', CONDITIONAL: '#f59e0b', REJECTED: '#ef4444' }

export default function SessionsSidebar({ onLoadSession }) {
  const [sessions, setSessions] = useState([])
  const [loading,  setLoading]  = useState(false)
  const [open,     setOpen]     = useState(true)

  const fetchSessions = async () => {
    setLoading(true)
    try {
      const res = await axios.get('/api/sessions?limit=30')
      setSessions(res.data.sessions || [])
    } catch (e) {
      console.error('Failed to fetch sessions:', e)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchSessions() }, [])

  const handleLoad = async (sessionId) => {
    try {
      const res = await axios.get(`/api/sessions/${sessionId}`)
      onLoadSession(res.data)
    } catch (e) {
      console.error('Failed to load session:', e)
    }
  }

  return (
    <div style={{ width: open ? 280 : 48, minHeight: '100vh', background: 'var(--bg2)',
                  borderRight: '1px solid var(--border)', transition: 'width 0.2s ease',
                  display: 'flex', flexDirection: 'column', flexShrink: 0 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    padding: '16px 14px', borderBottom: '1px solid var(--border)' }}>
        {open && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <History size={14} color="var(--accent)" />
            <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--muted)',
                            textTransform: 'uppercase', letterSpacing: '0.08em' }}>Sessions</span>
          </div>
        )}
        <div style={{ display: 'flex', gap: 6, marginLeft: open ? 0 : 'auto' }}>
          {open && (
            <button onClick={fetchSessions}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--muted)' }}>
              <RefreshCw size={13} style={{ animation: loading ? 'spin 1s linear infinite' : 'none' }} />
            </button>
          )}
          <button onClick={() => setOpen(o => !o)}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--muted)' }}>
            <ChevronRight size={16} style={{ transform: open ? 'rotate(180deg)' : 'rotate(0)', transition: 'transform 0.2s' }} />
          </button>
        </div>
      </div>

      {open && (
        <div style={{ flex: 1, overflowY: 'auto', padding: '8px 0' }}>
          {sessions.length === 0 && !loading && (
            <div style={{ padding: '24px 14px', textAlign: 'center', fontSize: 12, color: 'var(--muted)' }}>
              No sessions yet. Run your first analysis.
            </div>
          )}
          {sessions.map(s => {
            const color = VERDICT_COLORS[s.verdict] || '#64748b'
            const date  = s.created_at ? new Date(s.created_at).toLocaleDateString('en-IN', { day:'2-digit', month:'short' }) : ''
            return (
              <button key={s.session_id} onClick={() => handleLoad(s.session_id)}
                      style={{ width: '100%', background: 'none', border: 'none',
                                padding: '10px 14px', cursor: 'pointer', textAlign: 'left',
                                borderBottom: '1px solid var(--border)', transition: 'background 0.1s' }}
                      onMouseEnter={e => e.currentTarget.style.background = 'var(--bg3)'}
                      onMouseLeave={e => e.currentTarget.style.background = 'none'}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                  <span style={{ width: 7, height: 7, borderRadius: '50%', background: color, flexShrink: 0 }} />
                  <span style={{ fontSize: 12, color: 'var(--text)', overflow: 'hidden',
                                  textOverflow: 'ellipsis', whiteSpace: 'nowrap', flex: 1 }}>
                    {s.query}
                  </span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', paddingLeft: 15 }}>
                  <span style={{ fontSize: 10, color, fontWeight: 600 }}>{s.verdict}</span>
                  <span style={{ fontSize: 10, color: 'var(--muted)' }}>
                    {Math.round(s.final_score * 100)}% · {date}
                  </span>
                </div>
              </button>
            )
          })}
        </div>
      )}
      <style>{`@keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}`}</style>
    </div>
  )
}