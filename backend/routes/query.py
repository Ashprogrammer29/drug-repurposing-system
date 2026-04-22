import sys, os
sys.path.insert(0, os.path.join(os.path.dirname(__file__), "..", ".."))

from fastapi import APIRouter, HTTPException
from backend.schemas import AnalyzeRequest, AnalyzeResponse
from backend.db import save_session, save_audit_log, generate_session_id
from data_pipeline.pipeline_runner import run_pipeline
# IMPORTANT: Import the new async runner
from graph.pipeline import run_graph_async 
from backend.routes._serializers import serialize_response
from backend.models import AgentState

router = APIRouter()

@router.post("/analyze", response_model=AnalyzeResponse)
async def analyze(request: AnalyzeRequest):
    query = request.query.strip()
    if not query:
        raise HTTPException(status_code=400, detail="Query cannot be empty.")

    session_id = request.session_id or generate_session_id()

    # Step 1: Data Pipeline (Fetching PubMed/Clinical data)
    try:
        # Note: If run_pipeline is slow, it's usually network-bound.
        pipeline_status = run_pipeline(query)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Pipeline failed: {e}")

    # Step 2: Agentic AI Graph Execution (THE SPEED FIX)
    try:
        # We use 'await' with 'run_graph_async' to trigger parallel processing
        final_state = await run_graph_async(query, session_id)
    except Exception as e:
        print(f"[Graph Error]: {e}")
        raise HTTPException(status_code=500, detail=f"Agentic AI execution failed: {e}")

    # Step 3: Serialize response
    response = serialize_response(session_id, query, pipeline_status, final_state)

    # Step 4: Persist to MongoDB
    try:
        session_doc = {
            "session_id":       session_id,
            "query":            query,
            "normalized_query": pipeline_status.get("normalized_query", query),
            "drug_canonical":   pipeline_status.get("drug_canonical", ""),
            "disease_canonical":pipeline_status.get("disease_canonical", ""),
            "verdict":          response.governance.verdict if response.governance else "UNKNOWN",
            "final_score":      response.governance.final_score if response.governance else 0.0,
            "support_count":    response.support_count,
            "pipeline_status":  pipeline_status,
            "full_response":    response.dict()
        }
        await save_session(session_doc)
        await save_audit_log(session_id, "analysis_complete", {
            "verdict": session_doc["verdict"],
            "score":   session_doc["final_score"]
        })
    except Exception as e:
        print(f"[DB] Session save failed: {e}")

    return response