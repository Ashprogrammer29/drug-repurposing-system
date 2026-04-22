import asyncio
from typing import Dict, Any
from agents.safety_agent import SafetyAgent
from agents.literature_agent import LiteratureAgent
from agents.mechanistic_agent import MechanisticAgent
from agents.clinical_agent import ClinicalAgent
from agents.market_agent import MarketAgent
from agents.patent_agent import PatentAgent
from core.contradiction_detector import detect_contradictions
from governance.decision_engine import make_decision

# HELPER: Runs synchronous agent code in a background thread
async def run_agent_async(agent_instance, query: str):
    return await asyncio.to_thread(agent_instance.evaluate, query)

async def node_safety(state):
    print("\n[Graph:Stage1] Executing Safety Protocol...")
    safety_result = await run_agent_async(SafetyAgent(), state["query"])
    
    # Mastery Rule: Indication overlap check
    query_disease = state.get("disease_norm", "").lower()
    if query_disease and query_disease in safety_result.summary.lower():
        return {"safety_cleared": True, "agent_results": [safety_result]}

    if safety_result.supports and safety_result.overall_confidence > 0.45:
        return {"safety_cleared": False, "agent_results": [safety_result]}
    
    return {"safety_cleared": True, "agent_results": [safety_result]}

async def node_primary(state):
    print("\n[Graph:Stage2] Parallel Research: Literature + Mechanistic")
    # Both agents fire at once
    results = await asyncio.gather(
        run_agent_async(LiteratureAgent(), state["query"]),
        run_agent_async(MechanisticAgent(), state["query"])
    )
    return {"agent_results": state["agent_results"] + list(results)}

async def node_secondary(state):
    print("\n[Graph:Stage3] Parallel Validation: Clinical + Market + Patent")
    # All three agents fire at once
    results = await asyncio.gather(
        run_agent_async(ClinicalAgent(), state["query"]),
        run_agent_async(MarketAgent(), state["query"]),
        run_agent_async(PatentAgent(), state["query"])
    )
    return {"agent_results": state["agent_results"] + list(results)}

async def node_governance(state):
    print("\n[Graph:Stage4] Synthesizing Agentic AI Governance Verdict...")
    results = state["agent_results"]
    state["contradictions"] = detect_contradictions(results)
    state["governance"] = make_decision(results, state["contradictions"])
    return state