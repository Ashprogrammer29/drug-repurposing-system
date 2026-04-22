import requests

RXNORM_URL = "https://rxnav.nlm.nih.gov/REST/rxcui.json"
MESH_URL   = "https://id.nlm.nih.gov/mesh/lookup/descriptor"

def normalize_drug(name: str) -> dict:
    result = {"input":name,"canonical_name":name.strip().title(),"rxcui":None,"normalized_query":name.strip()}
    try:
        r = requests.get(RXNORM_URL, params={"name":name,"search":1}, timeout=10)
        if r.status_code == 200:
            ids = r.json().get("idGroup",{}).get("rxnormId",[])
            if ids:
                result["rxcui"] = ids[0]
                nr = requests.get(f"https://rxnav.nlm.nih.gov/REST/rxcui/{ids[0]}/property.json",
                                  params={"propName":"RxNorm Name"}, timeout=10)
                if nr.status_code == 200:
                    props = nr.json().get("propConceptGroup",{}).get("propConcept",[])
                    if props:
                        result["canonical_name"] = props[0].get("propValue", name)
                        result["normalized_query"] = result["canonical_name"]
    except Exception as e:
        print(f"[EntityNorm] Drug lookup failed: {e}")
    print(f"[EntityNorm] Drug: '{name}' → '{result['canonical_name']}'")
    return result

def normalize_disease(name: str) -> dict:
    result = {"input":name,"canonical_name":name.strip().title(),"mesh_id":None,"normalized_query":name.strip()}
    try:
        r = requests.get(MESH_URL, params={"label":name,"match":"contains","limit":1}, timeout=10)
        if r.status_code == 200 and r.json():
            entry = r.json()[0]
            result["mesh_id"]        = entry.get("resource","").split("/")[-1]
            result["canonical_name"] = entry.get("label", name)
            result["normalized_query"] = result["canonical_name"]
    except Exception as e:
        print(f"[EntityNorm] Disease lookup failed: {e}")
    print(f"[EntityNorm] Disease: '{name}' → '{result['canonical_name']}'")
    return result

def normalize_query(raw: str) -> dict:
    separators = [" - "," for "," vs "," in "," and "]
    parts = [raw]
    for sep in separators:
        if sep in raw.lower():
            idx   = raw.lower().index(sep)
            parts = [raw[:idx].strip(), raw[idx+len(sep):].strip()]
            break
    if len(parts) == 1:
        words = raw.split()
        mid   = len(words) // 2
        parts = [" ".join(words[:mid]), " ".join(words[mid:])]
    drug_raw    = parts[0].strip()
    disease_raw = parts[1].strip() if len(parts) > 1 else parts[0].strip()
    drug    = normalize_drug(drug_raw)
    disease = normalize_disease(disease_raw)
    return {
        "raw_query":        raw,
        "drug":             drug,
        "disease":          disease,
        "normalized_query": f"{drug['canonical_name']} {disease['canonical_name']}",
        "api_query":        f"{drug['normalized_query']} {disease['normalized_query']}"
    }
