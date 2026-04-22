from agents.base_agent import BaseAgent
from models import AgentResult

class SafetyAgent(BaseAgent):
    def __init__(self, data_path: str = "data/documents/safety"):
        super().__init__("Safety Agent", "safety", data_path)
        # Precaution filter to prevent Metformin "False Halts"
        self.ignore_keywords = ["contraindicated", "precaution", "dosage", "renal impairment", "monitoring"]

    def evaluate(self, query: str) -> AgentResult:
        # Use your Reflection logic!
        result, log = self.run_with_reflection(query)
        
        # Handle failures/hallucinations
        if result.get("rejected") or result.get("confidence", 0) < 0.2:
            return self.build_agent_result(
                {"supports": False, "confidence": 0.1, "summary": "No clear safety signals found.", "raw_chunks": result.get("raw_chunks", [])},
                log, "Stage 1"
            )

        summary = result.get("summary", "").lower()
        supports = result.get("supports", False)

        # Apply the "Precaution Filter"
        if supports and any(word in summary for word in self.ignore_keywords):
            result["supports"] = False
            result["summary"] = f"Standard precaution mention, not a direct toxicity flag. Original: {summary}"

        return self.build_agent_result(result, log, "Stage 1")