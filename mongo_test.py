import pymongo
try:
    # Replace with your actual connection string
    uri = "mongodb+srv://aswinsub9_db_user:qmoOR8wjU0snTRxn@cluster1.ihbwsdz.mongodb.net/?retryWrites=true&w=majority"
    client = pymongo.MongoClient(uri, serverSelectionTimeoutMS=5000)
    print("Database Names:", client.list_database_names())
    print("[SUCCESS] Connection established.")
except Exception as e:
    print(f"[FAILURE] Could not connect: {e}")