from typing import List
from models import EvidenceProfile, ContradictionFlag, GovernanceDecision
from governance.scorer import compute_governance_score

# Thresholds for final verdict
APPROVAL_THRESHOLD    = 0.55
CONDITIONAL_THRESHOLD = 0.30

def make_decision(profile: EvidenceProfile, contradictions: List[ContradictionFlag]) -> GovernanceDecision:
    """
    Final arbiter of the drug repurposing pipeline. 
    Combines weighted agent scores, safety gates, and quality validation.
    """
    # 1. Check for Validation (Strictness check)
    from core.validation_layer import validate_evidence
    validation = validate_evidence(profile.agent_results, contradictions)
    
    # 2. Compute Scores
    scoring = compute_governance_score(profile.agent_results, contradictions)
    final   = scoring["final_score"]
    
    # 3. Enhanced Safety Hard-Gate
    # We only zero the score if a Safety Agent exists, flags a signal, 
    # AND has a confidence level high enough to be taken seriously (>0.45).
    safety_agent = next((r for r in profile.agent_results if r.agent_name == "Safety Agent"), None)
    
    safety_triggered = False
    if scoring["safety_zeroed"]:
        if safety_agent and safety_agent.overall_confidence > 0.45:
            safety_triggered = True
        else:
            # Override Scorer: The safety signal was too weak/noisy to zero the whole project
            print(f"  [DecisionEngine] Overriding Scorer: Safety signal confidence ({safety_agent.overall_confidence if safety_agent else 0:.2f}) too low to reject.")
            safety_triggered = False
            # Recalculate 'final' if scorer forced it to 0.0 but we want the raw_score back
            if final == 0.0:
                final = scoring["raw_score"]

    # Priority 1: High-Confidence Safety Halt
    if safety_triggered:
        return GovernanceDecision(
            verdict="REJECTED", final_score=0.0, raw_score=0.0, safety_zeroed=True,
            domain_scores={}, penalties_applied=scoring["penalties_applied"],
            inter_agent_boost=0.0,
            reasoning="High-confidence safety signals identified. Score forced to zero for reliability.",
            recommendation="Do not proceed. Resolve specific safety signals before any reconsideration.",
            confidence_label="Insufficient"
        )

    # Priority 2: Quality Gate Check
    if not validation.passed:
        return GovernanceDecision(
            verdict="REJECTED", final_score=final, raw_score=scoring["raw_score"],
            safety_zeroed=False, domain_scores=scoring["domain_scores"],
            penalties_applied=scoring["penalties_applied"] + [f"Quality Gate: {validation.reason}"],
            inter_agent_boost=scoring["inter_agent_boost"],
            reasoning=f"System failed quality validation: {validation.reason}",
            recommendation="Gather more evidence. Current data volume or quality is insufficient for a verdict.",
            confidence_label="Insufficient"
        )

    # Priority 3: Threshold Scoring
    if final >= APPROVAL_THRESHOLD:
        return GovernanceDecision(
            verdict="APPROVED", final_score=final, raw_score=scoring["raw_score"],
            safety_zeroed=False, domain_scores=scoring["domain_scores"],
            penalties_applied=scoring["penalties_applied"],
            inter_agent_boost=scoring["inter_agent_boost"],
            reasoning=(f"Strong cross-domain signal ({final:.2f}) meeting approval threshold. "
                       f"Evidence converged from {len(profile.supporting_domains)} domains."),
            recommendation=("This drug-disease pair is computationally identified as a candidate "
                            "for translational research investigation. Experimental validation required."),
            confidence_label="High" if final >= 0.70 else "Moderate"
        )

    if final >= CONDITIONAL_THRESHOLD:
        return GovernanceDecision(
            verdict="CONDITIONAL", final_score=final, raw_score=scoring["raw_score"],
            safety_zeroed=False, domain_scores=scoring["domain_scores"],
            penalties_applied=scoring["penalties_applied"],
            inter_agent_boost=scoring["inter_agent_boost"],
            reasoning=(f"Score {final:.2f} above minimum signal threshold {CONDITIONAL_THRESHOLD} "
                       f"but below approval threshold {APPROVAL_THRESHOLD}."),
            recommendation="Deeper domain investigation recommended before advancing.",
            confidence_label="Low"
        )

    # Fallback: General Rejection
    return GovernanceDecision(
        verdict="REJECTED", final_score=final, raw_score=scoring["raw_score"],
        safety_zeroed=False, domain_scores=scoring["domain_scores"],
        penalties_applied=scoring["penalties_applied"],
        inter_agent_boost=scoring["inter_agent_boost"],
        reasoning=f"Score {final:.2f} below minimum threshold {CONDITIONAL_THRESHOLD}. Insufficient evidence.",
        recommendation="No research advancement recommended based on current evidence.",
        confidence_label="Insufficient"
    )