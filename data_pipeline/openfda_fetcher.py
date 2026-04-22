import os, requests

ADVERSE_URL = "https://api.fda.gov/drug/event.json"
LABEL_URL   = "https://api.fda.gov/drug/label.json"

def fetch_safety(drug, domain_path, max_results=20):
    os.makedirs(domain_path, exist_ok=True)
    safe = drug.replace(" ","_")[:60]
    out  = os.path.join(domain_path, f"{safe}_safety.txt")
    if os.path.exists(out): return out
    try:
        r = requests.get(ADVERSE_URL, params={"search":f'patient.drug.medicinalproduct:"{drug}"',"limit":max_results}, timeout=15)
        r.raise_for_status()
        results = r.json().get("results",[])
        lines   = []
        for ev in results:
            for rx in ev.get("patient",{}).get("reaction",[]):
                term = rx.get("reactionmeddrapt","")
                if term: lines.append(f"Reaction: {term} | Outcome: {rx.get('reactionoutcome','')}")
        with open(out,"w",encoding="utf-8") as f: f.write("\n".join(lines))
        return out
    except Exception as e:
        print(f"[OpenFDA-Safety] Error: {e}"); return None

def fetch_market(drug, domain_path):
    os.makedirs(domain_path, exist_ok=True)
    safe = drug.replace(" ","_")[:60]
    out  = os.path.join(domain_path, f"{safe}_market.txt")
    if os.path.exists(out): return out
    try:
        r = requests.get(LABEL_URL, params={"search":f'openfda.brand_name:"{drug}"',"limit":5}, timeout=15)
        r.raise_for_status()
        results = r.json().get("results",[])
        lines   = []
        for lb in results:
            ind  = lb.get("indications_and_usage",[""])
            warn = lb.get("warnings",[""])
            lines += [f"Indications: {ind[0][:500] if ind else 'N/A'}",
                      f"Warnings: {warn[0][:500] if warn else 'N/A'}","---"]
        with open(out,"w",encoding="utf-8") as f: f.write("\n".join(lines))
        return out
    except Exception as e:
        print(f"[OpenFDA-Market] Error: {e}"); return None