"""
Validation Set — 20 drug-disease pairs (10 confirmed, 10 controls).
Run: python evaluation/validation_set.py
"""
import sys, os
sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))
import json
from datetime import datetime
from data_pipeline.pipeline_runner import run_pipeline
from graph.pipeline import run_graph
from core.contradiction_detector import detect_contradictions
from governance.decision_engine import make_decision

CONFIRMED = [
    {"query":"Sildenafil - Pulmonary Arterial Hypertension","label":1,"source":"FDA approved 2005"},
    {"query":"Thalidomide - Multiple Myeloma","label":1,"source":"FDA approved 2006"},
    {"query":"Metformin - Colorectal Cancer","label":1,"source":"Multiple RCTs"},
    {"query":"Aspirin - Colorectal Cancer Prevention","label":1,"source":"Cochrane 2020"},
    {"query":"Rituximab - Rheumatoid Arthritis","label":1,"source":"FDA approved 2006"},
    {"query":"Rapamycin - Tuberous Sclerosis","label":1,"source":"FDA approved 2012"},
    {"query":"Dapagliflozin - Heart Failure","label":1,"source":"DAPA-HF trial 2019"},
    {"query":"Colchicine - Pericarditis","label":1,"source":"COPE trial 2013"},
    {"query":"Minoxidil - Androgenetic Alopecia","label":1,"source":"FDA OTC approved"},
    {"query":"Gabapentin - Postherpetic Neuralgia","label":1,"source":"FDA approved 2002"},
]
CONTROLS = [
    {"query":"Metformin - Schizophrenia","label":0,"source":"No established evidence"},
    {"query":"Aspirin - Alzheimer's Disease","label":0,"source":"Failed trials"},
    {"query":"Sildenafil - Type 2 Diabetes","label":0,"source":"No clinical evidence"},
    {"query":"Warfarin - Parkinson's Disease","label":0,"source":"No established evidence"},
    {"query":"Atorvastatin - Asthma","label":0,"source":"Inconclusive"},
    {"query":"Lisinopril - Multiple Sclerosis","label":0,"source":"No evidence"},
    {"query":"Metoprolol - Lupus","label":0,"source":"No evidence"},
    {"query":"Omeprazole - Psoriasis","label":0,"source":"No evidence"},
    {"query":"Amoxicillin - Type 1 Diabetes","label":0,"source":"No evidence"},
    {"query":"Ibuprofen - Bipolar Disorder","label":0,"source":"No evidence"},
]
ALL_PAIRS = CONFIRMED + CONTROLS


def run_validation(output_path="evaluation/results.json"):
    print("="*60)
    print("DRUG REPURPOSING ASSISTANT — VALIDATION RUN")
    print(f"Total: {len(ALL_PAIRS)} | Confirmed: {len(CONFIRMED)} | Controls: {len(CONTROLS)}")
    print("="*60)
    results = []
    tp=fp=tn=fn=0

    for pair in ALL_PAIRS:
        query, true_label = pair["query"], pair["label"]
        print(f"\n[Validation] {query}")
        try:
            import uuid
            sid = str(uuid.uuid4())
            run_pipeline(query)
            state    = run_graph(query, sid)
            profile  = state.get("profile")
            contras  = state.get("contradictions", [])
            decision = make_decision(profile, contras) if profile else None

            predicted = 1 if (decision and decision.verdict=="APPROVED") else 0
            correct   = predicted == true_label
            if   true_label==1 and predicted==1: tp+=1
            elif true_label==0 and predicted==0: tn+=1
            elif true_label==0 and predicted==1: fp+=1
            else: fn+=1

            results.append({"query":query,"true_label":true_label,"predicted":predicted,
                             "verdict":decision.verdict if decision else "UNKNOWN",
                             "final_score":decision.final_score if decision else 0.0,
                             "correct":correct,"source":pair["source"]})
            print(f"  [{'CORRECT' if correct else 'WRONG'}] {decision.verdict if decision else 'N/A'} | score={decision.final_score:.2f if decision else 0}")
        except Exception as e:
            print(f"  [ERROR] {e}")
            results.append({"query":query,"error":str(e),"true_label":true_label})

    precision = tp/(tp+fp) if (tp+fp)>0 else 0.0
    recall    = tp/(tp+fn) if (tp+fn)>0 else 0.0
    f1        = 2*precision*recall/(precision+recall) if (precision+recall)>0 else 0.0
    accuracy  = (tp+tn)/len(ALL_PAIRS)

    metrics = {"timestamp":datetime.now().isoformat(),"total":len(ALL_PAIRS),
               "tp":tp,"fp":fp,"tn":tn,"fn":fn,
               "precision":round(precision,3),"recall":round(recall,3),
               "f1":round(f1,3),"accuracy":round(accuracy,3),"results":results}
    os.makedirs(os.path.dirname(output_path), exist_ok=True)
    with open(output_path,"w") as f: json.dump(metrics,f,indent=2)

    print("\n"+"="*60)
    print(f"Precision: {precision:.3f} | Recall: {recall:.3f} | F1: {f1:.3f} | Accuracy: {accuracy:.3f}")
    print(f"TP={tp} FP={fp} TN={tn} FN={fn}")
    print(f"Results saved → {output_path}")
    return metrics


if __name__ == "__main__":
    run_validation()
