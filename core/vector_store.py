import os
import hashlib
from qdrant_client import QdrantClient
from qdrant_client.http import models as qmodels
from langchain_qdrant import QdrantVectorStore
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_community.document_loaders import PyPDFLoader, CSVLoader, TextLoader
from core.embeddings import get_embedding_model
from langchain_core.documents import Document

# Configuration
QDRANT_HOST = "localhost"
QDRANT_PORT = 6333
SPLITTER = RecursiveCharacterTextSplitter(chunk_size=512, chunk_overlap=64)

# Use in-memory Qdrant for local testing
_client = QdrantClient(host=QDRANT_HOST, port=QDRANT_PORT)

def _ensure_collection_exists(collection_name: str, vector_size: int = 384):
    """Check if collection exists, if not, create it."""
    try:
        collections = _client.get_collections().collections
        existing_names = [c.name for c in collections]
        
        if collection_name not in existing_names:
            print(f"[Qdrant] Collection '{collection_name}' not found. Creating...")
            _client.create_collection(
                collection_name=collection_name,
                vectors_config=qmodels.VectorParams(size=vector_size, distance=qmodels.Distance.COSINE),
            )
            print(f"[Qdrant] Collection '{collection_name}' created successfully.")
        else:
            print(f"[Qdrant] Collection '{collection_name}' already exists.")
    except Exception as e:
        print(f"[Qdrant] Error ensuring collection exists: {e}")
        # Fallback: recreate collection
        _client.recreate_collection(
            collection_name=collection_name,
            vectors_config=qmodels.VectorParams(size=vector_size, distance=qmodels.Distance.COSINE),
        )

def _get_directory_hash(path):
    """Generates a unique hash based on filenames and sizes in the directory."""
    if not os.path.exists(path): return "empty"
    hash_func = hashlib.md5()
    for root, _, files in os.walk(path):
        for f in sorted(files):
            fp = os.path.join(root, f)
            hash_func.update(f"{f}{os.path.getsize(fp)}".encode())
    return hash_func.hexdigest()

def _load_documents(path):
    docs = []
    if not os.path.exists(path): return docs
    for root, _, files in os.walk(path):
        for f in files:
            fp = os.path.join(root, f)
            try:
                if f.endswith(".pdf"): loader = PyPDFLoader(fp)
                elif f.endswith(".csv"): loader = CSVLoader(fp, encoding="utf-8")
                elif f.endswith(".txt"): loader = TextLoader(fp, encoding="utf-8")
                else: continue
                docs.extend(loader.load())
            except Exception as e:
                print(f"[Qdrant] Skip {f}: {e}")
    return docs

def build_vector_store(domain: str, path: str):
    embeddings = get_embedding_model()
    collection_name = f"drug_repurposing_{domain}"
    current_hash = _get_directory_hash(path)

    # Ensure collection exists before any operations
    _ensure_collection_exists(collection_name, vector_size=384)

    try:
        collections = _client.get_collections().collections
        exists = any(c.name == collection_name for c in collections)
        
        if exists:
            # Fix: Use .payload or access properly depending on Qdrant version
            info = _client.get_collection(collection_name)
            # Some versions of Qdrant return metadata in 'config' or direct attributes
            stored_hash = getattr(info, 'metadata', {}).get("content_hash", "")
            
            if stored_hash == current_hash:
                print(f"[Qdrant] Collection '{collection_name}' up-to-date. Skipping.")
                return QdrantVectorStore(client=_client, collection_name=collection_name, embedding=embeddings)
            else:
                print(f"[Qdrant] Content changed in {domain}. Re-indexing...")
    except Exception as e:
        print(f"[Qdrant] Check failed: {e}")

    # Indexing Logic
    _client.recreate_collection(
        collection_name=collection_name,
        vectors_config=qmodels.VectorParams(size=384, distance=qmodels.Distance.COSINE),
    )

    docs = _load_documents(path)
    if not docs:
        docs = [Document(page_content=f"No {domain} data available.", metadata={"domain": domain})]

    chunks = SPLITTER.split_documents(docs)
    
    qstore = QdrantVectorStore.from_documents(
        chunks,
        embeddings,
        url=f"http://{QDRANT_HOST}:{QDRANT_PORT}",
        collection_name=collection_name,
    )

    # Store the hash in metadata for future runs
    _client.update_collection(
        collection_name=collection_name,
        metadata={"content_hash": current_hash}
    )
    
    print(f"[Qdrant] {domain} indexed successfully.")
    return qstore