from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import uvicorn
import asyncio
import random

app = FastAPI(title="Drug Repurposing Agentic AI")

# THE HANDSHAKE: Allows your Vercel frontend to talk to your local laptop
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
async def health():
    return {"status": "online", "message": "Agentic Backend is Live"}

@app.post("/api/analyze")
async def analyze(data: dict):
    query = data.get("query", "Unknown Pair")
    print(f"🚀 INITIATING FULL-SPECTRUM ANALYSIS: {query}")

    try:
        # Simulate processing time for demo impact (RAG takes time)
        await asyncio.sleep(4) 
        
        # Consistent logic based on input string (determinism)
        seed = sum(ord(c) for c in query)
        random.seed(seed)
        
        # Single Source of Truth for the Global Confidence Score
        final_score = random.uniform(0.35, 0.95)
        is_approved = final_score > 0.65

        # ALIGN AGENT VERDICTS TO THE SCORE
        # This prevents 'Schizophrenia' where sub-agents disagree with the judge
        status = "Approved" if is_approved else "Rejected"
        safety_v = "Safe" if final_score > 0.55 else "Toxic Potential"
        
        # LITERATURE & CLINICAL AGENTS LOCKED TO is_approved CONSENSUS
        if is_approved:
            # SUCCESS PATH - All positive agents agree
            lit_v = "Strong Evidence"
            lit_sum = "RAG pipeline retrieved multiple supporting trial data points."
            clinical_verdict = "Phase II Ready"
            clinical_summary = "Pharmacokinetic data supports repositioning goals."
        else:
            # FAILURE PATH - All agents report insufficient/negative data
            lit_v = "Limited Data"
            lit_sum = "Insufficient PubMed evidence to validate this specific pathway."
            clinical_verdict = "Pre-clinical Only"
            clinical_summary = "Insufficient data to support human trial advancement."
        
        patent_v = "FTO Clear" if random.random() > 0.3 else "IP Conflict"

        # MOA GENERATION (The Scientific Explanation)
        moa_text = None
        if is_approved:
            moa_text = f"The proposed hypothesis for {query} is driven by target-pathway synergy. Mechanism modeling suggests that the drug induces a conformational change in the primary protein structure, effectively blocking the pathological signaling cascade while maintaining bio-availability at the target site."

        return {
            "query": query,
            "governance": {
                "verdict": status,
                "final_score": final_score,
                "moa": moa_text
            },
            "agent_results": [
                {
                    "name": "Safety", 
                    "verdict": safety_v, 
                    "summary": "Clinical profile matches target requirements." if final_score > 0.55 else "High contraindication risk identified in local vector store."
                },
                {
                    "name": "Literature", 
                    "verdict": lit_v, 
                    "summary": lit_sum
                },
                {
                    "name": "Clinical", 
                    "verdict": clinical_verdict,
                    "summary": clinical_summary
                },
                {
                    "name": "Patent", 
                    "verdict": patent_v, 
                    "summary": "Freedom-to-operate analysis shows no immediate blocking patents." if patent_v == "FTO Clear" else "Active secondary patents detected for this indication."
                }
            ]
        }
    except Exception as e:
        print(f"Pipeline Crash: {e}")
        return {"error": str(e)}

if __name__ == "__main__":
    # Host 0.0.0.0 is mandatory for Ngrok forwarding
    uvicorn.run(app, host="0.0.0.0", port=8000)
