import { CheckCircle, XCircle, AlertTriangle, MinusCircle, RotateCcw } from 'lucide-react'

const COLORS = {
  'Safety Agent':'#ef4444','Literature Agent':'#6366f1','Clinical Agent':'#3b82f6',
  'Patent Agent':'#f59e0b','Market Agent':'#10b981','Mechanistic Agent':'#8b5cf6'
}
const STAGE_LABELS = {stage_1:'Safety Gate',stage_2:'Primary',stage_3:'Secondary'}

function Bar({value}){
  const pct=Math.round(value*100)
  const c=value>=0.6?'#10b981':value>=0.3?'#f59e0b':'#ef4444'
  return(
    <div style={{marginTop:10}}>
      <div style={{display:'flex',justifyContent:'space-between',marginBottom:4}}>
        <span style={{fontSize:11,color:'var(--muted)'}}>Confidence</span>
        <span style={{fontSize:11,color:c,fontWeight:600}}>{pct}%</span>
      </div>
      <div style={{height:4,background:'var(--border)',borderRadius:2,overflow:'hidden'}}>
        <div style={{width:`${pct}%`,height:'100%',background:c,borderRadius:2,transition:'width 0.8s ease'}}/>
      </div>
    </div>
  )
}

export default function AgentCard({agent}){
  const color=COLORS[agent.agent_name]||'#64748b'
  const reflected=agent.reflection_log&&agent.reflection_log.length>1
  const Icon=agent.rejected?MinusCircle:agent.safety_flag?AlertTriangle:agent.supports?CheckCircle:XCircle
  const sc=agent.rejected?'var(--muted)':agent.safety_flag?'#ef4444':agent.supports?'#10b981':'#ef4444'
  const sl=agent.rejected?'Rejected':agent.safety_flag?'Safety Flag':agent.supports?'Supports':'No Support'
  return(
    <div style={{background:'var(--bg2)',border:'1px solid var(--border)',borderLeft:`3px solid ${color}`,
                 borderRadius:12,padding:'16px 18px',transition:'transform 0.15s'}}
         onMouseEnter={e=>{e.currentTarget.style.transform='translateY(-2px)'}}
         onMouseLeave={e=>{e.currentTarget.style.transform='translateY(0)'}}>
      <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:6}}>
        <div>
          <span style={{fontSize:13,fontWeight:600,color}}>{agent.agent_name}</span>
          {agent.stage&&<span style={{marginLeft:8,fontSize:10,color:'var(--muted)',
                                      background:'var(--bg3)',borderRadius:4,padding:'1px 6px',
                                      border:'1px solid var(--border)'}}>
            {STAGE_LABELS[agent.stage]||agent.stage}
          </span>}
        </div>
        <div style={{display:'flex',alignItems:'center',gap:5}}>
          <Icon size={14} color={sc}/><span style={{fontSize:11,color:sc,fontWeight:500}}>{sl}</span>
        </div>
      </div>
      <p style={{fontSize:12,color:'var(--muted)',lineHeight:1.5,minHeight:36}}>{agent.summary}</p>
      {reflected&&<div style={{display:'flex',alignItems:'center',gap:5,marginTop:8,fontSize:11,color:'#f59e0b'}}>
        <RotateCcw size={11}/><span>Reflected — query reformulated after low confidence</span>
      </div>}
      <Bar value={agent.overall_confidence}/>
    </div>
  )
}
