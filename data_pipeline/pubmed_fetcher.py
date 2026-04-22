import os, time, json, re
from Bio import Entrez

Entrez.email = os.getenv("ENTREZ_EMAIL","drugrepurposing@research.com")

def fetch_pubmed(query, domain_path, max_results=30):
    os.makedirs(domain_path, exist_ok=True)
    safe = query.replace(" ","_").replace("/","-")[:60]
    out  = os.path.join(domain_path, f"{safe}.txt")
    meta = os.path.join(domain_path, f"{safe}_meta.json")
    if os.path.exists(out):
        print(f"[PubMed] Cache: {safe}")
        return out
    print(f"[PubMed] Fetching: {query}")
    try:
        h = Entrez.esearch(db="pubmed", term=query, retmax=max_results, sort="relevance")
        r = Entrez.read(h); h.close()
        ids = r["IdList"]
        if not ids: return None
        time.sleep(0.4)
        h = Entrez.efetch(db="pubmed", id=",".join(ids), rettype="xml", retmode="xml")
        xml = h.read(); h.close()
        time.sleep(0.4)
        h = Entrez.efetch(db="pubmed", id=",".join(ids), rettype="abstract", retmode="text")
        abstracts = h.read(); h.close()
        with open(out,"w",encoding="utf-8") as f: f.write(abstracts)
        years = [int(y) for y in re.findall(r'<PubDate>.*?<Year>(\d{4})</Year>', xml.decode("utf-8") if isinstance(xml,bytes) else xml, re.DOTALL)]
        metadata = {"total_results":len(ids),"pubmed_ids":ids,"publication_years":years,
                    "avg_year":round(sum(years)/len(years),1) if years else None,
                    "recent_count":sum(1 for y in years if y>=2018)}
        with open(meta,"w") as f: json.dump(metadata,f,indent=2)
        print(f"[PubMed] Saved {len(ids)} abstracts")
        return out
    except Exception as e:
        print(f"[PubMed] Error: {e}"); return None

def load_pubmed_metadata(domain_path, query):
    safe = query.replace(" ","_").replace("/","-")[:60]
    meta = os.path.join(domain_path, f"{safe}_meta.json")
    if os.path.exists(meta):
        with open(meta) as f: return json.load(f)
    return {}