import { useState } from 'react'
import { Download, FileJson, FileText, FileDown } from 'lucide-react'
import axios from 'axios'

function buildHTML(data) {
  const gov     = data.governance || {}
  const verdict = gov.verdict || 'UNKNOWN'
  const rows    = (data.agent_results || []).map(r =>
    `<tr><td>${r.agent_name}</td><td style="color:${r.supports?'#10b981':'#ef4444'}">${r.supports?'Yes':'No'}</td>
     <td>${Math.round(r.overall_confidence*100)}%</td><td>${(r.summary||'').slice(0,100)}</td></tr>`
  ).join('')
  return `<!DOCTYPE html><html><head><meta charset="UTF-8">
<title>Drug Repurposing Report — ${data.query}</title>
<style>body{font-family:Arial,sans-serif;max-width:900px;margin:40px auto;color:#1a1a1a}
h1{font-size:22px}table{width:100%;border-collapse:collapse;margin-top:20px}
th{background:#f0f0f0;padding:10px 12px;font-size:12px;text-align:left}
td{padding:10px 12px;border-bottom:1px solid #eee;font-size:13px;vertical-align:top}
.disc{font-size:11px;color:#999;margin-top:40px;border-top:1px solid #eee;padding-top:16px}</style></head>
<body><h1>Drug Repurposing Assistant — Analysis Report</h1>
<p style="color:#555;font-size:13px">Query: <b>${data.query}</b> · Generated: ${new Date().toLocaleString()}</p>
<p style="font-size:16px;font-weight:bold;margin:20px 0">${verdict} — Score: ${Math.round((gov.final_score||0)*100)}/85</p>
<p style="font-size:13px;color:#334155">${gov.reasoning||''}</p>
<p style="margin-top:8px;font-size:13px;color:#334155"><b>Recommendation:</b> ${gov.recommendation||''}</p>
<table><thead><tr><th>Agent</th><th>Supports</th><th>Confidence</th><th>Summary</th></tr></thead>
<tbody>${rows}</tbody></table>
<p class="disc">DISCLAIMER: Computationally synthesized for research prioritization only. Not medical advice.
All hypotheses require experimental and clinical validation. Drug Repurposing Assistant v2.0 — SVCE AD22811.</p>
</body></html>`
}

export default function ExportButton({ data }) {
  const [open, setOpen] = useState(false)

  const exportJSON = () => {
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    const a = document.createElement('a')
    a.href = URL.createObjectURL(blob)
    a.download = `drug_repurposing_${data.query.replace(/\s+/g,'_')}.json`
    a.click(); URL.revokeObjectURL(a.href); setOpen(false)
  }

  const exportHTML = () => {
    const blob = new Blob([buildHTML(data)], { type: 'text/html' })
    const a = document.createElement('a')
    a.href = URL.createObjectURL(blob)
    a.download = `drug_repurposing_${data.query.replace(/\s+/g,'_')}.html`
    a.click(); URL.revokeObjectURL(a.href); setOpen(false)
  }

  const exportPDF = async () => {
    try {
      const response = await axios.get(`/api/report/${data.session_id}`, { responseType: 'blob' })
      const blob = new Blob([response.data], { type: 'application/pdf' })
      const a = document.createElement('a')
      a.href = URL.createObjectURL(blob)
      a.download = `drug_repurposing_${data.query.replace(/\s+/g,'_')}.pdf`
      a.click(); URL.revokeObjectURL(a.href)
    } catch (e) {
      alert('PDF generation failed. Make sure the backend is running.')
    }
    setOpen(false)
  }

  const btnStyle = {
    display: 'flex', alignItems: 'center', gap: 10, width: '100%',
    background: 'none', border: 'none', color: 'var(--text)',
    padding: '11px 16px', cursor: 'pointer', fontSize: 13,
    fontFamily: 'inherit', textAlign: 'left', transition: 'background 0.1s'
  }

  return (
    <div style={{ position: 'relative', display: 'inline-block' }}>
      <button onClick={() => setOpen(o => !o)}
              style={{ display: 'flex', alignItems: 'center', gap: 8,
                       background: 'var(--bg2)', border: '1px solid var(--border)',
                       color: 'var(--text)', borderRadius: 10, padding: '8px 16px',
                       fontSize: 13, cursor: 'pointer', fontFamily: 'inherit' }}
              onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--accent)'}
              onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border)'}>
        <Download size={14} /> Export
      </button>
      {open && (
        <div style={{ position: 'absolute', top: '100%', right: 0, marginTop: 8,
                       background: 'var(--bg3)', border: '1px solid var(--border)',
                       borderRadius: 10, overflow: 'hidden', zIndex: 50, minWidth: 180,
                       boxShadow: '0 8px 24px rgba(0,0,0,0.4)' }}>
          {[
            { icon: FileDown,  label: 'Download PDF',       fn: exportPDF  },
            { icon: FileText,  label: 'Export HTML Report', fn: exportHTML },
            { icon: FileJson,  label: 'Export JSON',        fn: exportJSON },
          ].map(({ icon: Icon, label, fn }) => (
            <button key={label} onClick={fn} style={btnStyle}
                    onMouseEnter={e => e.currentTarget.style.background = 'var(--border)'}
                    onMouseLeave={e => e.currentTarget.style.background = 'none'}>
              <Icon size={14} color="var(--muted)" /> {label}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}