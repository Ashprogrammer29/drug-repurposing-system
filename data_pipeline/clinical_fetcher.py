import os, json, requests

CLINICAL_URL = "https://clinicaltrials.gov/api/v2/studies"
PHASE_W  = {"PHASE3":1.0,"PHASE4":1.0,"PHASE2":0.65,"PHASE1":0.35,"EARLY_PHASE1":0.2,"NA":0.1}
STATUS_W = {"COMPLETED":1.0,"ACTIVE_NOT_RECRUITING":0.85,"RECRUITING":0.7,
            "APPROVED_FOR_MARKETING":1.0,"TERMINATED":0.1,"WITHDRAWN":0.05,"SUSPENDED":0.05}

def fetch_clinical_trials(query, domain_path, max_results=20):
    os.makedirs(domain_path, exist_ok=True)
    safe = query.replace(" ","_").replace("/","-")[:60]
    out  = os.path.join(domain_path, f"{safe}.txt")
    meta = os.path.join(domain_path, f"{safe}_meta.json")
    if os.path.exists(out): return out
    print(f"[ClinicalTrials] Fetching: {query}")
    try:
        r = requests.get(CLINICAL_URL, params={"query.term":query,"pageSize":max_results,"format":"json"}, timeout=15)
        r.raise_for_status()
        studies = r.json().get("studies",[])
        if not studies: return None
        lines   = []
        phases, statuses = [], []
        for s in studies:
            p   = s.get("protocolSection",{})
            id_ = p.get("identificationModule",{})
            st_ = p.get("statusModule",{})
            ds_ = p.get("designModule",{})
            dc_ = p.get("descriptionModule",{})
            ph  = (ds_.get("phases",["NA"]) or ["NA"])[0]
            phases.append(ph); statuses.append(st_.get("overallStatus","UNKNOWN"))
            lines += [f"Trial: {id_.get('nctId','N/A')}",f"Title: {id_.get('briefTitle','N/A')}",
                      f"Phase: {ph}",f"Status: {st_.get('overallStatus','N/A')}",
                      f"Summary: {dc_.get('briefSummary','')[:400]}","---"]
        ps = max([PHASE_W.get(p,0.1) for p in phases], default=0)
        ss = max([STATUS_W.get(s,0.1) for s in statuses], default=0)
        metadata = {"total":len(studies),"phases":phases,"statuses":statuses,
                    "phase_score":round(ps,3),"status_score":round(ss,3),
                    "grounded_confidence":round((ps*0.6+ss*0.4)*0.85,3)}
        with open(out,"w",encoding="utf-8") as f: f.write("\n".join(lines))
        with open(meta,"w") as f: json.dump(metadata,f,indent=2)
        return out
    except Exception as e:
        print(f"[ClinicalTrials] Error: {e}"); return None

def load_clinical_metadata(domain_path, query):
    safe = query.replace(" ","_").replace("/","-")[:60]
    meta = os.path.join(domain_path, f"{safe}_meta.json")
    if os.path.exists(meta):
        with open(meta) as f: return json.load(f)
    return {}