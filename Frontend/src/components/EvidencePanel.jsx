import { RadarChart,Radar,PolarGrid,PolarAngleAxis,ResponsiveContainer,Tooltip } from 'recharts'

const SHORT = {
  'Literature Agent':'Literature','Clinical Agent':'Clinical','Patent Agent':'Patents',
  'Market Agent':'Market','Mechanistic Agent':'Mechanistic','Safety Agent':'Safety'
}

export default function EvidencePanel({data}){
  if(!data||!data.agent_results) return null
  const radarData = data.agent_results.map(r=>({
    domain: SHORT[r.agent_name]||r.agent_name,
    confidence: Math.round(r.overall_confidence*100),
    fullMark: 85
  }))
  return(
    <div style={{background:'var(--bg2)',border:'1px solid var(--border)',borderRadius:14,padding:24}}>
      <h3 style={{fontSize:13,fontWeight:600,color:'var(--muted)',marginBottom:20,
                  textTransform:'uppercase',letterSpacing:'0.08em'}}>Domain Confidence Radar</h3>
      <ResponsiveContainer width="100%" height={260}>
        <RadarChart data={radarData} margin={{top:10,right:30,bottom:10,left:30}}>
          <PolarGrid stroke="#1e2d50"/>
          <PolarAngleAxis dataKey="domain" tick={{fill:'#64748b',fontSize:11,fontFamily:'Inter'}}/>
          <Radar name="Confidence" dataKey="confidence" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.2} strokeWidth={2}/>
          <Tooltip contentStyle={{background:'var(--bg3)',border:'1px solid var(--border)',borderRadius:8,fontSize:12,color:'var(--text)'}}
                   formatter={v=>[`${v}%`,'Confidence']}/>
        </RadarChart>
      </ResponsiveContainer>
      <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:10,marginTop:16}}>
        {[{label:'Supporting',count:data.supporting_domains.length,color:'#10b981'},
          {label:'Opposing',  count:data.opposing_domains.length,  color:'#ef4444'},
          {label:'Neutral',   count:data.neutral_domains.length,   color:'#64748b'}
        ].map(({label,count,color})=>(
          <div key={label} style={{background:'var(--bg3)',borderRadius:10,padding:'12px 16px',textAlign:'center'}}>
            <div style={{fontSize:22,fontWeight:700,color}}>{count}</div>
            <div style={{fontSize:11,color:'var(--muted)',marginTop:2}}>{label}</div>
          </div>
        ))}
      </div>
    </div>
  )
}