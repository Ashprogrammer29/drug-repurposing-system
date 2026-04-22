import { useState } from 'react'
import { Search, Loader2, FlaskConical } from 'lucide-react'

const EXAMPLES = [
  "Metformin - Alzheimer's Disease",
  "Aspirin - Colorectal Cancer",
  "Sildenafil - Pulmonary Hypertension",
  "Rapamycin - Aging",
  "Thalidomide - Multiple Myeloma",
]

export default function QueryInput({ onSubmit, loading }) {
  const [query, setQuery] = useState('')
  const submit = () => { if (query.trim() && !loading) onSubmit(query.trim()) }
  return (
    <div style={{width:'100%',maxWidth:760,margin:'0 auto'}}>
      <div style={{display:'flex',gap:12,alignItems:'center',background:'var(--bg2)',
                   border:'1px solid var(--border)',borderRadius:14,padding:'10px 16px',
                   boxShadow:'0 0 40px rgba(59,130,246,0.06)'}}>
        <FlaskConical size={20} color="var(--accent)" style={{flexShrink:0}}/>
        <input value={query} onChange={e=>setQuery(e.target.value)}
               onKeyDown={e=>e.key==='Enter'&&submit()}
               placeholder="Enter drug-disease pair  e.g. Metformin - Alzheimer's Disease"
               style={{flex:1,background:'transparent',border:'none',outline:'none',
                       color:'var(--text)',fontSize:15,fontFamily:'inherit'}}/>
        <button onClick={submit} disabled={loading||!query.trim()}
                style={{display:'flex',alignItems:'center',gap:8,
                        background:loading?'var(--border)':'var(--accent)',
                        color:'#fff',border:'none',borderRadius:10,
                        padding:'8px 20px',cursor:loading?'not-allowed':'pointer',
                        fontSize:14,fontWeight:500,fontFamily:'inherit',transition:'background 0.2s',whiteSpace:'nowrap'}}>
          {loading?<><Loader2 size={15} style={{animation:'spin 1s linear infinite'}}/> Analyzing...</>
                  :<><Search size={15}/> Analyze</>}
        </button>
      </div>
      <div style={{display:'flex',gap:8,flexWrap:'wrap',marginTop:14}}>
        <span style={{fontSize:12,color:'var(--muted)',alignSelf:'center'}}>Try:</span>
        {EXAMPLES.map(ex=>(
          <button key={ex} onClick={()=>setQuery(ex)}
                  style={{background:'var(--bg3)',border:'1px solid var(--border)',
                          color:'var(--muted)',borderRadius:20,padding:'4px 12px',
                          fontSize:12,cursor:'pointer',fontFamily:'inherit',transition:'all 0.15s'}}
                  onMouseEnter={e=>{e.target.style.borderColor='var(--accent)';e.target.style.color='var(--text)'}}
                  onMouseLeave={e=>{e.target.style.borderColor='var(--border)';e.target.style.color='var(--muted)'}}>
            {ex}
          </button>
        ))}
      </div>
      <style>{`@keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}`}</style>
    </div>
  )
}