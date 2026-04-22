import sys, os
sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))
from agents.base_agent import BaseAgent
from models import AgentResult
from data_pipeline.clinical_fetcher import load_clinical_metadata

class ClinicalAgent(BaseAgent):
    def __init__(self, data_path="data/documents/clinical"):
        super().__init__("Clinical Agent","clinical",data_path)
        self.data_path = data_path
        
    def evaluate(self, query: str, stage: str = "Stage 3") -> AgentResult:
        # Standardized reflection logic
        rag_output, reflection_log = self.run_with_reflection(query)
        return self.build_agent_result(rag_output, reflection_log, stage)

    def run(self, query: str, stage: str = "") -> AgentResult:
        rag_output, reflection_log = self.run_with_reflection(query)
        result = self.build_agent_result(rag_output, reflection_log, stage)
        if not result.rejected:
            meta = load_clinical_metadata(self.data_path, query)
            if meta:
                grounded = meta.get("grounded_confidence")
                if grounded is not None:
                    blended = 0.7*grounded + 0.3*rag_output.get("confidence",0.0)
                    result.overall_confidence = round(self.cap_confidence(blended), 4)
                    if result.evidences:
                        result.evidences[0].confidence = result.overall_confidence
                phases   = meta.get("phases",[])
                statuses = meta.get("statuses",[])
                term = sum(1 for s in statuses if s in ("TERMINATED","WITHDRAWN","SUSPENDED"))
                if term > 0 and "PHASE2" in phases and "PHASE3" not in phases:
                    result.summary += f" [Phase 2 dropout: {term} trial(s) terminated without Phase 3 progression.]"
        return result
