import os

SYSTEM_PROMPT = """You are a biomedical evidence extraction engine.
STRICT RULES:
- Extract ONLY from provided document chunks.
- Do NOT answer the user. Do NOT explain. Respond ONLY in JSON.
- If chunks lack info, output {"supports":false,"confidence":0.0,"contradiction":false,"summary":"INSUFFICIENT"}"""

SAFETY_SYSTEM_PROMPT = """You are a biomedical safety gatekeeper.
STRICT RULES:
1. If the 'Drug' is a known treatment for the 'Disease' (e.g. Aspirin for Headache), you MUST NOT halt unless there is a NEW, UNRELATED, LETHAL risk (like Liver Failure).
2. 'Adverse Events' that match the 'Therapeutic Indication' are common and should be IGNORED for the purpose of a Safety Halt.
3. Only output {"supports":true, "confidence":0.8, "contradiction":false, "summary":"HALT: [Reason]"} if there is a catastrophic risk unrelated to the target disease.
4. Otherwise, output {"supports":false, "confidence":0.0, "contradiction":false, "summary":"SAFE: Standard therapeutic profile."}"""

EXTRACTION_PROMPT = """Drug-Disease Query: {query}
Document Chunks: {chunks}
Respond in JSON: {{"supports":bool, "confidence":float, "contradiction":bool, "summary":string}}"""

DOMAIN_SYSTEM_PROMPTS = {
    "safety": SAFETY_SYSTEM_PROMPT,
}

def _build_ollama(domain: str = "default"):
    try:
        import ollama as ollama_lib
        # Use the model from .env or default to llama3.2
        m = os.environ.get("OLLAMA_MODEL", "llama3.2").strip()
        print(f"[LLM] Ollama Active: {m}")

        # Select domain-specific prompt if available
        system_prompt = DOMAIN_SYSTEM_PROMPTS.get(domain, SYSTEM_PROMPT)

        def call(query: str, chunks: str) -> str:
            response = ollama_lib.chat(
                model=m,
                messages=[
                    {"role": "system", "content": system_prompt},
                    {"role": "user",   "content": EXTRACTION_PROMPT.format(query=query, chunks=chunks)}
                ],
                options={"temperature": 0.0}
            )
            return response['message']['content'].strip()
        return call
    except Exception as e:
        print(f"[LLM] Ollama failed: {e}")
        return None

def get_llm(domain: str = "default"):
    # BRUTAL FIX: We force Ollama for your demo stability
    # If you want to use Gemini, set this to True, but Ollama is safer for the 27th.
    USE_OLLAMA_ONLY = True 
    
    if USE_OLLAMA_ONLY:
        return _build_ollama(domain)
    
    # Fallback logic if you ever toggle it back
    api_key = os.environ.get("GEMINI_API_KEY", "").replace('"', '').strip()
    if api_key and not api_key.startswith("BROKEN"):
        import google.generativeai as genai
        genai.configure(api_key=api_key)
        # Using the standard name format to avoid 404
        model = genai.GenerativeModel("gemini-1.5-flash")
        # Select domain-specific prompt if available
        system_prompt = DOMAIN_SYSTEM_PROMPTS.get(domain, SYSTEM_PROMPT)
        return lambda query, chunks: model.generate_content(system_prompt + "\n" + EXTRACTION_PROMPT.format(query=query, chunks=chunks)).text.strip()
    
    return _build_ollama(domain)
