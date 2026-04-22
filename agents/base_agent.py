from abc import ABC, abstractmethod
from models import AgentResult, Evidence, ReflectionLog
from core.rag_chain import RAGChain
from core.vector_store import build_vector_store

REFLECTION_THRESHOLD = 0.3
DOMAIN_HINTS = {
    "literature":  "research evidence publication",
    "clinical":    "clinical trial outcome phase",
    "safety":      "adverse event toxicity warning",
    "market":      "drug availability approval",
    "mechanistic": "biological pathway mechanism",
    "patents":     "patent intellectual property claim",
}

class BaseAgent(ABC):
    CONFIDENCE_CAP = 0.85

    def __init__(self, name, domain, data_path):
        self.name      = name # Linked to SafetyAgent's use
        self.domain    = domain
        self.data_path = data_path
        # Standardized RAG initialization
        self.rag       = RAGChain(build_vector_store(domain, data_path), domain)

    def cap_confidence(self, v): 
        return min(self.CONFIDENCE_CAP, float(v))

    def _reformulate(self, query):
        parts = query.replace("-"," ").replace("'","").split()
        return f"{' '.join(parts)} {DOMAIN_HINTS.get(self.domain,'biomedical')}"

    def run_with_reflection(self, query):
        log = []
        out = self.rag.run(query)
        c1, r1 = out.get("confidence", 0.0), out.get("rejected", False)
        log.append(ReflectionLog(step=1, query=query, confidence=c1, rejected=r1, reasoning="initial attempt"))
        
        if r1 or c1 < REFLECTION_THRESHOLD:
            reason = "rejected" if r1 else f"confidence {c1:.2f} < {REFLECTION_THRESHOLD}"
            print(f"   [{self.name}] Reflecting — {reason}")
            fb  = self._reformulate(query)
            out = self.rag.run(fb)
            c2, r2 = out.get("confidence", 0.0), out.get("rejected", False)
            log.append(ReflectionLog(step=2, query=fb, confidence=c2, rejected=r2, reasoning=f"retry after: {reason}"))
        return out, log

    def build_agent_result(self, rag_output, reflection_log, stage=""):
        if rag_output.get("rejected"):
            return AgentResult(
                agent_name=self.name, evidences=[], overall_confidence=0.0,
                safety_flag=False, summary="Evidence rejected — LLM output invalid.",
                supports=False, raw_chunks=rag_output.get("raw_chunks",[]),
                rejected=True, reflection_log=reflection_log, stage=stage
            )
        
        ev = Evidence(
            source=self.domain, 
            finding=rag_output.get("summary",""),
            confidence=self.cap_confidence(rag_output.get("confidence",0.0)),
            contradiction=rag_output.get("contradiction",False)
        )
        
        return AgentResult(
            agent_name=self.name, evidences=[ev],
            overall_confidence=ev.confidence, safety_flag=(self.domain == "safety"),
            summary=rag_output.get("summary",""), supports=rag_output.get("supports",False),
            raw_chunks=rag_output.get("raw_chunks",[]),
            reflection_log=reflection_log, stage=stage
        )

    @abstractmethod
    def evaluate(self, query: str) -> AgentResult:
        pass