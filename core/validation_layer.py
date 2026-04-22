import sys, os
sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))
from typing import List
from models import AgentResult, ContradictionFlag, ValidationResult

# ADJUSTED: Set to 2 for better Recall in resource-constrained environments
MIN_AGENTS, MIN_CONF = 2, 0.20 

def validate_evidence(results: List[AgentResult], contradictions: List[ContradictionFlag]) -> ValidationResult:
    non_safety   = [r for r in results if r.agent_name != "Safety Agent"]
    non_rejected = [r for r in non_safety if not r.rejected]
    
    # Calculate average confidence of agents that actually returned something
    avg_conf     = sum(r.overall_confidence for r in non_rejected)/len(non_rejected) if non_rejected else 0.0
    critical     = [c for c in contradictions if c.severity == "critical"]

    if len(non_rejected) < MIN_AGENTS:
        return ValidationResult(
            passed=False,
            reason=f"Only {len(non_rejected)}/{MIN_AGENTS} agents found sufficient evidence.",
            non_rejected_count=len(non_rejected), avg_confidence=round(avg_conf,4),
            min_required_agents=MIN_AGENTS, min_required_confidence=MIN_CONF
        )

    if avg_conf < MIN_CONF:
        return ValidationResult(
            passed=False,
            reason=f"Avg confidence {avg_conf:.2f} below minimum {MIN_CONF}.",
            non_rejected_count=len(non_rejected), avg_confidence=round(avg_conf,4),
            min_required_agents=MIN_AGENTS, min_required_confidence=MIN_CONF
        )

    if critical:
        return ValidationResult(
            passed=False,
            reason=f"{len(critical)} critical contradiction(s) detected.",
            non_rejected_count=len(non_rejected), avg_confidence=round(avg_conf,4),
            min_required_agents=MIN_AGENTS, min_required_confidence=MIN_CONF
        )

    return ValidationResult(
        passed=True, reason="Quality gate cleared.",
        non_rejected_count=len(non_rejected), avg_confidence=round(avg_conf,4),
        min_required_agents=MIN_AGENTS, min_required_confidence=MIN_CONF
    )