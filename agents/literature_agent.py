from agents.base_agent import BaseAgent
from models import AgentResult

# Scoring Constants for Scientific Weighting
RAG_WEIGHT = 0.7
META_BOOST = 0.3  # Derived from evidence volume in chunks
CURRENT_YEAR = 2026

class LiteratureAgent(BaseAgent):
    def __init__(self, data_path="data/documents/literature"):
        # Explicitly call super without path hacks
        super().__init__("Literature Agent", "literature", data_path)

    def evaluate(self, query: str, stage: str = "Stage 2") -> AgentResult:
        """
        Executes literature reasoning with automated reflection and 
        grounded confidence scoring.
        """
        # 1. Run RAG with Reflection (Defined in BaseAgent)
        rag_output, reflection_log = self.run_with_reflection(query)
        
        # 2. Build initial result object
        result = self.build_agent_result(rag_output, reflection_log, stage)
        
        # 3. Apply Grounded Confidence (Internal Logic only)
        if not result.rejected:
            # We ground the confidence based on the number of unique chunks retrieved
            # This rewards higher 'Evidence Volume'
            chunk_count = len(rag_output.get("raw_chunks", []))
            volume_bonus = min(0.15, chunk_count * 0.03)
            
            # Update the confidence across the result and evidence sub-object
            final_conf = self.cap_confidence(
                (RAG_WEIGHT * result.overall_confidence) + volume_bonus
            )
            
            result.overall_confidence = final_conf
            if result.evidences:
                result.evidences[0].confidence = final_conf
                
        return result