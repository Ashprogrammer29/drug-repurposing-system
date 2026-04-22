from typing import List, Dict, Any
from models import AgentResult, ContradictionFlag

# Domain Weights: Adjust these based on clinical importance
# Literature & Clinical are the "Heavy Hitters"
WEIGHTS = {
    "safety": 0.30,      # High weight for safety gate
    "literature": 0.25,  # High weight for peer-reviewed evidence
    "clinical": 0.20,    # Real-world human data
    "mechanistic": 0.10, # Biological plausibility
    "market": 0.10,      # Commercial/Regulatory status
    "patents": 0.05      # Intellectual property
}

def compute_governance_score(results: List[AgentResult], contradictions: List[ContradictionFlag]) -> Dict[str, Any]:
    """
    Computes a multi-dimensional score by weighting agent outputs
    and applying penalties for contradictions.
    """
    domain_scores = {}
    raw_score = 0.0
    active_weights_sum = 0.0
    safety_zeroed = False
    penalties = []

    # 1. Process Individual Agent Contributions
    for res in results:
        domain = res.agent_name.lower().split()[0] # Gets 'safety', 'literature', etc.
        weight = WEIGHTS.get(domain, 0.05)
        
        # If agent is rejected or low confidence, we don't count its weight in the average
        # This prevents a 'failed' agent from dragging the score to zero
        if res.rejected or res.overall_confidence < 0.1:
            continue
            
        # Score calculation: support(1 or -1) * confidence * weight
        # supports=True -> +1, supports=False -> 0 (neutral/no evidence)
        support_val = 1.0 if res.supports else 0.0
        contribution = support_val * res.overall_confidence * weight
        
        raw_score += contribution
        active_weights_sum += weight
        domain_scores[domain] = round(contribution, 4)

        # 2. Hard-Gate Safety Check
        if domain == "safety" and res.supports and res.overall_confidence > 0.45:
            safety_zeroed = True

    # 3. Normalize the raw score based on the agents that actually spoke up
    if active_weights_sum > 0:
        normalized_score = raw_score / active_weights_sum
    else:
        normalized_score = 0.0

    # 4. Apply Contradiction Penalties
    # Each medium/high severity contradiction deducts from the final score
    penalty_total = 0.0
    for flag in contradictions:
        if flag.severity == "critical":
            penalty_total += 0.4
            penalties.append("Critical Contradiction Penalty")
        elif flag.severity == "high":
            penalty_total += 0.2
            penalties.append("High Contradiction Penalty")
        elif flag.severity == "medium":
            penalty_total += 0.1
            penalties.append("Medium Contradiction Penalty")

    # 5. Final Calculation
    # We apply an Inter-Agent Boost if more than 3 domains agree
    supporting_count = len([r for r in results if r.supports and r.overall_confidence > 0.5])
    boost = 0.05 if supporting_count >= 3 else 0.0
    
    final_score = max(0.0, min(1.0, normalized_score - penalty_total + boost))

    # If safety was triggered, we force final_score to 0 here. 
    # Note: DecisionEngine can still override this if confidence is too low.
    if safety_zeroed:
        final_score = 0.0

    return {
        "final_score": round(final_score, 4),
        "raw_score": round(normalized_score, 4),
        "safety_zeroed": safety_zeroed,
        "domain_scores": domain_scores,
        "penalties_applied": penalties,
        "inter_agent_boost": boost
    }