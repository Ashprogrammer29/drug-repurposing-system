from typing import List
from models import AgentResult, ContradictionFlag

def detect_contradictions(results: List[AgentResult]) -> List[ContradictionFlag]:
    flags = []
    
    # Compare every agent against every other agent
    for i in range(len(results)):
        for j in range(i + 1, len(results)):
            a = results[i]
            b = results[j]
            
            # Logic: If one supports and the other contradicts (or doesn't support with high confidence)
            # OR if both have explicit 'contradiction' flags set by the LLM
            if (a.supports != b.supports) and (a.overall_confidence > 0.4 and b.overall_confidence > 0.4):
                severity = "high" if (a.overall_confidence > 0.7 and b.overall_confidence > 0.7) else "medium"
                
                flags.append(ContradictionFlag(
                    domains=[a.agent_name, b.agent_name],
                    description=f"Conflict: {a.agent_name} supports ({a.overall_confidence:.2f}) vs {b.agent_name} does not ({b.overall_confidence:.2f}).",
                    severity=severity
                )
            )
            
    return flags