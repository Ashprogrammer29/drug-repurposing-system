import sys, os
sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))
from agents.base_agent import BaseAgent
from models import AgentResult

class MarketAgent(BaseAgent):
    def __init__(self, data_path="data/documents/market"):
        super().__init__("Market Agent","market",data_path)
    
    def evaluate(self, query: str, stage: str = "Stage 3") -> AgentResult:
        rag_output, reflection_log = self.run_with_reflection(query)
        return self.build_agent_result(rag_output, reflection_log, stage)

    def run(self, query: str, stage: str = "") -> AgentResult:
        rag_output, reflection_log = self.run_with_reflection(query)
        return self.build_agent_result(rag_output, reflection_log, stage)
    
    