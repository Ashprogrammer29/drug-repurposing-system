from langgraph.graph import StateGraph, END
from .nodes import node_safety, node_primary, node_secondary, node_governance
from backend.models import AgentState

def compile_workflow():
    workflow = StateGraph(AgentState)
    
    # Define the "Mental Map" of your Agentic AI
    workflow.add_node("safety", node_safety)
    workflow.add_node("primary", node_primary)
    workflow.add_node("secondary", node_secondary)
    workflow.add_node("governance", node_governance)
    
    # Define Execution Paths
    workflow.set_entry_point("safety")
    
    # Routing Logic: If safety fails, go straight to governance
    workflow.add_conditional_edges(
        "safety",
        lambda x: "governance" if not x.get("safety_cleared") else "primary"
    )
    
    workflow.add_edge("primary", "secondary")
    workflow.add_edge("secondary", "governance")
    workflow.add_edge("governance", END)
    
    return workflow.compile()

# Instantiate the graph
app_graph = compile_workflow()

# THE ASYNC ENGINE
async def run_graph_async(query: str, session_id: str):
    initial_input = {
        "query": query,
        "agent_results": [],
        "safety_cleared": True,
        "session_id": session_id,
        "contradictions": []
    }
    # .ainvoke() allows nodes to run concurrently!
    return await app_graph.ainvoke(initial_inpu