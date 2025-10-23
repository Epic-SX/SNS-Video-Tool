#!/usr/bin/env python3
"""
CREAFT Backend Server
Run with: python run.py
"""

import uvicorn
from app.core.config import get_settings

def main():
    """Run the FastAPI server"""
    settings = get_settings()
    
    uvicorn.run(
        "app.main:app",
        host="0.0.0.0",
        port=8000,
        reload=settings.ENVIRONMENT == "development",
        log_level="info" if settings.ENVIRONMENT == "production" else "debug"
    )

if __name__ == "__main__":
    main() 