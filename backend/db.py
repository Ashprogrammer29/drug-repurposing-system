import os
from motor.motor_asyncio import AsyncIOMotorClient
from pymongo import MongoClient
from pymongo.server_api import ServerApi
from datetime import datetime
import uuid

MONGODB_URI = MONGODB_URI = "mongodb+srv://aswinsub9_db_user:qmoOR8wjU0snTRxn@cluster1.ihbwsdz.mongodb.net/?retryWrites=true&w=majority"
DB_NAME     = "drug_repurposing"

_async_client = None
_async_db     = None


def get_async_db():
    global _async_client, _async_db
    if _async_db is None:
        _async_client = AsyncIOMotorClient(
            MONGODB_URI,
            server_api=ServerApi("1"),
            tls=True,
            tlsAllowInvalidCertificates=True,
            tlsAllowInvalidHostnames=True,
            # BRUTAL STABILITY FIXES:
            connectTimeoutMS=10000, # Wait 10s for initial connection
            serverSelectionTimeoutMS=10000,
            retryWrites=True
        )
        _async_db = _async_client[DB_NAME]
    return _async_db


_sync_client = None
_sync_db     = None


def get_sync_db():
    global _sync_client, _sync_db
    if _sync_db is None:
        _sync_client = MongoClient(
            MONGODB_URI,
            server_api=ServerApi("1"),
            tls=True,
            tlsAllowInvalidCertificates=True,
            tlsAllowInvalidHostnames=True,
            # BRUTAL STABILITY FIXES:
            connectTimeoutMS=10000,
            serverSelectionTimeoutMS=10000,
            retryWrites=True
        )
        _sync_db = _sync_client[DB_NAME]
    return _sync_db

def generate_session_id() -> str:
    return str(uuid.uuid4())


async def save_session(session_data: dict) -> str:
    try:
        db = get_async_db()
        session_data["created_at"] = datetime.utcnow().isoformat()
        await db.sessions.insert_one(session_data)
        return session_data["session_id"]
    except Exception as e:
        print(f"[DB] save_session failed (non-fatal): {e}")
        return session_data.get("session_id", "unknown")


async def get_session(session_id: str) -> dict:
    try:
        db = get_async_db()
        return await db.sessions.find_one(
            {"session_id": session_id},
            {"_id": 0}
        )
    except Exception as e:
        print(f"[DB] get_session failed: {e}")
        return None


async def list_sessions(limit: int = 50) -> list:
    try:
        db = get_async_db()
        cursor = db.sessions.find(
            {},
            {"session_id": 1, "query": 1, "normalized_query": 1,
             "verdict": 1, "final_score": 1, "support_count": 1,
             "created_at": 1, "_id": 0}
        ).sort("created_at", -1).limit(limit)
        return await cursor.to_list(length=limit)
    except Exception as e:
        print(f"[DB] list_sessions failed: {e}")
        return []


async def save_audit_log(session_id: str, event: str, details: dict):
    try:
        db = get_async_db()
        await db.audit_logs.insert_one({
            "session_id": session_id,
            "event":      event,
            "details":    details,
            "timestamp":  datetime.utcnow().isoformat()
        })
    except Exception as e:
        print(f"[DB] save_audit_log failed (non-fatal): {e}")
