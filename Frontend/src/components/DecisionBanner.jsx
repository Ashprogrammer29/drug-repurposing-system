import { CheckCircle2, XCircle, AlertTriangle, Clock } from 'lucide-react'

export default function DecisionBanner({ data }) {
  if (!data) return null
  const gov     = data.governance
  const verdict = gov ? gov.verdict
    : !data.safety_cleared ? 'REJECTED'
    : data.support_count >= 3 ? 'APPROVED'
    : data.support_count >= 1 ? 'CONDITIONAL' : 'REJECTED'

  const [Icon, color, bg] = verdict === 'APPROVED'
    ? [CheckCircle2, '#10b981', 'rgba(16,185,129,0.08)']
    : verdict === 'CONDITIONAL'
    ? [Clock,        '#f59e0b', 'rgba(245,158,11,0.08)']
    : [!data.safety_cleared ? XCircle : AlertTriangle, '#ef4444', 'rgba(239,68,68,0.08)']

  return (
    <div style={{ background: bg, border: `1px solid ${color}40`, borderRadius: 14, padding: '20px 24px' }}>
      <div style={{ display: 'flex', gap: 18, alignItems: 'flex-start', marginBottom: gov ? 16 : 0 }}>
        <Icon size={28} color={color} style={{ flexShrink: 0, marginTop: 2 }} />
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 11, color, fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 6 }}>
            Governance Decision
          </div>
          <div style={{ fontSize: 16, fontWeight: 700, color, marginBottom: 8 }}>
            {verdict}
            {gov && <span style={{ fontSize: 13, fontWeight: 400, marginLeft: 12, color: 'var(--muted)' }}>
              Score: {Math.round(gov.final_score * 100)}/85 · {gov.confidence_label} confidence
            </span>}
          </div>
          <div style={{ fontSize: 13, color: 'var(--muted)', lineHeight: 1.6 }}>
            {gov ? gov.reasoning : 'No governance details available.'}
          </div>
          {gov && (
            <div style={{ marginTop: 10, padding: '10px 14px', background: 'var(--bg3)', borderRadius: 8,
                          fontSize: 12, color: 'var(--muted)', lineHeight: 1.5, borderLeft: `3px solid ${color}` }}>
              {gov.recommendation}
            </div>
          )}
          {data.normalized_query && data.normalized_query !== data.query && (
            <div style={{ marginTop: 8, fontSize: 11, color: 'var(--muted)', fontStyle: 'italic' }}>
              Normalized: "{data.normalized_query}"
            </div>
          )}
        </div>
      </div>

      {gov?.domain_scores && Object.keys(gov.domain_scores).length > 0 && (
        <div style={{ borderTop: `1px solid ${color}20`, paddingTop: 14 }}>
          <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--muted)', textTransform: 'uppercase',
                        letterSpacing: '0.08em', marginBottom: 10 }}>Weighted Domain Scores</div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(180px,1fr))', gap: 8 }}>
            {Object.entries(gov.domain_scores).map(([domain, score]) => (
              <div key={domain} style={{ background: 'var(--bg3)', borderRadius: 8, padding: '8px 12px',
                                         display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: 11, color: 'var(--muted)' }}>{domain.replace(' Agent', '')}</span>
                <span style={{ fontSize: 12, fontWeight: 600,
                               color: score > 0.15 ? '#10b981' : score > 0.05 ? '#f59e0b' : '#ef4444' }}>
                  {(score * 100).toFixed(1)}
                </span>
              </div>
            ))}
          </div>
          {gov.penalties_applied?.length > 0 && (
            <div style={{ marginTop: 10 }}>
              {gov.penalties_applied.map((p, i) => (
                <div key={i} style={{ fontSize: 11, color: p.includes('boost') ? '#10b981' : '#f59e0b', marginTop: 4 }}>
                  {p.includes('boost') ? '↑' : '↓'} {p}
                </div>
              ))}
            </div>
          )}
          <div style={{ marginTop: 10, fontSize: 12, color: 'var(--muted)' }}>
            Raw: {Math.round(gov.raw_score * 100)} → Final: {Math.round(gov.final_score * 100)}
            {gov.safety_zeroed && <span style={{ color: '#ef4444', marginLeft: 8 }}>Safety zeroed</span>}
          </div>
        </div>
      )}
    </div>
  )
}