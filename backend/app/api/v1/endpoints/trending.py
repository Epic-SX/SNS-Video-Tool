"""
API endpoints for trending videos - Similar to 2nd-buzz.com
"""

from fastapi import APIRouter, Depends, Query, HTTPException
from typing import List, Optional
from datetime import datetime, timedelta
from pydantic import BaseModel, Field

from app.services.social_media.youtube_trending import youtube_trending
from app.services.ai.content_analyzer import content_analyzer
from loguru import logger

router = APIRouter()


# Response Models
class VideoStatistics(BaseModel):
    views: int
    likes: int
    comments: int


class TrendingVideoResponse(BaseModel):
    video_id: str
    url: str
    title: str
    description: str
    channel_id: str
    channel_title: str
    published_at: Optional[str]
    thumbnail_url: Optional[str]
    duration_seconds: int
    duration_formatted: str
    statistics: VideoStatistics
    tags: List[str]
    category_id: str


class ViralPotentialResponse(BaseModel):
    viral_score: float
    engagement_rate: float
    views_per_hour: float
    hours_since_published: float
    status: str
    prediction: str


class TrendingAnalysisResponse(BaseModel):
    total_videos_analyzed: int
    top_categories: List[dict]
    top_tags: List[dict]
    duration_distribution: dict
    average_metrics: dict


# Endpoints
@router.get("/videos", response_model=List[TrendingVideoResponse])
async def get_trending_videos(
    region: str = Query(default="US", description="Region code (e.g., US, JP, KR)"),
    category: Optional[str] = Query(default=None, description="YouTube category ID"),
    max_results: int = Query(default=50, ge=1, le=50, description="Number of videos to fetch")
):
    """
    Get currently trending videos from YouTube
    
    Similar to 2nd-buzz.com trending video detection feature
    """
    try:
        # Handle "all" category as no category filter
        category_id = None if category == "all" else category
        
        videos = await youtube_trending.get_trending_videos(
            region_code=region,
            category_id=category_id,
            max_results=max_results
        )
        
        return videos
        
    except Exception as e:
        logger.error(f"Error fetching trending videos: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error fetching trending videos: {str(e)}")


@router.get("/search", response_model=List[TrendingVideoResponse])
async def search_videos(
    keyword: str = Query(..., description="Search keyword or phrase"),
    published_after_hours: Optional[int] = Query(
        default=None,
        description="Only show videos published within last N hours"
    ),
    max_results: int = Query(default=50, ge=1, le=50),
    order: str = Query(
        default="relevance",
        description="Sort order: relevance, date, viewCount, rating"
    )
):
    """
    Search for videos by keyword
    
    Similar to 2nd-buzz.com keyword search feature
    """
    try:
        published_after = None
        if published_after_hours:
            published_after = datetime.now() - timedelta(hours=published_after_hours)
        
        videos = await youtube_trending.search_videos_by_keyword(
            keyword=keyword,
            published_after=published_after,
            max_results=max_results,
            order=order
        )
        
        return videos
        
    except Exception as e:
        logger.error(f"Error searching videos: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error searching videos: {str(e)}")


@router.get("/video/{video_id}/viral-potential", response_model=ViralPotentialResponse)
async def analyze_viral_potential(
    video_id: str,
    time_window_hours: int = Query(default=24, ge=1, le=168, description="Time window for analysis")
):
    """
    Analyze a video's viral potential
    
    Returns viral score, engagement metrics, and predictions
    """
    try:
        # First, get video details
        videos = await youtube_trending._get_videos_details([video_id])
        
        if not videos:
            raise HTTPException(status_code=404, detail="Video not found")
        
        video_data = videos[0]
        
        # Analyze viral potential
        analysis = await youtube_trending.detect_viral_potential(
            video_data=video_data,
            time_window_hours=time_window_hours
        )
        
        return analysis
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error analyzing viral potential: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error analyzing viral potential: {str(e)}")


@router.post("/analyze-trending-patterns", response_model=TrendingAnalysisResponse)
async def analyze_trending_patterns(
    video_ids: List[str] = None,
    region: str = Query(default="US"),
    fetch_latest: bool = Query(default=True, description="Fetch latest trending if no video_ids provided")
):
    """
    Analyze patterns in trending videos
    
    Identifies common themes, tags, categories, and engagement patterns
    """
    try:
        videos = []
        
        if video_ids:
            # Analyze specific videos
            videos = await youtube_trending._get_videos_details(video_ids)
        elif fetch_latest:
            # Fetch and analyze latest trending videos
            videos = await youtube_trending.get_trending_videos(
                region_code=region,
                max_results=50
            )
        
        if not videos:
            raise HTTPException(status_code=400, detail="No videos to analyze")
        
        # Analyze patterns
        analysis = await youtube_trending.analyze_trending_patterns(videos)
        
        return analysis
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error analyzing patterns: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error analyzing patterns: {str(e)}")


@router.get("/categories")
async def get_video_categories():
    """
    Get YouTube video categories
    
    Returns common YouTube video category IDs and names
    """
    categories = {
        "1": "Film & Animation",
        "2": "Autos & Vehicles",
        "10": "Music",
        "15": "Pets & Animals",
        "17": "Sports",
        "19": "Travel & Events",
        "20": "Gaming",
        "22": "People & Blogs",
        "23": "Comedy",
        "24": "Entertainment",
        "25": "News & Politics",
        "26": "Howto & Style",
        "27": "Education",
        "28": "Science & Technology",
        "29": "Nonprofits & Activism"
    }
    
    return {
        "categories": [
            {"id": cat_id, "name": name}
            for cat_id, name in categories.items()
        ]
    }


@router.get("/regions")
async def get_supported_regions():
    """
    Get supported region codes for trending videos
    """
    regions = [
        {"code": "US", "name": "United States"},
        {"code": "GB", "name": "United Kingdom"},
        {"code": "CA", "name": "Canada"},
        {"code": "AU", "name": "Australia"},
        {"code": "JP", "name": "Japan"},
        {"code": "KR", "name": "South Korea"},
        {"code": "IN", "name": "India"},
        {"code": "BR", "name": "Brazil"},
        {"code": "MX", "name": "Mexico"},
        {"code": "DE", "name": "Germany"},
        {"code": "FR", "name": "France"},
        {"code": "IT", "name": "Italy"},
        {"code": "ES", "name": "Spain"},
        {"code": "NL", "name": "Netherlands"},
        {"code": "PL", "name": "Poland"},
        {"code": "RU", "name": "Russia"},
        {"code": "TR", "name": "Turkey"},
        {"code": "SA", "name": "Saudi Arabia"},
        {"code": "AE", "name": "United Arab Emirates"},
        {"code": "SG", "name": "Singapore"},
        {"code": "TH", "name": "Thailand"},
        {"code": "VN", "name": "Vietnam"},
        {"code": "PH", "name": "Philippines"},
        {"code": "ID", "name": "Indonesia"},
        {"code": "MY", "name": "Malaysia"}
    ]
    
    return {"regions": regions}



