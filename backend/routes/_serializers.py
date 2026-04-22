import sys, os
sys.path.insert(0, os.path.join(os.path.dirname(__file__), "..", ".."))
 
from backend.schemas import (
    AnalyzeResponse, AgentResultSchema, EvidenceItem,
    ReflectionLogSchema, ExecutionTraceSchema, ValidationSchema,
    ContradictionSchema, GovernanceDecisionSchema
)
 
 
def serialize_response(session_id, query, pipeline_status, state) -> AnalyzeResponse:
    profile  = state.get("profile")
    gov      = state.get("governance")
    trace    = state.get("trace")
    contras  = state.get("contradictions", [])
 
    agent_schemas = []
    agent_results = profile.agent_results if profile else []
 
    for r in agent_results:
        evidences = [
            EvidenceItem(source=e.source, finding=e.finding,
                         confidence=e.confidence, contradiction=e.contradiction)
            for e in r.evidences
        ]
        reflection_logs = [
            ReflectionLogSchema(
                attempt=rl.attempt, query_used=rl.query_used,
                confidence_returned=rl.confidence_returned,
                rejected=rl.rejected, reason=rl.reason
            ) for rl in r.reflection_log
        ]
        agent_schemas.append(AgentResultSchema(
            agent_name=r.agent_name, supports=r.supports,
            overall_confidence=r.overall_confidence,
            safety_flag=r.safety_flag, summary=r.summary,
            rejected=r.rejected, stage=r.stage,
            evidences=evidences, reflection_log=reflection_logs
        ))
 
    exec_trace = None
    if trace:
        exec_trace = ExecutionTraceSchema(
            stage_1_safety=trace.stage_1_safety,
            stage_2_primary=trace.stage_2_primary,
            stage_3_secondary=trace.stage_3_secondary,
            halted_at=trace.halted_at,
            halt_reason=trace.halt_reason,
            validation=ValidationSchema(
                passed=trace.validation.passed,
                reason=trace.validation.reason,
                non_rejected_count=trace.validation.non_rejected_count,
                avg_confidence=trace.validation.avg_confidence,
                min_required_agents=trace.validation.min_required_agents,
                min_required_confidence=trace.validation.min_required_confidence
            ) if trace.validation else None,
            contradictions=[
                ContradictionSchema(
                    domain_a=c.domain_a, domain_b=c.domain_b,
                    description=c.description, severity=c.severity
                ) for c in contras
            ],
            total_attempts=trace.total_attempts
        )
 
    gov_schema = None
    if gov:
        gov_schema = GovernanceDecisionSchema(
            verdict=gov.verdict, final_score=gov.final_score,
            raw_score=gov.raw_score, safety_zeroed=gov.safety_zeroed,
            domain_scores=gov.domain_scores,
            penalties_applied=gov.penalties_applied,
            inter_agent_boost=gov.inter_agent_boost,
            reasoning=gov.reasoning, recommendation=gov.recommendation,
            confidence_label=gov.confidence_label
        )
 
    safety_result = next(
        (r for r in agent_results if r.agent_name == "Safety Agent"), None
    )
    safety_cleared = not (safety_result and safety_result.safety_flag)
 
    return AnalyzeResponse(
        session_id=session_id,
        query=query,
        normalized_query=pipeline_status.get("normalized_query"),
        drug_canonical=pipeline_status.get("drug_canonical"),
        disease_canonical=pipeline_status.get("disease_canonical"),
        safety_cleared=safety_cleared,
        support_count=profile.support_count if profile else 0,
        total_confidence=profile.total_confidence if profile else 0.0,
        supporting_domains=profile.supporting_domains if profile else [],
        opposing_domains=profile.opposing_domains if profile else [],
        neutral_domains=profile.neutral_domains if profile else [],
        agent_results=agent_schemas,
        execution_trace=exec_trace,
        governance=gov_schema,
        pipeline_status=pipeline_status
    )