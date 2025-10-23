"""
AI-powered content generation endpoints
"""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from pydantic import BaseModel
from typing import Optional
from datetime import datetime, timezone
import logging

from app.core.database import get_db
from app.core.auth import get_current_user, require_growth_plan
from app.models.user import User
from app.services.ai.content_analyzer import content_analyzer

logger = logging.getLogger(__name__)

router = APIRouter()

class ContentGenerationRequest(BaseModel):
    input: str
    brand_context: Optional[str] = None
    platform: Optional[str] = None

@router.post("/generate-content")
async def generate_content_suggestions(
    request: ContentGenerationRequest,
    current_user: User = Depends(require_growth_plan),  # Growth+ feature
    db: AsyncSession = Depends(get_db)
):
    """
    Generate AI-powered content suggestions
    Growth+ feature: AI content generation
    """
    try:
        suggestions = await content_analyzer.generate_content_suggestions(
            request.input,
            request.brand_context or ""
        )
        
        return {
            "suggestions": suggestions,
            "platform_optimized": request.platform,
            "generated_at": datetime.now(timezone.utc).isoformat()
        }
        
    except Exception as e:
        logger.error(f"Error generating content suggestions: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Error generating content suggestions"
        )

@router.get("/trending-topics")
async def get_trending_topics(
    platform: Optional[str] = None,
    current_user: User = Depends(get_current_user)
):
    """Get AI-identified trending topics"""
    # Simplified implementation - in production, this would analyze recent high-performing content
    trending_topics = [
        {"topic": "productivity_hacks", "trend_score": 85, "category": "lifestyle"},
        {"topic": "morning_routine", "trend_score": 78, "category": "wellness"},
        {"topic": "tech_reviews", "trend_score": 72, "category": "technology"},
        {"topic": "fashion_haul", "trend_score": 69, "category": "fashion"},
        {"topic": "cooking_tips", "trend_score": 65, "category": "food"}
    ]
    
    return {
        "trending_topics": trending_topics,
        "platform": platform,
        "updated_at": datetime.now(timezone.utc).isoformat()
    } 