"""
Creatives endpoints - Core functionality of CREAFT
"""

from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, desc, and_, or_
from sqlalchemy.orm import selectinload
from typing import List, Optional, Dict, Any
from datetime import datetime, timezone, timedelta

from app.core.database import get_db
from app.core.auth import get_current_user, require_growth_plan
from app.models.user import User
from app.models.account import Account, Platform
from app.models.creative import Creative, CreativeType, ContentType
from app.models.metric import Metric
from app.models.label import Label, LabelType, CreativeAnalytic
from app.schemas.creative import (
    CreativeResponse, 
    CreativeListResponse, 
    BuzzAnalysisResponse,
    CreativeFilterParams
)
from app.services.ai.content_analyzer import content_analyzer
from app.core.monitoring import metrics

router = APIRouter()

@router.get("/", response_model=CreativeListResponse)
async def get_creatives(
    platform: Optional[Platform] = None,
    creative_type: Optional[CreativeType] = None,
    content_type: Optional[ContentType] = None,
    days_back: Optional[int] = Query(default=7, ge=1, le=90),
    limit: Optional[int] = Query(default=50, ge=1, le=200),
    offset: Optional[int] = Query(default=0, ge=0),
    sort_by: Optional[str] = Query(default="published_at", regex="^(published_at|engagement_rate|views|buzz_score)$"),
    sort_order: Optional[str] = Query(default="desc", regex="^(asc|desc)$"),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Get creatives with filtering and sorting
    Unified timeline for all platforms (Instagram, YouTube, TikTok)
    """
    try:
        # Build query for user's accounts
        query = select(Creative).options(
            selectinload(Creative.account),
            selectinload(Creative.metrics),
            selectinload(Creative.labels)
        )
        
        # Join with user's accounts
        query = query.join(Account).where(Account.user_id == current_user.id)
        
        # Apply filters
        filters = []
        
        if platform:
            filters.append(Account.platform == platform)
            
        if creative_type:
            filters.append(Creative.creative_type == creative_type)
            
        if content_type:
            filters.append(Creative.content_type == content_type)
            
        # Date filter
        if days_back:
            cutoff_date = datetime.now(timezone.utc) - timedelta(days=days_back)
            filters.append(Creative.published_at >= cutoff_date)
        
        if filters:
            query = query.where(and_(*filters))
        
        # Apply sorting
        if sort_by == "published_at":
            sort_column = Creative.published_at
        elif sort_by == "engagement_rate":
            # Join with latest metric for sorting
            query = query.outerjoin(Metric).order_by(
                desc(Metric.engagement_rate) if sort_order == "desc" else Metric.engagement_rate
            )
        elif sort_by == "views":
            query = query.outerjoin(Metric).order_by(
                desc(Metric.views) if sort_order == "desc" else Metric.views
            )
        elif sort_by == "buzz_score":
            query = query.outerjoin(Metric).order_by(
                desc(Metric.buzz_score) if sort_order == "desc" else Metric.buzz_score
            )
        
        if sort_by == "published_at":
            if sort_order == "desc":
                query = query.order_by(desc(sort_column))
            else:
                query = query.order_by(sort_column)
        
        # Apply pagination
        query = query.offset(offset).limit(limit)
        
        result = await db.execute(query)
        creatives = result.unique().scalars().all()
        
        # Get total count for pagination
        count_query = select(Creative).join(Account).where(Account.user_id == current_user.id)
        if filters:
            count_query = count_query.where(and_(*filters))
        
        total_result = await db.execute(count_query)
        total_count = len(total_result.scalars().all())
        
        # Convert to response format
        creative_responses = []
        for creative in creatives:
            creative_data = CreativeResponse.from_orm(creative)
            
            # Add latest metrics
            if creative.metrics:
                latest_metric = max(creative.metrics, key=lambda m: m.measured_at)
                creative_data.latest_metrics = {
                    "views": latest_metric.views,
                    "likes": latest_metric.likes,
                    "comments": latest_metric.comments,
                    "shares": latest_metric.shares,
                    "engagement_rate": latest_metric.engagement_rate,
                    "buzz_score": latest_metric.buzz_score
                }
            
            # Add AI labels
            if creative.labels:
                creative_data.ai_labels = {
                    label.label_type.value: {
                        "value": label.label_value,
                        "confidence": label.confidence_score
                    }
                    for label in creative.labels
                }
            
            creative_responses.append(creative_data)
        
        return CreativeListResponse(
            creatives=creative_responses,
            total_count=total_count,
            offset=offset,
            limit=limit,
            has_more=offset + limit < total_count
        )
        
    except Exception as e:
        logger.error(f"Error getting creatives: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Error retrieving creatives"
        )

@router.get("/{creative_id}", response_model=CreativeResponse)
async def get_creative(
    creative_id: int,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Get a specific creative with full details"""
    try:
        query = select(Creative).options(
            selectinload(Creative.account),
            selectinload(Creative.metrics),
            selectinload(Creative.labels)
        ).join(Account).where(
            and_(
                Creative.id == creative_id,
                Account.user_id == current_user.id
            )
        )
        
        result = await db.execute(query)
        creative = result.scalar_one_or_none()
        
        if not creative:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Creative not found"
            )
        
        return CreativeResponse.from_orm(creative)
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error getting creative {creative_id}: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Error retrieving creative"
        )

@router.post("/{creative_id}/analyze", response_model=BuzzAnalysisResponse)
async def analyze_creative_buzz_factors(
    creative_id: int,
    current_user: User = Depends(require_growth_plan),  # Growth+ feature
    db: AsyncSession = Depends(get_db)
):
    """
    Analyze creative for buzz factors using AI
    Growth+ feature: AI buzz factor analysis
    """
    try:
        # Get creative
        query = select(Creative).options(
            selectinload(Creative.account)
        ).join(Account).where(
            and_(
                Creative.id == creative_id,
                Account.user_id == current_user.id
            )
        )
        
        result = await db.execute(query)
        creative = result.scalar_one_or_none()
        
        if not creative:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Creative not found"
            )
        
        # Check if user has reached monthly limit
        if not current_user.can_analyze_creatives(0):  # TODO: Get actual monthly count
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Monthly analysis limit reached. Upgrade to Enterprise for unlimited analysis."
            )
        
        # Run AI analysis
        analysis_result = await content_analyzer.analyze_buzz_factors(
            creative, 
            creative.thumbnail_url
        )
        
        # Calculate hit probability
        hit_probability = await content_analyzer.calculate_hit_probability(
            creative, 
            analysis_result
        )
        
        # Save analysis results
        creative_analytic = CreativeAnalytic(
            user_id=current_user.id,
            creative_id=creative.id,
            hit_probability_score=hit_probability,
            buzz_factor_score=analysis_result.get("overall_score", 50),
            viral_potential="high" if hit_probability > 70 else "medium" if hit_probability > 40 else "low",
            success_factors=", ".join(analysis_result.get("top_factors", [])),
            analysis_version="1.0"
        )
        
        db.add(creative_analytic)
        
        # Save individual labels
        for label_type, label_data in analysis_result.items():
            if label_type in ["hook", "cta", "genre", "emotion", "color_tone"]:
                label = Label(
                    creative_id=creative.id,
                    label_type=getattr(LabelType, label_type.upper()),
                    label_value=label_data.get("type", "unknown"),
                    confidence_score=label_data.get("score", 5) / 10.0,  # Convert to 0-1
                    ai_model_used=content_analyzer.model,
                    processing_version="1.0",
                    description=label_data.get("description", "")
                )
                db.add(label)
        
        await db.commit()
        
        response = BuzzAnalysisResponse(
            creative_id=creative.id,
            hit_probability_score=hit_probability,
            viral_potential=creative_analytic.viral_potential,
            analysis_details=analysis_result,
            success_factors=analysis_result.get("top_factors", []),
            analyzed_at=datetime.now(timezone.utc)
        )
        
        metrics.record_ai_processing_time("buzz_analysis_complete", 1.0)
        return response
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error analyzing creative {creative_id}: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Error analyzing creative"
        )

@router.get("/trending/genres")
async def get_trending_genres(
    platform: Optional[Platform] = None,
    days_back: int = Query(default=7, ge=1, le=30),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Get trending content genres based on recent performance
    Similar to kataseru's genre tracking
    """
    try:
        # Query for high-performing content in recent days
        cutoff_date = datetime.now(timezone.utc) - timedelta(days=days_back)
        
        query = select(Label.label_value, Creative.id).join(Creative).join(Account).where(
            and_(
                Account.user_id == current_user.id,
                Label.label_type == LabelType.GENRE,
                Creative.published_at >= cutoff_date
            )
        )
        
        if platform:
            query = query.where(Account.platform == platform)
        
        # Add performance filtering (high engagement rate)
        query = query.join(Metric).where(Metric.engagement_rate > 3.0)
        
        result = await db.execute(query)
        genre_data = result.all()
        
        # Count genre occurrences
        genre_counts = {}
        for genre, creative_id in genre_data:
            genre_counts[genre] = genre_counts.get(genre, 0) + 1
        
        # Sort by frequency
        trending_genres = [
            {"genre": genre, "count": count, "trending_score": count * 10}
            for genre, count in sorted(genre_counts.items(), key=lambda x: x[1], reverse=True)
        ]
        
        return {
            "trending_genres": trending_genres[:10],  # Top 10
            "period_days": days_back,
            "total_high_performing_content": len(genre_data)
        }
        
    except Exception as e:
        logger.error(f"Error getting trending genres: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Error retrieving trending genres"
        )

@router.get("/stats/buzz-timeline")
async def get_buzz_timeline(
    platform: Optional[Platform] = None,
    days_back: int = Query(default=30, ge=7, le=90),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Get buzz timeline showing organic vs paid performance over time
    Key differentiator: Unified timeline view
    """
    try:
        cutoff_date = datetime.now(timezone.utc) - timedelta(days=days_back)
        
        # Query for all creatives with metrics
        query = select(Creative, Metric).join(Metric).join(Account).where(
            and_(
                Account.user_id == current_user.id,
                Creative.published_at >= cutoff_date
            )
        ).order_by(Creative.published_at)
        
        if platform:
            query = query.where(Account.platform == platform)
        
        result = await db.execute(query)
        timeline_data = result.all()
        
        # Group by date and type
        daily_stats = {}
        for creative, metric in timeline_data:
            date_key = creative.published_at.date().isoformat()
            
            if date_key not in daily_stats:
                daily_stats[date_key] = {
                    "organic": {"count": 0, "total_views": 0, "total_engagement": 0},
                    "paid": {"count": 0, "total_impressions": 0, "total_engagement": 0}
                }
            
            content_type = "organic" if creative.is_organic else "paid"
            daily_stats[date_key][content_type]["count"] += 1
            
            if creative.is_organic:
                daily_stats[date_key][content_type]["total_views"] += metric.views
                daily_stats[date_key][content_type]["total_engagement"] += metric.total_engagement
            else:
                daily_stats[date_key][content_type]["total_impressions"] += creative.get_estimated_impressions()
                daily_stats[date_key][content_type]["total_engagement"] += metric.total_engagement
        
        # Convert to timeline format
        timeline = []
        for date_str, stats in sorted(daily_stats.items()):
            timeline.append({
                "date": date_str,
                "organic": {
                    "count": stats["organic"]["count"],
                    "views": stats["organic"]["total_views"],
                    "engagement": stats["organic"]["total_engagement"],
                    "avg_engagement_rate": (
                        stats["organic"]["total_engagement"] / max(stats["organic"]["total_views"], 1) * 100
                    )
                },
                "paid": {
                    "count": stats["paid"]["count"],
                    "impressions": stats["paid"]["total_impressions"],
                    "engagement": stats["paid"]["total_engagement"],
                    "avg_engagement_rate": (
                        stats["paid"]["total_engagement"] / max(stats["paid"]["total_impressions"], 1) * 100
                    )
                }
            })
        
        return {
            "timeline": timeline,
            "period_days": days_back,
            "summary": {
                "total_organic": sum(day["organic"]["count"] for day in timeline),
                "total_paid": sum(day["paid"]["count"] for day in timeline),
                "avg_organic_engagement_rate": sum(day["organic"]["avg_engagement_rate"] for day in timeline) / max(len(timeline), 1),
                "avg_paid_engagement_rate": sum(day["paid"]["avg_engagement_rate"] for day in timeline) / max(len(timeline), 1)
            }
        }
        
    except Exception as e:
        logger.error(f"Error getting buzz timeline: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Error retrieving buzz timeline"
        ) 