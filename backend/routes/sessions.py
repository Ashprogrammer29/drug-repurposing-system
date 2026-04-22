import sys, os
sys.path.insert(0, os.path.join(os.path.dirname(__file__), "..", ".."))

from fastapi import APIRouter, HTTPException
from backend.schemas import AnalyzeRequest, AnalyzeResponse
from backend.db import save_session, save_audit_log, generate_session_id
from data_pipeline.pipeline_runner import run_pipeline
from graph.pipeline import run_graph
from backend.routes._serializers import serialize_response

router = APIRouter()


@router.post("/analyze", response_model=AnalyzeResponse)
async def analyze(request: AnalyzeRequest):
    query = request.query.strip()
    if not query:
        raise HTTPException(status_code=400, detail="Query cannot be empty.")

    session_id = request.session_id or generate_session_id()

    # Step 1: data pipeline
    try:
        pipeline_status = run_pipeline(query)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Pipeline failed: {e}")

    # Step 2: LangGraph execution
    try:
        final_state = run_graph(query, session_id)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Graph execution failed: {e}")

    # Step 3: serialize response
    response = serialize_response(session_id, query, pipeline_status, final_state)

    # Step 4: persist to MongoDB
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
        print(f"[DB] Session save failed (non-fatal): {e}")

    return response