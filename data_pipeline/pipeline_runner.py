import os
from data_pipeline.pubmed_fetcher import fetch_pubmed
from data_pipeline.clinical_fetcher import fetch_clinical_trials
from data_pipeline.openfda_fetcher import fetch_safety, fetch_market
from data_pipeline.drugbank_fetcher import fetch_mechanistic
from data_pipeline.patent_fetcher import fetch_patents
# CHANGED: Import the Qdrant builder
from core.vector_store import build_vector_store
from core.entity_normalizer import normalize_query

DATA_ROOT = "data/documents"
DOMAIN_PATHS = {
    "literature":  os.path.join(DATA_ROOT, "literature"),
    "clinical":    os.path.join(DATA_ROOT, "clinical"),
    "safety":      os.path.join(DATA_ROOT, "safety"),
    "market":      os.path.join(DATA_ROOT, "market"),
    "mechanistic": os.path.join(DATA_ROOT, "mechanistic"),
    "patents":     os.path.join(DATA_ROOT, "patents"),
}

def run_pipeline(raw_query: str) -> dict:
    print(f"\n[Pipeline] Initializing: {raw_query}")
    norm = normalize_query(raw_query)
    
    # We use canonical names for better API matching
    api_query    = norm["api_query"]
    drug_name    = norm["drug"]["canonical_name"]
    
    status = {}
    print(f"[Pipeline] Fetching evidence for {drug_name}...")

    # 1. Fetch data from APIs
    status["literature"]  = "ok" if fetch_pubmed(api_query, DOMAIN_PATHS["literature"], 30) else "failed"
    status["clinical"]    = "ok" if fetch_clinical_trials(api_query, DOMAIN_PATHS["clinical"], 20) else "failed"
    status["safety"]      = "ok" if fetch_safety(drug_name, DOMAIN_PATHS["safety"], 20) else "failed"
    status["market"]      = "ok" if fetch_market(drug_name, DOMAIN_PATHS["market"]) else "failed"
    status["mechanistic"] = "ok" if fetch_mechanistic(drug_name, DOMAIN_PATHS["mechanistic"], 10) else "failed"
    status["patents"]     = "ok" if fetch_patents(drug_name, DOMAIN_PATHS["patents"], 15) else "failed"

    # 2. Rebuild Qdrant collections with the new data
    print("[Pipeline] Updating Qdrant collections...")
    for domain, path in DOMAIN_PATHS.items():
        if status.get(domain) == "ok":
            build_vector_store(domain, path)

    # Attach canonical info for the graph and frontend
    status["normalized_query"] = api_query
    status["drug_canonical"]   = drug_name
    status["disease_canonical"] = norm["disease"]["canonical_name"]
    
    return status