import sys
import os
 
# Fix SSL certificate issue on Windows + Python 3.12
import certifi
os.environ["SSL_CERT_FILE"]       = certifi.where()
os.environ["REQUESTS_CA_BUNDLE"]  = certifi.where()
 
PROJECT_ROOT = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, PROJECT_ROOT)
os.environ["PYTHONPATH"] = PROJECT_ROOT
 
from backend.main import app
import uvicorn
 
if __name__ == "__main__":
    uvicorn.run(
        app,
        host="0.0.0.0",
        port=8000,
        reload=False
    )
    