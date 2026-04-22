from typing import List, Optional, Dict, Annotated, TypedDict
from pydantic import BaseModel, Field

# --- Core Evidence Models ---
class Evidence(BaseModel):
    source: str
    finding: str
    confidence: float
    contradiction: bool = False

class ReflectionLog(BaseModel):
    step: int
    query: str
    confidence: float
    rejected: bool
    reasoning: str

class AgentResult(BaseModel):
    agent_name: str
    evidences: List[Evidence] = []
    overall_confidence: float = 0.0
    summary: str = ""
    supports: bool = False
    raw_chunks: List[str] = []
    rejected: bool = False
    reflection_log: List[ReflectionLog] = []
    stage: str = ""
    safety_flag: bool = False

# --- Governance Models ---
class ContradictionFlag(BaseModel):
    domains: List[str]
    description: str
    severity: str # "low", "medium", "high", "critical"

class EvidenceProfile(BaseModel):
    agent_results: List[AgentResult]
    
    @property
    def supporting_domains(self) -> List[str]:
        return [r.agent_name for r in self.agent_results if r.supports]

class GovernanceDecision(BaseModel):
    verdict: str # "APPROVED", "REJECTED", "CONDITIONAL"
    final_score: float
    raw_score: float
    safety_zeroed: bool
    domain_scores: Dict[str, float]
    penalties_applied: List[str]
    inter_agent_boost: float
    reasoning: str
    recommendation: str
    confidence_label: str

class ValidationResult(BaseModel):
    passed: bool
    reason: str
    non_rejected_count: int
    avg_confidence: float
    min_required_agents: int
    min_required_confidence: float

# --- LangGraph State Definition ---
# THIS WAS THE MISSING PART CAUSING YOUR ERROR
class AgentState(TypedDict):
    query: str
    session_id: str
    agent_results: List[AgentResult]
    contradictions: List[ContradictionFlag]
    governance: Optional[GovernanceDecision]
    halted: bool
    halt_reason: str
    halt_stage: str