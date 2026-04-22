import asyncio
import json
import re
from typing import Any
from llm import get_llm

REQUIRED_KEYS  = {"supports", "confidence", "contradiction", "summary"}
CONFIDENCE_CAP = 0.85

class RAGChain:
    def __init__(self, vector_store: Any, domain: str, k: int = 3):
        self.domain    = domain
        # Support for both FAISS and Qdrant
        self.retriever = vector_store.as_retriever(
            search_type="similarity", search_kwargs={"k": k})
        self.llm = get_llm(domain)

    def run(self, query: str) -> dict:
        try:
            docs       = self.retriever.invoke(query)
            raw_chunks = [d.page_content for d in docs]
            chunks_txt = "\n\n---\n\n".join(raw_chunks)
            
            # Use the LLM to extract JSON evidence
            raw      = self.llm(query=query, chunks=chunks_txt)
            parsed   = self._validate(raw)
            
            if parsed is None:
                print(f"[RAGChain:{self.domain}] Malformed output after cleanup. Rejecting.")
                return self._rejected(raw_chunks)
                
            parsed["raw_chunks"] = raw_chunks
            parsed["rejected"]   = False
            return parsed
            
        except Exception as e:
            print(f"[RAGChain:{self.domain}] Critical failure: {e}")
            return self._rejected([])
    
    async def run_async(self, query: str) -> dict:
        # Using run_in_executor to prevent the retriever from blocking the event loop
        loop = asyncio.get_event_loop()
        docs = await loop.run_in_executor(None, self.retriever.invoke, query)
        
        raw_chunks = [d.page_content for d in docs]
        chunks_txt = "\n\n---\n\n".join(raw_chunks)
        
        # Call the LLM (ensure your get_llm return is async-friendly or wrapped)
        raw = await loop.run_in_executor(None, self.llm, query, chunks_txt)
        
        parsed = self._validate(raw)
        if parsed is None:
            return self._rejected(raw_chunks)
            
        parsed["domain"] = self.domain # Critical for the Scorer to know which is which
        return parsed

    def _validate(self, response: str):
        try:
            # Step 1: Extract JSON block using Regex (Robust against Ollama chatter)
            match = re.search(r'\{.*\}', response, re.DOTALL)
            if not match:
                return None
            
            clean_json = match.group(0)
            data = json.loads(clean_json)
            
            # Step 2: Key check and normalization
            default_data = {
                "supports": False, 
                "confidence": 0.0, 
                "contradiction": False, 
                "summary": "INSUFFICIENT"
            }
            
            for key in REQUIRED_KEYS:
                if key not in data:
                    data[key] = default_data[key]
            
            # Step 3: Type Enforcement & Confidence Cap
            try:
                conf = float(data.get("confidence", 0.0))
            except (ValueError, TypeError):
                conf = 0.0
                
            data["confidence"] = min(conf, CONFIDENCE_CAP)
            data["supports"] = bool(data["supports"])
            data["contradiction"] = bool(data["contradiction"])
            
            return data
        except Exception: 
            return None

    def _rejected(self, raw_chunks: list):
        return {
            "supports": False, 
            "confidence": 0.0,
            "contradiction": False,
            "summary": "REJECTED — System error or unparseable LLM output.",
            "raw_chunks": raw_chunks, 
            "rejected": True
        }
