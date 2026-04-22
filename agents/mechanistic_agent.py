from agents.base_agent import BaseAgent
from models import AgentResult

class MechanisticAgent(BaseAgent):
    def __init__(self, data_path: str = "data/documents/mechanistic"):
        # standardized initialization via BaseAgent
        super().__init__("Mechanistic Agent", "mechanistic", data_path)

    def evaluate(self, query: str, stage: str = "Stage 2") -> AgentResult:
        """
        Analyzes biological pathways and protein-drug interactions.
        """
        # Utilize the automated reflection logic from BaseAgent
        rag_output, reflection_log = self.run_with_reflection(query)
        
        # Build and return the standardized result
        return self.build_agent_result(rag_output, reflection_log, stage)