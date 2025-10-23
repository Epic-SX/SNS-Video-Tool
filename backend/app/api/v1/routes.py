"""
Main API router
"""

from fastapi import APIRouter
from app.api.v1.endpoints import auth, users, accounts, creatives, analytics, ai, trending, scripts

api_router = APIRouter()

# Include all endpoint routers
api_router.include_router(auth.router, prefix="/auth", tags=["authentication"])
api_router.include_router(users.router, prefix="/users", tags=["users"])
api_router.include_router(accounts.router, prefix="/accounts", tags=["accounts"])
api_router.include_router(creatives.router, prefix="/creatives", tags=["creatives"])
api_router.include_router(analytics.router, prefix="/analytics", tags=["analytics"])
api_router.include_router(ai.router, prefix="/ai", tags=["ai"])
api_router.include_router(trending.router, prefix="/trending", tags=["trending"])
api_router.include_router(scripts.router, prefix="/scripts", tags=["scripts"])