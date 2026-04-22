import sys
import os

PROJECT_ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.insert(0, PROJECT_ROOT)

from dotenv import load_dotenv
load_dotenv(os.path.join(PROJECT_ROOT, ".env"))

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(
    title="Drug Repurposing Assistant",
    description="Agentic AI system for drug repurposing hypothesis generation.",
    version="2.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

from backend.routes.query import router as query_router
from backend.routes.sessions import router as sessions_router
from backend.routes.report import router as report_router

app.include_router(query_router,    prefix="/api")
app.include_router(sessions_router, prefix="/api")
app.include_router(report_router,   prefix="/api")

@app.get("/")
def root():
    return {"status": "Drug Repurposing Assistant v2.0 running."}

@app.get("/health")
def health():
    return {"status": "ok"}

result = await graph.ainvoke(initial_state)
