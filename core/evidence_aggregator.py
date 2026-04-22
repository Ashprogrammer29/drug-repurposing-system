import sys, os
sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))
from typing import List
from models import AgentResult, EvidenceProfile

class EvidenceAggregator:
    def aggregate(self, results: List[AgentResult]) -> EvidenceProfile:
        supporting, opposing, neutral = [], [], []
        total_conf = 0.0
        non_safety = [r for r in results if r.agent_name != "Safety Agent"]
        for r in non_safety:
            total_conf += r.overall_confidence
            if r.supports:              supporting.append(r.agent_name)
            elif r.overall_confidence > 0: opposing.append(r.agent_name)
            else:                          neutral.append(r.agent_name)
        avg = total_conf / len(non_safety) if non_safety else 0.0
        return EvidenceProfile(
            supporting_domains=supporting, opposing_domains=opposing,
            neutral_domains=neutral, support_count=len(supporting),
            total_confidence=round(avg,4), agent_results=results
        )
