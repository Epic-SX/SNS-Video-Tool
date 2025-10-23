"""
Analytics and reporting endpoints
"""

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from datetime import datetime, timezone, timedelta
from typing import Optional

from app.core.database import get_db
from app.core.auth import get_current_user
from app.models.user import User
from app.models.account import Account, Platform
from app.models.creative import Creative
from app.models.metric import Metric

router = APIRouter()

@router.get("/overview")
async def get_analytics_overview(
    days_back: int = Query(default=30, ge=1, le=90),
    platform: Optional[Platform] = None,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Get analytics overview for user's content"""
    cutoff_date = datetime.now(timezone.utc) - timedelta(days=days_back)
    
    # Base query
    query = select(Creative, Metric).join(Metric).join(Account).where(
        Account.user_id == current_user.id,
        Creative.published_at >= cutoff_date
    )
    
    if platform:
        query = query.where(Account.platform == platform)
    
    result = await db.execute(query)
    data = result.all()
    
    # Calculate metrics
    total_content = len(data)
    total_views = sum(metric.views for _, metric in data)
    total_engagement = sum(metric.total_engagement for _, metric in data)
    avg_engagement_rate = sum(metric.engagement_rate for _, metric in data) / max(total_content, 1)
    
    # Top performing content
    top_content = sorted(data, key=lambda x: x[1].buzz_score, reverse=True)[:5]
    
    return {
        "period_days": days_back,
        "summary": {
            "total_content": total_content,
            "total_views": total_views,
            "total_engagement": total_engagement,
            "avg_engagement_rate": round(avg_engagement_rate, 2)
        },
        "top_performing": [
            {
                "creative_id": creative.id,
                "platform": creative.account.platform.value,
                "caption": creative.caption[:100] if creative.caption else "",
                "views": metric.views,
                "engagement_rate": metric.engagement_rate,
                "buzz_score": metric.buzz_score
            }
            for creative, metric in top_content
        ]
    }

@router.get("/performance-trends")
async def get_performance_trends(
    days_back: int = Query(default=30, ge=7, le=90),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Get performance trends over time"""
    cutoff_date = datetime.now(timezone.utc) - timedelta(days=days_back)
    
    # Daily aggregation query
    query = select(
        func.date(Creative.published_at).label('date'),
        func.count(Creative.id).label('content_count'),
        func.avg(Metric.views).label('avg_views'),
        func.avg(Metric.engagement_rate).label('avg_engagement_rate')
    ).join(Metric).join(Account).where(
        Account.user_id == current_user.id,
        Creative.published_at >= cutoff_date
    ).group_by(func.date(Creative.published_at)).order_by('date')
    
    result = await db.execute(query)
    trends = result.all()
    
    return {
        "trends": [
            {
                "date": trend.date.isoformat(),
                "content_count": trend.content_count,
                "avg_views": round(trend.avg_views or 0, 0),
                "avg_engagement_rate": round(trend.avg_engagement_rate or 0, 2)
            }
            for trend in trends
        ]
    } 