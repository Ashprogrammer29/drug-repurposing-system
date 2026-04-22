import os
import sys
from dotenv import load_dotenv

# Force Absolute Pathing
PROJECT_ROOT = os.path.dirname(os.path.abspath(__file__))
if PROJECT_ROOT not in sys.path:
    sys.path.insert(0, PROJECT_ROOT)

load_dotenv()

print("[DEBUG] Environment Loaded. Python Path:", sys.path[0])

try:
    from data_pipeline.pipeline_runner import run_pipeline
    from graph.pipeline import run_graph
    print("[SUCCESS] Core modules imported correctly.")
except Exception as e:
    print(f"[FAILURE] Import phase failed: {e}")
    sys.exit(1)

def main():
    query = "Aspirin - Pyrexia"
    print(f"\n{'='*60}")
    print(f"CRITICAL MISSION: VERDICT FOR {query}")
    print(f"{'='*60}")
    
    try:
        # 1. Pipeline
        print("\n[1/3] Pipeline: Fetching & Indexing...")
        run_pipeline(query)
        
        # 2. Graph
        print("\n[2/3] Graph: Executing Agentic Flow...")
        state = run_graph(query, "demo_session_final")
        
        # 3. Verdict
        print("\n[3/3] Results Analysis:")
        if state.get("halted"):
            print(f"STATUS: HALTED at {state.get('halt_stage')}")
            print(f"REASON: {state.get('halt_reason')}")
        elif state.get("governance"):
            gov = state["governance"]
            print(f"STATUS: SUCCESS")
            print(f"VERDICT: {gov.verdict}")
            print(f"SCORE:   {gov.final_score:.4f}")
            print(f"REASON:  {gov.reasoning}")
        else:
            print("STATUS: UNKNOWN - No governance object found in state.")
            
    except Exception as e:
        print(f"\n[RUNTIME ERROR] Pipeline crashed: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    main()