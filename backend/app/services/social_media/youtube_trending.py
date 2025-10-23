"""
YouTube Trending Videos Service - Similar to 2nd-buzz.com
Analyzes trending videos, generates scripts, and provides insights
"""

import httpx
import asyncio
from typing import List, Dict, Optional, Any
from datetime import datetime, timedelta, timezone
from loguru import logger
from collections import defaultdict

from app.core.config import get_settings
from app.core.monitoring import metrics

settings = get_settings()


class YouTubeTrendingAnalyzer:
    """YouTube trending video analyzer and script generator"""
    
    def __init__(self):
        self.api_base = "https://www.googleapis.com/youtube/v3"
        self.api_key = settings.YOUTUBE_API_KEY
        
    async def get_trending_videos(
        self, 
        region_code: str = "US",
        category_id: Optional[str] = None,
        max_results: int = 50
    ) -> List[Dict[str, Any]]:
        """
        Get trending videos from YouTube
        
        Args:
            region_code: Country code (e.g., 'US', 'JP', 'KR')
            category_id: YouTube category ID (optional)
            max_results: Number of videos to fetch
            
        Returns:
            List of trending video data with analytics
        """
        try:
            url = f"{self.api_base}/videos"
            params = {
                "part": "snippet,contentDetails,statistics",
                "chart": "mostPopular",
                "regionCode": region_code,
                "maxResults": min(max_results, 50),
                "key": self.api_key
            }
            
            if category_id:
                params["videoCategoryId"] = category_id
            
            async with httpx.AsyncClient() as client:
                response = await client.get(url, params=params, timeout=30.0)
                metrics.record_api_call("youtube", "trending")
                
                if response.status_code != 200:
                    logger.error(f"YouTube API error: {response.status_code} - {response.text}")
                    return []
                
                data = response.json()
                videos = []
                
                for item in data.get("items", []):
                    video_data = self._normalize_trending_video(item)
                    if video_data:
                        videos.append(video_data)
                
                logger.info(f"Fetched {len(videos)} trending videos for region {region_code}")
                return videos
                
        except Exception as e:
            logger.error(f"Error fetching trending videos: {str(e)}")
            return []
    
    async def search_videos_by_keyword(
        self,
        keyword: str,
        published_after: Optional[datetime] = None,
        max_results: int = 50,
        order: str = "relevance"
    ) -> List[Dict[str, Any]]:
        """
        Search for videos by keyword (like 2nd-buzz.com search feature)
        
        Args:
            keyword: Search query
            published_after: Only return videos published after this date
            max_results: Number of results
            order: Sort order (relevance, date, viewCount, rating)
            
        Returns:
            List of video data matching the search
        """
        try:
            url = f"{self.api_base}/search"
            params = {
                "part": "snippet",
                "q": keyword,
                "type": "video",
                "maxResults": min(max_results, 50),
                "order": order,
                "key": self.api_key
            }
            
            if published_after:
                params["publishedAfter"] = published_after.isoformat() + "Z"
            
            async with httpx.AsyncClient() as client:
                response = await client.get(url, params=params, timeout=30.0)
                metrics.record_api_call("youtube", "search")
                
                if response.status_code != 200:
                    logger.error(f"YouTube API error: {response.status_code} - {response.text}")
                    return []
                
                data = response.json()
                video_ids = [item["id"]["videoId"] for item in data.get("items", [])]
                
                # Get full details for these videos
                if video_ids:
                    videos = await self._get_videos_details(video_ids)
                    logger.info(f"Found {len(videos)} videos for keyword: {keyword}")
                    return videos
                
                return []
                
        except Exception as e:
            logger.error(f"Error searching videos: {str(e)}")
            return []
    
    async def detect_viral_potential(
        self,
        video_data: Dict[str, Any],
        time_window_hours: int = 24
    ) -> Dict[str, Any]:
        """
        Analyze video's viral potential based on growth metrics
        
        Args:
            video_data: Video data with statistics
            time_window_hours: Time window to analyze growth
            
        Returns:
            Viral potential analysis
        """
        try:
            stats = video_data.get("statistics", {})
            snippet = video_data.get("snippet", {})
            
            views = int(stats.get("viewCount", 0))
            likes = int(stats.get("likeCount", 0))
            comments = int(stats.get("commentCount", 0))
            
            # Calculate engagement rate
            engagement_rate = 0
            if views > 0:
                engagement_rate = ((likes + comments) / views) * 100
            
            # Parse published date
            published_at_str = snippet.get("publishedAt", "")
            published_at = datetime.fromisoformat(published_at_str.replace("Z", "+00:00"))
            
            # Calculate time since publication
            hours_since_published = (datetime.now(timezone.utc) - published_at).total_seconds() / 3600
            
            # Calculate views per hour
            views_per_hour = views / hours_since_published if hours_since_published > 0 else 0
            
            # Viral potential score (0-100)
            viral_score = self._calculate_viral_score(
                views_per_hour=views_per_hour,
                engagement_rate=engagement_rate,
                hours_since_published=hours_since_published
            )
            
            return {
                "viral_score": round(viral_score, 2),
                "engagement_rate": round(engagement_rate, 2),
                "views_per_hour": round(views_per_hour, 2),
                "hours_since_published": round(hours_since_published, 2),
                "status": self._get_viral_status(viral_score),
                "prediction": self._get_viral_prediction(viral_score, views_per_hour)
            }
            
        except Exception as e:
            logger.error(f"Error detecting viral potential: {str(e)}")
            return {
                "viral_score": 0,
                "engagement_rate": 0,
                "views_per_hour": 0,
                "status": "unknown",
                "prediction": "Unable to calculate"
            }
    
    async def get_video_transcript(self, video_id: str) -> Optional[str]:
        """
        Get video transcript/captions (requires youtube-transcript-api)
        Note: This is a placeholder - implement with youtube-transcript-api if needed
        """
        # For now, return the description as a fallback
        try:
            video_data = await self._get_videos_details([video_id])
            if video_data:
                return video_data[0].get("snippet", {}).get("description", "")
        except Exception as e:
            logger.error(f"Error getting transcript: {str(e)}")
        
        return None
    
    async def analyze_trending_patterns(
        self,
        videos: List[Dict[str, Any]]
    ) -> Dict[str, Any]:
        """
        Analyze patterns in trending videos
        
        Returns:
            Analysis of common patterns, tags, categories
        """
        try:
            # Category distribution
            category_counts = defaultdict(int)
            
            # Tag frequency
            tag_counts = defaultdict(int)
            
            # Duration distribution
            duration_buckets = {"short": 0, "medium": 0, "long": 0}
            
            # Engagement metrics
            total_views = 0
            total_likes = 0
            total_comments = 0
            
            for video in videos:
                # Categories
                category_id = video.get("snippet", {}).get("categoryId", "unknown")
                category_counts[category_id] += 1
                
                # Tags
                tags = video.get("snippet", {}).get("tags", [])
                for tag in tags[:10]:  # Limit to top 10 tags per video
                    tag_counts[tag.lower()] += 1
                
                # Duration
                duration_seconds = self._parse_duration(video.get("contentDetails", {}).get("duration", ""))
                if duration_seconds < 180:  # < 3 minutes
                    duration_buckets["short"] += 1
                elif duration_seconds < 600:  # < 10 minutes
                    duration_buckets["medium"] += 1
                else:
                    duration_buckets["long"] += 1
                
                # Metrics
                stats = video.get("statistics", {})
                total_views += int(stats.get("viewCount", 0))
                total_likes += int(stats.get("likeCount", 0))
                total_comments += int(stats.get("commentCount", 0))
            
            # Get top categories
            top_categories = sorted(category_counts.items(), key=lambda x: x[1], reverse=True)[:5]
            
            # Get top tags
            top_tags = sorted(tag_counts.items(), key=lambda x: x[1], reverse=True)[:20]
            
            return {
                "total_videos_analyzed": len(videos),
                "top_categories": [{"id": cat, "count": count} for cat, count in top_categories],
                "top_tags": [{"tag": tag, "count": count} for tag, count in top_tags],
                "duration_distribution": duration_buckets,
                "average_metrics": {
                    "views": round(total_views / len(videos)) if videos else 0,
                    "likes": round(total_likes / len(videos)) if videos else 0,
                    "comments": round(total_comments / len(videos)) if videos else 0,
                    "engagement_rate": round((total_likes + total_comments) / total_views * 100, 2) if total_views > 0 else 0
                }
            }
            
        except Exception as e:
            logger.error(f"Error analyzing trending patterns: {str(e)}")
            return {}
    
    async def _get_videos_details(self, video_ids: List[str]) -> List[Dict[str, Any]]:
        """Get detailed information for multiple videos"""
        try:
            videos_data = []
            
            # Process in chunks of 50 (API limit)
            chunk_size = 50
            for i in range(0, len(video_ids), chunk_size):
                chunk = video_ids[i:i + chunk_size]
                
                url = f"{self.api_base}/videos"
                params = {
                    "part": "snippet,contentDetails,statistics",
                    "id": ",".join(chunk),
                    "key": self.api_key
                }
                
                async with httpx.AsyncClient() as client:
                    response = await client.get(url, params=params, timeout=30.0)
                    
                    if response.status_code == 200:
                        data = response.json()
                        for item in data.get("items", []):
                            video_data = self._normalize_trending_video(item)
                            if video_data:
                                videos_data.append(video_data)
            
            return videos_data
            
        except Exception as e:
            logger.error(f"Error getting video details: {str(e)}")
            return []
    
    def _normalize_trending_video(self, raw_data: Dict[str, Any]) -> Optional[Dict[str, Any]]:
        """Normalize YouTube video data"""
        try:
            snippet = raw_data.get("snippet", {})
            statistics = raw_data.get("statistics", {})
            content_details = raw_data.get("contentDetails", {})
            
            video_id = raw_data["id"]
            
            # Parse published date
            published_at_str = snippet.get("publishedAt", "")
            published_at = None
            if published_at_str:
                published_at = datetime.fromisoformat(published_at_str.replace("Z", "+00:00"))
            
            # Parse duration
            duration_str = content_details.get("duration", "PT0S")
            duration_seconds = self._parse_duration(duration_str)
            
            return {
                "video_id": video_id,
                "url": f"https://www.youtube.com/watch?v={video_id}",
                "title": snippet.get("title", ""),
                "description": snippet.get("description", ""),
                "channel_id": snippet.get("channelId", ""),
                "channel_title": snippet.get("channelTitle", ""),
                "published_at": published_at.isoformat() if published_at else None,
                "thumbnail_url": snippet.get("thumbnails", {}).get("high", {}).get("url"),
                "duration_seconds": duration_seconds,
                "duration_formatted": self._format_duration(duration_seconds),
                "statistics": {
                    "views": int(statistics.get("viewCount", 0)),
                    "likes": int(statistics.get("likeCount", 0)),
                    "comments": int(statistics.get("commentCount", 0)),
                },
                "tags": snippet.get("tags", []),
                "category_id": snippet.get("categoryId", ""),
                "snippet": snippet,
                "contentDetails": content_details
            }
            
        except Exception as e:
            logger.error(f"Error normalizing video data: {str(e)}")
            return None
    
    def _parse_duration(self, duration: str) -> int:
        """Parse ISO 8601 duration to seconds"""
        try:
            import re
            match = re.match(r'PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?', duration)
            if match:
                hours = int(match.group(1) or 0)
                minutes = int(match.group(2) or 0)
                seconds = int(match.group(3) or 0)
                return hours * 3600 + minutes * 60 + seconds
        except Exception:
            pass
        return 0
    
    def _format_duration(self, seconds: int) -> str:
        """Format seconds to HH:MM:SS or MM:SS"""
        hours = seconds // 3600
        minutes = (seconds % 3600) // 60
        secs = seconds % 60
        
        if hours > 0:
            return f"{hours}:{minutes:02d}:{secs:02d}"
        return f"{minutes}:{secs:02d}"
    
    def _calculate_viral_score(
        self,
        views_per_hour: float,
        engagement_rate: float,
        hours_since_published: float
    ) -> float:
        """Calculate viral potential score (0-100)"""
        # Base score from views per hour
        vph_score = min(40, views_per_hour / 100)  # Max 40 points
        
        # Engagement score
        engagement_score = min(30, engagement_rate * 3)  # Max 30 points
        
        # Recency bonus (newer videos get higher scores)
        recency_score = 0
        if hours_since_published < 24:
            recency_score = 30 * (1 - hours_since_published / 24)  # Max 30 points
        elif hours_since_published < 72:
            recency_score = 15 * (1 - (hours_since_published - 24) / 48)  # Max 15 points
        
        total_score = vph_score + engagement_score + recency_score
        return min(100, max(0, total_score))
    
    def _get_viral_status(self, viral_score: float) -> str:
        """Get viral status based on score"""
        if viral_score >= 80:
            return "🔥 Viral"
        elif viral_score >= 60:
            return "📈 Trending"
        elif viral_score >= 40:
            return "⚡ Growing"
        elif viral_score >= 20:
            return "📊 Steady"
        else:
            return "🐌 Slow"
    
    def _get_viral_prediction(self, viral_score: float, views_per_hour: float) -> str:
        """Get viral prediction message"""
        if viral_score >= 80:
            return f"This video is going viral! {int(views_per_hour * 24):,} estimated views in 24h"
        elif viral_score >= 60:
            return f"Strong trending momentum. {int(views_per_hour * 24):,} estimated views in 24h"
        elif viral_score >= 40:
            return "Good growth potential. Monitor closely."
        else:
            return "Normal growth pattern."


# Singleton instance
youtube_trending = YouTubeTrendingAnalyzer()



