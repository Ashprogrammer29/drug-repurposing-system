import { GitBranch, XCircle, ShieldCheck, RotateCcw } from 'lucide-react'

const STAGE_COLORS = { stage_1: '#ef4444', stage_2: '#6366f1', stage_3: '#3b82f6' }
const SEV_COLORS   = { critical: '#ef4444', moderate: '#f59e0b', minor: '#64748b' }

function StageRow({ label, agents, color, status }) {
  return (
    <div style={{ display: 'flex', alignItems: 'flex-start', gap: 14, padding: '12px 0',
                  borderBottom: '1px solid var(--border)' }}>
      <div style={{ width: 10, height: 10, borderRadius: '50%', background: color,
                    flexShrink: 0, marginTop: 4 }} />
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: 12, fontWeight: 600, color, marginBottom: 4 }}>{label}</div>
        {agents?.length > 0 && (
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            {agents.map(a => (
              <span key={a} style={{ background: `${color}18`, border: `1px solid ${color}40`,
                                      color, borderRadius: 6, padding: '2px 8px', fontSize: 11 }}>{a}</span>
            ))}
          </div>
        )}
      </div>
      {status && (
        <span style={{ fontSize: 11, fontWeight: 600,
                       color: status === 'passed' ? '#10b981' : '#ef4444' }}>
          {status === 'passed' ? '✓ passed' : `✗ ${status}`}
        </span>
      )}
    </div>
  )
}

export default function ExecutionTracePanel({ trace }) {
  if (!trace) return null
  const halted = !!trace.halted_at
  return (
    <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 14, padding: '20px 24px', marginTop: 36 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <GitBranch size={14} color="var(--accent)" />
          <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
            Execution Trace
          </span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <RotateCcw size={12} color="var(--muted)" />
          <span style={{ fontSize: 11, color: 'var(--muted)' }}>
            {trace.total_attempts} RAG call{trace.total_attempts !== 1 ? 's' : ''}
          </span>
        </div>
      </div>

      <div style={{ marginBottom: 20 }}>
        <StageRow label="Stage 1 — Safety Gate" agents={['Safety Agent']}
                  color={STAGE_COLORS.stage_1} status={trace.stage_1_safety} />
        {trace.stage_2_primary?.length > 0 && (
          <StageRow label="Stage 2 — Primary Signal" agents={trace.stage_2_primary}
                    color={STAGE_COLORS.stage_2} status={trace.halted_at === 'stage_2' ? 'halted' : 'passed'} />
        )}
        {trace.stage_3_secondary?.length > 0 && (
          <StageRow label="Stage 3 — Secondary Domains" agents={trace.stage_3_secondary}
                    color={STAGE_COLORS.stage_3} status={trace.halted_at === 'stage_3' ? 'halted' : 'passed'} />
        )}
      </div>

      {halted && (
        <div style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.25)',
                      borderRadius: 10, padding: '12px 16px', marginBottom: 16,
                      display: 'flex', gap: 10, alignItems: 'flex-start' }}>
          <XCircle size={15} color="#ef4444" style={{ flexShrink: 0, marginTop: 1 }} />
          <div>
            <div style={{ fontSize: 12, fontWeight: 600, color: '#ef4444', marginBottom: 4 }}>
              Pipeline halted at {trace.halted_at}
            </div>
            <div style={{ fontSize: 12, color: 'var(--muted)', lineHeight: 1.5 }}>{trace.halt_reason}</div>
          </div>
        </div>
      )}

      {trace.validation && (
        <div style={{ background: trace.validation.passed ? 'rgba(16,185,129,0.06)' : 'rgba(245,158,11,0.06)',
                      border: `1px solid ${trace.validation.passed ? 'rgba(16,185,129,0.25)' : 'rgba(245,158,11,0.25)'}`,
                      borderRadius: 10, padding: '12px 16px', marginBottom: 16,
                      display: 'flex', gap: 10, alignItems: 'flex-start' }}>
          <ShieldCheck size={15} color={trace.validation.passed ? '#10b981' : '#f59e0b'}
                       style={{ flexShrink: 0, marginTop: 1 }} />
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 12, fontWeight: 600, marginBottom: 4,
                          color: trace.validation.passed ? '#10b981' : '#f59e0b' }}>
              Validation {trace.validation.passed ? 'Passed' : 'Failed'}
            </div>
            <div style={{ fontSize: 12, color: 'var(--muted)', lineHeight: 1.5, marginBottom: 6 }}>
              {trace.validation.reason}
            </div>
            <div style={{ display: 'flex', gap: 16, fontSize: 11, color: 'var(--muted)' }}>
              <span>Valid agents: {trace.validation.non_rejected_count}/{trace.validation.min_required_agents}</span>
              <span>Avg conf: {Math.round(trace.validation.avg_confidence * 100)}%
                    (min {Math.round(trace.validation.min_required_confidence * 100)}%)</span>
            </div>
          </div>
        </div>
      )}

      {trace.contradictions?.length > 0 && (
        <div>
          <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--muted)', textTransform: 'uppercase',
                        letterSpacing: '0.08em', marginBottom: 10 }}>Cross-Domain Contradictions</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {trace.contradictions.map((c, i) => (
              <div key={i} style={{ background: 'var(--bg3)', borderRadius: 8, padding: '10px 14px',
                                     borderLeft: `3px solid ${SEV_COLORS[c.severity] || '#64748b'}` }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                  <span style={{ fontSize: 12, color: 'var(--text)', fontWeight: 500 }}>
                    {c.domain_a} ↔ {c.domain_b}
                  </span>
                  <span style={{ fontSize: 10, fontWeight: 600, textTransform: 'uppercase',
                                  color: SEV_COLORS[c.severity] || '#64748b' }}>{c.severity}</span>
                </div>
                <div style={{ fontSize: 12, color: 'var(--muted)', lineHeight: 1.5 }}>{c.description}</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}