from pydantic import BaseModel
from typing import List, Optional, Dict


class AnalyzeRequest(BaseModel):
    query: str
    session_id: Optional[str] = None


class EvidenceItem(BaseModel):
    source: str
    finding: str
    confidence: float
    contradiction: bool


class ReflectionLogSchema(BaseModel):
    attempt: int
    query_used: str
    confidence_returned: float
    rejected: bool
    reason: str


class AgentResultSchema(BaseModel):
    agent_name: str
    supports: bool
    overall_confidence: float
    safety_flag: bool
    summary: str
    rejected: bool
    stage: str
    evidences: List[EvidenceItem]
    reflection_log: List[ReflectionLogSchema]


class ContradictionSchema(BaseModel):
    domain_a: str
    domain_b: str
    description: str
    severity: str


class ValidationSchema(BaseModel):
    passed: bool
    reason: str
    non_rejected_count: int
    avg_confidence: float
    min_required_agents: int
    min_required_confidence: float


class ExecutionTraceSchema(BaseModel):
    stage_1_safety: str
    stage_2_primary: List[str]
    stage_3_secondary: List[str]
    halted_at: Optional[str]
    halt_reason: Optional[str]
    validation: Optional[ValidationSchema]
    contradictions: List[ContradictionSchema]
    total_attempts: int


class GovernanceDecisionSchema(BaseModel):
    verdict: str
    final_score: float
    raw_score: float
    safety_zeroed: bool
    domain_scores: Dict[str, float]
    penalties_applied: List[str]
    inter_agent_boost: float
    reasoning: str
    recommendation: str
    confidence_label: str


class AnalyzeResponse(BaseModel):
    session_id: str
    query: str
    normalized_query: Optional[str]
    drug_canonical: Optional[str]
    disease_canonical: Optional[str]
    safety_cleared: bool
    support_count: int
    total_confidence: float
    supporting_domains: List[str]
    opposing_domains: List[str]
    neutral_domains: List[str]
    agent_results: List[AgentResultSchema]
    execution_trace: Optional[ExecutionTraceSchema]
    governance: Optional[GovernanceDecisionSchema]
    pipeline_status: Optional[dict] = None


class SessionSummary(BaseModel):
    session_id: str
    query: str
    normalized_query: str
    verdict: str
    final_score: float
    support_count: int
    created_at: str


class SessionListResponse(BaseModel):
    sessions: List[SessionSummary]
    total: int