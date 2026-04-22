# Drug Repurposing Assistant v2.0
**Multi-domain Agentic RAG system for drug repurposing hypothesis generation.**
SVCE AD22811 | Team: Pharma Innovators

---

## Architecture

```
User Query
    ↓ Entity Normalization (RxNorm + MeSH)
    ↓ Live Data Pipeline (PubMed · ClinicalTrials · OpenFDA · UniProt · USPTO)
    ↓ LangGraph Orchestration
        Stage 1: Safety Agent (hard gate)
        Stage 2: Literature + Mechanistic (primary signal)
        Stage 3: Clinical + Patent + Market (secondary domains)
    ↓ Contradiction Detector
    ↓ Pre-Decision Validation Layer
    ↓ Governance Scorer (domain-weighted + penalties + inter-agent boost)
    ↓ MongoDB Atlas (persistent session storage)
    ↓ React UI (radar chart · audit trail · PDF export · session browser)
```

---

## Setup

### 1. Clone and install
```bash
pip install -r requirements.txt
```

### 2. Configure environment
```bash
cp .env.example .env
# Fill in GEMINI_API_KEY, MONGODB_URI, ENTREZ_EMAIL
```

### 3. MongoDB Atlas (free)
1. Go to mongodb.com/atlas → sign up free
2. Create M0 cluster
3. Get connection string → paste into .env as MONGODB_URI

### 4. Run backend
```bash
uvicorn backend.main:app --reload --port 8000
```

### 5. Run frontend
```bash
cd frontend && npm install && npm run dev
```

Open: http://localhost:5173

---

## Validation
```bash
python evaluation/validation_set.py
```
Runs 20 drug-disease pairs (10 confirmed repurposed, 10 controls).
Outputs precision, recall, F1, accuracy to `evaluation/results.json`.

---

## Business Model

**Target market:** Indian generic pharmaceutical companies (Sun Pharma, Cipla,
Dr. Reddy's, Aurobindo) seeking to diversify beyond low-margin generics.

**Problem solved:** Manual drug repurposing analysis takes 2-3 months, costs
$15,000-25,000 per candidate, checks 5-10 sources. Our system: minutes, open-source,
6 automated biomedical sources, governed decision with full audit trail.

**Revenue tiers:**
- Academic / Startup: ₹15,000-40,000/month — unlimited queries, PDF reports
- Enterprise Pharma:  ₹2-5 lakh/month — private deployment, compliance audit trail
- Professional Reports: ₹50,000-2 lakh per report — human-reviewed, board-ready

**Market size:** 500 active R&D pharma companies in India.
50 enterprise clients × ₹3L/month = ₹18 crore ARR.

**Competitive positioning:** Open-source stack, no proprietary database dependency,
safety-governed, explainable decisions. Accessible to labs and companies that cannot
afford BenevolentAI or Insilico Medicine enterprise contracts.

---

## Key Technical Differentiators vs Alternatives

| Feature | Our System | BenevolentAI | Insilico |
|---------|-----------|-------------|---------|
| Open source | Yes | No | No |
| Safety gate | Hard halt | Unknown | Unknown |
| Constrained LLM | temp=0, JSON-only | Free reasoning | Free reasoning |
| Contradiction detection | Yes | No | No |
| Grounded confidence | Phase-weighted | N/A | N/A |
| Cost | Free | $50K+/yr | $50K+/yr |
