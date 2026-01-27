#!/usr/bin/env python
"""
Run FastAPI development server with uvicorn

Usage:
    python run.py                 # Run on default port 8000
    python run.py --port 8080     # Run on specific port
    python run.py --host 0.0.0.0  # Run on all interfaces
"""

import uvicorn
import sys
import argparse

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Run YojnaSathi FastAPI Server")
    parser.add_argument("--host", default="127.0.0.1", help="Server host (default: 127.0.0.1)")
    parser.add_argument("--port", type=int, default=8000, help="Server port (default: 8000)")
    parser.add_argument("--reload", action="store_true", help="Enable auto-reload on code changes")
    
    args = parser.parse_args()
    
    # Enable reload by default in development
    reload = args.reload or "--reload" in sys.argv or "-r" in sys.argv
    
    uvicorn.run(
        "app.main:app",
        host=args.host,
        port=args.port,
        reload=reload,
        log_level="info"
    )
